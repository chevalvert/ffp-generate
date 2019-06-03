import fastRandom from 'fast-random'
import arrayRandom from '../utils/array-random'

let seed = Date.now()
let randomizer = fastRandom(seed)

export default {
  // NOTE: seed must be an integer
  set seed (newSeed) {
    seed = newSeed
    randomizer = fastRandom(seed)
  },

  get seed () {
    return seed
  },

  reset: () => {
    randomizer = fastRandom(seed)
  },

  random: () => randomizer.nextFloat(),
  randomOf: arr => arrayRandom(arr, randomizer.nextFloat),
  randomFloat: (min, max) => randomizer.nextFloat() * (max - min) + min,
  randomInt: (min, max) => Math.floor(randomizer.nextFloat() * (max - min) + min)
}
