# ETTA — Project charter

## North star

Create an embodied artificial character who inhabits an inspectable virtual environment, perceives only what the world permits, remembers interactions, and eventually chooses what to do without a continuous stream of user commands.

**Intentional sequence:** give Etta a body; give her a home; put her mind in her body; let her decide how she lives. Beyond that, experimental direction remains open.

## Product principles

1. **Embodiment before intelligence.** The body, space, sensory boundary and action consequences must work deterministically before connecting a model.
2. **World-owned truth.** The engine defines geometry, physics, objects, valid actions, state transitions and outcomes. Model statements cannot directly alter these.
3. **Inspectable autonomy.** Every decision has its input context, candidate actions, source (model/rules/manual), timing, result and failure status, without publishing private user data.
4. **Character continuity.** Memory belongs to the character and is scoped, bounded, transparent and persistable when that feature is built.
5. **Model portability.** Start with a server-side cloud inference adapter (Gemma via Google's API is the first evaluation target); avoid coupling game logic to one vendor.
6. **Operational control.** Offline/demo mode, manual pause, autonomy toggle, latency and expenditure caps, and secure API boundaries matter as much as visuals.
7. **No consciousness claims.** Mood and drives are explicitly simulated state. The experiment studies autonomous behaviour, not verified subjective experience.
8. **Keep it enjoyable.** It should be delightful to watch and explore, not only technically interesting.

## Scope boundary

S001 establishes the project and an empty renderable browser canvas. It does not claim to satisfy the four milestones. We will not import the earlier aStar runtime wholesale before evaluating its bugs and architecture.

## Definition of progress

Progress is a demonstrable software capability with reproducible checks and honest evidence. A green TypeScript build is not evidence that Etta can move; a plausible dialogue is not evidence of a working memory or of emotional experience. A Vercel build is not a verified live deployment until the URL has been tested.

## Governance

See [AGENTS.md](AGENTS.md) and [ROADMAP.md](ROADMAP.md). One numbered session advances a sharply defined objective; an evidence-gated closeout installs the full prompt for the next session. Owner can change direction at any time.
