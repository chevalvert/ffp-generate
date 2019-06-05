import SVGCanvas from '../abstractions/SVGCanvas'

export default class Landscape extends SVGCanvas {
  constructor (grounds, {
    canvas = null,
    backgroundColor = 'transparent'
  } = {}) {
    super(grounds[0].width, grounds[0].height, canvas)

    this.backgroundColor = backgroundColor
    this.grounds = grounds
  }

  get grounds () { return this._grounds }
  set grounds (grounds) {
    let foregrounds = []
    this._grounds = grounds.map((ground, index) => {
      ground.setBehind(foregrounds)
      if (ground.isEmpty) return null

      foregrounds.push(ground)

      if (!this.ctx.isSVG) {
        ground.createSprite(this.ctx)
      }

      return ground
    }).filter(Boolean)
  }

  render (ctx = this.ctx) {
    super.background(this.backgroundColor)

    this.grounds.forEach((ground, index) => {
      if (ground.sprite) ctx.drawImage(ground.sprite, 0, 0)
      else ground.render(ctx)
    })

    return this
  }

  ensureSVGContext () {
    return this.ctx.isSVG
      ? this
      : new Landscape(this.grounds, {
        canvas: null,
        backgroundColor: this.backgroundColor
      }).render()
  }

  save (filename, { type } = {}) {
    return (type === 'image/svg+xml' && !this.ctx.isSVG)
      ? this.ensureSVGContext().save(filename, { type })
      : super.save(filename, { type })
  }
}
