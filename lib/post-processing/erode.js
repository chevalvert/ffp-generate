import raf from '@internet/raf'
import { map, roundTo } from 'missing-math'
import shuffle from '../utils/array-shuffle'
import median from '../utils/array-median'
import prng from '../utils/prng'

function cloneCanvas (canvas, clone = document.createElement('canvas')) {
  clone.width = canvas.width
  clone.height = canvas.height
  const ctx = clone.getContext('2d')

  ctx.drawImage(canvas, 0, 0)
  return clone
}

export default (landscape, canvas, {
  autoplay = true,

  easing = 0.09,
  noUpdateThreshold = 1,

  columnWidth = 16,
  snapToGrid = 8,
  round = true,
  breaks = 2,
  minimizeVisualBreaks = false,
  amplitude = [0, 200],
  scaleFactor = 1
} = {}) => {
  const length = Math.ceil(landscape.width / columnWidth)
  const buffer = cloneCanvas(canvas)
  const ctx = canvas.getContext('2d')

  let points = []
  let shouldUpdate = autoplay

  build()
  raf.add(update)

  return {
    rebuild: build,
    toggle: () => { shouldUpdate = !shouldUpdate },
    play: () => { shouldUpdate = true },
    pause: () => { shouldUpdate = false },
    destroy: () => raf.remove(update)
  }

  function build () {
    // Compute breakpoints at which a line will be swaped with the next
    const breakpoints = []
    for (let i = 0; i < breaks; i++) breakpoints.push(prng.randomInt(0, length))
    breakpoints.push(length)

    // Create a model of the future lines breaks
    let linesIndexes = []
    breakpoints.sort((a, b) => a - b).forEach((breakpoint, index) => {
      linesIndexes = linesIndexes.concat(new Array(breakpoint - linesIndexes.length).fill(index))
    })

    // Reassign points array with new values computed from corresponding lines
    const lines = shuffle(landscape.lines).slice(0, breaks + 1)
    points = linesIndexes.map((lineIndex, index) => {
      const value = lines[lineIndex].compute(index * columnWidth * scaleFactor)
      return {
        t: 1 - value,
        v: points[index] ? points[index].v : 0,
        lineIndex
      }
    })

    // When options.minimizeVisualBreaks is set to true, make sure that each
    // section starts where the previous one ends, to avoid creating vertical
    // breaks
    if (minimizeVisualBreaks) {
      let offset = 0
      points.forEach((point, index) => {
        const previous = points[index - 1]
        if (!previous) return

        if (previous.lineIndex !== point.lineIndex) {
          offset = previous.t - point.t
        }

        point.t += offset
      })
    }

    // Minimize global up/down shift by cancelling the median movement
    // Scale up vertically according to the amplitude argument
    // If snapToGrid, round the target to the nearest on-grid value
    const values = points.map(({t}) => t).sort((a, b) => a - b)
    const m = median(values, { alreadyCloned: true, alreadySorted: true })
    const min = values[0]
    const max = values[values.length - 1]
    points.forEach(p => {
      p.t = map(p.t - m, min - m, max - m, amplitude[0], amplitude[1])
      if (snapToGrid && snapToGrid > 0) p.t = roundTo(p.t, snapToGrid)
    })
  }

  function update (dt) {
    if (!shouldUpdate) return
    shouldUpdate = false

    ctx.fillStyle = landscape.props.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    points.forEach((p, index) => {
      p.v += (p.t - p.v) * easing

      // Continue updating if there are still relevant movements
      if (Math.abs(p.t - p.v) > noUpdateThreshold) {
        shouldUpdate = true
      }

      const x = index * columnWidth
      const y = round ? Math.floor(p.v) : p.v
      ctx.drawImage(buffer, x, 0, columnWidth, (buffer.height - 2), x, y, columnWidth, (buffer.height - 2))
    })
  }
}
