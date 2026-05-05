# quanta.world — Additional Screen Specifications

This document specifies the remaining screens needed for a complete product mockup. Each screen is specified at an implementation-ready level: Sonnet (or any capable model) can build directly from these specs without further design decisions.

**Existing design system reference:** all screens inherit from `dashboard-mock.html` — same color tokens, typography, sidebar, topbar, watermark.

**Common assumptions for all signed-in screens:**
- Use the same 240px fixed sidebar from `dashboard-mock.html` (mark active item per page)
- Use the same sticky topbar with search + XP pill + notification + avatar
- Page content padding: `40px 48px 96px`, max-width 1280px
- Watermark: bottom-right, `by Shusei — Sample Only`

---

## Priority Tier 1 — Core Product Flows

### 1. `screen-problem.html` — Problem Solving Interface

**Purpose:** Where users actually solve a single math/coding problem. The most important "doing the work" screen.

**Layout:** Hide global sidebar; replace with focused problem chrome.
```
┌─────────────────────────────────────────────────────────────────┐
│ Top bar: ← Back · Discrete Math › Lesson 13 · Timer 04:23  ⌘K  │
├──────────────────────────┬──────────────────────────────────────┤
│ LEFT (40%, scrollable)   │ RIGHT (60%, sticky)                  │
│                          │                                      │
│ • Problem 3 of 12        │ Your answer                          │
│ • Difficulty pill        │ ┌────────────────────────────────┐  │
│ • Topic chip: Graph Th.  │ │ [Code editor or input field]   │  │
│                          │ └────────────────────────────────┘  │
│ ## Problem statement     │                                      │
│ Markdown rendered with   │ [Hint] [Reset]      [Submit ▸]      │
│ MathJax-style equations  │                                      │
│                          │ Submission history                   │
│ • Example I/O blocks     │ ✓ 14:22 — Accepted                  │
│ • Constraints            │ ✗ 14:18 — Wrong answer              │
│                          │ ✗ 14:11 — Time limit exceeded       │
└──────────────────────────┴──────────────────────────────────────┘
```

**Key components:**
- **Problem statement block** — white card, 32px padding, 16px radius. Title H2. Body uses Inter 16px/1.7 with `prose` rhythm. Inline math styled in JetBrains Mono with `--purple-tint` background pill.
- **Difficulty pill** — color-coded: easy (`--emerald`), medium (`--gold`), hard (`--rose`).
- **Example I/O** — paired blocks, mono font, `--surface-muted` background, `--border` 1px, 12px radius.
- **Code editor surface** — dark `#0F172A` background, JetBrains Mono 14px, 1.6 line-height, syntax-highlighted (purple keywords, gold strings, sky numbers). Use a placeholder static block with realistic Python.
- **Submit button** — primary purple, full-width on mobile, right-aligned 14×24 padding on desktop. Hover lift +1px.
- **Submission history** — list with status icon (✓ emerald, ✗ rose, ⏱ gold), timestamp, status text. Click to expand diff.
- **Timer chip** — top-right, mono font, turns rose at <60s remaining.
- **Hint drawer** — slides up from bottom, 50% opacity overlay, "Take hint? -10 XP" warning.

**Sample data:**
- Course: Discrete Mathematics
- Lesson: Graph Coloring
- Problem 3 of 12 — "Chromatic Number"
- Difficulty: Medium
- Time limit: 30:00, currently 04:23 elapsed
- 3 attempts shown in history

**States:**
- Empty editor (placeholder: `# Write your solution here…`)
- Submitting (button shows spinner, "Running tests…")
- Accepted (green flash, confetti-free, just a check ✓ + XP gained pill)
- Wrong answer (red shake on submit button, error block reveals expected vs actual for first failing test)

---

### 2. `screen-lesson.html` — Lesson Reading + Inline Exercise

**Purpose:** A single lesson within a course. Reading material with embedded interactive checkpoints.

