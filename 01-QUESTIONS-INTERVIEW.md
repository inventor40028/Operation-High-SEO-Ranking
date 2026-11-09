# 01 — Questions the AI MUST Ask First

Do NOT build anything before the user has answered these. Record answers in `BRIEF.md` at your project root. If an answer is missing, ask again — guessing here causes rebuilds.

## A. Business

1. What does the business do, in one sentence? (e.g., "car rentals in Miami")
2. What products/services does it sell? List the top 5 with prices if public.
3. Who is the target customer? (age, role, location, language)
4. What are the 3 main keywords a customer would type to find this business?
5. Who are the top 3 competitors? Give their URLs.
6. What makes this business different from competitors?
7. What is the #1 business goal for SEO? (leads, bookings, ad-free organic traffic, brand)

## B. Site

8. What is the site URL (including http vs https, www or not)?
9. What platform/CMS is it built with? (WordPress, Shopify, Next.js, plain HTML, Webflow, other)
10. What hosting provider? (Vercel, Cloudflare, Netlify, Firebase, cPanel, AWS, other)
11. Does it already have a blog, and how many posts?
12. Does it have a sitemap? Any `robots.txt` already?
13. Is there analytics? (Google Analytics 4? Google Search Console already connected?)
14. Are there existing pages that must be protected from indexing? (dashboards, admin, member areas)

## C. Existing server / backend

15. Is there an existing backend/server/API? What language/runtime? (Node, Python, PHP, static-only, none)
16. If static-only: where does it host? Can a small API run elsewhere (Workers/functions) without touching it?
17. Who controls DNS? Can subdomains like `api.{SITE_URL}` be added?
18. Is there a database in use? (Firestore, Postgres, MySQL, SQLite/D1, none)

## D. Existing AI

19. Which AI providers does the user already have API keys for? (OpenAI, Anthropic, Google Gemini, others — or inceptions)
20. Are they willing to pay for API usage? What is the monthly budget for AI + infra?
21. If no keys: are they OK with free-tier providers only?
22. **Security rule:** Never ask the user to paste a key into chat. Keys go into environment variables, e.g., `{AI_API_KEY_ENV}`, set by the user themselves.

## E. Data sources

23. Google Search Console: can they log in? Is the property **domain** (DNS-verified) or **URL-prefix**?
24. Can they create a Google service account (Cloud Console access), or must we use manual CSV export only?
25. Do they have existing keyword lists, search data, or past blog analytics?
26. Are there customer interviews, FAQs, or support tickets that reveal real questions?
27. Do they have a budget for tools (Ahrefs/Semrush) or do we use free GSC data only?

## F. Process / approvals

28. Who approves published content? (required for human-in-the-loop)
29. How often can they review? (daily/weekly)
30. Who owns the site's backend credentials (and can the agent get env access safely)?
31. Are they OK with a cron publishing automatically at a daily cap, or must every post be human-approved first?

## Output

Store answers as a `BRIEF.md` file. Then proceed to `02-ADAPTIVE-STACK.md`. If any "must-ask" is unanswered, stop and re-ask — do not assume.
