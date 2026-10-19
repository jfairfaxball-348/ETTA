# S007 validation — 19 October 2026

## Evidence observed during implementation

- **CI (run [39236410379](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236410379))**: TypeScript, production build, **31/31 deterministic Node tests**, actual Redis integration, Vercel function packaging and existing 17 room Chromium checks passed. New Chromium fixture tests demonstrated walking and arrival, but failed two assertions that compared formatting/dynamic telemetry rather than the intended world-state outcome; these assertions were corrected in a follow-up commit.
- **CI (run [39236278711](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236278711))**: Initial Node strip-only parameter-property failure in new navigator; corrected by explicit constructor assignment.
- **CI (run [39236746951](https://github.com/jfairfaxball-348/ETTA/actions/runs/39236746951))**: 31/31 deterministic tests passed, scaffold handover assertion still expected S007 rather than S008; updated in this branch.
- **CI_PASS / final implementation evidence:** [run 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038) for PR head `63b26c2`: 31/31 Node tests PASS; actual Redis admission tests PASS; Vercel packaged function load PASS; 17 room Chromium checks PASS; 12 mind Chromium checks PASS, including first visible rug walk/arrival and Stop/manual override using explicit provider fixtures. [Screenshot and JSON artifact](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095) (ID 12179209095). Documentation-only closeout changes occurred after this run; final PR head may require rerun before merging.
- **Real live Gemma S007 destination choice and production walk:** NOT_RUN / owner walkthrough needed. CI uses explicit provider fixtures, not real Google output. No access code, key or privileged token was used by the test suite.

## Acceptance still to verify
- Confirm final PR-head checks remain fully green after documentation-only status updates; prior full application run 39237279038 PASS.
- PR merge and live main reread.
- Production owner walkthrough is a separate OWNER_REPORTED gate, not inferred from CI.
