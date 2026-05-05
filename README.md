# Shusei — Personal Portfolio

A single-page portfolio site built with Astro + Tailwind CSS, deployed to GitHub Pages.

## Setup

```bash
npm install
npm run dev
# → http://localhost:4321
```

## Build

```bash
npm run build
# Output → dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy to GitHub Pages

### 1. Configure `astro.config.mjs`

Edit the `site` and `base` fields:

```js
// For a user/org page (username.github.io):
site: 'https://YOUR_USERNAME.github.io',
// base can be omitted or set to '/'

// For a project repo page (username.github.io/repo-name):
site: 'https://YOUR_USERNAME.github.io',
base: '/YOUR_REPO_NAME',
```

### 2. Enable GitHub Pages in repo settings

Go to: **Settings → Pages → Build and deployment**
Set source to: **GitHub Actions**

### 3. Push to `main`

The workflow at `.github/workflows/deploy.yml` will build and deploy automatically on every push to `main`.

---

## TODOs before going live

Replace every placeholder `#` URL in the source files listed below:

- **Quanta project — live link** (`src/components/FeaturedWork.astro`, first `<ProjectCard>`, `liveUrl` prop)
  → Insert the Figma public share link

- **Quanta project — case study link** (`src/components/FeaturedWork.astro`, first `<ProjectCard>`, `caseStudyUrl` prop)
  → Insert case study URL or remove the button

- **Twitter Bot — live link** (`src/components/FeaturedWork.astro`, second `<ProjectCard>`, `liveUrl` prop)
  → Insert live demo URL or remove the button

- **Twitter Bot — case study link** (`src/components/FeaturedWork.astro`, second `<ProjectCard>`, `caseStudyUrl` prop)
  → Insert case study URL or remove the button

- **Upwork profile URL** (`src/components/Contact.astro`, "Hire me on Upwork →" button)
  → `https://www.upwork.com/freelancers/YOUR_ID`

- **Email address** (`src/components/Contact.astro`, "Email →" button)
  → Change `href="#"` to `href="mailto:your@email.com"`

- **X / Twitter profile URL** (`src/components/Contact.astro`, "X / Twitter →" button)
  → `https://x.com/YOUR_HANDLE`

- **GitHub profile URL** (`src/components/Contact.astro`, "GitHub →" button)
  → `https://github.com/YOUR_USERNAME`

- **Screenshot — Quanta** (`public/images/quanta-preview.png`)
  → Replace the 1×1 placeholder with a real 16:10 screenshot (~1280×800px)

- **Screenshot — Twitter Bot** (`public/images/twitter-bot-preview.png`)
  → Replace the 1×1 placeholder with a real 16:10 screenshot (~1280×800px)

---

## Stack

- [Astro](https://astro.build) 4.x
- [Tailwind CSS](https://tailwindcss.com) via `@astrojs/tailwind`
- [Inter](https://rsms.me/inter/) + [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via Google Fonts
- Deployed via GitHub Pages + GitHub Actions
