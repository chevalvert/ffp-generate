import makePattern from '../controllers/make-pattern'
import symbols from '../controllers/symbols'

export default class Ground {
  constructor ({
    width,
    height,
    unit = 24,
    line,
    gradient,
    pattern = makePattern(symbols['debug']),
    foregroundColor = 'black',
    backgroundColor = 'white'
  } = {}) {
    this.width = width
    this.height = height
    this.unit = unit

    this.line = line
    this.gradient = gradient
    this.pattern = pattern

    this.backgroundColor = backgroundColor
    this.foregroundColor = foregroundColor

    this.grid = []
    this.cells = []
    this._populate()
  }

  _populate () {
    for (let x = 0; x < this.width; x += this.unit) {
      const i = Math.floor(x / this.unit)
      const ystart = this.line.compute(i) * this.height
      for (let y = ystart; y < this.height; y += this.unit) {
        const j = Math.floor(y / this.unit)
        this.setCell(i, j)
      }
    }
  }

  setCell (i, j) {
    if (!this.grid[i]) this.grid[i] = []

    const cell = {
      i,
      j,
      x: i * this.unit,
      y: j * this.unit,
      shouldRender: true
    }
    this.grid[i][j] = cell
    this.cells.push(cell)
  }

  hasCell (i, j) {
    return this.grid[i] && this.grid[i][j]
  }

  isInFrontOf (x, y) {
    const i = Math.floor(x / this.unit)
    const j = Math.floor(y / this.unit)
    return this.hasCell(i, j)
  }

  behind (grounds) {
    this.grid.forEach(column => {
      column.forEach(cell => {
        if (!cell || !cell.shouldRender) return
        cell.shouldRender = !grounds.some(ground => {
          return ground.isInFrontOf(cell.x, cell.y)
        })
      })
    })
  }

  render (ctx) {
    this.cells.forEach(cell => {
      if (!cell.shouldRender) return

      this.pattern(cell.x, cell.y, {
        ctx,
        unit: this.unit,
        backgroundColor: this.backgroundColor,
        foregroundColor: this.foregroundColor,
        scale: this.gradient.compute(cell.x, cell.y, this.width, this.height)
      })
    })
  }
}
