# Operating ETTA — live P3 handover, 2026-10-19

Node 22.12+; `npm ci`, `npm run check`, `npm run dev`. Development serves the browser and protected API; `.env.local` is server-only and ignored by Git. The built static preview keeps inference disabled. See [Vercel deployment and activation](VERCEL_DEPLOYMENT.md) for the exact settings.

Manual controls: focus the scene, WASD/arrows, Shift, drag orbit, wheel zoom, E lamp interaction, R reset and F1 HUD. Touch directional pad remains available. Reload resets state. The owner reported S004's deployed movement, nearby inspector and light switch working on 18 October 2026.

The new Ask Etta panel makes one explicit request, shows the observation/proposal/provenance and requires manual approval. Stop, movement, reset or manual interaction cancels pending work. No background requests, autonomy or persistent memory. Failed model outputs are visible errors, never rule-based substitute decisions.

## Reproducible validation

- `npm run check`: TypeScript (including server/API), deterministic contract/security/controller/physics tests, production Vite build.
- `node --experimental-strip-types tests/budget-integration.mjs`: the exact production Lua script against an isolated Redis on 127.0.0.1:6379; CI provides Redis 7.4. Verifies concurrent admission, daily cap and expiry.
- `node tests/browser-smoke.mjs`: real Chromium room/manual regressions against preview port 4173.
- `node --experimental-strip-types tests/fixture-server.mjs`, then `node tests/mind-browser.mjs`: real Chromium -> protected HTTP handler -> deterministic provider fixtures on 4174. Preview 4173 must also run. This is **not** a live Google or hosted Upstash test.

CI installs pinned `playwright-core@1.56.1` without saving it to the application lockfile and uses the runner's Chromium. Local browser tests can set `ETTA_CHROME` to an installed Chrome binary. Screenshots and JSON outcomes go to ignored `test-results/` and are uploaded by CI. See S005 VALIDATION for exact execution evidence and remaining gates.


## Live owner handover (2026-10-19)
After the S006 packaging repair and post-S006 [Gemma output fix](https://github.com/jfairfaxball-348/ETTA/pull/4), the owner observed `GET /api/decision` READY and obtained real WAIT and TOGGLE_LAMP proposals, then approved the lamp change. This is OWNER_REPORTED production success; CI provider responses remain explicitly mocked. Nothing runs without approval and there is no autonomous loop.

**Capacity:** Redis `server/budget.ts` enforces **4 requests per fixed minute and 40 per UTC day** across functions, including failed attempts after reservation. **This is our cap, not Gemma's; Google's quota applies separately.** Keep it unchanged for S007. Do not store live tokens in source or logs.

Production runtime logs could not be retrieved by ChatGPT under the connected Vercel scope (403); owner can inspect logs in the project's Vercel dashboard. Production Stop/focus-loss and physical-device checks remain unobserved by the owner; include in S007 acceptance.


## S008.5 current operation

Open the room and walk normally. 3D fills the available viewport; F1 or Debug reveals developer telemetry, hidden by default. Etta's AI is OFF until the PIN unlock. In the pre-migration LEGACY mode only, the old access-code input remains accessible. **Stop** cancels a pending request, proposal, finite walk or episode without disabling the PIN unlock; **AI OFF** cancels and clears the in-tab PIN. The screenshot of Etta's own visual field is captured only on Ask or at one of the bounded autonomy decisions and may be inspected in fixture CI artifacts (`etta-avatar-eye.jpg`). Never treat fixture acceptance as a real-provider trial.

CI runs Node schema/PIN/throttle checks, exact Redis Lua concurrency, Vercel packaging and desktop/mobile Chromium fixture regression. Auth failure caps are **6 per client and 60 globally per 15-minute fixed bucket**, independent of the existing 4/min and 40/day provider-request budget. Lockout messages are generic. No paid service or separate mind loop was enabled here.

Owner production acceptance after PIN deployment: confirm READY and accessMode PIN; enable AI with the private PIN, Ask Etta once, inspect the model-origin perceived scene and safe WAIT/MOVE_TO/TOGGLE_LAMP choice; approve only when appropriate; exercise Stop and AI OFF. Record outcome as OWNER_REPORTED and no secret/image or raw user credential in logs.

## S008.5 production timeout remediation
Owner reported a 12-second multimodal episode failure on 19 October 2026. The text-only deadline was still configured despite new image input. Server/browser/function limits have been aligned at 40/45/50 seconds; cancellation remains immediate, one-request-per-decision and S008 60-second episode limit unchanged. Missing model responses consume the existing Redis reservation. Runtime logs were denied (403) by the connected Vercel scope; local/CI fixture tests cannot prove real Google latency. A failed request is not evidence of a budget exhaustion unless the API explicitly returns `BUDGET_EXHAUSTED` or `BUDGET_UNAVAILABLE`.
