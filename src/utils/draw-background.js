export default (x, y, width, height, { ctx, color } = {}) => {
  if (color === 'transparent') return

  if (color) ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
}
