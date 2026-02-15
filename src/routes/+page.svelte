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
  let volume = $state(0)
  let initialized = false

  $effect(() => {
    if (!initialized) {
      const stored = localStorage.getItem('fireworks-volume')
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          volume = parsed
        }
      } else {
        // Migrate from legacy key if it exists
        const legacy = localStorage.getItem('fireworks-sound')
        if (legacy) {
          if (legacy === 'mute') {
            volume = 0
          } else if (legacy === 'subtle') {
            volume = 30
          } else if (legacy === 'medium') {
            volume = 60
          } else {
            const parsed = parseInt(legacy, 10)
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
              volume = parsed
            }
          }
          localStorage.removeItem('fireworks-sound')
        }
      }
      initialized = true
    }
  })

  // Persist to localStorage
  $effect(() => {
    if (initialized && browser) {
      localStorage.setItem('fireworks-volume', volume.toString())
    }
  })

  // Update fireworks sound settings
  $effect(() => {
    if (!fireworks) return

    const soundConfig = {
      enabled: volume > 0,
      files: soundFiles,
      volume: {
        min: Math.max(0, volume - 5),
        max: volume
      }
    }

    fireworks.updateOptions({ sound: soundConfig })
  })

  $effect(() => {
    const fw = new Fireworks(container, {
      autoresize: true,
      mouse: { click: true, move: false, max: 5 },
      hue: { min: 0, max: 360 },
      particles: 50,
      gravity: 1.5,
      friction: 0.95,
      brightness: { min: 20, max: 100 },
      decay: { min: 0.005, max: 0.05 },
      rocketsPoint: { min: 10, max: 90 },
      lineWidth: {
        explosion: { min: 1, max: 6 },
        trace: { min: 1, max: 3 }
      },
      traceLength: 3,
      traceSpeed: 40,
      flickering: 50,
      intensity: 0,
      explosion: 5,
      opacity: 0.5,
      acceleration: 1.25,
      sound: { enabled: false, files: soundFiles }
    })
    
    fw.start()
    fireworks = fw

    const interval = setInterval(() => {
      fw.updateOptions({
        explosion: 3 + Math.random() * 10,
        particles: 15 + Math.floor(Math.random() * 100),
        flickering: Math.random() * 100,
        gravity: 0.5 + Math.random() * 3,
        friction: 0.92 + Math.random() * 0.07
      })
    }, 400)
    
    return () => {
      clearInterval(interval)
      fw.stop(true)
    }
  })
</script>

<div bind:this={container} class="fireworks-container"></div>
<SoundToggle bind:volume={volume} />

<style>
  .fireworks-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
  }
</style>
