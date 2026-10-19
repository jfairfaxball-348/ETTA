# ETTA

**An embodied-character experiment:** give Etta a body → a home → a mind → let her decide how she lives.

ETTA is a Vite/Three.js web app at https://etta-virid.vercel.app/ with a furnished studio, keyboard/touch controls, collision-aware avatar, working lamp and protected server-side Gemma bridge.

## S007 — first self-directed destination choice

Etta can choose one of **two named, reachable destinations**: the woven rug or the writing table. The observation supplies names and `validActions`; Gemma can propose `MOVE_TO` but cannot issue coordinates, raw movement, paths or scripts. One approval starts a finite, visibly animated walk controlled by deterministic world physics and a bounded collision-clearance planner. Arrival, Stop and failure are reported on screen. **This is not free-running autonomy.**

The original **WAIT** and nearby **TOGGLE_LAMP** remain available. On 19 October the owner observed both actions with live Gemma, including the lamp actually switching after approval (**OWNER_REPORTED**, not a Chromium fixture).

**S007 source:** [pull request #6](https://github.com/jfairfaxball-348/ETTA/pull/6). **CI_PASS** on [run 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038) includes 31 Node tests, Redis, Vercel packaging and real Chromium walking tests with [screenshots](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095). Unit and browser navigation checks use **explicit test fixtures**, not live Gemma. Production S007 navigation requires a separate owner-run walkthrough; do not assume it has occurred.

## Controls / safety

- **Manual:** focus 3D scene; WASD/arrows to walk, Shift to run, drag to orbit, wheel to zoom, E near lamp to toggle, R to reset, F1 for diagnostics; touch D-pad included.
- **Ask Etta:** enter your site's private access code (never a Google API key), select **Ask Etta**, inspect one proposal, then **Approve action**. The selected destination and reason are shown before approval. During walking, the Ask button is disabled.
- **Stop / discard** immediately cancels a request, proposed action or walk. Manual movement, reset, manual lamp interaction, tab/window blur, lost visibility, invalidated world state, timeout and loss of permission also cancel. Ask is available again only after completion or cancellation.
- **No automatic prompting:** each Ask produces at most one proposed action. No persistence, background worker, voice, internet browsing or opt-in multi-decision episode yet.

## Build and operations

Node 22.12+:

~~~sh
npm ci
npm run check
npm run dev
~~~

Vercel hosts the frontend and `/api/decision` Node function. Configure `GEMINI_API_KEY`, `ETTA_ACCESS_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `ETTA_MIND_ENABLED=true` in server-side Vercel environment settings. No secrets belong in source or the browser. The room remains manually usable when inference is off. See [deployment guide](docs/VERCEL_DEPLOYMENT.md).

ETTA's shared Upstash admission budget is **4 attempts/minute and 40 attempts/UTC day**, set by *our application*, independently of Google's Gemma quotas. Do not change it without owner approval.

## Roadmap

The [owner-approved roadmap](ROADMAP.md) schedules **S008 — one short, explicit opt-in autonomous episode** next, but it is [FUTURE / NOT EXECUTED](authoritative/NEXT_SESSION_PROMPT.md). Later stages add meaningful interactions, memory, simulated preferences, routines, conversation and possibly away-time operation after a separate cost/security decision.

[Charter](PROJECT_CHARTER.md) · [S007 records](sessions/S007/CLOSEOUT.md) · [Phase evidence](docs/PHASE_GATES.md) · [Next session](authoritative/NEXT_SESSION_PROMPT.md).

Active source repository: `jfairfaxball-348/ETTA`; the older `jball348-svg/ETTA` is historical only.
