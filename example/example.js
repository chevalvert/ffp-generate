import { Landscape, prng, SWATCHES } from '..'
import { erode } from '../post-processing'
import render from '../render'

prng.seed = window.location.hash.substring(1) || Date.now()
console.log(+prng.seed)
document.title += ' | ' + prng.seed

// Landscape generation, agnostic of any rendering context
const landscape = perf('generate', () => {
  const swatch = prng.randomOf(Object.values(SWATCHES))
  return new Landscape({
    sizes: [8, 16],
    width: window.innerWidth - 20,
    height: window.innerHeight - 20,

    groundsLength: 10,
    percentOfStraightLines: 0.125,
    percentOfGradients: 0.5,
    percentOfSimplexGradients: 0.1,

    swatch,
    background: prng.randomOf(swatch),

    random: prng.random
  })
})

// Canvas rendering, and post-processing/erode implementation
const canvas = document.querySelector('canvas')
perf('render.canvas', () => render.canvas(landscape, canvas))
const eroder = erode(landscape, canvas)
canvas.addEventListener('click', () => {
  eroder.rebuild()
  eroder.play()
})

// SVG rendering
const svg = perf('render.svg', () => render.svg(landscape))
document.querySelector('main').appendChild(svg)

// Helper
function perf (name, callback) {
  const start = performance.now()
  const rtrn = callback()
  console.warn(`[${name}] ${(performance.now() - start).toFixed(0)}ms`)
  return rtrn
}
