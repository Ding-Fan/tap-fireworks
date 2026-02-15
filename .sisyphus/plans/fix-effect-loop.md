# Fix: effect_update_depth_exceeded in sound toggle

## TL;DR

> **Quick Summary**: Fix infinite `$effect` loop caused by the fireworks initialization effect both reading and writing the `fireworks` `$state` variable. Use a local variable to break the read-write cycle.
> 
> **Deliverables**:
> - Fix 3 lines in `src/routes/+page.svelte` (Effect 4, lines 49-70)
> 
> **Estimated Effort**: Quick (< 5 minutes)
> **Parallel Execution**: NO — single task

---

## Context

### Bug Report
User reported "the sound toggle button seems not working when I click the buttons."

### Diagnosis (via Playwright)
- Buttons DO respond to clicks (Subtle became `[active]` in DOM snapshot)
- BUT: console error `effect_update_depth_exceeded` at `+page.svelte:67:5`
- Error: "Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state"

### Root Cause
Effect 4 (fireworks initialization, lines 49-70) both READS and WRITES the `fireworks` `$state` variable:

```svelte
$effect(() => {
    fireworks = new Fireworks(...)  // WRITES $state
    fireworks.start()               // READS $state  ← creates dependency!
    return () => fireworks?.stop()   // READS $state  ← creates dependency!
})
```

When `soundLevel` changes → Effect 3 reads `fireworks` → updates options → Svelte re-evaluates → Effect 4 re-runs (it depends on `fireworks` because it reads it) → writes new `fireworks` → Effect 3 fires again → infinite loop.

---

## Work Objectives

### Core Objective
Break the `$effect` read-write cycle on `fireworks` `$state` variable.

### Definition of Done
- [ ] No `effect_update_depth_exceeded` error in console
- [ ] Sound toggle cycles through mute → subtle → medium without errors
- [ ] Fireworks still render and respond to taps
- [ ] Sound plays when toggled to subtle or medium
- [ ] `pnpm check` passes with 0 errors

---

## TODOs

- [x] 1. Fix $effect read-write cycle in +page.svelte

  **What to do**:
  
  In `src/routes/+page.svelte`, change Effect 4 (the fireworks initialization effect, currently lines 49-70) to use a local variable instead of reading from `$state`:

  **CURRENT CODE (lines 49-70):**
  ```svelte
  $effect(() => {
    fireworks = new Fireworks(container, {
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
      sound: { enabled: false, files: soundFiles }
    })
    fireworks.start()
    return () => fireworks?.stop(true)
  })
  ```

  **REPLACE WITH:**
  ```svelte
  $effect(() => {
    const fw = new Fireworks(container, {
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
      sound: { enabled: false, files: soundFiles }
    })
    fireworks = fw
    fw.start()
    return () => fw.stop(true)
  })
  ```

  **Why this works**: 
  - `const fw` is a local variable — Svelte doesn't track it as a dependency
  - `fireworks = fw` is a WRITE-ONLY operation (no read from `$state`)
  - `fw.start()` and `fw.stop()` reference the local variable, not `$state`
  - Effect 4's only reactive dependency becomes `container` (from `bind:this`)
  - Effect 3 still correctly depends on `fireworks` and `soundLevel`

  **Must NOT do**:
  - Do NOT change any other effects (Effect 1, 2, or 3)
  - Do NOT change the Fireworks constructor options
  - Do NOT modify SoundToggle.svelte
  - Do NOT change the fireworks instance to a non-reactive variable (Effect 3 needs it reactive)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: None needed — this is a 3-line edit

  **References**:
  - `src/routes/+page.svelte:49-70` — The effect to modify
  - `src/routes/+page.svelte:37-47` — Effect 3 (sound update) — do NOT modify, but understand it depends on `fireworks`
  - Svelte 5 docs: https://svelte.dev/e/effect_update_depth_exceeded

  **Acceptance Criteria**:

  - [ ] Edit applied: lines use `const fw = new Fireworks(...)`, `fireworks = fw`, `fw.start()`, `fw.stop(true)`
  - [ ] `pnpm check` → 0 errors, 0 warnings

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Sound toggle cycles without errors
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Take snapshot — verify button "Mute" is [pressed]
      3. Click: button "Subtle" (ref from snapshot)
      4. Check console messages (level: error) — assert 0 errors
      5. Take snapshot — verify button "Subtle" is [pressed], Mute is not
      6. Click: button "Medium" (ref from snapshot)
      7. Check console messages (level: error) — assert 0 errors
      8. Take snapshot — verify button "Medium" is [pressed]
      9. Click: button "Mute" (ref from snapshot)
      10. Check console messages (level: error) — assert 0 errors
      11. Take snapshot — verify button "Mute" is [pressed]
    Expected Result: All 3 states cycle cleanly with zero console errors
    Evidence: Console messages log

  Scenario: Fireworks still render on tap after toggle
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, sound toggle visible
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Click: button "Subtle" to change sound state
      3. Click: center of page (fireworks canvas area) to trigger firework
      4. Wait 2 seconds for firework to render
      5. Take screenshot: .sisyphus/evidence/fireworks-after-toggle.png
      6. Check console messages (level: error) — assert 0 errors
    Expected Result: Fireworks render, no errors, sound state persists
    Evidence: .sisyphus/evidence/fireworks-after-toggle.png

  Scenario: localStorage persists across reload
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Click: button "Medium"
      3. Evaluate JS: () => localStorage.getItem('fireworks-sound') → assert "medium"
      4. Navigate to: http://localhost:5173/ (reload)
      5. Take snapshot — verify button "Medium" is [pressed]
    Expected Result: Medium state persists after reload
    Evidence: Snapshot output
  ```

  **Commit**: YES
  - Message: `fix(sound): break $effect read-write cycle on fireworks state`
  - Files: `src/routes/+page.svelte`
  - Pre-commit: `pnpm check`

---

## Success Criteria

### Verification Commands
```bash
pnpm check  # Expected: 0 errors, 0 warnings
```

### Final Checklist
- [ ] No `effect_update_depth_exceeded` in console
- [ ] Toggle cycles mute → subtle → medium → mute without errors
- [ ] Fireworks still render on tap
- [ ] Sound plays on subtle/medium states
- [ ] localStorage persists preference across reload
- [ ] `pnpm check` passes
