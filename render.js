function pathData (arr, decimals = 3) {
  let d = ''
  for (let i = 0; i < arr.length + 1; i++) {
    d += i ? ' L ' : 'M '
    d += arr[i % arr.length][0].toFixed(decimals) + ' ' + arr[i % arr.length][1].toFixed(decimals)
  }

  return d
}

function createSVGElement (tagName, attributes, parent) {
  const ns = 'http://www.w3.org/2000/svg'
  const el = document.createElementNS(ns, tagName)
  for (const attrName in attributes) {
    el.setAttribute(attrName, attributes[attrName])
  }

  if (parent) parent.appendChild(el)
  return el
}

export default {
  // TODO: test web worker support
  svg: (landscape, { decimals = 3 } = {}) => {
    const svgElement = createSVGElement('svg', {
      'width': landscape.width,
      'height': landscape.height,
      'viewBox': `0 0 ${landscape.width} ${landscape.height}`
    })

    // Use a rectangle as background
    createSVGElement('rect', {
      x: 0,
      y: 0,
      width: landscape.width,
      height: landscape.height,
      fill: landscape.props.background
    }, svgElement)

    // TODO: <defs> & <use
    landscape.render((cell, path) => createSVGElement('path', {
      d: pathData(path, decimals),
      fill: cell.color
    }, svgElement))

    return svgElement
  },

  canvas: (landscape, canvas) => {
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
}
