import { clamp } from 'missing-math'

import chunk from './utils/array-chunk'
import shuffle from './utils/array-shuffle'
import prng from './utils/prng'

/* eslint-disable comma-spacing, indent */

// SEE graphic guidelines
const COLORS = [
  { rgb: [120, 0, 100], cmyk: [50, 100, 20, 20] },
  { rgb: [160, 15, 150], cmyk: [40, 80, 0, 0] },
  { rgb: [200, 30, 200], cmyk: [35, 80, 0, 0] },
  { rgb: [250, 50, 255], cmyk: [20, 70, 0, 0] },
  { rgb: [255, 90, 190], cmyk: [0, 70, 0, 0] },
  { rgb: [255, 120, 140], cmyk: [0, 68, 24, 0] },
  { rgb: [255, 165, 165], cmyk: [0, 50, 23, 0] },
  { rgb: [255, 215, 235], cmyk: [0, 25, 0, 0] },
  { rgb: [80, 20, 100], cmyk: [80, 100, 25, 20] },
  { rgb: [110, 30, 130], cmyk: [65, 100, 0, 0] },
  { rgb: [140, 35, 160], cmyk: [50, 90, 0, 0] },
  { rgb: [170, 40, 190], cmyk: [45, 80, 0, 0] },
  { rgb: [180, 60, 255], cmyk: [55, 75, 0, 0] },
  { rgb: [190, 100, 255], cmyk: [45, 60, 0, 0] },
  { rgb: [200, 150, 255], cmyk: [30, 45, 0, 0] },
  { rgb: [210, 200, 255], cmyk: [20, 25, 0, 0] },
  { rgb: [45, 0, 150], cmyk: [100, 100, 0, 0] },
  { rgb: [85, 20, 200], cmyk: [85, 85, 0, 0] },
  { rgb: [110, 40, 255], cmyk: [80, 75, 0, 0] },
  { rgb: [130, 80, 255], cmyk: [70, 70, 0, 0] },
  { rgb: [150, 120, 255], cmyk: [56, 56, 0, 0] },
  { rgb: [160, 170, 255], cmyk: [40, 30, 0, 0] },
  { rgb: [180, 205, 255], cmyk: [36, 12, 0, 0] },
  { rgb: [195, 235, 255], cmyk: [32, 0, 0, 0] },
  { rgb: [0, 0, 90], cmyk: [100, 95, 35, 40] },
  { rgb: [0, 0, 160], cmyk: [100, 90, 12, 0] },
  { rgb: [0, 0, 255], cmyk: [93, 74, 0, 0] },
  { rgb: [0, 120, 255], cmyk: [87, 50, 0, 0] },
  { rgb: [60, 185, 255], cmyk: [80, 0, 0, 0] },
  { rgb: [0, 220, 255], cmyk: [65, 0, 10, 0] },
  { rgb: [60, 255, 255], cmyk: [80, 0, 12, 0] },
  { rgb: [220, 255, 255], cmyk: [25, 0, 5, 0] },
  { rgb: [30, 60, 90], cmyk: [100, 75, 40, 35] },
  { rgb: [60, 100, 130], cmyk: [88, 50, 30, 15] },
  { rgb: [80, 130, 160], cmyk: [80, 30, 25, 10] },
  { rgb: [100, 160, 180], cmyk: [75, 15, 25, 0] },
  { rgb: [120, 170, 190], cmyk: [65, 15, 20, 0] },
  { rgb: [150, 180, 200], cmyk: [50, 15, 15, 0] },
  { rgb: [170, 200, 210], cmyk: [40, 10, 15, 0] },
  { rgb: [200, 220, 230], cmyk: [30, 5, 10, 0] },
  { rgb: [0, 60, 40], cmyk: [100, 45, 90, 60] },
  { rgb: [0, 90, 60], cmyk: [100, 30, 90, 35] },
  { rgb: [0, 120, 90], cmyk: [100, 20, 75, 10] },
  { rgb: [0, 150, 120], cmyk: [100, 0, 65, 0] },
  { rgb: [20, 180, 150], cmyk: [90, 0, 55, 0] },
  { rgb: [60, 230, 200], cmyk: [80, 0, 40, 0] },
  { rgb: [120, 245, 210], cmyk: [65, 0, 35, 0] },
  { rgb: [180, 255, 255], cmyk: [40, 0, 15, 0] },
  { rgb: [40, 75, 0], cmyk: [90, 45, 100, 50] },
  { rgb: [30, 95, 20], cmyk: [100, 30, 100, 30] },
  { rgb: [20, 115, 40], cmyk: [100, 20, 100, 15] },
  { rgb: [10, 170, 50], cmyk: [100, 0, 100, 0] },
  { rgb: [0, 210, 70], cmyk: [80, 0, 90, 0] },
  { rgb: [0, 255, 50], cmyk: [70, 0, 80, 0] },
  { rgb: [90, 255, 130], cmyk: [70, 0, 70, 0] },
  { rgb: [180, 255, 160], cmyk: [50, 0, 50, 0] },
  { rgb: [140, 115, 0], cmyk: [30, 45, 100, 25] },
  { rgb: [180, 140, 0], cmyk: [20, 40, 100, 10] },
  { rgb: [220, 180, 0], cmyk: [10, 30, 100, 0] },
  { rgb: [255, 220, 0], cmyk: [0, 10, 90, 0] },
  { rgb: [255, 255, 40], cmyk: [0, 0, 100, 0] },
  { rgb: [255, 250, 100], cmyk: [5, 0, 70, 0] },
  { rgb: [255, 245, 160], cmyk: [0, 0, 50, 0] },
  { rgb: [255, 255, 200], cmyk: [0, 0, 20, 0] },
  { rgb: [100, 45, 80], cmyk: [50, 90, 35, 35] },
  { rgb: [140, 60, 60], cmyk: [25, 85, 70, 20] },
  { rgb: [180, 75, 40], cmyk: [15, 80, 95, 0] },
  { rgb: [200, 90, 20], cmyk: [0, 75, 100, 0] },
  { rgb: [225, 115, 10], cmyk: [0, 65, 95, 0] },
  { rgb: [255, 140, 0], cmyk: [0, 55, 90, 0] },
  { rgb: [255, 170, 75], cmyk: [0, 40, 70, 0] },
  { rgb: [255, 200, 150], cmyk: [0, 20, 40, 0] },
  { rgb: [90, 0, 40], cmyk: [35, 100, 60, 55] },
  { rgb: [150, 0, 60], cmyk: [20, 100, 60, 15] },
  { rgb: [195, 0, 50], cmyk: [0, 100, 75, 0] },
  { rgb: [220, 0, 40], cmyk: [0, 90, 75, 0] },
  { rgb: [255, 0, 20], cmyk: [0, 90, 70, 0] },
  { rgb: [255, 60, 60], cmyk: [0, 85, 65, 0] },
  { rgb: [255, 120, 120], cmyk: [0, 65, 40, 0] },
  { rgb: [250, 190, 190], cmyk: [0, 35, 15, 0] },
  { rgb: [40, 20, 0], cmyk: [60, 80, 70, 85] },
  { rgb: [70, 40, 20], cmyk: [40, 78, 90, 65] },
  { rgb: [100, 60, 45], cmyk: [35, 75, 75, 50] },
  { rgb: [135, 115, 100], cmyk: [35, 45, 50, 30] },
  { rgb: [175, 145, 130], cmyk: [25, 40, 40, 10] },
  { rgb: [210, 180, 160], cmyk: [10, 30, 35, 0] },
  { rgb: [220, 200, 180], cmyk: [10, 20, 30, 0] },
  { rgb: [235, 220, 200], cmyk: [5, 15, 20, 0] }
].map(color => {
  color.css = `rgb(${color.rgb})`

  // Graphic designers define CMYK values on 0~100 range, but W3C defines them as 0~1 range
  color.cmyk = color.cmyk.map(v => v / 100)

  // TODO: for better accuracy, use hard-coded values to visually match on
  // screen what a printed CMYK will look like (also known as "proofing")
  color['css-cmyk-proof'] = `rgb(${proof(color.cmyk)})`
  return color
})

