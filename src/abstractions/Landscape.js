import Ground from '../abstractions/Ground'
import SVGCanvas from '../abstractions/SVGCanvas'

export default class Landscape extends SVGCanvas {
  constructor ({
    width,
    height,
    canvas,
    groupGroundTogether = true,
    backgroundColor = 'transparent'
  } = {}) {
    super(width, height, canvas)
    this.backgroundColor = backgroundColor
    this.groupGroundTogether = groupGroundTogether
    this.grounds = []
  }

  static from (grounds, { backgroundColor, canvas, groupGroundTogether } = {}) {
    const landscape = new Landscape({
      width: grounds[0].width,
      height: grounds[0].height,
      backgroundColor,
      groupGroundTogether,
      canvas
    })

    landscape.grounds = grounds

    return landscape
  }

  render (ctx = this.ctx) {
    super.background(this.backgroundColor)

    let renderedGrounds = []
    this.grounds.forEach(ground => {
      ground.behind(renderedGrounds)

      ground.render(ctx)
      renderedGrounds.push(ground)
    })

    return this
  }

  makeGround ({ line, gradient, pattern }) {
    this.grounds.push(new Ground({
      width: this.width,
      height: this.height,
      unit: this.unit,
      line,
      gradient,
      pattern
    }))
  }

  ensureSVGContext () {
    return this.ctx.isSVGCompatible
      ? this
      : Landscape.from(this.grounds, {
        backgroundColor: this.backgroundColor,
        groupGroundTogether: this.groupGroundTogether
      }).render()
  }

  save (filename, { type } = {}) {
    return (type === 'image/svg+xml' && !this.ctx.isSVGCompatible)
      ? this.ensureSVGContext().save(filename, { type })
      : super.save(filename, { type })
  }
}
