# Quality and verification standard

## Source of truth and evidence labels

- `TESTED_LOCAL`: actually executed in a development environment; include command/output and environment.
- `CI_PASS`: exact hosted job/run succeeded; include GitHub Actions URL and head SHA.
- `MANUAL_OBSERVED`: direct real-browser observation with browser/OS, reproduction steps and defects.
- `DEPLOYED_VERIFIED`: real Vercel URL opened and tested; record HTTP + actual browser features checked.
- `NOT_RUN`: no execution evidence.
- `FAILED`: execution showed a defect; preserve reproducer.
- `BLOCKED`: required capability unavailable; describe why.

## Minimum per-session gate

1. Re-read baseline main/expected SHA.
2. Scope feature and acceptance criteria before editing.
3. Apply tests appropriate to the feature; fail closed when unavailable.
4. Verify reproducible build and inspect output logs.
5. Give one reproducible manual browser walkthrough for UI changes.
6. Confirm secrets absent from Git and client bundle.
7. Record source, checks, known limitations and independent/hosted evidence.
8. Install full NEXT_SESSION_PROMPT; mark future/unexecuted.

## Product-specific anti-sloppiness

- Rendering: programmatic compilation is not screenshot/browser evidence.
- Autonomy: a stub, randomized walk or engine fallback is not an LLM thought.
- Networking: an endpoint returning 200 with fallback is not proof model inference worked.
- Memory: bounded short-term in-process state is not persistent across server restarts.
- Hosting: Vercel project configuration is not a verified functioning deployment.
- Costs: \"free tier\" means quota-bound; no unlimited-inference assumption.

## CI for foundation

`npm run check` comprises typecheck, protocol tests and a production Vite build. Phase S002 must add WebGL/browser smoke evidence and a committed npm lockfile so CI can use `npm ci`.
