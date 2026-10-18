# ETTA phase gate ledger

| Phase | S004 status | Evidence | Residual limits |
|---|---|---|---|
| P0 Foundation | CI_AND_BROWSER_PASS | Reproducible `npm ci`, TypeScript, tests, Vite and Chromium | Latest live Vercel version not inspected |
| P1 BODY | PASS_CHROMIUM_AUTOMATED | [S003 15/15 Chrome](https://github.com/jball348-svg/ETTA/actions/runs/39110275970) and S004 regressions | Real mobile hardware untested |
| **P2 HOME** | **PASS_CHROMIUM_AUTOMATED_FIRST_HOME** | [S004 17/17 Chrome](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840), Node 10/10, screenshots artifact 12131721675 | First room slice only; no persistence; physical phone untested |
| P3 MIND | NOT_STARTED | S005 future prompt installed | Protected provider and model/world bridge |
| P4 LIFE | NOT_STARTED | — | Safe bounded autonomy and memory |
| P5 OPEN | UNDEFINED | — | Owner directs |

### S004 acceptance details
Hosted Chromium interacted with a built Vite production preview: visible canvas; keyboard/run/stop; reset; touch; camera controls; blur safety; **lamp on/off via mouse and E, reversible with reset**; **door passage out and back**; walls/furniture boundaries; WebGL fallback; no runtime exceptions. **17 PASS, 0 FAIL**, artifact archived from the same passing run. Node source-level tests covered legal spawn, world IDs, object footprints, penetration, porch limits, interaction rejection and deterministic replay.

The public site `https://etta-virid.vercel.app/` was reported deployed earlier by the owner but S004's updated production deployment was not verified. Browser CI is not a real-phone performance benchmark.

### History
S001 foundation; S002 body/manual controls; S003 Chromium body acceptance; **S004 first home and interaction**; **S005 future/not executed**.
