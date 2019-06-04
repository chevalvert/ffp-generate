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

  async toBlob (type) {
    if (!type) type = this.ctx.isSVGCompatible ? 'image/svg+xml' : 'image/png'

    if (!SVGCanvas.isSupportedMimeType(type)) {
      throw new Error(`Invalid or unsupported mime type.\nSupported mime types are: ${SVGCanvas.SUPPORTED_MIME_TYPES}`)
    }

    if (type === 'image/svg+xml' && !this.ctx.isSVGCompatible) {
      throw new Error(`image/svg+xml mime type is not compatible with the current context.`)
    }

    return (type === 'image/svg+xml')
      ? new Blob([this.serializedSvg], { type: 'image/svg+xml;charset=utf-8' })
      : new Promise(resolve => this.canvas.toBlob(resolve, type))
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

  static get SUPPORTED_MIME_TYPES () {
    return [
      'image/png',
      'image/jpeg',
      'image/svg+xml'
    ]
  }

  static isSupportedMimeType (type) {
    return SVGCanvas.SUPPORTED_MIME_TYPES.includes(type)
  }

  async save (filename = Date.now(), { type = 'image/png' } = {}) {
    if (!SVGCanvas.isSupportedMimeType(type)) {
      throw new Error(`Invalid or unsupported mime type.\nSupported mime types are: ${SVGCanvas.SUPPORTED_MIME_TYPES}`)
    }

    const blob = await this.toBlob(type)
    return FileSaver.saveAs(blob, filename)
  }
}
