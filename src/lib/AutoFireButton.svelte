<script lang="ts">
  import { AUTO_FIRE_CHARGE_MAX, AUTO_FIRE_DURATION_SECONDS } from '$lib/auto-fire/state'

  let {
    charge,
    remainingSeconds,
    onActivate = () => {}
  } = $props<{
    charge: number
    remainingSeconds: number
    onActivate?: () => void
  }>()

  const radius = 26
  const circumference = 2 * Math.PI * radius

  const isActive = $derived(remainingSeconds > 0)
  const extendReady = $derived(isActive && charge === AUTO_FIRE_CHARGE_MAX)
  const ringProgress = $derived(
    isActive
      ? Math.min(remainingSeconds, AUTO_FIRE_DURATION_SECONDS) / AUTO_FIRE_DURATION_SECONDS
      : charge / AUTO_FIRE_CHARGE_MAX
  )
  const dashOffset = $derived(circumference * (1 - ringProgress))
  const activeLabel = $derived(
    isActive
      ? extendReady
        ? `Auto-fire active, ${Math.ceil(remainingSeconds)} seconds left, extension ready`
        : `Auto-fire active, ${Math.ceil(remainingSeconds)} seconds left`
      : charge === AUTO_FIRE_CHARGE_MAX
        ? 'Auto-fire ready, tap to activate'
        : `Auto-fire charging, ${charge} of ${AUTO_FIRE_CHARGE_MAX}`
  )

  function handlePointerDown(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
  }

  function handlePointerUp(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    onActivate()
  }
</script>

<div class="auto-fire-container">
  <button
    type="button"
    class="auto-fire-button"
    class:active={isActive}
    class:ready={charge === AUTO_FIRE_CHARGE_MAX}
    class:extend-ready={extendReady}
    onpointerdown={handlePointerDown}
    onpointerup={handlePointerUp}
    aria-label={activeLabel}
    data-testid="autofire-btn"
  >
    <svg class="ring" viewBox="0 0 64 64" aria-hidden="true">
      <circle class="ring-bg" cx="32" cy="32" r={radius}></circle>
      <circle
        class="ring-fill"
        cx="32"
        cy="32"
        r={radius}
        style={`stroke-dasharray:${circumference};stroke-dashoffset:${dashOffset};`}
      ></circle>
    </svg>

    <span class="icon" aria-hidden="true">
      A
    </span>
    <span class="remaining" data-testid="autofire-remaining">{isActive ? Math.ceil(remainingSeconds) : 0}</span>
  </button>
</div>

<style>
  .auto-fire-container {
    position: fixed;
    left: calc(env(safe-area-inset-left, 0px) + 1rem);
    bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
    z-index: 48;
    pointer-events: auto;
  }

  .auto-fire-button {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(20, 20, 20, 0.86);
    backdrop-filter: blur(10px);
    color: #f3f6ff;
    display: grid;
    place-items: center;
    box-shadow: 0 14px 24px -12px rgba(0, 0, 0, 0.75);
    touch-action: none;
    user-select: none;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease,
      background-color 0.18s ease;
  }

  .auto-fire-button:active {
    transform: scale(0.98);
  }

  .auto-fire-button.ready {
    border-color: rgba(247, 205, 122, 0.8);
    box-shadow: 0 0 0 2px rgba(247, 205, 122, 0.18), 0 16px 26px -10px rgba(0, 0, 0, 0.78);
  }

  .auto-fire-button.active {
    background: rgba(22, 26, 34, 0.9);
  }

  .auto-fire-button.extend-ready {
    border-color: rgba(255, 193, 109, 0.92);
    box-shadow: 0 0 0 3px rgba(255, 193, 109, 0.24), 0 16px 30px -10px rgba(0, 0, 0, 0.82);
  }

  .ring {
    position: absolute;
    inset: 3px;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    transform: rotate(-90deg);
  }

  .ring-bg,
  .ring-fill {
    fill: none;
    stroke-width: 4;
  }

  .ring-bg {
    stroke: rgba(255, 255, 255, 0.16);
  }

  .ring-fill {
    stroke: rgba(255, 224, 151, 0.98);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.26s linear;
  }

  .active .ring-fill {
    stroke: rgba(150, 209, 255, 0.96);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
    line-height: 1;
  }

  .remaining {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
