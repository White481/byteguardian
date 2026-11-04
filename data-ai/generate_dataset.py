"""Generate a synthetic ByteGuardian dataset: companies, their service request,
answers to the 10 questions, scores from data/scoring.json, and a recommended plan.

    python data-ai/generate_dataset.py --n 500 --seed 42

Outputs data/synthetic/companies.csv (one row per company, for ML) and
data/synthetic/companies.json (nested, same shape the web sends to the AI service).

All companies are fictional. The answer probabilities below are ASSUMPTIONS, chosen
to follow the general pattern in the UK Cyber Security Breaches Survey (bigger and
regulated organisations have more controls in place). Calibrate them against the
CSBS microdata (UK Data Service) before using the data for anything serious.
"""
from __future__ import annotations

import argparse
import csv
import json
import random
from pathlib import Path

from scoring import QUESTIONS, RULES, recommended_plan, score

OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "synthetic"

# Values match src/lib/options.ts so rows can be loaded straight into the web app.
INDUSTRIES = {
    "Finance & Banking": 12, "Healthcare": 10, "Government": 7, "Education": 8,
    "Retail & E-commerce": 14, "Manufacturing": 15, "Technology": 14,
    "Energy & Utilities": 6, "Telecommunications": 5, "Other": 9,
}
SIZES = {"Small (1–50)": 40, "Medium (51–250)": 30, "Large (251–1,000)": 18, "Enterprise (1,000+)": 12}
EMPLOYEES = {
    "Small (1–50)": ["1–10", "11–50"],
    "Medium (51–250)": ["51–250"],
    "Large (251–1,000)": ["251–1,000"],
    "Enterprise (1,000+)": ["1,001–5,000", "5,000+"],
}
REVENUE = {
    "Small (1–50)": {"Under $1M": 60, "$1M–$10M": 30, "Prefer not to say": 10},
    "Medium (51–250)": {"$1M–$10M": 55, "$10M–$50M": 35, "Prefer not to say": 10},
    "Large (251–1,000)": {"$10M–$50M": 45, "$50M–$250M": 45, "Prefer not to say": 10},
    "Enterprise (1,000+)": {"$50M–$250M": 40, "Over $250M": 50, "Prefer not to say": 10},
}
COUNTRIES = {"Thailand": 70, "Singapore": 7, "Malaysia": 5, "Vietnam": 5, "Indonesia": 4,
             "Philippines": 3, "Japan": 3, "United States": 1, "United Kingdom": 1, "Other": 1}
INFRA = {
    "Small (1–50)": {"On-premises": 20, "Hybrid": 25, "Fully cloud": 40, "Not sure": 15},
    "Medium (51–250)": {"On-premises": 25, "Hybrid": 40, "Fully cloud": 30, "Not sure": 5},
    "Large (251–1,000)": {"On-premises": 25, "Hybrid": 55, "Fully cloud": 18, "Not sure": 2},
    "Enterprise (1,000+)": {"On-premises": 15, "Hybrid": 70, "Fully cloud": 15},
}
CLOUD = {"AWS": 30, "Microsoft Azure": 28, "Google Cloud": 15, "Multi-cloud": 12, "Private cloud": 10, "None": 5}

# Base maturity (0–1) by size, before noise.
BASE_MATURITY = {"Small (1–50)": 0.30, "Medium (51–250)": 0.45, "Large (251–1,000)": 0.60, "Enterprise (1,000+)": 0.70}

