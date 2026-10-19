# S007 plan — practical implementation

1. Add two named positions derived from immutable rug/table geometry. On both server and client compute reachable destinations via a finite 25 cm graph search and swept-collision checks against the existing avatar radius.
2. Add strict `MOVE_TO` typed action to `validActions`, whitelist destination identifiers; reject extra fields and arbitrary coordinates; preserve shared protected API and Google prompt format.
3. Add deterministic world-owned walking: body turns and translates at bounded speed, reports arrival/block/timeout. Navigation never calls the provider.
4. Bind approval to starting just one walk. Stop, manual movement/interact, reset, hidden tab, window blur and loss of permission cancel. Disable Ask during walk; no overlapping requests or approval replay.
5. Test geometry, routing around a table, invalid targets, arrival, Stop, override and a genuine Chromium fixture-driven rendered walk with evidence screenshots.
6. Hosted CI and review, merge if safe, update roadmap/state, and install full S008 *FUTURE / NOT EXECUTED* prompt.
