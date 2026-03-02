import { describe, expect, test } from 'vitest'
import { getCenterAutoFireTarget } from './target'

describe('auto-fire target', () => {
  test('stays within margins across many calls', () => {
    const width = 390
    const height = 844
    const margin = 24

    for (let i = 0; i < 1000; i++) {
      const point = getCenterAutoFireTarget(width, height, 72, margin)
      expect(point.x).toBeGreaterThanOrEqual(margin)
      expect(point.x).toBeLessThanOrEqual(width - margin)
      expect(point.y).toBeGreaterThanOrEqual(margin)
      expect(point.y).toBeLessThanOrEqual(height - margin)
    }
  })

  test('falls back safely for tiny viewports', () => {
    const point = getCenterAutoFireTarget(10, 10, 72, 24, () => 0)
    expect(point.x).toBeGreaterThanOrEqual(0)
    expect(point.y).toBeGreaterThanOrEqual(0)
    expect(point.x).toBeLessThanOrEqual(10)
    expect(point.y).toBeLessThanOrEqual(10)
  })
})
