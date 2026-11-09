# Operation High SEO Ranking

A reusable SEO operations playbook. This folder contains everything needed to build an automated SEO system for **any** website or business (example target: a car rental site), based on what was learned building Xqivo's automated SEO system.

## What this folder is

- A **case study** of a real automated SEO system (Xqivo) — what was built, why, and what worked.
- A **questionnaire** to interview the business owner before building anything.
- An **adaptive stack guide** — detect what the user already has, then choose the cheapest viable stack.
- **System specs** for a blog engine, AI-search SEO, GSC automation, and content batching.
- A **pitfalls catalog** of everything that went wrong and how to avoid it.
- **Copy-paste templates** for schemas, scripts, cron config, robots/llms files, and reports.

## How an AI agent should use this folder (step-by-step)

1. **Read `00-SYSTEM-OVERVIEW.md` first.** Understand what a complete automated SEO system looks like before designing for a new client.
2. **Interview the user using `01-QUESTIONS-INTERVIEW.md`.** Do NOT build anything before you have answers. Record answers in `BRIEF.md` at the project root.
3. **Detect their stack with `02-ADAPTIVE-STACK.md`.** Ask what they already have (host, server, AI keys, analytics). Use their existing infrastructure whenever possible; only propose new pieces for gaps. Never invent a stack without asking.
4. **Build the blog engine** per `03-BLOG-ENGINE.md` (question queue + writer pipeline + fallback chain).
5. **Apply AI-search SEO** per `04-AI-SEARCH-SEO.md` (llms.txt, robots.txt, JSON-LD, canonicals, sitemap).
6. **Run the technical checklist** from `05-TECHNICAL-SEO-CHECKLIST.md` on the existing site.
7. **Wire GSC automation** per `06-GSC-AUTOMATION.md` (service account, pull script, keyword map, page-2→1 recommendations).
8. **Enable content batching** per `07-CONTENT-BATCH.md`.
9. **Read `08-COMMON-PITFALLS.md`** and design the system to avoid every item.
10. **Provide an admin view** per `09-MONITORING-ADMIN.md`.
11. **Copy templates from `10-GENERIC-TEMPLATES/`** and fill every `{PLACEHOLDER}`.

## Golden rules

- **Never print or log API keys.** Ask the user to put keys into environment variables themselves; reference them as `{AI_API_KEY_ENV}`.
- **Ask before choosing a platform.** The cheapest option is the one the user already has.
- **Google takes 1–4 weeks to index new pages.** Set expectations early; don't treat a quiet first week as failure.
- **Content quality gates are mandatory.** A generated post that fails the gates must not be published.
- **Scope discipline:** build the smallest system that answers the business question; add features only when data justifies them.
