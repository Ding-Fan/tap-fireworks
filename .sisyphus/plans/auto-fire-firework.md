# Auto-Fire Firework Feature Plan

## TL;DR
> Add a bottom-left charge button that fills to 88 via passive + manual firing taps, then enables an auto-fire mode for 88 seconds; allow extending up to 888 seconds.

**Deliverables**:
- Bottom-left `AutoFire` button with ring + number UI and active countdown
- Charge + timer state machine (unit-tested)
- `+page.svelte` integration: charging, activation, auto-fire scheduler, safe event isolation
- Vitest setup + `pnpm test`

**Estimated Effort**: Medium
**Parallel Execution**: YES (3 waves)
**Critical Path**: State machine + Vitest → Page integration → verification

---

## Context

### Original Request
Add an auto fire fireworks feature: a left-bottom button that loads every second and every tap; when filled to 88 it can be activated for 88 seconds.

### Confirmed Requirements
- UI: button at bottom-left; ring + number for charge; when active show countdown seconds.
- Charging: +1 per second passively; +1 per manual tap that fires a firework; clamp 0..88.
- Activation: when charge==88, user taps button to start auto-fire; consumes charge.
- Auto-fire cadence: every 3 seconds, launch 1-3 fireworks.
- Auto-fire origin: center / fixed area.
- While active: manual taps still fire and still charge; passive charging continues.
- Auto-fire launches do NOT contribute to charging.
- Stacking: while active, if charge reaches 88, tapping button extends remaining time by +88s; cap remaining time at 888s; consumes charge.
- Cancel: none.
- Persistence default: reset on reload.

### Repo Reality Check (existing patterns to follow)
- Manual fireworks are fired in `src/routes/+page.svelte` via `pointerdown` and `fw.launch(1)`.
- Per-tap currently launches multiple rockets (3-5) by setting `(fw as any).mouse` and looping `fw.launch(1)`.
- UI controls isolate pointer events using `event.stopPropagation()` in `src/lib/SoundToggle.svelte`.

### Defaults Applied (override if you disagree)
- "Tap" for charging means **+1 per pointerdown** (not per rocket) even though each pointerdown spawns 3-5 rockets.
- Auto-fire timing: fire immediately on activation, then continue every 3 seconds.

---

## Work Objectives

### Core Objective
Provide a deterministic, leak-free auto-fire mode that integrates with existing manual fireworks and avoids accidental taps on UI triggering background fireworks.

### Must NOT Have (Guardrails)
- No persistence (no localStorage) for charge or remaining time.
- No new routes/settings pages.
- No forking or patching `fireworks-js`; use existing runtime mouse targeting pattern.

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test runner currently)
- **Automated tests**: YES (add Vitest)
- **Framework**: Vitest with fake timers for time-based reducer tests

### Required Commands (agent-executable)
- `pnpm check`
- `pnpm build`
- `pnpm test`

### QA Evidence Policy
Each task includes agent-executed QA scenarios with evidence saved under `.sisyphus/evidence/`.

QA tooling expectations:
- UI verification uses the `playwright` skill (no "please manually verify" steps).
- Use stable selectors via `data-testid` attributes added to the new button component.

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (foundation, parallel):
- T1 State machine module (charge/activate/extend/tick)
- T2 Auto-fire target generation helper (center/fixed area)
- T3 Auto-fire button component (ring + number + active countdown UI)
- T4 Vitest setup (`pnpm test`)

Wave 2 (integration, parallel where possible):
- T5 Integrate charging + activation into `src/routes/+page.svelte`
- T6 Integrate auto-fire scheduler/launching into `src/routes/+page.svelte`
- T7 Unit tests for state machine + timers (Vitest fake timers)

Wave 3 (verification + polish):
- T8 Interaction isolation + z-index/safe-area polish; verify SoundToggle + AutoFire coexist

---

## TODOs

