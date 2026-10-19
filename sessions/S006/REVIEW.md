# S006 review and retrospective — 2026-10-19

## Deliverable integrity
- Existing S005/room regressions retained; S006 correctly fixed per-file TypeScript → JavaScript imports in Vercel functions. PR #3 was subsequently merged; deployed function no longer produced the entrypoint 500 and owner later observed READY.
- Real model response was initially rejected by strict provider parsing, **not** by room geometry. A small follow-up [PR #4](https://github.com/jfairfaxball-348/ETTA/pull/4) strengthened exact format instructions, allowed safe complete JSON fences and split answer parts, and emitted specific fail-closed codes. [CI](https://github.com/jfairfaxball-348/ETTA/actions/runs/39226168465) passed, including fixture browser tests.
- Owner's first live test after #4 was successful for WAIT and TOGGLE_LAMP with visible approval. Etta did not execute the lamp action until the owner approved it. This is OWNER_REPORTED, not independent Vercel log inspection.

## Security and accuracy review
- No API keys, shared Redis tokens or private site access code are stored in these session files. Server-only Google/Upstash credentials and URL/permission checks remain in place.
- The model still cannot issue arbitrary actions, coordinates, provider endpoints or state mutation; legal proposals are rechecked by the world engine.
- Redis 4/minute and 40/UTC day are **ETTA-imposed** limits, with Google's quotas separate; budgets and costs will be revisited explicitly before multi-decision autonomy.
- The protected API currently accepts a syntactically/legal client-reported snapshot, rather than an authenticated server-run world. This is acceptable for the single-tab prototype, not proof of remote simulation authenticity.
- Live Stop/focus-loss, physical-device performance, actual provider telemetry and direct production runtime logs were not independently verified; keep these explicit NOT_RUN rather than implying success.

## Decision
S006's core live-mind gate is closed based on owner-reported end-to-end action evidence, with the above qualifications. S007 is installed as a **new, unexecuted** task to add approved, bounded self-directed movement. S008 remains the first planned bounded *unapproved per-step* opt-in autonomy episode, not part of S007. Project governance is deliberately lightweight.
