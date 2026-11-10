# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on http://localhost:3000
- `npm run build` — production build
- `npm start` — run production build
- `npm run lint` — ESLint (`eslint-config-next`)

No test framework is configured.

## Required env vars (`.env`)

`MONGO_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `URL`.

## Architecture

Next.js 16 **App Router** (React 19) project (JavaScript, not TypeScript — `jsconfig.json` with `@/*` → `src/*`). Single product: a Linktree-style portfolio builder with analytics.

### Route groups (`src/app/`)

- `(app)/` — **authenticated** dashboard: `account/` (portfolio editor), `analytics/` (Chart.js/Recharts dashboards), `claim-username/`. Layout enforces session.
- `(page)/[uri]/` — **public** portfolio page resolved by `Page.uri`. Server-renders the user's portfolio; click/view tracking flows in via `/api/click`.
- `main/` — landing + login pages.
- `api/auth/[...nextauth]` — NextAuth (Google OAuth + MongoDB adapter).
- `api/click` — records `Event` documents (clickType: `link` | `social` | `project` | view).
- `api/upload` — S3 image upload via `libs/upload.js`.

### Data layer

- `libs/mongoClient.js` — Mongoose connection (cached across hot reloads).
- `models/` — Mongoose schemas. `Page` (`page.js`) is the central document storing a user's portfolio (links, socials, bio, profile/bg images, ordering). `User` is the auth user. `Project`, `Education`, `WorkExperience` are referenced/embedded portfolio sections. `Event` records analytics; `DeletedLink` preserves history so analytics survive deletions.
- `actions/pageActions.js` — server actions for all portfolio CRUD; `actions/grabUsername.js` handles username claim. Mutations re-validate session inside the action — never trust the client.

### Components

- `components/forms/` — section editors used by the account dashboard.
- `components/profile/` — public-portfolio section renderers (dark theme, framer-motion animations).
- `components/layout/` — `SectionBox`, `AppSideBar`, `AccountHeader`.
- `components/buttons/` — `SubmitButton`, `LoginWithGoogle`.

### Cross-cutting conventions

- Server Actions (not REST) are the primary mutation path for the dashboard; `/api/*` is reserved for things that must be HTTP (auth callbacks, click beacons, file uploads).
- Click tracking expects URLs **base64-encoded** in the `url` query param (`/api/click?url=<b64>&page=<uri>&clickType=...`).
- Skill icons are filename-keyed SVGs in `public/skills/<name>.svg` — adding a new skill means dropping the SVG with the matching lowercase name.
- Analytics queries roll up `Event` by day/link; deleted links are joined via `DeletedLink` so historical counts don't drop.
