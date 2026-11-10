"""Baseline model: predict recommendedPlan (Starter / Professional / Enterprise)
from what we know when a company submits a request: company profile, request, 10 answers.

    python data-ai/train_baseline.py

Labels contain ~8% simulated human noise, so ~92% accuracy is roughly the ceiling.
"""
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

CSV = Path(__file__).resolve().parent.parent / "data" / "synthetic" / "companies.csv"
PROFILE = ["industry", "companySize", "employeeCount", "annualRevenue", "country",
           "itInfrastructure", "cloudEnvironment", "mainService"]
ANSWERS = ["GV.PO-01", "ID.AM-01", "ID.RA-01", "PR.AA-03", "PR.AT-01",
           "PR.DS-11", "PR.PS-02", "DE.CM-01", "RS.MA-01", "RC.RP-01"]
NUMERIC = ["servicesRequested"]
TARGET = "recommendedPlan"

df = pd.read_csv(CSV)
X, y = df[PROFILE + ANSWERS + NUMERIC], df[TARGET]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

pre = ColumnTransformer([
    ("profile", OneHotEncoder(handle_unknown="ignore"), PROFILE),
    ("answers", OrdinalEncoder(categories=[["no", "partially", "yes"]] * len(ANSWERS)), ANSWERS),
    ("num", "passthrough", NUMERIC),
])

models = {
    "logistic_regression": LogisticRegression(max_iter=2000),
    "random_forest": RandomForestClassifier(n_estimators=300, random_state=0),
}
for name, clf in models.items():
    pipe = Pipeline([("pre", pre), ("clf", clf)]).fit(X_tr, y_tr)
    print(f"\n=== {name} ===")
    print(classification_report(y_te, pipe.predict(X_te), digits=3))

rule_acc = (df.loc[X_te.index, "recommendedPlanRule"] == y_te).mean()
print(f"Rule-based plan vs (noisy) label on the same test set: {rule_acc:.3f}  ← practical ceiling")
