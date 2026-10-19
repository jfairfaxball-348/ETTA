# S008 validation (pending final CI)

- Source inspection: implementation in src/mind/episode.ts and UI wiring, branch session/S008-bounded-autonomy.
- Node tests in tests/episode.test.mjs exercise opt-in, spacing, three requests, movement serialization, early Stop, deadline, quota, invalid action and permission withdrawal.
- Browser fixture tests in tests/mind-browser.mjs exercise three decisions with real visible walking and WAIT, natural finish, early Stop, reload default OFF and TEST_FIXTURE provenance; not a live Gemma test.
- First CI 39240406164 failed on unused strict TypeScript import; corrected in 568045b. Follow-up hosted CI is in progress; do not call it CI_PASS until explicitly checked.
- Owner live Gemma rug move: OWNER_REPORTED (S007). S008 real multi-decision episode: NOT_RUN.
