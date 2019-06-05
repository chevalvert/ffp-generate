export default ctx => {
  if (ctx.isSVG) throw new Error('This function does not handle SVG context')

  const canvas = document.createElement('canvas')
  canvas.width = ctx.canvas.width
  canvas.height = ctx.canvas.height

  return canvas
}
