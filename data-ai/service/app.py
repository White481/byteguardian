"""ByteGuardian AI service (Data/AI team).

Endpoints the web app calls (see src/server/ai-client.ts):
  POST /insights  ← AI_API_URL   assessment → summary, findings, recommendations, action plan, recommended plan
  POST /chat      ← AI_CHAT_URL  chat messages → { reply }
  GET  /health

How the answers are produced:
  - Recommendations and action plan: rules + data-ai/service/knowledge.py (always on, predictable).
  - Recommended plan: ML model trained on data/synthetic/companies.csv at start-up.
  - Summary, key findings and chat: Google Gemini, see llm.py (LLM_PROVIDER,
    GEMINI_API_KEY …). Without a key, simple templates so the service still works offline.

Run:
  pip install -r data-ai/requirements.txt
  uvicorn app:app --app-dir data-ai/service --port 8000
"""
from __future__ import annotations

import hmac
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, HTTPException

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))  # data-ai/ → scoring.py

import scoring  # noqa: E402
from knowledge import KNOWLEDGE  # noqa: E402
from llm import ENABLED as LLM_ENABLED, MODEL as LLM_MODEL, PROVIDER as LLM_PROVIDER, ask_llm  # noqa: E402
from plan_model import PlanModel  # noqa: E402

log = logging.getLogger("byteguardian-ai")
logging.basicConfig(level=logging.INFO)

API_KEY = os.environ.get("AI_API_KEY", "")
# On a public host the service must not be open to anyone (each call can spend Gemini quota).
# Railway sets RAILWAY_ENVIRONMENT; set REQUIRE_AI_API_KEY=1 on any other host.
REQUIRE_KEY = bool(os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("REQUIRE_AI_API_KEY"))
if REQUIRE_KEY and not API_KEY:
    log.warning("AI_API_KEY is not set: /insights and /chat will refuse every request until it is.")

app = FastAPI(title="ByteGuardian AI service", version="0.1.0")
plan_model = PlanModel.train()

PRIORITY = {"critical": "high", "high": "high", "medium": "medium", "low": "low"}
PHASE = {"high": "0-3 months", "medium": "4-6 months", "low": "7-12 months"}


# ---------------------------------------------------------------- helpers

def check_auth(authorization: str | None) -> None:
    if not API_KEY:
        if REQUIRE_KEY:
            raise HTTPException(status_code=503, detail="AI_API_KEY is not configured on this server")
        return  # local development: no key needed
    if not hmac.compare_digest(authorization or "", f"Bearer {API_KEY}"):
        raise HTTPException(status_code=401, detail="Invalid API key")


def parse_json(text: str | None) -> dict | None:
    if not text:
        return None
    start, end = text.find("{"), text.rfind("}")
    try:
        return json.loads(text[start : end + 1]) if start >= 0 else None
    except json.JSONDecodeError:
        return None


# ---------------------------------------------------------------- endpoints

@app.get("/health")
def health() -> dict:
    return {"ok": True, "llm": LLM_ENABLED, "provider": LLM_PROVIDER, "model": LLM_MODEL if LLM_ENABLED else None,
            "planModelAccuracy": plan_model.test_accuracy}


