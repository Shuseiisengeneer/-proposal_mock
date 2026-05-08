# API Integration Cheatsheet

Quick reference for free / freemium APIs I reach for when building SaaS MVPs in 2026. Personal notes — biased toward what plays well with Bubble's API Connector. All pricing and free-tier numbers verified May 2026; check vendor docs before shipping.

---

## Quick Decision Tree

- Need **AI text** (creative, reasoning, structured output)? → **Anthropic Claude** (Sonnet 4.5 default; Opus 4.7 for hardest tasks)
- Need **AI text** (cheap, parsing, classification)? → **OpenAI GPT-4.1-mini** or **Google Gemini 2.5 Flash**
- Need **embeddings**? → **OpenAI text-embedding-3-small** ($0.02/1M tokens, 1536 dims)
- Need **image generation**? → **Replicate** (Flux Schnell for fast, SDXL for tweakable)
- Need **maps display**? → **Mapbox** (free up to 50k loads/mo) or **OpenStreetMap tiles**
- Need **geocoding** (address → lat/long)? → **Nominatim** (free, attribution required) or **Mapbox Geocoding**
- Need **POI / "find nearby" data**? → **Overpass API** (OpenStreetMap, free)
- Need **weather**? → **Open-Meteo** (free, no key, no rate limit nightmare)
- Need **encyclopedia content**? → **Wikipedia REST API**
- Need **structured facts** (population, dates, IDs)? → **Wikidata SPARQL**
- Need **stock photos**? → **Unsplash API**
- Need **transactional email**? → **Postmark** (best deliverability) or **Resend** (best DX); **SendGrid** if forced
- Need **payments**? → **Stripe** (no real competition for SaaS)
- Need **bot/spam protection**? → **Cloudflare Turnstile** (free, no privacy headaches)

---

## AI APIs

### Anthropic Claude

- **Base URL:** `https://api.anthropic.com/v1/messages`
- **Auth:** API key in `x-api-key` header + required `anthropic-version: 2023-06-01` header
- **Free tier:** $5 trial credit on signup; no perpetual free tier
- **2026 pricing (per 1M tokens):** Sonnet 4.5 — $3 in / $15 out; Haiku 4.5 — $1 in / $5 out; Opus 4.7 — $15 in / $75 out
- **Common gotchas:**
  - Must set `max_tokens` (it's required, not optional)
  - System prompt is a top-level field, not a message role
  - Response object structure is `content[0].text` (Bubble cannot directly map nested arrays without enabling "Capture response headers")
  - Rate limits are per-minute and per-day; tier 1 is generous but watch TPM on bursty workloads
- **Bubble note:** Add as JSON body type, mark prompt and system as `<dynamic>`, and check "Include errors in response and allow workflow actions to continue" so you can show your own error UI.

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 1024,
    "system": "You are concise.",
    "messages": [{"role": "user", "content": "Summarize TCP."}]
  }'
```

```json
{
  "id": "msg_01AbcD...",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-5-20250929",
  "content": [{ "type": "text", "text": "TCP is..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 12, "output_tokens": 87 }
}
```

### OpenAI

- **Base URL:** `https://api.openai.com/v1/chat/completions`
- **Auth:** `Authorization: Bearer <key>` header
- **Free tier:** No free tier as of 2026; $5 minimum top-up
- **2026 pricing (per 1M tokens):** GPT-4.1 — $2 in / $8 out; GPT-4.1-mini — $0.15 in / $0.60 out; text-embedding-3-small — $0.02
- **Common gotchas:**
  - `response_format: { type: "json_schema" }` is now the only sane way to get structured output
  - Token counts include reasoning tokens for o-series models — easy to over-spend
  - Org IDs required if you have multiple orgs (`OpenAI-Organization` header)
- **Bubble note:** GPT-4.1-mini is the workhorse for parsing/classification. Use Claude Sonnet for anything that needs reasoning.

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [{"role":"user","content":"Hello"}],
    "max_tokens": 200
  }'
```

```json
{
  "id": "chatcmpl-9...",
  "model": "gpt-4.1-mini",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "Hi! ..." },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 8, "completion_tokens": 12, "total_tokens": 20 }
}
```

### Google Gemini

- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
- **Auth:** `?key=<API_KEY>` query param (yes, in the URL — fine for server-side)
- **Free tier:** Genuinely free at low volume — Gemini 2.5 Flash gives 15 RPM / 1M TPM / 1500 RPD free
- **2026 pricing (per 1M tokens):** Gemini 2.5 Flash — $0.30 in / $2.50 out; Gemini 2.5 Pro — $1.25 in / $10
- **Common gotchas:**
  - Request schema is different (`contents` not `messages`)
  - Safety filters are aggressive — non-English content sometimes blocked unexpectedly
  - Free-tier requests may be used for training unless you're on paid tier
- **Bubble note:** The free tier is the only meaningful free LLM tier in 2026. Use it for non-sensitive tasks (public-facing content gen) to keep costs at zero pre-revenue.

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "contents": [{ "parts": [{ "text": "Explain DNS in one sentence." }] }] }'
```

