# Volume Tooltip Beside Sound Control

## TL;DR
> Add a small startup tooltip beside the existing volume button to teach users that fireworks have sound.

Deliverables:
- Tooltip beside `SoundToggle` that shows on page load for ~5s when stored volume is `0`
- iPhone-only second line reminding about Silent Mode

Estimated effort: Short
Parallel execution: YES (2 waves)
Critical path: Add `volumeLoaded` gating -> Implement tooltip -> QA

---

## Context

### Original Request
Create a start tip telling users to turn on volume so they know there is sound.

### Project Reality (repo read)
- Volume control exists: `src/lib/SoundToggle.svelte`
- Volume persisted in localStorage: `src/routes/+page.svelte` uses `fireworks-volume`
- Sound assets exist: `static/sounds/explosion0.mp3`, `static/sounds/explosion1.mp3`, `static/sounds/explosion2.mp3`

### Interview Decisions (confirmed)
- Show a tooltip beside the volume control
- Auto-hide after ~5 seconds
- Only show if stored volume is `0`; do not show when volume is non-zero
- Show every session (subject to the volume==0 guard)
- Timing: show on page load after volume is confirmed loaded
- Copy:
  - Non-iOS: "Turn up volume for sound"
  - iPhone only (2 lines):
    1) "Turn up volume for sound"
    2) "iPhone: Silent Mode off (turn it back on after)"

### Metis Review (gaps addressed)
- Prevent initial flash before localStorage load by gating tooltip on a `volumeLoaded` boolean.
- Do not attempt to detect Silent Mode; it is not exposed to websites. iPhone hint is copy-only.
- Ensure tooltip does not block pointer events (volume control must still work).
- Respect `prefers-reduced-motion` for tooltip animation.

---

## Work Objectives

### Core Objective
Make sound discoverable without nagging: a subtle tooltip that appears only when a user is effectively muted (volume 0).

### Guardrails (Must NOT)
- Do not add new persistence keys for “dismissed” state
- Do not add a new UI framework / tooltip library
- Do not add generalized UA parsing dependencies

---

## Verification Strategy

Automated tests:
- Infrastructure exists: NO
- Automated tests: None (no new test runner added)

Agent-executed QA:
- Primary: browser automation (dev-browser skill) + screenshots
- Type safety: `pnpm check`
- Build safety: `pnpm build`

Evidence paths:
- `.sisyphus/evidence/task-{N}-{scenario}.png`
- `.sisyphus/evidence/task-{N}-{scenario}.txt` (console or notes if needed)

---

## Execution Strategy

Wave 1 (foundation; can run in parallel)
- Task 1: Add iPhone detection helper
- Task 2: Add volumeLoaded gating + showTip wiring in `+page.svelte`

Wave 2 (UI + integration)
- Task 3: Implement tooltip UI in `SoundToggle` (timers, copy, styling, reduced motion)
- Task 4: QA pass + typecheck/build verification

---

## TODOs

- [x] 1. Add iPhone detection helper

  **What to do**:
  - Add a tiny helper module that returns true only on iPhone (not iPad), with SSR safety.
  - Avoid `navigator.userAgentData` (not available on iOS in practice).

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: (none)

  **Parallelization**:
  - Can run in parallel: YES
  - Parallel group: Wave 1 (with Task 2)
  - Blocks: Task 3
  - Blocked by: None

  **References**:
  - `src/lib/SoundToggle.svelte` - where the tooltip will conditionally show iPhone-only copy
  - `https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData` - limited availability; don’t rely on it
  - `https://github.com/mdn/browser-compat-data/issues/21308` - notes userAgentData not available on iOS/macOS in practice

  **Acceptance Criteria**:
  - [ ] New helper exists (proposed: `src/lib/is-iphone.ts`) exporting `isIPhone(): boolean`
  - [ ] Function is SSR-safe (`typeof navigator === 'undefined'` guard)

  **QA Scenarios**:
  - Scenario: SSR safety smoke
    Tool: Bash
    Steps:
      1. Run `pnpm check` after Wave 2 is complete (Task 4)
    Expected Result: no TS errors related to `navigator` usage
    Evidence: .sisyphus/evidence/task-1-ssr-safety.txt

- [x] 2. Gate tooltip on “volume loaded” + wire showTip into SoundToggle

  **What to do**:
  - In `src/routes/+page.svelte`, add a `$state` boolean (e.g. `volumeLoaded`) that flips true only after the localStorage read/migration effect completes.
  - Compute `showVolumeTip` such that it is true only when `volumeLoaded && volume === 0`.
  - Pass it into `SoundToggle` (new prop) so `SoundToggle` can decide when to start its 5s timer.
  - Guard against the “flash” where initial `volume = 0` briefly shows the tooltip before storage is applied.

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: (none)

  **Parallelization**:
  - Can run in parallel: YES
  - Parallel group: Wave 1 (with Task 1)
  - Blocks: Task 3
  - Blocked by: None

  **References**:
  - `src/routes/+page.svelte` - current localStorage read + `initialized` guard
  - `src/lib/SoundToggle.svelte` - currently only takes `volume` binding

  **Acceptance Criteria**:
  - [ ] Tooltip trigger boolean is derived from the post-load volume (no pre-load flash)
  - [ ] `SoundToggle` receives the new prop (proposed: `showTip={showVolumeTip}`)

  **QA Scenarios**:
  - Scenario: No flash when stored volume is non-zero
    Tool: dev-browser
    Steps:
      1. Set `localStorage.fireworks-volume = "60"` before initial navigation
      2. Load the app route `/`
      3. Assert no tooltip is visible near the volume button
    Expected Result: tooltip absent
    Evidence: .sisyphus/evidence/task-2-no-flash.png

