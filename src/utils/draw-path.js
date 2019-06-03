export default (ctx, path) => {
  ctx.beginPath()
  path.forEach((point, index) => {
    ctx[index === 0 ? 'moveTo' : 'lineTo'](...point)
  })
}
