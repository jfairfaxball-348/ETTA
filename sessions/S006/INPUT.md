# S006 input

Owner: "run next session" (2026-10-18). Local checkout was stale at `7700391`; fetched and fast-forwarded to authoritative main `4f48fcc1fb5c01301cf4cc07c373b9694a9aea10` (S005 merge, PR #2), which installs S006 LIVE MIND ACCEPTANCE. Executed S006 only. No credential was requested, read or reused from chat.

Entry probe (VERIFIED, curl, 2026-10-18 15:34 UTC):
- `https://etta-virid.vercel.app/` serves `assets/index-bUEHJ-hU.js` + `index-4cMuO2dz.css`, byte-identical asset hashes to a local `npm run build` of `4f48fcc` → the S005 frontend is deployed.
- `GET` and `POST /api/decision` → **HTTP 500 `FUNCTION_INVOCATION_FAILED`**. The deployed function crashes before running ETTA code; whether the owner's environment variables are configured cannot be observed.