```json
{
  "candidates": [{
    "content": { "parts": [{ "text": "DNS translates domain names..." }], "role": "model" },
    "finishReason": "STOP"
  }],
  "usageMetadata": { "promptTokenCount": 8, "candidatesTokenCount": 22 }
}
```

### Replicate

- **Base URL:** `https://api.replicate.com/v1/predictions`
- **Auth:** `Authorization: Token <key>` header (note: `Token`, not `Bearer`)
- **Free tier:** No real free tier; pay-per-second of GPU. Flux Schnell ~$0.003/image; SDXL ~$0.0023/image
- **Common gotchas:**
  - Output URLs **expire in ~24 hours** — always download and re-host
  - Cold start can be 30-90s on uncommon models; popular models are warm
  - `version` field is the model version hash, not a name (look it up in their UI)
  - Use webhooks (`webhook` field) instead of polling for anything >10s
- **Bubble note:** Set up a backend workflow to receive Replicate's webhook callback. See bubble-ai-integration-patterns.md Pattern 9.

```bash
curl https://api.replicate.com/v1/predictions \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    "input": { "prompt": "an isometric office, soft light", "width": 1024, "height": 1024 }
  }'
```

```json
{
  "id": "ufawqhfynnddngldkgtslldrkq",
  "status": "starting",
  "urls": {
    "get": "https://api.replicate.com/v1/predictions/ufawqhfynnddngldkgtslldrkq",
    "cancel": "https://api.replicate.com/v1/predictions/ufawqhfynnddngldkgtslldrkq/cancel"
  }
}
```

---

## Geo / Maps

### OpenStreetMap — Nominatim (Geocoding)

- **Base URL:** `https://nominatim.openstreetmap.org/search`
- **Auth:** None
- **Free tier:** Unlimited *with* attribution and a real `User-Agent`. Hard rate limit: **1 request per second**.
- **Common gotchas:**
  - **Must set a descriptive User-Agent** with contact email or your IP gets banned
  - 1 req/sec is enforced strictly — for higher volume, host your own Nominatim or pay for a hosted instance ($30-100/mo)
  - Attribution required: "© OpenStreetMap contributors" in your UI
  - CORS: works from browser but you should proxy server-side anyway
- **Bubble note:** Add `User-Agent: YourApp/1.0 (you@email.com)` as a shared header. Bubble strips some User-Agent headers — verify with a request bin.

```bash
curl "https://nominatim.openstreetmap.org/search?q=Big+Ben&format=json&limit=1" \
  -H "User-Agent: MyApp/1.0 (me@example.com)"
```

```json
[{
  "place_id": 297014158,
  "lat": "51.5007292",
  "lon": "-0.1246254",
  "display_name": "Big Ben, Bridge Street, ...",
  "type": "clock"
}]
```

### OpenStreetMap — Overpass (POI / Spatial Queries)

- **Base URL:** `https://overpass-api.de/api/interpreter`
- **Auth:** None
- **Free tier:** Free with fair-use; complex queries may time out (default 25s, max 180s)
- **Common gotchas:**
  - Query language (Overpass QL) is its own thing — not SQL, not GraphQL. Learn the basics or use Overpass Turbo to prototype.
  - Public instance is shared globally — slow at peak hours. For production, mirror to your own instance.
  - Returns can be large (megabytes). Always set `[out:json][timeout:25]` headers in the query.

