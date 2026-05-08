# Bubble + AI API Integration Patterns

Personal reference notes on building production-ready AI features in Bubble.io apps. Last reviewed May 2026.

All examples assume Bubble Professional plan or higher (need backend workflows + API workflows). Models referenced: `claude-sonnet-4-5-20250929` and `gpt-4.1-mini` as the 2026 sweet-spot defaults.

---

## Pattern 1: Direct User Input → AI Text Generation

**Use case:** The 80% case. Email writers, blurb generators, "rewrite this", tone changers. User types something, hits a button, sees output within ~3-8 seconds.

**Implementation steps:**

1. API Connector → Add API → name it `Anthropic`.
2. Shared headers: `x-api-key = [your key]`, `anthropic-version = 2023-06-01`, `content-type = application/json`.
3. Add API Call → name `generate_text` → POST to `https://api.anthropic.com/v1/messages`.
4. Body type JSON. Use `<prompt>` and `<system>` as dynamic params.
5. In your workflow: Button click → "Display data in group" → result of `Anthropic – generate_text`'s `content[0].text`.
6. Save the output to a custom state on the page (don't hit the DB unless the user explicitly saves).

**Gotchas:**
- Bubble's API Connector has a **30-second timeout by default**. If your prompt is huge, raise it under "Timeout in seconds" on the call.
- Always set `max_tokens`. Without it some models return verbose junk and burn your budget.
- Use dynamic values (`<param>`) not initialized values for everything user-facing or you'll cache the wrong text in test mode.

**Snippet:**

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 800,
  "system": "<system>",
  "messages": [
    { "role": "user", "content": "<prompt>" }
  ]
}
```

---

## Pattern 2: Streaming Responses (SSE) — Workaround in Bubble

**Use case:** When users get nervous staring at a spinner for >5 seconds. ChatGPT-style typewriter feel.

**The bad news:** Bubble's API Connector cannot natively consume SSE. You have two real options:

1. **Chunked-poll approach:** Server-side proxy (Cloudflare Worker or Vercel function) buffers the stream and Bubble polls every 800ms.
2. **Plugin approach:** Use a community streaming plugin (e.g., "Stream OpenAI to Page" by Zeroqode) that adds a small JS bridge.

**Implementation (chunked-poll, my preferred):**

1. Deploy a tiny Worker that takes a `job_id`, calls Anthropic with stream:true, appends tokens to a KV entry.
2. Bubble: On button click → call `start_job` → returns `job_id`.
3. Bubble: "Do every 0.8 seconds" workflow polls `get_job_state?id=...`, updates a state, until `done == true`.
4. Bind the state to a text element. It feels like streaming.

**Gotchas:**
- KV is eventually consistent — use Cloudflare Durable Objects or Upstash Redis if you see staleness.
- Stop the polling loop on page unload or you'll DOS your own worker.
- 0.8s feels native; <0.5s is wasteful, >1.2s feels janky.

**Snippet (Worker pseudo):**

```js
// /start_job
const id = crypto.randomUUID();
ctx.waitUntil(streamToKV(id, prompt));
return Response.json({ job_id: id });

// /get_job_state
const buf = await KV.get(`job:${id}`);
return Response.json({ text: buf, done: buf?.endsWith("[[END]]") });
```

---

## Pattern 3: RAG with Bubble DB as Vector Store (No Pinecone)

**Use case:** Small-to-medium knowledge bases (<50k chunks). Customer support bots, "ask my docs" features. Saves $20-70/mo on a vector DB.

**Implementation:**

1. Create data type `Chunk` with fields: `text` (text), `embedding` (list of numbers), `source` (text), `tokens` (number).
2. On document upload, split into ~500-token chunks (use a Worker or Make.com).
3. For each chunk, call OpenAI `text-embedding-3-small` (1536 dims, cheap) → store the array in `embedding`.
4. On query: embed the user question → run a backend workflow that loads all `Chunk`s and computes cosine similarity in a JS API Connector "code block" or a Worker.
5. Take top 5 chunks → stuff into Claude system prompt → return answer.

**Gotchas:**
- Bubble cannot do vector math natively. **You must offload the similarity scoring** — either to a Cloudflare Worker `/search` endpoint or to a server-side plugin.
- Loading all embeddings on every search dies past ~5k records. At that scale, paginate by `source` or category, or graduate to a real vector DB.
- `text-embedding-3-small` at $0.02 / 1M tokens is basically free. Don't over-optimize.

**Snippet (Worker similarity):**

```js
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
const scored = chunks
  .map(c => ({ ...c, score: cosine(c.embedding, queryVec) }))
  .sort((a,b) => b.score - a.score)
  .slice(0, 5);
