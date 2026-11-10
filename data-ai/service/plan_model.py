"""Recommended-plan model (internal labels Starter / Professional / Enterprise = CIS IG1/2/3).

Predictions are returned as the plan names we sell, via scoring.json "displayNames".

Trained at service start-up from data/synthetic/companies.csv (takes about a second),
so no model file has to be committed. Uses only fields the web app sends:
company profile + the answers. Missing answers count as 'partially'.
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

import scoring

CSV = Path(__file__).resolve().parents[2] / "data" / "synthetic" / "companies.csv"
PROFILE = ["industry", "companySize", "employeeCount", "annualRevenue", "country", "itInfrastructure", "cloudEnvironment"]
ANSWERS = [q["id"] for q in scoring.QUESTIONS]
POINTS = scoring.RULES["answerValues"]


def to_frame(rows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    for c in PROFILE:
        df[c] = df.get(c, pd.Series(["Unknown"] * len(df))).fillna("Unknown").astype(str)
    for q in ANSWERS:
        df[q] = df.get(q, pd.Series([None] * len(df))).map(lambda v: POINTS.get(v, 0.5)).astype(float)
    return df[PROFILE + ANSWERS]


class PlanModel:
    def __init__(self, pipe: Pipeline, test_accuracy: float):
        self.pipe, self.test_accuracy = pipe, test_accuracy

    @classmethod
    def train(cls) -> "PlanModel":
        raw = pd.read_csv(CSV)
        X, y = to_frame(raw.to_dict("records")), raw["recommendedPlan"]
        pre = ColumnTransformer([("p", OneHotEncoder(handle_unknown="ignore"), PROFILE), ("a", "passthrough", ANSWERS)])
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
        acc = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=2000))]).fit(X_tr, y_tr).score(X_te, y_te)
        pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=2000))]).fit(X, y)  # final: all rows
        return cls(pipe, round(float(acc), 3))

    def predict(self, company: dict, answers: dict[str, str]) -> dict:
        X = to_frame([{**{c: company.get(c) for c in PROFILE}, **answers}])
        proba = self.pipe.predict_proba(X)[0]
        best = int(proba.argmax())
        internal = str(self.pipe.classes_[best])
        names = scoring.RULES["recommendedPlan"].get("displayNames", {})
        return {"plan": names.get(internal, internal), "confidence": round(float(proba[best]), 2)}
