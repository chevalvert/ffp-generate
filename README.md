# `ffp-generate` [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
> JavaScript browser module to generate `ffp` landscapes

<br>

## Installation

```sh
npm install --save chevalvert/ffp-generate
```

## Usage

```js
import { Landscape, Colors, prng } from 'ffp-generate'
import render from 'ffp-generate/render'
import { erode } from 'ffp-generate/post-processing'

const colors = Colors.swatch()
// Array of cloned { rgb: [255, 255, 255], cmyk: [100, 100, 100, 100], css: 'rgb(255, 255, 255)', css-cmyk-proof: 'rgb(255, 255, 255)' }

const landscape = new Landscape({ colors, ...options })

// Render inside a canvas
const canvas = document.getElementById('myCanvas')
render.canvas(landscape, canvas, { colorSpace: 'css' })

// Render as SVG
const svgElement = render.svg(landscape, { colorSpace: 'css' })
document.body.appendChild(svgElement)

```
<sup>See [`example/`](example/index.html) for a complete usage.</sup>

## Development
```console
$ npm install             # install all npm dependencies
$ npm run example:serve   # start the dev server with livereload on the example folder
$ npm run example:deploy  # deploy your example folder on a gh-page branch
$ npm run test            # lint your js inside the lib folder
```

## License
[MIT.](https://tldrlegal.com/license/mit-license)
