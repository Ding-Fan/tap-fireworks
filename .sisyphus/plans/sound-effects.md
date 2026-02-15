# Sound Effects with 3-State Toggle

## TL;DR

> **Quick Summary**: Add explosion sound effects to the tap-fireworks app using the built-in `fireworks-js` sound API, with a 3-state volume toggle (mute → subtle → medium) that persists preference in localStorage. The toggle shows all 3 states at once so users can see where they are.
>
> **Deliverables**:
> - Sound files downloaded to `static/sounds/`
> - `SoundToggle.svelte` component in `src/lib/`
> - Updated `+page.svelte` with sound integration and toggle placement
>
> **Estimated Effort**: Short
> **Parallel Execution**: NO - sequential (2 tasks)
> **Critical Path**: Task 1 (sound files) → Task 2 (component + integration)

---

## Context

### Original Request
Add sound effects when fireworks explode. Three volume levels (mute, subtle, medium) controlled by a toggle button that shows all states at once. Start muted, persist choice, top-right placement.

### Interview Summary
**Key Discussions**:
- **Sound source**: Use library's default sounds (explosion0/1/2.mp3) — no custom audio
- **Volume levels**: Three states — mute (off), subtle (quiet), medium (noticeable)
- **UI design**: All 3 states visible simultaneously, tap cycles the active indicator
- **Default**: Start muted (no surprise audio)
- **Persistence**: Save choice to localStorage, restore on revisit
- **Placement**: Top-right corner

**Research Findings**:
- `fireworks-js` v2.10.8 has built-in sound via Web Audio API (AudioContext + GainNode)
- Sound config type: `{ enabled: boolean, files: string[], volume: { min: number, max: number } }`
- Volume values are 0-100 scale (divided by 100 at runtime). Defaults: `{ min: 4, max: 8 }`
- `updateOptions()` works for toggling `enabled` and changing `volume` at runtime
- Sound files are NOT bundled in the npm package — the library does `fetch(filename)` at runtime
- Default filenames: `["explosion0.mp3", "explosion1.mp3", "explosion2.mp3"]` — these are relative URLs
- The fireworks.js demo site hosts them at `https://fireworks.js.org/sounds/explosion{0,1,2}.mp3`
- Sound init is lazy: AudioContext + buffer loading only happens on first `play()` with `enabled: true`
- Setting `files` in initial config (with `enabled: false`) pre-registers paths, avoiding reload issues later

### Metis Review
**Identified Gaps** (addressed):
- **Sound files missing**: `static/` only has `robots.txt`. Library fetches files by URL — need to download explosion MP3s to `static/sounds/` and set `files` to absolute paths (`/sounds/explosion0.mp3` etc.)
- **Icon strategy**: No icon library installed — use inline SVG for speaker icons (zero dependencies)
- **Browser autoplay policy**: Web Audio requires user gesture — the app is tap-based, so first tap unlocks AudioContext automatically

---

## Work Objectives

### Core Objective
Enable sound effects on firework explosions with a user-controllable 3-state volume toggle that visually shows all available states.

### Concrete Deliverables
- `static/sounds/explosion0.mp3` — explosion sound file 1
- `static/sounds/explosion1.mp3` — explosion sound file 2
- `static/sounds/explosion2.mp3` — explosion sound file 3
- `src/lib/SoundToggle.svelte` — 3-state toggle component
- `src/routes/+page.svelte` — updated with sound config + toggle integration

### Definition of Done
- [ ] Tapping screen triggers fireworks with audible explosion sounds (when not muted)
- [ ] Toggle cycles: mute → subtle → medium → mute
- [ ] Toggle visually shows all 3 states with active indicator
- [ ] Preference persists across page reloads via localStorage
- [ ] `pnpm check` passes with zero type errors

### Must Have
- Three distinct volume states with clear visual differentiation
- All states visible simultaneously (not a blind toggle)
- localStorage persistence (key: `fireworks-sound`)
- Svelte 5 runes syntax (`$state`, `$effect`, `$props`, `$bindable`)
- Inline SVG icons (no icon library dependencies)
- Mobile-friendly touch target (minimum 44×44px)
- Works on `#000` background

### Must NOT Have (Guardrails)
- No audio file generation or synthesis — use library defaults
- No volume slider or complex audio controls — strict 3-state toggle only
- No additional npm dependencies
- No legacy Svelte syntax (`onMount`, `$:`, `export let`)
- No `@ts-ignore` or type workarounds
- No modifying the fireworks canvas or visual behavior

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks MUST be verifiable WITHOUT any human action.
> Sound playback cannot be heard by agents — verify via configuration state and network requests.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (project has no test infrastructure)
- **Framework**: N/A

