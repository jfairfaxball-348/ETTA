# S008.5 validation ledger — initial implementation
- **CI_PASS:** [PR #9](https://github.com/jfairfaxball-348/ETTA/pull/9), [full run 39254894541](https://github.com/jfairfaxball-348/ETTA/actions/runs/39254894541), source 22aa759f (43/43 Node; actual Redis shared-budget and PIN-throttle concurrency; Vercel function packaging; 17/17 room, 15/15 mind protected fixture Chromium).
- New deterministic tests: PIN-only rollout, invalid PIN/rejected-attempt atomic Redis contract, spoof-resistant unknown client identity, no model-budget consumption for unlock or denial, bounded JPEG/MIME/size/dimensions and mixed Google generateContent text+image payload.
- Added real Redis Lua concurrent checks in tests/budget-integration.mjs for 6/client and 60/global per 15-min bucket.
- Added real Chromium TEST_FIXTURE capture of Etta's eye JPEG (test-results/etta-avatar-eye.jpg), desktop and mobile viewport screenshots and manual regressions.
- Browser PIN-mode fixture verifies OFF → wrong PIN rejection → correct PIN ON → one eye-image decision → explicit approval → OFF/reload. CI fixture only. Live Vercel PIN configured: NOT_RUN (owner action required); real Google image understanding: NOT_RUN; no new provider billing/API use from these fixtures.
- Existing S007 OWNER_REPORTED: real Gemma chose rug movement. S008 real multi-decision episode remains NOT_RUN until owner trial.

- Screenshot artifact: [run 39254894541](https://github.com/jfairfaxball-348/ETTA/actions/runs/39254894541). Visually reviewed desktop, mobile and corrected-sRGB avatar-eye 384×216 view from Chromium; no overlay/secret appears in world image. CI model output labelled TEST_FIXTURE. Physical device and live production image-understanding trials NOT_RUN.
