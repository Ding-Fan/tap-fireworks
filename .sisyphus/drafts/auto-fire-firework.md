# Draft: Auto-Fire Firework Feature

## Requirements (stated)
- Add an "auto fire" fireworks feature.
- Add a button in the left-bottom corner.
- Button "loads" every second and on every tap.
- When filled to 88, auto fire can be activated for 88 seconds.

## Requirements (confirmed)
- Charging model: passive + tap; charge clamps at 88.
- Activation: when charge is 88, user taps to activate; activation consumes the charge and runs auto-fire for 88 seconds.
- Tap bonus source: only taps that fire a firework grant +1 charge.
- Auto-fire cadence: every 3 seconds, launch 1-3 fireworks.
- Auto-fire origin: center / fixed area.
- While auto-fire is active: manual taps still fire fireworks; charging continues.
- Stacking: if meter reaches 88 again while active, tapping button extends remaining time by +88s (cap TBD).
- Stacking cap: remaining auto-fire time can be extended up to 888 seconds.
- UI: ring + number for charge; when active, show countdown seconds.
- Cancel: no cancel; auto-fire runs until countdown reaches 0.
- Charging during auto-fire: auto-fire launches do NOT contribute to charge.
- Tests: add Vitest; include unit tests for charge/timer logic.

## Scope Boundaries
- INCLUDE: UI button + meter, charging logic, activation for a timed duration, integrate with existing fireworks firing behavior.
- EXCLUDE: (TBD)

## Open Questions
## Defaults (unless you say otherwise)
- Persistence: charge and remaining time reset on page reload.
- Placement: feature exists on the main fireworks page only (no global settings page).