```bash
curl -X POST https://overpass-api.de/api/interpreter \
  --data-urlencode 'data=[out:json][timeout:25];
node["amenity"="cafe"](around:500,51.5074,-0.1278);
out body;'
```

```json
{
  "version": 0.6,
  "elements": [
    { "type": "node", "id": 12345, "lat": 51.5079, "lon": -0.128,
      "tags": { "amenity": "cafe", "name": "Joe's Coffee" } }
  ]
}
```

### Mapbox

- **Base URL:** `https://api.mapbox.com` (geocoding at `/geocoding/v5/mapbox.places/<query>.json`)
- **Auth:** `?access_token=<token>` query param
- **Free tier:** Generous — 50k map loads/mo, 100k geocoding requests/mo, 100k directions requests/mo
- **2026 pricing past free tier:** $5 per 1k map loads (cheap until you scale)
- **Common gotchas:**
  - Public tokens (`pk.`) are safe in browser; secret tokens (`sk.`) are server-only — don't mix them up
  - Token URL restrictions exist — set them up before launch
  - Vector tiles look amazing but customizing the style is a rabbit hole
- **Bubble note:** Use the Mapbox Bubble plugin (community-maintained) for embedded maps; use the API Connector for geocoding/directions.

```bash
curl "https://api.mapbox.com/geocoding/v5/mapbox.places/london.json?access_token=$MAPBOX_TOKEN&limit=1"
```

```json
{
  "type": "FeatureCollection",
  "features": [{
    "id": "place.9700",
    "place_name": "London, England, United Kingdom",
    "center": [-0.1275, 51.5072],
    "place_type": ["place"]
  }]
}
```

### Open-Meteo (Weather)

- **Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None
- **Free tier:** 10,000 requests per day, no key needed, for non-commercial use; commercial tier from €29/mo
- **Common gotchas:**
  - Must pass `latitude` and `longitude` (geocode separately if you have an address)
  - Time zones default to GMT — pass `timezone=auto` or specify
  - "Free for non-commercial" — read their commercial license if you charge for the product
- **Bubble note:** No auth, no key, no headers. The simplest API on this page. Just GET and parse.

```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.13&current=temperature_2m,weather_code&timezone=auto"
```

```json
{
  "latitude": 51.5,
  "longitude": -0.13,
  "timezone": "Europe/London",
  "current": {
    "time": "2026-05-08T14:00",
    "temperature_2m": 17.4,
    "weather_code": 3
  }
}
```

---

## Knowledge / Content

### Wikipedia REST API

- **Base URL:** `https://en.wikipedia.org/api/rest_v1` (page summaries: `/page/summary/<title>`)
- **Auth:** None, but set a descriptive User-Agent
- **Free tier:** Unlimited within fair use
- **Common gotchas:**
  - Article titles are URL-encoded; spaces become underscores: `Albert_Einstein`
  - Disambiguation pages return as articles — check the `type` field
  - Use the `extract` field for short summaries; full HTML available via `/page/html/<title>` if you need it
- **Bubble note:** Set User-Agent header per Wikimedia API policy.

```bash
curl "https://en.wikipedia.org/api/rest_v1/page/summary/Bubble_(programming_environment)" \
  -H "User-Agent: MyApp/1.0 (me@example.com)"
```

```json
{
  "title": "Bubble (programming environment)",
  "extract": "Bubble is a visual programming language and application development platform...",
  "thumbnail": { "source": "https://upload.wikimedia.org/...", "width": 320 },
  "content_urls": { "desktop": { "page": "https://en.wikipedia.org/wiki/..." } }
}
```

### Wikidata SPARQL

- **Base URL:** `https://query.wikidata.org/sparql`
- **Auth:** None, but User-Agent required
- **Free tier:** Free, fair-use; queries timing out >60s get killed
- **Common gotchas:**
  - SPARQL has a learning curve — use the query builder UI to prototype
  - Massive queries get throttled; add `LIMIT` always
  - Results in JSON via `?format=json`
  - Entity IDs (`Q42`, `P31`) are the keys — title strings change, IDs don't

