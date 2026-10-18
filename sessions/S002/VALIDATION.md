# S002 validation — evidence boundary

## VERIFIED hosted evidence
- GitHub Actions push [39108879187](https://github.com/jball348-svg/ETTA/actions/runs/39108879187), source SHA `5c3b232d329be70dd7407c76f53c730cd24d4d8d`: **CI_PASS**. Job `check` reports completed/success: npm install, typecheck, Node tests and Vite build; bot lockfile push succeeded.
- GitHub Actions PR [39108906760](https://github.com/jball348-svg/ETTA/actions/runs/39108906760), head SHA `c16c960b09c7d399f4ec37aa6cc7957a0b77cfd4`: **CI_PASS**. All substantive job steps successful. The branch includes tracked `package-lock.json` blob `e68ca2cb45aa1213c7bfbdf1285d5944df2d3a52`.
- Source implementation `src/simulation.ts`: transform, grounded state, radius, camera-relative movement, 50ms delta cap, x/z collisions and reset; `tests/simulation.test.mjs` tests cardinal and diagonal input, sprint, release, bounds, obstacle, reset and timestep. Tests ran in the above hosted check.
- CI is subsequently changed from `npm install` to `npm ci`; the **final head requires its own run** before calling that change verified.

## Evidence absent
- Local `npm run check`: **NOT_RUN** in tool's network-disabled container with no cached npm packages. Hosted CI provides independent execution, not a local result.
- Real WebGL screenshot, interactive keyboard/camera/obstacle walkthrough: **NOT_RUN**. A green Vite build is not proof of visible interaction. Browser screenshot and touch-emulation evidence remain S003's target.
- Vercel deployment and actual mobile hardware: **NOT_VERIFIED**.
- No LLM integration, inference or autonomous behavior exists, by design.

## S003 browser reproduction plan
Serve Vite and visibly demonstrate Etta; focus canvas, walk via WASD/arrows, change running with Shift/release, orbit stationary, zoom bounds, collide into obstacles and arena walls, stop after focus loss, reset with R, toggle HUD with F1, use touch pad and touch orbit. Compare screen position with live coordinates.

**P1 = IMPLEMENTED_PENDING_BROWSER_EVIDENCE, never PASS from these checks alone.**
