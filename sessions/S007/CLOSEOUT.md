# S007 closeout — implementation handover (19 October 2026)

**Objective:** Etta may select a named rug or writing-table destination as a `MOVE_TO` action, pending explicit owner approval; deterministic physics moves her there with collision clearance and clear Stop/arrival states.

**Code:** `src/navigation.ts` (shared safe destination geometry, bounded 25 cm route search and world-owned walk); `src/mind/{protocol,controller,panel}.ts`, `src/main.ts`, `server/provider.ts`; expanded deterministic and real Chromium fixture integration coverage in `tests`.

**Review:** S007 adds exactly one approved walking action, *not* S008 multi-decision autonomy. WAIT/lamp and 4/minute, 40/UTC-day global ETTA-owned budget remain. No new credentials or billing. Mark a live Gemma navigation test NOT_RUN until the owner independently tries it on production.

**PR:** [#6](https://github.com/jfairfaxball-348/ETTA/pull/6). **CI_PASS:** [GitHub Actions 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038) (31/31 Node, Redis, packaged API, room and mind fixture Chromium; screenshots [artifact 12179209095](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095)). This is application/test evidence only, not real Gemma navigation. PR merge/main verification must be checked separately; this closeout text does not predict their results.

**Next:** S008 is installed as a complete standalone **FUTURE / NOT EXECUTED** prompt below. Do NOT carry out S008 in this invocation.

---

# ETTA S008 — FIRST BOUNDED OPT-IN AUTONOMOUS EPISODE (FUTURE / NOT EXECUTED)

**Invocation:** When the owner says “run next session” after S007 is merged, execute **S008 only** in `jfairfaxball-348/ETTA`. This is a future handover, not proof that S008 work began.

## Read first
Read latest `main`, `AGENTS.md`, `PROJECT_CHARTER.md`, `ROADMAP.md`, `authoritative/STATE.json`, `sessions/S007/{INPUT,PLAN,VALIDATION,REVIEW,CLOSEOUT}.md`, `docs/PHASE_GATES.md` and current navigation/mind/server sources and fixture browser tests. Preserve S007 production controls, named reachable destinations, approval gate for ordinary one-off decisions, and the current live WAIT/lamp bridge.

## Single primary objective
Build ETTA's first **owner-initiated, observed, finite independent episode**. With an explicit Autonomy ON command the owner opts into one limited window in which Etta may request and carry out successive permitted actions without separate approval for every action, then stops automatically. This is opt-in automation of a simulated character, not sentience or background self-operation.

- **Default OFF and fail closed.** Keep manual Ask Etta + per-action approval as the default. The owner must deliberately enter a short-lived episode each time, clearly seeing that the episode authorises multiple actions. Never auto-start on page reload.
- **Hard session bounds:** at most **3** model decisions, at most **60 seconds** wall-clock episode duration, strictly serial requests, and a minimum 3-second interval between decisions. If any action is still executing, do not request another. Each episode terminates on completed bounds, Stop, failed model output, missing permission, HTTP failure, browser blur/hidden/pagehide, reset, manual movement or navigation timeout.
- **Shared budget unchanged:** retain ETTA's Upstash 4 attempts/minute and 40 attempts/UTC-day global cap, independent of Google's quotas. An episode must never bypass admission controls, fire retries, use hidden polling, add cron/paid services or assume that free hosting is limitless. Show clear request usage for the episode and give the owner a Stop control at all times.
- **World controls outcomes:** Gemma chooses one action from `validActions` (WAIT, permitted lamp toggle, or named reachable MOVE_TO); the deterministic world engine alone validates permission, calculates route and executes movement. No raw positions, code, velocities or arbitrary network actions; no per-frame provider calls.
- **Useful observability:** label episodes `AUTONOMY ACTIVE` / `STOPPED` and display action provenance, current objective, decision number, remaining decisions, elapsed time and finished/failed reason. Preserve `MODEL_DECISION` vs `TEST_FIXTURE` provenance explicitly. No secret telemetry or access codes in localStorage/committed files.
- **Interaction with manual controls:** Stop, WASD/touch controls, reset, manual lamp action, tab blur/loss and failed permission checks cancel both in-flight fetches and active walks. No orphaned delayed callback may restart an episode. Bound waits so WAIT cannot spin a rapid request loop.
- **One-tab only.** No saved memory, background service, browser-tab-free agent, communication, speech, new environments or additional infrastructure in S008. These remain later milestones.

## Acceptance / honest evidence
1. `npm run check` passes with deterministic tests proving episode bounds, complete cancellation, failures, provider quota rejection, manual priority, stale response discard, no overlapping requests, WAIT spacing and no automatic start after reload.
2. Hosted CI and **real Chromium with explicit model fixtures** exercise start → at least two authorised decisions → visible movement/interactions → natural finish and early Stop; archive video/screenshots/results where practical. Fixture behaviour must not be labelled live Gemma autonomy.
3. Owner-run **real Gemma** episode is documented separately as OWNER_REPORTED only after it genuinely occurs. Do not use/store the private access code or Google/Redis tokens in ChatGPT messages or CI.
4. No budget increase, new billing or hosted background execution without owner authorisation. Keep the current production live room safe if delivery is blocked.
5. Update `README.md`, `ROADMAP.md`, `docs/{DECISIONS,PHASE_GATES}.md`, `authoritative/STATE.json`, and `sessions/S008/{INPUT,PLAN,VALIDATION,REVIEW,CLOSEOUT}.md` using lightweight practical ceremony.
6. Work on a named branch, review hosted checks, merge if safe, reread main and install a complete **S009 FUTURE / NOT EXECUTED** prompt for meaningful object interactions. Do not run S009 in the S008 session.

## Ground truth at installation
S006 real WAIT and approved lamp toggle are OWNER_REPORTED. S007 introduces only owner-approved world-routed walking; no independent autonomy or persistent memory. Any S007 live navigation walkthrough not yet owner-confirmed remains NOT_RUN, even if fixture Chromium passes.

