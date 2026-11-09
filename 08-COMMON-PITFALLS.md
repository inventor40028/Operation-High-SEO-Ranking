# 08 — Common Pitfalls (lessons from Xqivo)

Every item below happened in production. Symptom → cause → fix.

## 1. Cloudflare KV write limits

- **Symptom:** counters silently stop updating; 429 errors on `put`.
- **Cause:** Workers KV free tier caps at **1,000 `put` ops/day**; high-frequency counters (rate limits, views) blow through it.
- **Fix:** keep counters in **D1/SQLite** (atomic, idempotent `INSERT ... ON CONFLICT` updates). Use KV only for read-mostly config. Final state: zero KV writes for counters.

## 2. fetch waitUntil gets cancelled

- **Symptom:** background work started with `waitUntil` dies mid-flight; data missing.
- **Cause:** Workers don't guarantee `waitUntil` execution; free-tier CPU limits cut it off.
- **Fix:** run heavy work in **cron-triggered jobs** or queue/durable execution; keep request handlers short and synchronous where correctness matters.

## 3. Timeouts

- **Symptom:** writer API returns gateway timeout; no post produced.
- **Cause:** LLM generation + research + DB writes exceed the platform timeout (Cloudflare subrequest/CPU limits, Vercel function duration).
- **Fix:** move generation into a scheduled job with retries; keep the HTTP handler thin; log run traces.

## 4. Empty traces / silent failures

- **Symptom:** run logs missing or "success" with zero posts.
- **Cause:** no per-stage instrumentation.
- **Fix:** log every stage (start, stage, provider, ms, output count, error). Store traces for the admin view (`09`). Fail loudly when outputs are empty.

## 5. Provider 503s (Gemini)

- **Symptom:** random `503` / rate-limit responses; publishing stalls.
- **Cause:** free-tier provider rate limits; bursts.
- **Fix:** **fallback chain** (primary → secondary → tertiary) with exponential backoff; mark failed questions to retry next cycle instead of dropping them.

## 6. Stale caches after writes

- **Symptom:** updated sitemap / new post not visible; old OG image.
- **Cause:** CDN/HTTP cache not invalidated on write.
- **Fix:** purge/invalidate cache keys on publish (sitemap, post page, og image); set sensible cache headers with short TTL for dynamic paths.

## 7. Static export vs SSR

- **Symptom:** pages built as static export can't run server endpoints; API calls fail in production.
- **Cause:** Next.js `output: "export"` (or any pure static host) has no server runtime.
- **Fix:** deploy the API separately (Workers/functions); treat static app as a client. Also: **anonymous sign-in** may be required so static builds can fetch public data without credential flash.

## 8. Firestore rules too open

- **Symptom:** clients could write plan fields / self-grant roles.
- **Fix:** write rules that allow **worker/admin only** for sensitive fields (plan, usage, verification timestamps); clients get read-only (or per-doc) access. Never let the client write its own `plan`/`trialEndsAt`.

## 9. Low crawl demand & slow indexing

- **Symptom:** new pages not indexed for weeks.
- **Cause:** new sites have little authority; Google crawls rarely.
- **Fix:** request indexing via GSC URL Inspection; add internal links from high-value pages; keep publishing steadily. Expect 1–4 weeks. Do not treat week-one silence as failure.

## 10. OAuth origin mismatches

- **Symptom:** Google login "redirect_uri mismatch".
- **Cause:** the exact origin (http vs https, www vs apex, custom domain) was not registered in the Cloud Console authorized JavaScript origins / redirect URIs.
- **Fix:** register every origin you actually run on (local with port too).

## 11. AI hallucination

- **Symptom:** posts with invented prices/statutes.
- **Fix:** research-first pipeline; fact gate; facts from vetted sources; flag uncertain facts for human review; publish only through gates.

## 12. SEO-slop copy

- **Symptom:** keyword-stuffed template text ranks worse than nothing.
- **Fix:** quality gates; humanize pass; audience-matched internal links; require real value in sections.

## 13. Implicitly trusting the queue

- **Symptom:** stale or junk questions published.
- **Fix:** dedup + per-track caps + source labels; audit queue before publishing.

## Recap

Checklist before launch: counters in SQLite (not KV); writer runs via cron (not waitUntil); fallback chain configured; run traces on; cache invalidation wired; origins registered; rules locked; expectations set.
