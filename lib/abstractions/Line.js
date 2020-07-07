import tumult from 'tumult'
import { normalize } from 'missing-math'

export default class Line {
  // IMPORTANT: equation() should return a normalized value
  constructor (equation = x => 0.5) {
    this._equation = equation
    this.points = []
  }

  compute (x, { force = false } = {}) {
    if (force || this.points[x] === undefined) {
      this.points[x] = this._equation(x)
    }

    return this.points[x]
  }

  static perlin ({
    seed = null,
    octaves = 2,
    lacunarity = 2,
    gain = 0.5,
    resolution = 32
  } = {}) {
    const noise = new tumult.Perlin1(seed).transform(function (v) {
      return normalize(this.gen(v / resolution), -1, 1)
    })

    return x => {
      let y = 0
      let amplitude = 0.5
      let frequency = 1.0

      for (let i = 0; i < octaves; i++) {
        y += amplitude * noise(frequency * x)
        frequency *= lacunarity
        amplitude *= gain
      }

      return Math.sin(y)
    }
  }

  static simplex ({
    seed = null,
    octaves = 2
  } = {}) {
    const frequency = Math.pow(2, octaves)
    return new tumult.Simplex1(seed).transform(function (v) {
      return (Math.sin(1 / this.gen(v / frequency)) + 1) / 2
    })
  }
}