**Layout:** Sidebar collapsed into thin lesson navigator.
```
┌──────────┬────────────────────────────────────────────────────┐
│ Lesson   │ Top bar: ← Back to course  · Lesson 13/18  Save 💾 │
│ Outline  ├────────────────────────────────────────────────────┤
│ ~280px   │                                                    │
│          │  Hero: Course tag pill + Lesson title H1           │
│ • 1. Set │  "Reading time ~8 min · +30 XP on completion"       │
│ ✓ 2. ... │                                                    │
│ ✓ 3. ... │  ── Reading section ──                             │
│ ▶ 13.    │  Markdown content w/ math, code blocks, callouts   │
│   Graph  │                                                    │
│   Color  │  [Inline question card]                            │
│ ○ 14.    │   Multiple choice: 4 options, single-select        │
│ ○ 15.    │   "Check answer" → reveals explanation             │
│ ○ 16.    │                                                    │
│          │  ── Continue reading ──                            │
│          │                                                    │
│          │  ── Practice problems (3) ──                       │
│          │  Card list → links to screen-problem.html          │
│          │                                                    │
│          │  Footer: ← Previous lesson    Next lesson →        │
└──────────┴────────────────────────────────────────────────────┘
```

**Key components:**
- **Lesson outline rail** — 280px fixed left, vertical list. Each item: 12px circle status icon (✓ filled emerald, ▶ filled purple, ○ outlined gray), lesson number, title (truncated). Active lesson has `--navy-50` bg + 3px purple left bar.
- **Reading section** — max-width 720px, centered in remaining space. Inter 17px/1.75. H2 in 24px/1.2 with 48px top margin. Code blocks: `--surface-muted` bg, mono 14px, 16px padding, 12px radius.
- **Math callouts** — 4 variants: Definition (purple-tint bg, purple left-bar), Theorem (gold-tint bg, gold left-bar), Example (sky-tint bg, sky left-bar), Note (emerald-tint bg, emerald left-bar). Title in caps + body.
- **Inline question card** — white card with `--purple` 2px border, 24px padding. Question text, 4 radio options (round 18px), "Check answer" button. After submit: correct option turns emerald with check, wrong stays neutral, explanation block reveals beneath.
- **Practice problem strip** — 3 cards in a row at end. Each links to problem page.
- **Lesson nav footer** — sticky bottom on mobile, two buttons left/right with prev/next lesson titles.

**Sample data:**
- Course: Discrete Mathematics
- Lesson 13: "Graph Coloring"
- 7 of 18 lessons complete
- Reading time ~8 min, +30 XP
- 1 inline question + 3 practice problems

---

### 3. `screen-profile.html` — User Profile

**Purpose:** Public-facing profile. Same layout for own profile (with edit affordances) and other users (with follow button).

**Layout:** Standard sidebar + topbar.
```
┌─────────────────────────────────────────────────────────────┐
│ Profile hero (320px tall):                                  │
│  • 88px avatar with gradient ring                           │
│  • Name H1 + @handle + country flag                         │
│  • Bio one-liner                                            │
│  • Joined date · Title (e.g. "Problem Solver")              │
│  • Right side: Follow / Edit profile button                 │
│                                                             │
│ Stats grid (4 cols):                                        │
│  Total XP · Global rank · Streak · Problems solved          │
│                                                             │
│ Activity heatmap (full-width, ~140px tall):                 │
│  GitHub-style 7×52 grid, 3px gap, 12px squares              │
│  Color scale: --surface-muted → --purple-tint → --purple    │
│  Tooltip on hover: "Mar 14 · 3 problems"                    │
│                                                             │
│ Two-column section:                                         │
│  Left (60%): Course progress list (4 active)                │
│  Right (40%): Recent achievements (badge cloud, 6 items)    │
│                                                             │
│ Skill ratings radar chart (CSS/SVG):                        │
│  6 axes: Math, Algorithms, Number Theory, Graphs, Crypto,   │
│  Probability — each 0-100 score                             │
│                                                             │
│ Recent contests (table, 5 rows): contest, rank, XP, date    │
└─────────────────────────────────────────────────────────────┘
```

**Key components:**
- **Profile hero** — full-width banner with `linear-gradient(120deg, --navy-900, --purple)` low opacity, white text overlay. Avatar 88px circle with 4px gradient ring (gold → purple).
- **Activity heatmap** — Pure CSS grid, 7 rows × 52 cols. Squares are colored based on data attribute. Use a JS-free static representation with classes `.hm-0` through `.hm-4` for intensity.
- **Skill radar** — inline SVG hexagon. Axis labels around perimeter. Score polygon filled with `--purple` at 25% opacity, stroke at full purple. Grid rings every 25%.
- **Course progress list** — same as Skills page rows but compact (smaller).