```bash
curl -G "https://query.wikidata.org/sparql" \
  --data-urlencode 'query=SELECT ?country ?countryLabel ?pop WHERE {
    ?country wdt:P31 wd:Q6256; wdt:P1082 ?pop.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } ORDER BY DESC(?pop) LIMIT 5' \
  -H "Accept: application/json" \
  -H "User-Agent: MyApp/1.0 (me@example.com)"
```

```json
{
  "results": {
    "bindings": [
      { "country": { "value": "http://www.wikidata.org/entity/Q148" },
        "countryLabel": { "value": "China" },
        "pop": { "value": "1411778724" } }
    ]
  }
}
```

### Unsplash

- **Base URL:** `https://api.unsplash.com`
- **Auth:** `Authorization: Client-ID <access_key>` header
- **Free tier:** 50 requests/hour (Demo); 5,000/hour after Production approval (free, takes a couple of days)
- **Common gotchas:**
  - Attribution required: "Photo by [Photographer] on Unsplash" with links — non-negotiable for free tier
  - Must trigger a download endpoint when a user "uses" a photo (analytics requirement, free)
  - Hotlinking the `urls.regular` is fine; downloading and re-hosting requires the trigger ping
- **Bubble note:** Cache search results aggressively — 50/hour limit is easy to hit during dev.

```bash
curl "https://api.unsplash.com/search/photos?query=mountain&per_page=3" \
  -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY"
```

```json
{
  "total": 12345,
  "results": [{
    "id": "abc123",
    "urls": {
      "regular": "https://images.unsplash.com/photo-...",
      "thumb": "https://images.unsplash.com/photo-..."
    },
    "user": { "name": "Jane Doe", "links": { "html": "https://unsplash.com/@jane" } },
    "links": { "download_location": "https://api.unsplash.com/photos/abc123/download" }
  }]
}
```

---

## Utility

### Postmark (Transactional Email — recommended over SendGrid)

- **Base URL:** `https://api.postmarkapp.com/email`
- **Auth:** `X-Postmark-Server-Token: <token>` header
- **Free tier:** 100 free emails/mo (just for testing); paid starts $15/mo for 10k
- **Common gotchas:**
  - Must verify sender signature or domain before any production sending
  - Best deliverability of any provider in 2026 — worth the price
  - Templates are nice; use them with `TemplateAlias` and a JSON model
- **Bubble note:** Use a separate Postmark "server" for transactional vs broadcast — keeps reputation clean.

```bash
curl https://api.postmarkapp.com/email \
  -H "Accept: application/json" \
  -H "X-Postmark-Server-Token: $POSTMARK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "From": "you@yourapp.com",
    "To": "user@example.com",
    "Subject": "Welcome",
    "TextBody": "Hi there!",
    "MessageStream": "outbound"
  }'
```

```json
{
  "To": "user@example.com",
  "SubmittedAt": "2026-05-08T10:00:00Z",
  "MessageID": "abcde-12345-...",
  "ErrorCode": 0,
  "Message": "OK"
}
```

### SendGrid

- **Base URL:** `https://api.sendgrid.com/v3/mail/send`
- **Auth:** `Authorization: Bearer <api_key>` header
- **Free tier:** 100 emails/day forever (decent for tiny apps), paid from $20/mo
- **Common gotchas:**
  - Deliverability is mediocre — many transactional emails land in spam without serious DKIM/SPF setup
  - Sender authentication mandatory (domain auth, not single-sender, for any volume)
  - Webhook for events (delivered, bounced) requires HTTPS endpoint with TLS 1.2+
- **Bubble note:** Use only if Postmark/Resend aren't options. The free tier is the main reason to choose it.

```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{ "to": [{ "email": "user@example.com" }] }],
    "from": { "email": "you@yourapp.com" },
    "subject": "Hi",
    "content": [{ "type": "text/plain", "value": "Hello!" }]
  }'
```

```
HTTP/1.1 202 Accepted
X-Message-Id: abc...
```

### Stripe

