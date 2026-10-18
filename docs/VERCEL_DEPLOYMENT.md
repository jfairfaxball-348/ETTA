# Deploy ETTA on Vercel — S005

Use **jfairfaxball-348/ETTA**, production branch `main`, root directory `./`, Vite preset, Node 22.x, install `npm ci --no-audit --no-fund`, build `npm run build`, output `dist`. `vercel.json` also configures the Node `/api/decision` function with a 20-second maximum duration. The existing owner-reported site is https://etta-virid.vercel.app/ . Do not import from the former GitHub account.

## Room only

No settings are required. With missing credentials or `ETTA_MIND_ENABLED=false`, the API reports DISABLED and the room/manual controls remain available. Deploying code does not enable inference.

## Enable one manually approved decision

In **Vercel → Project → Settings → Environment Variables**, configure these for the environments you intend to use, then redeploy. Keep preview inference disabled unless you intentionally configure it too.

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio key; server only |
| `GEMMA_MODEL` | `gemma-4-26b-a4b-it` (default); also supports `gemma-4-31b-it` |
| `ETTA_ACCESS_TOKEN` | A new random 32–128 character token using letters, digits, `_` or `-` |
| `UPSTASH_REDIS_REST_URL` | Your Redis HTTPS REST URL, e.g. `https://<database>.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | The database's REST token with EVAL/read/write permissions |
| `ETTA_MIND_ENABLED` | `true` only after the other settings and quotas are ready |

Generate an access token locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Save it privately. Enter **that access token** in the website's private-access-code field. The Google API key belongs only in Vercel; the website never asks for it. Clear code removes the site token from the tab. Reload also forgets it.

A small Upstash Redis database provides a shared atomic budget across Vercel instances: **4 attempts per minute and 40 per UTC day**, including provider failures. You can connect an existing database or provision one yourself through Upstash/Vercel Marketplace after checking its plan and limits. This session created no account, database, subscription or billing. The Google key alone intentionally does not enable inference. All deployment environments pointing at the same Redis database share this budget. Do not delete budget keys to bypass the limits.

Review the Google project's active model quotas in AI Studio, keep them at a suitable low ceiling and leave billing disabled if you want to stay on an available free tier. Availability and quotas are project-dependent; there is no unlimited usage assumption. Provider quotas are an additional backstop, not a substitute for the shared application budget. The Redis limits bound request counts, not all hosting/storage costs. The private access code must not be distributed publicly.

Requests use one candidate, at most 256 output tokens, a 2 KiB client body, a 16 KiB provider response and a 12-second combined budget/provider deadline (3 seconds maximum for the budget check). No retries. Inference fails closed if the shared budget cannot be verified. No arbitrary endpoint/model selection is accepted from the client.

## Live acceptance walkthrough

1. Confirm Vercel deployed the intended commit. Open `/api/decision` in the same site's tab: status should be READY only with complete configuration.
2. Open the room, leave Etta near the lamp at spawn, enter the private access code and press Ask Etta. Verify a response marked MODEL_DECISION with a model name and latency. The lamp must not change yet. An invalid code should visibly fail without a model request.
3. Verify the displayed observation matches Etta's position, nearby lamp and lamp state. Approve a valid toggle proposal to change the lamp via the world engine. WAIT is a valid model choice; do not call it a failure, and do not substitute a rule-based toggle. A real toggle proposal is needed to close the full world-change gate.
4. Ask again, then Stop or move/reset. Approval must disable; a late response must not run. Check manual E/button interaction still works. Do not intentionally exhaust an expensive provider quota to test this: deterministic CI covers limits/failures.
5. Record date, commit, real model ID, latency, action, approval result and source/model provenance without recording tokens or raw credentials. Check Google usage for the deliberate request.

**Live Google, live Upstash and this Vercel function deployment remain unverified until that walkthrough.** The owner separately reported S004 room/movement/lamp/proximity working. Physical-phone performance remains unmeasured.

## Local development and troubleshooting

Copy `.env.example` to ignored `.env.local`, configure it and run `npm run dev`. Vite's development server hosts the same handler. `npm run preview` deliberately uses disabled configuration. Fixture tests require no credentials and make no external calls.

- DISABLED: missing enable flag, key, 32+ character access code, Redis settings, or unsupported model. Fix server variables and redeploy.
- 401: the site's access code is wrong. Do not replace it with the Google key.
- 429: shared request budget or provider quota exhausted. Wait; there is no auto-retry.
- 503 budget unavailable: Redis is unavailable or misconfigured; no provider request is made.
- 502/504: provider rejection, invalid output or timeout. Nothing executes; inspect configuration, then deliberately retry if appropriate. Secrets and upstream error bodies are not logged by this application.
- 404 at `/api/decision`: ensure the repository root, not `dist` or `src`, is configured as the project root and redeploy the commit containing `api/decision.ts`.

## References checked 18 October 2026

- [Google: Gemma on Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api) — model names, generateContent and minimal thinking.
- [Google: active project rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
- [Vercel: Node Web Standard functions](https://vercel.com/docs/functions/runtimes/node-js).
- [Upstash: Redis REST API](https://upstash.com/docs/redis/features/restapi).
