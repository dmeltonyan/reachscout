# ReachScout

> Find the right professional contact, understand why they matter, and write a better introduction.

ReachScout is a professional-research assistant that searches publicly available web information to help you identify recruiters, hiring managers, professors, founders, and other professional contacts — and draft genuine, context-aware outreach.

**It is not a private-email scraper or bulk-spam tool.**

---

## Features

- **5-stage search pipeline** — normalize org, generate queries, retrieve public results, extract profiles, rank and deduplicate
- **Evidence-backed confidence scoring** — every contact shows exactly which public source supports each data point with a 0–100 score and plain-English explanation
- **Strict email labeling** — emails are always labeled as *publicly listed*, *verified*, *general contact*, or *pattern estimate*; pattern estimates are hidden by default and never marked verified
- **Provider adapter pattern** — swap search/verification providers via environment variable with zero code changes
- **Suppression list** — mark contacts as "do not contact" with a reason
- **AI outreach drafts** — generate context-aware messages via Claude (requires Anthropic API key; falls back to templates without one)
- **CSV export** — download saved contacts; pattern estimates are excluded from exports
- **SSRF protection** — all outbound URLs are validated against a private-network blocklist before fetching
- **Rate limiting** — configurable per-user limits on searches, profiles, verifications, and exports
- **Demo mode** — works fully without any API keys using fictional contacts on `example.com` domains

---

## Architecture

```
Browser → Next.js App Router → Route Handlers
                                    │
                          ┌─────────┴──────────┐
                          │  Search Orchestrator │
                          │  ┌───────────────┐  │
                          │  │ A. Normalizer  │  │
                          │  │ B. QueryGen    │  │
                          │  │ C. Provider ───┼──┼─► Mock | Brave | Serper
                          │  │ D. Extractor   │  │
                          │  │ E. Ranker/Dedup│  │
                          │  └───────────────┘  │
                          └─────────────────────┘
                                    │
                          Supabase PostgreSQL (Prisma ORM)
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Forms | React Hook Form + Zod |
| Auth | Supabase Auth (magic link) |
| Database | Supabase PostgreSQL via Prisma ORM |
| Search | Mock (default) · Brave Search API |
| Verification | Mock (default) · Hunter API |
| Outreach AI | Anthropic Claude (claude-haiku-4-5) |
| Tests | Vitest + Testing Library + Playwright |

---

## Local setup

### Prerequisites

- Node.js 20+
- pnpm 11+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/dmeltonyan/SearchMelt.git
cd SearchMelt/reachscout
pnpm install --ignore-scripts
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, DATABASE_URL_DIRECT
```

### 3. Set up the database

```bash
pnpm db:generate   # generate Prisma client
pnpm db:push       # push schema to Supabase
pnpm db:seed       # load demo data (optional)
```

### 4. Run in development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Supabase service role key |
| `DATABASE_URL` | Yes | — | Pooled Postgres URL (for runtime) |
| `DATABASE_URL_DIRECT` | Yes | — | Direct Postgres URL (for migrations) |
| `SEARCH_PROVIDER` | No | `mock` | `mock` or `brave` |
| `BRAVE_SEARCH_API_KEY` | When brave | — | Brave Search API key |
| `EMAIL_VERIFICATION_PROVIDER` | No | `mock` | `mock` or `hunter` |
| `HUNTER_API_KEY` | When hunter | — | Hunter.io API key |
| `ANTHROPIC_API_KEY` | No | — | Enables AI outreach generation |
| `SEARCHES_PER_HOUR` | No | `10` | Rate limit: searches per user per hour |
| `PROFILES_PER_DAY` | No | `100` | Rate limit: profiles per user per day |
| `VERIFICATIONS_PER_DAY` | No | `25` | Rate limit: email verifications per user per day |
| `EXPORTS_PER_DAY` | No | `5` | Rate limit: CSV exports per user per day |

---

## Running tests

```bash
pnpm test          # unit + integration tests (Vitest)
pnpm test:watch    # watch mode
pnpm test:e2e      # Playwright end-to-end tests
```

### Critical test scenarios covered

1. Duplicate profiles are merged by the deduplicator
2. Official public emails are labeled correctly
3. Pattern estimates are never labeled verified
4. Private-network URLs are rejected (SSRF protection)
5. Query generator strips dangerous search operators
6. Validation schemas reject invalid input

---

## Deployment (Vercel + Supabase)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set all environment variables in Vercel project settings
4. Vercel deploys automatically on push to `main`

Database migrations run via `pnpm db:push` from your local machine or a CI step.

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/search` | Run a new search |
| GET | `/api/searches` | List past searches |
| GET | `/api/searches/[id]` | Get search + contacts |
| DELETE | `/api/searches/[id]` | Delete a search |
| GET | `/api/contacts` | List saved contacts |
| GET | `/api/contacts/[id]` | Get contact detail |
| PATCH | `/api/contacts/[id]` | Update status/notes |
| DELETE | `/api/contacts/[id]` | Delete a contact |
| POST | `/api/contacts/[id]/verify` | Verify contact email |
| POST | `/api/contacts/[id]/suppress` | Add to suppression list |
| POST | `/api/contacts/[id]/generate-outreach` | Generate outreach draft |
| GET | `/api/contacts/export` | Download contacts as CSV |
| GET | `/api/providers/status` | Provider health check |

All endpoints require authentication and return `{ data: ... }` or `{ error: { code, message } }`.

---

## Security considerations

- All user data is protected by Supabase Row Level Security policies
- Every API route verifies authentication and resource ownership before responding
- Outbound fetch requests are blocked if the target resolves to a private IP range
- Rate limits prevent abuse of search, verification, and export endpoints
- Pattern-estimate emails are excluded from CSV exports by default
- No raw API keys or email bodies are logged

---

## Ethical use policy

ReachScout is a professional research tool. It:

- Only retrieves information from publicly accessible pages
- Respects robots.txt intentions and rate limits
- Never bypasses authentication, paywalls, or CAPTCHAs
- Never exposes home addresses, personal phone numbers, or personal social accounts
- Clearly distinguishes confirmed from estimated emails
- Includes a suppression list to honor "do not contact" requests
- Does not send messages automatically

Users are responsible for compliance with CAN-SPAM, GDPR, CCPA, and applicable platform terms.

---

## Known limitations

- Email extraction relies on public snippets; accuracy depends on source quality
- Pattern estimates are purely heuristic and should never be treated as verified
- The mock provider returns fictional demo data; real searches require a Brave API key
- No real-time search progress (progress bar is simulated during the async pipeline)

---

## Future improvements

- Streaming search progress via Server-Sent Events
- pgvector semantic similarity for better deduplication
- Hunter.io live email verification integration
- LinkedIn public profile parsing (within robots.txt limits)
- Team-level search quotas and shared suppression lists
- Webhook integrations for CRM sync

---

Built by [David Meltonyan](https://github.com/dmeltonyan) · [SearchMelt on GitHub](https://github.com/dmeltonyan/SearchMelt)
