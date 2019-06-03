import Canvas from 'canvas2svg'
import FileSaver from 'file-saver'

import drawBackground from '../utils/draw-background'

/* global Blob */

export default class SVGCanvas {
  constructor (width, height, canvas) {
    if (!width || !height) {
      throw new Error('You must specify a width and a height')
    }

    this.width = width
    this.height = height
    this.canvas = canvas

    if (this.canvas) {
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.canvas.style.width = this.width + 'px'
      this.canvas.style.height = this.height + 'px'
    }

    this.ctx = this.canvas
      ? this.canvas.getContext('2d')
      : new Canvas(width, height)
    this.ctx.isSVGCompatible = !this.canvas

    // NOTE: canvas2svg uses context[save|restore] to handle svg grouping
    // Theses aliases are designed to improve code readability
    this.ctx.beginSVGGroup = this.ctx.save
    this.ctx.endSVGGroup = this.ctx.restore
    this.ctx.group = fn => {
      this.ctx.beginSVGGroup()
      fn()
      this.ctx.endSVGGroup()
    }
  }

  get svg () { return this.ctx.getSvg() }
  get serializedSvg () { return this.ctx.getSerializedSvg(true) }

  async toBlob () {
    return this.ctx.isSVGCompatible
      ? new Blob([this.serializedSvg], { type: 'image/svg+xml;charset=utf-8' })
      : new Promise(resolve => this.canvas.toBlob(resolve, 'image/png'))
  }

  didMount () {}

  mount (parent, sibling = null) {
    if (!parent || this.mounted) return

    this.parent = parent
    this.el = this.canvas || this.svg

    if (sibling) this.parent.insertBefore(this.el, sibling)
    else this.parent.appendChild(this.el)

    this.mounted = true
    this.didMount(this.el)
  }

  background (color) {
    drawBackground(0, 0, this.width, this.height, { color, ctx: this.ctx })
  }

  update () {
    if (!this.mounted) return

    this.prevEl = this.el
    this.el = this.svg
    this.parent.replaceChild(this.el, this.prevEl)
  }

  copy (canvas = document.createElement('canvas')) {
    canvas.width = this.width
    canvas.height = this.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(this.canvas, 0, 0)
    return canvas
  }

  clear () {
    if (!this.mounted) return
    this.el.querySelector('g').innerHTML = ''
  }

  async save (filename = Date.now()) {
    const blob = await this.toBlob()
    return FileSaver.saveAs(blob, filename)
  }
}
