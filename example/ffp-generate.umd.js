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

  function n(n,t,r){return Math.max(t,Math.min(n,r))}function t(n,t,o,u){return void 0===u&&(u=!1),r(n,t,o,0,1,u)}function r(t,r,o,u,i,a){void 0===a&&(a=!1);var e=(t-r)*(i-u)/(o-r)+u;return a?n(e,u,i):e}function o(n,t,r){return n+r*(t-n)}function e(n){return n*Math.PI/180}function f(n,t){return Math.ceil(n/t)*t}//# sourceMappingURL=missing-math.m.js.map

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

  var arrayRandom = (function (arr, rng) {
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
    randomOf: function randomOf(arr) {
      return arrayRandom(arr, randomizer.nextFloat);
    },
    randomFloat: function randomFloat(min, max) {
      return randomizer.nextFloat() * (max - min) + min;
    },
    randomInt: function randomInt(min, max) {
      return Math.floor(randomizer.nextFloat() * (max - min) + min);
    }
  };

  var Landscape = /*#__PURE__*/function () {
    Landscape.from = function from(props, _temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          cells = _ref.cells,
          lines = _ref.lines,
          gradients = _ref.gradients;

      var instance = new Landscape(props, false);
      instance.cells = cells;
      instance.lines = lines;
      instance.gradients = gradients;
      return instance;
    };

    function Landscape(props, generate) {
      if (generate === void 0) {
        generate = true;
      }

      this.props = Object.assign({
        sizes: [8, 16],
        width: 240,
        height: 240,
        groundsLength: 10,
        percentOfStraightLines: 0.125,
        percentOfGradients: 0.5,
        percentOfSimplexGradients: 0.1,
        colors: ['rgb(0, 0, 0)'],
        background: 'transparent',
        symbols: ['square', 'square_offset', 'vertical_line', 'vertical_line_offset', 'horizontal_line', 'horizontal_line_offset', 'diagonal', 'diamond', 'circle'],
        random: prng.random
      }, props);

      if (generate) {
        var _this$generate = this.generate(),
            cells = _this$generate.cells,
            lines = _this$generate.lines,
            gradients = _this$generate.gradients;

        this.cells = cells;
        this.lines = lines;
        this.gradients = gradients;
      }
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
          colors = _this$props.colors,
          symbols = _this$props.symbols,
          random = _this$props.random;
      var cells = [];
      var lines = [];
      var gradients = [];

      var _loop = function _loop(index) {
        var rnd = random() * 100;
        var size = prng.randomOf(sizes);
        var color = prng.randomOf(colors);
        var symbol = prng.randomOf(symbols);
        var gradient = rnd > percentOfGradients * 100 ? Gradient.fix(random()) : rnd < percentOfSimplexGradients * 100 ? Gradient.simplex({
          seed: rnd
        }) : Gradient.linear(rnd);
        var offy = _this.height * (1 - index / groundsLength);
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

        lines.push(line);
        gradients.push(gradient);
      };

      for (var index = 0; index < groundsLength; index++) {
        _loop(index);
      }

      return {
        cells: cells,
        lines: lines,
        gradients: gradients
      };
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

  var chunk = (function (arr, size) {
    return Array.from({
      length: Math.ceil(arr.length / size)
    }, function (v, i) {
      return arr.slice(i * size, i * size + size);
    });
  });

  var shuffle = (function (a, prng) {
    if (prng === void 0) {
      prng = Math.random;
    }

    var j, x, i;

    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(prng() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }

    return a;
  });

  /* eslint-disable comma-spacing, indent */
  // SEE graphic guidelines

  var COLORS = [{
    rgb: [120, 0, 100],
    cmyk: [50, 100, 20, 20]
  }, {
    rgb: [160, 15, 150],
    cmyk: [40, 80, 0, 0]
  }, {
    rgb: [200, 30, 200],
    cmyk: [35, 80, 0, 0]
  }, {
    rgb: [250, 50, 255],
    cmyk: [20, 70, 0, 0]
  }, {
    rgb: [255, 90, 190],
    cmyk: [0, 70, 0, 0]
  }, {
    rgb: [255, 120, 140],
    cmyk: [0, 68, 24, 0]
  }, {
    rgb: [255, 165, 165],
    cmyk: [0, 50, 23, 0]
  }, {
    rgb: [255, 215, 235],
    cmyk: [0, 25, 0, 0]
  }, {
    rgb: [80, 20, 100],
    cmyk: [80, 100, 25, 20]
  }, {
    rgb: [110, 30, 130],
    cmyk: [65, 100, 0, 0]
  }, {
    rgb: [140, 35, 160],
    cmyk: [50, 90, 0, 0]
  }, {
    rgb: [170, 40, 190],
    cmyk: [45, 80, 0, 0]
  }, {
    rgb: [180, 60, 255],
    cmyk: [55, 75, 0, 0]
  }, {
    rgb: [190, 100, 255],
    cmyk: [45, 60, 0, 0]
  }, {
    rgb: [200, 150, 255],
    cmyk: [30, 45, 0, 0]
  }, {
    rgb: [210, 200, 255],
    cmyk: [20, 25, 0, 0]
  }, {
    rgb: [45, 0, 150],
    cmyk: [100, 100, 0, 0]
  }, {
    rgb: [85, 20, 200],
    cmyk: [85, 85, 0, 0]
  }, {
    rgb: [110, 40, 255],
    cmyk: [80, 75, 0, 0]
  }, {
    rgb: [130, 80, 255],
    cmyk: [70, 70, 0, 0]
  }, {
    rgb: [150, 120, 255],
    cmyk: [56, 56, 0, 0]
  }, {
    rgb: [160, 170, 255],
    cmyk: [40, 30, 0, 0]
  }, {
    rgb: [180, 205, 255],
    cmyk: [36, 12, 0, 0]
  }, {
    rgb: [195, 235, 255],
    cmyk: [32, 0, 0, 0]
  }, {
    rgb: [0, 0, 90],
    cmyk: [100, 95, 35, 40]
  }, {
    rgb: [0, 0, 160],
    cmyk: [100, 90, 12, 0]
  }, {
    rgb: [0, 0, 255],
    cmyk: [93, 74, 0, 0]
  }, {
    rgb: [0, 120, 255],
    cmyk: [87, 50, 0, 0]
  }, {
    rgb: [60, 185, 255],
    cmyk: [80, 0, 0, 0]
  }, {
    rgb: [0, 220, 255],
    cmyk: [65, 0, 10, 0]
  }, {
    rgb: [60, 255, 255],
    cmyk: [80, 0, 12, 0]
  }, {
    rgb: [220, 255, 255],
    cmyk: [25, 0, 5, 0]
  }, {
    rgb: [30, 60, 90],
    cmyk: [100, 75, 40, 35]
  }, {
    rgb: [60, 100, 130],
    cmyk: [88, 50, 30, 15]
  }, {
    rgb: [80, 130, 160],
    cmyk: [80, 30, 25, 10]
  }, {
    rgb: [100, 160, 180],
    cmyk: [75, 15, 25, 0]
  }, {
    rgb: [120, 170, 190],
    cmyk: [65, 15, 20, 0]
  }, {
    rgb: [150, 180, 200],
    cmyk: [50, 15, 15, 0]
  }, {
    rgb: [170, 200, 210],
    cmyk: [40, 10, 15, 0]
  }, {
    rgb: [200, 220, 230],
    cmyk: [30, 5, 10, 0]
  }, {
    rgb: [0, 60, 40],
    cmyk: [100, 45, 90, 60]
  }, {
    rgb: [0, 90, 60],
    cmyk: [100, 30, 90, 35]
  }, {
    rgb: [0, 120, 90],
    cmyk: [100, 20, 75, 10]
  }, {
    rgb: [0, 150, 120],
    cmyk: [100, 0, 65, 0]
  }, {
    rgb: [20, 180, 150],
    cmyk: [90, 0, 55, 0]
  }, {
    rgb: [60, 230, 200],
    cmyk: [80, 0, 40, 0]
  }, {
    rgb: [120, 245, 210],
    cmyk: [65, 0, 35, 0]
  }, {
    rgb: [180, 255, 255],
    cmyk: [40, 0, 15, 0]
  }, {
    rgb: [40, 75, 0],
    cmyk: [90, 45, 100, 50]
  }, {
    rgb: [30, 95, 20],
    cmyk: [100, 30, 100, 30]
  }, {
    rgb: [20, 115, 40],
    cmyk: [100, 20, 100, 15]
  }, {
    rgb: [10, 170, 50],
    cmyk: [100, 0, 100, 0]
  }, {
    rgb: [0, 210, 70],
    cmyk: [80, 0, 90, 0]
  }, {
    rgb: [0, 255, 50],
    cmyk: [70, 0, 80, 0]
  }, {
    rgb: [90, 255, 130],
    cmyk: [70, 0, 70, 0]
  }, {
    rgb: [180, 255, 160],
    cmyk: [50, 0, 50, 0]
  }, {
    rgb: [140, 115, 0],
    cmyk: [30, 45, 100, 25]
  }, {
    rgb: [180, 140, 0],
    cmyk: [20, 40, 100, 10]
  }, {
    rgb: [220, 180, 0],
    cmyk: [10, 30, 100, 0]
  }, {
    rgb: [255, 220, 0],
    cmyk: [0, 10, 90, 0]
  }, {
    rgb: [255, 255, 40],
    cmyk: [0, 0, 100, 0]
  }, {
    rgb: [255, 250, 100],
    cmyk: [5, 0, 70, 0]
  }, {
    rgb: [255, 245, 160],
    cmyk: [0, 0, 50, 0]
  }, {
    rgb: [255, 255, 200],
    cmyk: [0, 0, 20, 0]
  }, {
    rgb: [100, 45, 80],
    cmyk: [50, 90, 35, 35]
  }, {
    rgb: [140, 60, 60],
    cmyk: [25, 85, 70, 20]
  }, {
    rgb: [180, 75, 40],
    cmyk: [15, 80, 95, 0]
  }, {
    rgb: [200, 90, 20],
    cmyk: [0, 75, 100, 0]
  }, {
    rgb: [225, 115, 10],
    cmyk: [0, 65, 95, 0]
  }, {
    rgb: [255, 140, 0],
    cmyk: [0, 55, 90, 0]
  }, {
    rgb: [255, 170, 75],
    cmyk: [0, 40, 70, 0]
  }, {
    rgb: [255, 200, 150],
    cmyk: [0, 20, 40, 0]
  }, {
    rgb: [90, 0, 40],
    cmyk: [35, 100, 60, 55]
  }, {
    rgb: [150, 0, 60],
    cmyk: [20, 100, 60, 15]
  }, {
    rgb: [195, 0, 50],
    cmyk: [0, 100, 75, 0]
  }, {
    rgb: [220, 0, 40],
    cmyk: [0, 90, 75, 0]
  }, {
    rgb: [255, 0, 20],
    cmyk: [0, 90, 70, 0]
  }, {
    rgb: [255, 60, 60],
    cmyk: [0, 85, 65, 0]
  }, {
    rgb: [255, 120, 120],
    cmyk: [0, 65, 40, 0]
  }, {
    rgb: [250, 190, 190],
    cmyk: [0, 35, 15, 0]
  }, {
    rgb: [40, 20, 0],
    cmyk: [60, 80, 70, 85]
  }, {
    rgb: [70, 40, 20],
    cmyk: [40, 78, 90, 65]
  }, {
    rgb: [100, 60, 45],
    cmyk: [35, 75, 75, 50]
  }, {
    rgb: [135, 115, 100],
    cmyk: [35, 45, 50, 30]
  }, {
    rgb: [175, 145, 130],
    cmyk: [25, 40, 40, 10]
  }, {
    rgb: [210, 180, 160],
    cmyk: [10, 30, 35, 0]
  }, {
    rgb: [220, 200, 180],
    cmyk: [10, 20, 30, 0]
  }, {
    rgb: [235, 220, 200],
    cmyk: [5, 15, 20, 0]
  }].map(function (color) {
    color.css = "rgb(" + color.rgb + ")";
    return color;
  });
  function toArray() {
    return [].concat(COLORS);
  }
  function log(colors, lineLength) {
    if (lineLength === void 0) {
      lineLength = 1;
    }

    if (!arguments.length) {
      colors = COLORS;
      lineLength = 8;
    }

    var lines = chunk(colors, lineLength);

    for (var _iterator = _createForOfIteratorHelperLoose(lines), _step; !(_step = _iterator()).done;) {
      var _console;

      var line = _step.value;
      var styles = [];

      for (var _iterator2 = _createForOfIteratorHelperLoose(line), _step2; !(_step2 = _iterator2()).done;) {
        var color = _step2.value;
        var css = color.css ? color.css : color.rgb ? "rgb(" + color.rgb[0] + ", " + color.rgb[1] + ", " + color.rgb[2] + ")" : color;
        styles.push("background-color:" + css + "; padding: 20px");
      }

      (_console = console).log.apply(_console, [new Array(styles.length).fill('%c ').join('')].concat(styles));
    }
  }
  function swatch(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$colorSpace = _ref.colorSpace,
        colorSpace = _ref$colorSpace === void 0 ? null : _ref$colorSpace,
        _ref$random = _ref.random,
        random = _ref$random === void 0 ? prng.random : _ref$random;

    /**
     * Procgen of the swatch:
     * - group colors by hue (every 8 colors)
     * - push two successive dark colors
     * - push two successive medium colors
     * - push two successive light colors
     *
     * Do not take colors with hue overlapping indexes (ie [0, 1] of hue#1, [1, 2] of hue#2)
     */
    var colors = []; // Group COLORS by hue (every 8 colors), and take three random hues

    var hues = shuffle(chunk(COLORS, 8), random).splice(0, 3); // Push the two dark colors

    var index = Math.round(random()); // 0 or 1

    colors.push(hues[0][index++]);
    colors.push(hues[0][index++]); // Push the two medium colors

    if (index < 3) index = Math.round(random());
    colors.push(hues[1][index++]);
    colors.push(hues[1][index++]); // Push the two bright colors

    index += Math.round(random());
    colors.push(hues[2][index++]);
    colors.push(hues[2][index++]);
    return colorSpace ? colors.map(function (color) {
      return color[colorSpace];
    }) : colors;
  }
  var Colors = {
    toArray: toArray,
    swatch: swatch,
    log: log
  };

  /**
   * Core of the raf package
   * @module raf
   * @type {Object}
   * @example
   * import { raf } from '@internet/raf'
   *
   * function tick (dt) {
   *  console.log('called on new frame')
   * }
   *
   * raf.add(tick)
   */

  var root = typeof window === 'undefined' ? global : window;
  var _observers = [];
  var _afterObservers = [];
  var _beforeObservers = [];
  var _rafHandler = null;
  var _lastDate = null;
  var _once = false;
  var _complex = false;

  /**
   * Time elapsed between the previous and the current frame
   * @type {number}
   * @static
   * @category properties
   */
  var time;

  /**
   * Current delta time
   * @type {number}
   * @static
   * @category properties
   */
  var dt;

  function _frame (timestamp) {
    // compute deltatime and time
    if (timestamp === void 0) timestamp = 0;
    if (_lastDate === null) _lastDate = timestamp;
    dt = timestamp - _lastDate;
    time += dt;
    _lastDate = timestamp;
    // we request the frame now, allowing to cancel it from observers
    _rafHandler = _once ? null : root.requestAnimationFrame(_frame);
    if (_once) _once = false;
    // call all observers
    var i;
    if (_complex) {
      for (i = 0; i < _beforeObservers.length; i++) _beforeObservers[i](dt);
      for (i = 0; i < _observers.length; i++) _observers[i](dt);
      for (i = 0; i < _afterObservers.length; i++) _afterObservers[i](dt);
    } else {
      for (i = 0; i < _observers.length; i++) _observers[i](dt);
    }
  }

  function _swapRunner () {
    _complex = !!(_afterObservers.length > 0 || _beforeObservers.length > 0);
  }

  function _addObserver (arr, fn, prepend) {
    if (!fn || !arr) return false
    if (~arr.indexOf(fn)) return false
    prepend = !!prepend;
    prepend ? arr.unshift(fn) : arr.push(fn);
    return true
  }

  function _removeObserver (arr, fn) {
    if (!fn) return false
    var index = arr.indexOf(fn);
    if (!~index) return false
    arr.splice(index, 1);
    return !!(arr.length === 0)
  }

  /**
   * Add a function for execution at the beginning of the raf call
   * Calling addBefore will not start the raf.
   * @param {function} fn Function to be called at the start of the raf
   * @param {function} [prepend=false] Prepend the function to the beginning of the functions list
   * @static
   * @category methods
   */
  function addBefore (fn, prepend) {
    _addObserver(_beforeObservers, fn, prepend) && _swapRunner();
  }

  /**
   * Add a function for execution at the end of the raf call
   * Calling addAfter will not start the raf.
   * @param {function} fn Function to be called at the end of the raf
   * @param {function} [prepend=false] Prepend the function to the beginning of the functions list
   * @static
   * @category methods
   */
  function addAfter (fn, prepend) {
    _addObserver(_afterObservers, fn, prepend) && _swapRunner();
  }

  /**
   * Add a function for execution on each frame
   * @param {function} fn Function to be called
   * @param {function} [prepend=false] Prepend the function to the beginning of the functions list
   * @static
   * @category methods
   */
  function add (fn, prepend) {
    _addObserver(_observers, fn, prepend) && start();
  }

  /**
   * Remove a function for execution at the beginning of the raf call
   * Calling removeBefore will not stop the raf.
   * @param {function} fn Function to remove from the raf
   * @static
   * @category methods
   */
  function removeBefore (fn) {
    _removeObserver(_beforeObservers, fn) && _swapRunner();
  }

  /**
   * Remove a function for execution at the end of the raf call
   * Calling removeAfter will not stop the raf.
   * @param {function} fn Function to remove from the raf
   * @param {function} [prepend=false] Prepend the function to the beginning of the functions list
   * @static
   * @category methods
   */
  function removeAfter (fn, prepend) {
    _removeObserver(_afterObservers, fn) && _swapRunner();
  }

  /**
   * Remove a function for execution on each frame
   * @param {function} fn Function to remove from the raf
   * @static
   * @category methods
   */
  function remove (fn) {
    _removeObserver(_observers, fn) && stop();
  }

  /**
   * Force start the raf. You usually don't need to use it.
   * @param {boolean} [instant=false] Directly make a raf call without waiting for the next frame (default false)
   * @static
   * @category methods
   */
  function start (instant) {
    _once = false;
    if (_rafHandler) return
    instant = !!instant;
    _lastDate = null;
    if (instant) _frame();
    else _rafHandler = root.requestAnimationFrame(_frame);
  }

  /**
   * Request once the raf. Will not be executed if the raf is already running.
   * @static
   * @category methods
   */
  function requestOnce () {
    if (_rafHandler) return
    _once = true;
    _lastDate = null;
    _rafHandler = root.requestAnimationFrame(_frame);
  }

  /**
   * Force stop the raf. You usually don't need to use it.
   * @static
   * @category methods
   */
  function stop () {
    if (!_rafHandler) return
    root.cancelAnimationFrame(_rafHandler);
    _rafHandler = null;
  }

  /**
   * Remove all observers from the raf singleton and stop the raf if it's running. Reset time.
   * @static
   * @category methods
   */
  function dispose () {
    stop();
    _observers.length = 0;
    _afterObservers.length = 0;
    _beforeObservers.length = 0;
    _complex = false;
    _lastDate = null;
    time = 0;
    dt = 0;
  }

  var raf = {
    add: add,
    addAfter: addAfter,
    addBefore: addBefore,
    remove: remove,
    removeAfter: removeAfter,
    removeBefore: removeBefore,
    start: start,
    stop: stop,
    time: time,
    dt: dt,
    requestOnce: requestOnce,
    dispose: dispose
  };

  var median = (function (arr, _temp) {
    if (arr === void 0) {
      arr = [];
    }

    var _ref = _temp === void 0 ? {} : _temp,
        _ref$alreadySorted = _ref.alreadySorted,
        alreadySorted = _ref$alreadySorted === void 0 ? false : _ref$alreadySorted,
        _ref$alreadyCloned = _ref.alreadyCloned,
        alreadyCloned = _ref$alreadyCloned === void 0 ? false : _ref$alreadyCloned;

    var values = alreadyCloned ? arr : arr.slice(0);
    var numbers = alreadySorted ? values : values.sort(function (a, b) {
      return a - b;
    });
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
  });

  function cloneCanvas(canvas, clone) {
    if (clone === void 0) {
      clone = document.createElement('canvas');
    }

    clone.width = canvas.width;
    clone.height = canvas.height;
    var ctx = clone.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    return clone;
  }

  var erode = (function (landscape, canvas, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$autoplay = _ref.autoplay,
        autoplay = _ref$autoplay === void 0 ? true : _ref$autoplay,
        _ref$easing = _ref.easing,
        easing = _ref$easing === void 0 ? 0.09 : _ref$easing,
        _ref$noUpdateThreshol = _ref.noUpdateThreshold,
        noUpdateThreshold = _ref$noUpdateThreshol === void 0 ? 1 : _ref$noUpdateThreshol,
        _ref$columnWidth = _ref.columnWidth,
        columnWidth = _ref$columnWidth === void 0 ? 16 : _ref$columnWidth,
        _ref$snapToGrid = _ref.snapToGrid,
        snapToGrid = _ref$snapToGrid === void 0 ? 8 : _ref$snapToGrid,
        _ref$round = _ref.round,
        round = _ref$round === void 0 ? true : _ref$round,
        _ref$breaks = _ref.breaks,
        breaks = _ref$breaks === void 0 ? 2 : _ref$breaks,
        _ref$minimizeVisualBr = _ref.minimizeVisualBreaks,
        minimizeVisualBreaks = _ref$minimizeVisualBr === void 0 ? false : _ref$minimizeVisualBr,
        _ref$amplitude = _ref.amplitude,
        amplitude = _ref$amplitude === void 0 ? [0, 200] : _ref$amplitude,
        _ref$scaleFactor = _ref.scaleFactor,
        scaleFactor = _ref$scaleFactor === void 0 ? 1 : _ref$scaleFactor;

    var length = Math.ceil(landscape.width / columnWidth);
    var buffer = cloneCanvas(canvas);
    var ctx = canvas.getContext('2d');
    var points = [];
    var shouldUpdate = autoplay;
    build();
    raf.add(update);
    return {
      rebuild: build,
      toggle: function toggle() {
        shouldUpdate = !shouldUpdate;
      },
      play: function play() {
        shouldUpdate = true;
      },
      pause: function pause() {
        shouldUpdate = false;
      },
      destroy: function destroy() {
        return raf.remove(update);
      }
    };

    function build() {
      // Compute breakpoints at which a line will be swaped with the next
      var breakpoints = [];

      for (var i = 0; i < breaks; i++) {
        breakpoints.push(prng.randomInt(0, length));
      }

      breakpoints.push(length); // Create a model of the future lines breaks

      var linesIndexes = [];
      breakpoints.sort(function (a, b) {
        return a - b;
      }).forEach(function (breakpoint, index) {
        linesIndexes = linesIndexes.concat(new Array(breakpoint - linesIndexes.length).fill(index));
      }); // Reassign points array with new values computed from corresponding lines

      var lines = shuffle(landscape.lines).slice(0, breaks + 1);
      points = linesIndexes.map(function (lineIndex, index) {
        var value = lines[lineIndex].compute(index * columnWidth * scaleFactor);
        return {
          t: 1 - value,
          v: points[index] ? points[index].v : 0,
          lineIndex: lineIndex
        };
      }); // When options.minimizeVisualBreaks is set to true, make sure that each
      // section starts where the previous one ends, to avoid creating vertical
      // breaks

      if (minimizeVisualBreaks) {
        var offset = 0;
        points.forEach(function (point, index) {
          var previous = points[index - 1];
          if (!previous) return;

          if (previous.lineIndex !== point.lineIndex) {
            offset = previous.t - point.t;
          }

          point.t += offset;
        });
      } // Minimize global up/down shift by cancelling the median movement
      // Scale up vertically according to the amplitude argument
      // If snapToGrid, round the target to the nearest on-grid value


      var values = points.map(function (_ref2) {
        var t = _ref2.t;
        return t;
      }).sort(function (a, b) {
        return a - b;
      });
      var m = median(values, {
        alreadyCloned: true,
        alreadySorted: true
      });
      var min = values[0];
      var max = values[values.length - 1];
      points.forEach(function (p) {
        p.t = r(p.t - m, min - m, max - m, amplitude[0], amplitude[1]);
        if (snapToGrid && snapToGrid > 0) p.t = f(p.t, snapToGrid);
      });
    }

    function update(dt) {
      if (!shouldUpdate) return;
      shouldUpdate = false;
      ctx.fillStyle = landscape.props.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      points.forEach(function (p, index) {
        p.v += (p.t - p.v) * easing; // Continue updating if there are still relevant movements

        if (Math.abs(p.t - p.v) > noUpdateThreshold) {
          shouldUpdate = true;
        }

        var x = index * columnWidth;
        var y = round ? Math.floor(p.v) : p.v;
        ctx.drawImage(buffer, x, 0, columnWidth, buffer.height - 2, x, y, columnWidth, buffer.height - 2);
      });
    }
  });

  var canvas = (function (landscape, canvas) {
    canvas.width = landscape.width;
    canvas.height = landscape.height;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = landscape.props.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    landscape.render(function (cell, path) {
      ctx.fillStyle = cell.color;
      ctx.beginPath();
      path.forEach(function (point, index) {
        if (index === 0) ctx.moveTo(point[0], point[1]);else ctx.lineTo(point[0], point[1]);
      });
      ctx.fill();
    });
  });

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

  var svg = (function (landscape, _temp) {
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
  });

  var render = {
    canvas: canvas,
    svg: svg
  };

  prng.seed = window.location.hash.substring(1) || Date.now();
  console.log('seed', +prng.seed);
  document.title += ' | ' + prng.seed;
  Colors.log(Colors.toArray(), 8); // Landscape generation, agnostic of any rendering context

  var landscape = perf('generate', function () {
    var colors = new Colors.swatch({
      colorSpace: 'css'
    });
    Colors.log(colors, colors.length);
    return new Landscape({
      sizes: [8, 16],
      width: window.innerWidth - 20,
      height: window.innerHeight - 20,
      groundsLength: 30,
      percentOfStraightLines: 0.125,
      percentOfGradients: 0.5,
      percentOfSimplexGradients: 0.1,
      colors: colors,
      background: prng.randomOf(colors),
      random: prng.random
    });
  }); // Canvas rendering, and post-processing/erode implementation

  var canvas$1 = document.querySelector('canvas');
  perf('render.canvas', function () {
    return render.canvas(landscape, canvas$1);
  });
  var eroder = erode(landscape, canvas$1);
  canvas$1.addEventListener('click', function () {
    eroder.rebuild();
    eroder.play();
  }); // SVG rendering

  var svg$1 = perf('render.svg', function () {
    return render.svg(landscape);
  });
  document.querySelector('main').appendChild(svg$1); // Helper

  function perf(name, callback) {
    var start = performance.now();
    var rtrn = callback();
    console.warn("[" + name + "] " + (performance.now() - start).toFixed(0) + "ms");
    return rtrn;
  }

})));
//# sourceMappingURL=ffp-generate.umd.js.map
