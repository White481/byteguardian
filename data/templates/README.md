# Templates for the Data/AI team (มุง, เพชร)

Fill these in and send them back (or open a PR that adds the real files to `data/`).
The web app is already built around these shapes, so once they arrive the dev team only swaps the mock files.

| File | What it is | Used by |
|---|---|---|
| `questions.template.json` | The assessment question set | Security Assessment page, `GET /api/questions` |
| `scoring.template.json` | How answers turn into tier scores and risk level | Scoring engine, Dashboard, Results |
| `ai-output.template.json` | Request the web sends to the AI service, and the response it expects | `src/server/ai-client.ts`, AI Insights, Action Plan |

Rules
- Keep the field names. Add fields if you need them, but tell the dev team.
- Values in `[brackets]` are placeholders — replace them.
- The AI service is called **server-side** from the web app. Give the dev team the URL and (if any) an API key; they go in `.env` as `AI_API_URL` / `AI_API_KEY`, never in code.
