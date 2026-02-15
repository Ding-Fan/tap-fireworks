<script lang="ts">
  import { Fireworks } from 'fireworks-js'
  import SoundToggle from '$lib/SoundToggle.svelte'
  import { browser } from '$app/environment'

  let container: HTMLDivElement
  let fireworks: Fireworks | undefined = $state()

  const soundFiles = [
    '/sounds/explosion0.mp3',
    '/sounds/explosion1.mp3',
    '/sounds/explosion2.mp3'
  ]

  // Initialize from localStorage safely
  let soundLevel = $state<'mute' | 'subtle' | 'medium'>('mute')
  let initialized = false

  $effect(() => {
    if (!initialized) {
      const stored = localStorage.getItem('fireworks-sound')
      if (stored && ['mute', 'subtle', 'medium'].includes(stored)) {
        soundLevel = stored as 'mute' | 'subtle' | 'medium'
      }
      initialized = true
    }
  })

  // Persist to localStorage
  $effect(() => {
    if (initialized && browser) {
      localStorage.setItem('fireworks-sound', soundLevel)
    }
  })

  // Update fireworks sound settings
  $effect(() => {
    if (!fireworks) return

    const config = {
      mute: { enabled: false, files: soundFiles },
      subtle: { enabled: true, files: soundFiles, volume: { min: 2, max: 4 } },
      medium: { enabled: true, files: soundFiles, volume: { min: 6, max: 10 } }
    }[soundLevel]

    fireworks.updateOptions({ sound: config })
  })

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
    
    fw.start()
    fireworks = fw
    
    return () => fw.stop(true)
  })
</script>

<div bind:this={container} class="fireworks-container"></div>
<SoundToggle bind:state={soundLevel} />

<style>
  .fireworks-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
  }
</style>
