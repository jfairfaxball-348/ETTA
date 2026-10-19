# ETTA phase gate ledger — updated 2026-10-19

| Phase | Current evidence/status | Remaining limitation |
|---|---|---|
| P0 FOUNDATION | Vite/Three.js checks and Vercel deployment passed. Owner accessed production `/api/decision` and saw READY | Hosting/runtime logs not accessible through ChatGPT's connected Vercel scope |
| P1 BODY | CI_PASS S003/S004 actual Chromium and owner-used manual movement | No physical-device performance benchmark |
| P2 HOME | CI_PASS S004 real Chromium; owner manually used room, proximity and lamp | Other furnishings are currently noninteractive |
| **P3 MIND** | **CORE LIVE ACCEPTANCE MET — OWNER_REPORTED**: on 2026-10-19, real Gemma WAIT and TOGGLE_LAMP decisions were shown and lamp action executed after owner approval. POST request reached actual backend; Google and Redis checks were exercised by successful action. `GET /api/decision` returned READY. S006 packaging and #4 output-parser hotfix merged, tests passed | Actual raw provider output, Google usage dashboard and live Stop/blur/manual override were not independently recorded. CI validates these failure/override paths with fixtures; do not label production Stop as tested |
| P4 LIFE | S007 IMPLEMENTATION / CI FIXTURE: finite, owner-approved destination navigation with deterministic collision routing and interruption | Real Gemma rug navigation OWNER_REPORTED 2026-10-19; S008 finite episode implemented on branch, hosted CI and owner live run independently gated; no memory, simulated drives, routines, conversation or background service |
| P5 OPEN | EXPLORATORY | Requires later owner direction |

### Verification references
- S005 original deterministic/Chromium/Redis: [CI run 39139974285](https://github.com/jfairfaxball-348/ETTA/actions/runs/39139974285), [PR #2](https://github.com/jfairfaxball-348/ETTA/pull/2).
- S006 Vercel function packaging fix: [PR #3](https://github.com/jfairfaxball-348/ETTA/pull/3), merged commit `a810044`.
- Output-parser regression and fixture browser checks: [CI run 39226168465](https://github.com/jfairfaxball-348/ETTA/actions/runs/39226168465), [PR #4](https://github.com/jfairfaxball-348/ETTA/pull/4), merged commit `e3fe97e`. Vercel GitHub status reported successful deployment for this commit.
- **Live model action acceptance is owner-reported**, not CI; confirmed in conversation on 19 October 2026 after #4 deploy. No key, bearer token, Redis token, usage or private provider response has been placed in repo.

**S007 CI_PASS:** [run 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038), 31 Node, 17 room browser, 12 protected mind browser fixture checks; [screenshots and JSON](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095). **Live Gemma rug navigation was subsequently OWNER_REPORTED on 2026-10-19.** S007 implemented in [PR #6](https://github.com/jfairfaxball-348/ETTA/pull/6): shared geometry-derived allowlist (rug, writing table), bounded grid search, swept collision and finite walking. Node and Chromium fixture evidence must be distinguished from owner-tested live Gemma navigation (NOT_RUN). S008 is installed as **FUTURE / NOT EXECUTED** and will add the first opt-in bounded autonomy episode; S007 is not autonomous life.


**S008 branch under validation:** [PR #7](https://github.com/jfairfaxball-348/ETTA/pull/7). Bounded opt-in client orchestration retains the original strict protected API, 4/min and 40/day admission and world-validated actions. Browser tests are explicit TEST_FIXTURE, not live Gemma. No production real autonomous episode has yet been observed (NOT_RUN). Confirmation of merge, hosted CI, and live owner trial must be recorded separately.
