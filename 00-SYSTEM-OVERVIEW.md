# 00 — System Overview (Case Study: Xqivo)

This file describes a real automated SEO system that was built and shipped. Use it to understand **what a complete system looks like** before adapting it to a new business. Replace every Xqivo-specific detail with the new client's equivalents.

## The business

Xqivo is a SaaS app that generates receipt PDFs (a "receipt generator"). Its audience has two very different halves:

- **Business/freelancer users** — make invoices and receipts, want cost/how-to answers.
- **Developers** — want an API to generate receipts programmatically (search for things like "receipt API").

This audience split drove the whole architecture: **separate content tracks**.

## What was built

### 1. Automated blog engine
- A queue collection `blog_questions` (`question`, `status`, `track`, `source`, timestamps).
- A writer API endpoint protected by a `CRON_SECRET` header.
- A cron job hit the writer every **6 hours**, publishing at most **4 posts/day**.
- Weekly GSC (Search Console) export added ~10 related questions back into the queue.

### 2. Content split (the "track" concept)
- Daily budget split: **4 business/freelancer posts + 2 developer posts** (configurable).
- The two tracks are **separate streams** — high-click developer questions CANNOT crowd out freelancer questions (the "developer clamp").
- Developer posts must be sourced from what developers actually search (e.g., "receipt API"), researched **without mentioning the product**, never self-referential topics.

### 3. Writer pipeline
`research → structured JSON sections → humanize → quality gates → publish`
- First provider generates structured JSON (title, slug, sections, internal links).
- A humanize pass rewrites to a helpful, first-person business tone.
- Quality gates block thin/duplicate/low-value output.
- Provider fallback chain handles 503s (e.g., Gemini would return 503s under rate limits → fall back to another provider).

### 4. AI-search SEO
- `/llms.txt` published for AI engines.
- `robots.txt` rules for AI crawlers while keeping Googlebot indexing intact.
- JSON-LD structured data (Article + FAQPage).
- Canonical/redirect fixes, OG images, sitemap regeneration on every publish.

### 5. Technical SEO fixes (GSC-driven)
- Soft 404s fixed (pages returning 200 with "not found" content).
- "Alternate canonical" warnings fixed (duplicate pages without user-selected canonical).
- App/dashboard pages `noindex`.
- Legacy redirects pointed at correct final URLs.

### 6. GSC automation
- Daily GSC pull via API (service account) → writes click/impression data.
- Keyword map CSV (keyword, url, intent, clicks, impressions, ctr, position, track).
- Weekly "page 2 → page 1" recommendations generated from query positions 8–20.

## What worked

- **Question-driven programmatic posts** ranking for long-tail questions.
- **GSC data feeding the queue** — real demand shapes future content.
- **Separate tracks** kept the blog balanced and on-brand for both audiences.
- **JSON-LD + clean canonicals** improved indexing eligibility.
- **llms.txt** made the site intelligible to AI assistants.

## What did not work (lessons — full detail in `08-COMMON-PITFALLS.md`)

- Cloudflare KV **1,000 writes/day limit** → moved counters to D1/SQLite (atomic idempotent increments).
- `waitUntil` background work got **cancelled** → switched to standalone cron-triggered jobs.
- Provider **503s** → fallback chain with retries.
- New-site **crawl demand is low**; Google took 1–4 weeks to index.
- OAuth **origin mismatches** (http vs https, custom domains) broke logins until registered exactly.

## Key numbers to expect

| Metric | Reality |
|---|---|
| Time to indexing | 1–4 weeks (new pages) |
| Daily post budget | 4–6 posts (quality gates matter more than volume) |
| Queue → publish | minutes (writer) to hours (cron cadence) |
| GSC data latency | ~2–3 days behind real time |

## How to adapt this to a NEW business

1. Run `01-QUESTIONS-INTERVIEW.md` and fill the brief.
2. Choose the stack with `02-ADAPTIVE-STACK.md`.
3. Instantiate the queue + writer per `03-BLOG-ENGINE.md`.
4. Decide the track split (e.g., for a car rental site: 5 "customer" + 1 "fleet/partner").
5. Follow `05` → `04` → `06` → `07` in order.
