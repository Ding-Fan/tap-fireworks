<script lang="ts">
  let { volume = $bindable(0) } = $props<{
    volume?: number
  }>()

  let isOpen = $state(false)
  let container: HTMLDivElement

  // Toggle the popover
  function toggle(event: MouseEvent) {
    event.stopPropagation()
    isOpen = !isOpen
  }

  // Close the popover
  function close() {
    isOpen = false
  }

  // Close when clicking outside
  $effect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (container && !container.contains(event.target as Node)) {
        close()
      }
    }

    // Capture phase might be better, but bubble is standard
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  })

  // Prevent slider interaction from closing popover or triggering fireworks
  function handleSliderClick(event: MouseEvent) {
    event.stopPropagation()
  }
</script>

<div class="sound-toggle-container" bind:this={container}>
  <button
    type="button"
    class="toggle-btn"
    class:active={isOpen}
    onclick={toggle}
    aria-label={volume === 0 ? 'Unmute' : 'Mute'}
    aria-expanded={isOpen}
    title="Volume"
  >
    {#if volume === 0}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
    {:else if volume < 50}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
    {/if}
  </button>

  {#if isOpen}
    <div 
      class="popover"
      onclick={handleSliderClick}
      onkeydown={(e) => e.key === 'Escape' && close()}
      role="dialog"
      aria-label="Volume control"
      tabindex="-1"
    >
      <input
        type="range"
        min="0"
        max="100"
        bind:value={volume}
        class="vertical-slider"
      />
    </div>
  {/if}
</div>

<style>
  .sound-toggle-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .toggle-btn {
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .toggle-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .toggle-btn:active {
    transform: scale(0.95);
  }

  .toggle-btn.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
  }

  .popover {
    position: absolute;
    top: 100%;
    margin-top: 0.5rem;
    background: rgba(20, 20, 20, 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px; /* Pill shape */
    padding: 1rem 0.5rem;
    display: flex;
    justify-content: center;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    animation: fade-in 0.2s ease-out;
  }

  .vertical-slider {
    writing-mode: vertical-lr; /* IE/Edge */
    direction: rtl; /* Puts the max value at top */
    appearance: slider-vertical; /* Standard */
    width: 8px;
    height: 120px; /* Tall slider */
    background: transparent;
    cursor: pointer;
    touch-action: none; /* Prevent scroll while sliding */
  }

  /* Slider Track */
  .vertical-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  /* Slider Thumb */
  .vertical-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    margin-top: -6px; /* Adjust for track */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateX(-5px); /* Center on vertical track if needed */
  }

  /* Firefox */
  .vertical-slider::-moz-range-track {
    width: 8px;
    height: 100%;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .vertical-slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border: none;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .vertical-slider:focus {
    outline: none;
  }

  .vertical-slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
  
  .vertical-slider:focus::-moz-range-thumb {
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
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
</style>
