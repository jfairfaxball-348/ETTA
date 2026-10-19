# S008 validation — CI_PASS; real Gemma episode NOT_RUN

- Source inspection: implementation in src/mind/episode.ts and UI wiring, branch session/S008-bounded-autonomy.
- Node tests in tests/episode.test.mjs exercise opt-in, spacing, three requests, movement serialization, early Stop, deadline, quota, invalid action and permission withdrawal.
- Browser fixture tests in tests/mind-browser.mjs exercise three decisions with real visible walking and WAIT, natural finish, early Stop, reload default OFF and TEST_FIXTURE provenance; not a live Gemma test.
- Hosted CI_PASS: [run 39241206176](https://github.com/jfairfaxball-348/ETTA/actions/runs/39241206176), SHA 0f131b3. 37/37 Node tests, Redis Lua, packaged Vercel function, 17 room + 14 mind real Chromium fixture checks, screenshot and JSON archival. Earlier strict TypeScript, stale browser expectation and session-ledger test failures were repaired. All steps in this run passed.
- Owner live Gemma rug move: OWNER_REPORTED (S007). S008 real multi-decision episode: NOT_RUN.
