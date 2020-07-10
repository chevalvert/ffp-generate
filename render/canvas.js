export default (landscape, canvas) => {
  canvas.width = landscape.width
  canvas.height = landscape.height
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'

  const ctx = canvas.getContext('2d')

  ctx.fillStyle = landscape.props.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  landscape.render((cell, path) => {
    ctx.fillStyle = cell.color

    ctx.beginPath()
    path.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point[0], point[1])
      else ctx.lineTo(point[0], point[1])
    })
    ctx.fill()
  })
}
