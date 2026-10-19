# ETTA

**An embodied-character experiment:** give Etta a body → a home → a mind → let her decide how she lives.

ETTA is a Vite/Three.js web app at https://etta-virid.vercel.app/ with a furnished studio, keyboard/touch controls, collision-aware avatar, working lamp and protected server-side Gemma bridge.

## S008.5 — immersive room and multimodal input

The UI now prioritises the playable 3D home; debug telemetry starts hidden (F1/Debug shows it). AI has a simple four-digit **PIN unlock → AI ON/OFF** when `ETTA_ACCESS_PIN` is set in Vercel. **Stop** immediately cancels an action/episode without permanently switching the AI off. Manual play always works with AI OFF. A temporary labelled legacy access-code input remains when no PIN is configured, to avoid breaking existing deployments on a code-only rollout.

Each explicit model decision captures an independent **384×216 avatar-eye JPEG**, without interface overlays or Etta's own head, and sends it alongside server-derived world observations in **one** Gemma request. The server validates image dimensions, data, affordances, short perception/intention summaries and strict world actions. Multiple provider calls are *not* automatically made; no extra quota has been authorised. Existing one-off approval, 3-decision/60-second autonomy and 4/minute, 40/day Redis limits remain.

**Verification:** [S008.5 PR #9](https://github.com/jfairfaxball-348/ETTA/pull/9), [CI_PASS 39254894541](https://github.com/jfairfaxball-348/ETTA/actions/runs/39254894541): 43/43 Node tests, actual Redis Lua, Vercel packaging, 17 room and 15 mind Chromium fixtures, visually reviewed desktop/mobile/eye screenshots. Genuine production Gemma image understanding is **NOT_RUN** until owner walkthrough; fixtures are not evidence of a live visual choice. [Vercel PIN instructions](docs/VERCEL_DEPLOYMENT.md) · [session record](sessions/S008.5/CLOSEOUT.md).

## S008 — bounded independent episode

An explicitly pressed **Autonomy ON · 3 decisions** button starts one foreground-only, supervised episode. Etta can request up to three sequential protected model decisions in at most 60 seconds, never while a prior decision or walk remains unfinished. A minimum of three seconds separates choices. Each decision uses only valid WAIT, lamp or named rug/table actions, revalidated by the world engine. **Stop, manual movement, reset, manual lamp interaction, focus/visibility loss, timeout or quota errors end the episode.** The UI displays its status, request count, provenance and last action. Off by default; never starts on reload. No saved memory, background service or cost-cap changes. **S008 CI_PASS:** [hosted run 39241206176](https://github.com/jfairfaxball-348/ETTA/actions/runs/39241206176) (37 Node tests, Redis, packaged Vercel API and real fixture Chromium). New live episode functionality still needs an owner production walkthrough; browser tests use conspicuously labelled TEST_FIXTURE.

## S007 — first self-directed destination choice

Etta can choose one of **two named, reachable destinations**: the woven rug or the writing table. The observation supplies names and `validActions`; Gemma can propose `MOVE_TO` but cannot issue coordinates, raw movement, paths or scripts. One approval starts a finite, visibly animated walk controlled by deterministic world physics and a bounded collision-clearance planner. Arrival, Stop and failure are reported on screen. **This is not free-running autonomy.**

The original **WAIT** and nearby **TOGGLE_LAMP** remain available. On 19 October the owner observed both actions with live Gemma, including the lamp actually switching after approval (**OWNER_REPORTED**, not a Chromium fixture).

**S007 source:** [pull request #6](https://github.com/jfairfaxball-348/ETTA/pull/6). **CI_PASS** on [run 39237279038](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038) includes 31 Node tests, Redis, Vercel packaging and real Chromium walking tests with [screenshots](https://github.com/jfairfaxball-348/ETTA/actions/runs/39237279038/artifacts/12179209095). Unit and browser navigation checks use **explicit test fixtures**, not live Gemma. The owner separately reported a live Gemma decision to walk to the centre of the rug successfully on 19 October 2026 (**OWNER_REPORTED**).

## Controls / safety

- **Manual:** focus 3D scene; WASD/arrows to walk, Shift to run, drag to orbit, wheel to zoom, E near lamp to toggle, R to reset, F1 for diagnostics; touch D-pad included.
- **Ask Etta:** switch AI ON with the private four-digit PIN (or enter the temporary legacy code), select **Ask Etta**, inspect one proposal, then **Approve action**. The selected destination and reason are shown before approval. During walking, the Ask button is disabled.
- **Stop / discard** immediately cancels a request, proposed action or walk. Manual movement, reset, manual lamp interaction, tab/window blur, lost visibility, invalidated world state, timeout and loss of permission also cancel. Ask is available again only after completion or cancellation.
- **No background prompting:** manual Ask always requires approval. Autonomy ON is a separate, deliberate, strictly bounded exception: up to three decisions or 60 seconds while the tab is visible. No persistence, background worker, voice or internet browsing.

## Build and operations

Node 22.12+:

~~~sh
npm ci
npm run check
npm run dev
~~~

Vercel hosts the frontend and `/api/decision` Node function. Configure server-only `ETTA_ACCESS_PIN` (with temporary `ETTA_ACCESS_TOKEN` migration support), `GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `ETTA_MIND_ENABLED=true` in server-side Vercel environment settings. No secrets belong in source or the browser. The room remains manually usable when inference is off. See [deployment guide](docs/VERCEL_DEPLOYMENT.md).

ETTA's shared Upstash admission budget is **4 attempts/minute and 40 attempts/UTC day**, set by *our application*, independently of Google's Gemma quotas. Do not change it without owner approval.

## Roadmap

The [owner-approved roadmap](ROADMAP.md) marks **S008.5 — immersive UI/PIN/multimodal refactor** CI_PASS complete; **S009 — meaningful furniture interactions** is installed FUTURE / NOT EXECUTED. Later stages add meaningful interactions, memory, simulated preferences, routines, conversation and possibly away-time operation after a separate cost/security decision.

[Charter](PROJECT_CHARTER.md) · [S008.5 records](sessions/S008.5/CLOSEOUT.md) · [Phase evidence](docs/PHASE_GATES.md) · [Next session](authoritative/NEXT_SESSION_PROMPT.md).

Active source repository: `jfairfaxball-348/ETTA`; the older `jball348-svg/ETTA` is historical only.
