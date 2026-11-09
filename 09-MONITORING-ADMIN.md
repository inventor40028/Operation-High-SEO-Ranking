# 09 — Monitoring & Admin

A single admin surface for the system. Generic — adapt to the chosen stack.

## What it should show

### 1. Queue
- Pending by status: `queued / generating / failed / skipped / published`.
- Per-track totals (business vs developer/custom).
- Oldest queued item + estimated days until drained at current rate.

### 2. Countdown
- Time until the next writer run (next cron fire).
- Last run time + last import time.

### 3. Run trace (recent N)
Per run: start, finish, duration_ms, posts_published, posts_failed, provider_used, errors[]. Rows link to full logs.

### 4. SEO progress tiles (last 28 days)
- Total clicks.
- Total impressions.
- Average position.
- Indexed pages (from GSC).
- Change vs previous 28 days.

### 5. GSC status
- Last successful API pull.
- Any API errors (auth, quota, property missing).
- Rows pulled last sync.

### 6. Failure watch
- Failed questions with reasons (provider, timeout, gate blocked).
- Failed runs.
- Alert (log/email/chat) when more than N consecutive runs fail.

## Implementation notes

- **Auth:** the admin page must be protected (password / auth). Never expose it publicly.
- **Data source:** read directly from the DB (queue + traces tables) and from the GSC pull table.
- **Static vs server:** if the site is static, the admin can be a separate route/app or a simple local script that prints a report.
- **Simplest version:** a script `npm run seo:status` printing the above as text — works on any stack; a dashboard is a nice-to-have.

## Sample status output (text mode)

```
QUEUE          queued=14 generating=0 failed=1 published=96
  business     queued=9
  developer    queued=5
NEXT RUN       in 3h 12m (cron: 0 */6 * * *)
LAST RUN       2026-11-09T04:00Z  ok  42s  posts=3  provider=gemini(primary)
GSC            last_pull=2026-11-09T04:00Z rows=241 errors=0
SEO (28d)      clicks=1,204  impressions=48,330  pos=11.2  indexed=118
FAILURES       run=0  questions=1 (provider 503, retried next cycle)
```

## Cadence

- Check daily after the morning cron (or use the text report).
- Revisit the recommendation list weekly (`06`).
