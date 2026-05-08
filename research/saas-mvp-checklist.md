# SaaS MVP Launch Checklist

A practical, opinionated checklist for shipping a SaaS MVP as a solo founder. Built from running ~15 launches; biased toward Bubble + AI builds, but most items apply to any stack. Updated May 2026.

This is the "if I'm not embarrassed by my launch, I shipped too late — but also if any of these are missing, I'm just embarrassed" list. Skip with intent, not by accident.

---

## Tech

The plumbing. Most of these take an hour or less individually; together they're 2-3 weeks if you're starting from zero.

- [ ] Domain registered (Porkbun or Cloudflare Registrar — never GoDaddy)
- [ ] DNS pointed at app host (A/CNAME), MX records to email provider, SPF + DKIM + DMARC for deliverability
- [ ] SSL certificate active and auto-renewing (Bubble does this; verify HTTPS redirect is on)
- [ ] Hosting / app live on production URL (not `myapp.bubbleapps.io` — use a real domain)
- [ ] Subdomain strategy decided (`app.` for product, `www.` for marketing) and both work
- [ ] Email signup flow with confirmation email
- [ ] Login flow (email + password, social-OAuth optional but Google login is table-stakes in 2026)
- [ ] Forgot-password flow with token expiry (15-60 min)
- [ ] Logout works and clears session everywhere
- [ ] Database schema reviewed: every table has `created_at`, `updated_at`, `created_by` and proper privacy rules
- [ ] Soft-delete (`deleted_at`) on user-facing tables, not hard delete
- [ ] Stripe account in live mode, products + prices created
- [ ] Stripe Checkout (or Payment Element) integrated end-to-end with at least one successful test purchase
- [ ] Stripe webhook receiver deployed and verified (signature check!) — handle `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`
- [ ] Customer portal URL wired up so users can cancel without emailing you
- [ ] Transactional email provider connected (Postmark or Resend; SendGrid if you must)
- [ ] Email templates: welcome, password reset, payment receipt, subscription cancelled, payment failed
- [ ] Admin panel / "god mode" — at minimum, a hidden page where you can search users, impersonate, comp a subscription, and refund
- [ ] Error monitoring (Sentry free tier — 5k events/mo is plenty pre-PMF)
- [ ] Analytics events instrumented (PostHog free tier; track signup, activation, key feature use, paywall view, paywall convert)
- [ ] Backup strategy: nightly DB export to S3/R2, retained 30 days minimum (Bubble has built-in but verify)
- [ ] GDPR cookie banner if you take any EU traffic (Cookiebot free tier or self-rolled)
- [ ] Status page (BetterStack free tier) on `status.yourdomain.com` — a 5-minute job that buys you legitimacy
- [ ] Rate limiting on expensive endpoints (especially anything that calls a paid AI API)
- [ ] Health check endpoint returning 200 + DB ping

**Defaults I use in 2026:** Bubble for UI/workflow, Cloudflare Workers for any custom backend, Postmark for email, Stripe for payments, PostHog for analytics, Sentry for errors, BetterStack for uptime/status.

---

## Design

Don't gold-plate. Aim for "trustworthy and unfussy." A clean Tailwind look beats a half-finished custom design every time.

