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


| DEC-0020 | S005 | WAIT and nearby TOGGLE_LAMP only; approve before execution | First grounded model-to-world bridge without P4 autonomy | Live P3 gate |
| DEC-0021 | S005 | Shared atomic Redis budget, 4/minute and 40/UTC-day, fail closed | An in-memory serverless limiter cannot cap aggregate attempts | Owner changes budget/infrastructure |
| DEC-0022 | S005 | Private access token, same-origin JSON, server-only Google/Redis credentials | Public static room with a private inference endpoint | Multi-user auth needed |
| DEC-0023 | S005 | Strict canonical observations/proposals; no retries or synthetic fallback | Failures must not masquerade as model choices | More actions/models |
| DEC-0024 | S005 | Cancel stale proposals and late responses; consume approval once | Prevent accidental or repeated world changes | Longer tasks/navigation |
| DEC-0025 | S005 | Owner will configure credentials; keep live model gate open | Prior owner instruction explicitly requested scaffolding and manual Vercel env setup | S006 live acceptance |

| DEC-0026 | S006 closeout | Accept core live P3 gate on owner-reported WAIT and approved lamp toggle, with live Stop still unverified | Distinguish real end-to-end manual observation from fixture CI and missing logs | S007 regression |
| DEC-0027 | Owner roadmap approval 2026-10-19 | Adopt explicit S007–S014 capability progression; keep session ceremony lightweight | Owner agrees walking → bounded episodes → interactions → memory → motivations → routines → chat → away-time review | Owner reprioritisation |
| DEC-0028 | S007 plan | Named-destination, owner-approved navigation only; deterministic physics/path routing and manual override | Grow what model may choose without granting raw positional commands or P4 autonomy early | S007 implementation |
| DEC-0029 | Budget clarification | ETTA enforces 4/minute and 40/UTC day using Upstash, independent of Google's project/model quotas | Shared operational safeguards, not Gemma pricing/rate-limit claims | S008 autonomy/cost review |
| DEC-0030 | Future infrastructure | No 24/7 world or recurring cloud requests before a separate hosting, security and spend decision | Prevent assumptions about Vercel free-tier persistence/compute | S014 feasibility |

| DEC-0031 | S007 | Allow `MOVE_TO` only for immutable-geometry-derived rug/table destinations after explicit approval | The model chooses WHAT, never world coordinates, and shared server/browser permission checks prevent invented targets | Additional rooms/destinations |
| DEC-0032 | S007 | Bounded 25 cm grid routing with swept-clearance checks and 30 s maximum walk | Real visible body translation/turning without wall clipping or infinite stalls; no model calls per frame | Complex obstacle layouts |
| DEC-0033 | S007 | Approved navigation is a single action, not an autonomy toggle | Prevent accidental escalation of privileges before S008 cost/consent review | S008 opt-in episode |

| DEC-0034 | S008 | Opt-in, visible, at most three model decisions and 60 seconds, with at least three seconds between decisions; no overlap with active walking | User consent and budget discipline before more complex free choice | Behaviour/usage feedback |
| DEC-0035 | S008 | Reuse protected one-shot Ask + world approval path internally, retaining strict affordances and provenance | Avoid a second, potentially divergent world executor or server quota bypass | More complex autonomous workflows |
| DEC-0036 | S008 | Any manual action, tab loss, reset, Stop, failed model, quota or timeout ends episode; zero auto-start after reload | Manual priority and fail-closed bounded runtime | S010 persistence design |