- [ ] T1. Add pure auto-fire state machine module

  **What to do**:
  - Create a new TS module (e.g. `src/lib/auto-fire/state.ts`) that models:
    - `charge` (0..88)
    - `activeRemainingSeconds` (0..888)
    - events: `tickSecond`, `manualFireTap`, `activateOrExtendTap`
  - Encode rules:
    - `tickSecond`: if inactive or active, charge += 1 (clamp 88); if active, remaining -= 1 (floor at 0)
    - `manualFireTap`: charge += 1 (clamp 88)
    - `activateOrExtendTap`:
      - if inactive and charge==88: set remaining=88 (or remaining +=88 if you prefer) and charge=0
      - if active and charge==88: remaining += 88 (cap 888) and charge=0
      - else: no-op
  - Export helpers to compute view state: `mode = 'charging' | 'active'`, `displayNumber`, `ringProgress`.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: (none)

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T5, T6, T7

  **References**:
  - `src/routes/+page.svelte:107` - manual pointerdown pattern to map "manualFireTap" events

  **Acceptance Criteria**:
  - [ ] `pnpm check` passes after adding the module
  - [ ] Module has no `any` / `@ts-ignore`

  **QA Scenarios**:
  ```
  Scenario: Reducer clamps charge to 88
    Tool: pnpm test (after T4+T7)
    Steps:
      1. Start at charge=87
      2. Apply manualFireTap twice
    Expected Result: charge==88
    Evidence: .sisyphus/evidence/t1-clamp.txt
  ```

- [ ] T2. Add center/fixed-area target generator for auto-fire

  **What to do**:
  - Add a helper (e.g. `src/lib/auto-fire/target.ts`) that returns a target point for auto-fire.
  - Use "center/fixed area" by returning viewport center with small jitter (so visuals vary) but bounded.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T6

  **References**:
  - `src/routes/+page.svelte:109` - how tap positions are computed relative to container rect

  **Acceptance Criteria**:
  - [ ] `pnpm check` passes

  **QA Scenarios**:
  ```
  Scenario: Target generator stays within bounds
    Tool: pnpm test (after T4+T7)
    Steps:
      1. Call generator for a 390x844 viewport 1000 times
      2. Assert x/y always within [margin, width-margin] / [margin, height-margin]
    Expected Result: No out-of-bounds targets
    Evidence: .sisyphus/evidence/t2-target-bounds.txt
  ```

- [ ] T3. Create bottom-left AutoFire button component

  **What to do**:
  - Add `src/lib/AutoFireButton.svelte` implementing:
    - stable selectors: `data-testid="autofire-btn"`, `data-testid="autofire-number"`, `data-testid="autofire-charge"`, `data-testid="autofire-remaining"`
    - ring progress mapping (define explicitly):
      - charging: ring = `charge/88`, number = `charge`
      - active: ring = `min(remainingSeconds, 88)/88` (full ring if >88), number = `ceil(remainingSeconds)`
      - extend-ready: when active AND charge==88, button has a visually distinct state (e.g. glow) so the user knows tapping extends
    - pointer event isolation (`stopPropagation` on pointerdown/click)
  - Visual: matches existing "frosted dark" look from `src/lib/SoundToggle.svelte` (no new global design system).
  - While active, also display the current charge in a subtle way (e.g. small corner number) so the user can tell when extension is available.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T5

  **References**:
  - `src/lib/SoundToggle.svelte:70` - stopPropagation pattern on pointerdown
  - `src/lib/SoundToggle.svelte:168` - fixed-position control styling + z-index conventions

  **Acceptance Criteria**:
  - [ ] Component renders without runtime errors
  - [ ] Pointerdown on button does not trigger background fireworks

  **QA Scenarios**:
  ```
  Scenario: Button blocks fireworks pointerdown
    Tool: Playwright
    Steps:
      1. Start dev server: `pnpm dev -- --host 127.0.0.1 --port 5173`
      2. Open http://127.0.0.1:5173/
      3. Click `[data-testid="autofire-btn"]` 10 times
      4. Take a screenshot after clicks
    Expected Result: UI remains responsive; no runtime errors; button clicks do not trigger background pointerdown handler
    Evidence: .sisyphus/evidence/t3-stop-prop.png
  ```

