# 03 — Blog Engine Spec (generic)

A self-running blog system driven by a question queue. This spec is provider-agnostic.

## 1. Question queue

Table/collection: `blog_questions` (schema in `10/blog_questions_schema.json`).

- Fields: `question`, `slug`, `status`, `track`, `source`, `createdAt`, `publishedAt`, `postId`, `priority`, `metadata`.
- Statuses: `queued → generating → published | failed | skipped`.
- Sources: `manual | gsc | gap | competitor`.

## 2. Track split (configurable)

- Every day has a **post budget** (e.g., `max_posts_per_day = 6`).
- Budget splits across tracks: e.g., `{ business: 4, developer: 2 }`.
- **Each track has its own daily cap.** Lesson: if you only cap the total, one high-demand track silently eats the budget (Xqivo's "developer clamp" problem). Enforce per-track caps in the dequeue query.
- Tracks for a car rental example: `{ customers: 5, fleet_partners: 1 }`.

## 3. Writer pipeline

```
research → outline → structured JSON → humanize → quality gates → publish
```

### 3.1 Research
- Input: the question + optional GSC context (clicks/impressions/position).
- Gather: search intent, competitor answer structure, facts that must be correct (prices, laws, specs).
- Rule: **never let the model invent facts.** Facts come from vetted sources or are flagged for human review.

### 3.2 Structured JSON generation
- Prompt the primary provider to return JSON matching `10/article_json_section_schema.json`:
  - title, slug, description, targetKeyword, audience, internalLinks, sections (heading/body/type).
- Validate JSON with the schema; on invalid → retry once → fallback provider.

### 3.3 Humanize pass
- Rewrite to a helpful, first-person business tone; remove SEO-echo phrasing; add transitions.
- Can be the same provider with a rewrite prompt, or a second provider (cheap one).

### 3.4 Quality gates (all must pass)
1. Length ≥ `min_words` (default 600).
2. ≥ 3 sections, each with heading + body.
3. Keyword appears naturally (not stuffed) in title/description/body.
4. **Fact gate:** no placeholder/obvious hallucination phrases; numbers verified.
5. Uniqueness: new post ≠ existing posts (store embeddings/hash or ask model "is this covered?").
6. Internal links match audience (business post → business/money pages; dev post → docs/API pages).

### 3.5 Publish
- Write the post (MDX file / DB doc / CMS API).
- Regenerate sitemap; submit/refresh in GSC if possible.
- Update queue: status=published, publishedAt, postId.

## 4. Provider fallback chain

```
PRIMARY (e.g., Gemini) → SECONDARY (OpenAI) → TERTIARY (Anthropic)
```
- On any 4xx/5xx/timeout: try next provider with exponential backoff (e.g., 1s, 5s, 30s).
- If all fail: mark `status=failed` with error trace; keep the question in the queue for the next cycle (do NOT drop).
- Never expose keys; providers are selected by env vars (`{AI_API_KEY_ENV}`).

## 5. Run traces

For every writer run, store: `run_id`, `startedAt`, `finishedAt`, `duration_ms`, `posts_published`, `posts_failed`, `provider_used`, `errors[]`, `questions_processed[]`. These power the admin view (`09`) and debugging.

## 6. Content batches

A batch importer (see `07`) adds N questions from keyword gaps + GSC clicks into the queue, tagged with `source` and `track`.

## 7. Scheduling

- Cron expression example: every 6 hours → `0 */6 * * *`.
- The writer endpoint must be protected: require `CRON_SECRET` header, compare with env `CRON_SECRET`.
- Daily cap enforced inside the endpoint (the cron may fire, the system just skips when cap reached).

## 8. API surface (minimal)

| Endpoint | Purpose | Auth |
|---|---|---|
| `POST /api/blog/generate` | Run writer cycle | `CRON_SECRET` |
| `GET /api/blog/queue` | Status (admin) | admin token |
| `POST /api/blog/import` | Add batch | `CRON_SECRET` or admin |
| `POST /api/blog/publish` | Publish a reviewed draft (optional human gate) | admin |
