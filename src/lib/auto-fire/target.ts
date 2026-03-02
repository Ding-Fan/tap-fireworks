export interface AutoFireTarget {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getCenterAutoFireTarget(
  width: number,
  height: number,
  jitter = 0,
  margin = 24,
  random: () => number = Math.random
): AutoFireTarget {
  const safeWidth = Math.max(0, width)
  const safeHeight = Math.max(0, height)
  const safeMarginX = Math.min(margin, safeWidth / 2)
  const safeMarginY = Math.min(margin, safeHeight / 2)

  const centerX = safeWidth / 2
  const centerY = safeHeight / 2

  const randomOffsetX = (random() - 0.5) * 2 * jitter
  const randomOffsetY = (random() - 0.5) * 2 * jitter

  return {
    x: clamp(centerX + randomOffsetX, safeMarginX, Math.max(safeMarginX, safeWidth - safeMarginX)),
    y: clamp(centerY + randomOffsetY, safeMarginY, Math.max(safeMarginY, safeHeight - safeMarginY))
  }
}
