import raf from '@internet/raf'
import Line from '../abstractions/Line'
import roundTo from '../utils/round-to'

// let buffer
// let shouldUpdate = false
// const erosion = {}

// const EASING = {
//   values: [],
//   targets: [],
//   coef: 0.001,
//   tolerance: 0.1,

//   init: function (length = this.targets.length) {
//     this.values = new Array(length).fill(0)
//   },

//   update: function () {
//     if (!this.values || !this.values.length) this.init()

//     shouldUpdate = false
//     for (let i = 0; i < this.targets.length; i++) {
//       const d = (this.targets[i] - this.values[i])
//       if (Math.abs(d) > this.tolerance) {
//         shouldUpdate = true
//         this.values[i] += d * this.coef
//       }
//     }
//   }
// }

// raf.add(update)

export const erode = (landscape, {
  step = 24,
  // easing = 0.001,
  snapToGrid = true,
  autoplay = true
} = {}) => {
  if (landscape.ctx.isSVG) {
    throw new Error('Eroding canvas only works on non SVG context for now')
  }

  let shouldUpdate = autoplay
  const buffer = landscape.copy()

  // const line = new Line(x => Math.sin((x * 0.01) + line.frameCount) * 2)
  const line = new Line(x => Line.perlin({
    seed: 1,
    octaves: 1,
    resolution: 32,
    lacunarity: 2,
    gain: 0.5
  })((x + line.frameCount) / 10) * step * 10)

  line.frameCount = 0

  raf.add(update)

  return {
    play: () => { shouldUpdate = true },
    pause: () => { shouldUpdate = false },
    clear: () => {
      raf.remove(update)
    }
  }

  function update (dt) {
    if (!shouldUpdate) return

    line.frameCount += 1

    landscape.background(landscape.backgroundColor)

    for (let x = 0; x < landscape.width; x += step) {
      const v = line.compute(x, { force: true })
      const y = snapToGrid ? roundTo(v, step) : v
      landscape.ctx.drawImage(buffer, x, 0, step, buffer.height, x, y, step, buffer.height)
    }
  }
}

export default erode
