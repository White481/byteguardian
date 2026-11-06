"""Reference implementation of data/scoring.json.

The web team can port this to src/server/services/scoring.ts. The synthetic data
generator uses the same functions, so the dataset labels always match the rules.
"""
from __future__ import annotations

import json
import math
from collections import defaultdict
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
QUESTIONS = json.loads((DATA_DIR / "questions.json").read_text(encoding="utf-8"))["questions"]
RULES = json.loads((DATA_DIR / "scoring.json").read_text(encoding="utf-8"))

FUNCTION_NAMES = {
    "GV": "Govern", "ID": "Identify", "PR": "Protect",
    "DE": "Detect", "RS": "Respond", "RC": "Recover",
}
LEVELS = ["low", "medium", "high", "critical"]


def question_tier(answer: str) -> float:
    return 1 + 3 * RULES["answerValues"][answer]


def target_tier(industry: str, company_size: str) -> int:
    t = RULES["targetTier"]
    base = t["baseBySize"][company_size]
    if industry in t["highRiskIndustries"]:
        base += t["highRiskBonus"]
    return min(base, RULES["maxTier"])


def tier_label(tier: float) -> str:
    return RULES["tierLabels"][str(max(1, min(4, math.floor(tier))))]


def score(answers: dict[str, str], industry: str, company_size: str) -> dict:
    """answers: {questionId: 'yes' | 'partially' | 'no'} (unanswered questions are skipped)."""
    qs = [q for q in QUESTIONS if q["id"] in answers]

    by_cat: dict[str, list[float]] = defaultdict(list)
    cat_meta = {}
    for q in qs:
        by_cat[q["category"]].append(question_tier(answers[q["id"]]))
        cat_meta[q["category"]] = (q["function"], q["categoryName"])
    cat_scores = {c: sum(v) / len(v) for c, v in by_cat.items()}

    by_fn: dict[str, list[float]] = defaultdict(list)
    for c, s in cat_scores.items():
        by_fn[cat_meta[c][0]].append(s)
    fn_scores = {f: sum(v) / len(v) for f, v in by_fn.items()}

    current = round(sum(fn_scores.values()) / len(fn_scores), 1)
    target = target_tier(industry, company_size)
    gap = round(sum(max(0.0, target - s) for s in fn_scores.values()) / len(fn_scores), 1)

    level = next(t["level"] for t in RULES["riskLevel"]["gapThresholds"] if gap <= t["maxGap"])
    if any(q["critical"] and answers[q["id"]] == "no" for q in qs):
        level = LEVELS[min(LEVELS.index(level) + 1, len(LEVELS) - 1)]

    return {
        "summary": {
            "currentTier": current,
            "currentTierLabel": tier_label(current),
            "targetTier": float(target),
            "targetTierLabel": tier_label(target),
            "overallGap": gap,
            "riskLevel": level,
            "maxTier": RULES["maxTier"],
        },
        "functionScores": [
            {"function": f, "name": FUNCTION_NAMES[f], "current": round(s, 1), "target": float(target)}
            for f, s in fn_scores.items()
        ],
        "categoryScores": [
            {"category": c, "name": cat_meta[c][1], "current": round(s, 1)} for c, s in cat_scores.items()
        ],
    }


def recommended_plan(industry: str, company_size: str, risk_level: str, services_requested: int) -> tuple[str, float]:
    p = RULES["recommendedPlan"]
    need = (
        p["sizePoints"][company_size]
        + (1 if industry in RULES["targetTier"]["highRiskIndustries"] else 0)
        + p["riskPoints"][risk_level]
        + min(1.0, 0.5 * max(0, services_requested - 1))
    )
    plan = next(t["plan"] for t in p["thresholds"] if need <= t["maxNeedScore"])
    return plan, need
