import raf from '@internet/raf'

import datalines from '../controllers/erode-dataline'

import randomOf from '../utils/array-random'

let buffer
let shouldUpdate = false
const erosion = {}

const EASING = {
  values: [],
  targets: [],
  coef: 0.001,
  tolerance: 0.1,

  init: function (length = this.targets.length) {
    this.values = new Array(length).fill(0)
  },

  update: function () {
    if (!this.values || !this.values.length) this.init()

    shouldUpdate = false
    for (let i = 0; i < this.targets.length; i++) {
      const d = (this.targets[i] - this.values[i])
      if (Math.abs(d) > this.tolerance) {
        shouldUpdate = true
        this.values[i] += d * this.coef
      }
    }
  }
}

raf.add(update)

export const erode = (landscape, {
  step = 24,
  easing = 0.001,
  snapToGrid = true
} = {}) => {
  if (!landscape.canvas) throw new Error('erode only works on SVGCanvas with canvas element for now')

  if (!erosion.landscape) {
    buffer = landscape.copy()
    erosion.landscape = landscape
    erosion.step = step
  }

  EASING.coef = easing
  EASING.targets = randomOf(datalines).map(v => {
    return snapToGrid
      ? Math.floor((v * landscape.height) / step) * step - landscape.height / 2
      : v * (landscape.height / step) * step - landscape.height / 2
  })

  shouldUpdate = true
}

function update (dt) {
  if (!shouldUpdate) return

  EASING.update()
  erosion.landscape.background(erosion.landscape.backgroundColor)

  EASING.values.forEach((y, index) => {
    const x = index * erosion.step
    erosion.landscape.ctx.drawImage(buffer, x, 0, erosion.step, erosion.landscape.height, x, y, erosion.step, erosion.landscape.height)
  })
}

export default erode
