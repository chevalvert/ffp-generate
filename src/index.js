import Gradient from './abstractions/Gradient'
import Ground from './abstractions/Ground'
import Landscape from './abstractions/Landscape'
import Line from './abstractions/Line'
import makePattern from './controllers/make-pattern'
import SYMBOLS from './controllers/symbols'
import randomOf from './utils/array-random'

export const generate = ({
  units = [24],
  width = 240,
  height = 240,
  groundsLength = 2,

  percentOfStraightLines = 0.5,
  percentOfGradients = 0.5,
  percentOfSimplexGradients = 0.1,

  swatch = ['rgb(0, 0, 0)'],
  backgroundColor = 'rgb(255, 255, 255)',
  symbols = ['debug'],

  canvas = null,
  random = Math.random
} = {}) => {
  const patterns = symbols.map(symbolName => makePattern(SYMBOLS[symbolName]))

  const grounds = new Array(groundsLength).fill(true).map((_, index, grounds) => {
    const rnd = random() * 100
    const unit = randomOf(units, random)

    const foregroundColor = randomOf(swatch, random)
    const pattern = randomOf(patterns, random)

    const gradient = rnd > percentOfGradients * 100
      ? Gradient.fix(random())
      : rnd < percentOfSimplexGradients * 100
        ? Gradient.simplex({ seed: rnd })
        : Gradient.linear(rnd)

    const offy = height * (1 - (index / (grounds.length))) ** (random() * 3)
    const line = new Line(x => {
      if (rnd < percentOfStraightLines * 100) {
        return offy / height
      } else {
        const n = Line.perlin({
          seed: rnd,
          octaves: 3,
          resolution: 64,
          lacunarity: 2,
          gain: 0.5
        })(x / (2 + (rnd / 100) * 3))
        return (offy / height) / 2 + n
      }
    })

    return new Ground({
      unit, line, gradient, width, height, foregroundColor, backgroundColor, pattern
    })
  })

  return Landscape.from(grounds, {
    canvas,
    backgroundColor
  })
}

export { default as prng } from './utils/prng'
export { erode } from './controllers/erode'
export { swatches } from './controllers/swatches'
