# ETTA — Capability roadmap

Sequence remains **BODY → HOME → MIND → LIFE → OPEN**. Each phase's outcome is evidence-bound.

| Phase | Objective | Observable gate | After S003 |
|---|---|---|---|
| P0 — Foundation | Clean session and build scaffold | Reproducible CI, browser and separately Vercel | CI and browser PASS; Vercel unverified |
| **P1 — BODY** | Give Etta a body | Recognisable 3D body, manual movement, camera, collision, reset and browser acceptance | **PASS — 15/15 Chrome automated checks** |
| **P2 — HOME** | Give her a home | Coherent traversable room, authoritative objects and resettable interactions | NOT_STARTED — next S004 |
| P3 — MIND | Put her mind in her body | Secure backend provider, validated legal actions and actual model traces | NOT_STARTED |
| P4 — LIFE | Let her decide how she lives | Bounded autonomy, explicit simulated drives/memory, persistence plan | NOT_STARTED |
| P5 — OPEN | Who knows after that | Owner-led outcome | UNDEFINED |

## Browser evidence and qualifiers

[S003 hosted Chromium run 39110275970](https://github.com/jball348-svg/ETTA/actions/runs/39110275970) on `70e202bcb16ff1ca52fa8112e137c3b0ec4a25e9` passed **all 15 real-browser checks**: visible WebGL canvas, manual provenance, keyboard movement and release, Shift, orbit-relative locomotion, zoom bounds, reset, F1/button HUD, blur clearing, collision checks, screenshots, emulated touch and WebGL fallback. Twelve original logic/protocol tests also passed, with production Vite build and `npm ci`.

This establishes P1's **automated desktop browser and emulated-touch** acceptance. A physical phone and live Vercel URL have **NOT** been inspected. Software WebGL in emulated mobile Chromium was around **6 FPS** (not a real-device benchmark); future optimisation/physical testing is warranted.

## P2 HOME mission
Start with one small, pleasant dwelling, a door and recognisable furnishings. Define geometry and object IDs/affordances as world truth separate from graphics. Validate collisions, passage and at least one optional manual state change; test reset/replay. Preserve manual controls. No agent inference yet.

## P3 MIND mission
Backend-only Gemma evaluation through bounded, authenticated, quota-controlled provider adapter. Strictly validate JSON and legal action IDs; keep secrets off browser and distinguish `MODEL_DECISION`, fallback, manual and error. Free quota isn't unlimited.

## P4 LIFE mission
Long-running bounded decisions, simulated drives and continuity with explicit persistence architecture, manual overrides and stop. No consciousness claims or assumed 24/7 Vercel worker.

## Open horizon
Speech, friends, other characters and emergent projects remain possibilities, not delivered scope. One numbered session per invocation; complete future prompt required at closeout.
