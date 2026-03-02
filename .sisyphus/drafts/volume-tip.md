# Draft: Volume / Sound Start Tip

## Requirements (unconfirmed)
- User wants an initial tip that tells players to turn on volume so they know the experience has sound.

## Requirements (confirmed)
- Show a tooltip beside the volume control.
- Tooltip auto-hides after ~5 seconds.
- Do not show the tooltip if volume is non-zero.
- Show condition: every session (but subject to the volume!=0 guard).
- Tip timing: on page load (once volume is confirmed 0).
- Copy intent: "turn up volume for sound" + include iPhone hint about disabling Silent Mode.
- iPhone/iPad behavior: show the Silent Mode hint on iOS only.
- Additional copy intent: remind users to turn Silent Mode back on after they're done.

## Copy (confirmed)
- Non-iOS tooltip: "Turn up volume for sound" (single line).
- iOS tooltip (2 lines):
  - Line 1: "Turn up volume for sound"
  - Line 2: "iPhone: Silent Mode off (turn it back on after)"

## Decisions (confirmed)
- Silent Mode hint applies to iPhone only (not iPad wording).

## Open Questions
- Exact tooltip copy + tone (short/fun vs explicit instructions).

## Project Findings (repo read)
- Volume UI exists: `src/lib/SoundToggle.svelte` (fixed top-right button + popover slider).
- Volume state + persistence exists: `src/routes/+page.svelte` stores `fireworks-volume` in localStorage.
- Sound assets exist: `static/sounds/explosion0.mp3`, `static/sounds/explosion1.mp3`, `static/sounds/explosion2.mp3`.
- Sound is enabled when `volume > 0` via `fireworks.updateOptions({ sound: ... })` in `src/routes/+page.svelte`.

## Research Findings
- iOS Silent Mode / ring switch state is not exposed to web apps; there is no supported JS API to read it. Apple Developer Forums question about detecting the mute switch for a web app points to a workaround (not detection): `https://developer.apple.com/forums/thread/46461`.
- If we decide to show the Silent Mode hint conditionally, we need iOS detection.
- `navigator.userAgentData` is limited/experimental and not available on iOS/macOS in practice; MDN marks it limited availability and a BCD issue notes it's not available on iOS/macOS: `https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData` and `https://github.com/mdn/browser-compat-data/issues/21308`.
- Therefore, pragmatic iOS detection typically relies on UA + iPadOS-as-Mac heuristic (e.g. `navigator.maxTouchPoints > 1` when UA contains Macintosh); see common pattern referenced in OSS issue discussion: `https://github.com/livekit/client-sdk-js/issues/1788`.

## Proposed iOS Detection Heuristic (planning)
- `isIPhoneOrIPod`: `/iPhone|iPod/` in `navigator.userAgent`
- `isIPad`: `/iPad/` in `navigator.userAgent` OR (`/Macintosh/` in UA AND `navigator.maxTouchPoints > 1`)
- `isIOS`: `isIPhoneOrIPod || isIPad`

## UX Considerations (notes)
- Avoid nagging: show once, then remember dismissal.
- Autoplay policies: sound often requires a user gesture; tip can be paired with an explicit "Enable sound" action.
- Accessibility: allow silent play; provide non-audio cues too.

## Open Questions
- When should the tip appear (first launch only vs every session vs until sound enabled)?
- Should we include a sound toggle/button in the UI?
- Do we have any audio in the app today, or is this planned for later?

## Scope Boundaries
- INCLUDE: copy + placement decision for a volume/sound onboarding hint.
- EXCLUDE: implementing audio system (unless explicitly requested later).
