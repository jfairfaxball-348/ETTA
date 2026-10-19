# ETTA S007 — FIRST SELF-DIRECTED MOVEMENT (FUTURE / NOT EXECUTED)

**Invocation:** When the owner says "run next session" in ETTA, execute **S007 only** in `jfairfaxball-348/ETTA`. This prompt is installed for the future; it is not evidence that S007 work has started.

## Read first
Read live `main`, `AGENTS.md`, `PROJECT_CHARTER.md`, `ROADMAP.md`, `authoritative/STATE.json`, `sessions/S006/{VALIDATION,REVIEW,CLOSEOUT}.md`, `docs/PHASE_GATES.md`, and relevant `src/{world,simulation,input,main}.ts` and `src/mind/{protocol,controller,panel}.ts`, `server/{decision,provider}.ts`, and tests. The owner has approved the proposed S007–S014 roadmap. Preserve the live P3 bridge, and the separation between world-owned physics and model-chosen actions.

## One primary deliverable
Give Etta one new permitted decision: **choose a named reachable destination within her existing home and physically walk there after explicit owner approval**. Gemma chooses from a small server-derived allowlist of named destinations; it never supplies arbitrary coordinates, velocities, paths or code. Movement is completed by deterministic world-owned steering/pathfinding using the existing collision engine, with visibly rendered walking and a clear arrival/failure state.

- Start with at least two distinct, reachable, meaningful destinations (e.g., a safe approach to the writing table and an area near the doorway/rug), and include WAIT and existing nearby TOGGLE_LAMP unchanged.
- Derive waypoints/approach positions and target eligibility from immutable world geometry on both server and browser, with safe navigation clearances. Use deterministic, bounded routing around furniture/walls (e.g., a small verified grid planner); no teleportation, wall clipping, endless stuck animation or guessing unreachable target coordinates.
- Extend the strict typed model-action protocol and provider prompt; validate target IDs and permission/reachability, reject model-added fields and invalid routes. The model suggests WHAT; the world engine determines HOW. No provider calls during individual animation frames.
- Display the proposed destination and intent before **Approve action**; show walking/arrival/interruption while executing. A single approved move is finite and terminates.
- Manual movement, Stop, reset, navigation failure, tab blur/loss of focus and loss of permission must cancel safely. Document exactly when a new model request can be made, and avoid stale proposals or double execution.
- Keep current server-side private credentials, shared Upstash budget (application-set 4/minute and 40/UTC day), provider quotas, and failure-closed rules. Do not increase the budget without explicit owner direction. No autonomous loop, unsupervised navigation, persistent memory, background worker, voice or paid infrastructure.

## Acceptance and evidence
1. `npm run check` and relevant deterministic unit/security tests PASS. Test reachable/unreachable paths, collision clearance, arrival, cancellation, manual override and model-invented destinations.
2. Hosted CI and real Chromium fixture tests demonstrate a proposed named destination, manual approval, actual visible translation/turning to a legal arrival point, obstacle avoidance and manual override/Stop. Record screenshots/evidence; fixtures must be clearly labelled.
3. Preserve the currently working live WAIT/lamp bridge and deployment. For a real Gemma navigation call, do not use an owner's access code or secret through chat; document the owner-run live walkthrough separately as OWNER_REPORTED, unless independently observed. Do not claim it passed from fixtures.
4. Update `README.md`, `ROADMAP.md`, `docs/PHASE_GATES.md`, `docs/DECISIONS.md`, `authoritative/STATE.json` and `sessions/S007/{INPUT,PLAN,VALIDATION,REVIEW,CLOSEOUT}.md` honestly. Keep practical/lightweight session overhead.
5. Complete one named session branch + PR, review hosted checks, merge and verify main. Install a **full standalone S008 prompt**, marked FUTURE / NOT EXECUTED, targeting a short, opt-in, cost-capped autonomous episode. **Do not execute S008.**

## Important baseline
The owner confirmed on 2026-10-19 that production Gemma proposed WAIT and TOGGLE_LAMP and the lamp actually switched after approval. S006 packaging fix and later Gemma-format hotfix are merged. Production Stop/cancel walkthrough and physical-phone performance were not separately confirmed. Do not silently imply they were.
