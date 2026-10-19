# ETTA S008.5 — four-digit PIN rollout, 19 October 2026

**Production:** https://etta-virid.vercel.app/ · [source PR](https://github.com/jfairfaxball-348/ETTA/pull/9).

## Safe migration from the existing long access code

1. Keep the existing server-side `ETTA_ACCESS_TOKEN`, `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `GEMMA_MODEL`, and `ETTA_MIND_ENABLED=true` **unchanged** during the code rollout. The new code supports a labelled **LEGACY** code input when `ETTA_ACCESS_PIN` does not yet exist. This prevents stranding the working production mind just by updating code.
2. In **Vercel project → Settings → Environment Variables**, add a private `ETTA_ACCESS_PIN` for Production, with **exactly four decimal digits** of your choosing (leading zeros allowed). Do not put this value in chat, GitHub, client variables (`VITE_*`) or screenshots. Redeploy the current `main` commit after setting it. If the new code is already live, the PIN mode automatically supersedes the old token on that redeployment.
3. In the browser visit `/api/decision` (GET). Expect `status: READY` and `accessMode: PIN`; neither the PIN nor API key should appear. Open the home, click **AI OFF**, enter the PIN, press **Unlock AI**. Expect **AI ON**. Bad PINs must fail; avoid repeated intentional guessing. Ask one decision: one avatar-eye JPEG and server-owned textual observation go to Gemma. Approve a valid action if appropriate; check Stop and AI OFF.
4. **Only after owner acceptance**, remove the obsolete `ETTA_ACCESS_TOKEN` environment variable and redeploy. If PIN-mode fails, set `ETTA_MIND_ENABLED=false` to disable inference while investigating; manual home remains accessible. Alternatively remove PIN and redeploy with the legacy token still present to restore LEGACY mode. Do not publish the PIN or create a client-side bypass.

Set `ETTA_MIND_ENABLED=false` to keep AI off regardless of keys. Supported `GEMMA_MODEL` values remain `gemma-4-26b-a4b-it` (default) and `gemma-4-31b-it`. Provider credentials and Upstash REST token are server-only. Do not enable Google billing or higher quota as part of this session.

## What is limited

The PIN offers only 10,000 possible combinations and **is not strong authentication**. An atomic Upstash script caps **6 incorrect PINs per reported Vercel client and 60 incorrect PINs globally per 15-minute fixed window**, failing closed when Redis cannot be contacted. These limits can temporarily block correct PIN entry; the site is not suitable for adversarial/public multi-user deployment without stronger auth. Vercel's platform-overwritten forwarding header is used only when running on Vercel; otherwise all requests share the unknown-client bucket. Cross-site POST is refused.

Successful unlock calls do **not** spend model budget. An actual decision still requires a separate shared atomic allowance of **4 requests per minute and 40 per UTC day**, independently of Google project's model quota. Failed/timeout attempts after reservation count; no automatic retries or scheduled/background inference. A bounded active episode is capped at three requests and 60 seconds, with three seconds between decisions. Each request sends a 384×216 JPEG and canonical geometric observation together in one `generateContent` call, limited to 128 KiB decoded JPEG / 220 KiB JSON request / 256 output tokens / 12-second server decision timeout. The server does not store submitted images.

## Status and owner proof

Node, Redis and Chromium use **TEST_FIXTURE** images/model outputs to check the mechanism. **Real Gemma image understanding: NOT_RUN** until an owner trial. A green deploy alone does not establish the new PIN or real image was received by Google. Document model ID, one explicit request, resulting action/approval and time without saving the PIN, image or provider key.

See [operations](OPERATIONS.md), [architecture](ARCHITECTURE.md) and [phase evidence](PHASE_GATES.md). Reference: [Vercel forwarded headers](https://vercel.com/docs/headers/request-headers), [Gemma image input](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).
