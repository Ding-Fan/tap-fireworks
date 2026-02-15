# Spread Multi-Rocket Explosion Points

## TL;DR

> **Quick Summary**: Replace the built-in mouse click handler with a custom `pointerdown` handler that fires each rocket to a slightly different position around the tap point, so multiple rockets look like distinct fireworks instead of one overlapping blob.
>
> **Deliverables**:
> - Custom `pointerdown` handler with per-rocket spread offsets
> - Disabled built-in click handler; manual `launch(1)` calls with position jitter
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single task
> **Critical Path**: Task 1 (only task)

---

## Context

### Original Request
> "when multiple fireworks happens in the tapped place, they should not explode at same point, there should be some difference so the fireworks looks like several instead of one"

### Interview Summary
**Key Discussions**:
- The library's `createTrace()` (line 422-423 of `index.es.js`) sends ALL rockets to the exact same `mouse.x, mouse.y` — no built-in spread option
- Fix approach: disable built-in click handler, add custom `pointerdown` that loops 3-5 times per tap, each launch at a slightly offset position
- `(fw as any).mouse` is required because the `mouse` property is private in TypeScript but accessible at runtime
- `launch(t)` (lines 379-383) calls `createTrace()` synchronously in a for loop, so setting `mouse.x/y` before each `launch(1)` call will correctly direct each individual rocket

**Research Findings**:
- Library mouse handler at line 117: `(s || n) && (this.x = t.pageX - this.canvas.offsetLeft, ...)` — guarded by `click || move`, so setting both to `false` makes it a no-op
- `initTrace()` at line 435: `this.mouse.active && i.max > this.traces.length` — controls max concurrent traces, but our manual `launch(1)` bypasses this (it calls `createTrace()` directly)
- The container is `position: fixed; inset: 0` so `getBoundingClientRect()` returns `{left: 0, top: 0}`, but using it is still safer than `offsetLeft` for future-proofing

### Metis Review
**Identified Gaps** (all addressed):
- **Coordinate calculation**: Use `getBoundingClientRect()` instead of `offsetLeft` for robustness (resolved: using `getBoundingClientRect()`)
- **`e.preventDefault()`**: Add to prevent double-tap-to-zoom on mobile (resolved: included in handler)
- **Guard handler**: Ensure `fw` exists before accessing mouse internals (resolved: guard check added)
- **Private API comment**: Document why `(fw as any).mouse` is used (resolved: inline comment)
- **Out-of-bounds spread coordinates**: Library clips internally; no clamping needed (resolved: accepted, no action)

---

## Work Objectives

### Core Objective
Make multiple rockets from a single tap explode at visually distinct positions by adding random positional jitter (±60px) to each launch.

### Concrete Deliverables
- Modified `src/routes/+page.svelte`: custom `pointerdown` handler with spread logic

### Definition of Done
- [ ] A single tap launches 3-5 rockets to different positions (not the same pixel)
- [ ] `pnpm check` passes with 0 errors, 0 warnings
- [ ] No console errors when tapping

### Must Have
- Random rocket count per tap (3-5)
- Random position offset per rocket (±60px spread)
- Proper cleanup of the event listener in `$effect` return
- `getBoundingClientRect()` for coordinate calculation
- `e.preventDefault()` to prevent mobile double-tap zoom

### Must NOT Have (Guardrails)
- Do NOT modify `traceSpeed`, `acceleration`, or `intensity` values
- Do NOT modify the existing randomizer `setInterval` (lines 101-109)
- Do NOT modify sound configuration or volume management (lines 9-71)
- Do NOT add time-based staggering (rockets launch synchronously, visual spread is positional only)
- Do NOT add UI controls for spread radius or rocket count (hardcode values)
- Do NOT install new dependencies
- Do NOT modify any files other than `src/routes/+page.svelte`

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL verification is executed by the agent using tools. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: None

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool**: Playwright (for visual/interaction verification) + Bash (for type checking)

---

## Execution Strategy

### Single Task — No Parallelization
One file, one task. Sequential execution.

---

## TODOs

