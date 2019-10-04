# `ffp-generate` [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
> JavaScript browser module to generate `ffp` landscapes

<br>

## Installation

```sh
npm install --save chevalvert/ffp-generate
```

## Usage

### How to import 

###### in a module bundler

```js
import ffp from 'ffp-generate'
ffp.generate(opts)
```

###### in a browser

```html
<script src="https://unpkg.com/ffp-generate"></script>
<script>
  window.ffp.generate(opts)
</script>
```

### How to use

See [`example/`](example/index.html).

## Development
```console
$ npm install     # install all npm dependencies
$ npm run start   # start the dev server with livereload on the example folder
$ npm run build   # bundle your library in CJS / UMD / ESM
$ npm run deploy  # deploy your example folder on a gh-page branch
$ npm run test    # lint your js inside the src folder
``` 

## License
[MIT.](https://tldrlegal.com/license/mit-license)
