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