- [x] 3. Implement the startup tooltip beside the volume control

  **What to do**:
  - Implement a tooltip element in `src/lib/SoundToggle.svelte` that appears when `showTip` becomes true.
  - Auto-hide after ~5000ms.
  - Hide immediately if `volume > 0` or if the user opens the volume popover (recommended default to avoid overlap).
  - Tooltip must not block interactions with the volume button/slider (use `pointer-events: none` on the tooltip).
  - Copy rules:
    - Default: “Turn up volume for sound”
    - iPhone-only second line: “iPhone: Silent Mode off (turn it back on after)”
  - Position: render to the left of the fixed top-right button (safer near screen edge than “right-of”).
  - Motion: reuse the existing fade-in feel, but add a `prefers-reduced-motion: reduce` override.
  - Follow repo import rule: use `.ts` extension for the helper import (e.g. `$lib/is-iphone.ts`).
  - Accessibility: use `role="tooltip"` (or keep it `aria-hidden="true"`) and avoid `aria-live` announcements every session.

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: (none)

  **Parallelization**:
  - Can run in parallel: NO
  - Parallel group: Wave 2
  - Blocks: Task 4
  - Blocked by: Task 1, Task 2

  **References**:
  - `src/lib/SoundToggle.svelte` - existing popover pattern, outside-click, fade-in keyframes
  - `src/routes/+page.svelte` - source of `volume` + localStorage behavior
  - `https://developer.apple.com/forums/thread/46461` - Silent Mode cannot be detected; workaround is not detection

  **Acceptance Criteria**:
  - [ ] Tooltip shows only when `showTip === true` and `volume === 0`
  - [ ] Tooltip hides after ~5s and also hides immediately when `volume > 0`
  - [ ] Tooltip does not prevent clicking the volume button or interacting with the slider
  - [ ] iPhone-only second line appears only on iPhone
  - [ ] Reduced motion users do not get animated movement (fade can be disabled)

  **QA Scenarios**:
  - Scenario: Shows when volume is 0
    Tool: dev-browser
    Steps:
      1. Set `localStorage.fireworks-volume = "0"` before initial navigation
      2. Load `/`
      3. Assert tooltip contains “Turn up volume for sound”
      4. Wait 6 seconds
      5. Assert tooltip is gone
    Expected Result: tooltip appears then disappears
    Evidence: .sisyphus/evidence/task-3-shows-then-hides.png

  - Scenario: iPhone second line
    Tool: dev-browser
    Steps:
      1. Emulate iPhone (UA + viewport)
      2. Set `localStorage.fireworks-volume = "0"`
      3. Load `/`
      4. Assert tooltip also contains “iPhone: Silent Mode off”
    Expected Result: second line visible on iPhone emulation
    Evidence: .sisyphus/evidence/task-3-iphone-copy.png

  - Scenario: Does not block controls
    Tool: dev-browser
    Steps:
      1. Ensure `fireworks-volume = "0"`
      2. Load `/`
      3. Click the volume button while tooltip is visible
      4. Assert the slider popover opens (input[type="range"] visible)
    Expected Result: tooltip does not intercept pointer events
    Evidence: .sisyphus/evidence/task-3-does-not-block.png

- [x] 4. Verification pass (typecheck + build) and QA evidence

  **What to do**:
  - Run `pnpm check` and `pnpm build`.
  - Re-run the key QA scenarios and ensure evidence files exist.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: (none)

  **Parallelization**:
  - Can run in parallel: NO
  - Parallel group: Wave 2 (final)
  - Blocks: Final verification wave
  - Blocked by: Task 3

  **Acceptance Criteria**:
  - [ ] `pnpm check` passes
  - [ ] `pnpm build` passes
  - [ ] Evidence files exist for the QA scenarios in Tasks 2 and 3

  **QA Scenarios**:
  - Scenario: Typecheck
    Tool: Bash
    Steps:
      1. Run `pnpm check`
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-4-pnpm-check.txt

  - Scenario: Build
    Tool: Bash
    Steps:
      1. Run `pnpm build`
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-4-pnpm-build.txt

---

## Final Verification Wave

- F1. Plan compliance audit (oracle)
- F2. Code quality review (unspecified-high)
- F3. UI QA replay (dev-browser)
- F4. Scope fidelity check (deep)

---

## Commit Strategy
- Prefer 1 commit: `feat(ui): add startup volume tooltip`

---

## Success Criteria
- Tooltip shows only when stored volume loads as `0`
- Tooltip auto-hides in ~5s and does not block volume button/slider
- iPhone-only second line appears only on iPhone UA
- `pnpm check` passes
- `pnpm build` passes
