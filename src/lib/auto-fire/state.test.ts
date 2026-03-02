import { describe, expect, test, vi } from 'vitest'
import {
  AUTO_FIRE_CHARGE_MAX,
  AUTO_FIRE_DURATION_CAP_SECONDS,
  AUTO_FIRE_DURATION_SECONDS,
  activateOrExtendTap,
  createAutoFireState,
  getAutoFireViewModel,
  manualFireTap,
  tickSecond,
  type AutoFireState
} from './state'

describe('auto-fire state', () => {
  test('manual tap increments and clamps charge at 88', () => {
    let state: AutoFireState = createAutoFireState()

    for (let i = 0; i < 120; i++) {
      state = manualFireTap(state)
    }

    expect(state.charge).toBe(AUTO_FIRE_CHARGE_MAX)
    expect(state.activeRemainingSeconds).toBe(0)
  })

  test('activation requires full charge', () => {
    let state: AutoFireState = createAutoFireState()

    for (let i = 0; i < 40; i++) {
      state = manualFireTap(state)
    }

    const unchanged = activateOrExtendTap(state)
    expect(unchanged).toEqual(state)
  })

  test('activation at 88 consumes charge and starts 88s', () => {
    let state: AutoFireState = createAutoFireState()

    for (let i = 0; i < AUTO_FIRE_CHARGE_MAX; i++) {
      state = manualFireTap(state)
    }

    const active = activateOrExtendTap(state)
    expect(active.charge).toBe(0)
    expect(active.activeRemainingSeconds).toBe(AUTO_FIRE_DURATION_SECONDS)
  })

  test('extend while active adds 88 and caps at 888', () => {
    const state: AutoFireState = {
      charge: AUTO_FIRE_CHARGE_MAX,
      activeRemainingSeconds: 880
    }

    const extended = activateOrExtendTap(state)

    expect(extended.charge).toBe(0)
    expect(extended.activeRemainingSeconds).toBe(AUTO_FIRE_DURATION_CAP_SECONDS)
  })

  test('extend at cap does not consume charge', () => {
    const state: AutoFireState = {
      charge: AUTO_FIRE_CHARGE_MAX,
      activeRemainingSeconds: AUTO_FIRE_DURATION_CAP_SECONDS
    }

    const unchanged = activateOrExtendTap(state)

    expect(unchanged.charge).toBe(AUTO_FIRE_CHARGE_MAX)
    expect(unchanged.activeRemainingSeconds).toBe(AUTO_FIRE_DURATION_CAP_SECONDS)
  })

  test('tick does not add charge while active and decreases countdown', () => {
    const state: AutoFireState = {
      charge: 0,
      activeRemainingSeconds: 2
    }

    const afterTick = tickSecond(state)
    expect(afterTick.charge).toBe(0)
    expect(afterTick.activeRemainingSeconds).toBe(1)
  })

  test('manual tap does not add charge while active', () => {
    const state: AutoFireState = {
      charge: 10,
      activeRemainingSeconds: 50
    }

    const afterTap = manualFireTap(state)
    expect(afterTap.charge).toBe(10)
    expect(afterTap.activeRemainingSeconds).toBe(50)
  })

  test('view model marks extend-ready when active and charge is full', () => {
    const view = getAutoFireViewModel({
      charge: AUTO_FIRE_CHARGE_MAX,
      activeRemainingSeconds: 100
    })

    expect(view.mode).toBe('active')
    expect(view.extendReady).toBe(true)
    expect(view.displayNumber).toBe(100)
    expect(view.ringProgress).toBe(1)
  })

  test('fake timer driver keeps passive charging deterministic', () => {
    vi.useFakeTimers()

    try {
      let state: AutoFireState = createAutoFireState()
      const timer = setInterval(() => {
        state = tickSecond(state)
      }, 1000)

      vi.advanceTimersByTime(9000)
      clearInterval(timer)

      expect(state.charge).toBe(9)
      expect(state.activeRemainingSeconds).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
