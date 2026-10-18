# Operating ETTA — S002

Requires Node 22.12+ and npm.

```sh
npm ci
npm run check
npm run dev
```

`package-lock.json` was generated in GitHub Actions from the S002 session branch (bot commit `c16c960b09c7d399f4ec37aa6cc7957a0b77cfd4`). CI is configured for reproducible `npm ci` installation. `npm run check` executes TypeScript checking, Node physics regression tests and Vite production build.

Click the 3D arena to focus. WASD/arrows move Etta relative to the orbit camera; Shift speeds up, wheel zooms, drag orbits, R resets, F1 toggles HUD. Touch-pad buttons on coarse-pointer devices move her without network requests. No model or autonomous decision loop exists.

Vercel target: import GitHub repo as a Vite static site, command `npm run build`, output `dist`. Do not set client-side API keys. No live deployment is verified; an HTTP response alone does not certify WebGL controls. See `sessions/S002/VALIDATION.md`.

For future P3 only: Google-hosted Gemma credentials must be stored as server-only `GEMINI_API_KEY` (never `VITE_*`), with a provider adapter, quotas, authentication, error handling and action validation. Never assume free unlimited usage.

## S003 browser acceptance check

The hosted CI `check` job now runs the application from a locked `npm ci` + Vite build, installs pinned `playwright-core@1.56.1` as a **CI-only transport** (`--no-save --package-lock=false`), starts production Vite preview and drives real headless Chromium via `node tests/browser-smoke.mjs`. It uploads `test-results/etta-desktop.png`, `etta-mobile.png`, `etta-final.png` and `browser-results.json` (when available). The source application still has no browser-test dependency and no API key.

**S003 evidence:** [Chromium CI run 39110275970](https://github.com/jball348-svg/ETTA/actions/runs/39110275970), exact source SHA `70e202bcb16ff1ca52fa8112e137c3b0ec4a25e9`, **15/15 browser checks PASS**, desktop Chromium, mobile touch emulation, WebGL fallback, input/collision/camera/reset and browser console. On an emulated phone, scroll to the stage before using its D-pad. SwiftShader software WebGL yielded about 6 FPS in emulation; real hardware performance is not established.

Vercel and physical mobile hardware are still unverified and must not be conflated with local production-preview Chrome acceptance.

## S004: first home
The playable area is now a furnished studio. E toggles the nearby standing lamp; the inspector button only enables within 1.65 world units. Reset returns Etta to the legal spawn and restores the lamp. Reload resets the home — **no persistence**.

S004 verification: [CI run 39114318840](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840) (10/10 Node tests, 17/17 genuine Chromium checks), screenshot artifact 12131721675. Headless touch emulation passed; physical device was not benchmarked.

**Owner-reported public URL:** https://etta-virid.vercel.app/ . After S004 is merged, ensure Vercel deploys the updated `main` and perform a live manual check: room rendering, WASD, doorway, lamp toggling, reset and touch pad. This independent live check has **NOT** been done in this session. Do not put a provider API key in Vercel until S005 has built a protected server-only adapter and abuse controls.

