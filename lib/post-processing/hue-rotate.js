// WIP: refactor

import anime from 'animejs'

/* global Image */

export const hueRotate = (landscape, {
  autoplay = true,
  duration = 1000,
  easing = 'linear',
  loop = true,
  containerClass = 'ffp-container'
} = {}) => {
  const parent = landscape.parent || landscape.canvas.parentNode

  const container = document.createElement('div')
  container.classList.add(containerClass)
  parent.insertBefore(container, landscape.canvas.nextSibling)

  landscape.canvas.style.display = 'none'

  container.style.position = 'absolute'
  container.style.width = landscape.width + 'px'
  container.style.height = landscape.height + 'px'
  container.style.backgroundColor = landscape.backgroundColor

  landscape.grounds.forEach(ground => {
    const img = new Image()
    img.src = ground.sprite.toDataURL()
    img.style.position = 'absolute'
    container.appendChild(img)
  })

  const api = anime({
    autoplay,
    duration,
    easing,
    loop,
    targets: container.querySelectorAll('img'),
    filter: () => {
      const off = Math.floor(Math.random() * 360)
      const dir = Math.sign(Math.sin(Math.random() * Math.PI))
      return [
        `hue-rotate(${off}deg)`,
        `hue-rotate(${off + 360 * dir}deg)`
      ]
    }
  })

  api.clear = () => {
    container.remove()
    landscape.canvas.style.display = ''
  }

  return api
}

export default hueRotate