**Sample data:**
- Name: Shusei
- Handle: @shusei
- Country: 🇯🇵 Japan
- Bio: "Self-taught math nerd · Working through Brilliant + cp-algorithms"
- Joined: October 2024
- Title: "Problem Solver"
- Total XP: 1,247 · Rank: #42 · Streak: 7d · Solved: 38
- Heatmap: ~80% sparse with cluster on recent 14 days
- Radar: Math 78, Algorithms 65, Number Theory 52, Graphs 41, Crypto 18, Probability 30

---

### 4. `screen-onboarding.html` — First-Time Setup (Multi-step)

**Purpose:** Activate new users with a 4-step setup wizard. No sidebar — full-screen funnel.

**Layout:** No sidebar. Centered content, ~640px wide. Top: progress dots (4). Bottom: nav buttons.
```
┌─────────────────────────────────────────────────────────────┐
│  Q  quanta                                       Skip  ✕    │
├─────────────────────────────────────────────────────────────┤
│              ● ─── ○ ─── ○ ─── ○                           │
│              Step 1 of 4                                    │
│                                                             │
│        H1: What brings you to quanta?                       │
│        Subtitle in --text-secondary                         │
│                                                             │
│        4-up grid of large selectable cards (160px tall):    │
│        🎓 Prep for math olympiad                            │
│        💻 Sharpen coding interview skills                   │
│        🧠 Learn for fun & curiosity                         │
│        📚 Supplement school/uni courses                     │
│                                                             │
│        Selected: 2px purple border + tint bg                │
│                                                             │
│                                          [ Continue → ]     │
└─────────────────────────────────────────────────────────────┘
```

**4 steps:**
1. **Why are you here?** — choose 1-2 motivations (4 options shown above)
2. **What's your level?** — 3 cards (Beginner / Intermediate / Advanced) with subtitle clarifications
3. **Topics you're interested in** — multi-select grid of 8-12 chips: Algebra, Geometry, Number Theory, Graphs, DP, Probability, Linear Algebra, Crypto, etc.
4. **Daily goal** — 3 options as cards: Casual (5 min), Regular (15 min), Serious (30 min). Each shows expected XP/week.

**Final transition screen:** "Setting up your skill tree…" → loading 800ms → fade into Dashboard.

**Key components:**
- **Progress indicator** — 4 dots connected by lines. Active dot: 12px purple solid. Past dots: 8px purple solid. Future dots: 8px gray. Lines: 1px between them.
- **Selectable card** — 16px radius, 24px padding, default `--border` 1px. Hover: lift -2px, shadow grows. Selected: 2px `--purple` border, `--purple-tint` bg, check ✓ in top-right corner.
- **Bottom nav** — back arrow text-button left, primary "Continue" or "Get started" right (purple, 14×24 padding). Disabled until selection made.

---

## Priority Tier 2 — Acquisition

### 5. `screen-landing.html` — Public Marketing Page (Signed-Out)

**Purpose:** Solves the original "Dashboard shows almost nothing for non-signed-in users" problem. The hook for first-time visitors.

**Layout:** Full-width, no sidebar. Public top nav bar instead.
```
Public top nav: Q quanta · Browse · Competitions · Pricing · About    [Sign in] [Get started]

┌─────────────────────────────────────────────────────────────┐
│ HERO (full-bleed, ~640px tall):                             │
│  Left col (60%):                                            │
│   • Eyebrow: "STEM learning that sparks curiosity"          │
│   • H1 (display 64px): "Master math by solving,             │
│      not memorizing."                                       │
│   • Subtitle (text-secondary, 18px)                         │
│   • [Start free →] [Watch demo ▸] buttons                   │
│   • Social proof: "Join 24,000+ learners"                   │
│  Right col (40%):                                           │
│   • Floating mock card showing a problem being solved       │
│   • Subtle parallax layered cards behind                    │
│                                                             │
│ Background: warm off-white with subtle math-symbol pattern  │
│ at 4% opacity (∫ Σ ∂ π) scattered                            │
└─────────────────────────────────────────────────────────────┘

Logo cloud strip: "Trusted by learners at MIT, Stanford, UTokyo, …"

3-column features section:
  🎯 Learn by doing
  🏆 Compete and grow
  📈 Track real progress
  Each: icon, H3, 2-line description.

Interactive demo section (full-width, navy gradient bg):
  H2 white: "See how it works"
  Tabs: For students | For competitors | For self-learners
  Below tabs: large screenshot card with arrow callouts

Testimonials (3 cards):
  Avatar + quote + name + title

Pricing teaser (3 plans side-by-side compact)

Final CTA strip:
  Big H2 + button on gradient bg

Footer (multi-column): Product · Resources · Company · Legal · Social
```

