(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    it = o[Symbol.iterator]();
    return it.next.bind(it);
  }

  var lineclip_1 = lineclip;

  lineclip.polyline = lineclip;
  lineclip.polygon = polygonclip;


  // Cohen-Sutherland line clippign algorithm, adapted to efficiently
  // handle polylines rather than just segments

  function lineclip(points, bbox, result) {

      var len = points.length,
          codeA = bitCode(points[0], bbox),
          part = [],
          i, a, b, codeB, lastCode;

      if (!result) result = [];

      for (i = 1; i < len; i++) {
          a = points[i - 1];
          b = points[i];
          codeB = lastCode = bitCode(b, bbox);

          while (true) {

              if (!(codeA | codeB)) { // accept
                  part.push(a);

                  if (codeB !== lastCode) { // segment went outside
                      part.push(b);

                      if (i < len - 1) { // start a new line
                          result.push(part);
                          part = [];
                      }
                  } else if (i === len - 1) {
                      part.push(b);
                  }
                  break;

              } else if (codeA & codeB) { // trivial reject
                  break;

              } else if (codeA) { // a outside, intersect with clip edge
                  a = intersect(a, b, codeA, bbox);
                  codeA = bitCode(a, bbox);

              } else { // b outside
                  b = intersect(a, b, codeB, bbox);
                  codeB = bitCode(b, bbox);
              }
          }

          codeA = lastCode;
      }

      if (part.length) result.push(part);

      return result;
  }

  // Sutherland-Hodgeman polygon clipping algorithm

  function polygonclip(points, bbox) {

      var result, edge, prev, prevInside, i, p, inside;

      // clip against each side of the clip rectangle
      for (edge = 1; edge <= 8; edge *= 2) {
          result = [];
          prev = points[points.length - 1];
          prevInside = !(bitCode(prev, bbox) & edge);

          for (i = 0; i < points.length; i++) {
              p = points[i];
              inside = !(bitCode(p, bbox) & edge);

              // if segment goes through the clip window, add an intersection
              if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));

              if (inside) result.push(p); // add a point if it's inside

              prev = p;
              prevInside = inside;
          }

          points = result;

          if (!points.length) break;
      }

      return result;
  }

  // intersect a segment against one of the 4 lines that make up the bbox

  function intersect(a, b, edge, bbox) {
      return edge & 8 ? [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]] : // top
             edge & 4 ? [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]] : // bottom
             edge & 2 ? [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])] : // right
             edge & 1 ? [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])] : // left
             null;
  }

  // bit code reflects the point position relative to the bbox:

  //         left  mid  right
  //    top  1001  1000  1010
  //    mid  0001  0000  0010
  // bottom  0101  0100  0110

  function bitCode(p, bbox) {
      var code = 0;

      if (p[0] < bbox[0]) code |= 1; // left
      else if (p[0] > bbox[2]) code |= 2; // right

      if (p[1] < bbox[1]) code |= 4; // bottom
      else if (p[1] > bbox[3]) code |= 8; // top

      return code;
  }

  function n(n,t,r){return Math.max(t,Math.min(n,r))}function t(n,t,o,u){return void 0===u&&(u=!1),r(n,t,o,0,1,u)}function r(t,r,o,u,i,a){void 0===a&&(a=!1);var e=(t-r)*(i-u)/(o-r)+u;return a?n(e,u,i):e}function o(n,t,r){return n+r*(t-n)}function e(n){return n*Math.PI/180}function f(n,t){return Math.ceil(n/t)*t}

  var steps = function steps(size, step) {
    return size / step;
  };

  var SYMBOLS = {
    empty: function empty() {
      return null;
    },
    square: function square(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24));
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x + hs - ht, cell.y + hs - ht], [cell.x + hs - ht, cell.y + hs + ht], [cell.x + hs + ht, cell.y + hs + ht], [cell.x + hs + ht, cell.y + hs - ht]];
    },
    square_offset: function square_offset(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24)) - 10;
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x + hs - ht, cell.y + hs - ht], [cell.x + hs - ht, cell.y + hs + ht], [cell.x + hs + ht, cell.y + hs + ht], [cell.x + hs + ht, cell.y + hs - ht]];
    },
    vertical_line: function vertical_line(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24));
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x + hs - ht, cell.y], [cell.x + hs - ht, cell.y + cell.size], [cell.x + hs + ht, cell.y + cell.size], [cell.x + hs + ht, cell.y]];
    },
    vertical_line_offset: function vertical_line_offset(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24)) - 10;
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x + hs - ht, cell.y], [cell.x + hs - ht, cell.y + cell.size], [cell.x + hs + ht, cell.y + cell.size], [cell.x + hs + ht, cell.y]];
    },
    horizontal_line: function horizontal_line(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24));
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x, cell.y + hs - ht], [cell.x, cell.y + hs + ht], [cell.x + cell.size, cell.y + hs + ht], [cell.x + cell.size, cell.y + hs - ht]];
    },
    horizontal_line_offset: function horizontal_line_offset(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24)) - 10;
      if (thickness < 0) return;
      var ht = thickness / 2;
      var hs = cell.size / 2;
      return [[cell.x, cell.y + hs - ht], [cell.x, cell.y + hs + ht], [cell.x + cell.size, cell.y + hs + ht], [cell.x + cell.size, cell.y + hs - ht]];
    },
    diagonal: function diagonal(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24));
      if (thickness < 0) return;
      return [[cell.x + cell.size - thickness, cell.y], [cell.x + cell.size, cell.y], [cell.x + thickness, cell.y + cell.size], [cell.x, cell.y + cell.size]];
    },
    diamond: function diamond(cell) {
      var thickness = f(cell.size * cell.value, steps(cell.size, 24)) - 1;
      if (thickness < 0) return;
      return lineclip_1.polygon([[cell.x + cell.size / 2, cell.y + thickness], [cell.x + cell.size - thickness, cell.y + cell.size / 2], [cell.x + cell.size / 2, cell.y + cell.size - thickness], [cell.x + thickness, cell.y + cell.size / 2]], [cell.x, cell.y, cell.x + cell.size, cell.y + cell.size]);
    },
    circle: function circle(cell) {
      var diameter = f((cell.size - 1) * cell.value, steps(cell.size, 24));
      if (diameter < 0) return;
      var path = [];

      for (var alpha = 0; alpha < 360; alpha += 360 / 36) {
        var theta = e(alpha);
        path.push([cell.x + cell.size / 2 + Math.sin(theta) * diameter, cell.y + cell.size / 2 + Math.cos(theta) * diameter]);
      }

      return lineclip_1.polygon(path, [cell.x, cell.y, cell.x + cell.size, cell.y + cell.size]);
    }
  };

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire();
      }
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var stringify_1 = createCommonjsModule(function (module, exports) {
  exports = module.exports = stringify;
  exports.getSerialize = serializer;

  function stringify(obj, replacer, spaces, cycleReplacer) {
    return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
  }

  function serializer(replacer, cycleReplacer) {
    var stack = [], keys = [];

    if (cycleReplacer == null) cycleReplacer = function(key, value) {
      if (stack[0] === value) return "[Circular ~]"
      return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    };

    return function(key, value) {
      if (stack.length > 0) {
        var thisPos = stack.indexOf(this);
        ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
        ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
        if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
      }
      else stack.push(value);

      return replacer == null ? value : replacer.call(this, key, value)
    }
  }
  });

  /*	============================================================================
  This is based upon Johannes Baagoe's carefully designed and efficient hash
  function for use with JavaScript.  It has a proven "avalanche" effect such
  that every bit of the input affects every bit of the output 50% of the time,
  which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
  ============================================================================
  */
  var Mash = function () {
  	var n = 0xefc8249d;
  	var mash = function (data) {
  		if (data) {
  			data = data.toString();
  			for (var i = 0; i < data.length; i++) {
  				n += data.charCodeAt(i);
  				var h = 0.02519603282416938 * n;
  				n = h >>> 0;
  				h -= n;
  				h *= n;
  				n = h >>> 0;
  				h -= n;
  				n += h * 0x100000000; // 2^32
  			}
  			return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  		} else {
  			n = 0xefc8249d;
  		}
  	};
  	return mash;
  };

  var uheprng = function (seed) {
  	return (function () {
  		var o = 48; // set the 'order' number of ENTROPY-holding 32-bit values
  		var c = 1; // init the 'carry' used by the multiply-with-carry (MWC) algorithm
  		var p = o; // init the 'phase' (max-1) of the intermediate variable pointer
  		var s = new Array(o); // declare our intermediate variables array
  		var i; // general purpose local
  		var j; // general purpose local
  		var k = 0; // general purpose local

  		// when our "uheprng" is initially invoked our PRNG state is initialized from the
  		// browser's own local PRNG. This is okay since although its generator might not
  		// be wonderful, it's useful for establishing large startup entropy for our usage.
  		var mash = new Mash(); // get a pointer to our high-performance "Mash" hash

  		// fill the array with initial mash hash values
  		for (i = 0; i < o; i++) {
  			s[i] = mash(Math.random());
  		}

  		// this PRIVATE (internal access only) function is the heart of the multiply-with-carry
  		// (MWC) PRNG algorithm. When called it returns a pseudo-random number in the form of a
  		// 32-bit JavaScript fraction (0.0 to <1.0) it is a PRIVATE function used by the default
  		// [0-1] return function, and by the random 'string(n)' function which returns 'n'
  		// characters from 33 to 126.
  		var rawprng = function () {
  			if (++p >= o) {
  				p = 0;
  			}
  			var t = 1768863 * s[p] + c * 2.3283064365386963e-10; // 2^-32
  			return s[p] = t - (c = t | 0);
  		};

  		// this EXPORTED function is the default function returned by this library.
  		// The values returned are integers in the range from 0 to range-1. We first
  		// obtain two 32-bit fractions (from rawprng) to synthesize a single high
  		// resolution 53-bit prng (0 to <1), then we multiply this by the caller's
  		// "range" param and take the "floor" to return a equally probable integer.
  		var random = function (range) {
  			return Math.floor(range * (rawprng() + (rawprng() * 0x200000 | 0) * 1.1102230246251565e-16)); // 2^-53
  		};

  		// this EXPORTED function 'string(n)' returns a pseudo-random string of
  		// 'n' printable characters ranging from chr(33) to chr(126) inclusive.
  		random.string = function (count) {
  			var i;
  			var s = '';
  			for (i = 0; i < count; i++) {
  				s += String.fromCharCode(33 + random(94));
  			}
  			return s;
  		};

  		// this PRIVATE "hash" function is used to evolve the generator's internal
  		// entropy state. It is also called by the EXPORTED addEntropy() function
  		// which is used to pour entropy into the PRNG.
  		var hash = function () {
  			var args = Array.prototype.slice.call(arguments);
  			for (i = 0; i < args.length; i++) {
  				for (j = 0; j < o; j++) {
  					s[j] -= mash(args[i]);
  					if (s[j] < 0) {
  						s[j] += 1;
  					}
  				}
  			}
  		};

  		// this EXPORTED "clean string" function removes leading and trailing spaces and non-printing
  		// control characters, including any embedded carriage-return (CR) and line-feed (LF) characters,
  		// from any string it is handed. this is also used by the 'hashstring' function (below) to help
  		// users always obtain the same EFFECTIVE uheprng seeding key.
  		random.cleanString = function (inStr) {
  			inStr = inStr.replace(/(^\s*)|(\s*$)/gi, ''); // remove any/all leading spaces
  			inStr = inStr.replace(/[\x00-\x1F]/gi, ''); // remove any/all control characters
  			inStr = inStr.replace(/\n /, '\n'); // remove any/all trailing spaces
  			return inStr; // return the cleaned up result
  		};

  		// this EXPORTED "hash string" function hashes the provided character string after first removing
  		// any leading or trailing spaces and ignoring any embedded carriage returns (CR) or Line Feeds (LF)
  		random.hashString = function (inStr) {
  			inStr = random.cleanString(inStr);
  			mash(inStr); // use the string to evolve the 'mash' state
  			for (i = 0; i < inStr.length; i++) { // scan through the characters in our string
  				k = inStr.charCodeAt(i); // get the character code at the location
  				for (j = 0; j < o; j++) { //	"mash" it into the UHEPRNG state
  					s[j] -= mash(k);
  					if (s[j] < 0) {
  						s[j] += 1;
  					}
  				}
  			}
  		};

  		// this EXPORTED function allows you to seed the random generator.
  		random.seed = function (seed) {
  			if (typeof seed === 'undefined' || seed === null) {
  				seed = Math.random();
  			}
  			if (typeof seed !== 'string') {
  				seed = stringify_1(seed, function (key, value) {
  					if (typeof value === 'function') {
  						return (value).toString();
  					}
  					return value;
  				});
  			}
  			random.initState();
  			random.hashString(seed);
  		};

  		// this handy exported function is used to add entropy to our uheprng at any time
  		random.addEntropy = function ( /* accept zero or more arguments */ ) {
  			var args = [];
  			for (i = 0; i < arguments.length; i++) {
  				args.push(arguments[i]);
  			}
  			hash((k++) + (new Date().getTime()) + args.join('') + Math.random());
  		};

  		// if we want to provide a deterministic startup context for our PRNG,
  		// but without directly setting the internal state variables, this allows
  		// us to initialize the mash hash and PRNG's internal state before providing
  		// some hashing input
  		random.initState = function () {
  			mash(); // pass a null arg to force mash hash to init
  			for (i = 0; i < o; i++) {
  				s[i] = mash(' '); // fill the array with initial mash hash values
  			}
  			c = 1; // init our multiply-with-carry carry
  			p = o; // init our phase
  		};

  		// we use this (optional) exported function to signal the JavaScript interpreter
  		// that we're finished using the "Mash" hash function so that it can free up the
  		// local "instance variables" is will have been maintaining.  It's not strictly
  		// necessary, of course, but it's good JavaScript citizenship.
  		random.done = function () {
  			mash = null;
  		};

  		// if we called "uheprng" with a seed value, then execute random.seed() before returning
  		if (typeof seed !== 'undefined') {
  			random.seed(seed);
  		}

  		// Returns a random integer between 0 (inclusive) and range (exclusive)
  		random.range = function (range) {
  			return random(range);
  		};

  		// Returns a random float between 0 (inclusive) and 1 (exclusive)
  		random.random = function () {
  			return random(Number.MAX_VALUE - 1) / Number.MAX_VALUE;
  		};

  		// Returns a random float between min (inclusive) and max (exclusive)
  		random.floatBetween = function (min, max) {
  			return random.random() * (max - min) + min;
  		};

  		// Returns a random integer between min (inclusive) and max (inclusive)
  		random.intBetween = function (min, max) {
  			return Math.floor(random.random() * (max - min + 1)) + min;
  		};

  		// when our main outer "uheprng" function is called, after setting up our
  		// initial variables and entropic state, we return an "instance pointer"
  		// to the internal anonymous function which can then be used to access
  		// the uheprng's various exported functions.  As with the ".done" function
  		// above, we should set the returned value to 'null' once we're finished
  		// using any of these functions.
  		return random;
  	}());
  };

  // Modification for use in node:
  uheprng.create = function (seed) {
  	return new uheprng(seed);
  };
  var randomSeed = uheprng;

  class Noise {
    constructor (s) {
      this.p = new Uint8Array(512);
      this.seed(s);
    }

    gen () {}

    seed (s) {
      const rng = randomSeed.create(s || Math.random());

      for (let i = 0; i < 256; i++) this.p[i] = i;
      for (let i = 0; i < 256; i++) {
        const r = rng(256);
        const temp = this.p[i];
        this.p[i] = this.p[r];
        this.p[r] = temp;
      }
      for (let i = 0; i < 256; i++) this.p[i + 256] = this.p[i];
    }

    transform (fn) {
      const transformedFn = (...dims) => fn.apply(this, dims);

      return transformedFn.bind(this)
    }

    octavate (...args) {
      const octaves = args[0];
      const dims = args.slice(1);
      let val = 0;
      let max = 0;

      for (let i = 0; i < octaves; i++) {
        const w = 1 << i;
        val += this.gen.apply(this, dims.map(x => x * w)) / w;
      }

      for (let i = 0; i < octaves; i++) {
        max += 1 / (1 << i);
      }

      return val / max
    }
  }

  var noise = Noise;

  class Vec1 {
    constructor (x) {
      this.x = x;
    }

    dot (x) {
      return this.x * x
    }
  }

  const g1 = [ new Vec1(1), new Vec1(-1) ];

  function grad1 (p, x) {
    return g1[p[x] % g1.length]
  }

  var _1d = {
    grad1
  };

  function falloff (...args) {
    const dims = args.slice(1);
    const t = args[0] - dims.reduce((sum, val) => {
      return sum + val * val
    }, 0);

    return t * t * t * t
  }

  function lerp (a, b, t) {
    return a * (1 - t) + b * t
  }
  function fade (t) {
    return t * t * t * (10 + t * (-15 + t * 6))
  }
  const cut1 = falloff.bind(null, 1);
  const cut = falloff.bind(null, 0.5);

  var math = {
    lerp,
    fade,
    cut1,
    cut
  };

  const { grad1: grad1$1 } = _1d;
  const { cut1: cut1$1 } = math;

  class Simplex1 extends noise {
    gen (x) {
      const gx = Math.floor(x) % 256;
      const dx = x - gx;

      const n0 = cut1$1(dx) * grad1$1(this.p, gx).dot(dx);
      const n1 = cut1$1(dx - 1) * grad1$1(this.p, gx + 1).dot(dx - 1);

      return 0.5 * (n0 + n1)
    }
  }

  var simplex1 = Simplex1;

  class Vec2 {
    constructor (x, y) {
      this.x = x;
      this.y = y;
    }

    dot (x, y) {
      return this.x * x + this.y * y
    }
  }

  const g2 = [
    new Vec2(1, 0), new Vec2(1, 1), new Vec2(0, 1), new Vec2(-1, 1),
    new Vec2(-1, 0), new Vec2(-1, -1), new Vec2(0, -1), new Vec2(1, -1)
  ];

  function grad2 (p, x, y) {
    const hash = p[x + p[y]] % g2.length;
    return g2[hash]
  }
  const S2_TO_C = 0.5 * (Math.sqrt(3) - 1);
  const C_TO_S2 = (3 - Math.sqrt(3)) / 6;

  var _2d = {
    grad2,
    S2_TO_C,
    C_TO_S2
  };

  const { grad2: grad2$1, S2_TO_C: S2_TO_C$1, C_TO_S2: C_TO_S2$1 } = _2d;
  const { cut: cut$1 } = math;

  class Simplex2 extends noise {
    gen (x, y) {
      const skew = (x + y) * S2_TO_C$1;
      const i = Math.trunc(x + skew);
      const j = Math.trunc(y + skew);

      const unskew = (i + j) * C_TO_S2$1;
      const gx = i - unskew;
      const gy = j - unskew;

      const dx0 = x - gx;
      const dy0 = y - gy;

      const di = dx0 > dy0 ? 1 : 0;
      const dj = dx0 > dy0 ? 0 : 1;

      const dx1 = dx0 - di + C_TO_S2$1;
      const dy1 = dy0 - dj + C_TO_S2$1;
      const dx2 = dx0 - 1 + 2 * C_TO_S2$1;
      const dy2 = dy0 - 1 + 2 * C_TO_S2$1;

      const n0 = cut$1(dx0, dy0) * grad2$1(this.p, i, j).dot(dx0, dy0);
      const n1 = cut$1(dx1, dy1) * grad2$1(this.p, i + di, j + dj).dot(dx1, dy1);
      const n2 = cut$1(dx2, dy2) * grad2$1(this.p, i + 1, j + 1).dot(dx2, dy2);

      return 70 * (n0 + n1 + n2)
    }
  }

  var simplex2 = Simplex2;

  const { grad1: grad1$2 } = _1d;
  const { lerp: lerp$1, fade: fade$1 } = math;

  class Perlin1 extends noise {
    gen (x) {
      const gx = Math.floor(x) % 256;
      const dx = x - gx;

      const n0 = grad1$2(this.p, gx).dot(dx);
      const n1 = grad1$2(this.p, gx + 1).dot(dx - 1);

      return lerp$1(n0, n1, fade$1(dx))
    }
  }

  var perlin1 = Perlin1;

  const { grad2: grad2$2 } = _2d;
  const { fade: fade$2, lerp: lerp$2 } = math;

  class Perlin2 extends noise {
    gen (x, y) {
      const gx = Math.trunc(x) % 256;
      const gy = Math.trunc(y) % 256;

      const dx = x - gx;
      const dy = y - gy;

      const n00 = grad2$2(this.p, gx, gy).dot(dx, dy);
      const n10 = grad2$2(this.p, gx + 1, gy).dot(dx - 1, dy);
      const n01 = grad2$2(this.p, gx, gy + 1).dot(dx, dy - 1);
      const n11 = grad2$2(this.p, gx + 1, gy + 1).dot(dx - 1, dy - 1);

      return lerp$2(
        lerp$2(n00, n10, fade$2(dx)),
        lerp$2(n01, n11, fade$2(dx)),
        fade$2(dy)
      )
    }
  }

  var perlin2 = Perlin2;

  class Vec3 {
    constructor (x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    dot (x, y, z) {
      return this.x * x + this.y * y + this.z * z
    }
  }

  const g3 = [
    new Vec3(1, 1, 1), new Vec3(-1, 1, 1), new Vec3(1, -1, 1), new Vec3(-1, -1, 1),
    new Vec3(1, 1, 0), new Vec3(-1, 1, 0), new Vec3(1, -1, 0), new Vec3(-1, -1, 0),
    new Vec3(1, 1, -1), new Vec3(-1, 1, -1), new Vec3(1, -1, -1), new Vec3(-1, -1, -1)
  ];

  function grad3 (p, x, y, z) {
    const hash = p[x + p[y + p[z]]] % g3.length;
    return g3[hash]
  }

  var _3d = {
    grad3
  };

  const { grad3: grad3$1 } = _3d;
  const { fade: fade$3, lerp: lerp$3 } = math;

  class Perlin3 extends noise {
    gen (x, y, z) {
      const gx = Math.trunc(x) % 256;
      const gy = Math.trunc(y) % 256;
      const gz = Math.trunc(z) % 256;

      const dx = x - gx;
      const dy = y - gy;
      const dz = z - gz;

      const n000 = grad3$1(this.p, gx, gy, gz).dot(dx, dy, dz);
      const n100 = grad3$1(this.p, gx + 1, gy, gz).dot(dx - 1, dy, dz);
      const n010 = grad3$1(this.p, gx, gy + 1, gz).dot(dx, dy - 1, dz);
      const n110 = grad3$1(this.p, gx + 1, gy + 1, gz).dot(dx - 1, dy - 1, dz);
      const n001 = grad3$1(this.p, gx, gy, gz + 1).dot(dx, dy, dz - 1);
      const n101 = grad3$1(this.p, gx + 1, gy, gz + 1).dot(dx - 1, dy, dz - 1);
      const n011 = grad3$1(this.p, gx, gy + 1, gz + 1).dot(dx, dy - 1, dz - 1);
      const n111 = grad3$1(this.p, gx + 1, gy + 1, gz + 1).dot(dx - 1, dy - 1, dz - 1);

      return lerp$3(
        lerp$3(
          lerp$3(n000, n100, dx),
          lerp$3(n010, n110, dx),
          fade$3(dy)
        ),
        lerp$3(
          lerp$3(n001, n101, dx),
          lerp$3(n011, n111, dx),
          fade$3(dy)
        ),
        fade$3(dz)
      )
    }
  }

  var perlin3 = Perlin3;

  class Vec4 {
    constructor (x, y, z, t) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.t = t;
    }

    dot (x, y, z, t) {
      return this.x * x + this.y * y + this.z * z + this.t * t
    }
  }

  const g4 = [
    new Vec4(0, 1, 1, 1), new Vec4(0, 1, 1, -1), new Vec4(0, 1, -1, 1), new Vec4(0, 1, -1, -1),
    new Vec4(0, -1, 1, 1), new Vec4(0, -1, 1, -1), new Vec4(0, -1, -1, 1), new Vec4(0, -1, -1, -1),
    new Vec4(1, 0, 1, 1), new Vec4(1, 0, 1, -1), new Vec4(1, 0, -1, 1), new Vec4(1, 0, -1, -1),
    new Vec4(-1, 0, 1, 1), new Vec4(-1, 0, 1, -1), new Vec4(-1, 0, -1, 1), new Vec4(-1, 0, -1, -1),
    new Vec4(1, 1, 0, 1), new Vec4(1, 1, 0, -1), new Vec4(1, -1, 0, 1), new Vec4(1, -1, 0, -1),
    new Vec4(-1, 1, 0, 1), new Vec4(-1, 1, 0, -1), new Vec4(-1, -1, 0, 1), new Vec4(-1, -1, 0, -1),
    new Vec4(1, 1, 1, 0), new Vec4(1, 1, -1, 0), new Vec4(1, -1, 1, 0), new Vec4(1, -1, -1, 0),
    new Vec4(-1, 1, 1, 0), new Vec4(-1, 1, -1, 0), new Vec4(-1, -1, 1, 0), new Vec4(-1, -1, -1, 0)
  ];

  function grad4 (p, x, y, z, t) {
    const hash = p[x + p[y + p[z + p[t]]]] % g4.length;
    return g4[hash]
  }

  var _4d = {
    grad4
  };

  const { grad4: grad4$1 } = _4d;
  const { fade: fade$4, lerp: lerp$4 } = math;

  class Perlin4 extends noise {
    gen (x, y, z, t) {
      const gx = Math.trunc(x) % 256;
      const gy = Math.trunc(y) % 256;
      const gz = Math.trunc(z) % 256;
      const gt = Math.trunc(t) % 256;

      const dx = x - gx;
      const dy = y - gy;
      const dz = z - gz;
      const dt = t - gt;

      const n0000 = grad4$1(this.p, gx, gy, gz, gt).dot(dx, dy, dz, dt);
      const n1000 = grad4$1(this.p, gx + 1, gy, gz, gt).dot(dx - 1, dy, dz);
      const n0100 = grad4$1(this.p, gx, gy + 1, gz, gt).dot(dx, dy - 1, dz);
      const n1100 = grad4$1(this.p, gx + 1, gy + 1, gz, gt).dot(dx - 1, dy - 1, dz);
      const n0010 = grad4$1(this.p, gx, gy, gz + 1, gt).dot(dx, dy, dz - 1);
      const n1010 = grad4$1(this.p, gx + 1, gy, gz + 1, gt).dot(dx - 1, dy, dz - 1);
      const n0110 = grad4$1(this.p, gx, gy + 1, gz + 1, gt).dot(dx, dy - 1, dz - 1);
      const n1110 = grad4$1(this.p, gx + 1, gy + 1, gz + 1, gt).dot(dx - 1, dy - 1, dz - 1);
      const n0001 = grad4$1(this.p, gx, gy, gz, gt + 1).dot(dx, dy, dz, dt - 1);
      const n1001 = grad4$1(this.p, gx + 1, gy, gz, gt + 1).dot(dx - 1, dy, dz, dt - 1);
      const n0101 = grad4$1(this.p, gx, gy + 1, gz, gt + 1).dot(dx, dy - 1, dz, dt - 1);
      const n1101 = grad4$1(this.p, gx + 1, gy + 1, gz, gt + 1).dot(dx - 1, dy - 1, dz, dt - 1);
      const n0011 = grad4$1(this.p, gx, gy, gz + 1, gt + 1).dot(dx, dy, dz - 1, dt - 1);
      const n1011 = grad4$1(this.p, gx + 1, gy, gz + 1, gt + 1).dot(dx - 1, dy, dz - 1, dt - 1);
      const n0111 = grad4$1(this.p, gx, gy + 1, gz + 1, gt + 1).dot(dx, dy - 1, dz - 1, dt - 1);
      const n1111 = grad4$1(this.p, gx + 1, gy + 1, gz + 1, gt + 1).dot(dx - 1, dy - 1, dz - 1, dt - 1);

      return lerp$4(
        lerp$4(
          lerp$4(
            lerp$4(n0000, n1000, dx),
            lerp$4(n0100, n1100, dx),
            fade$4(dy)
          ),
          lerp$4(
            lerp$4(n0010, n1010, dx),
            lerp$4(n0110, n1110, dx),
            fade$4(dy)
          ),
          fade$4(dz)
        ),
        lerp$4(
          lerp$4(
            lerp$4(n0001, n1001, dx),
            lerp$4(n0101, n1101, dx),
            fade$4(dy)
          ),
          lerp$4(
            lerp$4(n0011, n1011, dx),
            lerp$4(n0111, n1111, dx),
            fade$4(dy)
          ),
          fade$4(dz)
        ),
        fade$4(dt)
      )
    }
  }

  var perlin4 = Perlin4;

  const { lerp: lerp$5, fade: fade$5 } = math;

  function hashN (p, gs) {
    if (gs.length === 1) return p[gs[0]]

    return p[gs[0] + hashN(p, gs.slice(1))]
  }

  class VecN {
    constructor (R) {
      this.R = R;
    }

    dot (R) {
      let val = 0;

      for (let i = 0; i < R.length; i++) {
        val += this.R[i] * R[i];
      }

      return val
    }
  }

  const gN = [];
  function generateGN (dim) {
    for (let i = 0; i < dim * 2; i++) {
      const vec = new Array(dim).fill(0);

      vec[i % dim] = i / dim >= 1 ? 1 : -1;
      gN[i] = new VecN(vec);
    }
  }

  function lerpN (ns, ds) {
    if (ds.length === 1) return lerp$5(ns[0], ns[1], fade$5(ds[0]))

    const ns1 = ns.slice(0, Math.floor(ns.length / 2));
    const ns2 = ns.slice(Math.ceil(ns.length / 2));

    return lerp$5(
      lerpN(ns1, ds.slice(0, ds.length - 1)),
      lerpN(ns2, ds.slice(0, ds.length - 1)),
      fade$5(ds[ds.length - 1])
    )
  }
  function getNs (p, dim, gs, ds) {
    const ns = [];

    if (gN.length === 0) {
      generateGN(dim);
    }

    for (let i = 0; i < (2 << (dim - 1)); i++) {
      const gsPerm = gs.slice();
      const dsPerm = ds.slice();
      let temp = i;

      for (let j = 0; j < dim; j++) {
        if (temp & 1) {
          gsPerm[j] += 1;
          dsPerm[j] -= 1;
        }
        temp = temp >> 1;
      }
      ns[i] = gN[hashN(p, gsPerm) % gN.length].dot(dsPerm);
    }

    return ns
  }

  var nd = {
    lerpN,
    getNs
  };

  const { lerpN: lerpN$1, getNs: getNs$1 } = nd;

  class PerlinN extends noise {
    gen (...args) {
      const gs = [];
      const ds = [];

      for (let i = 0; i < args.length; i++) {
        gs[i] = Math.trunc(args[i]) % 256;
        ds[i] = args[i] - gs[i];
      }

      const ns = getNs$1(this.p, args.length, gs, ds);

      return lerpN$1(ns, ds)
    }
  }

  var perlinN = PerlinN;

  var lib = {
    Simplex1: simplex1,
    Simplex2: simplex2,
    Perlin1: perlin1,
    Perlin2: perlin2,
    Perlin3: perlin3,
    Perlin4: perlin4,
    PerlinN: perlinN
  };

  var tumult = lib;

  var Line = /*#__PURE__*/function () {
    // IMPORTANT: equation() should return a normalized value
    function Line(equation) {
      if (equation === void 0) {
        equation = function equation(x) {
          return 0.5;
        };
      }

      this._equation = equation;
      this.points = [];
    }

    var _proto = Line.prototype;

    _proto.compute = function compute(x, _temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$force = _ref.force,
          force = _ref$force === void 0 ? false : _ref$force;

      if (force || this.points[x] === undefined) {
        this.points[x] = this._equation(x);
      }

      return this.points[x];
    };

    Line.perlin = function perlin(_temp2) {
      var _ref2 = _temp2 === void 0 ? {} : _temp2,
          _ref2$seed = _ref2.seed,
          seed = _ref2$seed === void 0 ? null : _ref2$seed,
          _ref2$octaves = _ref2.octaves,
          octaves = _ref2$octaves === void 0 ? 2 : _ref2$octaves,
          _ref2$lacunarity = _ref2.lacunarity,
          lacunarity = _ref2$lacunarity === void 0 ? 2 : _ref2$lacunarity,
          _ref2$gain = _ref2.gain,
          gain = _ref2$gain === void 0 ? 0.5 : _ref2$gain,
          _ref2$resolution = _ref2.resolution,
          resolution = _ref2$resolution === void 0 ? 32 : _ref2$resolution;

      var noise = new tumult.Perlin1(seed).transform(function (v) {
        return t(this.gen(v / resolution), -1, 1);
      });
      return function (x) {
        var y = 0;
        var amplitude = 0.5;
        var frequency = 1.0;

        for (var i = 0; i < octaves; i++) {
          y += amplitude * noise(frequency * x);
          frequency *= lacunarity;
          amplitude *= gain;
        }

        return Math.sin(y);
      };
    };

    Line.simplex = function simplex(_temp3) {
      var _ref3 = _temp3 === void 0 ? {} : _temp3,
          _ref3$seed = _ref3.seed,
          seed = _ref3$seed === void 0 ? null : _ref3$seed,
          _ref3$octaves = _ref3.octaves,
          octaves = _ref3$octaves === void 0 ? 2 : _ref3$octaves;

      var frequency = Math.pow(2, octaves);
      return new tumult.Simplex1(seed).transform(function (v) {
        return (Math.sin(1 / this.gen(v / frequency)) + 1) / 2;
      });
    };

    return Line;
  }();

  var Gradient = /*#__PURE__*/function () {
    // IMPORTANT: f() should return a normalized value
    function Gradient(f) {
      if (f === void 0) {
        f = function f(x, y, width, height) {
          return 1;
        };
      }

      this.compute = f.bind(this);
    }

    Gradient.normalize = function normalize(x, y, width, height) {
      return [t(x, 0, width), t(y, 0, height)];
    };

    Gradient.simplex = function simplex(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$seed = _ref.seed,
          seed = _ref$seed === void 0 ? null : _ref$seed,
          _ref$octaves = _ref.octaves,
          octaves = _ref$octaves === void 0 ? 2 : _ref$octaves,
          _ref$power = _ref.power,
          power = _ref$power === void 0 ? 1 : _ref$power;

      var frequency = Math.pow(2, octaves);
      var simplex = new tumult.Simplex2(seed);
      return new Gradient(function (x, y, width, height) {
        var _Gradient$normalize = Gradient.normalize(x, y, width, height),
            i = _Gradient$normalize[0],
            j = _Gradient$normalize[1];

        return Math.pow(t(simplex.gen(i / frequency, j / frequency), -1, 1), power);
      });
    };

    Gradient.linear = function linear(alpha) {
      if (alpha === void 0) {
        alpha = 0;
      }

      return new Gradient(function (x, y, width, height) {
        var _Gradient$normalize2 = Gradient.normalize(x, y, width, height),
            i = _Gradient$normalize2[0],
            j = _Gradient$normalize2[1];

        var theta = e(alpha);
        var dirx = o(1 - i, i, (Math.sin(theta) + 1) / 2);
        var diry = o(1 - j, j, (Math.cos(theta) + 1) / 2);
        return (dirx + diry) / 2;
      });
    };

    Gradient.random = function random(rng) {
      if (rng === void 0) {
        rng = Math.random;
      }

      return new Gradient(rng);
    };

    Gradient.fix = function fix(value) {
      if (value === void 0) {
        value = 1;
      }

      return new Gradient(function () {
        return value;
      });
    };

    _createClass(Gradient, null, [{
      key: "methods",
      get: function get() {
        return Object.getOwnPropertyNames(Gradient).filter(function (prop) {
          return prop !== 'methods';
        }).filter(function (prop) {
          return typeof Gradient[prop] === 'function';
        });
      }
    }]);

    return Gradient;
  }();

  function random(seed) {
  	function _seed(s) {
  		if ((seed = (s|0) % 2147483647) <= 0) {
  			seed += 2147483646;
  		}
  	}

  	function _nextInt() {
  		return seed = seed * 48271 % 2147483647;
  	}

  	function _nextFloat() {
  		return (_nextInt() - 1) / 2147483646;
  	}

  	_seed(seed);

  	return {
  		seed: _seed,
  		nextInt: _nextInt,
  		nextFloat: _nextFloat
  	};
  }

  var fastRandom = random;

  var randomOf = (function (arr, rng) {
    if (rng === void 0) {
      rng = Math.random;
    }

    return arr[Math.floor(rng() * arr.length)];
  });

  var seed = Date.now();
  var randomizer = fastRandom(seed);
  var prng = {
    // NOTE: seed must be an integer
    set seed(newSeed) {
      seed = newSeed;
      randomizer = fastRandom(seed);
    },

    get seed() {
      return seed;
    },

    reset: function reset() {
      randomizer = fastRandom(seed);
    },
    random: function random() {
      return randomizer.nextFloat();
    },
    randomOf: function randomOf$1(arr) {
      return randomOf(arr, randomizer.nextFloat);
    },
    randomFloat: function randomFloat(min, max) {
      return randomizer.nextFloat() * (max - min) + min;
    },
    randomInt: function randomInt(min, max) {
      return Math.floor(randomizer.nextFloat() * (max - min) + min);
    }
  };

  var Landscape = /*#__PURE__*/function () {
    function Landscape(props) {
      this.props = Object.assign({
        sizes: [8, 16],
        width: 240,
        height: 240,
        groundsLength: 10,
        percentOfStraightLines: 0.125,
        percentOfGradients: 0.5,
        percentOfSimplexGradients: 0.1,
        swatch: ['rgb(0, 0, 0)'],
        background: 'transparent',
        symbols: ['square', 'square_offset', 'vertical_line', 'vertical_line_offset', 'horizontal_line', 'horizontal_line_offset', 'diagonal', 'diamond', 'circle'],
        random: prng.random
      }, props);
      this.cells = this.generate();
    }

    var _proto = Landscape.prototype;

    // This is the actual procgen part of this project
    _proto.generate = function generate() {
      var _this = this;

      var _this$props = this.props,
          sizes = _this$props.sizes,
          groundsLength = _this$props.groundsLength,
          percentOfStraightLines = _this$props.percentOfStraightLines,
          percentOfGradients = _this$props.percentOfGradients,
          percentOfSimplexGradients = _this$props.percentOfSimplexGradients,
          swatch = _this$props.swatch,
          symbols = _this$props.symbols,
          random = _this$props.random;
      var cells = [];

      var _loop = function _loop(index) {
        var rnd = random() * 100;
        var size = randomOf(sizes, random);
        var color = randomOf(swatch, random);
        var symbol = randomOf(symbols, random);
        var gradient = rnd > percentOfGradients * 100 ? Gradient.fix(random()) : rnd < percentOfSimplexGradients * 100 ? Gradient.simplex({
          seed: rnd
        }) : Gradient.linear(rnd);
        var offy = _this.height * Math.pow(1 - index / groundsLength, random() * 3);
        var line = new Line(function (x) {
          if (rnd < percentOfStraightLines * 100) {
            return offy / _this.height;
          } else {
            var n = Line.perlin({
              seed: rnd,
              octaves: 3,
              resolution: 64,
              lacunarity: 2,
              gain: 0.5
            })(x / (2 + rnd / 100 * 3));
            return offy / _this.height / 2 + n;
          }
        }); // Create cells

        for (var i = 0; i < _this.width / size; i++) {
          var jstart = Math.floor(line.compute(i) * _this.height / size);

          var _loop2 = function _loop2(j) {
            var x = i * size;
            var y = j * size; // Skip cell creation: intersecting with a previously created cell

            var busy = cells.find(function (cell) {
              return cell.x < x + size && cell.x + cell.size > x && cell.y < y + size && cell.y + cell.size > y;
            });
            if (busy) return "continue";
            var value = gradient.compute(x, y, _this.width, _this.height);
            cells.push({
              x: x,
              y: y,
              size: size,
              value: value,
              symbol: symbol,
              color: color,
              ground: index
            });
          };

          for (var j = jstart; j < _this.height / size; j++) {
            var _ret = _loop2(j);

            if (_ret === "continue") continue;
          }
        }
      };

      for (var index = 0; index < groundsLength; index++) {
        _loop(index);
      }

      return cells;
    } // This function allows custom renderer implementation
    // SEE render.js for <svg> and <canvas> implementation of this method
    ;

    _proto.render = function render(callback) {
      for (var _iterator = _createForOfIteratorHelperLoose(this.cells), _step; !(_step = _iterator()).done;) {
        var cell = _step.value;
        // Skip invisible cells
        if (cell.color === this.props.background) continue;
        var path = SYMBOLS[cell.symbol](cell);
        if (path) callback(cell, path);
      }
    };

    _createClass(Landscape, [{
      key: "width",
      get: function get() {
        return this.props.width;
      }
    }, {
      key: "height",
      get: function get() {
        return this.props.height;
      }
    }]);

    return Landscape;
  }();

  /* eslint-disable comma-spacing, indent */

  var swatches = {
    1: ['rgb(120,0,100)', 'rgb(160,15,150)', 'rgb(200,30,200)', 'rgb(255,50,255)', 'rgb(255,90,190)', 'rgb(255,120,140)', 'rgb(255,165,165)', 'rgb(255,215,235)'],
    2: ['rgb(80,20,100)', 'rgb(110,30,130)', 'rgb(140,35,160)', 'rgb(170,40,190)', 'rgb(180,60,255)', 'rgb(190,100,255)', 'rgb(200,150,255)', 'rgb(210,200,255)'],
    3: ['rgb(0,0,90)', 'rgb(0,0,160)', 'rgb(0,0,255)', 'rgb(0,120,255)', 'rgb(60,185,255)', 'rgb(0,200,255)', 'rgb(60,255,255)', 'rgb(220,255,255)'],
    4: ['rgb(0,60,39)', 'rgb(0,90,59)', 'rgb(0,120,90)', 'rgb(0,151,120)', 'rgb(0,181,150)', 'rgb(52,231,200)', 'rgb(116,246,210)', 'rgb(179,254,225)'],
    5: ['rgb(39,75,0)', 'rgb(27,95,15)', 'rgb(14,116,36)', 'rgb(0,170,43)', 'rgb(0,210,63)', 'rgb(0,252,29)', 'rgb(85,253,127)', 'rgb(178,253,157)'],
    6: ['rgb(140,114,0)', 'rgb(180,139,0)', 'rgb(221,179,0)', 'rgb(255,218,0)', 'rgb(255,253,0)', 'rgb(255,249,88)', 'rgb(255,245,155)', 'rgb(255,254,218)'],
    7: ['rgb(101,44,80)', 'rgb(141,58,57)', 'rgb(181,72,30)', 'rgb(201,88,0)', 'rgb(226,113,0)', 'rgb(255,137,0)', 'rgb(255,168,64)', 'rgb(255,199,147)'],
    8: ['rgb(91,4,38)', 'rgb(151,11,57)', 'rgb(197,15,43)', 'rgb(222,18,27)', 'rgb(255,22,6)', 'rgb(255,53,49)', 'rgb(255,118,116)', 'rgb(255,189,189)'],
    9: ['rgb(40,19,0)', 'rgb(71,39,17)', 'rgb(101,59,42)', 'rgb(136,115,99)', 'rgb(175,145,128)', 'rgb(210,179,158)', 'rgb(220,200,179)', 'rgb(236,220,199)'],
    10: ['rgb(28,61,91)', 'rgb(59,100,131)', 'rgb(78,130,161)', 'rgb(98,161,181)', 'rgb(119,170,191)', 'rgb(150,180,201)', 'rgb(169,200,210)', 'rgb(199,220,230)'],
    11: ['rgb(44,18,153)', 'rgb(85,28,202)', 'rgb(109,45,255)', 'rgb(130,82,255)', 'rgb(150,122,255)', 'rgb(160,171,255)', 'rgb(180,206,255)', 'rgb(194,235,255)'],
    12: ['rgb(121,0,100)', 'rgb(161,12,151)', 'rgb(80,20,101)', 'rgb(110,30,131)', 'rgb(90,0,39)', 'rgb(151,0,58)'],
    13: ['rgb(0,3,91)', 'rgb(0,9,162)', 'rgb(45,7,152)', 'rgb(85,26,203)', 'rgb(29,60,91)', 'rgb(59,100,131)'],
    14: ['rgb(0,60,40)', 'rgb(0,90,60)', 'rgb(39,75,0)', 'rgb(28,95,15)', 'rgb(40,19,0)', 'rgb(70,39,17)'],
    15: ['rgb(100,44,80)', 'rgb(141,58,58)', 'rgb(90,0,39)', 'rgb(151,0,58)', 'rgb(140,114,0)', 'rgb(181,139,0)'],
    16: ['rgb(255,164,163)', 'rgb(255,215,235)', 'rgb(200,150,255)', 'rgb(210,200,255)', 'rgb(255,117,116)', 'rgb(255,189,189)'],
    17: ['rgb(48,255,255)', 'rgb(219,255,255)', 'rgb(179,206,255)', 'rgb(194,236,255)', 'rgb(169,200,211)', 'rgb(200,220,231)'],
    18: ['rgb(116,246,210)', 'rgb(178,255,225)', 'rgb(84,255,126)', 'rgb(179,255,157)', 'rgb(220,200,179)', 'rgb(235,220,199)'],
    19: ['rgb(255,117,116)', 'rgb(255,189,189)', 'rgb(255,168,63)', 'rgb(255,199,146)', 'rgb(255,244,155)', 'rgb(255,255,219)'],
    20: ['rgb(255,215,235)', 'rgb(210,200,255)', 'rgb(194,236,255)', 'rgb(219,255,255)', 'rgb(200,220,231)', 'rgb(178,255,225)'],
    21: ['rgb(255,48,255)', 'rgb(181,62,255)', 'rgb(181,62,255)', 'rgb(0,21,255)', 'rgb(98,160,181)', 'rgb(51,231,200)'],
    22: ['rgb(121,0,100)', 'rgb(80,20,101)', 'rgb(45,7,152)', 'rgb(0,3,91)', 'rgb(29,60,91)', 'rgb(0,60,40)'],
    23: ['rgb(178,255,225)', 'rgb(179,255,157)', 'rgb(255,255,219)', 'rgb(255,199,146)', 'rgb(255,189,189)', 'rgb(235,220,199)'],
    24: ['rgb(51,231,200)', 'rgb(0,255,28)', 'rgb(255,254,0)', 'rgb(255,137,0)', 'rgb(255,0,0)', 'rgb(100,59,43)'],
    25: ['rgb(0,60,40)', 'rgb(39,75,0)', 'rgb(140,114,0)', 'rgb(100,44,80)', 'rgb(90,0,39)', 'rgb(40,19,0)'],
    26: ['rgb(15,115,37)', 'rgb(0,170,43)', 'rgb(0,210,63)', 'rgb(255,117,138)', 'rgb(255,164,163)', 'rgb(255,215,235)'],
    27: ['rgb(78,130,161)', 'rgb(98,160,181)', 'rgb(119,170,191)', 'rgb(190,101,255)', 'rgb(200,150,255)', 'rgb(210,200,255)'],
    28: ['rgb(181,73,31)', 'rgb(201,87,0)', 'rgb(226,112,0)', 'rgb(0,221,255)', 'rgb(48,255,255)', 'rgb(219,255,255)'],
    29: ['rgb(100,59,43)', 'rgb(135,114,99)', 'rgb(175,144,129)', 'rgb(8,239,34)', 'rgb(84,255,126)', 'rgb(179,255,157)'],
    30: ['rgb(201,28,202)', 'rgb(255,48,255)', 'rgb(255,87,190)', 'rgb(159,171,255)', 'rgb(179,206,255)', 'rgb(194,236,255)'],
    31: ['rgb(0,120,90)', 'rgb(0,150,120)', 'rgb(0,181,150)', 'rgb(255,53,50)', 'rgb(255,117,116)', 'rgb(255,189,189)'],
    32: ['rgb(221,179,0)', 'rgb(255,219,0)', 'rgb(255,254,0)', 'rgb(51,231,200)', 'rgb(116,246,210)', 'rgb(178,255,225)'],
    33: ['rgb(0,21,255)', 'rgb(0,122,255)', 'rgb(54,186,255)', 'rgb(210,179,158)', 'rgb(220,200,179)', 'rgb(235,220,199)'],
    34: ['rgb(141,35,162)', 'rgb(171,40,192)', 'rgb(181,62,255)', 'rgb(255,137,0)', 'rgb(255,168,63)', 'rgb(255,199,146)'],
    35: ['rgb(196,0,44)', 'rgb(222,0,28)', 'rgb(255,0,0)', 'rgb(149,180,201)', 'rgb(169,200,211)', 'rgb(200,220,231)'],
    36: ['rgb(110,46,255)', 'rgb(130,82,255)', 'rgb(150,121,255)', 'rgb(255,249,88)', 'rgb(255,244,155)', 'rgb(255,255,219)'],
    37: ['rgb(181,73,31)', 'rgb(223,20,42)', 'rgb(227,116,0)', 'rgb(254,65,61)', 'rgb(255,170,69)', 'rgb(255,191,189)'],
    38: ['rgb(221,179,0)', 'rgb(202,91,12)', 'rgb(254,254,0)', 'rgb(255,139,0)', 'rgb(255,244,155)', 'rgb(255,200,149)'],
    39: ['rgb(142,44,163)', 'rgb(130,89,255)', 'rgb(181,73,255)', 'rgb(157,172,255)', 'rgb(200,153,255)', 'rgb(193,236,255)'],
    40: ['rgb(77,130,162)', 'rgb(0,149,119)', 'rgb(118,170,191)', 'rgb(44,229,198)', 'rgb(170,200,210)', 'rgb(178,254,224)'],
    41: ['rgb(202,47,203)', 'rgb(172,50,193)', 'rgb(255,96,194)', 'rgb(191,107,255)', 'rgb(255,166,166)', 'rgb(210,201,255)'],
    42: ['rgb(11,114,33)', 'rgb(254,218,0)', 'rgb(0,207,54)', 'rgb(255,248,87)', 'rgb(82,253,121)', 'rgb(255,253,218)'],
    43: ['rgb(108,58,254)', 'rgb(0,125,254)', 'rgb(148,125,255)', 'rgb(0,220,255)', 'rgb(180,206,255)', 'rgb(219,255,255)'],
    44: ['rgb(198,17,52)', 'rgb(254,68,255)', 'rgb(255,24,24)', 'rgb(255,122,141)', 'rgb(255,122,121)', 'rgb(255,216,235)'],
    45: ['rgb(101,59,43)', 'rgb(98,160,181)', 'rgb(177,145,130)', 'rgb(149,180,201)', 'rgb(221,200,179)', 'rgb(200,220,229)'],
    46: ['rgb(1,37,255)', 'rgb(1,168,36)', 'rgb(45,186,255)', 'rgb(1,252,1)', 'rgb(35,254,255)', 'rgb(178,252,153)'],
    47: ['rgb(0,119,87)', 'rgb(136,114,100)', 'rgb(1,180,151)', 'rgb(211,180,159)', 'rgb(114,246,207)', 'rgb(236,219,199)'],
    48: ['rgb(141,114,1)', 'rgb(71,40,19)', 'rgb(222,180,0)', 'rgb(136,114,100)', 'rgb(255,253,0)', 'rgb(211,180,159)'],
    49: ['rgb(91,3,41)', 'rgb(28,94,7)', 'rgb(198,17,52)', 'rgb(1,168,36)', 'rgb(255,23,23)', 'rgb(0,251,0)'],
    50: ['rgb(0,6,92)', 'rgb(57,101,130)', 'rgb(1,37,255)', 'rgb(96,161,181)', 'rgb(45,186,255)', 'rgb(149,180,200)'],
    51: ['rgb(122,13,102)', 'rgb(1,19,163)', 'rgb(202,47,203)', 'rgb(0,125,254)', 'rgb(255,97,194)', 'rgb(0,220,255)'],
    52: ['rgb(41,20,0)', 'rgb(142,61,60)', 'rgb(101,59,43)', 'rgb(202,91,12)', 'rgb(176,144,129)', 'rgb(255,139,0)'],
    53: ['rgb(40,74,0)', 'rgb(84,37,203)', 'rgb(11,114,33)', 'rgb(130,89,255)', 'rgb(0,208,54)', 'rgb(157,172,255)'],
    54: ['rgb(82,25,102)', 'rgb(152,11,63)', 'rgb(142,44,163)', 'rgb(223,20,42)', 'rgb(181,73,255)', 'rgb(254,65,61)'],
    55: ['rgb(0,59,39)', 'rgb(181,140,0)', 'rgb(0,119,89)', 'rgb(254,218,0)', 'rgb(0,179,149)', 'rgb(255,248,87)'],
    56: ['rgb(28,61,92)', 'rgb(111,37,132)', 'rgb(77,130,162)', 'rgb(172,50,193)', 'rgb(118,170,191)', 'rgb(191,107,255)'],
    57: ['rgb(101,47,81)', 'rgb(0,89,57)', 'rgb(183,76,40)', 'rgb(0,149,119)', 'rgb(229,115,0)', 'rgb(44,229,198)'],
    58: ['rgb(44,18,153)', 'rgb(163,31,153)', 'rgb(108,58,254)', 'rgb(254,68,255)', 'rgb(148,125,255)', 'rgb(255,122,141)'],
    59: ['rgb(198,17,52)', 'rgb(223,20,42)', 'rgb(255,96,192)', 'rgb(255,122,141)', 'rgb(255,170,69)', 'rgb(255,199,148)'],
    60: ['rgb(202,47,203)', 'rgb(254,68,255)', 'rgb(181,73,255)', 'rgb(191,107,255)', 'rgb(255,244,155)', 'rgb(254,254,218)'],
    61: ['rgb(221,179,0)', 'rgb(254,218,0)', 'rgb(0,207,54)', 'rgb(1,252,1)', 'rgb(35,254,255)', 'rgb(219,255,255)'],
    62: ['rgb(108,58,254)', 'rgb(128,90,255)', 'rgb(118,170,191)', 'rgb(149,180,201)', 'rgb(82,253,121)', 'rgb(178,252,153)'],
    63: ['rgb(101,59,43)', 'rgb(137,115,101)', 'rgb(229,115,0)', 'rgb(255,139,0)', 'rgb(169,202,211)', 'rgb(200,220,231)'],
    64: ['rgb(0,119,89)', 'rgb(0,149,119)', 'rgb(150,125,255)', 'rgb(157,172,255)', 'rgb(114,244,208)', 'rgb(178,254,224)'],
    65: ['rgb(182,75,39)', 'rgb(202,91,12)', 'rgb(255,253,0)', 'rgb(255,248,87)', 'rgb(200,153,255)', 'rgb(210,201,254)'],
    66: ['rgb(77,130,162)', 'rgb(98,160,181)', 'rgb(255,24,24)', 'rgb(254,65,61)', 'rgb(255,166,166)', 'rgb(255,216,235)'],
    67: ['rgb(142,44,163)', 'rgb(172,50,193)', 'rgb(45,186,255)', 'rgb(0,220,255)', 'rgb(221,200,179)', 'rgb(236,219,199)'],
    68: ['rgb(11,114,33)', 'rgb(1,168,36)', 'rgb(0,179,149)', 'rgb(44,229,198)', 'rgb(180,206,255)', 'rgb(193,236,255)'],
    69: ['rgb(1,37,255)', 'rgb(0,125,254)', 'rgb(177,145,130)', 'rgb(211,180,159)', 'rgb(254,122,120)', 'rgb(255,191,191)'],
    70: ['rgb(122,13,102)', 'rgb(163,31,153)', 'rgb(1,37,255)', 'rgb(0,125,254)', 'rgb(0,207,54)', 'rgb(1,252,1)', 'rgb(255,170,69)', 'rgb(255,200,149)'],
    71: ['rgb(142,44,163)', 'rgb(172,50,193)', 'rgb(0,179,149)', 'rgb(44,229,198)', 'rgb(255,244,155)', 'rgb(254,254,218)', 'rgb(91,3,41)', 'rgb(152,11,63)'],
    72: ['rgb(45,186,255)', 'rgb(0,220,255)', 'rgb(82,253,121)', 'rgb(178,252,153)', 'rgb(101,47,81)', 'rgb(142,61,60)', 'rgb(101,59,43)', 'rgb(136,114,100)'],
    73: ['rgb(114,244,208)', 'rgb(178,254,224)', 'rgb(141,114,1)', 'rgb(181,140,0)', 'rgb(255,23,23)', 'rgb(254,65,61)', 'rgb(170,200,210)', 'rgb(200,220,231)'],
    74: ['rgb(40,74,0)', 'rgb(28,94,7)', 'rgb(183,76,40)', 'rgb(202,91,12)', 'rgb(177,145,130)', 'rgb(211,180,159)', 'rgb(180,206,255)', 'rgb(194,235,255)'],
    75: ['rgb(202,47,203)', 'rgb(254,68,255)', 'rgb(222,180,0)', 'rgb(254,218,0)', 'rgb(255,122,121)', 'rgb(255,191,191)', 'rgb(28,61,92)', 'rgb(59,100,132)'],
    76: ['rgb(181,73,255)', 'rgb(191,107,255)', 'rgb(227,116,0)', 'rgb(255,139,0)', 'rgb(221,200,179)', 'rgb(236,219,199)', 'rgb(44,18,153)', 'rgb(84,37,203)'],
    77: ['rgb(200,153,255)', 'rgb(210,201,255)', 'rgb(0,59,39)', 'rgb(0,89,59)', 'rgb(41,20,1)', 'rgb(71,40,19)', 'rgb(108,58,254)', 'rgb(130,89,255)'],
    78: ['rgb(255,96,194)', 'rgb(255,122,141)', 'rgb(35,254,255)', 'rgb(219,255,255)', 'rgb(11,114,33)', 'rgb(1,168,36)', 'rgb(198,17,52)', 'rgb(222,19,41)'],
    79: ['rgb(82,25,102)', 'rgb(111,37,132)', 'rgb(0,119,89)', 'rgb(0,149,117)', 'rgb(255,253,0)', 'rgb(77,130,162)', 'rgb(77,130,162)', 'rgb(98,160,181)'],
    80: ['rgb(255,166,165)', 'rgb(255,216,235)', 'rgb(0,6,92)', 'rgb(1,19,163)', 'rgb(118,170,191)', 'rgb(148,180,201)', 'rgb(150,125,255)', 'rgb(157,172,255)'],
    81: ['rgb(41,20,1)', 'rgb(71,40,19)', 'rgb(108,58,254)', 'rgb(130,89,255)', 'rgb(255,96,194)', 'rgb(255,122,141)'],
    82: ['rgb(82,25,102)', 'rgb(111,37,132)', 'rgb(0,119,89)', 'rgb(43,121,107)', 'rgb(255,253,0)', 'rgb(255,248,87)'],
    83: ['rgb(76,129,160)', 'rgb(98,160,181)', 'rgb(255,166,166)', 'rgb(255,216,235)', 'rgb(0,6,92)', 'rgb(1,19,163)'],
    84: ['rgb(181,73,255)', 'rgb(191,107,255)', 'rgb(227,116,0)', 'rgb(255,140,1)', 'rgb(221,200,179)', 'rgb(235,220,199)'],
    85: ['rgb(114,244,208)', 'rgb(179,254,224)', 'rgb(141,114,1)', 'rgb(181,140,0)', 'rgb(255,24,24)', 'rgb(254,65,61)'],
    86: ['rgb(177,145,130)', 'rgb(211,180,159)', 'rgb(180,206,255)', 'rgb(193,236,255)', 'rgb(202,47,203)', 'rgb(254,68,255)'],
    87: ['rgb(255,244,155)', 'rgb(254,254,218)', 'rgb(91,3,41)', 'rgb(152,11,63)', 'rgb(45,186,255)', 'rgb(0,220,255)'],
    88: ['rgb(170,200,210)', 'rgb(200,220,231)', 'rgb(38,74,0)', 'rgb(28,94,7)', 'rgb(183,76,40)', 'rgb(202,91,12)'],
    89: ['rgb(121,12,101)', 'rgb(163,31,153)', 'rgb(1,37,255)', 'rgb(0,125,254)', 'rgb(0,207,54)', 'rgb(1,252,0)'],
    90: ['rgb(255,170,67)', 'rgb(255,200,149)', 'rgb(142,44,163)', 'rgb(172,50,193)', 'rgb(0,179,147)', 'rgb(44,229,198)'],
    91: ['rgb(35,255,255)', 'rgb(219,255,255)', 'rgb(11,114,33)', 'rgb(1,168,36)', 'rgb(198,16,54)', 'rgb(223,20,42)'],
    92: ['rgb(222,180,0)', 'rgb(254,218,0)', 'rgb(255,121,118)', 'rgb(255,191,191)', 'rgb(28,61,92)', 'rgb(57,101,130)'],
    93: ['rgb(44,18,153)', 'rgb(84,37,203)', 'rgb(200,153,255)', 'rgb(210,201,255)', 'rgb(0,59,39)', 'rgb(0,89,59)'],
    94: ['rgb(82,253,121)', 'rgb(178,252,153)', 'rgb(101,47,81)', 'rgb(93,93,93)', 'rgb(101,59,43)', 'rgb(137,115,101)'],
    95: ['rgb(118,170,191)', 'rgb(93,93,93)', 'rgb(150,125,255)', 'rgb(157,172,255)', 'rgb(122,13,102)', 'rgb(163,31,153)'],
    96: ['rgb(40,74,0)', 'rgb(27,95,10)', 'rgb(142,44,163)', 'rgb(172,50,193)', 'rgb(255,96,194)', 'rgb(255,122,141)'],
    97: ['rgb(0,6,92)', 'rgb(0,21,163)', 'rgb(222,180,0)', 'rgb(254,218,0)', 'rgb(0,207,54)', 'rgb(1,252,1)'],
    98: ['rgb(93,69,82)', 'rgb(152,11,63)', 'rgb(1,37,255)', 'rgb(0,125,254)', 'rgb(181,73,255)', 'rgb(191,107,255)'],
    99: ['rgb(141,114,1)', 'rgb(181,140,0)', 'rgb(77,130,162)', 'rgb(98,160,181)', 'rgb(148,125,255)', 'rgb(157,172,255)'],
    100: ['rgb(44,18,153)', 'rgb(84,37,203)', 'rgb(0,119,89)', 'rgb(0,149,119)', 'rgb(174,145,129)', 'rgb(212,180,159)'],
    101: ['rgb(28,61,92)', 'rgb(59,100,132)', 'rgb(202,47,203)', 'rgb(254,68,255)', 'rgb(227,116,0)', 'rgb(255,139,0)'],
    102: ['rgb(122,13,102)', 'rgb(163,31,153)', 'rgb(101,59,43)', 'rgb(137,115,101)', 'rgb(255,24,24)', 'rgb(254,65,61)'],
    103: ['rgb(101,47,81)', 'rgb(142,61,60)', 'rgb(198,17,52)', 'rgb(223,20,42)', 'rgb(45,186,255)', 'rgb(0,220,255)'],
    104: ['rgb(0,59,39)', 'rgb(0,89,59)', 'rgb(183,76,40)', 'rgb(202,90,14)', 'rgb(255,253,0)', 'rgb(255,248,87)'],
    105: ['rgb(82,25,102)', 'rgb(111,37,132)', 'rgb(108,58,254)', 'rgb(130,89,255)', 'rgb(118,170,191)', 'rgb(149,180,201)'],
    106: ['rgb(41,20,1)', 'rgb(71,40,19)', 'rgb(11,114,33)', 'rgb(11,114,33)', 'rgb(1,168,36)', 'rgb(44,229,198)']
  };

  function pathData(arr, decimals) {
    if (decimals === void 0) {
      decimals = 3;
    }

    var d = '';

    for (var i = 0; i < arr.length + 1; i++) {
      d += i ? ' L ' : 'M ';
      d += arr[i % arr.length][0].toFixed(decimals) + ' ' + arr[i % arr.length][1].toFixed(decimals);
    }

    return d;
  }

  function createSVGElement(tagName, attributes, parent) {
    var ns = 'http://www.w3.org/2000/svg';
    var el = document.createElementNS(ns, tagName);

    for (var attrName in attributes) {
      el.setAttribute(attrName, attributes[attrName]);
    }

    if (parent) parent.appendChild(el);
    return el;
  }

  var render = {
    // TODO: test web worker support
    svg: function svg(landscape, _temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$decimals = _ref.decimals,
          decimals = _ref$decimals === void 0 ? 3 : _ref$decimals;

      var svgElement = createSVGElement('svg', {
        'width': landscape.width,
        'height': landscape.height,
        'viewBox': "0 0 " + landscape.width + " " + landscape.height
      }); // Use a rectangle as background

      createSVGElement('rect', {
        x: 0,
        y: 0,
        width: landscape.width,
        height: landscape.height,
        fill: landscape.props.background
      }, svgElement); // TODO: <defs> & <use

      landscape.render(function (cell, path) {
        return createSVGElement('path', {
          d: pathData(path, decimals),
          fill: cell.color
        }, svgElement);
      });
      return svgElement;
    },
    canvas: function canvas(landscape, _canvas) {
      _canvas.width = landscape.width;
      _canvas.height = landscape.height;
      _canvas.style.width = _canvas.width + 'px';
      _canvas.style.height = _canvas.height + 'px';

      var ctx = _canvas.getContext('2d');

      ctx.fillStyle = landscape.props.background;
      ctx.fillRect(0, 0, _canvas.width, _canvas.height);
      landscape.render(function (cell, path) {
        ctx.fillStyle = cell.color;
        ctx.beginPath();
        path.forEach(function (point, index) {
          if (index === 0) ctx.moveTo(point[0], point[1]);else ctx.lineTo(point[0], point[1]);
        });
        ctx.fill();
      });
    }
  };

  prng.seed = window.location.hash.substring(1) || Date.now();
  console.log(+prng.seed);
  document.title += ' | ' + prng.seed;
  perf('generate', function () {
    var swatch = prng.randomOf(Object.values(swatches));
    window.landscape = new Landscape({
      sizes: [8, 16],
      width: window.innerWidth - 20,
      height: window.innerHeight - 20,
      groundsLength: 10,
      percentOfStraightLines: 0.125,
      percentOfGradients: 0.5,
      percentOfSimplexGradients: 0.1,
      swatch: swatch,
      background: prng.randomOf(swatch),
      random: prng.random
    });
  });
  perf('render.canvas', function () {
    render.canvas(window.landscape, document.querySelector('canvas'));
  });
  perf('render.svg', function () {
    var svg = render.svg(window.landscape);
    document.querySelector('main').appendChild(svg);
  });

  function perf(name, callback) {
    var start = performance.now();
    callback();
    console.warn("[" + name + "] " + (performance.now() - start).toFixed(0) + "ms");
  }

})));
//# sourceMappingURL=ffp-generate.umd.js.map
