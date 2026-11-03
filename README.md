# ByteGuardian

AI-powered **Cybersecurity Maturity Assessment** platform — evaluate maturity, find gaps, see results on a dashboard and get AI recommendations.

- Design (source of truth): Figma file **"ByteGuardian — UI Flow"** (12 screens, clickable prototype)
- Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Recharts · Prisma · SQLite (dev) / PostgreSQL

> ⚠️ Questions, scoring rules, AI output, pricing, news and partners are **mock / placeholder** until the responsible teams deliver them. Mock data is labelled in the UI.

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
    services/          data access used by API routes (mock today → DB later)
    ai-client.ts       the ONLY place that calls the Data/AI service
prisma/schema.prisma   data model
data/
  mock/                mock data (replace when real data arrives)
  templates/           templates for the Data/AI team to fill in
```

## Rules for the team

1. **Use the components and tokens.** Colors live in `src/app/globals.css` (`bg-surface`, `text-muted`, `border-line`, `bg-primary` …). No hex codes in components.
2. **Pages get data from the API**, never hardcoded numbers. Follow `src/app/(app)/dashboard/page.tsx`: `useApi()` → loading / error states → components.
3. **Every page needs** loading, empty and error states, and form validation (zod).
4. **Secrets only in `.env`** (never commit `.env`).
5. Don't invent cybersecurity questions, scoring rules or recommendations — use the mock files until the Data/AI team delivers.

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
- **Mock until delivered:** scoring (`src/server/services/scoring.ts`), questions (`data/mock/questions.mock.json`), AI insights (`AI_API_URL`) and AI chat (`AI_CHAT_URL`). Results made from mock data are stored with `source = "mock"` and labelled in the UI.
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
| GET | `/api/dashboard` | `DashboardData` or `null` (no completed assessment) |
| GET | `/api/insights` | stored `AiInsights` or `null` |
| GET / POST | `/api/action-plan` | `ActionPlanData` / add item ("Add to plan") |
| PATCH | `/api/action-plan/:id` | `{ status?, progress? }` |
| GET / POST | `/api/reports` | list / create `{ assessmentId }` → open `/reports/:id` |
| GET / POST | `/api/collaborators` | list / invite (admin) |
| PATCH / DELETE | `/api/collaborators/:id` | change role / remove (admin) |
| POST | `/api/chat` | `{ messages }` → `{ reply, isMock }` (20 / minute / user) |
| GET | `/api/questions?type=full\|quick\|custom` | `Question[]` (mock) |