**Key components:**
- **Public nav** — sticky white, 72px tall, 1px bottom border. Logo left, link group center, sign-in pair right.
- **Hero CTA pair** — primary purple "Start free", secondary outlined "Watch demo".
- **Floating problem card** — white card, 16px radius, shadow-lg. Shows truncated problem + answer input + "Submit ✓" button as if mid-interaction. Slight rotation `transform: rotate(-2deg)`. Behind it: 2 ghost cards offset.
- **Features 3-up** — icon in tinted square (40px), H3, description. Center-aligned.
- **Demo screenshot** — placeholder dark card with annotation tags.
- **Testimonial card** — white, avatar circle 44px, italic quote, name + role.

**Sample copy:**
- H1: "Master math by solving, not memorizing."
- Sub: "From discrete math to cryptography — quanta turns hard topics into 5-minute interactive problems. Join 24,000+ learners."
- Testimonial: "I went from struggling with proofs to placing top-100 in my country's math olympiad in 6 months." — Yuki H., student

---

### 6. `screen-signup.html` — Sign Up / Sign In

**Purpose:** Conversion screen. Minimal friction, beautiful first impression.

**Layout:** 50/50 split. No sidebar.
```
┌────────────────────────────────┬────────────────────────────────┐
│ LEFT (50%):                    │ RIGHT (50%):                   │
│ Linear gradient navy → purple  │ White surface                  │
│                                │                                │
│ Q logo + "quanta" wordmark     │ H1: "Create your account"      │
│ at top                         │ Sub: "Free forever. No card."  │
│                                │                                │
│ Center vertically:             │ [G  Continue with Google]      │
│ Big quote/value prop:          │ [  Continue with Apple]         │
│ "Where curiosity becomes       │ [⌘ Continue with GitHub]       │
│  competence."                  │                                │
│                                │ ── or sign up with email ──    │
│ Below: floating problem card   │                                │
│ mock (same as landing)         │ Email                          │
│                                │ ┌────────────────────────────┐ │
│                                │ Password                       │
│                                │ ┌────────────────────────────┐ │
│                                │                                │
│                                │ [ Create account ]             │
│                                │                                │
│                                │ Already have an account?       │
│                                │ Sign in →                      │
└────────────────────────────────┴────────────────────────────────┘
```

**Key components:**
- **Left panel** — full gradient bg, white text. Decorative math symbols floating low-opacity.
- **OAuth buttons** — full-width, 48px tall, white bg, 1px border, 12px radius, brand icon + label, hover bg `--surface-muted`.
- **Email field** — 48px tall, 12px radius, 1px border, focus ring `--purple` + 3px outer tint. Floating label or fixed top label.
- **Primary button** — purple, full-width, 48px tall, 14px text weight 600.

**Variants:** `screen-signin.html` is the same layout with form pruned to email + password + "Sign in" + "Forgot password?" link.

---

### 7. `screen-catalog.html` — Course Catalog / Browse

**Purpose:** Discovery surface. Browse, filter, search all courses + skill paths.

**Layout:** Standard signed-in chrome. Two-column inside content.
```
┌──────────┬────────────────────────────────────────────────────┐
│ Sidebar  │ Topbar                                              │
│          ├────────────────────────────────────────────────────┤
│          │ Page header: "Browse" + 1 line subtitle             │
│          │                                                     │
│          │ Pill filter row (horizontal scroll):                │
│          │ All · Mathematics · Algorithms · CS · Crypto · …    │
│          │                                                     │
│          │ ┌──────────┬────────────────────────────────────┐  │
│          │ │ Filters  │ Grid 3-up of course cards          │  │
│          │ │ rail     │                                    │  │
│          │ │ ~240px   │ Card = same as Continue Learning   │  │
│          │ │          │ but with: rating stars, # learners,│  │
│          │ │ Level:   │ duration estimate                  │  │
│          │ │ ☐ Begin  │                                    │  │
│          │ │ ☐ Inter  │ ~12 cards visible, "Load more"     │  │
│          │ │ ☐ Adv    │                                    │  │
│          │ │          │                                    │  │
│          │ │ Length:  │                                    │  │
│          │ │ ◯ <2h    │                                    │  │
│          │ │ ◯ 2-5h   │                                    │  │
│          │ │ ◯ 5h+    │                                    │  │
│          │ │          │                                    │  │
│          │ │ Topics:  │                                    │  │
│          │ │ checkbox │                                    │  │
│          │ │ list     │                                    │  │
│          │ └──────────┴────────────────────────────────────┘  │
└──────────┴────────────────────────────────────────────────────┘
```

