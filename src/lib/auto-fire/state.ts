export const AUTO_FIRE_CHARGE_MAX = 88
export const AUTO_FIRE_DURATION_SECONDS = 88
export const AUTO_FIRE_DURATION_CAP_SECONDS = 888

export type AutoFireMode = 'charging' | 'active'

export interface AutoFireState {
  charge: number
  activeRemainingSeconds: number
}

export interface AutoFireViewModel {
  mode: AutoFireMode
  displayNumber: number
  ringProgress: number
  extendReady: boolean
}

export function createAutoFireState(): AutoFireState {
  return {
    charge: 0,
    activeRemainingSeconds: 0
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sanitize(state: AutoFireState): AutoFireState {
  return {
    charge: clamp(Math.floor(state.charge), 0, AUTO_FIRE_CHARGE_MAX),
    activeRemainingSeconds: clamp(Math.floor(state.activeRemainingSeconds), 0, AUTO_FIRE_DURATION_CAP_SECONDS)
  }
}

export function tickSecond(state: AutoFireState): AutoFireState {
  const next = sanitize(state)
  const isActive = next.activeRemainingSeconds > 0

  return {
    charge: isActive ? next.charge : clamp(next.charge + 1, 0, AUTO_FIRE_CHARGE_MAX),
    activeRemainingSeconds: Math.max(0, next.activeRemainingSeconds - 1)
  }
}

export function manualFireTap(state: AutoFireState): AutoFireState {
  const next = sanitize(state)
  const isActive = next.activeRemainingSeconds > 0

  return {
    charge: isActive ? next.charge : clamp(next.charge + 1, 0, AUTO_FIRE_CHARGE_MAX),
    activeRemainingSeconds: next.activeRemainingSeconds
  }
}

export function activateOrExtendTap(state: AutoFireState): AutoFireState {
  const next = sanitize(state)

  if (next.charge < AUTO_FIRE_CHARGE_MAX) {
    return next
  }

  if (next.activeRemainingSeconds > 0) {
    const extendedRemaining = clamp(
      next.activeRemainingSeconds + AUTO_FIRE_DURATION_SECONDS,
      0,
      AUTO_FIRE_DURATION_CAP_SECONDS
    )

    if (extendedRemaining === next.activeRemainingSeconds) {
      return next
    }

    return {
      charge: 0,
      activeRemainingSeconds: extendedRemaining
    }
  }

  return {
    charge: 0,
    activeRemainingSeconds: AUTO_FIRE_DURATION_SECONDS
  }
}

export function getAutoFireViewModel(state: AutoFireState): AutoFireViewModel {
  const next = sanitize(state)
  const mode: AutoFireMode = next.activeRemainingSeconds > 0 ? 'active' : 'charging'
  const displayNumber = mode === 'active' ? Math.ceil(next.activeRemainingSeconds) : next.charge
  const ringProgress =
    mode === 'active'
      ? clamp(Math.min(next.activeRemainingSeconds, AUTO_FIRE_DURATION_SECONDS) / AUTO_FIRE_DURATION_SECONDS, 0, 1)
      : clamp(next.charge / AUTO_FIRE_CHARGE_MAX, 0, 1)

  return {
    mode,
    displayNumber,
    ringProgress,
    extendReady: mode === 'active' && next.charge === AUTO_FIRE_CHARGE_MAX
  }
}