```

---

## Pattern 4: Multi-Step AI Workflows with State Machines

**Use case:** "Generate outline → user approves → generate sections → user edits → assemble." Anything that's a guided wizard.

**Implementation:**

1. Data type `Job` with `status` field (option set: `draft`, `outline_ready`, `sections_ready`, `final`, `failed`).
2. Each step is its own API workflow that **only runs when status matches** (use a "Only when" condition on the workflow trigger).
3. Use a single page with conditional groups bound to `Current Job's status`.
4. After each AI call, update the status. The next step's trigger fires automatically OR waits for user approval.

**Gotchas:**
- Don't try to chain steps inside one workflow with delays — Bubble's workflow engine is not great at long chains. Always persist state and re-enter via scheduled API.
- Keep a `last_error` text field on `Job` so you can show useful UI on failure. AI APIs fail ~0.5-2% of the time.
- Add a `retries` integer and cap at 3.

**Snippet (option set + workflow):**

```
Option set "JobStatus": draft, outline_ready, generating_sections,
                       sections_ready, assembling, final, failed

Workflow "generate_sections":
  Only when: Current Job's status is outline_ready
  Step 1: Make changes to Job → status = generating_sections
  Step 2: API call (Claude) per outline item (Schedule on a list)
  Step 3: When all complete → status = sections_ready
```

---

## Pattern 5: Background Generation with Backend Workflows + Scheduled API

**Use case:** Long-running jobs (>30s), bulk operations, anything you don't want blocking the UI. Generating 20 product descriptions at once. Nightly summaries.

**Implementation:**

1. Backend workflows must be enabled (Settings → API → check "Enable Workflow API").
2. Create an API workflow `process_item` that takes a `Thing` parameter.
3. Schedule it on a list: `Schedule API Workflow on a list "process_item" — list = Search for Items, interval = 2 seconds`.
4. The interval matters: at 0s Bubble queues them all instantly and you'll hit your AI rate limit. 2s spacing keeps you under most TPM caps.
5. Each run hits the API, saves result to the `Thing`, updates a `processed_count` on the parent `Job`.

**Gotchas:**
- The user can navigate away — never depend on the page being open.
- Bubble's "Schedule on a list" is **not transactional**. If your app crashes mid-list, the rest never runs. Always store an `enqueued_at` timestamp and have a cron sweep stragglers.
- Capacity units: backend workflows consume CPU. Watch your app's capacity graph after you ship this.

**Snippet:**

```
Schedule API Workflow on a list:
  - API workflow: process_item
  - Type of things: Product
  - List to run on: Search for Products (job = Current Job, processed = no)
  - Interval (seconds): 2
  - Scheduled date: Current date/time
```

---

## Pattern 6: Cost Control — Token Limits, Quotas, Usage Tracking

**Use case:** You ship to real users. One of them pastes a 200-page PDF into the textarea. Your card gets charged $43.

**Implementation:**

