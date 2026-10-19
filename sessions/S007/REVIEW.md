# S007 review — safety and scope

**World authority:** Only rug/table target IDs are legal. Locations derive from immutable room bounds; navigation uses conservative swept-radius clearance checks and a bounded eight-neighbour grid search, then deterministic body movement. Neither server nor browser takes arbitrary model coordinates or generated path data.

**Approval/control:** One proposal requires explicit Approve; a move consumes approval before starting. Stop, manual steering, reset, manual lamp interaction, tab/window blur and lost permission cancel requests/proposals/walks. The world handles blocked movement and finite timeout. No new provider requests occur in the animation loop; Ask is unavailable while walking.

**Secrets/cost:** Same-origin bearer, Upstash Redis global 4/min and 40/UTC-day safeguard and server-only Google key remain unchanged. No background scheduler, billing changes, persistent state, speech or free-running agent.

**Evidence limits:** CI browser actions are clearly TEST_FIXTURE, not live Gemma. The real S006 WAIT/lamp actions were owner-reported. S007 navigation needs an owner-run live deployment walkthrough after merge.

**Risks/revisit:** Static geometry means no dynamic obstacles yet. A 25 cm grid is conservative but not globally optimal, and paths are recomputed from authoritative geometry on approval; future new rooms may require a richer navigation mesh. The prototype still trusts validated, client-reported world snapshots and is not a multi-user authoritative server world.
