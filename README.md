# ETTA

**An embodied-character experiment:** give Etta a body → a home → a mind → let her decide how she lives.

**Current milestone (19 Oct 2026):** Etta runs as a Vite/Three.js web app at https://etta-virid.vercel.app/. Her studio, walking controls, collisions, nearby-object inspector and manual lamp work. A server-side Gemma 4 adapter can propose **WAIT** or **TOGGLE_LAMP**, and the owner manually approves or discards the proposal. The owner **reported live success for both actions**, including a lamp state change after approval on 19 Oct. This is not a self-running agent; there is no persistent memory, self-navigation, conversation, voice or background autonomy.

Latest source includes [S006 Vercel function packaging repair](https://github.com/jfairfaxball-348/ETTA/pull/3) and [Gemma response parser repair](https://github.com/jfairfaxball-348/ETTA/pull/4). The latter passed [hosted CI including real Chromium fixture browser tests](https://github.com/jfairfaxball-348/ETTA/actions/runs/39226168465); the Vercel deployment status succeeded. Owner-reported production use is recorded separately from CI.

## Controls
- Focus scene: **WASD/arrows** walk, **Shift** run, **drag** orbit, **wheel** zoom.
- **E** near lamp toggles it. **R** resets. **F1** toggles HUD. Touch D-pad is provided.
- **Ask Etta**: enter the *site private access code*, not Google's API key. One deliberate request yields one proposal; **Approve action** is required to execute. **Stop** cancels, as do movement, reset, state change, focus loss or expiry. Current successful live WAIT and lamp change were owner-observed; a separate production Stop walkthrough remains unrecorded.

## Local development / deployment
Node 22.12+:

~~~sh
npm ci
npm run check
npm run dev
~~~

Production uses the repository root, Vite build, Vercel `/api/decision` Node function, server-only `GEMINI_API_KEY`, `ETTA_ACCESS_TOKEN`, `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, and `ETTA_MIND_ENABLED=true`. Keep secrets out of source and browsers. The manual room works even when inference is disabled. See [Vercel deployment instructions](docs/VERCEL_DEPLOYMENT.md).

ETTA's own Redis shared budget is **4 attempts/minute and 40 attempts/UTC day** across instances. These are *our guardrails*, not Google's Gemma quotas (which apply separately). No unsupervised calls or 24/7 worker exists.

## What's next?
The owner approved the [practical roadmap through S014](ROADMAP.md). **S007 — First Self-Directed Movement** is [installed for the next invocation](authoritative/NEXT_SESSION_PROMPT.md), not yet executed: Gemma chooses a named legal destination, owner approves, and Etta physically walks via collision-safe world navigation. S008 is the planned first bounded opt-in autonomous episode.

[Project charter](PROJECT_CHARTER.md) · [Phase evidence](docs/PHASE_GATES.md) · [S006 live closeout](sessions/S006/CLOSEOUT.md) · [S007 prompt](authoritative/NEXT_SESSION_PROMPT.md).

Active GitHub repository: `jfairfaxball-348/ETTA`. Old `jball348-svg/ETTA` evidence is historical only.
