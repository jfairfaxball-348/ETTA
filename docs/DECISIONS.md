# Decision log

| ID | Session | Decision | Rationale | Revisit when |
|---|---|---|---|---|
| DEC-0001 | S001 | New ETTA repo, legacy aStar reference only | Avoid importing bugs | Proposed legacy reuse |
| DEC-0002 | S001 | Vite + Three.js static frontend | Small Vercel-friendly foundation | Visual gate |
| DEC-0003 | S001 | BODY → HOME → MIND → LIFE | Explicit owner sequencing | Owner direction |
| DEC-0004 | S001 | Gemma is a future P3 backend adapter | Protect secrets and quotas | P3 |
| DEC-0005 | S001 | Server-side provider credentials only | No public API key | P3 |
| DEC-0006 | S001 | No 24/7 runtime in static site | Hosting limitations | P4 |
| DEC-0007 | S001 | Session protocol and honest validation | Repeatability | P1 gate |
| DEC-0008 | S002 | Deterministic flat-ground body without full physics engine | Test collisions and manual movement before complexity | P2 navigation |
| DEC-0009 | S002 | Camera-relative keyboard/touch input separate from body state and rendering | User can manually inhabit avatar with no LLM | Autonomous input arbitration in P3 |
| DEC-0010 | S002 | Keep P1 gate open until observed WebGL/browser walkthrough | TS/CI cannot prove rendered functionality | S003 |
| DEC-0011 | S002 | Commit npm lockfile via branch CI if write permission allows | Local npm registry inaccessible in execution container | Lockfile verification |
| DEC-0012 | S003 | Real production-preview Chromium interaction tests required for P1 | Static build cannot prove input/display | Future visual regressions |
| DEC-0013 | S003 | Retain touch holds when canvas loses focus, but clear keyboard holds | Pressing a D-pad button can blur the canvas; should not stop an active finger | Input system refactors |
| DEC-0014 | S003 | Keep screenshots + JSON evidence from hosted Chrome; pin CI-only Playwright transport | Reproduce full-browser smoke with no key/provider dependency | CI maintenance |
| DEC-0015 | S003 | Distinguish mobile touch emulation from physical-device performance and deployment | SwiftShader emulator had low FPS; neither physical phone nor live Vercel were tested | Real device/preview availability |
| DEC-0016 | S004 | Authoritative immutable room object records + mutable lamp-only world state | Preserve deterministic physics and future LLM trust boundary | P3 planning |
| DEC-0017 | S004 | A walkable doorway leads to a bounded porch; all furnishings have conservative solid footprints | Avoid purely decorative room and walking through solids | More detailed room physics |
| DEC-0018 | S004 | Inspector is manual-only; E/button may toggle the lamp within actual object distance | Build affordances without implying model decisions | P3 legal action API |
| DEC-0019 | S004 | Reduce mobile render cost by limiting DPR and turning off shadow mapping on coarse pointers | Previously weak headless emulated GPU performance | Real phone benchmark |

