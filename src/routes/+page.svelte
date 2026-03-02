<script lang="ts">
  import { Fireworks } from 'fireworks-js'
  import SoundToggle from '$lib/SoundToggle.svelte'
  import AutoFireButton from '$lib/AutoFireButton.svelte'
  import {
    createAutoFireState,
    manualFireTap,
    tickSecond,
    activateOrExtendTap
  } from '$lib/auto-fire/state'
  import { getCenterAutoFireTarget } from '$lib/auto-fire/target'
  import { browser } from '$app/environment'

  let container: HTMLDivElement
  let fireworks: Fireworks | undefined = $state()
  const initialAutoFireState = createAutoFireState()
  let autoFireCharge = $state(initialAutoFireState.charge)
  let autoFireRemainingSeconds = $state(initialAutoFireState.activeRemainingSeconds)
  let autoFireActive = $derived(autoFireRemainingSeconds > 0)

  const soundFiles = [
    '/sounds/explosion0.mp3',
    '/sounds/explosion1.mp3',
    '/sounds/explosion2.mp3'
  ]

  // Initialize from localStorage safely
  let volume = $state(0)
  let volumeLoaded = $state(false)

  $effect(() => {
    if (!browser || volumeLoaded) return

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

    volumeLoaded = true
  })

  // Persist to localStorage
  $effect(() => {
    if (!browser || !volumeLoaded) return
    localStorage.setItem('fireworks-volume', volume.toString())
  })

  let showVolumeTip = $derived(volumeLoaded && volume === 0)

  function getAutoFireState() {
    return {
      charge: autoFireCharge,
      activeRemainingSeconds: autoFireRemainingSeconds
    }
  }

  function setAutoFireState(nextState: { charge: number; activeRemainingSeconds: number }) {
    autoFireCharge = nextState.charge
    autoFireRemainingSeconds = nextState.activeRemainingSeconds
  }

  function applyManualFireTap() {
    setAutoFireState(manualFireTap(getAutoFireState()))
  }

  function applyTickSecond() {
    setAutoFireState(tickSecond(getAutoFireState()))
  }

  function applyActivateOrExtendTap() {
    setAutoFireState(activateOrExtendTap(getAutoFireState()))
  }

  function getFireworksMouseState(fw: Fireworks): { x: number; y: number; active: boolean } | null {
    const value = Reflect.get(fw as object, 'mouse')
    if (typeof value !== 'object' || value === null) return null

    const candidate = value as { x?: unknown; y?: unknown; active?: unknown }
    if (typeof candidate.x !== 'number') candidate.x = 0
    if (typeof candidate.y !== 'number') candidate.y = 0

    if (typeof candidate.active !== 'boolean') {
      candidate.active = false
    }

    return candidate as { x: number; y: number; active: boolean }
  }

  function launchCenterAutoFireVolley(fw: Fireworks) {
    if (!container) return
    if (autoFireRemainingSeconds <= 0) return

    const count = 1 + Math.floor(Math.random() * 3)
    const mouse = getFireworksMouseState(fw)
    if (!mouse) {
      fw.launch(count)
      return
    }

    const rect = container.getBoundingClientRect()
    const previousMouse = { x: mouse.x, y: mouse.y, active: mouse.active }

    for (let i = 0; i < count; i++) {
      const point = getCenterAutoFireTarget(rect.width, rect.height, 0)
      mouse.x = point.x
      mouse.y = point.y
      mouse.active = true
      fw.launch(1)
    }

    mouse.x = previousMouse.x
    mouse.y = previousMouse.y
    mouse.active = previousMouse.active
  }

  $effect(() => {
    const interval = window.setInterval(() => {
      applyTickSecond()
    }, 1000)

    return () => {
      window.clearInterval(interval)
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
      mouse: { click: false, move: false, max: 1 },
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

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      const rect = container.getBoundingClientRect()
      const tapX = e.clientX - rect.left
      const tapY = e.clientY - rect.top
      const count = 3 + Math.floor(Math.random() * 3) // 3-5 rockets
      const mouse = getFireworksMouseState(fw)
      applyManualFireTap()

      if (!mouse) {
        fw.launch(count)
        return
      }

      const previousMouse = { x: mouse.x, y: mouse.y, active: mouse.active }

      for (let i = 0; i < count; i++) {
        mouse.x = tapX + (Math.random() - 0.5) * 120 // ±60px spread
        mouse.y = tapY + (Math.random() - 0.5) * 120
        mouse.active = true
        fw.launch(1)
      }
      mouse.x = previousMouse.x
      mouse.y = previousMouse.y
      mouse.active = previousMouse.active
    }

    container.addEventListener('pointerdown', handlePointerDown)

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
      container.removeEventListener('pointerdown', handlePointerDown)
      clearInterval(interval)
      fw.stop(true)
    }
  })

  $effect(() => {
    if (!fireworks || !autoFireActive) return

    const fw = fireworks

    launchCenterAutoFireVolley(fw)

    let timeout: ReturnType<typeof window.setTimeout> | undefined
    let disposed = false

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 2000

      timeout = window.setTimeout(() => {
        if (disposed || autoFireRemainingSeconds <= 0) return
        launchCenterAutoFireVolley(fw)
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      disposed = true
      if (timeout !== undefined) {
        window.clearTimeout(timeout)
      }
    }
  })

</script>

<div bind:this={container} class="fireworks-container"></div>
<SoundToggle bind:volume={volume} showTip={showVolumeTip} />
<AutoFireButton
  charge={autoFireCharge}
  remainingSeconds={autoFireRemainingSeconds}
  onActivate={applyActivateOrExtendTap}
/>

<style>
  .fireworks-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
  }
</style>