// SEE https://graphicdesign.stackexchange.com/a/137902
function proof ([c, m, y, k]) {
  const C = 255 * (1 - c)
  const M = 255 * (1 - m)
  const Y = 255 * (1 - y)
  const K = 255 * (1 - k)
  const r = 80 + 0.5882 * C - 0.3529 * M - 0.1373 * Y + 0.00185 * C * M + 0.00046 * Y * C
  const g = 66 - 0.1961 * C + 0.2745 * M - 0.0627 * Y + 0.00215 * C * M + 0.00008 * Y * C + 0.00062 * Y * M
  const b = 86 - 0.3255 * C - 0.1569 * M + 0.1647 * Y + 0.00046 * C * M + 0.00123 * Y * C + 0.00215 * Y * M

  return [r * K / 255, g * K / 255, b * K / 255].map(v => clamp(v, 0, 255))
}

function clone (color) {
  return Object.assign({}, color, { rgb: [...color.rgb], cmyk: [...color.cmyk] })
}

export function toArray () {
  return [...COLORS]
}

export function log (colors, lineLength = 1) {
  if (!arguments.length) {
    colors = COLORS
    lineLength = 8
  }

  const lines = chunk(colors, lineLength)
  for (const line of lines) {
    const styles = []
    for (const color of line) {
      const css = color.css
        ? color.css
        : color.rgb
          ? `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`
          : color
      styles.push(`background-color:${css}; padding: 20px`)
    }
    console.log(new Array(styles.length).fill('%c ').join(''), ...styles)
  }
}

export function swatch ({
  colorSpace = null,
  random = prng.random
} = {}) {
  /**
   * Procgen of the swatch:
   * - group colors by hue (every 8 colors)
   * - push two successive dark colors
   * - push two successive medium colors
   * - push two successive light colors
   *
   * Do not take colors with hue overlapping indexes (ie [0, 1] of hue#1, [1, 2] of hue#2)
   */

  let colors = []

  // Group COLORS by hue (every 8 colors), and take three random hues
  const hues = shuffle(chunk(COLORS, 8), random).splice(0, 3)

  // Push the two dark colors
  let index = Math.round(random()) // 0 or 1
  colors.push(hues[0][index++])
  colors.push(hues[0][index++])

  // Push the two medium colors
  if (index < 3) index = Math.round(random())
  colors.push(hues[1][index++])
  colors.push(hues[1][index++])

  // Push the two bright colors
  index += Math.round(random())
  colors.push(hues[2][index++])
  colors.push(hues[2][index++])

  return colorSpace
    ? colors.map(color => clone(color)[colorSpace])
    : colors.map(clone)
}

export default {
  toArray,
  swatch,
  log
}
