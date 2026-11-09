# 04 — AI-Search SEO

What to publish and how to structure it so both **search engines** and **AI assistants** understand the site.

## 1. llms.txt

Purpose: a plain-text index that AI crawlers (Claude, ChatGPT, etc.) read to understand your site.

- Location: `https://{SITE_URL}/llms.txt`
- Format (see `10/llms_template.txt`):
  - Line 1: title `# {BUSINESS}`
  - Line 2: one-line description prefixed with `>`
  - `##` section headers (Company, Products, Docs, Blog)
  - Markdown links with absolute URLs
- Keep it short (top ~20 URLs); link to full pages rather than duplicating content.
- Update when pages are added/removed.

## 2. robots.txt — AI crawler rules

- Keep **Googlebot allowed** (indexing intact).
- Decide per bot whether to allow public content. Common policy: allow public pages, disallow `/dashboard/`, `/api/`, auth pages.
- If you want to block AI bots entirely, `Disallow: /` for their UA — but note Google-Extended is separate from Googlebot (blocking it doesn't hurt Google Search).
- Template in `10/robots_ai_template.txt`; include `Sitemap:` line.

## 3. JSON-LD structured data

### Article (each blog post)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{TITLE}",
  "description": "{META_DESCRIPTION}",
  "datePublished": "{ISO_DATE}",
  "dateModified": "{ISO_DATE}",
  "author": { "@type": "Organization", "name": "{BUSINESS}" },
  "image": "https://{SITE_URL}/images/{POST_SLUG}-og.png",
  "mainEntityOfPage": "https://{SITE_URL}/blog/{POST_SLUG}"
}
```

### FAQPage (only if the page really contains those Q&As)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "{Q}",
      "acceptedAnswer": { "@type": "Answer", "text": "{A}" } }
  ]
}
```
Rule: never mark up questions that aren't visibly on the page (Google can penalize).

## 4. Canonical & redirect rules

- Every public page has exactly **one** `rel="canonical"` pointing to itself.
- No two pages may carry the same canonical (fix "alternate canonical" GSC warnings).
- Legacy URLs: 301 → new equivalent (verify with `curl -sI`).
- `/index.html` → `/` or chosen homepage; avoid duplicate home variants.

## 5. noindex for app surfaces

- Dashboards, settings, checkout, admin, empty states, paywalled content → `<meta name="robots" content="noindex">` or `Disallow` in robots.
- Keep them out of the index to protect crawl budget.

## 6. OG images

- Generate a default social image per post at publish time (1200×630 PNG).
- Add `og:image`, `og:title`, `og:description`, `twitter:card`, `twitter:image`.
- Caching: invalidate when the post changes.

## 7. Sitemap regeneration

- On every publish/edit: regenerate `sitemap.xml` (URL + lastmod).
- Ensure only 200-OK, indexable URLs appear; no noindex/redirect URLs.
- Submit in GSC (API `sitemaps.submit` if available, else manual).
- Reference the sitemap in robots.txt.

## 8. Verification checklist (quick)

- [ ] `https://{SITE_URL}/llms.txt` returns 200 text/plain
- [ ] robots.txt has Sitemap line, Googlebot allowed
- [ ] Every post has Article JSON-LD (validate with schema validator)
- [ ] Canonicals unique and self-referential
- [ ] Dashboard/app pages noindex
- [ ] Sitemap regenerated and submitted
