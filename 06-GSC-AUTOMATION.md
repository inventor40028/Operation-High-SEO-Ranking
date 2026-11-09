# 06 — GSC Automation

Feed real search data into the system: pulls → keyword map → recommendations → queue.

## 1. Service account setup (once)

1. Google Cloud Console → create project (or use existing).
2. Enable **Search Console API**.
3. IAM & Admin → Service Accounts → Create service account → add key (JSON) → download once, keep secret (env: `GSC_SERVICE_ACCOUNT`).
4. Search Console → property → Settings → Users & permissions → add the service account email (permissions: full).
5. Property type: use a **domain property** (DNS TXT) when possible so all subdomains are covered; URL-prefix only covers one origin.

## 2. API pull script

Generic template: `10/gsc_pull_template.mjs`. Behavior:
- Build JWT from the service-account key (scopes: `https://www.googleapis.com/auth/webmasters.readonly`).
- `sites.list` → confirm property exists.
- `searchanalytics.query`:
  - body: startDate/endDate (rolling window), `dimensions: ["query","page"]`, `rowLimit: 250`, `type: "web"`.
- Output CSV rows: `date,keyword,page,clicks,impressions,ctr,position`.
- Store state: last pull date (save in DB/D1/SQLite, not KV — see pitfalls).

## 3. Scheduling

| Cadence | What |
|---|---|
| Daily (e.g., `0 4 * * *`) | pull last 7 days of clicks/impressions |
| Weekly | generate page-2→1 recommendations + export keyword map |
| Monthly | refresh full keyword map, check coverage |

## 4. Keyword map CSV

Columns (header template in `10/keyword_map_schema.csv`):

```
keyword,url,intent,volume,clicks,impressions,ctr,position,target_track,notes
```

- `intent`: informational | transactional | commercial | navigational.
- `target_track`: which blog track owns this keyword.
- `notes`: e.g., "page 2 candidate" or "money page".

## 5. Page 2 → page 1 recommendations (weekly)

For each query with:
- `position` between **8 and 20** (page 2 / bottom of page 1), and
- `impressions` above a minimum threshold (e.g., 1,000), and
- the landing page is weak or missing:

Recommend one of:
- **Improve** the existing page (add sections, schema, internal links).
- **Create** a new page/post targeting it (→ push into the blog queue with `source=gsc`).
- **Fix** technical blockers (canonical/indexing).

Output format: markdown table (see `10/seo_report_template.md`).

## 6. Provider of truth / state

- Store the keyword map in the repo (`seo/keyword_map.csv`) and/or in the DB.
- Never derive "today's data" from a cache older than 24h.

## 7. API limits & etiquette

- Search Console API quotas are generous at this volume; still, cache daily pulls.
- If using manual CSV: GSC export UI → save to `seo/gsc_export.csv`, same columns.
- Handle empty results gracefully (writer no rows → log, do not error the whole job).

## 8. Reporting

Weekly report (template `10/seo_report_template.md`): clicks/impressions/position trends, new indexed pages, page-2 list, actions for the week.
