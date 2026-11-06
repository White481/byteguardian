# Data / AI (มุง, เพชร)

Draft question set, scoring rules and a **synthetic** dataset for ByteGuardian.
Everything here is a draft for team review. Nothing in the web app uses these files yet.

## Files

| File | What it is |
|---|---|
| `data/questions.json` | 10 questions on NIST CSF 2.0 subcategories, in the shape of `data/templates/questions.template.json`. Quick set = 7 questions. |
| `data/scoring.json` | Filled-in `scoring.template.json`: answer points, tier formula, target tier, risk level, heatmap, **plus a proposed `recommendedPlan` rule (new)**. |
| `data-ai/scoring.py` | Reference implementation of `scoring.json`. Can be ported to `src/server/services/scoring.ts`. |
| `data-ai/generate_dataset.py` | Builds the synthetic dataset. Reproducible with `--seed`. |
| `data/synthetic/companies.csv` | 500 fictional companies, one row each (for ML). |
| `data/synthetic/companies.json` | Same data, nested like the request the web sends to the AI service (`company`, `answers`, `scores`) plus `request` and `labels`. |
| `data-ai/train_baseline.py` | Baseline model that predicts the plan (Starter / Professional / Enterprise). |

## Run

```bash
pip install -r data-ai/requirements.txt
python data-ai/generate_dataset.py --n 500 --seed 42
python data-ai/train_baseline.py
```

Baseline on the default dataset: logistic regression ≈ 0.71 accuracy, random forest ≈ 0.67.
The labels have 8% simulated noise, so ≈ 0.92 is the ceiling.

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
2. Are the plans really Starter / Professional / Enterprise? If yes, the web needs a new field, for example `recommendedPlan`, in the AI response (`ai-output.template.json`).
3. Is `maxTier` 4? (The template asked to confirm 4 or 5.)
