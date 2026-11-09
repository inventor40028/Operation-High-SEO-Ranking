# 05 — Technical SEO Checklist (generic)

Based on the GSC indexing fixes applied to Xqivo. Run this on the new site BEFORE pushing content. Each item includes a verification method.

## 1. Soft 404s

**Problem:** pages return HTTP 200 but display "not found / no results" content. Google treats them as thin.
- **Fix:** remove or redirect such pages; ensure real 404s return status 404 (or a proper soft-404 signal).
- **Verify:** `curl -s -o NUL -w "%{http_code}" https://{SITE_URL}/some-missing-page` → expect 404. Grep site for "no results"/"page not found" strings.

## 2. Alternate canonical (duplicate content)

**Problem:** GSC reports "Duplicate without user-selected canonical" — multiple URLs serve identical content.
- **Fix:** pick one canonical URL; add self-referential `rel="canonical"`; 301 variants to the canonical.
- **Verify:** `curl -s -I https://{SITE_URL}/page | findstr /i canonical` → exactly one canonical, pointing to itself.

## 3. noindex dashboard/app pages

**Problem:** login/dashboard/member pages leak into the index.
- **Fix:** add `<meta name="robots" content="noindex">` (or `Disallow` in robots) on all app surfaces.
- **Verify:** fetch each app page, confirm the meta tag or robots rule.

## 4. Legacy redirects

**Problem:** old URLs (from previous site structure) return 404 or point to dead content.
- **Fix:** map old → new, add 301s. Keep a redirect table in the repo.
- **Verify:** `curl -s -I https://{SITE_URL}/old-path` → 301 + `Location:` header.

## 5. Sitemap health

- **Fix:** regenerate; only include 200-OK, indexable URLs.
- **Verify:** parse sitemap, `curl -s -o NUL -w "%{http_code}"` each URL; ensure none are blocked by robots or noindex.

## 6. Titles & meta

- Title ≤ 60 chars, unique per page; meta description ≤ 155 chars; H1 unique per page.
- **Verify:** extract all titles/H1s (custom script or crawl), spot-check duplicates/truncation.

## 7. Internal linking

- Every money/top page is linked from the homepage and from ≥1 blog post.
- Blog posts link to relevant product pages (match audience: business posts → main site pages; dev posts → docs/API).
- **Verify:** `site:{SITE_URL}` in GSC; check top pages have inbound links.

## 8. Core Web Vitals (baseline)

- LCP: hero image sized + `loading="lazy"` for below-fold; avoid huge videos.
- CLS: fixed width/height on media.
- **Verify:** run Lighthouse in Chrome DevTools; aim LCP < 2.5s.

## 9. Indexing requests

- After fixes, use GSC URL Inspection → "Request indexing" on key pages (sitemap resubmit too).
- **Expectation:** index takes 1–4 weeks; new sites have low crawl demand. Don't alarm the client.

## Weekly audit script (pseudo)

```bash
# 1. Pull GSC coverage via API or CSV
# 2. List: Not indexed / Duplicate / Soft 404 / Crawled-never-indexed
# 3. For each fixable bucket, apply the rule above
# 4. Re-request indexing for fixed URLs
```

## Escalation rules

- If a page is "Crawled – currently not indexed" for > 4 weeks with no obvious error → improve content depth (more words, internal links, schema).
- If coverage drops suddenly after a deploy → check robots/canonical changes first.
