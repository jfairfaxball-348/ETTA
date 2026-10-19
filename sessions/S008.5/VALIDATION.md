# S008.5 validation ledger — initial implementation
- CI pending final hosted review on [PR #9](https://github.com/jfairfaxball-348/ETTA/pull/9). Source changes underwent automated checks in GitHub Actions; current run and failures must be read before merge, not presumed green.
- New deterministic tests: PIN-only rollout, invalid PIN/rejected-attempt atomic Redis contract, spoof-resistant unknown client identity, no model-budget consumption for unlock or denial, bounded JPEG/MIME/size/dimensions and mixed Google generateContent text+image payload.
- Added real Redis Lua concurrent checks in tests/budget-integration.mjs for 6/client and 60/global per 15-min bucket.
- Added real Chromium TEST_FIXTURE capture of Etta's eye JPEG (test-results/etta-avatar-eye.jpg), desktop and mobile viewport screenshots and manual regressions.
- Live Vercel PIN configured: NOT_RUN (owner action required); real Google image understanding: NOT_RUN; no new provider billing/API use from these fixtures.
- Existing S007 OWNER_REPORTED: real Gemma chose rug movement. S008 real multi-decision episode remains NOT_RUN until owner trial.
