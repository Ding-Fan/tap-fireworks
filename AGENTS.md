# AGENTS.md

Agent reference for the `tap-fireworks` project — A SvelteKit 5 fireworks interactive application.

---

## Project Overview

- **Framework**: SvelteKit 2.50+ with Svelte 5 (runes-based)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Package Manager**: pnpm
- **External Libraries**: `fireworks-js` for canvas-based fireworks rendering

---

## Build Commands

```bash
# Development server (with hot reload)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Type checking with watch mode
pnpm check:watch

# Sync SvelteKit types
pnpm prepare
```

**Note**: No dedicated test runner configured. No linting or formatting tools installed.

---

## TypeScript Configuration

### Strict Mode Enabled
All TypeScript code must pass strict mode checks:
- `strict: true` (includes strictNullChecks, strictFunctionTypes, etc.)
- `checkJs: true` — JavaScript files are also type-checked
- `forceConsistentCasingInFileNames: true`

### Module System
- `type: "module"` in package.json
- ES modules only (no CommonJS)
- `moduleResolution: "bundler"`
- `rewriteRelativeImportExtensions: true`

### Import Rules
- Use `.ts` extension in imports even though files are `.ts` (handled by bundler)
- Use SvelteKit's `$lib` alias for library imports: `import { x } from '$lib/...'`
- External dependencies use bare imports: `import { Fireworks } from 'fireworks-js'`

---

## Code Style Guidelines

### File Organization
```
src/
├── app.css           # Global styles
├── app.html          # HTML template
├── app.d.ts          # Global TypeScript declarations
├── lib/              # Reusable components/utilities ($lib alias)
│   └── index.ts
└── routes/           # SvelteKit file-based routing
    ├── +layout.svelte
    └── +page.svelte
```

### Svelte 5 Runes (MANDATORY)
This project uses **Svelte 5 runes** syntax. Do NOT use legacy Svelte syntax.

**Correct (Runes):**
```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  let { children } = $props()
  
  $effect(() => {
    console.log('count changed:', count)
    return () => cleanup()
  })
</script>
```

**Wrong (Legacy - DO NOT USE):**
```svelte
<script lang="ts">
  let count = 0  // ❌ No reactivity
  $: doubled = count * 2  // ❌ Old reactive statement
  export let children  // ❌ Old props syntax
  onMount(() => {})  // ❌ Use $effect instead
</script>
```

### Component Patterns

**Script Tag:**
- Always use `<script lang="ts">` for TypeScript
- Declare bindings with `let` (Svelte handles reactivity with runes)
- Use `$effect()` for lifecycle and side effects
- Return cleanup functions from `$effect()` (e.g., `return () => fireworks.stop()`)

**Bindings:**
```svelte
<div bind:this={container}></div>
```

**Props Destructuring:**
```svelte
let { children, title = 'Default' } = $props()
```

**Rendering Children:**
```svelte
{@render children()}
```

### Styling Conventions

**Scoped Styles:**
```svelte
<style>
  .class-name {
    property: value;
  }
</style>
```

**Global Styles:**
- Place in `src/app.css`
- Imported in `+layout.svelte`
- Use for resets, body/html defaults, and app-wide styles

**CSS Properties:**
- Use modern CSS (`inset: 0` instead of `top/right/bottom/left: 0`)
- Prefer logical properties when appropriate
- Use `position: fixed` for fullscreen overlays

### TypeScript Patterns

**Type Annotations:**
```typescript
let container: HTMLDivElement
const fireworks: Fireworks = new Fireworks(container, options)
```

**Avoid:**
- `any` types (strict mode enforced)
- `@ts-ignore` or `@ts-expect-error` (fix the underlying issue)
- Type assertions unless absolutely necessary

---

## Naming Conventions

**Files:**
- Svelte components: `+page.svelte`, `+layout.svelte`, `Component.svelte`
- TypeScript modules: `kebab-case.ts` or `camelCase.ts`
- SvelteKit special files use `+` prefix: `+page.svelte`, `+layout.svelte`, `+server.ts`

**Variables:**
- `camelCase` for variables and functions
- `PascalCase` for classes and components
- `UPPER_SNAKE_CASE` for constants (if any)

**CSS Classes:**
- `kebab-case` preferred: `.fireworks-container`

---

## Error Handling

**No formal error handling patterns established yet.**

When adding error boundaries or error handling:
- Use SvelteKit's `+error.svelte` for route-level errors
- Handle promise rejections explicitly
- Type errors properly (avoid `unknown` or `any`)

---

## Dependencies

**Runtime:**
- `fireworks-js@^2.10.8` — Canvas-based fireworks library

**Dev Dependencies:**
- `@sveltejs/kit@^2.50.2`
- `@sveltejs/vite-plugin-svelte@^6.2.4`
- `svelte@^5.49.2`
- `vite@^7.3.1`
- `typescript@^5.9.3`
- `svelte-check@^4.3.6`

---

## Special Notes for Agents

### Type Checking Workflow
1. Run `pnpm check` after making changes
2. `svelte-check` validates both TypeScript and Svelte files
3. Zero tolerance for type errors (strict mode)

### Svelte 5 Migration
- This project is on **Svelte 5** (not Svelte 4 or earlier)
- Always use runes (`$state`, `$derived`, `$effect`, `$props`)
- Do NOT suggest legacy reactivity patterns

### Mobile-First Design
The app is designed for touch interaction:
- `touch-action: none` globally
- `user-select: none` globally
- `viewport-fit=cover` for safe areas
- `overscroll-behavior: none` to prevent pull-to-refresh

### Third-Party Library Integration
When working with external libraries (like `fireworks-js`):
- Initialize in `$effect()` for proper lifecycle management
- Always return cleanup functions
- Bind DOM references with `bind:this={}`

### No Testing Infrastructure
- No test files exist yet
- If adding tests, consider Vitest (pairs well with Vite)
- Test file convention suggestion: `*.test.ts` or `*.spec.ts`

---

## Common Pitfalls

1. **Using legacy Svelte syntax** — Always use Svelte 5 runes
2. **Forgetting cleanup in $effect** — Can cause memory leaks
3. **Type errors in strict mode** — Cannot ignore, must fix properly
4. **Mixing CommonJS and ESM** — This is an ESM-only project
5. **Not running `pnpm check`** — Type errors will break the build

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `pnpm dev` |
| Build for production | `pnpm build` |
| Type check | `pnpm check` |
| Preview build | `pnpm preview` |
| Watch type errors | `pnpm check:watch` |

---

**Last Updated**: 2026-02-15  
**Svelte Version**: 5.49.2+  
**SvelteKit Version**: 2.50.2+