# Service requests. "fixes" = the question this service mainly addresses.
SERVICES = {
    "phishing_protection": {
        "fixes": ["PR.AT-01"],
        "templates": [
            "Several staff clicked a fake invoice email last month. We need phishing protection and training for our {staff} employees.",
            "We want email filtering and a phishing simulation program for our {industry_l} team.",
        ],
    },
    "mfa_rollout": {
        "fixes": ["PR.AA-03", "PR.AA-05"],
        "templates": [
            "We want to roll out multi-factor authentication for email and VPN across the company.",
            "An admin account was accessed with a stolen password. Please help us set up MFA and stronger access control.",
        ],
    },
    "backup_ransomware": {
        "fixes": ["PR.DS-11"],
        "templates": [
            "We are worried about ransomware. We need a secure, offline backup system for our {infra_l} servers.",
            "Our backups have never been tested. We want automated backups with regular restore tests.",
        ],
    },
    "vulnerability_scanning": {
        "fixes": ["ID.RA-01"],
        "templates": [
            "We need regular vulnerability scanning of our web applications and servers, with a monthly report.",
            "Please run a vulnerability assessment and penetration test on our customer-facing website.",
        ],
    },
    "patch_management": {
        "fixes": ["PR.PS-02"],
        "templates": [
            "Many of our PCs are running outdated software. We want an automated patch management solution.",
            "We need help keeping {cloud} and on-site systems patched on a fixed schedule.",
        ],
    },
    "asset_inventory": {
        "fixes": ["ID.AM-01", "ID.AM-02"],
        "templates": [
            "We don't know exactly how many devices are on our network. We need an automated asset inventory.",
        ],
    },
    "security_monitoring": {
        "fixes": ["DE.CM-01"],
        "templates": [
            "We want 24/7 security monitoring (SIEM/SOC) with alerts for suspicious activity.",
            "Please set up central log collection and alerting for our {infra_l} environment.",
        ],
    },
    "incident_response_plan": {
        "fixes": ["RS.MA-01", "RS.CO-02"],
        "templates": [
            "We need a written incident response plan and a tabletop exercise for our management team.",
        ],
    },
    "disaster_recovery": {
        "fixes": ["RC.RP-01"],
        "templates": [
            "We need a disaster recovery plan with clear recovery time targets for our core systems.",
        ],
    },
    "policy_compliance": {
        "fixes": ["GV.PO-01", "GV.RR-02"],
        "templates": [
            "We must comply with PDPA and want to prepare for ISO/IEC 27001. Please help us write security policies.",
            "Our auditor asked for an information security policy. We need policies and a compliance gap review.",
        ],
    },
    "vendor_risk": {
        "fixes": ["GV.SC-07"],
        "templates": [
            "Our IT outsourcing company has full access to our systems. We want a supplier security review.",
        ],
    },
    "data_protection": {
        "fixes": ["ID.AM-07", "PR.DS-01"],
        "templates": [
            "We hold a lot of customer personal data. We need data mapping for PDPA and encryption of laptops and databases.",
            "A staff laptop with customer data was lost. Please help us encrypt devices and find where personal data is stored.",
        ],
    },
    "network_security": {
        "fixes": ["PR.IR-01"],
        "templates": [
            "Our office network is flat — guest Wi-Fi and servers are on the same network. We need firewall and network segmentation.",
        ],
    },
    "endpoint_protection": {
        "fixes": ["DE.CM-09", "PR.PS-05"],
        "templates": [
            "We had a malware infection on several PCs. We want managed endpoint protection (EDR) for all {staff} devices.",
            "Staff install whatever software they like. We need application control and endpoint security.",
        ],
    },
}
FIX_TO_SERVICE = {qid: k for k, v in SERVICES.items() for qid in v["fixes"]}


def pick(rng: random.Random, weights: dict[str, float]) -> str:
    return rng.choices(list(weights), weights=list(weights.values()))[0]


