# 07 — Content Batch (auto-fill the queue)

Convert keyword data into queued blog questions, safely.

## 1. Inputs

- **Keyword map CSV** (`06`) — includes clicks/impressions/position/intent.
- **GSC data** — click/impression rows.
- Existing queue state (avoid duplicates).

## 2. Gap detection

A "gap" is a keyword that:

1. Has impressions but low/near-zero clicks (e.g., `position >= 5` or `ctr < 0.01`), **or**
2. Is a known money keyword with no landing page, **or**
3. Is a question (starts with how/what/why/can/do/is/which) that no current post answers.

## 3. Prioritization

Score = `impressions × ctr_deficit` (or manual priority). Pick top N per cycle (e.g., 10).

## 4. The developer-clamp lesson (critical)

- If tracks exist (e.g., business vs developer), **score and select within each track separately**.
- If you filter the whole list by raw impressions, one high-volume track (say, developer API questions) will flood the queue and starve the other track.
- Implementation: run the batch selector per track with per-track caps: e.g., `business: 7`, `developer: 3`.

## 5. Question formation

- Convert the keyword into a natural question: "car rental miami" → "How much does it cost to rent a car in Miami?"
- Only queue questions with real search existence (from GSC/competitor research) — do not invent topics from thin air.

## 6. Push to queue

Insert docs into `blog_questions` with:

- `question`, `slug`, `track`, `source: "gap" | "gsc"`, `priority`, `metadata` (clicks/impressions/position for the writer's research step).

## 7. Dedup

- Normalize (lowercase, trim) and compare against existing queued/published questions.
- Skip if already covered (use a normalized-question index).

## 8. Cadence

- Weekly batch is enough for a new site; adjust to queue drain rate (if queue empties before next batch, increase).

## 9. Flow

```
keyword map + GSC rows
   → gaps (per track)
   → score + cap per track
   → form questions
   → dedup vs queue
   → insert (source=gap/gsc)
   → writer consumes next cycle
```
