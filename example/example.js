import { Landscape, prng, SWATCHES } from '../lib'
import render from '../lib/render'

prng.seed = window.location.hash.substring(1) || Date.now()
console.log(+prng.seed)
document.title += ' | ' + prng.seed

perf('generate', () => {
  const swatch = prng.randomOf(Object.values(SWATCHES))
  window.landscape = new Landscape({
    sizes: [8, 16],
    width: window.innerWidth - 20,
    height: window.innerHeight - 20,

    groundsLength: 30,
    percentOfStraightLines: 0.125,
    percentOfGradients: 0.5,
    percentOfSimplexGradients: 0.1,

    swatch,
    background: prng.randomOf(swatch),

    random: prng.random
  })
})

perf('render.canvas', () => {
  render.canvas(window.landscape, document.querySelector('canvas'))
})

perf('render.svg', () => {
  const svg = render.svg(window.landscape)
  document.querySelector('main').appendChild(svg)
})

function perf (name, callback) {
  const start = performance.now()
  callback()
  console.warn(`[${name}] ${(performance.now() - start).toFixed(0)}ms`)
}