- [ ] T4. Add Vitest setup

  **What to do**:
  - Add Vitest dev dependency and minimal config.
  - Add a `pnpm test` script.
  - Ensure TypeScript pathing works for tests.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T7

  **References**:
  - `package.json` - existing scripts and module type

  **Acceptance Criteria**:
  - [ ] `pnpm test` runs (even if 0 tests initially)

  **QA Scenarios**:
  ```
  Scenario: Vitest runs
    Tool: Bash
    Steps:
      1. Run pnpm test
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/t4-vitest.txt
  ```

- [ ] T5. Wire charging + activation into `src/routes/+page.svelte`

  **What to do**:
  - Instantiate state in `src/routes/+page.svelte` using Svelte 5 runes.
  - Add a 1-second tick driver in `$effect()` with cleanup.
  - On manual pointerdown handler (`handlePointerDown`), dispatch exactly one `manualFireTap` per pointerdown.
  - Render `AutoFireButton` bottom-left; on its tap, dispatch `activateOrExtendTap`.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: (none)

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 2)
  - **Blocked By**: T1, T3
  - **Blocks**: T6, T8

  **References**:
  - `src/routes/+page.svelte:75` - existing Fireworks init + `$effect()` cleanup pattern
  - `src/routes/+page.svelte:107` - pointerdown handler to augment with charging

  **Acceptance Criteria**:
  - [ ] `pnpm check` passes
  - [ ] Charge increases by 1 per second and +1 per manual pointerdown
  - [ ] Button only activates when displaying 88

  **QA Scenarios**:
  ```
  Scenario: Charge fills over time and with taps
    Tool: Playwright
    Steps:
      1. Start dev server: `pnpm dev -- --host 127.0.0.1 --port 5173`
      2. Open http://127.0.0.1:5173/
      3. Read initial text from `[data-testid="autofire-charge"]` (expect "0" on fresh load)
      4. Wait 5 seconds
      5. Read `[data-testid="autofire-charge"]` again (expect >= "5")
      6. Click the canvas background 3 times (outside UI controls)
      7. Read `[data-testid="autofire-charge"]` again (expect it increased by at least 3)
      8. Screenshot
    Expected Result: Number increases passively and by +1 per background pointerdown
    Evidence: .sisyphus/evidence/t5-charge.png

  Scenario: Activation is gated at 88
    Tool: Playwright
    Steps:
      1. Start dev server: `pnpm dev -- --host 127.0.0.1 --port 5173`
      2. Open http://127.0.0.1:5173/
      3. Click `.fireworks-container` 10 times
      4. Assert `[data-testid="autofire-charge"]` is "10" (or >= "10" if passive ticked)
      5. Click `[data-testid="autofire-btn"]`
      6. Assert `[data-testid="autofire-remaining"]` is "0"
      7. Screenshot
    Expected Result: Button tap does not start auto-fire when charge < 88
    Evidence: .sisyphus/evidence/t5-gated.png
  ```

