# Tap-Only Fireworks Fix

## TL;DR

> **Quick Summary**: Fix fireworks to only fire on user tap/click instead of auto-firing continuously. Single-line config change.
> 
> **Deliverables**: Updated `+page.svelte` with `intensity: 0` and `fireworks.start()` restored
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single task
> **Critical Path**: Task 1 only

---

## Context

### Original Request
User wants fireworks to fire only on tap/click, not automatically.

### Root Cause Analysis
In `fireworks-js` source (`node_modules/fireworks-js/dist/index.es.js`):

1. **`start()`** (line 359-361): Mounts the render loop (RAF), mouse listeners, and resize observer. **This is required** — without it, nothing works (no rendering, no mouse detection).

2. **`initTrace()`** (line 432-436): Auto-spawns fireworks when `raf.tick > delay`. The tick increments each frame by `delta * (intensity * Math.PI) / 1000`. With `intensity: 30`, auto-fire triggers constantly.

3. **Mouse click path** (line 435): `this.mouse.active && mouse.max > traces.length` — this works independently of the tick-based auto-fire.

**Solution**: Set `intensity: 0`. This makes `tick += delta * (0 * Math.PI) / 1000 = 0`, so tick never reaches the delay threshold and auto-fire never triggers. Mouse clicks still work because they use a separate condition.

---

## Work Objectives

### Core Objective
Make fireworks only fire on user tap/click interaction.

### Must Have
- `intensity: 0` to disable auto-fire
- `fireworks.start()` must be called to mount the render loop and mouse listeners

### Must NOT Have
- Do NOT remove `fireworks.start()` — it is required for the render loop and mouse listener mounting
- Do NOT change any other fireworks options

---

## TODOs

- [x] 1. Fix fireworks to tap-only mode

  **What to do**:
  - In `src/routes/+page.svelte`, make TWO changes:
    1. Change `intensity: 30` → `intensity: 0` (line 19)
    2. Add back `fireworks.start()` before the cleanup return (it was removed in a previous broken attempt — line 25 currently has `return () => fireworks.stop(true)`, add `fireworks.start()` on the line before it)

  **The final `$effect` block should look like**:
  ```svelte
  $effect(() => {
    const fireworks = new Fireworks(container, {
      autoresize: true,
      mouse: { click: true, move: false, max: 3 },
      hue: { min: 0, max: 360 },
      particles: 50,
      gravity: 1.5,
      friction: 0.95,
      brightness: { min: 50, max: 80 },
      decay: { min: 0.015, max: 0.03 },
      traceLength: 3,
      traceSpeed: 10,
      flickering: 50,
      intensity: 0,
      explosion: 5,
      opacity: 0.5,
      acceleration: 1.05,
      sound: { enabled: false }
    })
    fireworks.start()
    return () => fireworks.stop(true)
  })
  ```

  **Must NOT do**:
  - Do NOT remove `fireworks.start()`
  - Do NOT change any option other than `intensity`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Single-line config change in existing file

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (single task)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/routes/+page.svelte:6-26` - The `$effect` block to modify
  - `node_modules/fireworks-js/dist/index.es.js:217` - How `intensity` controls tick rate: `this.tick += n * (this.options.intensity * Math.PI) / 1e3`
  - `node_modules/fireworks-js/dist/index.es.js:432-436` - `initTrace()` — auto-fire condition: `this.raf.tick > o(t.min, t.max)` AND mouse-click condition: `this.mouse.active && i.max > this.traces.length`
  - `node_modules/fireworks-js/dist/index.es.js:359-361` - `start()` mounts RAF, mouse, and resize (all required)

  **Acceptance Criteria**:
  - [ ] `intensity` is set to `0` in the Fireworks options
  - [ ] `fireworks.start()` is called after creating the Fireworks instance
  - [ ] `pnpm check` passes with 0 errors and 0 warnings

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: No auto-firing on page load
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait: 3 seconds (do nothing)
      3. Screenshot: .sisyphus/evidence/task-1-no-autofire.png
    Expected Result: Black screen with no fireworks visible
    Evidence: .sisyphus/evidence/task-1-no-autofire.png

  Scenario: Fireworks fire on click/tap
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: center of viewport (500, 400)
      3. Wait: 1 second for firework animation
      4. Screenshot: .sisyphus/evidence/task-1-tap-fires.png
    Expected Result: Firework particles visible near click location
    Evidence: .sisyphus/evidence/task-1-tap-fires.png
  ```

  **Commit**: YES
  - Message: `fix: disable auto-firing fireworks, only trigger on tap`
  - Files: `src/routes/+page.svelte`
  - Pre-commit: `pnpm check`

---

## Success Criteria

### Verification Commands
```bash
pnpm check  # Expected: 0 errors and 0 warnings
```

### Final Checklist
- [ ] `intensity` set to `0`
- [ ] `fireworks.start()` present
- [ ] No auto-firing on page load
- [ ] Fireworks fire on tap/click
- [ ] Type check passes
