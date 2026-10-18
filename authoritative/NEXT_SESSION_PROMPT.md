# ETTA S005 — FIRST MIND BRIDGE: SECURE, MANUALLY TRIGGERED DECISION (FUTURE / NOT EXECUTED)

**Complete standalone next-session instruction. S005 has NOT been executed.** Saying "run next session" in the ETTA project authorises S005. Keep this a practical software milestone, not a mathematics-style audit.

## Starting point
Repository: `jfairfaxball-348/ETTA`, default branch `main`. Read current main SHA, `README.md`, `ROADMAP.md`, `authoritative/STATE.json`, `src/world.ts`, `src/simulation.ts`, `src/main.ts`, relevant operation/security docs, and S004 closeout. Respect the owner-reported deployment `https://etta-virid.vercel.app/`: that site must be separately smoke-tested; don't assume it has the latest GitHub build. Etta's first room, walls, furniture, door, manual controls, nearby-object inspector and toggleable lamp were browser-tested in S004. No LLM, memory or autonomy is present.

## Mission
**Begin P3 MIND, without starting P4 LIFE:** let a deliberate user action request one bounded, *genuine model-sourced* proposal based on the real world snapshot. The world, never the model, owns state, collision and action permissions. Never mislabel a fallback as AI reasoning.

## Build target
1. Make a server-only Vercel API endpoint (or equally secure approved backend) for Google's Gemma/Gemini-compatible provider; read provider credentials solely from server environment (e.g. `GEMINI_API_KEY`), never from `VITE_*` or HTML. No secret committed or echoed. No paid infra assumed.
2. Protect the public endpoint from uncontrolled expense: explicit opt-in configuration, authentication/access control, body-size limits, provider request timeout, bounded tokens, error responses and practical cost/rate-limit controls. A per-instance in-memory limiter alone is not globally reliable for serverless; explain the limit and use provider-side hard quota where applicable. **Do not activate production inference if abuse prevention is incomplete.**
3. Provide a serializable, minimal legal world observation: own position/facing, nearby objects/labels/distances, lamp state, and enumerated valid actions. Prevent rendering-only meshes or model fiction from entering world truth.
4. Define and validate a typed, finite action proposal schema. At minimum, support `WAIT` and one meaningfully grounded action (e.g. propose moving towards an object or toggling the lamp). Invalid IDs, out-of-bounds targets and disallowed interactions must be rejected. **Model outputs are proposals, not privileged state writes.**
5. Expose one explicit `Ask Etta` developer control. Show provenance (MODEL_DECISION, MANUAL, ERROR, DISABLED) and the proposed action. Require manual approval before executing a proposal in S005, and permit an immediate manual stop/override. Avoid periodic/unbounded autonomous loops; P4 comes later.
6. Preserve S004 studio and mobile/manual movement regressions. Simulate adapter responses deterministically for CI, and test adversarial/invalid payload handling. Mark mocked responses as fixtures and never claim a live provider call without provider evidence. Add actual end-to-end API/model testing only when configured and safely accessible.
7. Update the practical session record, roadmap, deployment instructions, and `authoritative/STATE.json`. Record exact tests and limitations; install a complete S006 FUTURE / NOT EXECUTED prompt after finishing.

## Acceptance
P3 first bridge counts only if browser user action reaches the protected adapter, the proposal is validated against live world state, manual approval changes world state through existing physics/permissions, and a full stop/error path is visible. Security and mock-vs-real provenance are mandatory. If actual API credentials are unavailable, keep provider integration explicitly **UNVERIFIED** and S005 incomplete at the live-model gate rather than inventing success. Use a normal branch/PR, hosted tests, merge after passing checks, and reread main. No unsupervised continuous life, long-term memory or voice in S005.
