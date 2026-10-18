# ETTA phase-gate ledger

| Phase | S003 status | Evidence | Outstanding |
|---|---|---|---|
| P0 Foundation | CI + BROWSER PASS; deployment separate | Locked `npm ci`, TypeScript tests, Vite build and Chrome run | Live Vercel URL not verified |
| **P1 BODY** | **PASS_CHROMIUM_AUTOMATED** | [S003 run 39110275970](https://github.com/jball348-svg/ETTA/actions/runs/39110275970), `70e202bcb16ff1ca52fa8112e137c3b0ec4a25e9`, 15/15 Chrome checks plus screenshot/JSON artifact | Physical mobile device and performance still unverified |
| P2 HOME | NOT_STARTED | S004 complete future prompt installed | Spatial room, object truth, collisions, door/passage |
| P3 MIND | NOT_STARTED | — | Secure model adapter and legal actions |
| P4 LIFE | NOT_STARTED | — | Bounded autonomy, memory, runtime persistence |
| P5 OPEN | UNDEFINED | — | Owner-directed later |

## Evidence boundary

S003's hosted Chrome automation drove **actual** keyboard, mouse and emulated touch events against a built Vite production preview. It verified WebGL canvas, body coordinates, movement/stop, run, camera orbit/zoom, reset, HUD, blur safety, obstacle/arena constraints, mobile D-pad after scrolling, fallback and runtime errors. **15 PASS, 0 FAIL**; screenshot evidence was archived in workflow artifact ID `12130221952` (desktop/mobile). This is stronger than static build evidence; it is not direct human inspection of the screenshot nor a physical mobile-device or Vercel visit.

At software-rendered mobile DPR, emulation saw ~6 FPS. This measurement is *not* evidence of physical device FPS. Preserve as performance concern, not a hidden failure.

## History

- S001 — bootstrap and CI, empty scene.
- S002 — body and manual developer movement implemented; lockfile via hosted runner.
- **S003 — actual browser proof**, touch focus handling fix, favicon cleanup, 15/15 hosted Chromium acceptance. **S004 FUTURE / NOT EXECUTED**.