### Agent-Executed QA Scenarios (PRIMARY verification method)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| Sound files | Bash (curl) | HTTP 200 from dev server for each MP3 |
| UI toggle | Playwright | Navigate, click, assert DOM state changes |
| localStorage | Playwright | Evaluate JS to check storage values |
| Sound config | Playwright | Evaluate JS to inspect fireworks options |
| TypeScript | Bash (pnpm check) | Zero type errors |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Download sound files to static/sounds/

Wave 2 (After Wave 1):
└── Task 2: Build SoundToggle + integrate into +page.svelte

Critical Path: Task 1 → Task 2
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2 | Nothing |
| 2 | 1 | None | Nothing (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 2 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) |

---

## TODOs

- [x] 1. Download explosion sound files to static/sounds/

  **What to do**:
  - Create directory `static/sounds/`
  - Download 3 MP3 files from the fireworks-js demo site:
    - `https://fireworks.js.org/sounds/explosion0.mp3` → `static/sounds/explosion0.mp3`
    - `https://fireworks.js.org/sounds/explosion1.mp3` → `static/sounds/explosion1.mp3`
    - `https://fireworks.js.org/sounds/explosion2.mp3` → `static/sounds/explosion2.mp3`
  - Use `curl -o` or `wget` to download each file
  - Verify each file is a valid MP3 (non-zero size, starts with ID3 header or `0xff 0xfb`)

  **Must NOT do**:
  - Do not generate or synthesize audio files
  - Do not install any audio-related npm packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file download task, no code logic involved
  - **Skills**: `[]`
    - No specialized skills needed for file downloads

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Task 2
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `static/robots.txt` — Confirms `static/` directory exists and is the correct location for static assets in SvelteKit (files here are served at root URL path)

  **API/Type References**:
  - `node_modules/fireworks-js/dist/index.es.js:183-185` — Default filenames: `["explosion0.mp3","explosion1.mp3","explosion2.mp3"]`

  **External References**:
  - Source URL: `https://fireworks.js.org/sounds/explosion0.mp3` (confirmed accessible, returns valid MP3 data)

  **WHY Each Reference Matters**:
  - The default filenames tell us exactly which files to download
  - The demo site URL is the authoritative source for these audio assets
  - `static/` placement ensures files are served at `/sounds/explosion0.mp3` by SvelteKit

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Sound files exist and are valid MP3s
    Tool: Bash
    Preconditions: Files downloaded to static/sounds/
    Steps:
      1. ls -la static/sounds/explosion{0,1,2}.mp3
      2. Assert: All 3 files exist
      3. Assert: All files are non-zero size (at least 1KB)
      4. file static/sounds/explosion0.mp3
      5. Assert: output contains "Audio" or "MPEG" or "ID3"
    Expected Result: 3 valid MP3 files in static/sounds/
    Evidence: Terminal output captured

  Scenario: Sound files served correctly by dev server
    Tool: Bash (curl)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/sounds/explosion0.mp3
      2. Assert: HTTP status is 200
      3. curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/sounds/explosion1.mp3
      4. Assert: HTTP status is 200
      5. curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/sounds/explosion2.mp3
      6. Assert: HTTP status is 200
    Expected Result: All 3 files return 200 OK
    Evidence: HTTP status codes captured
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(sound): add explosion sound effect files`
  - Files: `static/sounds/explosion0.mp3`, `static/sounds/explosion1.mp3`, `static/sounds/explosion2.mp3`

---

- [x] 2. Build SoundToggle component and integrate sound into +page.svelte

  **What to do**:

  **Part A — Create `src/lib/SoundToggle.svelte`**:

  Component requirements:
  - TypeScript, Svelte 5 runes only
  - Type: `type SoundLevel = 'mute' | 'subtle' | 'medium'`
  - Props: `state` using `$bindable` (two-way binding with parent)
  - On mount (`$effect`): read `localStorage.getItem('fireworks-sound')` and set initial state if valid
  - `cycle()` function: advances state → mute → subtle → medium → mute, writes to localStorage
  - Set `data-state` attribute on the root button element for QA verification

  UI design requirements:
  - **All 3 states must be visible at once** — the user should see exactly how many states exist and which is active
  - Suggested approach: A compact horizontal pill/bar showing 3 visual indicators (e.g., three dots, three segments, or a speaker icon with three ascending bars). The active state is visually highlighted (filled, bright, contrasting color) while inactive states are dimmed but still visible.
  - Design direction ideas (executor has creative freedom):
    - Three dots in a row: `○ ● ○` (active one filled)
    - Speaker icon + ascending volume bars (0 lit = mute, 1 lit = subtle, 2 lit = medium)
    - Three-segment pill: `[ ✕ | ♪ | ♪♪ ]` with active segment highlighted
  - Use inline SVGs for any icons — no icon library
  - Must be legible on `#000` background (use white/semi-transparent-white colors)
  - Minimum 44×44px touch target
  - `position: fixed; top: 16px; right: 16px; z-index: 10`
  - Subtle appearance — semi-transparent backdrop, doesn't distract from fireworks
  - Tapping anywhere on the control cycles to the next state

  **Part B — Modify `src/routes/+page.svelte`**:

  Integration requirements:
  - Import `SoundToggle` from `$lib/SoundToggle.svelte`
  - Add `soundLevel` state variable: `let soundLevel = $state<'mute' | 'subtle' | 'medium'>('mute')`
  - Modify the fireworks `$effect()`:
    - Lift `fireworks` variable outside the `$effect` so it's accessible: `let fireworks: Fireworks | undefined`
    - In the initial Fireworks config, change `sound: { enabled: false }` to:
      ```
      sound: {
        enabled: false,
        files: ['/sounds/explosion0.mp3', '/sounds/explosion1.mp3', '/sounds/explosion2.mp3']
      }
      ```
      This pre-registers the file paths so they're ready when sound is first enabled.
    - Assign the instance: `fireworks = fw` (inside the effect, after creation)
    - Return cleanup: `return () => { fw.stop(true); fireworks = undefined }`
  - Add a SEPARATE `$effect` for reactive sound updates:
    ```
    $effect(() => {
      if (!fireworks) return
      const soundConfigs = {
        mute:   { enabled: false },
        subtle: { enabled: true, volume: { min: 2, max: 4 } },
        medium: { enabled: true, volume: { min: 6, max: 10 } }
      }
      fireworks.updateOptions({ sound: soundConfigs[soundLevel] })
    })
    ```
    This effect reads `soundLevel` and reacts whenever it changes.
  - Add `<SoundToggle bind:state={soundLevel} />` in the template (after the fireworks container div)

  **Must NOT do**:
  - Do not change existing fireworks visual config (particles, hue, gravity, etc.)
  - Do not add any npm dependencies
  - Do not use legacy Svelte patterns (onMount, $:, export let)
  - Do not add a volume slider or complex audio controls
  - Do not put the sound state management in a Svelte store — keep it simple with component state + $bindable

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Involves UI component design with visual state indicators, CSS styling, and touch interaction
  - **Skills**: `["frontend-ui-ux"]`
    - `frontend-ui-ux`: UI component with visual design, touch targets, dark theme styling, and state indicator patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during implementation — only for QA verification which the agent handles natively
    - `frontend-design`: Overkill for a single toggle component

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (solo, after Wave 1)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 1 (needs sound files for testing)

  **References**:

  **Pattern References**:
  - `src/routes/+page.svelte:1-41` — Current fireworks setup. Lines 6-27 show the `$effect()` with Fireworks instantiation. Line 23 shows `sound: { enabled: false }` which we'll extend. Line 4 shows `container` binding pattern. Line 30 shows the div with `bind:this`.
  - `src/routes/+layout.svelte:1-13` — Layout pattern showing `$props()` destructuring (line 5) and `{@render children()}` (line 12) — confirms Svelte 5 runes are used throughout
  - `src/app.css:1-12` — Global styles: `#000` background, `touch-action: none`, `user-select: none`. The toggle must be visible against this dark background and must not interfere with touch handling.

  **API/Type References**:
  - `node_modules/fireworks-js/dist/types.d.ts` — `Sounds` interface: `{ enabled: boolean; files: string[]; volume: MinMax }` where `MinMax = { min: number; max: number }`
  - `node_modules/fireworks-js/dist/fireworks.d.ts:30` — `updateOptions(options: FireworksOptions): void` — the method to call when changing sound config at runtime
  - `node_modules/fireworks-js/dist/index.d.ts` — `FireworksOptions = RecursivePartial<FireworksTypes.Options>` — all fields are optional in the update call

  **Documentation References**:
  - `AGENTS.md` — "Svelte 5 Runes (MANDATORY)" section confirms `$state`, `$effect`, `$props` usage. "Mobile-First Design" section confirms touch-action and user-select globals. "Third-Party Library Integration" section: "Initialize in $effect, always return cleanup functions, bind DOM with bind:this"

  **External References**:
  - fireworks-js source: `node_modules/fireworks-js/dist/index.es.js:255` — Sound lazy init: AudioContext only created on first `play()` with `enabled: true`
  - fireworks-js source: `node_modules/fireworks-js/dist/index.es.js:181-186` — Default sound options structure and values

  **WHY Each Reference Matters**:
  - `+page.svelte` is the ONLY file being modified — executor must understand its current structure exactly
  - The `Sounds` type tells the executor the exact shape of config objects to pass
  - `updateOptions` signature confirms partial updates are supported (RecursivePartial)
  - `app.css` globals affect the toggle's styling constraints (dark background, no user-select)
  - Sound lazy init means pre-registering files in initial config is safe and correct

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Toggle component renders in top-right with correct initial state
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: button.sound-toggle visible (timeout: 5s)
         (Note: selector may vary — look for the sound toggle button element)
      3. Assert: button has data-state="mute" (default state)
      4. Assert: button is positioned in top-right area (right < 100px from viewport edge, top < 100px)
      5. Screenshot: .sisyphus/evidence/task-2-initial-render.png
    Expected Result: Toggle visible in top-right, showing mute as active state
    Evidence: .sisyphus/evidence/task-2-initial-render.png

  Scenario: Toggle cycles through all 3 states on click
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, page loaded
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: sound toggle button visible (timeout: 5s)
      3. Assert: data-state="mute"
      4. Click: sound toggle button
      5. Assert: data-state="subtle"
      6. Click: sound toggle button
      7. Assert: data-state="medium"
      8. Click: sound toggle button
      9. Assert: data-state="mute" (cycled back)
      10. Screenshot: .sisyphus/evidence/task-2-state-cycle.png
    Expected Result: State cycles mute → subtle → medium → mute
    Evidence: .sisyphus/evidence/task-2-state-cycle.png

  Scenario: localStorage persists preference across reload
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, page loaded
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click toggle to set state to "subtle"
      3. Evaluate: localStorage.getItem('fireworks-sound')
      4. Assert: value equals "subtle"
      5. Reload page (page.reload())
      6. Wait for: sound toggle visible (timeout: 5s)
      7. Assert: data-state="subtle" (restored from localStorage)
      8. Screenshot: .sisyphus/evidence/task-2-persistence.png
    Expected Result: "subtle" persisted and restored after reload
    Evidence: .sisyphus/evidence/task-2-persistence.png

  Scenario: Sound config updates fireworks instance correctly
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, page loaded
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click toggle once (mute → subtle)
      3. Click somewhere on the fireworks canvas to trigger a firework
      4. Wait 2 seconds for explosion
      5. Check network tab: assert request for /sounds/explosion0.mp3 was made with status 200
         (alternatively: evaluate window to check fireworks sound config if exposed)
      6. Screenshot: .sisyphus/evidence/task-2-sound-active.png
    Expected Result: Sound files fetched, audio context initialized
    Evidence: .sisyphus/evidence/task-2-sound-active.png

  Scenario: All 3 states visually distinguishable
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Screenshot at mute state: .sisyphus/evidence/task-2-visual-mute.png
      3. Click toggle → subtle state
      4. Screenshot: .sisyphus/evidence/task-2-visual-subtle.png
      5. Click toggle → medium state
      6. Screenshot: .sisyphus/evidence/task-2-visual-medium.png
      7. Compare screenshots: visual appearance should differ between all 3 states
    Expected Result: Each state has distinct visual appearance
    Evidence: .sisyphus/evidence/task-2-visual-{mute,subtle,medium}.png
  ```

  ```
  Scenario: TypeScript type checking passes
    Tool: Bash
    Preconditions: All code changes complete
    Steps:
      1. pnpm check
      2. Assert: exit code 0
      3. Assert: output contains no errors
    Expected Result: Zero type errors
    Evidence: Terminal output captured
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in .sisyphus/evidence/ for all UI scenarios
  - [ ] Terminal output for type checking
  - [ ] Each evidence file named: task-2-{scenario-slug}.png

  **Commit**: YES
  - Message: `feat(sound): add 3-state sound toggle with localStorage persistence`
  - Files: `src/lib/SoundToggle.svelte`, `src/routes/+page.svelte`
  - Pre-commit: `pnpm check`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 + 2 | `feat(sound): add explosion sounds with 3-state volume toggle` | `static/sounds/*.mp3`, `src/lib/SoundToggle.svelte`, `src/routes/+page.svelte` | `pnpm check` |

> Alternatively commit separately:
> - Task 1: `feat(sound): add explosion sound effect files`
> - Task 2: `feat(sound): add 3-state sound toggle with localStorage persistence`

---

## Success Criteria

### Verification Commands
```bash
pnpm check           # Expected: 0 errors
ls static/sounds/    # Expected: explosion0.mp3, explosion1.mp3, explosion2.mp3
```

### Final Checklist
- [ ] All "Must Have" present: 3-state toggle, visual indicators, localStorage, Svelte 5 runes, inline SVG, mobile touch target, dark background compatible
- [ ] All "Must NOT Have" absent: no npm deps added, no legacy Svelte, no volume slider, no visual fireworks changes
- [ ] `pnpm check` passes with zero errors
- [ ] Sound files serve with HTTP 200 from dev server
- [ ] Toggle cycles correctly: mute → subtle → medium → mute
- [ ] localStorage persists and restores preference
- [ ] All 3 states are visually distinct and simultaneously visible
