# ETTA — owner-approved capability roadmap

**Owner-approved direction (19 October 2026):** Give Etta a body → a home → a mind → let her decide how she lives → an open-ended future. Sessions are practical delivery milestones, not mathematics-style proof formalities. Do not skip validation of a visible behaviour.

## Phase status

| Phase | Goal | Current status |
|---|---|---|
| P0 FOUNDATION | Web app, tests, GitHub → Vercel and functional server endpoint | CI and deployment functioning; production endpoint READY was owner-observed |
| P1 BODY | Visual body, manual controls, camera, collisions | COMPLETED (CI/browser and owner use) |
| P2 HOME | Furnished studio, doorway/porch, nearby objects, lamp | COMPLETED (CI/browser and owner use) |
| P3 MIND | Protected live Gemma decision → legal world action with approval | **CORE LIVE GATE MET (OWNER_REPORTED, 2026-10-19)**: real WAIT and lamp toggle; production Stop exercise not separately recorded |
| P4 LIFE | Self-directed movement, bounded autonomy, more interactions, memory/drives/routines | **S008 IMPLEMENTED AND CI_PASS**: explicitly opt-in finite episodes; production live autonomy not yet owner-tested |
| P5 OPEN | Further world, relationships, new goals | Exploratory, not scheduled |

## Agreed session sequence

| Session | Name | Outcome/acceptance |
|---|---|---|
| **S007** | Etta chooses where to walk | Gemma proposes a **named reachable location**; approval starts a finite world-engine-controlled walk, correctly avoiding obstacles; manual override/Stop always wins |
| **S008 (COMPLETE)** | First independent episode | Opt-in Autonomy ON/OFF; several bounded decisions/actions without per-action approval during a short observed episode, with strict request/time limits and immediate Stop |
| **S009 (NEXT)** | More things to do | At least two meaningful, visible, permitted home activities (e.g., sit at chair, interact with desk/bed); world validates proximity/state |
| S010 | Memory | Transparent, bounded, resettable persistence for actions/interactions across page reloads; no secret leakage |
| S011 | Preferences, curiosity, motivations | Clearly **simulated** drives affect choices; controlled tests distinguish decisions in differing state |
| S012 | Time, routines, daily life | Simulated day/night and sequences of chosen activities; do not suggest continuous cloud operation |
| S013 | Talk to Etta | Text conversation with typed input boundaries and appropriate context; voice only as a later option |
| S014 | Life continues when away | Feasibility and cost/security review, then explicit owner approval before any hosted persistence/scheduled background execution |

Dates beyond S007 are not commitments and may be revised by the owner. Success depends on real-world observable and testable behaviour, not merely green builds.

## Longer-term stages

1. **A room of her own (S007–S012):** autonomous navigation, interactive furnishings, finite independent episodes, simulated preferences and daily routines.
2. **A home and a personality (around S013–S016+, provisional):** conversations, expanded rooms, possessions, continuity and richer interactions.
3. **A world beyond home (exploratory):** exterior locations, other characters and grounded exploration.
4. **Who knows? (open):** self-selected interests/projects, evolving simulated motivations, and unprogrammed combinations of permitted actions. No claims of consciousness or subjective experience.

## System architecture to retain

- **Gemma chooses what**, only from server-validated affordances. **The deterministic world engine does how**: physics, navigation, animation, collision and outcome checks. Never call the model every frame.
- P3 currently requires one deliberate Ask Etta → model-proposed WAIT or nearby TOGGLE_LAMP → explicit approval. Stop, manual movement, changed state and expiry invalidate proposals. S007 adds a manually approved, finite named-destination walk; S008 adds explicitly opted-in multi-decision episodes bounded by 3 calls, 60 seconds and foreground visibility.
- The **4/minute and 40/UTC-day** shared Redis admission cap is an **ETTA-owned safeguard**, not Google's Gemma quota. It counts failed provider attempts after admission and applies across function instances. Google enforces separate project/model quotas. Adjust only after measuring use and with owner approval; request counts alone do not guarantee a zero bill.
- World state is currently tab-local; no persistent memory, 24/7 autonomous service, self-directed internet access or unsupervised background action.
- Preserve manual playability when inference is off. Keep API keys server-only, refuse invented actions, avoid endless loops and expose provenance/error/cost boundaries.
- Separate VERIFIED/CI_PASS from **OWNER_REPORTED** live use and NOT_RUN checks. The owner reported real WAIT and lamp-toggle approval, plus a later real Gemma rug-navigation choice, on 19 October; S008 live episodes remain NOT_RUN. No private logs or keys were stored.

**[Complete installed S008 prompt](authoritative/NEXT_SESSION_PROMPT.md)** · [S006 closeout](sessions/S006/CLOSEOUT.md) · [Phase ledger](docs/PHASE_GATES.md).
