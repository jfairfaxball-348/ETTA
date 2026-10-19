# S007 validation — 19 October 2026

## Evidence observed during implementation

- **CI (run [39236410379](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236410379))**: TypeScript, production build, **31/31 deterministic Node tests**, actual Redis integration, Vercel function packaging and existing 17 room Chromium checks passed. New Chromium fixture tests demonstrated walking and arrival, but failed two assertions that compared formatting/dynamic telemetry rather than the intended world-state outcome; these assertions were corrected in a follow-up commit.
- **CI (run [39236278711](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236278711))**: Initial Node strip-only parameter-property failure in new navigator; corrected by explicit constructor assignment.
- **CI (run [39236746951](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236746951))**: 31/31 deterministic tests passed, scaffold handover assertion still expected S007 rather than S008; updated in this branch.
- **Final code / docs hosted gate:** pending a completed final run after S007 handover updates. Do not call this CI_PASS until verified.
- **Real live Gemma S007 destination choice and production walk:** NOT_RUN / owner walkthrough needed. CI uses explicit provider fixtures, not real Google output. No access code, key or privileged token was used by the test suite.

## Acceptance still to verify
- Last PR-head CI fully green (Node, Redis, function packaging, Chromium navigation screenshots/Stop/manual override).
- PR merge and live main reread.
- Production owner walkthrough is a separate OWNER_REPORTED gate, not inferred from CI.
