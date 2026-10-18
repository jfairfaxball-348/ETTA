# ETTA

**An embodied-agent experiment.** Give Etta a body → a home → a mind → let her decide how she lives.

## S004 — Etta has her first home

Etta now inhabits a small, stylised 3D studio with an open door and porch, bed, writing table, chair, cabinet, lamp, rug and houseplant. She can walk through the doorway; solid furniture and walls stop her. A nearby-object panel describes furnishings, and you can manually switch her lamp on/off. Everything is derived from stable world-owned object state, not inferred from the visual meshes.

**Important:** This is still a **MANUAL / DEV** body. No AI model is connected, no autonomous choices are made, and state resets on reload. Next is [S005 — first secure mind bridge](authoritative/NEXT_SESSION_PROMPT.md).

## Controls
- Click the scene; **WASD/arrows** move, **Shift** runs, **drag** orbits, **wheel** zooms.
- **E** toggles the nearby lamp; the object inspector also shows an interaction button when in range.
- **R** resets body, camera and lamp. **F1** toggles telemetry.
- On touchscreens scroll to the room and use the directional pad.

## Run and deploy
Node 22.12+:

```sh
npm ci
npm run check
npm run dev
```

Deploy the `main` branch as a Vite project on Vercel. `vercel.json` is already configured; **no environment variables** are needed for this BODY + HOME stage. The owner previously reported `https://etta-virid.vercel.app/` live; that URL has **not** been independently verified after S004. The site may not yet show the new home until Vercel redeploys the merged commit. See [deployment notes](docs/VERCEL_DEPLOYMENT.md).

## Verified evidence
[S004 GitHub Actions](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840) on `e3453eebe30c9dec8db39af62eff3a8d47742e10`: TypeScript and build passed; **10/10 deterministic tests** and **17/17 actual headless Chromium checks** passed. Desktop and emulated touch screenshots were archived in [artifact 12131721675](https://github.com/jfairfaxball-348/ETTA/actions/runs/39114318840/artifacts/12131721675). This is not proof of physical-mobile FPS or of a current live Vercel deployment.

## Project
[Roadmap](ROADMAP.md) · [world architecture](docs/ARCHITECTURE.md) · [phase gates](docs/PHASE_GATES.md) · [S004 closeout](sessions/S004/CLOSEOUT.md) · [S005 prompt](authoritative/NEXT_SESSION_PROMPT.md)

Active repository: `jfairfaxball-348/ETTA`. Previous sessions' CI links in the `jball348-svg/ETTA` repo refer to runs from the original source snapshot.
