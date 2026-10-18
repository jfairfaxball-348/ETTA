# ETTA

**An embodied-agent experiment.** Give Etta a body → a home → a mind → the ability to decide how she lives.

## Current stage — Body verified, home is next

Etta now has a 3D humanoid, world-owned deterministic body state, a test arena with obstacle collision, a follow/orbit camera, developer WASD/arrows/Shift controls, reset and telemetry, plus touch D-pad support. **All movement is MANUAL / DEV, not autonomous.**

**S003 Chromium acceptance has passed:** [hosted browser run 39110275970](https://github.com/jball348-svg/ETTA/actions/runs/39110275970) ran 15 real-browser checks (desktop and emulated touch), passed 15/15, and archived screenshots and evidence JSON. No physical phone or live Vercel site was verified. S004 HOME is [installed for the next separate invocation](authoritative/NEXT_SESSION_PROMPT.md); it has not been executed.

### Try Etta locally

Node 22.12+ and npm:

```bash
npm ci
npm run check
npm run dev
```

Click the stage: **WASD/arrows** walk; hold **Shift** to run; **drag** orbits, **wheel** zooms, **R** resets, **F1** or HUD button toggles telemetry. On mobile scroll down to the arena and use its touch direction pad.

No API key is needed. There is no home, inference adapter, autonomous mind, long-term memory or continuous worker yet.

### Deploy Etta to Vercel

The **current BODY-only web app** can be deployed from the repository's `main` branch. `vercel.json` configures Vite, a locked `npm ci` install, the production build and the `dist` output. **No environment variables or Google API key are required for this stage.** Follow the [Vercel deployment handoff and live smoke checks](docs/VERCEL_DEPLOYMENT.md). Deployment has not been performed or verified by this repository.

## Project authority

See [charter](PROJECT_CHARTER.md), [roadmap](ROADMAP.md), [governance](AGENTS.md), [state](authoritative/STATE.json), [phase gates](docs/PHASE_GATES.md), [browser acceptance evidence](sessions/S003/VALIDATION.md) and [S004 next prompt](authoritative/NEXT_SESSION_PROMPT.md). Vercel deployment is configured and documented but remains unverified until the owner deploys and checks the actual URL.

## Repository relocation (2026-10-18)

**Active repository:** `jfairfaxball-348/ETTA`. This initial source snapshot was copied from `jball348-svg/ETTA` at commit `c4d0400131f241c2b04814418f45f2cf7d8015ce`. Session records and historical GitHub Actions links continue pointing to the original repository, where those runs happened; the Git commit history was not copied. For Vercel, select this repository.