1. Data type `UsageEvent`: `user`, `feature`, `input_tokens`, `output_tokens`, `cost_usd`, `created`.
2. Before every AI call, check `User's monthly_tokens_used < User's plan_limit`. If not, return a friendly error.
3. After every AI call, parse `usage.input_tokens` and `usage.output_tokens` from the response, write a `UsageEvent`, and increment the user's running counter.
4. Reset monthly counters via a daily backend workflow that checks `created_at < now - 30 days`.

**Gotchas:**
- Always set `max_tokens` per call. **It is your last line of defense.** I default to 1500 for chat, 4000 for long-form, never more.
- Anthropic returns token counts in the response — use them, don't estimate.
- Pricing changes. Store cost-per-1k-tokens in a config option set so you can update it without redeploying logic.

**Snippet (cost calc inside workflow):**

```
input_cost  = (response.usage.input_tokens  / 1000) * 0.003
output_cost = (response.usage.output_tokens / 1000) * 0.015
total       = input_cost + output_cost
Create UsageEvent (user, feature, input_tokens, output_tokens, total)
Make changes to User: monthly_tokens_used = monthly_tokens_used + input + output
```

---

## Pattern 7: AI Form Auto-Fill (Parse User Input into Structured Fields)

**Use case:** User pastes a job description, your form auto-fills "Title", "Salary", "Location", "Skills". Huge UX win, easy to build.

**Implementation:**

1. API Connector call `parse_to_form` returning a single JSON object.
2. Use Claude's tool-use / structured output, or OpenAI's `response_format: { type: "json_schema" }`.
3. After the call, run "Make changes to a thing" or set form input values directly via "Set state" on each input.
4. Always show a "Review before saving" state — don't auto-submit.

**Gotchas:**
- Bubble's API Connector doesn't deeply parse arrays of arrays. Keep your schema flat (top-level keys, simple types). Nested objects mostly work, nested arrays are flaky.
- If a field is missing from the AI output, the corresponding Bubble dynamic ref will return empty string — handle that.
- Use `temperature: 0` for parsing tasks. You want determinism, not creativity.

**Snippet:**

```json
{
  "model": "gpt-4.1-mini",
  "temperature": 0,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "job_posting",
      "schema": {
        "type": "object",
        "properties": {
          "title":    { "type": "string" },
          "salary":   { "type": "string" },
          "location": { "type": "string" },
          "skills":   { "type": "array", "items": { "type": "string" } }
        },
        "required": ["title"]
      }
    }
  },
  "messages": [
    { "role": "system", "content": "Extract structured fields from a job posting." },
    { "role": "user",   "content": "<raw_text>" }
  ]
}
```

---

## Pattern 8: Image Generation Pipeline (DALL-E / SD via Replicate)

**Use case:** Logo generators, blog cover images, marketing image tools. Replicate is friendlier than running models yourself.

**Implementation:**

1. API call 1 — POST `https://api.replicate.com/v1/predictions` with `version` (e.g. `stability-ai/sdxl`) and `input.prompt`.
2. Replicate returns `{ id, status: "starting", urls.get }` immediately.
3. Either: poll `urls.get` every 1.5s until `status == "succeeded"`, OR set `webhook` field and let Replicate call you back (see Pattern 9).
4. When done, the response has `output` (an array of image URLs). Save the URL to your DB. **Do not hot-link long-term** — Replicate URLs expire in ~24 hours. Download and store in Bubble file storage.

**Gotchas:**
- 24-hour URL expiry has burned me twice. Build the "save to S3 / Bubble files" step before launch, not after.
- Replicate cold starts can be 30-90s on less popular models. Use a popular model (SDXL, Flux Schnell) or pay for "always-on" instances.
- Content moderation: prompts containing real names or brands often silently fail. Add a moderation pre-check.

**Snippet:**

```json
POST https://api.replicate.com/v1/predictions
Authorization: Token <key>

{
  "version": "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  "input": {
    "prompt": "<prompt>",
    "width": 1024,
    "height": 1024,
    "num_outputs": 1
  },
  "webhook": "https://<yourapp>.bubbleapps.io/api/1.1/wf/replicate_done",
  "webhook_events_filter": ["completed"]
}
```

