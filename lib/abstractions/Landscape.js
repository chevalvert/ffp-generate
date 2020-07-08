import SYMBOLS from '../symbols'

import Line from './Line'
import Gradient from './Gradient'

import prng from '../utils/prng'
import randomOf from '../utils/array-random'

export default class Landscape {
  constructor (props) {
    this.props = Object.assign({
      sizes: [8, 16],
      width: 240,
      height: 240,

      groundsLength: 10,
      percentOfStraightLines: 0.125,
      percentOfGradients: 0.5,
      percentOfSimplexGradients: 0.1,

      swatch: ['rgb(0, 0, 0)'],
      background: 'transparent',
      symbols: [
        'square',
        'square_offset',
        'vertical_line',
        'vertical_line_offset',
        'horizontal_line',
        'horizontal_line_offset',
        'diagonal',
        'diamond',
        'circle'
      ],

      random: prng.random
    }, props)

    this.cells = this.generate()
  }

  get width () { return this.props.width }
  get height () { return this.props.height }

  // This is the actual procgen part of this project
  generate () {
    const {
      sizes,
      groundsLength,
      percentOfStraightLines,
      percentOfGradients,
      percentOfSimplexGradients,
      swatch,
      symbols,
      random
    } = this.props

    const cells = []

    for (let index = 0; index < groundsLength; index++) {
      const rnd = random() * 100
      const size = randomOf(sizes, random)
      const color = randomOf(swatch, random)
      const symbol = randomOf(symbols, random)

      const gradient = rnd > percentOfGradients * 100
        ? Gradient.fix(random())
        : rnd < percentOfSimplexGradients * 100
          ? Gradient.simplex({ seed: rnd })
          : Gradient.linear(rnd)

      const offy = this.height * (1 - (index / (groundsLength))) ** (random() * 3)
      const line = new Line(x => {
        if (rnd < percentOfStraightLines * 100) {
          return offy / this.height
        } else {
          const n = Line.perlin({
            seed: rnd,
            octaves: 3,
            resolution: 64,
            lacunarity: 2,
            gain: 0.5
          })(x / (2 + (rnd / 100) * 3))
          return (offy / this.height) / 2 + n
        }
      })

      // Create cells
      for (let i = 0; i < this.width / size; i++) {
        const jstart = Math.floor((line.compute(i) * this.height) / size)
        for (let j = jstart; j < this.height / size; j++) {
          const x = i * size
          const y = j * size

          // Skip cell creation: intersecting with a previously created cell
          const busy = cells.find(cell => (
            cell.x < x + size &&
            cell.x + cell.size > x &&
            cell.y < y + size &&
            cell.y + cell.size > y
          ))
          if (busy) continue

          const value = gradient.compute(x, y, this.width, this.height)
          cells.push({ x, y, size, value, symbol, color, ground: index })
        }
      }
    }

    return cells
  }

  // This function allows custom renderer implementation
  // SEE render.js for <svg> and <canvas> implementation of this method
  render (callback) {
    for (const cell of this.cells) {
      // Skip invisible cells
      if (cell.color === this.props.background) continue

      const path = SYMBOLS[cell.symbol](cell)
      if (path) callback(cell, path)
    }
  }
}
