# `ffp-generate` [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
> JavaScript browser module to generate `ffp` landscapes

<br>

## Installation

```sh
npm install --save chevalvert/ffp-generate
```

## Usage

```js
import { Landscape, SWATCHES, prng } from 'ffp-generate'
import render from 'ffp-generate/render'

const landscape = new Landscape(options)

// Render inside a canvas
const canvas = document.getElementById('myCanvas')
render.canvas(landscape, canvas)

// Render as SVG
const svgElement = render.svg(landscape)
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