- [ ] Logo (text-only is fine; Inter or Space Grotesk + a single accent color will get you 90% there)
- [ ] Favicon (PNG + ICO, all sizes — use realfavicongenerator.net)
- [ ] Color tokens documented (primary, secondary, accent, neutral 50-900, success, warning, error) — pick from Tailwind palette and stop
- [ ] Typography pair chosen (one display, one body — e.g. Inter + Inter, or Space Grotesk + Inter)
- [ ] Landing page hero (one-sentence value prop + sub-headline + CTA + screenshot/loom thumbnail)
- [ ] Pricing page (2-3 tiers max; annual toggle saves 20%; "Most popular" badge on middle tier)
- [ ] Footer with: nav links, social, legal links, status page, copyright
- [ ] 404 page with a link home and a touch of personality
- [ ] 500 / error page that doesn't leak a stack trace
- [ ] Social share image (1200x630 PNG, includes logo + tagline) referenced in OG tags
- [ ] Twitter card meta tags (`summary_large_image`)
- [ ] Loading states on every async action — skeletons or spinners, never frozen UI
- [ ] Empty states with helpful copy ("Nothing here yet. Create your first X →")
- [ ] Mobile responsive: test at 375px, 768px, 1280px minimum
- [ ] Brand guidelines doc (single page Notion or Figma — colors, fonts, voice, do/don'ts) so future you stays consistent

---

## Marketing

The part most builders dread. Half this list is "do it once and forget it."

- [ ] Product Hunt account warmed up (post comments for 2 weeks before your launch)
- [ ] BetaList submission queued (free tier takes 4-8 weeks; paid jumps to 2 weeks)
- [ ] Hacker News "Show HN" post drafted (title formula: `Show HN: [Product] – [one-line value prop]`)
- [ ] Indie Hackers profile + product page filled out
- [ ] Reddit: identified 2-3 subreddits where your audience hangs out, lurked for 2 weeks, posted helpfully (not promotionally) at least 3 times
- [ ] X / Twitter account active (handle matches brand, bio + pinned tweet, posting at least 3x/week)
- [ ] LinkedIn personal profile updated to mention the project; company page created
- [ ] Waitlist landing page live BEFORE the product (collect emails for 4-8 weeks pre-launch)
- [ ] Founder story written — why you, why this, why now (publish on landing + LinkedIn + X thread)
- [ ] Demo video, 60-90 seconds, screen recording with voiceover (Loom or Screen Studio)
- [ ] One real case study or testimonial (yes, even with 1 user — quote them, use their name with permission)
- [ ] SEO basics: title tags + meta descriptions on every public page, not duplicates
- [ ] sitemap.xml generated and submitted to Google Search Console
- [ ] robots.txt configured (disallow `/admin`, `/api`, version-test paths)
- [ ] Google Search Console + Bing Webmaster verified
- [ ] Email capture before launch (waitlist form on landing — ConvertKit free tier or Bubble DB)
- [ ] Welcome email sequence drafted (4-7 emails: welcome, problem framing, your story, social proof, soft CTA, hard CTA, "still here?")
- [ ] Referral mechanism designed (even a simple "share this link, get 1 free month" beats nothing)
- [ ] Swag idea (sticker pack via Sticker Mule for top 50 paying customers — cheap delight)
- [ ] Press kit page (logo PNG + SVG, screenshots, founder photo, one-paragraph bio) — saves time when journalists ask

**Realistic expectation in 2026:** Product Hunt #1-#5 of the day gets ~500-2000 visits. Show HN front page gets ~5-15k. Your waitlist + email is more durable than either.

---

## Legal

The boring section that protects your house. Don't skip it. Do skip "talking to a lawyer first" — use templates and review later.

- [ ] Terms of Service (use Termly, GetTerms, or steal a comparable startup's and edit — have a lawyer review at >$10k MRR, not before)
- [ ] Privacy Policy (must list every third-party processor: Stripe, Postmark, PostHog, OpenAI, etc.)
- [ ] Cookie Policy (if you have EU traffic and use any non-strictly-necessary cookies)
- [ ] Refund Policy (mine: "30 days, no questions, just email" — worth it for trust)
- [ ] Acceptable Use Policy if you have user-generated content
- [ ] Business entity formed (US: LLC via Stripe Atlas if non-US, or Northwest/LegalZoom if US; UK: Ltd via Companies House for ~£12)
- [ ] EIN / Tax ID obtained
- [ ] Business bank account separate from personal (Mercury for US LLCs, Wise for international)
- [ ] Accounting tool set up from day one (Wave free, Xero, or QuickBooks) — categorize Stripe payouts, AI API bills, hosting
- [ ] Sales tax / VAT registration if required (Stripe Tax handles collection automatically — register where you owe; threshold varies by jurisdiction)
- [ ] DPA (Data Processing Agreement) template ready to send to enterprise prospects who ask
- [ ] Copyright notice in footer ("© 2026 YourCo")
- [ ] DMCA contact email if you host user content
- [ ] Trademark search done on your name (free at uspto.gov) before printing swag

---

## Day 1 / Week 1 / Month 1 — Quick Prioritization

If you're staring at this list paralyzed, here's the order I'd actually do it.

### Day 1 (today)

- [ ] Domain registered + DNS pointed at hosting
- [ ] Email signup + login + password reset working
- [ ] Stripe in live mode with one product/price
- [ ] Privacy Policy + ToS pages exist (template-filled, 30 minutes total)
- [ ] Transactional welcome email firing
- [ ] Sentry installed
- [ ] Landing page hero + CTA live

### Week 1

- [ ] Stripe webhook handling subscription state
- [ ] Pricing page + checkout flow tested end to end
- [ ] PostHog tracking signup → activation → paywall → purchase
- [ ] Admin panel: search users, impersonate, comp/refund
- [ ] Demo video recorded (60s)
- [ ] Waitlist form live, email capture confirmed
- [ ] Status page on subdomain
- [ ] Footer with all legal links + social + status
- [ ] Mobile responsive verified
- [ ] 404 + 500 pages, favicon, OG image

### Month 1

- [ ] Product Hunt launch post drafted, hunters lined up
- [ ] BetaList submitted
- [ ] Founder-story long-form post published (LinkedIn + X thread)
- [ ] First case study / testimonial captured
- [ ] Welcome email sequence (4-7 emails) live
- [ ] Referral mechanism shipped
- [ ] sitemap + robots + Search Console verified
- [ ] Backup strategy verified (do an actual restore test)
- [ ] Business bank account + accounting tool reconciled
- [ ] Brand guidelines doc written

### What I deliberately DON'T do at MVP

- Custom design system (Tailwind UI + a single accent color is enough)
- SOC 2 / ISO compliance (only when enterprise asks)
- Mobile app (responsive web first; native at 1k+ MAU if data supports it)
- Multi-language i18n (one language until you have a market reason)
- Custom dashboard charts (Chart.js or PostHog dashboards embedded)
- Public API (until 3+ paying users specifically request it)
- Affiliate program (referral first; affiliate when CAC math demands it)

---

## Final Heuristic

If a checklist item would take more than half a day, ask: "Will not having this kill my launch?" If no, ship without it. If yes, do the cheapest version that closes the gap. The MVP isn't the smallest product you can build — it's the smallest product that doesn't lose trust the moment someone hands you money.
