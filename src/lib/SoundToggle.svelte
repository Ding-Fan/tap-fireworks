<script lang="ts">
  let { state = $bindable('mute') } = $props<{
    state: 'mute' | 'subtle' | 'medium'
  }>()

  const options = ['mute', 'subtle', 'medium'] as const

  function select(option: typeof options[number]) {
    state = option
  }
</script>

<div class="sound-toggle" role="group" aria-label="Sound settings">
  {#each options as option}
    <button
      type="button"
      class:active={state === option}
      onclick={() => select(option)}
      aria-pressed={state === option}
      data-state={option}
      title={option.charAt(0).toUpperCase() + option.slice(1)}
    >
      {#if option === 'mute'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      {:else if option === 'subtle'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      {/if}
    </button>
  {/each}
</div>

<style>
  .sound-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    display: flex;
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    padding: 0.25rem;
    gap: 0.25rem;
  }

  button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px; /* Minimum touch target */
    height: 44px;
  }

  button:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  button.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  }

  button:active {
    transform: scale(0.95);
  }

  /* Accessible focus styles */
  button:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
</style>
