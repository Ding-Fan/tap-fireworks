# Fun Random Fireworks - COMPLETED

## TL;DR

> **Quick Summary**: Make every firework burst feel unique and surprising by widening all native randomization ranges and adding an interval-based randomizer for fixed-value options. Single file change.
> 
> **Deliverables**:
> - Updated fireworks config with wider native ranges (brightness, decay, rocketsPoint, lineWidth)
> - setInterval randomizer for explosion size, particle count, gravity, friction, flickering
> - Increased mouse.max for more rockets per tap
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single task
> **Critical Path**: Task 1 (only task)

---

## Context

### Original Request
User wanted fireworks to feel more random and fun to play — varying explosion sizes, colors, particle counts, and behaviors so no two taps feel the same.

### Interview Summary
**Key Discussions**:
- **traceSpeed/acceleration**: User already tuned to `traceSpeed: 40`, `acceleration: 1.25` for near-instant rockets — these must be preserved
- **Native randomization**: Identified that `{ min, max }` options are already random per firework — widening the range increases variety
- **Fixed options**: `explosion`, `particles`, `flickering`, `gravity`, `friction` are single values applied to all fireworks — need manual randomization via `updateOptions()` on an interval
- **Fun factor**: User explicitly chose maximum randomness — "you decide, I want to make it funny to play"

### Metis Review
**Identified Gaps** (addressed):
- **Memory leak risk**: setInterval must be cleaned up in $effect return — plan explicitly requires this
- **Preserve user tuning**: traceSpeed and acceleration must not be randomized (user tuned these specifically)
- **Performance on mobile**: Capped particle max at 115 to avoid frame drops on low-end devices
- **Accessibility**: flickering range 0–100 accepted — user explicitly wants maximum randomness

---

## Work Objectives

### Core Objective
Replace the fireworks initialization `$effect` block with wider randomization ranges and an interval-based option randomizer so every burst feels unique.

### Concrete Deliverables
- Modified `src/routes/+page.svelte` — updated `$effect` block (lines 73–97)

### Definition of Done
- [x] Every tap produces visually distinct fireworks (varying sizes, particle counts, gravity behavior)
- [x] No console errors
- [x] `pnpm check` passes with zero type errors

### Must Have
- Wider native ranges: brightness, decay, rocketsPoint, lineWidth
- Interval randomizer updating explosion, particles, flickering, gravity, friction every 400ms
- mouse.max increased to 5
- Proper cleanup: `clearInterval` + `fw.stop(true)` in $effect return
- Preserve user's traceSpeed (40) and acceleration (1.25) — do NOT randomize these

### Must NOT Have (Guardrails)
- Do NOT create new files or components
- Do NOT add new dependencies
- Do NOT use legacy Svelte syntax (onMount, $:, export let)
- Do NOT randomize traceSpeed or acceleration (user explicitly tuned these)
- Do NOT set intensity > 0 (user wants tap-only, no auto-launch)
- Do NOT touch sound logic or volume/localStorage code

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL verification is executed by the agent using tools.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: none

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Config change** | Bash (pnpm check) | Type check passes |
| **Visual behavior** | Playwright | Tap screen, observe varying fireworks |

---

## Execution Strategy

### Single Task — No Parallelization Needed

One file, one `$effect` block replacement.

---

## TODOs