- [ ] 1. Replace built-in click with custom spread handler

  **What to do**:

  1. **Change the mouse config** (line 76):
     - FROM: `mouse: { click: true, move: false, max: 5 }`
     - TO: `mouse: { click: false, move: false, max: 1 }`
     - `click: false` disables the library's internal `pointerdown` handler (guarded by `(click || move)` at line 117 of `index.es.js`)
     - `max: 1` because we control launch count ourselves now

  2. **Add custom `pointerdown` handler** inside the fireworks `$effect` block (after `fw.start()` on line 98):
     ```typescript
     // Custom spread handler: launch rockets to slightly offset positions
     // so multiple fireworks from one tap look distinct instead of overlapping.
     // Accesses (fw as any).mouse because the mouse property is private in
     // fireworks-js types but accessible at runtime — needed to direct rockets.
     const handlePointerDown = (e: PointerEvent) => {
       e.preventDefault()
       const rect = container.getBoundingClientRect()
       const tapX = e.clientX - rect.left
       const tapY = e.clientY - rect.top
       const count = 3 + Math.floor(Math.random() * 3) // 3-5 rockets
       const mouse = (fw as any).mouse

       for (let i = 0; i < count; i++) {
         mouse.x = tapX + (Math.random() - 0.5) * 120 // ±60px spread
         mouse.y = tapY + (Math.random() - 0.5) * 120
         mouse.active = true
         fw.launch(1)
       }
       mouse.active = false
     }

     container.addEventListener('pointerdown', handlePointerDown)
     ```

  3. **Add cleanup** in the `$effect` return (alongside existing cleanup):
     ```typescript
     return () => {
       container.removeEventListener('pointerdown', handlePointerDown)
       clearInterval(interval)
       fw.stop(true)
     }
     ```

  **Technical explanation of WHY this works**:
  - `launch(1)` calls `createTrace()` exactly once (line 380-381 of `index.es.js`)
  - `createTrace()` reads `this.mouse.x` and `this.mouse.y` synchronously (lines 422-423)
  - JavaScript is single-threaded, so the for-loop completes before any animation frame fires
  - Each `launch(1)` call reads the current `mouse.x/y` values we just set
  - After the loop, we set `mouse.active = false` so the library's `initTrace()` auto-launch doesn't fire additional rockets

  **Must NOT do**:
  - Do NOT touch `traceSpeed`, `acceleration`, or the randomizer interval
  - Do NOT add staggered/delayed launching — all rockets launch synchronously
  - Do NOT add configurable spread radius — hardcode ±60px
  - Do NOT add a `pointerup` or `pointermove` handler — only `pointerdown`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Touch/pointer event handling on mobile, Svelte component lifecycle

  **Parallelization**:
  - **Can Run In Parallel**: NO (single task)
  - **Parallel Group**: N/A
  - **Blocks**: Nothing
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/routes/+page.svelte:73-115` — The existing fireworks `$effect` block. The handler and cleanup must be added INSIDE this block. Follow the existing pattern: init → start → setup side-effects → return cleanup.
  - `src/routes/+page.svelte:76` — Current mouse config: `mouse: { click: true, move: false, max: 5 }`. Change `click` to `false` and `max` to `1`.
  - `src/routes/+page.svelte:111-114` — Existing cleanup pattern: `return () => { clearInterval(interval); fw.stop(true) }`. Add `container.removeEventListener('pointerdown', handlePointerDown)` here.

  **Library Internal References** (how the hack works):
  - `node_modules/fireworks-js/dist/index.es.js:115-121` — Library's `usePointer` method. Line 117 shows the guard: `(s || n) && (...)` where `s = click`, `n = move`. Setting both to `false` makes the library's own handler a no-op, so our custom handler has full control.
  - `node_modules/fireworks-js/dist/index.es.js:379-383` — `launch(t)` method. Calls `createTrace()` in a synchronous for-loop. This is why setting `mouse.x/y` before each `launch(1)` works — `createTrace()` reads the mouse values immediately.
  - `node_modules/fireworks-js/dist/index.es.js:408-431` — `createTrace()` method. Lines 422-423 show how `this.mouse.x` and `this.mouse.y` become the rocket's destination (`dx`, `dy`) when `this.mouse.active` is true.
  - `node_modules/fireworks-js/dist/index.es.js:435` — `initTrace()` auto-launch guard: `this.mouse.active && i.max > this.traces.length`. After our loop sets `mouse.active = false`, this guard prevents the library from auto-launching extra rockets during animation frames.
  - `node_modules/fireworks-js/dist/index.es.js:348` — Fireworks constructor: `this.mouse = new E(this.opts, this.canvas)`. The mouse object lives at `fw.mouse` at runtime despite being private in types.

  **Type References**:
  - `node_modules/fireworks-js/dist/types.d.ts:4-26` — `FireworksTypes.Options` interface. The `mouse` option type shows `{ click?: boolean, move?: boolean, max?: number }`.

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.

  **Type Check:**
  - [ ] `pnpm check` → 0 errors, 0 warnings

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Single tap launches multiple rockets to spread positions
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173 (pnpm dev)
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: .fireworks-container visible (timeout: 5s)
      3. Click at coordinates: (400, 300) on .fireworks-container
      4. Wait: 500ms for rockets to launch
      5. Screenshot: .sisyphus/evidence/task-1-tap-launches.png
      6. Assert: No console errors present
      7. Click at coordinates: (200, 500) on .fireworks-container
      8. Wait: 500ms
      9. Screenshot: .sisyphus/evidence/task-1-second-tap.png
    Expected Result: Each tap produces a cluster of 3-5 rockets that visually spread out (not a single blob)
    Evidence: .sisyphus/evidence/task-1-tap-launches.png, .sisyphus/evidence/task-1-second-tap.png

  Scenario: Rapid tapping does not cause errors
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: .fireworks-container visible (timeout: 5s)
      3. Rapid-click 5 times at (300, 300) with 100ms intervals
      4. Wait: 1000ms
      5. Assert: No console errors present
      6. Assert: Page is still responsive (can click again)
      7. Screenshot: .sisyphus/evidence/task-1-rapid-tap.png
    Expected Result: Multiple tap clusters render without errors or freezing
    Evidence: .sisyphus/evidence/task-1-rapid-tap.png

  Scenario: Edge tap near screen border does not crash
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: .fireworks-container visible (timeout: 5s)
      3. Click at coordinates: (5, 5) on .fireworks-container (top-left corner)
      4. Wait: 500ms
      5. Assert: No console errors
      6. Click at coordinates: (viewport.width - 5, viewport.height - 5) (bottom-right corner)
      7. Wait: 500ms
      8. Assert: No console errors
      9. Screenshot: .sisyphus/evidence/task-1-edge-tap.png
    Expected Result: Rockets launch from edge taps without errors (some spread coordinates may go off-canvas — that's fine, library handles it)
    Evidence: .sisyphus/evidence/task-1-edge-tap.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in `.sisyphus/evidence/` for all UI scenarios
  - [ ] Each evidence file named: `task-1-{scenario-slug}.png`

  **Commit**: YES
  - Message: `feat(fireworks): spread multi-rocket explosion points for visual variety`
  - Files: `src/routes/+page.svelte`
  - Pre-commit: `pnpm check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(fireworks): spread multi-rocket explosion points for visual variety` | `src/routes/+page.svelte` | `pnpm check` |

---

## Success Criteria

### Verification Commands
```bash
pnpm check  # Expected: 0 errors, 0 warnings, 0 hints
```

### Final Checklist
- [ ] Built-in click handler disabled (`mouse: { click: false }`)
- [ ] Custom `pointerdown` handler launches 3-5 rockets per tap
- [ ] Each rocket gets a unique position offset (±60px spread)
- [ ] `getBoundingClientRect()` used for coordinate calculation
- [ ] `e.preventDefault()` called in handler
- [ ] Event listener cleaned up in `$effect` return
- [ ] `traceSpeed`, `acceleration`, `intensity` NOT modified
- [ ] Randomizer `setInterval` NOT modified
- [ ] Sound config NOT modified
- [ ] `pnpm check` → 0 errors
