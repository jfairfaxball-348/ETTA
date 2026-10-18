# S006 validation

## VERIFIED (live probe, before fix)
Deployed frontend asset hashes equal a local build of `4f48fcc`; `GET`/`POST /api/decision` → 500 `FUNCTION_INVOCATION_FAILED`. Owner configuration of server variables is unobservable while the function crashes.

## TESTED_LOCAL (Windows, Node 24.18.0)
- Reproduced with Vercel CLI 50.44.0 `vercel build` of `4f48fcc`: packaged `api/decision.js` imports `../server/decision.ts`; loading it → `ERR_MODULE_NOT_FOUND`. Same root cause as the live 500 (inferred: identical packaging; Vercel logs not accessed).
- With `rewriteRelativeImportExtensions`: packaged imports become `.js`; `tests/vercel-function.mjs` → GET 200 DISABLED, POST 503 DISABLED, runtime `nodejs24.x`. PASS.
- `tests/function-packaging.test.mjs`: FAILED on the old tsconfig (`api\decision.ts imports ../server/decision.ts`), PASS with the fix.
- `npm run check`: typecheck, **24/24 Node tests**, production build PASS.

## BLOCKED
- `git push` → 403: local GitHub credentials are `jball348-svg`, without write access to `jfairfaxball-348/ETTA`. No PR, hosted CI, merge or redeploy has happened from S006.

## NOT_RUN
Hosted CI for S006; redeployed function; any real Google/Upstash request; live approval/Stop walkthrough. Note: Vercel selects Node 24.x because `engines` is `>=22.12.0`, not the 22.x in the deployment doc.
