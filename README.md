# ETTA

**An embodied-agent experiment.** Give Etta a body → a home → a mind → let her decide how she lives.

## S005 — the first mind bridge is scaffolded

Etta has a furnished studio, manual movement, collisions and a switchable lamp. **Ask Etta** can now request one server-side Gemma proposal: **WAIT** or **TOGGLE_LAMP** when it is within reach. The proposal is displayed, checked again against the live room and executed only after **Approve action**. Movement, reset, manual interaction, Stop, loss of focus and a 60-second expiry discard pending work. There is no autonomous loop, saved memory or voice.

**Live-model acceptance remains open.** The adapter and browser flow are tested using explicitly labelled fixtures; no real Google request is claimed. The room works with inference disabled. Owner reported the S004 deployed room, movement, proximity and lamp working on 18 October 2026.

## Controls
- Click the scene; **WASD/arrows** move, **Shift** runs, **drag** orbits, **wheel** zooms.
- **E** toggles the nearby lamp. **R** resets body, camera and lamp. **F1** toggles telemetry.
- On touchscreens use the directional pad.
- With the server configured, enter the site's private access code in **Ask Etta**, request a proposal and approve or discard it. Never enter the Google API key in the page.

## Run and deploy
Node 22.12+:

```sh
npm ci
npm run check
npm run dev
```

Development serves the API with server-only `.env.local` settings. A static `npm run preview` exposes a disabled API status. Vercel deploys the Vite client and `/api/decision` Node function from the repository root.

**Manual room:** no variables required. **Live mind:** server-only Google key, private access token, explicit enable switch and Upstash Redis REST credentials for the global budget. No service or billing was created by this session. [Exact Vercel setup and activation walkthrough](docs/VERCEL_DEPLOYMENT.md).

## Evidence and next step

[Session validation](sessions/S005/VALIDATION.md) distinguishes local tests, hosted CI, browser fixtures and unverified live services. [S006](authoritative/NEXT_SESSION_PROMPT.md) is future/not executed: finish the configured Vercel and live-model acceptance gate before extending capabilities.

[Roadmap](ROADMAP.md) · [Architecture](docs/ARCHITECTURE.md) · [Phase gates](docs/PHASE_GATES.md) · [S005 closeout](sessions/S005/CLOSEOUT.md)

Active repository: `jfairfaxball-348/ETTA`. Earlier CI in `jball348-svg/ETTA` is historical evidence only.
