# ETTA phase gate ledger — updated 2026-10-19

| Phase | Current evidence/status | Remaining limitation |
|---|---|---|
| P0 FOUNDATION | Vite/Three.js checks and Vercel deployment passed. Owner accessed production `/api/decision` and saw READY | Hosting/runtime logs not accessible through ChatGPT's connected Vercel scope |
| P1 BODY | CI_PASS S003/S004 actual Chromium and owner-used manual movement | No physical-device performance benchmark |
| P2 HOME | CI_PASS S004 real Chromium; owner manually used room, proximity and lamp | Other furnishings are currently noninteractive |
| **P3 MIND** | **CORE LIVE ACCEPTANCE MET — OWNER_REPORTED**: on 2026-10-19, real Gemma WAIT and TOGGLE_LAMP decisions were shown and lamp action executed after owner approval. POST request reached actual backend; Google and Redis checks were exercised by successful action. `GET /api/decision` returned READY. S006 packaging and #4 output-parser hotfix merged, tests passed | Actual raw provider output, Google usage dashboard and live Stop/blur/manual override were not independently recorded. CI validates these failure/override paths with fixtures; do not label production Stop as tested |
| P4 LIFE | S007 IMPLEMENTATION / CI FIXTURE: finite, owner-approved destination navigation with deterministic collision routing and interruption | Real Gemma rug navigation OWNER_REPORTED 2026-10-19; S008 finite episode CI_PASS in real fixture Chromium; owner live Gemma episode still NOT_RUN; no memory, simulated drives, routines, conversation or background service |
| P5 OPEN | EXPLORATORY | Requires later owner direction |

### Verification references
- S005 original deterministic/Chromium/Redis: [CI run 39139974285](https://github.com/jfairfaxball-348/ETTA/actions/runs/39139974285), [PR #2](https://github.com/jfairfaxball-348/ETTA/pull/2).
- S006 Vercel function packaging fix: [PR #3](https://github.com/jfairfaxball-348/ETTA/pull/3), merged commit `a810044`.
- Output-parser regression and fixture browser checks: [CI run 39226168465](https://github.com/jfairfaxball-348/ETTA/actions/runs/39226168465), [PR #4](https://github.com/jfairfaxball-348/ETTA/pull/4), merged commit `e3fe97e`. Vercel GitHub status reported successful deployment for this commit.
- **Live model action acceptance is owner-reported**, not CI; confirmed in conversation on 19 October 2026 after #4 deploy. No key, bearer token, Redis token, usage or private provider response has been placed in repo.

**S007 CI_PASS:** [run 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038), 31 Node, 17 room browser, 12 protected mind browser fixture checks; [screenshots and JSON](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095). **Live Gemma rug navigation was subsequently OWNER_REPORTED on 2026-10-19.** S007 implemented in [PR #6](https://github.com/jfairfaxball-348/ETTA/pull/6): shared geometry-derived allowlist (rug, writing table), bounded grid search, swept collision and finite walking. Node and Chromium fixture evidence must be distinguished from owner-tested live Gemma navigation (NOT_RUN). S008 has now passed hosted real-Chromium fixture acceptance and is documented in PR #7; live Gemma multi-decision autonomy remains NOT_RUN pending the owner's production exercise. S007 by itself was not autonomous life.


**S008 CI_PASS:** [PR #7](https://github.com/jfairfaxball-348/ETTA/pull/7). Bounded opt-in client orchestration retains the original strict protected API, 4/min and 40/day admission and world-validated actions. Browser tests are explicit TEST_FIXTURE, not live Gemma. No production real autonomous episode has yet been observed (NOT_RUN). [Hosted run 39241206176](https://github.com/jfairfaxball-348/ETTA/actions/runs/39241206176) PASS: 37 Node tests, Redis, Vercel packaging, 17 room and 14 mind Chromium fixture checks. Merge and live owner trial must be verified separately.


### Owner-directed next session inserted (planning only, 2026-10-19)
**S008.5 FUTURE / NOT EXECUTED:** remove public-facing project/dashboard noise, emphasise large 3D scene, four-digit PIN with shared failed-auth lockouts and safe Vercel migration, avatar-eye bounded image + text passed in one Gemma request, modular perception/interpretation/validated actions with optional extra calls under the existing shared budget. This is an owner-approved plan, **not** CI, browser, deployed or live-provider evidence. The original S009 furniture activities prompt is preserved at `authoritative/DEFERRED_S009_PROMPT.md`.
