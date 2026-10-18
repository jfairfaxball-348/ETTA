# ETTA S004 — GIVE ETTA A HOME: FIRST INHABITABLE ROOM (FUTURE / NOT EXECUTED)

**Complete standalone next-session prompt.** This S004 instruction was installed at S003 closeout; **S004 IS FUTURE / NOT EXECUTED**. Owner saying "run next session" with ETTA in context authorises this **one** session only. Do not execute S005 during S004.

## Preflight
Repository: `jfairfaxball-348/ETTA`; authoritative default branch `main`. Read live main SHA and the full `AGENTS.md`, `PROJECT_CHARTER.md`, `ROADMAP.md`, `authoritative/STATE.json`, `docs/PHASE_GATES.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/OPERATIONS.md`, and S003 records and CI artifact/run links. Check open PRs and avoid branches diverged from current main.

P1 BODY has automated Chromium verification; Vercel and physical mobile performance are separately unverified. The primary objective is **P2 HOME**. Keep manual controls, world-owned physics, diagnostic HUD and no model autonomy. **Do not implement P3 LLM or P4 life** in this session.

## Mission
**Give Etta her first small, coherent and explorable home.** Replace the abstract test arena with one lovingly but modestly staged interior or tiny studio containing floor, walls, one door/opening and a few recognisable furnishings. She must be able to walk through it with developer controls and stop against solid furniture and walls. Avoid a sprawling town or empty decorative shell.

## Required work
1. Define a small authoritative world-state model for static architecture and furnishings: stable object IDs, bounds/footprints, labels, relevant properties and deterministic reset. Do not infer object truth from the render mesh.
2. Add one coherent room and a clear entrance/threshold. Furnish with at least a bed, table, chair, lamp or equivalent simple assets. Use procedural meshes and tasteful styling; don't import heavyweight asset packs blindly. Make Etta visually readable.
3. Make floor, walls and furniture consistent with movement physics; guarantee no walking through solids. Preserve camera-relative WASD/arrows, Shift, orbit/zoom, R, F1/HUD, blur safety and touch. Reset must restore room and body without teleporting through objects.
4. Expose a **non-autonomous affordance inspector**: identify nearby objects from actual world distance, with explicit state and possible manual interaction hooks. If time permits, implement exactly one tested manual interaction (e.g. light on/off or chair sit) with reversible state and reset. Never claim simulated rules are model thoughts.
5. Avoid falsely promising house persistence: a page reload may reset local state until a later explicit persistence design.
6. Extend deterministic tests for room layout, legal spawn, collision, door passage, object bounds and replay/reset; add genuine browser smoke cases/screenshots for navigating in the furnished room on desktop. Retain existing S003 Chrome regression suite, updating its former arena-only assertions with evidence-backed home checks.
7. Inspect performance on desktop and emulated mobile. Previously observed headless mobile SwiftShader ~6 FPS, not a measured real-phone rate. Limit excessive draw/shadow cost where it improves responsiveness without hiding problems.
8. If actual Vercel preview credentials/URL already exist, visit and inspect; don't claim deployment from configuration alone and don't create paid infrastructure.

## Acceptance and closeout
Pass a first P2 vertical-slice gate only when room/object state, rendered body, collision, door passage and any claimed interaction are verified in actual Chrome with screenshots and deterministic tests. If incomplete, keep P2 in progress and target S005 to the gap.

Produce `sessions/S004/{INPUT,PLAN,VALIDATION,REVIEW,CLOSEOUT}.md`; update authority, roadmap, phase and decision ledgers; install the **entire standalone S005 FUTURE / NOT EXECUTED prompt**. Use one S004 branch, normal PR, hosted checks and merge only with evidence. Independently reread main after merge and include the complete S005 prompt in the owner closeout. No P3 model connection or P4 autonomous choices in S004.
