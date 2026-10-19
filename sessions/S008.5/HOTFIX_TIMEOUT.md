# ETTA S008.5 — production timeout hotfix (2026-10-19)

## Input
Owner reported first multimodal finite episode stopped after exactly 12 seconds and zero decisions; frontend displayed generic “Decision failed or budget was exhausted: Model request timed out or could not connect.” Canonical world observation was valid (WAIT/rug/table). Live Vercel production deployment was READY at commit 616ca194, and ETTA backend source had a 12s combined server deadline, 16s browser deadline and 20s function maximum. The 12-second match points to app timeout; a network failure cannot be independently ruled out because Vercel runtime log access through connected scope returned 403.

## Scope and implementation
S008.5 maintenance fix ONLY, not S009. 40s server request deadline, 45s client deadline, 50s Vercel maximum, all still under finite 60s episode deadline. Every provider attempt still reserves the same atomic Redis 4/minute/40/day token and still uses a single on-demand 384×216 JPEG+canonical text Gemma request. Distinguish 504 PROVIDER_TIMEOUT from 502 PROVIDER_UNAVAILABLE; remove misleading generic episode “or budget exhausted” prefix. STOP/manual/blur/hidden/reset/deadline cancellation, no retries, no fallback and no added billable infrastructure.

## Verification
Added Node checks for timeout ordering, deliberately delayed provider response and separate timeout/connect-failure statuses. Existing security, provider, real Redis, Vercel-package and Chromium-fixture checks must pass in hosted CI before merge. Live-model repeat test remains NOT_RUN; owner should try *one* Ask Etta request first, then bounded episode, avoiding repeated expensive retries. Note that a 40s decision can consume most of a 60s episode, so completing three is not guaranteed. S009 next-session prompt stays unchanged.
