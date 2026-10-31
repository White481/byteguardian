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

## API (current)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ status: "ok" }` |
| GET | `/api/dashboard` | `DashboardData` (mock) |
| GET | `/api/questions?type=full\|quick\|custom` | `Question[]` (mock) |
| GET | `/api/insights` | `AiInsights` (mock unless `AI_API_URL` is set) |
| GET | `/api/action-plan` | `ActionPlanItem[]` (mock) |

Errors always look like `{ "error": { "code": "…", "message": "…" } }`. Types are in `src/lib/types.ts`.
