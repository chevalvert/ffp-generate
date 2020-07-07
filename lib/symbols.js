import lineclip from 'lineclip'
import { radians, roundTo } from 'missing-math'

const steps = (size, step) => size / step

export default {
  empty: () => null,

  square: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24))
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x + hs - ht, cell.y + hs - ht],
      [cell.x + hs - ht, cell.y + hs + ht],
      [cell.x + hs + ht, cell.y + hs + ht],
      [cell.x + hs + ht, cell.y + hs - ht]
    ]
  },

  square_offset: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24)) - 10
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x + hs - ht, cell.y + hs - ht],
      [cell.x + hs - ht, cell.y + hs + ht],
      [cell.x + hs + ht, cell.y + hs + ht],
      [cell.x + hs + ht, cell.y + hs - ht]
    ]
  },

  vertical_line: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24))
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x + hs - ht, cell.y],
      [cell.x + hs - ht, cell.y + cell.size],
      [cell.x + hs + ht, cell.y + cell.size],
      [cell.x + hs + ht, cell.y]
    ]
  },

  vertical_line_offset: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24)) - 10
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x + hs - ht, cell.y],
      [cell.x + hs - ht, cell.y + cell.size],
      [cell.x + hs + ht, cell.y + cell.size],
      [cell.x + hs + ht, cell.y]
    ]
  },

  horizontal_line: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24))
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x, cell.y + hs - ht],
      [cell.x, cell.y + hs + ht],
      [cell.x + cell.size, cell.y + hs + ht],
      [cell.x + cell.size, cell.y + hs - ht]
    ]
  },

  horizontal_line_offset: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24)) - 10
    if (thickness < 0) return

    const ht = thickness / 2
    const hs = cell.size / 2

    return [
      [cell.x, cell.y + hs - ht],
      [cell.x, cell.y + hs + ht],
      [cell.x + cell.size, cell.y + hs + ht],
      [cell.x + cell.size, cell.y + hs - ht]
    ]
  },

  diagonal: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24))
    if (thickness < 0) return

    return [
      [cell.x + cell.size - thickness, cell.y],
      [cell.x + cell.size, cell.y],
      [cell.x + thickness, cell.y + cell.size],
      [cell.x, cell.y + cell.size]
    ]
  },

  diamond: cell => {
    const thickness = roundTo(cell.size * cell.value, steps(cell.size, 24)) - 1
    if (thickness < 0) return

    return lineclip.polygon([
      [cell.x + cell.size / 2, cell.y + thickness],
      [cell.x + cell.size - thickness, cell.y + cell.size / 2],
      [cell.x + cell.size / 2, cell.y + cell.size - thickness],
      [cell.x + thickness, cell.y + cell.size / 2]
    ], [cell.x, cell.y, cell.x + cell.size, cell.y + cell.size])
  },

  circle: cell => {
    const diameter = roundTo((cell.size - 1) * cell.value, steps(cell.size, 24))
    if (diameter < 0) return

    const path = []
    for (let alpha = 0; alpha < 360; alpha += (360 / 36)) {
      const theta = radians(alpha)
      path.push([
        (cell.x + cell.size / 2) + Math.sin(theta) * (diameter),
        (cell.y + cell.size / 2) + Math.cos(theta) * (diameter)
      ])
    }

    return lineclip.polygon(path, [cell.x, cell.y, cell.x + cell.size, cell.y + cell.size])
  }
}