def make_company(i: int, rng: random.Random, plan_noise: float) -> dict:
    industry = pick(rng, INDUSTRIES)
    size = pick(rng, SIZES)
    infra = pick(rng, INFRA[size])
    cloud = "None" if infra == "On-premises" and rng.random() < 0.7 else pick(rng, CLOUD)
    company = {
        "companyId": f"SYN-{i:04d}",
        "name": f"Synthetic Company {i:04d}",
        "industry": industry,
        "companySize": size,
        "employeeCount": rng.choice(EMPLOYEES[size]),
        "annualRevenue": pick(rng, REVENUE[size]),
        "country": pick(rng, COUNTRIES),
        "itInfrastructure": infra,
        "cloudEnvironment": cloud,
    }

    # Latent maturity → answers.
    regulated = industry in RULES["targetTier"]["highRiskIndustries"]
    maturity = BASE_MATURITY[size] + (0.10 if regulated else 0.0) + rng.gauss(0, 0.15)
    answers = {}
    for q in QUESTIONS:
        s = maturity - q["difficulty"] + rng.gauss(0, 0.18)
        answers[q["id"]] = "yes" if s > 0.40 else "partially" if s > 0.15 else "no"

    scores = score(answers, industry, size)

    # Request: usually about a real weakness, sometimes not (customers don't always know).
    weak = [qid for qid, a in answers.items() if a == "no"] or [qid for qid, a in answers.items() if a == "partially"]
    main = FIX_TO_SERVICE[rng.choice(weak)] if weak and rng.random() < 0.7 else rng.choice(list(SERVICES))
    n_services = rng.choices([1, 2, 3], weights=[60, 30, 10])[0] if size in ("Small (1–50)", "Medium (51–250)") \
        else rng.choices([1, 2, 3], weights=[35, 40, 25])[0]
    services = [main] + rng.sample([s for s in SERVICES if s != main], n_services - 1)
    text = rng.choice(SERVICES[main]["templates"]).format(
        staff=company["employeeCount"].split("–")[-1].replace(",", "").replace("+", ""),
        industry_l=industry.lower(),
        infra_l=infra.lower() if infra != "Not sure" else "IT",
        cloud=cloud if cloud != "None" else "cloud",
    )
    if n_services > 1:
        text += " We are also interested in: " + ", ".join(s.replace("_", " ") for s in services[1:]) + "."

    plan_rule, need = recommended_plan(industry, size, scores["summary"]["riskLevel"], n_services)
    # Simulated sales decision: the rule, plus some human judgement (noise).
    plans = RULES["recommendedPlan"]["plans"]
    plan = plan_rule
    if rng.random() < plan_noise:
        idx = plans.index(plan_rule) + rng.choice([-1, 1])
        plan = plans[max(0, min(len(plans) - 1, idx))]

    return {
        "company": company,
        "request": {"text": text, "mainService": main, "services": services, "servicesRequested": n_services},
        "answers": [{"questionId": qid, "value": v, "note": None} for qid, v in answers.items()],
        "scores": scores,
        "labels": {"needScore": need, "recommendedPlanRule": plan_rule, "recommendedPlan": plan},
    }


def to_row(rec: dict) -> dict:
    s = rec["scores"]["summary"]
    row = dict(rec["company"])
    row.update({
        "requestText": rec["request"]["text"],
        "mainService": rec["request"]["mainService"],
        "servicesRequested": rec["request"]["servicesRequested"],
    })
    row.update({a["questionId"]: a["value"] for a in rec["answers"]})
    row.update({f"score_{f['function']}": f["current"] for f in rec["scores"]["functionScores"]})
    row.update({
        "currentTier": s["currentTier"], "currentTierLabel": s["currentTierLabel"],
        "targetTier": s["targetTier"], "overallGap": s["overallGap"], "riskLevel": s["riskLevel"],
        "needScore": rec["labels"]["needScore"],
        "recommendedPlanRule": rec["labels"]["recommendedPlanRule"],
        "recommendedPlan": rec["labels"]["recommendedPlan"],
    })
    return row


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=500)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--plan-noise", type=float, default=0.08, help="share of plan labels moved one plan up/down")
    args = ap.parse_args()

    rng = random.Random(args.seed)
    records = [make_company(i + 1, rng, args.plan_noise) for i in range(args.n)]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "companies.json").write_text(
        json.dumps({"isSynthetic": True, "seed": args.seed, "companies": records}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    rows = [to_row(r) for r in records]
    with open(OUT_DIR / "companies.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} companies to {OUT_DIR}")


if __name__ == "__main__":
    main()
