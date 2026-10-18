# ETTA architecture — S005

The browser owns the single-tab simulation: `world.ts` defines stable objects and interaction permissions; `simulation.ts` owns body collision and movement; `scene.ts` renders these values. Reload resets all state. S004 room/physics behavior is retained.

## One decision, manually approved

1. `src/mind/panel.ts` captures the body and lamp from the engine on **Ask Etta**. The private site code stays in the password input in this tab and travels only in an Authorization header. It is not a provider key, cookie or persisted credential.
2. `controller.ts` stops motion, keeps an exact snapshot and allows one request in flight. The observation inspector records the submitted context. Recent activity is capped at six entries in memory.
3. `api/decision.ts` is a Vercel Node Web Standard entry point. `server/decision.ts` authenticates, checks origin/content type/body size and validates the minimal snapshot. The server reconstructs labels, distances and legal actions from canonical geometry, ignoring no extra fields: extras are rejected. It never accepts a caller-supplied prompt, model, URL or action list.
4. `server/budget.ts` reserves one attempt with a single atomic Redis Lua script. All instances share 4 attempts per fixed minute and 40 per UTC day. Redis owns the clock; failed attempts still count; counters expire. Missing or failed Redis disables inference. Google quotas remain a separate backstop.
5. `server/provider.ts` makes one bounded Google generateContent call, with no retries. It validates a complete JSON proposal against the snapshot; no fabricated fallback. Model text is never applied as state or rendered as HTML.
6. The browser validates the response against its current snapshot and displays provenance, action, short intent, model and latency. Nothing executes until **Approve action**, which consumes the proposal once and rechecks live world permissions through `interact`. WAIT is a no-op. Any changed snapshot, movement, manual interaction, reset, Stop, focus loss or expiry discards the proposal. Late responses cannot resurrect it.

`src/mind/protocol.ts` is shared but has no secrets or server dependencies. It enumerates only WAIT and TOGGLE_LAMP(lamp); extra targets, coordinates and fields are rejected. Body radius is engine-owned. Observations include nearby furnishings within 2.15 units; the lamp action requires 1.65 units. Other furniture has no actions.

## Boundaries

The server validates a **client-reported** room snapshot, not a persistent server-owned multiplayer world. A modified client cannot create new server affordances, but can submit a different geometrically legal snapshot; this prototype does not establish remote simulation authenticity. Execution is checked in the actual local engine.

Production has no fixture-mode environment switch. `tests/fixture-server.mjs` injects a deterministic transport into the real protected adapter and marks every successful response TEST_FIXTURE. Its server is never imported by production. A real Google call alone emits MODEL_DECISION. This is not evidence that the live provider has been configured or tested.

Provider/Redis keys remain server-side. No personal data, free-text chat, memory, background worker, provider retries or continuous autonomy is introduced.
