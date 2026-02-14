<script lang="ts">
  import { Fireworks } from 'fireworks-js'

  let container: HTMLDivElement

  $effect(() => {
    const fireworks = new Fireworks(container, {
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
      sound: { enabled: false }
    })
    fireworks.start()
    return () => fireworks.stop(true)
  })
</script>

<div bind:this={container} class="fireworks-container"></div>

<style>
  .fireworks-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #000;
  }
</style>
