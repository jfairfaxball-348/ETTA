# ETTA S009 — TWO MEANINGFUL HOME ACTIVITIES (FUTURE / NOT EXECUTED)

**Invocation:** Once S008 has been validated and merged, the owner's next “run next session” executes S009 only in jfairfaxball-348/ETTA. Installing this prompt does NOT execute it.

## Authoritative reread
Read live main, AGENTS.md, PROJECT_CHARTER.md, ROADMAP.md, authoritative/STATE.json, the S008 closeout and validation, plus world/simulation/navigation/mind/episode sources and tests. Preserve all existing manual controls, S008 limits, real provider trust boundary, shared Redis budget, and fixture/live evidence labels.

## One objective
Give Etta **at least two new, meaningful, visible home interactions** using deterministic, inspectable world rules, available both through manual controls and the model's allowlisted choices. Preferred first candidates: (1) SIT_AT_CHAIR with a clear sitting/standing state and animation, (2) EXAMINE_WRITING_TABLE with a visible, reversible examination/notebook interaction. Prefer better physically grounded interactions if source constraints make these impractical, but document substitutions. Mere text messages with no world-state change do not count.

- World engine defines affordances from proximity, collision geometry and body state, independently of model. No raw coordinates, free-form code or arbitrary object IDs from Gemma.
- Manual player must be able to start/stop activities. Activity state and animation must be legible on desktop and touch.
- Valid actions reflect context, e.g. no sitting while walking or toggling the lamp from outside reach. Existing WAIT, nearby lamp and named destinations remain intact. Routes, stationary activities and interrupting actions must compose safely.
- Manual Ask remains per-action approval; S008 bounded autonomy may execute newly permitted actions within the same 3-decision/60-second window, never beyond it. Keep 3-second spacing, single request in flight and default OFF.
- Explicit precedence: Stop, manual steering, reset, tab blur/hidden/pagehide, API/budget failure, invalid state/permission and activity timeout interrupt the activity. No orphan animations, phantom transitions or runaway requests.
- No persistent memory, motivation, routine, conversation, voice, new rooms, background workers or new cloud billing in S009. S010 is the earliest memory candidate.

## Acceptance
1. npm run check passes and new Node tests prove action allowlists, world-owned transitions, near/far restrictions, independent activity exits, resets and races with autonomy/Stop/manual controls.
2. Hosted CI and real Chromium with labelled TEST_FIXTURE proposals show two real visible activities, safe interruption and regression of current walking/WAIT/lamp/manual workflows. Archive screenshots/results where feasible.
3. Preserve model/fixture provenance and usage accounting in UI. Do not claim live Gemma ran either activity unless the owner performs a genuine real-provider trial.
4. Update README, ROADMAP, decision and phase ledgers, STATE.json, and session S009 practical INPUT/PLAN/VALIDATION/REVIEW/CLOSEOUT.
5. Use a named branch and PR, review hosted checks, merge if safe, reread main, and install full S010 FUTURE / NOT EXECUTED prompt for transparent bounded memory. Do not execute S010 in S009.

## Current known ground truth
S007 live Gemma rug navigation was OWNER_REPORTED on 2026-10-19. S008's implemented episode is a finite opt-in orchestration of simulated actions, not sentience or an always-on agent. S008 owner real-Gemma episode requires separate confirmation. The shared 4/min and 40/day cap is imposed by ETTA and must not change without owner approval.
