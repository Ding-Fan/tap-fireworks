<script lang="ts">
  import { isIPhone } from './is-iphone.ts'

  let { volume = $bindable(0), showTip = false } = $props<{
    volume?: number
    showTip?: boolean
  }>()

  let showTooltip = $state(false)
  let tipStarted = false
  let isDragging = $state(false)
  let lastNonZeroVolume = $state(volume > 0 ? volume : 60)
  let edgeState = $state<'none' | 'min' | 'max'>('none')

  let iconLevel = $derived(
    volume === 0 ? 'mute' : volume <= 33 ? 'low' : volume <= 66 ? 'medium' : 'high'
  )

  $effect(() => {
    if (volume > 0) {
      lastNonZeroVolume = volume
    }
  })

  $effect(() => {
    if (!showTip || volume !== 0) {
      showTooltip = false
      return
    }

    if (tipStarted) return
    tipStarted = true

    showTooltip = true
    const timeout = window.setTimeout(() => {
      showTooltip = false
    }, 5000)

    return () => window.clearTimeout(timeout)
  })

  function triggerEdgeHaptic(nextVolume: number) {
    const nextState = nextVolume === 0 ? 'min' : nextVolume === 100 ? 'max' : 'none'

    if (
      nextState !== edgeState &&
      nextState !== 'none' &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      navigator.vibrate(10)
    }

    edgeState = nextState
  }

  function applyVolume(nextVolume: number) {
    const normalized = Math.max(0, Math.min(100, Math.round(nextVolume)))
    volume = normalized
    triggerEdgeHaptic(normalized)
  }

  function handleVolumeInput(event: Event) {
    const target = event.currentTarget
    if (!(target instanceof HTMLInputElement)) return

    applyVolume(target.valueAsNumber)
  }

  function handleDragStart(event: PointerEvent) {
    event.stopPropagation()
    isDragging = true
  }

  function handleDragEnd(event?: PointerEvent | FocusEvent) {
    event?.stopPropagation()
    isDragging = false
  }

  $effect(() => {
    if (!isDragging) return

    const stopDrag = () => {
      isDragging = false
    }

    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    return () => {
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
    }
  })

  function toggleMute(event: MouseEvent) {
    event.stopPropagation()

    if (volume === 0) {
      applyVolume(lastNonZeroVolume > 0 ? lastNonZeroVolume : 60)
      return
    }

    lastNonZeroVolume = volume
    applyVolume(0)
  }

  function stopPointer(event: PointerEvent) {
    event.stopPropagation()
  }
</script>

<div class="sound-toggle-container">
  {#if showTooltip}
    <div class="volume-tip" aria-hidden="true">
      <div>Turn up volume for sound</div>
      {#if isIPhone()}
        <div class="volume-tip-sub">iPhone: Silent Mode off (turn it back on after)</div>
      {/if}
    </div>
  {/if}

  <div class="volume-control" class:dragging={isDragging}>
    <div class="slider-shell">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        class="fill-slider"
        style={`--fill: ${volume}%`}
        oninput={handleVolumeInput}
        onpointerdown={handleDragStart}
        onpointerup={handleDragEnd}
        onpointercancel={handleDragEnd}
        onblur={handleDragEnd}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        aria-valuetext={`${volume}%`}
      />
    </div>

    <button
      type="button"
      class="mute-btn"
      onpointerdown={stopPointer}
      onclick={toggleMute}
      aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      title={volume === 0 ? 'Unmute' : 'Mute'}
    >
      {#if iconLevel === 'mute'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      {:else if iconLevel === 'low'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      {:else if iconLevel === 'medium'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M18.54 6.46a8.5 8.5 0 0 1 0 11.07"></path></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M18.54 6.46a8.5 8.5 0 0 1 0 11.07"></path><path d="M21.4 4.2a12 12 0 0 1 0 15.6"></path></svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .sound-toggle-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    display: flex;
    justify-content: center;
  }

  .volume-control {
    width: 34px;
    height: 148px;
    padding: 7px 4px 5px;
    border-radius: 30px;
    background: rgba(20, 20, 20, 0.84);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    box-shadow: 0 14px 20px -10px rgba(0, 0, 0, 0.7);
    transition:
      width 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease,
      transform 0.18s ease;
  }

  .volume-control.dragging {
    width: 38px;
    background: rgba(22, 26, 34, 0.9);
    box-shadow: 0 18px 28px -12px rgba(0, 0, 0, 0.78);
    transform: translateY(-1px);
  }

  .slider-shell {
    flex: 0 0 auto;
    width: 100%;
    height: 100px;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .fill-slider {
    writing-mode: vertical-lr;
    direction: rtl;
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    height: 100%;
    display: block;
    margin: 0;
    border-radius: 20px;
    overflow: hidden;
    clip-path: inset(0 round 20px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    background:
      linear-gradient(
        to top,
        rgba(122, 131, 144, 0.62) 0%,
        rgba(122, 131, 144, 0.62) var(--fill),
        rgba(255, 255, 255, 0.1) var(--fill),
        rgba(255, 255, 255, 0.1) 100%
      );
    background-repeat: no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    touch-action: none;
    transition: border-color 0.16s ease;
  }

  .volume-control.dragging .fill-slider {
    border-color: rgba(185, 194, 204, 0.36);
  }

  .fill-slider:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(180, 188, 198, 0.3);
  }

  .fill-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 20px;
  }

  .fill-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .fill-slider::-moz-range-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    border-radius: 20px;
  }

  .fill-slider::-moz-range-progress {
    background: rgba(122, 131, 144, 0.62);
    border-radius: 20px;
  }

  .fill-slider::-moz-range-thumb {
    width: 0;
    height: 0;
    border: none;
    background: transparent;
  }

  .mute-btn {
    background: rgba(20, 20, 20, 0.84);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(240, 248, 255, 0.95);
    border-radius: 999px;
    width: 100%;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.14s ease,
      background-color 0.16s ease,
      color 0.16s ease;
  }

  .mute-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }

  .mute-btn:active {
    transform: scale(0.94);
  }

  .mute-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(70, 164, 255, 0.45);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .volume-tip {
    position: absolute;
    right: calc(100% + 0.75rem);
    top: 50%;
    transform: translateY(-50%);
    max-width: 220px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    line-height: 1.2;
    font-size: 13px;
    animation: tip-in 0.2s ease-out;
  }

  .volume-tip-sub {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }

  @keyframes tip-in {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(6px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .volume-tip,
    .volume-control {
      animation: none;
    }

    .volume-control,
    .fill-slider,
    .mute-btn {
      transition: none;
    }
  }
</style>
