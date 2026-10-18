# S003 — Validation record

## CI_PASS — Actual production-preview browser

**[GitHub Actions run 39110275970](https://github.com/jball348-svg/ETTA/actions/runs/39110275970)** at exact S003 source commit `70e202bcb16ff1ca52fa8112e137c3b0ec4a25e9`. Runner: Ubuntu 24.04, Node 22.23.3, hosted headless Chromium using pinned Playwright Core 1.56.1 (CI-only). Execution sequence: `npm ci --no-audit --no-fund`, `npm run check` (TypeScript, protocol and physics unit tests, Vite production build), `npm run preview -- --host 127.0.0.1 --port 4173`, `node tests/browser-smoke.mjs`.

**Actual browser: 15 PASS, 0 FAIL.** Observed by browser automation: WebGL canvas and MANUAL label, W/D movement, Shift running vs walking, R reset and camera reset, arrow key release, F1/button HUD, bounded wheel zoom, actual mouse drag changing subsequent W direction, explicit window blur stopping movement, sampled obstacle/arena legal positions, desktop screenshot, emulated mobile touch forward after scroll, mobile screenshot, forced WebGL failure message and absence of unexpected runtime exceptions.

Artifact `etta-browser-evidence`, ID `12130221952` (388,172 bytes), contains screenshot(s) and `browser-results.json`. Its download is available through the Actions run's Artifacts panel. These are genuine automated browser interactions, not a direct human screenshot inspection.

## Failed probes and remedies

- First Chrome run [39109874063](https://github.com/jball348-svg/ETTA/actions/runs/39109874063) passed 13 browser cases, failed mobile press and 404 console noise.
- Mobile issue investigation revealed the test sent a touch to an **offscreen** button (bounding box y≈953 beyond viewport 844): event reached `HTML`. Scrolling the pad into view (y≈453) before CDP touch gave real pass. Separately, source-level touch focusout behavior was hardened so a touch hold isn't discarded when focus leaves the canvas.
- Added data favicon to avoid missing /favicon.ico request.
- Final Chrome rerun passed all 15 cases.

## Evidence limits

- **Physical smartphone:** NOT_RUN. Only real desktop headless Chrome and Chrome mobile-device *emulation* were exercised.
- **Mobile performance:** emulator with software WebGL produced about **6 FPS**. This is a recorded performance concern, not a physical-phone benchmark.
- **Vercel deployment:** NOT_VERIFIED; no URL was supplied or visited. CI local production preview is not evidence of live Vercel.
- **LLM/autonomy:** no provider calls or decisions; remains MANUAL / DEV.
