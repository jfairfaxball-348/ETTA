# S008.5 — working closeout (final CI/merge pending)
Branch: [session/S008-5-immersive-pin-vision](https://github.com/jfairfaxball-348/ETTA/tree/session/S008-5-immersive-pin-vision); [PR #9](https://github.com/jfairfaxball-348/ETTA/pull/9).

Implemented:
- Scene-dominant layout, compact AI toggle/Stop/actions and hidden-by-default dev HUD, desktop/touch controls retained.
- Private server-only 4-digit PIN, independent shared atomic failed-auth lockouts and free-of-provider-budget unlock handshake, safe pre-PIN fallback to legacy code until Vercel env migration.
- World-only avatar-eye 384×216 JPEG captured on demand, bounded server image validation, one mixed image+text Gemma request with public perception/intent and world-permitted action.
- Existing WAIT, lamp, rug/table, one-action approval, S008 opt-in finite episode and shared provider budget left intact.

Status: **IMPLEMENTED_BRANCH; CI/merge verification pending**. Mark hosted full regression CI_PASS only after inspecting completed run. Model-origin real image interpretation is **NOT_RUN**, owner Vercel environment set-up required. S009 was not executed.
