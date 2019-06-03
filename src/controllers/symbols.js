import lineclip from 'lineclip'
import { radians } from 'missing-math'

import drawPath from '../utils/draw-path'
import roundTo from '../utils/round-to'

/* eslint-disable camelcase */

function steps (unit, step) {
  return unit / step
}

const symbols = {
  empty: () => {},

  debug: (x, y, { ctx, unit, scale = 1 } = {}) => {
    ctx.strokeStyle = 'black'
    ctx.lineWidth = unit / 12
    ctx.strokeRect(x, y, unit, unit)
  },

  square: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24))
    if (thickness < 0) return

    ctx.fillRect(x + (unit / 2) - thickness / 2, y + (unit / 2) - thickness / 2, thickness, thickness)
  },

  square_offset: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24)) - 10
    if (thickness < 0) return

    ctx.fillRect(x + (unit / 2) - thickness / 2, y + (unit / 2) - thickness / 2, thickness, thickness)
  },

  vertical_line: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24))
    if (thickness < 0) return

    ctx.fillRect(x + (unit / 2) - (thickness / 2), y, thickness, unit)
  },

  vertical_line_offset: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24)) - 10
    if (thickness < 0) return

    ctx.fillRect(x + (unit / 2) - (thickness / 2), y, thickness, unit)
  },

  horizontal_line: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24))
    if (thickness < 0) return

    ctx.fillRect(x, y + (unit / 2) - (thickness / 2), unit, thickness)
  },

  horizontal_line_offset: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24)) - 10
    if (thickness < 0) return

    ctx.fillRect(x, y + (unit / 2) - (thickness / 2), unit, thickness)
  },

  diagonal: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24))
    if (thickness < 0) return

    ctx.beginPath()
    ctx.moveTo(x + unit - thickness, y)
    ctx.lineTo(x + unit, y)
    ctx.lineTo(x + thickness, y + unit)
    ctx.lineTo(x, y + unit)
    ctx.fill()
  },

  diamond: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const thickness = roundTo(unit * scale, steps(unit, 24)) - 1
    if (thickness < 0) return

    drawPath(ctx, lineclip.polygon([
      [x + unit / 2, y + thickness],
      [x + unit - thickness, y + unit / 2],
      [x + unit / 2, y + unit - thickness],
      [x + thickness, y + unit / 2]
    ], [x, y, x + unit, y + unit]))
    ctx.fill()
  },

  circle: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const diameter = roundTo((unit - 1) * scale, steps(unit, 24))
    if (diameter < 0) return

    const path = []
    for (let alpha = 0; alpha < 360; alpha += (360 / 36)) {
      const theta = radians(alpha)
      path.push([
        (x + unit / 2) + Math.sin(theta) * (diameter),
        (y + unit / 2) + Math.cos(theta) * (diameter)
      ])
    }

    drawPath(ctx, lineclip.polygon(path, [x, y, x + unit, y + unit]))
    ctx.closePath()
    ctx.fill()
  },

  ffp: (x, y, { ctx, unit, scale = 1 } = {}) => {
    const gradient = 'FFP'.split('')
    const char = gradient[Math.floor(Math.random() * gradient.length)]
    if (!char) return

    ctx.font = `${unit * 1.2}px Space Mono`
    ctx.fillText(char, x, y + unit)
  }
}

export default symbols
