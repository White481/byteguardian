# ByteGuardian

AI-powered **Cybersecurity Maturity Assessment** platform — evaluate maturity, find gaps, see results on a dashboard and get AI recommendations.

- Design (source of truth): Figma file **"ByteGuardian — UI Flow"** (12 screens, clickable prototype)
- Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Recharts · Prisma · SQLite (dev) / PostgreSQL

> ⚠️ Partners are still **placeholders**. Questions, scoring rules and AI recommendations are **drafts** from the Data/AI team, waiting for review. Mock and draft data are labelled in the UI.

## Run it

Requires **Node.js 20+** and Git.

```bash
git clone https://github.com/White481/byteguardian.git
cd byteguardian
cp .env.example .env
npm install          # also runs `prisma generate`
npm run db:push      # creates prisma/dev.db (SQLite)
npm run dev          # http://localhost:3000
```

### AI service (Data/AI team) — needed for AI Insights, Action Plan and AI Assistant

Requires **Python 3.10+**. Run it in a **second terminal** and keep it open while you use the web app.

```bash
python -m pip install -r data-ai/requirements.txt        # first time only
python -m uvicorn app:app --app-dir data-ai/service --port 8000
```

Then in `.env`:

```
AI_API_URL="http://localhost:8000/insights"
AI_CHAT_URL="http://localhost:8000/chat"
LLM_PROVIDER="gemini"          # or "none" = templates only, no tokens
GEMINI_API_KEY=""              # optional, from https://aistudio.google.com/apikey
GEMINI_MODEL="gemini-3.5-flash-lite"
```

Check it at http://localhost:8000/health. Details: [`data-ai/README.md`](data-ai/README.md).
If `AI_API_URL` / `AI_CHAT_URL` are empty, the web app uses mock AI responses instead.

**Every time:** start the AI service (terminal 1), then `npm run dev` (terminal 2).

Useful: `npm run lint` · `npm run typecheck` · `npm run db:studio` (browse the DB).

Switch to PostgreSQL: set `provider = "postgresql"` in `prisma/schema.prisma` and a Postgres `DATABASE_URL` in `.env`, then `npm run db:push`.

## Project structure

```
src/
  app/
    (public)/          Landing page                       → ตัง
    (auth)/            login, register                    → ตัง
    (app)/             signed-in pages (sidebar layout)
      onboarding/company, assessment/…                   → ไวท์
      dashboard, results                                  → โอเว่น
      insights, action-plan, reports, collaborators, settings → พี่ภีม
      assistant          AI chat (calls AI_CHAT_URL via ai-client.ts)
    (print)/reports/[id]  printable report (Save as PDF)
    api/               REST route handlers (JSON)
  components/
    ui/                Button, Card, Input, Badge, StatCard, Loading/Error/Empty states …
    layout/            PublicNavbar, Footer, AppSidebar, AppTopbar, Breadcrumbs
    charts/            MaturityRadar, FunctionBars, RiskHeatmap (Recharts)
  lib/                 types, api client (useApi), utils, nav config, db client
  server/
    services/          data access used by API routes
      scoring.ts       scoring engine (rules in data/scoring.json)
    ai-client.ts       the ONLY place that calls the Data/AI service
prisma/schema.prisma   data model
data/
  questions.json       20 NIST CSF 2.0 questions (draft)        → มุง, เพชร
  scoring.json         scoring rules (draft)                    → มุง, เพชร
  synthetic/           500 fictional companies for testing / ML → มุง, เพชร
  mock/                mock data (old placeholders)
  templates/           templates for the Data/AI team to fill in
data-ai/               Python: AI service, scoring reference, dataset generator → มุง, เพชร
  service/             FastAPI app: /insights, /chat, /health
```

## Rules for the team

1. **Use the components and tokens.** Colors live in `src/app/globals.css` (`bg-surface`, `text-muted`, `border-line`, `bg-primary` …). No hex codes in components.
2. **Pages get data from the API**, never hardcoded numbers. Follow `src/app/(app)/dashboard/page.tsx`: `useApi()` → loading / error states → components.
3. **Every page needs** loading, empty and error states, and form validation (zod).
4. **Secrets only in `.env`** (never commit `.env`).
5. Don't invent cybersecurity questions, scoring rules or recommendations — they come from the Data/AI team (`data/questions.json`, `data/scoring.json`, `data-ai/`).

## Git workflow

```bash
git checkout main && git pull
git checkout -b feat/<page-name>     # e.g. feat/landing, feat/dashboard
# …work, commit small…
git push -u origin feat/<page-name>  # then open a Pull Request into main
```

One feature = one branch = one PR. Someone else reviews before merge. Never push directly to `main`.

## How it works

- **Auth:** email + password (scrypt hash), database sessions in an httpOnly cookie (`src/server/auth.ts`). Every page under `(app)` and every API route requires a session. Roles: `admin` (everything), `member` (run assessments, edit the action plan), `viewer` (read-only).
- **Flow:** Register → Company Setup → Assessment Setup → Questionnaire (autosave, evidence upload) → Submit → Processing (scoring + AI) → Dashboard / Results / AI Insights / Action Plan → Reports (print / save as PDF).
- **Questions & scoring:** 20 draft NIST CSF 2.0 questions in `data/questions.json` (quick set = 10), scored by `src/server/services/scoring.ts` using the rules in `data/scoring.json`. Answers → tier (1–4), gap, risk level, heatmap and a recommended plan.
- **AI:** insights, action plan, recommended plan (ML model) and chat come from the AI service (`AI_API_URL`, `AI_CHAT_URL`). If those are empty, mock responses are used; results made with mock AI are stored with `source = "mock"` and labelled in the UI.
- **Evidence files** are saved to `uploads/` (git-ignored) under random names; max 10 MB, PDF/PNG/JPG/TXT/DOCX/XLSX.

## API

All routes return JSON; errors are `{ error: { code, message } }`. Everything except auth and health needs a session.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ status: "ok" }` |
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | returns `{ next }` (where to go) |
| GET / PATCH | `/api/me` | current user / update name + email |
| POST | `/api/me/password` | change password (signs out other sessions) |
| GET / PATCH | `/api/company` | `?draft=1` = save progress (only name required); admin only |
| GET / POST | `/api/assessments` | history / start `{ type, framework, functions? }` |
| GET | `/api/assessments/:id` | questions + saved answers (resume) |
| PUT | `/api/assessments/:id/answers` | `{ questionId, value, note?, currentIndex? }` |
| POST | `/api/assessments/:id/evidence` | multipart `questionId`, `file` |
| POST | `/api/assessments/:id/submit` | 422 if any question is unanswered |
| POST | `/api/assessments/:id/process` | scoring + AI + action plan (retry-safe) |
| GET | `/api/assessments/:id/status` | `{ status }` |
| GET | `/api/dashboard` | `DashboardData` (incl. `summary.recommendedPlan`) or `null` (no completed assessment) |
| GET | `/api/insights` | stored `AiInsights` or `null` |
| GET / POST | `/api/action-plan` | `ActionPlanData` / add item ("Add to plan") |
| PATCH | `/api/action-plan/:id` | `{ status?, progress? }` |
| GET / POST | `/api/reports` | list / create `{ assessmentId }` → open `/reports/:id` |
| GET / POST | `/api/collaborators` | list / invite (admin) |
| PATCH / DELETE | `/api/collaborators/:id` | change role / remove (admin) |
| POST | `/api/chat` | `{ messages }` → `{ reply, isMock }` (20 / minute / user); sends latest results to the AI service as context |
| GET | `/api/questions?type=full\|quick\|custom` | `Question[]` from `data/questions.json` |