**Key components:**
- **Filter chips row** — horizontal scrolling chip group, active chip is `--navy-900` filled with white text, others are outlined.
- **Filters rail** — sticky white card, grouped checkboxes/radios. Each group has H3 + items.
- **Course card with meta** — banner + body. Body adds: 5-star rating (filled gold stars), "1.2k learners" count, ⏱ duration.
- **Sort dropdown** — top-right of grid: "Most popular ▾".

**Sample courses (~12):**
- Discrete Mathematics · 4.8★ · 12.4k learners · ~14h
- Algorithms 101 · 4.9★ · 18.2k · ~24h
- Modular Arithmetic · 4.7★ · 6.1k · ~10h
- Public-Key Foundations · 4.9★ · 4.3k · ~16h
- Graph Theory Basics · 4.8★ · 9.7k · ~12h
- Probability Mastery · 4.6★ · 11.0k · ~18h
- Big-O & Complexity · 4.9★ · 14.5k · ~6h
- Linear Algebra Visualized · 4.9★ · 8.2k · ~20h
- Combinatorics Workshop · 4.7★ · 5.5k · ~14h
- Dynamic Programming · 4.8★ · 13.0k · ~22h
- Calculus Fundamentals · 4.6★ · 16.4k · ~28h
- Game Theory Intro · 4.7★ · 3.9k · ~8h

---

## Priority Tier 3 — Settings & Utility

### 8. `screen-settings.html` — Settings

**Purpose:** Account management. Tabbed layout.

**Layout:** Standard chrome. Settings has its own internal nav.
```
Page header: "Settings"

Two-column inside content:
  LEFT (220px sticky): inner-nav vertical list
    • Profile
    • Account
    • Notifications
    • Preferences
    • Subscription
    • Privacy & data
    • Danger zone

  RIGHT (rest): Active section content

Sections (each a stacked group of "settings cards"):

Profile section:
  - Avatar uploader (preview + "Upload" + "Remove")
  - Display name input
  - Handle input (with availability check)
  - Bio textarea
  - Country select
  - "Save changes" button right-aligned

Account section:
  - Email (with verified badge)
  - Password row → "Change password →"
  - 2FA toggle
  - Connected accounts: Google ✓, Apple +, GitHub +

Notifications section:
  - Per-event toggle list:
     "Live competition starts" — Email ☑ Push ☑ In-app ☑
     "Weekly leaderboard digest" — Email ☑ Push ☐ In-app ☑
     "Course reminders"
     "New achievements"
     "Friend activity"

Subscription section:
  - Current plan card: "Free · Upgrade to Pro"
  - Pro plan benefits list
  - [ Upgrade to Pro $9/mo ] button

Danger zone (rose accents):
  - Reset progress (warning button)
  - Delete account (rose button)
```

**Key components:**
- **Inner nav** — vertical list, 220px wide, sticky. Same nav-item style as sidebar but muted.
- **Settings card** — white, 16px radius, 24px padding. Title + description top, controls below.
- **Toggle switch** — 44×24, slate when off / `--purple` when on. Smooth 200ms transition.
- **Danger card** — rose-tinted background (very subtle), rose left-bar.

---

### 9. `screen-notifications.html` — Notification Center

**Purpose:** Full notification list, replacing the topbar bell dropdown.

**Layout:** Standard chrome.
```
Page header: "Notifications" + "Mark all as read" link right

Tab bar: All · Unread · Achievements · Social · Reminders

List of notification rows:
  Each row:
    • Avatar/icon left (40px)
    • Content (title + body, 2 lines)
    • Right: timestamp ("2h ago"), action button if applicable
    • Unread: 3px purple left bar + pale tint bg
    • Hover: bg --surface-muted, action becomes visible

Sample notifications:
  ▣ 🏆 You ranked #3 in Weekly Blitz #30! +148 XP earned · 2h ago
  ▣ 🔴 Spring Math Blitz starts in 1 hour · 4h ago [Set reminder]
  ✓ ⚡ You hit 1,000 XP — 1K Club achievement unlocked · 1d ago
  ✓ 👥 dubon started following you · 1d ago [Follow back]
  ✓ 📚 New lesson available: "Eulerian Paths" in Graph Theory · 2d ago
  ✓ 🎯 You're falling behind your weekly goal — 3 lessons left · 2d ago [Open]
  ✓ 🏆 Algorithms Sprint #13 results posted — you placed #19 · 3d ago

Footer link: "Notification settings →"
```