- **Base URL:** `https://api.stripe.com/v1`
- **Auth:** `Authorization: Bearer <secret_key>` (form-encoded, not JSON, for most endpoints)
- **Free tier:** Pay per transaction (2.9% + $0.30 in US, varies by region). No monthly fee.
- **Common gotchas:**
  - Most endpoints accept `application/x-www-form-urlencoded`, not JSON
  - **Always verify webhook signatures** with `Stripe-Signature` header
  - Test mode and live mode have separate keys, separate dashboards, separate everything — easy to deploy with the wrong one
  - Idempotency keys for retries (`Idempotency-Key` header) — non-optional for production
- **Bubble note:** Use Stripe Checkout for the actual payment UI (stripe.com hosts it); use the API for subscriptions, customers, and webhooks. The Bubble Stripe plugin is fine but limited — drop down to the API Connector when you outgrow it.

```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u $STRIPE_SECRET_KEY: \
  -d "mode=subscription" \
  -d "line_items[0][price]=price_1A..." \
  -d "line_items[0][quantity]=1" \
  -d "success_url=https://yourapp.com/success" \
  -d "cancel_url=https://yourapp.com/cancel"
```

```json
{
  "id": "cs_test_a1b2c3...",
  "object": "checkout.session",
  "mode": "subscription",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3...",
  "status": "open"
}
```

### Cloudflare Turnstile (Free CAPTCHA)

- **Base URL:** `https://challenges.cloudflare.com/turnstile/v0/siteverify` (server-side validation)
- **Auth:** Secret key in form body
- **Free tier:** Unlimited, free forever
- **Common gotchas:**
  - Two keys: site key (public, in HTML) and secret key (server-only, for verify)
  - The widget must be embedded via `<script>` from `https://challenges.cloudflare.com/turnstile/v0/api.js`
  - Token is single-use; verify server-side immediately, don't reuse
  - "Invisible" mode works but feels weird for trust signals — managed mode is the default for a reason
- **Bubble note:** Embed the widget in an HTML element on the form page, capture the response token via JS-to-Bubble bridge, validate server-side via API Connector. The "Cloudflare Turnstile" plugin in the Bubble marketplace handles the JS bridge for you.

```bash
curl -X POST https://challenges.cloudflare.com/turnstile/v0/siteverify \
  -d "secret=$TURNSTILE_SECRET" \
  -d "response=$TOKEN_FROM_WIDGET" \
  -d "remoteip=$USER_IP"
```

```json
{
  "success": true,
  "challenge_ts": "2026-05-08T12:00:00.000Z",
  "hostname": "yourapp.com",
  "action": "signup",
  "cdata": ""
}
```

---

## API Connector Defaults (Bubble)

When adding any of the above to Bubble's API Connector, my standard config:

- **Authentication:** "None or self-handled" (manage keys manually via shared headers — easier debugging)
- **Shared headers:** Auth header + Content-Type + User-Agent (where required)
- **Body type:** JSON unless the API specifically wants form-encoded (Stripe)
- **Capture response headers:** Yes (rate-limit headers tell you when you're about to be throttled)
- **Include errors in response:** Yes (so workflows can branch on error vs success)
- **Timeout:** 30s default; raise to 90-120s for AI image generation; webhook back for anything longer
- **Mark dynamic:** Wrap any user-input field with `<param>` and tick "Allow blank" only if optional

---

## What I Don't Use (and why)

- **Twilio** for SMS — expensive, regulatory pain. Use messaging-channel-specific (WhatsApp Business API, Telegram bots) when feasible.
- **Auth0** — overkill for SaaS MVPs; Bubble's built-in auth + a Stripe gate handles 95% of cases.
- **Algolia** — gorgeous, but $1/1k searches gets pricey fast. Postgres full-text or Meilisearch (self-hosted) covers most needs.
- **Pinecone / Weaviate** — at MVP scale, embed in your DB (see RAG pattern in bubble-ai-integration-patterns.md). Graduate when you outgrow it.
- **AWS SDK** anything — too much YAK shaving for an MVP. Cloudflare R2 + Workers does 90% of what people use AWS for, with simpler billing.