---

## Pattern 9: Webhooks Back from Long-Running AI Jobs

**Use case:** Anything >30 seconds (image gen, video gen, big batch). Polling burns capacity and battery; webhooks are clean.

**Implementation:**

1. In Bubble: Backend workflows → Add new API workflow → name `replicate_done` → check **"Expose as a public API workflow"** and **"This workflow can be run without authentication"**.
2. Detect request data automatically by sending a sample payload from Replicate (or from `curl`) to the detector URL.
3. Inside the workflow: find the matching `Job` (you stored Replicate's `id` earlier), update its `image_url` and `status`.
4. Push a real-time update to the user via "Auto-binding" or by having the page re-search the Job every few seconds (yes, still polling — but only the DB, which is free).

**Gotchas:**
- Bubble's webhook endpoint URL differs between dev and live: `/version-test/api/1.1/wf/...` vs `/api/1.1/wf/...`. Don't ship dev URLs to prod.
- Always verify a signature/secret in the request body. Bubble cannot easily verify HMAC headers, so most providers (including Replicate) let you put a secret token in the URL or body.
- If the webhook fails (500 error), most providers retry. Make the workflow idempotent — check `if Job.status is already complete, do nothing`.

**Snippet (workflow pseudo):**

```
Trigger: POST /api/1.1/wf/replicate_done
Step 1: Search for Jobs where replicate_id = request.id, first item
Step 2: Only when result is not empty AND result's status is not "complete"
Step 3: Make changes to Job:
          image_url = request.output[0]
          status = "complete"
Step 4: (optional) Send notification to user
```

---

## Pattern 10: Caching AI Responses — DB Lookup Before API Call

**Use case:** You have repeated prompts. Same product → same description. Same FAQ → same answer. Even 30% cache hit rate cuts your AI bill 30%.

**Implementation:**

1. Data type `AICache`: `prompt_hash` (text, indexed), `response` (text), `model` (text), `created`, `hits` (number).
2. Compute a hash of `(model + system + user_prompt)`. SHA-256 first 16 chars is fine. Do this in a JS API Connector call or a Worker.
3. Workflow: Search for AICache where `prompt_hash = computed_hash` AND `created > now - 30 days`. If found, return cached response and `hits = hits + 1`.
4. If not found, hit the AI API, store the result.

**Gotchas:**
- Don't cache if the prompt includes user-identifying data (names, emails) — privacy + leaks across users.
- TTL matters. 30 days is fine for product descriptions; 1 hour for "what's trending today".
- Bubble searches are O(n) without indexed fields. Make `prompt_hash` a privacy-rule-friendly indexed text field. Past ~100k cache rows, move it to KV.

**Snippet:**

```
// JS API Connector "hash" call
async function hash(s) {
  const buf = new TextEncoder().encode(s);
  const out = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(out)].map(b => b.toString(16).padStart(2,"0"))
    .join("").slice(0, 16);
}

// Workflow:
// 1. key = hash(model + "::" + system + "::" + user_prompt)
// 2. cached = Search for AICache (prompt_hash = key, created > now-30d):first item
// 3. If cached is empty → call AI → Create AICache (key, response, model, hits=1)
//    Else → use cached.response, Make changes: hits = hits + 1
```

---

## Closing Notes

A few hard-won principles:

- **Bubble is the UI + workflow layer; offload anything performance-sensitive (vector math, hashing, streaming) to a Worker.** Don't fight the platform.
- **Always log token usage from day one.** Retrofitting cost tracking after launch is painful.
- **Default models in 2026:** `claude-sonnet-4-5` for quality, `gpt-4.1-mini` for cheap/fast, `text-embedding-3-small` for embeddings, `flux-schnell` (Replicate) for fast images.
- **Bubble plan minimum for AI apps:** Growth ($129/mo) once you have paying users — backend workflows on Starter rate-limit hard.
