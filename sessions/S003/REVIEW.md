# S003 — Critical review

- **Product authority preserved:** S002 body code retained. Changes focused on browser acceptance, touch focus behavior and asset request cleanup.
- **Real interaction proof:** uses Chromium/Playwright input and screenshots from the built production preview; doesn't mutate Etta body through test-only exports.
- **Touch focus fix:** stage focusout clears keyboard holds and drag state but preserves held touch pointer until pointerup/cancel; window blur and visibility still clear everything.
- **Test-harness lesson:** mobile touch initially failed because the UI was below the current viewport; CDP tap targeted HTML, not button. Scrolling to visible pad was required, not faking control input.
- **Diagnostic event evidence:** before fix had pointerdown target HTML; after fix elementFromPoint pointed to forward button, physical coordinates changed, all acceptance checks green.
- **No false claims:** actual browser automation passed; human visual appraisal, physical mobile benchmark and Vercel live deployment were not observed. Software WebGL 6 FPS in mobile emulation requires later performance investigation.
- **Secrets and cost:** no public API credentials or model endpoint added; browser transport pinned only in CI.
- **Review verdict:** sufficient automated P1 BODY browser gate; enter P2 HOME in future S004 only.
