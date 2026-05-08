# Proposal Mock — HTML Mockups & Reference Library

A working folder of HTML mockups, reusable components, research notes, and a
personal portfolio site. Everything is single-file, self-contained, and runs by
opening the HTML in a browser — no build step.

## Folder structure

```
.
├── README.md                       — this file
├── IMPLEMENTATION_SUMMARY.md       — what was built and when
│
├── index.html                      — LaunchCopy landing page
├── login.html                      — LaunchCopy login
├── signup.html                     — LaunchCopy signup
├── dashboard.html                  — LaunchCopy dashboard (history)
├── generate.html                   — LaunchCopy generation page (LP tab)
├── generate-email.html             — LaunchCopy generation page (Email tab)
├── settings.html                   — LaunchCopy settings
│
├── moodtunes.html                  — MoodTunes single-page mockup
├── wanderly.html                   — Wanderly full dynamic mockup (map, modals, states)
│
├── components/                     — Reusable standalone HTML components
│   ├── hero-section-1.html         — Centered, large
│   ├── hero-section-2.html         — Left-aligned with image
│   ├── hero-section-3.html         — Video-bg style (gradient + blobs)
│   ├── hero-section-4.html         — Gradient + glassmorphism
│   ├── hero-section-5.html         — Minimal black/white
│   ├── pricing-card-1.html         — 3-column standard
│   ├── pricing-card-2.html         — 2-column comparison + table
│   ├── pricing-card-3.html         — Annual/Monthly toggle (JS)
│   ├── form-section-1.html         — Long vertical
│   ├── form-section-2.html         — Multi-step with progress
│   ├── form-section-3.html         — Inline (newsletter + search)
│   ├── timeline.html               — Centered + left-rail variants
│   ├── map-with-pins.html          — Leaflet map (Kyoto, 6 pins)
│   ├── loading-states.html         — 5 loading designs
│   └── empty-states.html           — 5 empty-state designs
│
├── research/                       — Reference notes for indie SaaS work
│   ├── bubble-ai-integration-patterns.md
│   ├── saas-mvp-checklist.md
│   ├── upwork-portfolio-strategy.md
│   └── api-integration-cheatsheet.md
│
└── portfolio/
    └── index.html                  — Personal portfolio site (Shusei Kusano)
```

## Top-level mockups

### LaunchCopy (AI copywriting SaaS)
- Stack: Tailwind CSS via CDN, Inter font, primary `#6366F1`
- 7 pages: marketing site → auth → app
- Cross-linked navigation, JS only on `generate.html` (tab switch)

### MoodTunes (mood-driven playlist generator)
- Single-page, Spotify-styled dark UI
- Tailwind CDN, primary `#1DB954` Spotify green, gold `#F5D061` accent
- Mood chips, generated playlist with hover ▶ icons

### Wanderly (AI travel planner)
- Self-contained CSS (no Tailwind), Leaflet.js for the map
- Cream `#FAF7F2` + forest `#2D5F4E` + coral `#E07856`
- 4-state JS flow: Hero → Form → Loading → Results
- Interactive map with 5 numbered coral pins + dashed route polyline
- Spot-detail / Save / Share modals
- Intersection Observer stagger animations
- Alternate states (location-error, generic error, loading-alt) preserved as
  HTML comments for easy swap-in

## components/

Drop-in HTML snippets. Each file is self-contained, uses Tailwind via CDN, and
loads Inter from Google Fonts. Open any file in a browser to preview.

## research/

Personal reference docs for shipping SaaS MVPs as a Bubble + AI builder
freelancing on Upwork.

## portfolio/

Single-page personal portfolio at `portfolio/index.html`. Same design tone as
Wanderly (cream + forest + coral + Playfair Display headings).

## How to use

```sh
# Browse any mockup
open wanderly.html
open components/timeline.html
open portfolio/index.html
```

Or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Geolocation in `wanderly.html` requires `https` or `localhost` — opening from
`file://` falls back to a Kyoto demo location automatically.
