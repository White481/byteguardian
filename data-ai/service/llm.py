"""One function, ask_llm(), that calls Google Gemini.

Settings are read from the repo's .env file (or real environment variables):
  LLM_PROVIDER   "gemini" (default when GEMINI_API_KEY is set) or "none" (templates only, no tokens)
  GEMINI_API_KEY key from https://aistudio.google.com/apikey
  GEMINI_MODEL   default gemini-3.5-flash-lite

Any error (no internet, quota used up, wrong key) returns None, and the service falls back to templates.
"""
from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from pathlib import Path

log = logging.getLogger("byteguardian-ai")


def _load_dotenv() -> None:
    """Read KEY=value lines from the repo's .env (same file the web uses). Real env vars win."""
    path = Path(__file__).resolve().parents[2] / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()

GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
PROVIDER = (os.environ.get("LLM_PROVIDER") or ("gemini" if GEMINI_KEY else "none")).lower()
ENABLED = PROVIDER == "gemini" and bool(GEMINI_KEY)
MODEL = GEMINI_MODEL if ENABLED else None


def ask_llm(system: str, messages: list[dict], max_tokens: int = 800, json_mode: bool = False) -> str | None:
    """messages: [{"role": "user" | "assistant", "content": str}, ...]"""
    if not ENABLED:
        return None
    try:
        return _gemini(system, messages, max_tokens, json_mode)
    except Exception as e:
        log.warning("gemini call failed, using template instead: %s", e)
        return None


def _gemini(system: str, messages: list[dict], max_tokens: int, json_mode: bool) -> str | None:
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [
            {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
            for m in messages
        ],
        "generationConfig": {"maxOutputTokens": max_tokens,
                             **({"responseMimeType": "application/json"} if json_mode else {})},
    }
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            data = json.load(res)
    except urllib.error.HTTPError as e:  # show Google's error message in the log
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}") from e
    parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts if not p.get("thought")).strip() or None