- [x] 1. Update fireworks $effect with randomized config and interval randomizer

  **What to do**:
  - In `src/routes/+page.svelte`, replace the fireworks initialization `$effect` block (lines 73–97) with updated configuration
  - Update the Fireworks constructor options:
    - `mouse: { click: true, move: false, max: 5 }` (was 3)
    - `brightness: { min: 20, max: 100 }` (was 50–80)
    - `decay: { min: 0.005, max: 0.05 }` (was 0.015–0.03)
    - `rocketsPoint: { min: 10, max: 90 }` (was default 50–50)
    - `explosion: 5` (was 10 — interval will randomize this)
    - `lineWidth: { explosion: { min: 1, max: 6 }, trace: { min: 1, max: 3 } }` (new, was default)
    - Keep `traceSpeed: 40` unchanged
    - Keep `acceleration: 1.25` unchanged
    - Keep `intensity: 0` unchanged
    - Keep `hue: { min: 0, max: 360 }` unchanged
    - Keep `friction: 0.95` as initial (interval will randomize)
    - Keep `gravity: 1.5` as initial (interval will randomize)
    - Keep `opacity: 0.5` unchanged
    - Keep `flickering: 50` as initial (interval will randomize)
    - Keep `particles: 50` as initial (interval will randomize)
    - Keep `traceLength: 3` unchanged
    - Keep `sound: { enabled: false, files: soundFiles }` unchanged
  - After `fw.start()` and `fireworks = fw`, add a `setInterval` every 400ms that calls `fw.updateOptions()` with:
    - `explosion`: `3 + Math.random() * 10` (range 3–13)
    - `particles`: `15 + Math.floor(Math.random() * 100)` (range 15–115)
    - `flickering`: `Math.random() * 100` (range 0–100)
    - `gravity`: `0.5 + Math.random() * 3` (range 0.5–3.5)
    - `friction`: `0.92 + Math.random() * 0.07` (range 0.92–0.99)
  - Update the cleanup return to: `() => { clearInterval(interval); fw.stop(true) }`

  **Must NOT do**:
  - Do NOT modify any code outside the fireworks `$effect` block (lines 73–97)
  - Do NOT touch sound effects, volume logic, or localStorage code
  - Do NOT use `onMount` or any legacy Svelte patterns
  - Do NOT randomize traceSpeed or acceleration
  - Do NOT set intensity > 0

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, single block replacement — trivial scope
  - **Skills**: []
    - No special skills needed — straightforward config change

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (only task)
  - **Blocks**: Nothing
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/routes/+page.svelte:73-97` — Current $effect block to replace. Keep the same structure: Fireworks constructor → fw.start() → fireworks = fw → return cleanup

  **API/Type References** (contracts to implement against):
  - `node_modules/fireworks-js/dist/types.d.ts:4-26` — Full FireworksTypes.Options interface showing all option types
  - `node_modules/fireworks-js/dist/types.d.ts:49-52` — MinMax interface: `{ min: number, max: number }`
  - `node_modules/fireworks-js/dist/types.d.ts:45-48` — LineWidth interface: `{ explosion: MinMax, trace: MinMax }`

  **WHY Each Reference Matters**:
  - `+page.svelte:73-97` — This is the exact block to replace. All surrounding code (sound logic, localStorage, volume) must remain untouched
  - `types.d.ts` — Ensures all option keys and value types are correct for strict TypeScript

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Type check passes with updated config
    Tool: Bash
    Preconditions: Project dependencies installed
    Steps:
      1. Run: pnpm check
      2. Assert: Exit code 0
      3. Assert: No TypeScript errors in output
    Expected Result: Zero type errors
    Evidence: Terminal output captured

  Scenario: Fireworks display with visual variety
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: .fireworks-container visible (timeout: 5s)
      3. Click: center of .fireworks-container
      4. Wait: 500ms
      5. Click: upper-left area of .fireworks-container
      6. Wait: 500ms
      7. Click: lower-right area of .fireworks-container
      8. Wait: 1000ms
      9. Screenshot: .sisyphus/evidence/task-1-fireworks-variety.png
      10. Assert: No console errors
    Expected Result: Fireworks render at tapped positions without errors
    Evidence: .sisyphus/evidence/task-1-fireworks-variety.png

  Scenario: Cleanup works without memory leaks
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: center of .fireworks-container
      3. Wait: 2s
      4. Navigate to: http://localhost:5173 (full page reload)
      5. Wait for: .fireworks-container visible (timeout: 5s)
      6. Assert: No console errors about "cannot read properties of null" or similar cleanup failures
    Expected Result: Page reload works cleanly, no leaked intervals
    Evidence: Console output captured
  ```

  **Commit**: YES
  - Message: `feat(fireworks): add randomized explosion variety for more fun gameplay`
  - Files: `src/routes/+page.svelte`
  - Pre-commit: `pnpm check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(fireworks): add randomized explosion variety for more fun gameplay` | `src/routes/+page.svelte` | `pnpm check` |

---

## Success Criteria

### Verification Commands
```bash
pnpm check  # Expected: 0 errors, 0 warnings
```

### Final Checklist
- [x] Wider brightness range (20–100) present
- [x] Wider decay range (0.005–0.05) present
- [x] rocketsPoint randomized (10–90)
- [x] lineWidth configured with wide ranges
- [x] mouse.max = 5
- [x] setInterval randomizer present (400ms cycle)
- [x] Randomizer covers: explosion, particles, flickering, gravity, friction
- [x] traceSpeed = 40 preserved (NOT randomized)
- [x] acceleration = 1.25 preserved (NOT randomized)
- [x] intensity = 0 preserved
- [x] Cleanup function calls clearInterval AND fw.stop(true)
- [x] pnpm check passes with zero errors
- [x] No new files created
- [x] No new dependencies added
- [x] Sound/volume/localStorage code untouched
