import tumult from 'tumult'
import { normalize, radians, lerp } from 'missing-math'

export default class Gradient {
  // IMPORTANT: f() should return a normalized value
  constructor (f = (x, y, width, height) => 1) {
    this.compute = f.bind(this)
  }

  static get methods () {
    return Object.getOwnPropertyNames(Gradient)
      .filter(prop => prop !== 'methods')
      .filter(prop => typeof Gradient[prop] === 'function')
  }

  static normalize (x, y, width, height) {
    return [
      normalize(x, 0, width),
      normalize(y, 0, height)
    ]
  }

  static simplex ({
    seed = null,
    octaves = 2,
    power = 1
  } = {}) {
    const frequency = Math.pow(2, octaves)
    const simplex = new tumult.Simplex2(seed)
    return new Gradient((x, y, width, height) => {
      const [i, j] = Gradient.normalize(x, y, width, height)
      return normalize(simplex.gen(i / frequency, j / frequency), -1, 1) ** power
    })
  }

  static linear (alpha = 0) {
    return new Gradient((x, y, width, height) => {
      const [i, j] = Gradient.normalize(x, y, width, height)
      const theta = radians(alpha)

      const dirx = lerp(1 - i, i, (Math.sin(theta) + 1) / 2)
      const diry = lerp(1 - j, j, (Math.cos(theta) + 1) / 2)
      return ((dirx + diry) / 2)
    })
  }

  static random (rng = Math.random) {
    return new Gradient(rng)
  }

  static fix (value = 1) {
    return new Gradient(() => value)
  }
}
