# Data / AI (มุง, เพชร)

Draft question set, scoring rules, a **synthetic** dataset and the **AI service** for ByteGuardian.
Everything here is a draft for team review.

## How it fits together

```
Questionnaire (web) ─► scoring.ts (rules in data/scoring.json) ─► tier, gap, risk, heatmap, rule-based plan
                                     │
                                     └─► AI service  POST /insights ─► summary, findings, recommendations,
                                                                       action plan, ML-recommended plan
AI Assistant (web) ─► AI service  POST /chat ─► reply
```

The web app now reads `data/questions.json` (20 questions) and scores answers with
`src/server/services/scoring.ts`. `data-ai/scoring.py` is the same logic in Python;
both give identical results on all 500 synthetic companies.

## Files

| File | What it is |
|---|---|
| `data/questions.json` | 20 questions on NIST CSF 2.0 subcategories (GV 3, ID 4, PR 8, DE 2, RS 2, RC 1), in the shape of `data/templates/questions.template.json`. Quick set = 10 questions. |
| `data/scoring.json` | Filled-in `scoring.template.json`: answer points, tier formula, target tier, risk level, heatmap, **plus a proposed `recommendedPlan` rule (new)**. |
| `data-ai/scoring.py` | Reference implementation of `scoring.json`. Can be ported to `src/server/services/scoring.ts`. |
| `data-ai/generate_dataset.py` | Builds the synthetic dataset. Reproducible with `--seed`. |
| `data/synthetic/companies.csv` | 500 fictional companies, one row each (for ML). |
| `data/synthetic/companies.json` | Same data, nested like the request the web sends to the AI service (`company`, `answers`, `scores`) plus `request` and `labels`. |
| `data-ai/train_baseline.py` | Baseline model that predicts the plan (Starter / Professional / Enterprise). |
| `data-ai/service/app.py` | AI service (FastAPI): `/insights`, `/chat`, `/health`. |
| `data-ai/service/knowledge.py` | Recommendation text, team, cost band for each question (draft). |
| `data-ai/service/plan_model.py` | Plan model, trained on the synthetic CSV when the service starts. |

## Run

```bash
pip install -r data-ai/requirements.txt
python data-ai/generate_dataset.py --n 500 --seed 42
python data-ai/train_baseline.py
```

Baseline on the default dataset: logistic regression ≈ 0.78 accuracy, random forest ≈ 0.66.
The labels have 8% simulated noise, so ≈ 0.96 is the ceiling on the test split.

## Run the AI service with the web app

```bash
# terminal 1 — AI service
pip install -r data-ai/requirements.txt
uvicorn app:app --app-dir data-ai/service --port 8000
# optional: real AI text for summary / findings / chat
#   Windows PowerShell:  $env:ANTHROPIC_API_KEY="sk-ant-..."   (before uvicorn)
#   macOS / Linux:       export ANTHROPIC_API_KEY=sk-ant-...

# terminal 2 — web app, with these lines in .env
#   AI_API_URL="http://localhost:8000/insights"
#   AI_CHAT_URL="http://localhost:8000/chat"
npm run dev
```

Without `ANTHROPIC_API_KEY` the service still works: recommendations, action plan and plan come from
rules + the ML model, and summary / chat use simple templates. Check http://localhost:8000/health.
The model name can be changed with `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`).

Old assessments keep their old (mock) results. Run a **new** assessment to see real scores.

## Dataset columns

| Group | Columns | Source |
|---|---|---|
| Company profile | `industry`, `companySize`, `employeeCount`, `annualRevenue`, `country`, `itInfrastructure`, `cloudEnvironment` | Values from `src/lib/options.ts`; mix of companies is assumed (Thailand-heavy) |
| Request | `requestText`, `mainService`, `servicesRequested` | Synthetic templates; service list based on common threats (phishing, ransomware, unpatched software …) |
| Answers | one column per question ID: `yes` / `partially` / `no` | Synthetic. Probability of "yes" rises with company size and regulated industry |
| Scores | `score_GV` … `score_RC`, `currentTier`, `currentTierLabel`, `targetTier`, `overallGap`, `riskLevel` | Calculated with `data/scoring.json` |
| Labels | `needScore`, `recommendedPlanRule` (clean rule), `recommendedPlan` (rule + 8% noise, used as the ML target) | Rule in `scoring.json` → `recommendedPlan` |

## Where the data comes from, and what is assumed

- **Questions:** NIST CSF 2.0 subcategory IDs, plus related CIS Controls v8 safeguards and Implementation Group (IG) for each question. The question wording is ours.
- **Plans:** Starter ≈ CIS IG1, Professional ≈ IG2, Enterprise ≈ IG3.
- **Answer patterns:** *assumed*. The direction (larger and regulated organisations have more controls) follows the UK Cyber Security Breaches Survey. The exact probabilities are **not** calibrated.
- **To make it more realistic:** download the CSBS microdata from the UK Data Service (free account, combined 2016–2022 dataset + yearly files to 2025). Then set `BASE_MATURITY` and the per-question `difficulty` from the real share of businesses that have each control, by size.

## Open questions for the team

1. Do the questions and scoring come from us (Data/AI) or from the cyber team? The code comments say both.
2. Are the plans really Starter / Professional / Enterprise? The AI response now has an extra field `recommendedPlan: { plan, confidence, reason }`, and the dashboard shows it.
3. Is `maxTier` 4? (The template asked to confirm 4 or 5.)