@app.post("/insights")
def insights(payload: dict[str, Any], authorization: str | None = Header(default=None)) -> dict:
    check_auth(authorization)
    company = payload.get("company") or {}
    answers = {a["questionId"]: a["value"] for a in payload.get("answers", []) if a.get("questionId")}
    scores = payload.get("scores") or {}
    target = float(scores.get("targetTier") or scoring.target_tier(
        company.get("industry") or "Other", company.get("companySize") or "Medium (51–250)"))
    current = scores.get("currentTier")
    risk_level = scores.get("riskLevel") or "medium"

    found = [i for i in scoring.issues(answers, target) if i["question"]["id"] in KNOWLEDGE]
    strong = [q for q in scoring.QUESTIONS if answers.get(q["id"]) == "yes"]

    recommendations, action_plan = [], []
    for i in found:
        k = KNOWLEDGE[i["question"]["id"]]
        prio = PRIORITY[i["level"]]
        extra = " (partly in place — finish the rollout)" if i["value"] == "partially" else ""
        recommendations.append({"title": k["title"], "detail": k["detail"] + extra, "priority": prio})
        action_plan.append({"title": k["title"], "priority": prio, "responsibleTeam": k["team"],
                            "estimatedCost": k["cost"], "phase": PHASE[prio]})

    key_findings = [
        {"title": KNOWLEDGE[i["question"]["id"]]["finding"],
         "detail": f'{i["question"]["categoryName"]} ({i["question"]["id"]}) was answered "{i["value"]}". '
                   f'Issue level: {i["level"]}.',
         "priority": PRIORITY[i["level"]]}
        for i in found[:5]
    ]
    weaknesses = [KNOWLEDGE[i["question"]["id"]]["finding"] for i in found]
    improvements = [f'Keep {q["categoryName"].lower()} in place ({q["id"]}) and review it yearly' for q in strong][:5]

    plan = plan_model.predict(company, answers)
    plan["reason"] = (f'{company.get("companySize") or "Unknown size"}, {company.get("industry") or "unknown industry"}, '
                      f'{risk_level} risk, {len(found)} open issues')

    summary = (f"Current maturity is tier {current if current is not None else 'unknown'} against a target of {target:.0f}, with {risk_level} risk. "
               f"{len(found)} of {len(answers)} areas need work"
               + (f', starting with: {", ".join(KNOWLEDGE[i["question"]["id"]]["title"].lower() for i in found[:2])}.'
                  if found else ". No open issues — keep controls reviewed."))

    # Optional: let the LLM write a clearer summary and findings from the same facts.
    llm = parse_json(ask_llm(
        system=("You are a cybersecurity consultant writing for a company's management. Use only the facts given. "
                "Reply with JSON only: {\"summary\": string (2-3 sentences), \"keyFindings\": "
                "[{\"title\": string, \"detail\": string, \"priority\": \"high\"|\"medium\"|\"low\"}] (max 5)}."),
        messages=[{"role": "user", "content": json.dumps({
            "company": company, "scores": scores, "issues": key_findings,
            "strengths": [q["categoryName"] for q in strong]}, ensure_ascii=False)}],
        json_mode=True,
    ))
    if llm and isinstance(llm.get("summary"), str):
        summary = llm["summary"]
        kf = [f for f in llm.get("keyFindings", []) if isinstance(f, dict)
              and {"title", "detail", "priority"} <= f.keys() and f["priority"] in ("high", "medium", "low")]
        key_findings = kf or key_findings

    return {
        "summary": summary,
        "keyFindings": key_findings,
        "recommendations": recommendations,
        "weaknesses": weaknesses,
        "improvements": improvements,
        "actionPlan": action_plan,
        "recommendedPlan": plan,
    }


@app.post("/chat")
def chat(payload: dict[str, Any], authorization: str | None = Header(default=None)) -> dict:
    check_auth(authorization)
    messages = [m for m in payload.get("messages", []) if m.get("role") in ("user", "assistant") and m.get("content")]
    if not messages or messages[-1]["role"] != "user":
        raise HTTPException(status_code=422, detail="Last message must be from the user")
    context = {"company": payload.get("company"), "latestAssessment": payload.get("context")}

    reply = ask_llm(
        system=("You are ByteGuardian's cybersecurity assistant for small and medium companies. "
                "Answer briefly and practically, in the same language as the user (Thai or English). "
                "Base answers about the company on this data and say so if something is not in it:\n"
                + json.dumps(context, ensure_ascii=False)),
        messages=[{"role": m["role"], "content": m["content"]} for m in messages[-20:]],
    )
    return {"reply": reply or template_reply(messages[-1]["content"], payload.get("context") or {})}


def template_reply(question: str, ctx: dict) -> str:
    """Offline fallback when no LLM is configured (or the LLM call failed)."""
    q = question.lower()
    s = ctx.get("summary") or {}
    if not s:
        return "Complete an assessment first, then I can explain your tier, risks and what to fix first."
    if any(w in q for w in ("plan", "price", "package", "แพ็กเกจ", "ราคา")):
        return f'The suggested plan is {s.get("recommendedPlan", "not set yet")}, based on your company size, industry and risk level.'
    if any(w in q for w in ("risk", "ความเสี่ยง")):
        tops = ", ".join(r["title"] for r in ctx.get("topRisks", [])) or "none"
        return f'Your risk level is {s.get("riskLevel")}. Top risks: {tops}.'
    if any(w in q for w in ("first", "start", "fix", "ควรทำ", "เริ่ม", "แก้")):
        recs = ctx.get("recommendations") or []
        return ("Start with: " + "; ".join(recs[:3]) + ".") if recs else "No open recommendations — keep your controls reviewed."
    return (f'Your current tier is {s.get("currentTier")} ({s.get("currentTierLabel")}) and the target is '
            f'{s.get("targetTier")}. Ask me about your risks, what to fix first, or the suggested plan. '
            "(Offline mode: set GEMINI_API_KEY for full answers.)")