**Key components:**
- **Notification row** — flex row, 16px padding, 1px bottom border. Hover lift not needed (table-like).
- **Unread indicator** — left border 3px purple. Bg `linear-gradient(90deg, --purple-tint 0%, transparent 30%)`.
- **Type icon** — 32px circle with tinted bg matching event type (achievement = gold, social = sky, contest = rose, reminder = purple).

---

### 10. `screen-search.html` — Search Results

**Purpose:** Global search results page (hit ⌘K → enter).

**Layout:** Standard chrome.
```
Page header:
  Search input (full-width, large 56px tall) prefilled: "graph"
  "12 results in 3 categories"

Tabs: All · Skills (4) · Lessons (5) · Problems (3)

Grouped result list:

  ── Skills ──
    🔢 Graph Theory Basics — Beginner · 4 hours · ★ 4.8
    🔢 Graph Coloring — Intermediate · 90 min
    🔢 Eulerian Paths — Advanced · 2 hours
    🔢 Shortest Path Algorithms — Intermediate · 3 hours

  ── Lessons ──
    📖 What is a graph? — Discrete Math, Lesson 8
    📖 Graph representations — Algorithms 101, Lesson 14
    📖 ...

  ── Problems ──
    ⚔️ Two Cities (Easy) · 24% solve rate · +20 XP
    ⚔️ Min Spanning Tree (Medium) · ...
    ⚔️ ...

  Each result row: icon, title (with query "graph" highlighted in
   --gold-tint inline span), 1-line meta, hover → arrow icon appears.

Empty state (when no query):
  Show "Recent searches" + "Trending topics" chips
```

**Key components:**
- **Big search field** — same as topbar but 56px and ⌘K visible.
- **Result row** — flex, 16px padding, 12px radius hover bg.
- **Highlight span** — `<mark>` styled with `--gold-tint` bg, inherits text color.

---

## Priority Tier 4 — Edge Cases

### 11. `screen-live-contest.html` — Active Contest View

**Purpose:** When a user is mid-contest. Combines problem nav + live timer + standings sidebar.

**Layout:** Full-screen contest mode. No global sidebar.
```
Top contest bar (sticky, navy bg):
  Left: Logo + "Spring Math Blitz" title
  Center: Big mono timer "00:42:15" (rose if <5min)
  Right: Solved 5/12 · Rank 23/196 · Submit count

Main grid 70/30:
  Left (70%): Problem panel (same as screen-problem.html)
  Right (30%): Live standings panel
    - Sticky list of top 10 + your row, updates every 30s
    - Each row: rank, avatar, name, problems solved (P1✓ P2✓ P3✗ ...)
    - Animated row reorder when ranks change

Bottom problem nav (sticky):
  P1 ✓  P2 ✓  P3 ▶  P4 ○  P5 ○  P6 ○  ...  P12 ○
  Each: 36×36 square, status-colored (green/red/purple/gray)
```

---

### 12. `screen-404.html` — Not Found

**Purpose:** Friendly 404 with on-brand humor.

**Layout:** Centered, no sidebar.
```
Center stack:
  • Big 404 in display weight (192px) with --purple gradient
    Below it, math equation: "lim_{x→404} f(x) = ∅"
  • H2: "This page doesn't exist."
  • Body: "Either the URL is wrong, or this content was deleted.
           The good news: 24,000+ problems are still waiting."
  • Button pair: [← Back to Dashboard] [Browse problems]
  • Decorative: floating math symbols low-opacity bg
```

---

## Implementation Order Recommendation

If implementing all of these, the order that maximizes proposal value:

1. **screen-problem.html** — proves you understand the core product loop
2. **screen-landing.html** — solves the original "empty for non-signed-in" complaint directly
3. **screen-profile.html** — shows social/identity dimension
4. **screen-onboarding.html** — shows you think about activation, not just current state
5. **screen-lesson.html** — completes the learning loop
6. **screen-signup.html** — completes the funnel
7. **screen-catalog.html** — discovery surface
8. **screen-settings.html** — admin completeness
9. **screen-live-contest.html** — depth in core feature
10. **screen-notifications.html** + **screen-search.html** + **screen-404.html** — polish
