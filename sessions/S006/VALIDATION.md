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

## S006 continuation / live gate update — 2026-10-19

This section records what occurred **after** the original S006 `git push` blocker above. The earlier validation is historical, not the current state.

- **VERIFIED / GitHub:** S006 packaging repair was pushed to `jfairfaxball-348/ETTA` and merged via [PR #3](https://github.com/jfairfaxball-348/ETTA/pull/3) as `a810044` on 18 October. GitHub's Vercel status on the merge SHA was `success`. Original local write limitation was overcome through the owner-authorized GitHub connection; it is not a current blocker.
- **OWNER_REPORTED / deployed backend:** Owner opened `https://etta-virid.vercel.app/api/decision` and saw `READY` with limits 4/minute, 40/UTC-day, max output tokens 256 after adding private production configuration. No secret values were recorded.
- **OWNER_REPORTED / live failure and repair:** An initial live Ask Etta response was `INVALID_MODEL_OUTPUT`. Parser diagnostics/JSON normalization were fixed in [PR #4](https://github.com/jfairfaxball-348/ETTA/pull/4), merged as `e3fe97e` on 19 October.
- **CI_PASS / PR #4:** [Actions 39226168465](https://github.com/jfairfaxball-348/ETTA/actions/runs/39226168465) succeeded: Node and typecheck, production build, Redis integration, packaged Vercel function, Chromium room and mind tests **using model fixtures**, not real Google. GitHub reported Vercel deployment `success` for merged `e3fe97e`.
- **OWNER_REPORTED / live success:** After the #4 production deployment, owner confirmed two real Gemma choices: WAIT once and TOGGLE_LAMP once; the owner approved the latter and the lamp switched. This supports actual provider + Redis + server action pipeline, but does **not** establish independent observation of provider payloads or billed usage.
- **NOT_RUN / independently:** Production runtime logs were not available to ChatGPT because the connected Vercel identity cannot access `jball348`-scoped logs (403); no independent captured live raw model response, access-token audit, production Stop/blur race or physical-phone benchmark. Deterministic CI covers the cancellation mechanics but does not substitute for the production walkthrough.
- **Gate decision:** Core P3 model-to-approved-world-change acceptance achieved on the owner's direct observation. Any remaining live Stop/cancellation demonstration is a nonblocking follow-up regression for S007; label it separately. Neither autonomous episodes nor navigation is present.

The request budget is **ETTA's Upstash Lua admission rule** (`server/budget.ts`), not a Google/Gemma service rate limit. Google's project quotas also apply. Shared counters can reject attempts before provider invocation; requests that get as far as the model still count toward Google's limits.
