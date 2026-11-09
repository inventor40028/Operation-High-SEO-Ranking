# 02 — Adaptive Stack Guide

**First rule: ASK the user first** — what host/server/API/AI do you already use? Reuse whatever exists; only fill gaps.

## Step 1 — Detect what the user already has

Look for these markers in their repo/account:

| Marker | Means |
|---|---|
| `package.json` + `next.config.*` (with `output: "export"`) | Next.js **static export** |
| `package.json` (framework, `vite`, `create-react-app`) | Client-side SPA |
| `wrangler.toml` / `.dev.vars` | Cloudflare Workers |
| `firebase.json` | Firebase Hosting + (likely) Firestore |
| `vercel.json` / `netlify.toml` | Vercel / Netlify serverless |
| Dockerfile / docker-compose | Container host (Railway/Render/VPS) |
| `git remote -v` | Git host (GitHub/GitLab/etc.) |
| `.env.example` | Existing env vars (names only — never read `.env` values) |

Also ask directly: "What hosting/server/API do you already use?" — the user knows.

## Step 2 — Server/hosting decision

- **If they already have a server/API host → use it.** Only ask for the bare minimum access (env vars, a route or cron slot).
- **If none**, pick from this table (pros/cons):

| Option | Pros | Cons |
|---|---|---|
| **Cloudflare Workers** (free) | 100k req/day free; Cron Triggers; globally fast; D1 SQLite free | KV writes capped at **1,000/day** (lesson: never store counters in KV → use D1/atomic SQL); JS runtime only |
| **Vercel** (Hobby free) | Easy Next.js deploy; serverless functions; cron via Vercel Cron | Function duration limits; free tier has monthly usage caps |
| **Firebase Hosting + Firestore** (Spark free) | Free static hosting + DB; great rules API; easy auth | Firestore rules learning curve; client SDK only unless Cloud Functions |
| **Railway / Render** | Simplest for persistent Node/Python servers; cron-friendly | Always-on services cost money; less "free tier" |

**Lesson from Xqivo:** Cloudflare KV has a hard **1,000 `put` ops/day** limit. We hit it with high-frequency counters. Fix: move counters to **D1/SQLite** (atomic idempotent increments) and keep KV read-only or for config.

## Step 3 — AI provider detection

- Ask: "Which AI providers do you already have keys for?" Use those first.
- Recommendation matrix (if none):
  - **OpenAI** — easy, cheap for `gpt-4o-mini`-class models; needs billing.
  - **Anthropic** — strong writing quality; needs billing.
  - **Google Gemini** — has a **free tier**; but can return **503s** under load (lesson: fallback chain mandatory).
  - Local/OSS — privacy-friendly; needs a GPU box.
- **Key handling:** the AI must never see or print keys. The user sets `{AI_API_KEY_ENV}` themselves. Code reads from env only.
- **Fallback chain design (always):** primary provider → secondary → tertiary → fail with clear error log. Never let one provider outage stop publishing.

## Step 4 — Data/analytics detection (GSC)

- Ask for the Search Console property type:
  - **Domain property** (verified via DNS TXT) — recommended: covers all subdomains.
  - **URL-prefix property** — only one origin; fine if the site is single-host.
- **Service account steps** (for API automation):
  1. Google Cloud Console → IAM & Admin → Service Accounts → Create.
  2. Enable the **Search Console API** in the project.
  3. Create a **JSON key** for the service account (download once; keep secret).
  4. In Search Console → Settings → Users and permissions → add the service account email as a user on the property.
  5. Reference the key file only via env var: `GOOGLE_APPLICATION_CREDENTIALS` or `GSC_SERVICE_ACCOUNT`.
- **Alternative if no API access:** manual CSV export from GSC (daily/weekly) can be dropped into the same keyword-map flow (`06`).

## Decision flowchart

```
Already have a server/API? ──yes──► use it (config only)
        │no
        ▼
Static site only? ──yes──► add a worker/function for the writer + cron
        │no
        ▼
Pick: Cloudflare Workers+D1 (free, JS) | Vercel | Firebase | Railway/Render
        │
        ▼
AI keys exist? ──yes──► use them (env vars only)
        │no
        ▼
Pick provider (Gemini free tier OK, but add fallbacks)
        │
        ▼
GSC API possible? ──yes──► service account (steps above)
        │no
        ▼
Manual CSV export fallback
```

## Exit criteria

Before building, you must know: host, DB, cron mechanism, AI provider(s), GSC property. If any is unknown — ask.
