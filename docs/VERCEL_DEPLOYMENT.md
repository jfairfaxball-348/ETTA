# Deploy ETTA on Vercel

ETTA is currently a **static Vite + TypeScript + Three.js browser app**. This deployment publishes the **manual BODY experiment** (3D avatar, test arena, desktop/touch controls), **not** a home, connected LLM, autonomous character or continuously running server.

## First deployment — Vercel dashboard

1. Open [Vercel New Project](https://vercel.com/new), connect GitHub if prompted, and import **`jfairfaxball-348/ETTA`** using the **`jball348-svg`** GitHub account/integration.
2. Set the **production branch** to `main`. Keep the **root directory** as the **repository root** (`./`); do not choose `src`.
3. Confirm these settings. The checked-in `vercel.json` provides them:
   - **Framework preset:** Vite
   - **Install command:** `npm ci --no-audit --no-fund`
   - **Build command:** `npm run build` (TypeScript check + Vite build)
   - **Output directory:** `dist`
   - **Node.js:** 22.x is the CI-tested major version; select 22.x in Vercel project settings for parity if an incompatible default is selected.
4. **Environment variables: none required.** Do not paste a Google/Gemini/Gemma API key or a `VITE_*` secret into this static client. P3 MIND will add an explicitly secured server-side API boundary later.
5. Click **Deploy**. Vercel should build from `main` and give a `*.vercel.app` URL. Keep the Git integration connected for future deployments when changes land on `main`.

This repository contains no API routes or serverless functions yet. Do not configure a background worker, inference endpoint, database or paid services just for this first deployment.

## Acceptance at the live URL

A successful Vercel build is **not** a verified running app. Inspect the actual URL:

- On desktop: page loads with **ETTA — First Steps**, visible 3D character and **MANUAL / DEV · NO AUTONOMY**; no unexpected errors in browser console. Click the scene, use **WASD / arrow keys**, **Shift** for run, mouse drag to orbit, scroll to zoom, **R** for reset, and **F1** or the HUD button to toggle telemetry.
- On a phone: load the page, scroll to the 3D scene/touch pad, hold the directional buttons, and check camera drag, HUD, reset and responsiveness. A prior **emulated** mobile software-WebGL test was slow (~6 FPS); real-device performance has **not** been measured.
- If WebGL is unavailable, verify ETTA shows an explanatory fallback instead of claiming a running world.
- Record the actual production URL, deployment commit and live checks before changing the project-state label to `VERCEL_VERIFIED`.

## Troubleshooting

- **Build failure:** confirm Node version, repository root, `npm ci` and `npm run build`; inspect Vercel build logs. GitHub Actions also runs `npm run check` and real Chromium smoke tests.
- **404 at the main URL:** ensure project Root Directory is `./` and output is `dist`. ETTA currently uses only `/` and has no client-side routes requiring an SPA rewrite.
- **Empty/failed 3D view:** confirm the browser supports WebGL and hardware acceleration; check its console. A successful HTML response alone does not establish working 3D rendering.
- **No AI conversation:** expected. No model or backend is wired up in the deployed BODY phase.

## Security and scope

The repository's `.env.example` is a **future** P3 server configuration illustration, not a deployment checklist. Any future Google API key must remain server-side with authentication, rate limiting, action validation and spending caps; never expose it using `VITE_` or embed it in committed code.

This file is a **deployment handoff**, not evidence that a Vercel deployment has been made or tested.

> Migration: This is the active `jfairfaxball-348/ETTA` repository, copied from `jball348-svg/ETTA` on 2026-10-18. Previous CI runs were recorded in the original repo; a new CI run is required here.
