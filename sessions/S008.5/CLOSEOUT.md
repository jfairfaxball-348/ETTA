# S008.5 — closeout (CI_PASS; branch PR merge / owner production checks pending)
Branch: [session/S008-5-immersive-pin-vision](https://github.com/jfairfaxball-348/ETTA/tree/session/S008-5-immersive-pin-vision); [PR #9](https://github.com/jfairfaxball-348/ETTA/pull/9).

Implemented:
- Scene-dominant layout, compact AI toggle/Stop/actions and hidden-by-default dev HUD, desktop/touch controls retained.
- Private server-only 4-digit PIN, independent shared atomic failed-auth lockouts and free-of-provider-budget unlock handshake, safe pre-PIN fallback to legacy code until Vercel env migration.
- World-only avatar-eye 384×216 JPEG captured on demand, bounded server image validation, one mixed image+text Gemma request with public perception/intent and world-permitted action.
- Existing WAIT, lamp, rug/table, one-action approval, S008 opt-in finite episode and shared provider budget left intact.

Status: **IMPLEMENTED, HOSTED CI_PASS** on [run 39254894541](https://github.com/jfairfaxball-348/ETTA/actions/runs/39254894541), source SHA 22aa759f: 43/43 Node, Redis script concurrency, Vercel package, 17/17 room and 15/15 protected fixture mind Chromium. Desktop/mobile and eye screenshot reviewed. PR merge and actual Vercel PIN set-up are separate events; no live inference claim. Model-origin real image interpretation is **NOT_RUN**, owner Vercel environment set-up required. S009 was not executed.

## Handover
Follow [four-digit PIN deployment/migration](../../docs/VERCEL_DEPLOYMENT.md): owner adds secret `ETTA_ACCESS_PIN` privately in Vercel, redeploys, verifies READY/PIN; only then removes old legacy token. No credentials are committed. Real Gemma image observation and resulting permitted action must be marked NOT_RUN until owner performs a genuine production trial. Fully standalone **S009 FUTURE / NOT EXECUTED** prompt installed at `authoritative/NEXT_SESSION_PROMPT.md`; original unmodified archived at `authoritative/DEFERRED_S009_PROMPT.md`. S009's goal is two real visible home activities, preferred sitting at chair and examining writing table.
