# ETTA — Binding session protocol

This is software experimentation, **not** mathematics research. Reuse the discipline of session history, provenance and evidence gates without inventing proof claims.

1. **Authority.** At each invocation reread live default-branch SHA, `PROJECT_CHARTER.md`, `ROADMAP.md`, `authoritative/STATE.json`, `authoritative/NEXT_SESSION_PROMPT.md`, recent session closeout and relevant source. Do not trust previous chat summaries over the repo.
2. **Invocation.** The owner pasting or linking an installed numbered next-session prompt, or saying "run next session" with this repo clearly in context, **authorises immediate execution of that ONE session**. Do not ask for redundant confirmation. Do not execute subsequent numbered sessions in the same invocation.
3. **Session scope.** Keep a single primary objective and its acceptance gate; do not silently jump roadmap phases. A discovery or bug fix may change scope only if documented.
4. **Evidence.** Distinguish VERIFIED, MANUAL_OBSERVED, TESTED_LOCAL, CI_PASS, NOT_RUN, BLOCKED and FAILED. Never call an unrun build, browser interaction, provider query or live deployment successful. Never claim an LLM made a choice when rules selected it.
5. **Source of truth.** Maintain `authoritative/STATE.json`; `ROADMAP.md`; `docs/DECISIONS.md`; `docs/PHASE_GATES.md`; and `sessions/S###/{INPUT,PLAN,VALIDATION,REVIEW,CLOSEOUT}.md`. Archive key command outputs or link to exact CI evidence when available.
6. **Code quality.** Prefer small, testable modules. Keep world-owned state separate from model outputs. Add tests for changed behavior. Do not paper over recurrent errors with unconditional fallback; expose failures visibly. No placeholder mock may be represented as live capability.
7. **Security.** Never commit secrets, real keys or private personal data. Keep API credentials server-side, ignore `.env` files, and use explicit budgets/rate limits before enabling cloud agents on a public site.
8. **Legacy boundary.** `jball348-svg/aStar` is reference material, not a codebase to merge wholesale. Identify imported source and justification in the session record, and test it independently.
9. **Git protocol.** One named session branch, ordinary PR, and merge to main where possible; no force pushes. Confirm branch head, diff and hosted checks before merge. If the GitHub host disallows a write, report the blocker truthfully.
10. **Closeout.** Every completed session updates status, gives an honest limitations list, records review, and **installs the complete standalone next session prompt** in `authoritative/NEXT_SESSION_PROMPT.md`. Next session must be explicitly marked FUTURE / NOT EXECUTED. Closeout cannot cite future unobserved PRs or checks. Independently reread live main after merge.
11. **Owner direction.** Owner may replace scope and priorities. Do not infer permission to publish communications, create paid infrastructure, enable billing or use an owner's accounts beyond the stated task.

## Suggested working sequence

ENTRY / baseline → INPUT → PLAN → IMPLEMENT → VALIDATE → REVIEW → STATE + LEDGER → NEXT PROMPT → COMMIT → PR + hosted checks → MERGE → live-main verification → concise owner closeout.
