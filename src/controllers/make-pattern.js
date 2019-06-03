import background from '../utils/draw-background'

export default symbol => {
  return (x, y, {
    ctx,
    unit,
    scale = 1,
    foregroundColor = 'black',
    backgroundColor = 'white'
  } = {}) => {
    ctx.beginSVGGroup()

    background(x, y, unit, unit, { ctx, color: backgroundColor })

    ctx.fillStyle = foregroundColor
    symbol(x, y, { ctx, unit, scale })

    ctx.endSVGGroup()
  }
}