- [ ] T6. Implement auto-fire scheduler + center launching

  **What to do**:
  - When `activeRemainingSeconds > 0`, drive an interval that every 3 seconds triggers 1-3 launches.
  - Implement launching by reusing the existing `(fw as any).mouse` targeting pattern:
    - compute center target in container coordinates
    - set mouse.x/y/active and call `fw.launch(1)` in a loop for 1-3 rockets
  - Ensure auto-fire does NOT call the charge increment event.
  - Cleanup intervals on unmount and when active ends.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 2)
  - **Blocked By**: T1, T2, T5

  **References**:
  - `src/routes/+page.svelte:113` - `(fw as any).mouse` usage to direct rockets
  - `src/routes/+page.svelte:115` - multiple `fw.launch(1)` per event

  **Acceptance Criteria**:
  - [ ] When active, fireworks launch automatically ~every 3 seconds
  - [ ] Auto-fire originates from center/fixed area
  - [ ] `pnpm build` passes

  **QA Scenarios**:
  ```
  Scenario: Auto-fire launches while active
    Tool: Playwright
    Steps:
      1. Start dev server: `pnpm dev -- --host 127.0.0.1 --port 5173`
      2. Open http://127.0.0.1:5173/
      3. Click `.fireworks-container` 88 times (to reach full charge quickly)
      4. Assert `[data-testid="autofire-charge"]` is "88"
      5. Click `[data-testid="autofire-btn"]` to activate
      6. Assert `[data-testid="autofire-remaining"]` becomes "88" (or "87" depending on tick order)
      7. Wait 4 seconds
      8. Assert `[data-testid="autofire-remaining"]` decreased (at least by 3)
      9. Screenshot
    Expected Result: Auto-fire is active (remaining counts down); no errors
    Evidence: .sisyphus/evidence/t6-autofire.png
  
  Scenario: Auto-fire does not self-charge
    Tool: Playwright
    Steps:
      1. Activate auto-fire (as in prior scenario)
      2. Record starting `[data-testid="autofire-charge"]` (expect "0" right after activation)
      3. Do not click the background for 9 seconds
      4. Read `[data-testid="autofire-charge"]` again
      5. Screenshot
    Expected Result: Charge increased by ~9 from passive ticks only (not inflated by auto launches)
    Evidence: .sisyphus/evidence/t6-no-self-charge.png

  Scenario: Extend increases remaining and respects 888 cap
    Tool: pnpm test
    Steps:
      1. Run `pnpm test` (includes reducer tests for extending at 880->888)
    Expected Result: Extension logic is capped; tests pass
    Evidence: .sisyphus/evidence/t6-extend-cap.txt
  ```

- [ ] T7. Add Vitest unit tests for the state machine (with fake timers)

  **What to do**:
  - Create tests covering: clamp, activation gating, extend-to-888, countdown to 0, and that auto-fire launches do not affect charge.
  - Use Vitest fake timers to simulate seconds.

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocked By**: T1, T4

  **References**:
  - `src/routes/+page.svelte:126` - existing `setInterval` cleanup pattern

  **Acceptance Criteria**:
  - [ ] `pnpm test` passes with the new tests

  **QA Scenarios**:
  ```
  Scenario: Extend caps at 888
    Tool: pnpm test
    Steps:
      1. Start activeRemaining=880, charge=88
      2. Dispatch activateOrExtendTap
    Expected Result: activeRemaining==888 and charge==0
    Evidence: .sisyphus/evidence/t7-cap-888.txt
  ```

- [ ] T8. Final interaction isolation + safe-area polish

  **What to do**:
  - Ensure AutoFire button has z-index that doesn’t overlap SoundToggle but both are clickable.
  - Add safe-area padding (`env(safe-area-inset-*)`) so button isn’t under notches.
  - Ensure tapping button never triggers `handlePointerDown`.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`css-mobile-fixes`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T5, T6

  **References**:
  - `src/lib/SoundToggle.svelte:169` - fixed positioning and z-index patterns

  **Acceptance Criteria**:
  - [ ] `pnpm build` passes
  - [ ] UI controls don’t trigger background pointerdown

  **QA Scenarios**:
  ```
  Scenario: Mobile safe-area placement
    Tool: Playwright
    Steps:
      1. Emulate iPhone viewport in browser devtools
      2. Verify bottom-left button is fully visible and tappable
    Expected Result: Button not clipped by safe-area
    Evidence: .sisyphus/evidence/t8-safe-area.png
  ```

---

## Final Verification Wave

- [ ] FV1. Run `pnpm check && pnpm test && pnpm build`
  Evidence: `.sisyphus/evidence/final-commands.txt`

---

## Commit Strategy
- Commit A: `feat(auto-fire): add charge state machine + vitest`
- Commit B: `feat(auto-fire): add button UI + page integration`

---

## Success Criteria
- Button appears bottom-left with ring+number.
- Charge fills passively and per manual fire tap to 88 and clamps.
- Auto-fire runs for 88s; launches every ~3s (1-3 fireworks) from center/fixed area.
- While active: manual taps still work and still charge; auto-fire does not self-charge.
- While active: reaching 88 and tapping extends remaining by +88s up to 888s.
- `pnpm check`, `pnpm test`, `pnpm build` all pass.
