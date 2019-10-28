(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ffp = {})));
}(this, (function (exports) {

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
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

var stringify_2 = stringify_1.getSerialize;

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

var perlin = createCommonjsModule(function (module) {
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global){
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  
  Grad.prototype.dot2 = function(x, y) {
    return this.x*x + this.y*y;
  };

  Grad.prototype.dot3 = function(x, y, z) {
    return this.x*x + this.y*y + this.z*z;
  };

  var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
               new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
               new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];

  var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  // To remove the need for index wrapping, double the permutation table length
  var perm = new Array(512);
  var gradP = new Array(512);

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  module.seed = function(seed) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed>>8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);

  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/

  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3)-1);
  var G2 = (3-Math.sqrt(3))/6;

  var F3 = 1/3;
  var G3 = 1/6;

  // 2D simplex noise
  module.simplex2 = function(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1=1; j1=0;
    } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1=0; j1=1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    i &= 255;
    j &= 255;
    var gi0 = gradP[i+perm[j]];
    var gi1 = gradP[i+i1+perm[j+j1]];
    var gi2 = gradP[i+1+perm[j+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70 * (n0 + n1 + n2);
  };

  // 3D simplex noise
  module.simplex3 = function(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);

    var t = (i+j+k)*G3;
    var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
    var y0 = yin-j+t;
    var z0 = zin-k+t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if(x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else              { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if(y0 < z0)      { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if(x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else             { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;

    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;

    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;

    // Work out the hashed gradient indices of the four simplex corners
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i+   perm[j+   perm[k   ]]];
    var gi1 = gradP[i+i1+perm[j+j1+perm[k+k1]]];
    var gi2 = gradP[i+i2+perm[j+j2+perm[k+k2]]];
    var gi3 = gradP[i+ 1+perm[j+ 1+perm[k+ 1]]];

    // Calculate the contribution from the four corners
    var t0 = 0.5 - x0*x0-y0*y0-z0*z0;
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1-z1*z1;
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.5 - x2*x2-y2*y2-z2*z2;
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.5 - x3*x3-y3*y3-z3*z3;
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);

  };

  // ##### Perlin noise stuff

  function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  function lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  // 2D Perlin Noise
  module.perlin2 = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X; y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    var n00 = gradP[X+perm[Y]].dot2(x, y);
    var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
    var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
    var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);

    // Compute the fade curve value for x
    var u = fade(x);

    // Interpolate the four results
    return lerp(
        lerp(n00, n10, u),
        lerp(n01, n11, u),
       fade(y));
  };

  // 3D Perlin Noise
  module.perlin3 = function(x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255; Y = Y & 255; Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
    var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);

    // Interpolate
    return lerp(
        lerp(
          lerp(n000, n100, u),
          lerp(n001, n101, u), w),
        lerp(
          lerp(n010, n110, u),
          lerp(n011, n111, u), w),
       v);
  };

})(module.exports);
});

var lib$2 = createCommonjsModule(function (module) {
const noise = perlin.noise;

const clamp = (a, min, max) => Math.max(min, Math.min(a, max));
const normalize = (a, min, max) => map(a, min, max, 0, 1);
const map = (a, in_min, in_max, out_min, out_max) => (a - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
const lerp = (a, b, t) => a + t * (b - a);
const random = (a, b) => {
  if (b !== undefined) return lerp(a, b, Math.random())
  return lerp(0, a, Math.random())
};

function perlin$$1 (x, y, z) {
  if (arguments.length === 3) return noise.perlin3(x, y, z)
  if (arguments.length === 2) return noise.perlin2(x, y)
  if (arguments.length === 1) return noise.perlin2(x, null)
  return null
}

module.exports = {
  clamp,
  constrain: clamp,
  degrees: rad => rad * 180 / Math.PI,
  radians: deg => deg * Math.PI / 180,
  lerp,
  normalize,
  norm: normalize,
  map,
  random,
  rnd: random,
  perlin: perlin$$1,
  noise: perlin$$1
};
});

var lib_1$1 = lib$2.clamp;
var lib_2$1 = lib$2.constrain;
var lib_3$1 = lib$2.degrees;
var lib_4$1 = lib$2.radians;
var lib_5$1 = lib$2.lerp;
var lib_6$1 = lib$2.normalize;
var lib_7$1 = lib$2.norm;
var lib_8 = lib$2.map;
var lib_9 = lib$2.random;
var lib_10 = lib$2.rnd;
var lib_11 = lib$2.perlin;
var lib_12 = lib$2.noise;

var Gradient = function Gradient(f) {
    if ( f === void 0 ) f = function (x, y, width, height) { return 1; };

    this.compute = f.bind(this);
};

var staticAccessors = { methods: { configurable: true } };
staticAccessors.methods.get = function () {
    return Object.getOwnPropertyNames(Gradient).filter(function (prop) { return prop !== 'methods'; }).filter(function (prop) { return typeof Gradient[prop] === 'function'; });
};
Gradient.normalize = function normalize$1 (x, y, width, height) {
    return [lib_6$1(x, 0, width),lib_6$1(y, 0, height)];
};
Gradient.simplex = function simplex (ref) {
        if ( ref === void 0 ) ref = {};
        var seed = ref.seed; if ( seed === void 0 ) seed = null;
        var octaves = ref.octaves; if ( octaves === void 0 ) octaves = 2;
        var power = ref.power; if ( power === void 0 ) power = 1;

    var frequency = Math.pow(2, octaves);
    var simplex = new tumult.Simplex2(seed);
    return new Gradient(function (x, y, width, height) {
        var ref = Gradient.normalize(x, y, width, height);
            var i = ref[0];
            var j = ref[1];
        return Math.pow( lib_6$1(simplex.gen(i / frequency, j / frequency), -1, 1), power );
    });
};
Gradient.linear = function linear (alpha) {
        if ( alpha === void 0 ) alpha = 0;

    return new Gradient(function (x, y, width, height) {
        var ref = Gradient.normalize(x, y, width, height);
            var i = ref[0];
            var j = ref[1];
        var theta = lib_4$1(alpha);
        var dirx = lib_5$1(1 - i, i, (Math.sin(theta) + 1) / 2);
        var diry = lib_5$1(1 - j, j, (Math.cos(theta) + 1) / 2);
        return (dirx + diry) / 2;
    });
};
Gradient.random = function random (rng) {
        if ( rng === void 0 ) rng = Math.random;

    return new Gradient(rng);
};
Gradient.fix = function fix (value) {
        if ( value === void 0 ) value = 1;

    return new Gradient(function () { return value; });
};

Object.defineProperties( Gradient, staticAccessors );

function drawBackground (x, y, width, height, ref) {
    if ( ref === void 0 ) ref = {};
    var ctx = ref.ctx;
    var color = ref.color;

    if (color === 'transparent') 
        { return; }
    if (color) 
        { ctx.fillStyle = color; }
    ctx.fillRect(x, y, width, height);
}

function makePattern (symbol) { return function (x, y, ref) {
    if ( ref === void 0 ) ref = {};
    var ctx = ref.ctx;
    var unit = ref.unit;
    var scale = ref.scale; if ( scale === void 0 ) scale = 1;
    var foregroundColor = ref.foregroundColor; if ( foregroundColor === void 0 ) foregroundColor = 'black';
    var backgroundColor = ref.backgroundColor; if ( backgroundColor === void 0 ) backgroundColor = 'white';

    ctx.isSVG && ctx.beginSVGGroup();
    drawBackground(x, y, unit, unit, {
        ctx: ctx,
        color: backgroundColor
    });
    ctx.fillStyle = foregroundColor;
    symbol(x, y, {
        ctx: ctx,
        unit: unit,
        scale: scale
    });
    ctx.isSVG && ctx.endSVGGroup();
}; }

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

function drawPath (ctx, path) {
    ctx.beginPath();
    path.forEach(function (point, index) {
        ctx[index === 0 ? 'moveTo' : 'lineTo'].apply(ctx, point);
    });
}

function roundTo (value, nearest) { return Math.floor(value / nearest) * nearest; }

function steps(unit, step) {
    return unit / step;
}

var symbols = {
    empty: function () {},
    debug: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = unit / 12;
        ctx.strokeRect(x, y, unit, unit);
    },
    square: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24));
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x + unit / 2 - thickness / 2, y + unit / 2 - thickness / 2, thickness, thickness);
    },
    square_offset: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24)) - 10;
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x + unit / 2 - thickness / 2, y + unit / 2 - thickness / 2, thickness, thickness);
    },
    vertical_line: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24));
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x + unit / 2 - thickness / 2, y, thickness, unit);
    },
    vertical_line_offset: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24)) - 10;
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x + unit / 2 - thickness / 2, y, thickness, unit);
    },
    horizontal_line: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24));
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x, y + unit / 2 - thickness / 2, unit, thickness);
    },
    horizontal_line_offset: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24)) - 10;
        if (thickness < 0) 
            { return; }
        ctx.fillRect(x, y + unit / 2 - thickness / 2, unit, thickness);
    },
    diagonal: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24));
        if (thickness < 0) 
            { return; }
        ctx.beginPath();
        ctx.moveTo(x + unit - thickness, y);
        ctx.lineTo(x + unit, y);
        ctx.lineTo(x + thickness, y + unit);
        ctx.lineTo(x, y + unit);
        ctx.fill();
    },
    diamond: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var thickness = roundTo(unit * scale, steps(unit, 24)) - 1;
        if (thickness < 0) 
            { return; }
        drawPath(ctx, lineclip_1.polygon([[x + unit / 2,y + thickness],[x + unit - thickness,
            y + unit / 2],[x + unit / 2,y + unit - thickness],[x + thickness,y + unit / 2]], [x,
            y,x + unit,y + unit]));
        ctx.fill();
    },
    circle: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var diameter = roundTo((unit - 1) * scale, steps(unit, 24));
        if (diameter < 0) 
            { return; }
        var path = [];
        for (var alpha = 0;alpha < 360; alpha += 360 / 36) {
            var theta = lib_4$1(alpha);
            path.push([x + unit / 2 + Math.sin(theta) * diameter,y + unit / 2 + Math.cos(theta) * diameter]);
        }
        drawPath(ctx, lineclip_1.polygon(path, [x,y,x + unit,y + unit]));
        ctx.closePath();
        ctx.fill();
    },
    ffp: function (x, y, ref) {
        if ( ref === void 0 ) ref = {};
        var ctx = ref.ctx;
        var unit = ref.unit;
        var scale = ref.scale; if ( scale === void 0 ) scale = 1;

        var gradient = 'FFP'.split('');
        var char = gradient[Math.floor(Math.random() * gradient.length)];
        if (!char) 
            { return; }
        ctx.font = (unit * 1.2) + "px Space Mono";
        ctx.fillText(char, x, y + unit);
    }
};

function createCanvasFromContext (ctx) {
    if (ctx.isSVG) 
        { throw new Error('This function does not handle SVG context'); }
    var canvas = document.createElement('canvas');
    canvas.width = ctx.canvas.width;
    canvas.height = ctx.canvas.height;
    return canvas;
}

var Ground = function Ground(ref) {
    if ( ref === void 0 ) ref = {};
    var width = ref.width;
    var height = ref.height;
    var unit = ref.unit; if ( unit === void 0 ) unit = 24;
    var line = ref.line;
    var gradient = ref.gradient;
    var pattern = ref.pattern; if ( pattern === void 0 ) pattern = makePattern(symbols['debug']);
    var foregroundColor = ref.foregroundColor; if ( foregroundColor === void 0 ) foregroundColor = 'black';
    var backgroundColor = ref.backgroundColor; if ( backgroundColor === void 0 ) backgroundColor = 'white';

    this.width = width;
    this.height = height;
    this.unit = unit;
    this.line = line;
    this.gradient = gradient;
    this.pattern = pattern;
    this.backgroundColor = backgroundColor;
    this.foregroundColor = foregroundColor;
    this.grid = [];
    this.cells = [];
    this._populate();
};

var prototypeAccessors = { isEmpty: { configurable: true } };
Ground.prototype._populate = function _populate () {
        var this$1 = this;

    for (var x = 0;x < this.width; x += this.unit) {
        var i = Math.floor(x / this$1.unit);
        var ystart = this$1.line.compute(i) * this$1.height;
        for (var y = ystart;y < this.height; y += this.unit) {
            var j = Math.floor(y / this$1.unit);
            this$1.setCell(i, j);
        }
    }
};
Ground.prototype.setCell = function setCell (i, j) {
    if (!this.grid[i]) 
        { this.grid[i] = []; }
    var cell = {
        i: i,
        j: j,
        x: i * this.unit,
        y: j * this.unit,
        shouldRender: true
    };
    this.grid[i][j] = cell;
    this.cells.push(cell);
};
Ground.prototype.hasCell = function hasCell (i, j) {
    return this.grid[i] && this.grid[i][j];
};
Ground.prototype.isInFrontOf = function isInFrontOf (x, y) {
    var i = Math.floor(x / this.unit);
    var j = Math.floor(y / this.unit);
    return this.hasCell(i, j);
};
Ground.prototype.setBehind = function setBehind (grounds) {
    this.grid.forEach(function (column) {
        column.forEach(function (cell) {
            if (!cell || !cell.shouldRender) 
                { return; }
            cell.shouldRender = !grounds.some(function (ground) { return ground.isInFrontOf(cell.x, cell.y); });
        });
    });
};
prototypeAccessors.isEmpty.get = function () {
    return !this.cells.find(function (cell) { return cell.shouldRender; });
};
Ground.prototype._updateAABB = function _updateAABB (x, y) {
    this.aabb = this.aabb || {
        xmin: Number.POSITIVE_INFINITY,
        ymin: Number.POSITIVE_INFINITY,
        xmax: Number.NEGATIVE_INFINITY,
        ymax: Number.NEGATIVE_INFINITY
    };
    if (x < this.aabb.xmin) 
        { this.aabb.xmin = x; }
    if (y < this.aabb.ymin) 
        { this.aabb.ymin = y; }
    if (x > this.aabb.xmax) 
        { this.aabb.xmax = x; }
    if (y > this.aabb.ymax) 
        { this.aabb.ymax = y; }
};
Ground.prototype.render = function render (ctx) {
        var this$1 = this;

    this.cells.forEach(function (cell) {
        if (!cell.shouldRender) 
            { return; }
        this$1._updateAABB(cell.x, cell.y);
        this$1.pattern(cell.x, cell.y, {
            ctx: ctx,
            unit: this$1.unit,
            backgroundColor: this$1.backgroundColor,
            foregroundColor: this$1.foregroundColor,
            scale: this$1.gradient.compute(cell.x, cell.y, this$1.width, this$1.height)
        });
    });
};
Ground.prototype.createSprite = function createSprite (ctx) {
    if (ctx.isSVG) 
        { throw new Error('Sprite rendering only works on non-SVG context'); }
    this.sprite = createCanvasFromContext(ctx);
    this.render(this.sprite.getContext('2d'));
};

Object.defineProperties( Ground.prototype, prototypeAccessors );

var canvas2svg = createCommonjsModule(function (module) {
/*!!
 *  Canvas 2 Svg v1.0.15
 *  A low level canvas to SVG converter. Uses a mock canvas context to build an SVG document.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Kerry Liu
 *
 *  Copyright (c) 2014 Gliffy Inc.
 */

(function() {
    var STYLES, ctx, CanvasGradient, CanvasPattern, namedEntities;

    //helper function to format a string
    function format(str, args) {
        var keys = Object.keys(args), i;
        for (i=0; i<keys.length; i++) {
            str = str.replace(new RegExp("\\{" + keys[i] + "\\}", "gi"), args[keys[i]]);
        }
        return str;
    }

    //helper function that generates a random string
    function randomString(holder) {
        var chars, randomstring, i;
        if (!holder) {
            throw new Error("cannot create a random attribute name for an undefined object");
        }
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        randomstring = "";
        do {
            randomstring = "";
            for (i = 0; i < 12; i++) {
                randomstring += chars[Math.floor(Math.random() * chars.length)];
            }
        } while (holder[randomstring]);
        return randomstring;
    }

    //helper function to map named to numbered entities
    function createNamedToNumberedLookup(items, radix) {
        var i, entity, lookup = {}, base10;
        items = items.split(',');
        radix = radix || 10;
        // Map from named to numbered entities.
        for (i = 0; i < items.length; i += 2) {
            entity = '&' + items[i + 1] + ';';
            base10 = parseInt(items[i], radix);
            lookup[entity] = '&#'+base10+';';
        }
        //FF and IE need to create a regex from hex values ie &nbsp; == \xa0
        lookup["\\xa0"] = '&#160;';
        return lookup;
    }

    //helper function to map canvas-textAlign to svg-textAnchor
    function getTextAnchor(textAlign) {
        //TODO: support rtl languages
        var mapping = {"left":"start", "right":"end", "center":"middle", "start":"start", "end":"end"};
        return mapping[textAlign] || mapping.start;
    }

    //helper function to map canvas-textBaseline to svg-dominantBaseline
    function getDominantBaseline(textBaseline) {
        //INFO: not supported in all browsers
        var mapping = {"alphabetic": "alphabetic", "hanging": "hanging", "top":"text-before-edge", "bottom":"text-after-edge", "middle":"central"};
        return mapping[textBaseline] || mapping.alphabetic;
    }

    // Unpack entities lookup where the numbers are in radix 32 to reduce the size
    // entity mapping courtesy of tinymce
    namedEntities = createNamedToNumberedLookup(
        '50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
            '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
            '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
            '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
            '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
            '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
            '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
            '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
            '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
            '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
            'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
            'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
            't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
            'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
            'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
            '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
            '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
            '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
            '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
            '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
            'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
            'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
            'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
            '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
            '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);


    //Some basic mappings for attributes and default values.
    STYLES = {
        "strokeStyle":{
            svgAttr : "stroke", //corresponding svg attribute
            canvas : "#000000", //canvas default
            svg : "none",       //svg default
            apply : "stroke"    //apply on stroke() or fill()
        },
        "fillStyle":{
            svgAttr : "fill",
            canvas : "#000000",
            svg : null, //svg default is black, but we need to special case this to handle canvas stroke without fill
            apply : "fill"
        },
        "lineCap":{
            svgAttr : "stroke-linecap",
            canvas : "butt",
            svg : "butt",
            apply : "stroke"
        },
        "lineJoin":{
            svgAttr : "stroke-linejoin",
            canvas : "miter",
            svg : "miter",
            apply : "stroke"
        },
        "miterLimit":{
            svgAttr : "stroke-miterlimit",
            canvas : 10,
            svg : 4,
            apply : "stroke"
        },
        "lineWidth":{
            svgAttr : "stroke-width",
            canvas : 1,
            svg : 1,
            apply : "stroke"
        },
        "globalAlpha": {
            svgAttr : "opacity",
            canvas : 1,
            svg : 1,
            apply : "fill stroke"
        },
        "font":{
            //font converts to multiple svg attributes, there is custom logic for this
            canvas : "10px sans-serif"
        },
        "shadowColor":{
            canvas : "#000000"
        },
        "shadowOffsetX":{
            canvas : 0
        },
        "shadowOffsetY":{
            canvas : 0
        },
        "shadowBlur":{
            canvas : 0
        },
        "textAlign":{
            canvas : "start"
        },
        "textBaseline":{
            canvas : "alphabetic"
        }
    };

    /**
     *
     * @param gradientNode - reference to the gradient
     * @constructor
     */
    CanvasGradient = function(gradientNode, ctx) {
        this.__root = gradientNode;
        this.__ctx = ctx;
    };

    /**
     * Adds a color stop to the gradient root
     */
    CanvasGradient.prototype.addColorStop = function(offset, color) {
        var stop = this.__ctx.__createElement("stop"), regex, matches;
        stop.setAttribute("offset", offset);
        if(color.indexOf("rgba") !== -1) {
            //separate alpha value, since webkit can't handle it
            regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
            matches = regex.exec(color);
            stop.setAttribute("stop-color", format("rgb({r},{g},{b})", {r:matches[1], g:matches[2], b:matches[3]}));
            stop.setAttribute("stop-opacity", matches[4]);
        } else {
            stop.setAttribute("stop-color", color);
        }
        this.__root.appendChild(stop);
    };

    CanvasPattern = function(pattern, ctx) {
        this.__root = pattern;
        this.__ctx = ctx;
    };

    /**
     * The mock canvas context
     * @param o - options include:
     * width - width of your canvas (defaults to 500)
     * height - height of your canvas (defaults to 500)
     * enableMirroring - enables canvas mirroring (get image data) (defaults to false)
     * document - the document object (defaults to the current document)
     */
    ctx = function(o) {

        var defaultOptions = { width:500, height:500, enableMirroring : false}, options;

        //keep support for this way of calling C2S: new C2S(width,height)
        if(arguments.length > 1) {
            options = defaultOptions;
            options.width = arguments[0];
            options.height = arguments[1];
        } else if( !o ) {
            options = defaultOptions;
        } else {
            options = o;
        }

        if(!(this instanceof ctx)) {
            //did someone call this without new?
            return new ctx(options);
        }

        //setup options
        this.width = options.width || defaultOptions.width;
        this.height = options.height || defaultOptions.height;
        this.enableMirroring = options.enableMirroring !== undefined ? options.enableMirroring : defaultOptions.enableMirroring;

        this.canvas = this;   ///point back to this instance!
        this.__document = options.document || document;
        this.__canvas = this.__document.createElement("canvas");
        this.__ctx = this.__canvas.getContext("2d");

        this.__setDefaultStyles();
        this.__stack = [this.__getStyleState()];
        this.__groupStack = [];

        //the root svg element
        this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.__root.setAttribute("version", 1.1);
        this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.__root.setAttribute("width", this.width);
        this.__root.setAttribute("height", this.height);

        //make sure we don't generate the same ids in defs
        this.__ids = {};

        //defs tag
        this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.__root.appendChild(this.__defs);

        //also add a group child. the svg element can't use the transform attribute
        this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.__root.appendChild(this.__currentElement);
    };


    /**
     * Creates the specified svg element
     * @private
     */
    ctx.prototype.__createElement = function (elementName, properties, resetFill) {
        if (typeof properties === "undefined") {
            properties = {};
        }

        var element = this.__document.createElementNS("http://www.w3.org/2000/svg", elementName),
            keys = Object.keys(properties), i, key;
        if(resetFill) {
            //if fill or stroke is not specified, the svg element should not display. By default SVG's fill is black.
            element.setAttribute("fill", "none");
            element.setAttribute("stroke", "none");
        }
        for(i=0; i<keys.length; i++) {
            key = keys[i];
            element.setAttribute(key, properties[key]);
        }
        return element;
    };

    /**
     * Applies default canvas styles to the context
     * @private
     */
    ctx.prototype.__setDefaultStyles = function() {
        //default 2d canvas context properties see:http://www.w3.org/TR/2dcontext/
        var keys = Object.keys(STYLES), i, key;
        for(i=0; i<keys.length; i++) {
            key = keys[i];
            this[key] = STYLES[key].canvas;
        }
    };

    /**
     * Applies styles on restore
     * @param styleState
     * @private
     */
    ctx.prototype.__applyStyleState = function(styleState) {
        var keys = Object.keys(styleState), i, key;
        for(i=0; i<keys.length; i++) {
            key = keys[i];
            this[key] = styleState[key];
        }
    };

    /**
     * Gets the current style state
     * @return {Object}
     * @private
     */
    ctx.prototype.__getStyleState = function() {
        var i, styleState = {}, keys = Object.keys(STYLES), key;
        for(i=0; i<keys.length; i++) {
            key = keys[i];
            styleState[key] = this[key];
        }
        return styleState;
    };

    /**
     * Apples the current styles to the current SVG element. On "ctx.fill" or "ctx.stroke"
     * @param type
     * @private
     */
    ctx.prototype.__applyStyleToCurrentElement = function(type) {
        var keys = Object.keys(STYLES), i, style, value, id, regex, matches;
        for(i=0; i<keys.length; i++) {
            style = STYLES[keys[i]];
            value = this[keys[i]];
            if(style.apply) {
                //is this a gradient or pattern?
                if(style.apply.indexOf("fill")!==-1 && value instanceof CanvasPattern) {
                    //pattern
                    if(value.__ctx) {
                        //copy over defs
                        while(value.__ctx.__defs.childNodes.length) {
                            id = value.__ctx.__defs.childNodes[0].getAttribute("id");
                            this.__ids[id] = id;
                            this.__defs.appendChild(value.__ctx.__defs.childNodes[0]);
                        }
                    }
                    this.__currentElement.setAttribute("fill", format("url(#{id})", {id:value.__root.getAttribute("id")}));
                }
                else if(style.apply.indexOf("fill")!==-1 && value instanceof CanvasGradient) {
                    //gradient
                    this.__currentElement.setAttribute("fill", format("url(#{id})", {id:value.__root.getAttribute("id")}));
                } else if(style.apply.indexOf(type)!==-1 && style.svg !== value) {
                    if((style.svgAttr === "stroke" || style.svgAttr === "fill") && value.indexOf("rgba") !== -1) {
                        //separate alpha value, since illustrator can't handle it
                        regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
                        matches = regex.exec(value);
                        this.__currentElement.setAttribute(style.svgAttr, format("rgb({r},{g},{b})", {r:matches[1], g:matches[2], b:matches[3]}));
                        this.__currentElement.setAttribute(style.svgAttr+"-opacity", matches[4]);
                    } else {
                        //otherwise only update attribute if right type, and not svg default
                        this.__currentElement.setAttribute(style.svgAttr, value);
                    }
                }
            }
        }

    };

    /**
     * Will return the closest group or svg node. May return the current element.
     * @private
     */
    ctx.prototype.__closestGroupOrSvg = function(node) {
        node = node || this.__currentElement;
        if(node.nodeName === "g" || node.nodeName === "svg") {
            return node;
        } else {
            return this.__closestGroupOrSvg(node.parentNode);
        }
    };

    /**
     * Returns the serialized value of the svg so far
     * @param fixNamedEntities - Standalone SVG doesn't support named entities, which document.createTextNode encodes.
     *                           If true, we attempt to find all named entities and encode it as a numeric entity.
     * @return serialized svg
     */
    ctx.prototype.getSerializedSvg = function(fixNamedEntities) {
        var serialized = new XMLSerializer().serializeToString(this.__root),
            keys, i, key, value, regexp, xmlns;

        //IE search for a duplicate xmnls because they didn't implement setAttributeNS correctly
        xmlns = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi;
        if(xmlns.test(serialized)) {
            serialized = serialized.replace('xmlns="http://www.w3.org/2000/svg','xmlns:xlink="http://www.w3.org/1999/xlink');
        }

        if(fixNamedEntities) {
            keys = Object.keys(namedEntities);
            //loop over each named entity and replace with the proper equivalent.
            for(i=0; i<keys.length; i++) {
                key = keys[i];
                value = namedEntities[key];
                regexp = new RegExp(key, "gi");
                if(regexp.test(serialized)) {
                    serialized = serialized.replace(regexp, value);
                }
            }
        }

        return serialized;
    };


    /**
     * Returns the root svg
     * @return
     */
    ctx.prototype.getSvg = function() {
        return this.__root;
    };
    /**
     * Will generate a group tag.
     */
    ctx.prototype.save = function() {
        var group = this.__createElement("g"), parent = this.__closestGroupOrSvg();
        this.__groupStack.push(parent);
        parent.appendChild(group);
        this.__currentElement = group;
        this.__stack.push(this.__getStyleState());
    };
    /**
     * Sets current element to parent, or just root if already root
     */
    ctx.prototype.restore = function(){
        this.__currentElement = this.__groupStack.pop();
        var state = this.__stack.pop();
        this.__applyStyleState(state);

    };

    /**
     * Helper method to add transform
     * @private
     */
    ctx.prototype.__addTransform = function(t) {

        //if the current element has siblings, add another group
        var parent = this.__closestGroupOrSvg();
        if(parent.childNodes.length > 0) {
            var group = this.__createElement("g");
            parent.appendChild(group);
            this.__currentElement = group;
        }

        var transform = this.__currentElement.getAttribute("transform");
        if(transform) {
            transform += " ";
        } else {
            transform = "";
        }
        transform += t;
        this.__currentElement.setAttribute("transform", transform);
    };

    /**
     *  scales the current element
     */
    ctx.prototype.scale = function(x, y) {
        if(y === undefined) {
            y = x;
        }
        this.__addTransform(format("scale({x},{y})", {x:x, y:y}));
    };

    /**
     * rotates the current element
     */
    ctx.prototype.rotate = function(angle){
        var degrees = (angle * 180 / Math.PI);
        this.__addTransform(format("rotate({angle},{cx},{cy})", {angle:degrees, cx:0, cy:0}));
    };

    /**
     * translates the current element
     */
    ctx.prototype.translate = function(x, y){
        this.__addTransform(format("translate({x},{y})", {x:x,y:y}));
    };

    /**
     * applies a transform to the current element
     */
    ctx.prototype.transform = function(a, b, c, d, e, f){
        this.__addTransform(format("matrix({a},{b},{c},{d},{e},{f})", {a:a, b:b, c:c, d:d, e:e, f:f}));
    };

    /**
     * Create a new Path Element
     */
    ctx.prototype.beginPath = function(){
        var path, parent;

        // Note that there is only one current default path, it is not part of the drawing state.
        // See also: https://html.spec.whatwg.org/multipage/scripting.html#current-default-path
        this.__currentDefaultPath = "";
        this.__currentPosition = {};

        path = this.__createElement("path", {}, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(path);
        this.__currentElement = path;
    };

    /**
     * Helper function to apply currentDefaultPath to current path element
     * @private
     */
    ctx.prototype.__applyCurrentDefaultPath = function() {
        if(this.__currentElement.nodeName === "path") {
            var d = this.__currentDefaultPath;
            this.__currentElement.setAttribute("d", d);
        } else {
            throw new Error("Attempted to apply path command to node " + this.__currentElement.nodeName);
        }
    };

    /**
     * Helper function to add path command
     * @private
     */
    ctx.prototype.__addPathCommand = function(command){
        this.__currentDefaultPath += " ";
        this.__currentDefaultPath += command;
    };

    /**
     * Adds the move command to the current path element,
     * if the currentPathElement is not empty create a new path element
     */
    ctx.prototype.moveTo = function(x,y){
        if(this.__currentElement.nodeName !== "path") {
            this.beginPath();
        }

        // creates a new subpath with the given point
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("M {x} {y}", {x:x, y:y}));
    };

    /**
     * Closes the current path
     */
    ctx.prototype.closePath = function(){
        this.__addPathCommand("Z");
    };

    /**
     * Adds a line to command
     */
    ctx.prototype.lineTo = function(x, y){
        this.__currentPosition = {x: x, y: y};
        if (this.__currentDefaultPath.indexOf('M') > -1) {
            this.__addPathCommand(format("L {x} {y}", {x:x, y:y}));
        } else {
            this.__addPathCommand(format("M {x} {y}", {x:x, y:y}));
        }
    };

    /**
     * Add a bezier command
     */
    ctx.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}",
            {cp1x:cp1x, cp1y:cp1y, cp2x:cp2x, cp2y:cp2y, x:x, y:y}));
    };

    /**
     * Adds a quadratic curve to command
     */
    ctx.prototype.quadraticCurveTo = function(cpx, cpy, x, y){
        this.__currentPosition = {x: x, y: y};
        this.__addPathCommand(format("Q {cpx} {cpy} {x} {y}", {cpx:cpx, cpy:cpy, x:x, y:y}));
    };


    /**
     * Return a new normalized vector of given vector
     */
    var normalize = function(vector) {
        var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        return [vector[0] / len, vector[1] / len];
    };

    /**
     * Adds the arcTo to the current path
     *
     * @see http://www.w3.org/TR/2015/WD-2dcontext-20150514/#dom-context-2d-arcto
     */
    ctx.prototype.arcTo = function(x1, y1, x2, y2, radius) {
        // Let the point (x0, y0) be the last point in the subpath.
        var x0 = this.__currentPosition && this.__currentPosition.x;
        var y0 = this.__currentPosition && this.__currentPosition.y;

        // First ensure there is a subpath for (x1, y1).
        if (typeof x0 == "undefined" || typeof y0 == "undefined") {
            return;
        }

        // Negative values for radius must cause the implementation to throw an IndexSizeError exception.
        if (radius < 0) {
            throw new Error("IndexSizeError: The radius provided (" + radius + ") is negative.");
        }

        // If the point (x0, y0) is equal to the point (x1, y1),
        // or if the point (x1, y1) is equal to the point (x2, y2),
        // or if the radius radius is zero,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        if (((x0 === x1) && (y0 === y1))
            || ((x1 === x2) && (y1 === y2))
            || (radius === 0)) {
            this.lineTo(x1, y1);
            return;
        }

        // Otherwise, if the points (x0, y0), (x1, y1), and (x2, y2) all lie on a single straight line,
        // then the method must add the point (x1, y1) to the subpath,
        // and connect that point to the previous point (x0, y0) by a straight line.
        var unit_vec_p1_p0 = normalize([x0 - x1, y0 - y1]);
        var unit_vec_p1_p2 = normalize([x2 - x1, y2 - y1]);
        if (unit_vec_p1_p0[0] * unit_vec_p1_p2[1] === unit_vec_p1_p0[1] * unit_vec_p1_p2[0]) {
            this.lineTo(x1, y1);
            return;
        }

        // Otherwise, let The Arc be the shortest arc given by circumference of the circle that has radius radius,
        // and that has one point tangent to the half-infinite line that crosses the point (x0, y0) and ends at the point (x1, y1),
        // and that has a different point tangent to the half-infinite line that ends at the point (x1, y1), and crosses the point (x2, y2).
        // The points at which this circle touches these two lines are called the start and end tangent points respectively.

        // note that both vectors are unit vectors, so the length is 1
        var cos = (unit_vec_p1_p0[0] * unit_vec_p1_p2[0] + unit_vec_p1_p0[1] * unit_vec_p1_p2[1]);
        var theta = Math.acos(Math.abs(cos));

        // Calculate origin
        var unit_vec_p1_origin = normalize([
            unit_vec_p1_p0[0] + unit_vec_p1_p2[0],
            unit_vec_p1_p0[1] + unit_vec_p1_p2[1]
        ]);
        var len_p1_origin = radius / Math.sin(theta / 2);
        var x = x1 + len_p1_origin * unit_vec_p1_origin[0];
        var y = y1 + len_p1_origin * unit_vec_p1_origin[1];

        // Calculate start angle and end angle
        // rotate 90deg clockwise (note that y axis points to its down)
        var unit_vec_origin_start_tangent = [
            -unit_vec_p1_p0[1],
            unit_vec_p1_p0[0]
        ];
        // rotate 90deg counter clockwise (note that y axis points to its down)
        var unit_vec_origin_end_tangent = [
            unit_vec_p1_p2[1],
            -unit_vec_p1_p2[0]
        ];
        var getAngle = function(vector) {
            // get angle (clockwise) between vector and (1, 0)
            var x = vector[0];
            var y = vector[1];
            if (y >= 0) { // note that y axis points to its down
                return Math.acos(x);
            } else {
                return -Math.acos(x);
            }
        };
        var startAngle = getAngle(unit_vec_origin_start_tangent);
        var endAngle = getAngle(unit_vec_origin_end_tangent);

        // Connect the point (x0, y0) to the start tangent point by a straight line
        this.lineTo(x + unit_vec_origin_start_tangent[0] * radius,
                    y + unit_vec_origin_start_tangent[1] * radius);

        // Connect the start tangent point to the end tangent point by arc
        // and adding the end tangent point to the subpath.
        this.arc(x, y, radius, startAngle, endAngle);
    };

    /**
     * Sets the stroke property on the current element
     */
    ctx.prototype.stroke = function(){
        if(this.__currentElement.nodeName === "path") {
            this.__currentElement.setAttribute("paint-order", "fill stroke markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("stroke");
    };

    /**
     * Sets fill properties on the current element
     */
    ctx.prototype.fill = function(){
        if(this.__currentElement.nodeName === "path") {
            this.__currentElement.setAttribute("paint-order", "stroke fill markers");
        }
        this.__applyCurrentDefaultPath();
        this.__applyStyleToCurrentElement("fill");
    };

    /**
     *  Adds a rectangle to the path.
     */
    ctx.prototype.rect = function(x, y, width, height){
        if(this.__currentElement.nodeName !== "path") {
            this.beginPath();
        }
        this.moveTo(x, y);
        this.lineTo(x+width, y);
        this.lineTo(x+width, y+height);
        this.lineTo(x, y+height);
        this.lineTo(x, y);
        this.closePath();
    };


    /**
     * adds a rectangle element
     */
    ctx.prototype.fillRect = function(x, y, width, height){
        var rect, parent;
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("fill");
    };

    /**
     * Draws a rectangle with no fill
     * @param x
     * @param y
     * @param width
     * @param height
     */
    ctx.prototype.strokeRect = function(x, y, width, height){
        var rect, parent;
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height
        }, true);
        parent = this.__closestGroupOrSvg();
        parent.appendChild(rect);
        this.__currentElement = rect;
        this.__applyStyleToCurrentElement("stroke");
    };


    /**
     * "Clears" a canvas by just drawing a white rectangle in the current group.
     */
    ctx.prototype.clearRect = function(x, y, width, height) {
        var rect, parent = this.__closestGroupOrSvg();
        rect = this.__createElement("rect", {
            x : x,
            y : y,
            width : width,
            height : height,
            fill : "#FFFFFF"
        }, true);
        parent.appendChild(rect);
    };

    /**
     * Adds a linear gradient to a defs tag.
     * Returns a canvas gradient object that has a reference to it's parent def
     */
    ctx.prototype.createLinearGradient = function(x1, y1, x2, y2){
        var grad = this.__createElement("linearGradient", {
            id : randomString(this.__ids),
            x1 : x1+"px",
            x2 : x2+"px",
            y1 : y1+"px",
            y2 : y2+"px",
            "gradientUnits" : "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);
    };

    /**
     * Adds a radial gradient to a defs tag.
     * Returns a canvas gradient object that has a reference to it's parent def
     */
    ctx.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1){
        var grad = this.__createElement("radialGradient", {
            id : randomString(this.__ids),
            cx : x1+"px",
            cy : y1+"px",
            r  : r1+"px",
            fx : x0+"px",
            fy : y0+"px",
            "gradientUnits" : "userSpaceOnUse"
        }, false);
        this.__defs.appendChild(grad);
        return new CanvasGradient(grad, this);

    };

    /**
     * Parses the font string and returns svg mapping
     * @private
     */
    ctx.prototype.__parseFont = function() {
        var regex = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\"\sa-z]+?)\s*$/i;
        var fontPart = regex.exec( this.font );
        var data = {
            style : fontPart[1] || 'normal',
            size : fontPart[4] || '10px',
            family : fontPart[6] || 'sans-serif',
            weight: fontPart[3] || 'normal',
            decoration : fontPart[2] || 'normal',
            href : null
        };

        //canvas doesn't support underline natively, but we can pass this attribute
        if(this.__fontUnderline === "underline") {
            data.decoration = "underline";
        }

        //canvas also doesn't support linking, but we can pass this as well
        if(this.__fontHref) {
            data.href = this.__fontHref;
        }

        return data;
    };

    /**
     * Helper to link text fragments
     * @param font
     * @param element
     * @return {*}
     * @private
     */
    ctx.prototype.__wrapTextLink = function(font, element) {
        if(font.href) {
            var a = this.__createElement("a");
            a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", font.href);
            a.appendChild(element);
            return a;
        }
        return element;
    };

    /**
     * Fills or strokes text
     * @param text
     * @param x
     * @param y
     * @param action - stroke or fill
     * @private
     */
    ctx.prototype.__applyText = function(text, x, y, action) {
        var font = this.__parseFont(),
            parent = this.__closestGroupOrSvg(),
            textElement = this.__createElement("text", {
                "font-family" : font.family,
                "font-size" : font.size,
                "font-style" : font.style,
                "font-weight" : font.weight,
                "text-decoration" : font.decoration,
                "x" : x,
                "y" : y,
                "text-anchor": getTextAnchor(this.textAlign),
                "dominant-baseline": getDominantBaseline(this.textBaseline)
            }, true);

        textElement.appendChild(this.__document.createTextNode(text));
        this.__currentElement = textElement;
        this.__applyStyleToCurrentElement(action);
        parent.appendChild(this.__wrapTextLink(font,textElement));
    };

    /**
     * Creates a text element
     * @param text
     * @param x
     * @param y
     */
    ctx.prototype.fillText = function(text, x, y){
        this.__applyText(text, x, y, "fill");
    };

    /**
     * Strokes text
     * @param text
     * @param x
     * @param y
     */
    ctx.prototype.strokeText = function(text, x, y){
        this.__applyText(text, x, y, "stroke");
    };

    /**
     * No need to implement this for svg.
     * @param text
     * @return {TextMetrics}
     */
    ctx.prototype.measureText = function(text){
        this.__ctx.font = this.font;
        return this.__ctx.measureText(text);
    };

    /**
     *  Arc command!
     */
    ctx.prototype.arc = function(x, y, radius, startAngle, endAngle, counterClockwise) {
        // in canvas no circle is drawn if no angle is provided.
        if (startAngle === endAngle) {
            return;
        }
        startAngle = startAngle % (2*Math.PI);
        endAngle = endAngle % (2*Math.PI);
        if(startAngle === endAngle) {
            //circle time! subtract some of the angle so svg is happy (svg elliptical arc can't draw a full circle)
            endAngle = ((endAngle + (2*Math.PI)) - 0.001 * (counterClockwise ? -1 : 1)) % (2*Math.PI);
        }
        var endX = x+radius*Math.cos(endAngle),
            endY = y+radius*Math.sin(endAngle),
            startX = x+radius*Math.cos(startAngle),
            startY = y+radius*Math.sin(startAngle),
            sweepFlag = counterClockwise ? 0 : 1,
            largeArcFlag = 0,
            diff = endAngle - startAngle;

        // https://github.com/gliffy/canvas2svg/issues/4
        if(diff < 0) {
            diff += 2*Math.PI;
        }

        if(counterClockwise) {
            largeArcFlag = diff > Math.PI ? 0 : 1;
        } else {
            largeArcFlag = diff > Math.PI ? 1 : 0;
        }

        this.lineTo(startX, startY);
        this.__addPathCommand(format("A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}",
            {rx:radius, ry:radius, xAxisRotation:0, largeArcFlag:largeArcFlag, sweepFlag:sweepFlag, endX:endX, endY:endY}));

        this.__currentPosition = {x: endX, y: endY};
    };

    /**
     * Generates a ClipPath from the clip command.
     */
    ctx.prototype.clip = function(){
        var group = this.__closestGroupOrSvg(),
            clipPath = this.__createElement("clipPath"),
            id =  randomString(this.__ids),
            newGroup = this.__createElement("g");

        group.removeChild(this.__currentElement);
        clipPath.setAttribute("id", id);
        clipPath.appendChild(this.__currentElement);

        this.__defs.appendChild(clipPath);

        //set the clip path to this group
        group.setAttribute("clip-path", format("url(#{id})", {id:id}));

        //clip paths can be scaled and transformed, we need to add another wrapper group to avoid later transformations
        // to this path
        group.appendChild(newGroup);

        this.__currentElement = newGroup;

    };

    /**
     * Draws a canvas, image or mock context to this canvas.
     * Note that all svg dom manipulation uses node.childNodes rather than node.children for IE support.
     * http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
     */
    ctx.prototype.drawImage = function(){
        //convert arguments to a real array
        var args = Array.prototype.slice.call(arguments),
            image=args[0],
            dx, dy, dw, dh, sx=0, sy=0, sw, sh, parent, svg, defs, group,
            currentElement, svgImage, canvas, context, id;

        if(args.length === 3) {
            dx = args[1];
            dy = args[2];
            sw = image.width;
            sh = image.height;
            dw = sw;
            dh = sh;
        } else if(args.length === 5) {
            dx = args[1];
            dy = args[2];
            dw = args[3];
            dh = args[4];
            sw = image.width;
            sh = image.height;
        } else if(args.length === 9) {
            sx = args[1];
            sy = args[2];
            sw = args[3];
            sh = args[4];
            dx = args[5];
            dy = args[6];
            dw = args[7];
            dh = args[8];
        } else {
            throw new Error("Inavlid number of arguments passed to drawImage: " + arguments.length);
        }

        parent = this.__closestGroupOrSvg();
        currentElement = this.__currentElement;

        if(image instanceof ctx) {
            //canvas2svg mock canvas context. In the future we may want to clone nodes instead.
            //also I'm currently ignoring dw, dh, sw, sh, sx, sy for a mock context.
            svg = image.getSvg();
            defs = svg.childNodes[0];
            while(defs.childNodes.length) {
                id = defs.childNodes[0].getAttribute("id");
                this.__ids[id] = id;
                this.__defs.appendChild(defs.childNodes[0]);
            }
            group = svg.childNodes[1];
            parent.appendChild(group);
            this.__currentElement = group;
            this.translate(dx, dy);
            this.__currentElement = currentElement;
        } else if(image.nodeName === "CANVAS" || image.nodeName === "IMG") {
            //canvas or image
            svgImage = this.__createElement("image");
            svgImage.setAttribute("width", dw);
            svgImage.setAttribute("height", dh);
            svgImage.setAttribute("preserveAspectRatio", "none");

            if(sx || sy || sw !== image.width || sh !== image.height) {
                //crop the image using a temporary canvas
                canvas = this.__document.createElement("canvas");
                canvas.width = dw;
                canvas.height = dh;
                context = canvas.getContext("2d");
                context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
                image = canvas;
            }

            svgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
                image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
            parent.appendChild(svgImage);
            this.__currentElement = svgImage;
            this.translate(dx, dy);
            this.__currentElement = currentElement;
        }
    };

    /**
     * Generates a pattern tag
     */
    ctx.prototype.createPattern = function(image, repetition){
        var pattern = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"), id = randomString(this.__ids),
            img;
        pattern.setAttribute("id", id);
        pattern.setAttribute("width", image.width);
        pattern.setAttribute("height", image.height);
        if(image.nodeName === "CANVAS" || image.nodeName === "IMG") {
            img = this.__document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.setAttribute("width", image.width);
            img.setAttribute("height", image.height);
            img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href",
                image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src"));
            pattern.appendChild(img);
            this.__defs.appendChild(pattern);
        } else if(image instanceof ctx) {
            pattern.appendChild(image.__root.childNodes[1]);
            this.__defs.appendChild(pattern);
        }
        return new CanvasPattern(pattern, this);
    };

    /**
     * Not yet implemented
     */
    ctx.prototype.drawFocusRing = function(){};
    ctx.prototype.createImageData = function(){};
    ctx.prototype.getImageData = function(){};
    ctx.prototype.putImageData = function(){};
    ctx.prototype.globalCompositeOperation = function(){};
    ctx.prototype.setTransform = function(){};

    //add options for alternative namespace
    if (typeof window === "object") {
        window.C2S = ctx;
    }

    // CommonJS/Browserify
    {
        module.exports = ctx;
    }

}());
});

var FileSaver_min = createCommonjsModule(function (module, exports) {
(function(a,b){if("function"==typeof undefined&&undefined.amd)undefined([],b);else b();})(commonjsGlobal,function(){function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"), b={autoBom:!b}), b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b), e.responseType="blob", e.onload=function(){a(e.response,c,d);}, e.onerror=function(){console.error("could not download file");}, e.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null), a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download", j.download=g, j.rel="noopener", "string"==typeof b?(j.href=b, j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b), setTimeout(function(){i.revokeObjectURL(j.href);},4E4), setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download", "string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f, i.target="_blank", setTimeout(function(){e(i);});}}:function(a,b,d,e){if(e=e||open("","_blank"), e&&(e.document.title=e.document.body.innerText="downloading..."), "string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"), e?e.location.href=a:location=a, e=null;}, j.readAsDataURL(a);}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l, e=null, setTimeout(function(){k.revokeObjectURL(l);},4E4);}});f.saveAs=a.saveAs=a, "undefined"!='object'&&(module.exports=a);});


});

var SVGCanvas = function SVGCanvas(width, height, canvas) {
    var this$1 = this;

    if (!width || !height) {
        throw new Error('You must specify a width and a height');
    }
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    if (this.canvas) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
    }
    this.ctx = this.canvas ? this.canvas.getContext('2d') : new canvas2svg(width, height);
    this.ctx.isSVG = !this.canvas;
    this.ctx.beginSVGGroup = this.ctx.save;
    this.ctx.endSVGGroup = this.ctx.restore;
    this.ctx.group = (function (fn) {
        this$1.ctx.isSVG && this$1.ctx.beginSVGGroup();
        fn();
        this$1.ctx.isSVG && this$1.ctx.endSVGGroup();
    });
};

var prototypeAccessors$1 = { context: { configurable: true },svg: { configurable: true },serializedSvg: { configurable: true } };
var staticAccessors$1 = { SUPPORTED_MIME_TYPES: { configurable: true } };
prototypeAccessors$1.context.get = function () {
    return this.ctx;
};
prototypeAccessors$1.svg.get = function () {
    return this.ctx.getSvg();
};
prototypeAccessors$1.serializedSvg.get = function () {
    return this.ctx.getSerializedSvg(true);
};
SVGCanvas.prototype.toBlob = function toBlob (type) {
    return new Promise((function ($return, $error) {
            var this$1 = this;

        if (!type) 
            { type = this.ctx.isSVG ? 'image/svg+xml' : 'image/png'; }
        if (!SVGCanvas.isSupportedMimeType(type)) {
            return $error(new Error(("Invalid or unsupported mime type.\nSupported mime types are: " + (SVGCanvas.SUPPORTED_MIME_TYPES))));
        }
        if (type === 'image/svg+xml' && !this.ctx.isSVG) {
            return $error(new Error("image/svg+xml mime type is not compatible with the current context."));
        }
        return $return(type === 'image/svg+xml' ? new Blob([this.serializedSvg], {
            type: 'image/svg+xml;charset=utf-8'
        }) : new Promise(function (resolve) { return this$1.canvas.toBlob(resolve, type); }));
    }).bind(this));
};
SVGCanvas.prototype.didMount = function didMount () {};
SVGCanvas.prototype.mount = function mount (parent, sibling) {
        if ( sibling === void 0 ) sibling = null;

    if (!parent || this.mounted) 
        { return; }
    this.parent = parent;
    this.el = this.canvas || this.svg;
    if (sibling) 
        { this.parent.insertBefore(this.el, sibling); }
     else 
        { this.parent.appendChild(this.el); }
    this.mounted = true;
    this.didMount(this.el);
};
SVGCanvas.prototype.background = function background (color) {
    drawBackground(0, 0, this.width, this.height, {
        color: color,
        ctx: this.ctx
    });
};
SVGCanvas.prototype.copy = function copy (canvas) {
        if ( canvas === void 0 ) canvas = document.createElement('canvas');

    if (this.ctx.isSVG) 
        { throw new Error('Copying canvas with SVG context is not supported yet'); }
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.canvas, 0, 0);
    return canvas;
};
SVGCanvas.prototype.clear = function clear () {
    if (!this.ctx.isSVG) 
        { this.ctx.clearRect(0, 0, this.width, this.height); }
     else {
        if (!this.mounted) 
            { return; }
        this.el.querySelector('g').innerHTML = '';
    }
};
staticAccessors$1.SUPPORTED_MIME_TYPES.get = function () {
    return ['image/png','image/jpeg','image/svg+xml'];
};
SVGCanvas.isSupportedMimeType = function isSupportedMimeType (type) {
    return SVGCanvas.SUPPORTED_MIME_TYPES.includes(type);
};
SVGCanvas.prototype.save = function save (filename, ref) {
        if ( filename === void 0 ) filename = Date.now();
        if ( ref === void 0 ) ref = {};
        var type = ref.type; if ( type === void 0 ) type = 'image/png';

    return new Promise((function ($return, $error) {
        var blob;
        if (!SVGCanvas.isSupportedMimeType(type)) {
            return $error(new Error(("Invalid or unsupported mime type.\nSupported mime types are: " + (SVGCanvas.SUPPORTED_MIME_TYPES))));
        }
        return this.toBlob(type).then(function ($await_1) {
            try {
                blob = $await_1;
                return $return(FileSaver_min.saveAs(blob, filename));
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }, $error);
    }).bind(this));
};

Object.defineProperties( SVGCanvas.prototype, prototypeAccessors$1 );
Object.defineProperties( SVGCanvas, staticAccessors$1 );

var Landscape = (function (SVGCanvas$$1) {
    function Landscape(grounds, ref) {
        if ( ref === void 0 ) ref = {};
        var canvas = ref.canvas; if ( canvas === void 0 ) canvas = null;
        var backgroundColor = ref.backgroundColor; if ( backgroundColor === void 0 ) backgroundColor = 'transparent';

        SVGCanvas$$1.call(this, grounds[0].width, grounds[0].height, canvas);
        this.backgroundColor = backgroundColor;
        this.grounds = grounds;
    }

    if ( SVGCanvas$$1 ) Landscape.__proto__ = SVGCanvas$$1;
    Landscape.prototype = Object.create( SVGCanvas$$1 && SVGCanvas$$1.prototype );
    Landscape.prototype.constructor = Landscape;

    var prototypeAccessors = { grounds: { configurable: true } };
    prototypeAccessors.grounds.get = function () {
        return this._grounds;
    };
    prototypeAccessors.grounds.set = function (grounds) {
        var this$1 = this;

        var foregrounds = [];
        this._grounds = grounds.map(function (ground, index) {
            ground.setBehind(foregrounds);
            if (ground.isEmpty) 
                { return null; }
            foregrounds.push(ground);
            if (!this$1.ctx.isSVG) {
                ground.createSprite(this$1.ctx);
            }
            return ground;
        }).filter(Boolean);
    };
    Landscape.prototype._updateAABB = function _updateAABB (ref) {
        var xmin = ref.xmin;
        var xmax = ref.xmax;
        var ymin = ref.ymin;
        var ymax = ref.ymax;

        this.aabb = this.aabb || {
            xmin: Number.POSITIVE_INFINITY,
            ymin: Number.POSITIVE_INFINITY,
            xmax: Number.NEGATIVE_INFINITY,
            ymax: Number.NEGATIVE_INFINITY
        };
        if (xmin < this.aabb.xmin) 
            { this.aabb.xmin = xmin; }
        if (ymin < this.aabb.ymin) 
            { this.aabb.ymin = ymin; }
        if (xmax > this.aabb.xmax) 
            { this.aabb.xmax = xmax; }
        if (ymax > this.aabb.ymax) 
            { this.aabb.ymax = ymax; }
    };
    Landscape.prototype.render = function render (ctx) {
        var this$1 = this;
        if ( ctx === void 0 ) ctx = this.ctx;

        SVGCanvas$$1.prototype.background.call(this, this.backgroundColor);
        this.grounds.forEach(function (ground, index) {
            if (ground.sprite) 
                { ctx.drawImage(ground.sprite, 0, 0); }
             else 
                { ground.render(ctx); }
            this$1._updateAABB(ground.aabb);
        });
        return this;
    };
    Landscape.prototype.ensureSVGContext = function ensureSVGContext () {
        return this.ctx.isSVG ? this : new Landscape(this.grounds, {
            canvas: null,
            backgroundColor: this.backgroundColor
        }).render();
    };
    Landscape.prototype.save = function save (filename, ref) {
        if ( ref === void 0 ) ref = {};
        var type = ref.type;

        return type === 'image/svg+xml' && !this.ctx.isSVG ? this.ensureSVGContext().save(filename, {
            type: type
        }) : SVGCanvas$$1.prototype.save.call(this, filename, {
            type: type
        });
    };

    Object.defineProperties( Landscape.prototype, prototypeAccessors );

    return Landscape;
}(SVGCanvas));

var Line = function Line(equation) {
    if ( equation === void 0 ) equation = function (x) { return 0.5; };

    this._equation = equation;
    this.points = [];
};
Line.prototype.compute = function compute (x, ref) {
        if ( ref === void 0 ) ref = {};
        var force = ref.force; if ( force === void 0 ) force = false;

    if (force || this.points[x] === undefined) {
        this.points[x] = this._equation(x);
    }
    return this.points[x];
};
Line.perlin = function perlin (ref) {
        if ( ref === void 0 ) ref = {};
        var seed = ref.seed; if ( seed === void 0 ) seed = null;
        var octaves = ref.octaves; if ( octaves === void 0 ) octaves = 2;
        var lacunarity = ref.lacunarity; if ( lacunarity === void 0 ) lacunarity = 2;
        var gain = ref.gain; if ( gain === void 0 ) gain = 0.5;
        var resolution = ref.resolution; if ( resolution === void 0 ) resolution = 32;

    var noise = new tumult.Perlin1(seed).transform(function (v) {
        return lib_6$1(this.gen(v / resolution), -1, 1);
    });
    return function (x) {
        var y = 0;
        var amplitude = 0.5;
        var frequency = 1.0;
        for (var i = 0;i < octaves; i++) {
            y += amplitude * noise(frequency * x);
            frequency *= lacunarity;
            amplitude *= gain;
        }
        return Math.sin(y);
    };
};
Line.simplex = function simplex (ref) {
        if ( ref === void 0 ) ref = {};
        var seed = ref.seed; if ( seed === void 0 ) seed = null;
        var octaves = ref.octaves; if ( octaves === void 0 ) octaves = 2;

    var frequency = Math.pow(2, octaves);
    return new tumult.Simplex1(seed).transform(function (v) {
        return (Math.sin(1 / this.gen(v / frequency)) + 1) / 2;
    });
};

function randomOf (arr, rng) {
	if ( rng === void 0 ) rng = Math.random;

	return arr[Math.floor(rng() * arr.length)];
}

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

var seed = Date.now();
var randomizer = fastRandom(seed);
var prng = {
    set seed(newSeed) {
        seed = newSeed;
        randomizer = fastRandom(seed);
    },
    get seed() {
        return seed;
    },
    reset: function () {
        randomizer = fastRandom(seed);
    },
    random: function () { return randomizer.nextFloat(); },
    randomOf: function (arr) { return randomOf(arr, randomizer.nextFloat); },
    randomFloat: function (min, max) { return randomizer.nextFloat() * (max - min) + min; },
    randomInt: function (min, max) { return Math.floor(randomizer.nextFloat() * (max - min) + min); }
}

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
}

function shuffle (a, prng) {
    if ( prng === void 0 ) prng = Math.random;

    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(prng() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function median (arr, ref) {
    if ( arr === void 0 ) arr = [];
    if ( ref === void 0 ) ref = {};
    var alreadySorted = ref.alreadySorted; if ( alreadySorted === void 0 ) alreadySorted = false;
    var alreadyCloned = ref.alreadyCloned; if ( alreadyCloned === void 0 ) alreadyCloned = false;

    var values = alreadyCloned ? arr : arr.slice(0);
    var numbers = alreadySorted ? values : values.sort(function (a, b) { return a - b; });
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}

var erode = function (landscape, ref) {
    if ( ref === void 0 ) ref = {};
    var autoplay = ref.autoplay; if ( autoplay === void 0 ) autoplay = true;
    var easing = ref.easing; if ( easing === void 0 ) easing = 0.09;
    var noUpdateThreshold = ref.noUpdateThreshold; if ( noUpdateThreshold === void 0 ) noUpdateThreshold = 1;
    var columnWidth = ref.columnWidth; if ( columnWidth === void 0 ) columnWidth = 16;
    var snapToGrid = ref.snapToGrid; if ( snapToGrid === void 0 ) snapToGrid = 8;
    var round = ref.round; if ( round === void 0 ) round = true;
    var breaks = ref.breaks; if ( breaks === void 0 ) breaks = 2;
    var amplitude = ref.amplitude; if ( amplitude === void 0 ) amplitude = [0,
    200];
    var scaleFactor = ref.scaleFactor; if ( scaleFactor === void 0 ) scaleFactor = 1;

    if (landscape.ctx.isSVG) {
        throw new Error('Eroding canvas only works on non SVG context for now');
    }
    var length = Math.ceil(landscape.width / columnWidth);
    var buffer = landscape.copy();
    var points = [];
    var shouldUpdate = autoplay;
    build();
    raf.add(update);
    return {
        rebuild: build,
        toggle: function () {
            shouldUpdate = !shouldUpdate;
        },
        play: function () {
            shouldUpdate = true;
        },
        pause: function () {
            shouldUpdate = false;
        },
        destroy: function () { return raf.remove(update); }
    };
    function build() {
        var breakpoints = [];
        for (var i = 0;i < breaks; i++) 
            { breakpoints.push(prng.randomInt(0, length)); }
        breakpoints.push(length);
        var linesIndexes = [];
        breakpoints.sort(function (a, b) { return a - b; }).forEach(function (breakpoint, index) {
            linesIndexes = linesIndexes.concat(new Array(breakpoint - linesIndexes.length).fill(index));
        });
        var lines = shuffle(landscape.grounds).slice(0, breaks + 1).map(function (g) { return g.line; });
        points = linesIndexes.map(function (lineIndex, index) { return ({
            t: 1 - lines[lineIndex].compute(index * columnWidth * scaleFactor),
            v: points[index] ? points[index].v : 0
        }); });
        var values = points.map(function (ref) {
            var t = ref.t;

            return t;
        }).sort(function (a, b) { return a - b; });
        var m = median(values, {
            alreadyCloned: true,
            alreadySorted: true
        });
        var min = values[0];
        var max = values[values.length - 1];
        points.forEach(function (p) {
            p.t = lib_8(p.t - m, min - m, max - m, amplitude[0], amplitude[1]);
            if (snapToGrid && snapToGrid > 0) 
                { p.t = roundTo(p.t, snapToGrid); }
        });
    }
    
    function update(dt) {
        if (!shouldUpdate) 
            { return; }
        shouldUpdate = false;
        landscape.background(landscape.backgroundColor);
        points.forEach(function (p, index) {
            p.v += (p.t - p.v) * easing;
            if (Math.abs(p.t - p.v) > noUpdateThreshold) {
                shouldUpdate = true;
            }
            var x = index * columnWidth;
            var y = round ? Math.floor(p.v) : p.v;
            landscape.ctx.drawImage(buffer, x, 0, columnWidth, buffer.height - 2, x, y, columnWidth, buffer.height - 2);
        });
    }
    
};

/*
 * anime.js v3.1.0
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps$1(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.round(t * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps$1, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  switch (path.property) {
    case 'x': return (p.x - svg.x) * svg.w;
    case 'y': return (p.y - svg.y) * svg.h;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];
var pausedInstances = [];
var raf$2;

var engine = (function () {
  function play() { 
    raf$2 = requestAnimationFrame(step);
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    if (activeInstancesLength) {
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);
          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }
        i++;
      }
      play();
    } else {
      raf$2 = cancelAnimationFrame(raf$2);
    }
  }
  return play;
})();

function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) { return ins.pause(); });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) { return ins.play(); });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    if (!raf$2) { engine(); }
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargets(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.1.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

var hueRotate = function (landscape, ref) {
    if ( ref === void 0 ) ref = {};
    var autoplay = ref.autoplay; if ( autoplay === void 0 ) autoplay = true;
    var duration = ref.duration; if ( duration === void 0 ) duration = 1000;
    var easing = ref.easing; if ( easing === void 0 ) easing = 'linear';
    var loop = ref.loop; if ( loop === void 0 ) loop = true;
    var containerClass = ref.containerClass; if ( containerClass === void 0 ) containerClass = 'ffp-container';

    var parent = landscape.parent || landscape.canvas.parentNode;
    var container = document.createElement('div');
    container.classList.add(containerClass);
    parent.insertBefore(container, landscape.canvas.nextSibling);
    landscape.canvas.style.display = 'none';
    container.style.position = 'absolute';
    container.style.width = landscape.width + 'px';
    container.style.height = landscape.height + 'px';
    container.style.backgroundColor = landscape.backgroundColor;
    landscape.grounds.forEach(function (ground) {
        var img = new Image();
        img.src = ground.sprite.toDataURL();
        img.style.position = 'absolute';
        container.appendChild(img);
    });
    var api = anime({
        autoplay: autoplay,
        duration: duration,
        easing: easing,
        loop: loop,
        targets: container.querySelectorAll('img'),
        filter: function () {
            var off = Math.floor(Math.random() * 360);
            var dir = Math.sign(Math.sin(Math.random() * Math.PI));
            return [("hue-rotate(" + off + "deg)"),("hue-rotate(" + (off + 360 * dir) + "deg)")];
        }
    });
    api.clear = (function () {
        container.remove();
        landscape.canvas.style.display = '';
    });
    return api;
};

var swatches = {
    1: ['rgb(120,0,100)','rgb(160,15,150)','rgb(200,30,200)','rgb(255,50,255)','rgb(255,90,190)',
        'rgb(255,120,140)','rgb(255,165,165)','rgb(255,215,235)'],
    2: ['rgb(80,20,100)','rgb(110,30,130)','rgb(140,35,160)','rgb(170,40,190)','rgb(180,60,255)',
        'rgb(190,100,255)','rgb(200,150,255)','rgb(210,200,255)'],
    3: ['rgb(0,0,90)','rgb(0,0,160)','rgb(0,0,255)','rgb(0,120,255)','rgb(60,185,255)',
        'rgb(0,200,255)','rgb(60,255,255)','rgb(220,255,255)'],
    4: ['rgb(0,60,39)','rgb(0,90,59)','rgb(0,120,90)','rgb(0,151,120)','rgb(0,181,150)',
        'rgb(52,231,200)','rgb(116,246,210)','rgb(179,254,225)'],
    5: ['rgb(39,75,0)','rgb(27,95,15)','rgb(14,116,36)','rgb(0,170,43)','rgb(0,210,63)',
        'rgb(0,252,29)','rgb(85,253,127)','rgb(178,253,157)'],
    6: ['rgb(140,114,0)','rgb(180,139,0)','rgb(221,179,0)','rgb(255,218,0)','rgb(255,253,0)',
        'rgb(255,249,88)','rgb(255,245,155)','rgb(255,254,218)'],
    7: ['rgb(101,44,80)','rgb(141,58,57)','rgb(181,72,30)','rgb(201,88,0)','rgb(226,113,0)',
        'rgb(255,137,0)','rgb(255,168,64)','rgb(255,199,147)'],
    8: ['rgb(91,4,38)','rgb(151,11,57)','rgb(197,15,43)','rgb(222,18,27)','rgb(255,22,6)',
        'rgb(255,53,49)','rgb(255,118,116)','rgb(255,189,189)'],
    9: ['rgb(40,19,0)','rgb(71,39,17)','rgb(101,59,42)','rgb(136,115,99)','rgb(175,145,128)',
        'rgb(210,179,158)','rgb(220,200,179)','rgb(236,220,199)'],
    10: ['rgb(28,61,91)','rgb(59,100,131)','rgb(78,130,161)','rgb(98,161,181)','rgb(119,170,191)',
        'rgb(150,180,201)','rgb(169,200,210)','rgb(199,220,230)'],
    11: ['rgb(44,18,153)','rgb(85,28,202)','rgb(109,45,255)','rgb(130,82,255)','rgb(150,122,255)',
        'rgb(160,171,255)','rgb(180,206,255)','rgb(194,235,255)'],
    12: ['rgb(121,0,100)','rgb(161,12,151)','rgb(80,20,101)','rgb(110,30,131)','rgb(90,0,39)',
        'rgb(151,0,58)'],
    13: ['rgb(0,3,91)','rgb(0,9,162)','rgb(45,7,152)','rgb(85,26,203)','rgb(29,60,91)',
        'rgb(59,100,131)'],
    14: ['rgb(0,60,40)','rgb(0,90,60)','rgb(39,75,0)','rgb(28,95,15)','rgb(40,19,0)',
        'rgb(70,39,17)'],
    15: ['rgb(100,44,80)','rgb(141,58,58)','rgb(90,0,39)','rgb(151,0,58)','rgb(140,114,0)',
        'rgb(181,139,0)'],
    16: ['rgb(255,164,163)','rgb(255,215,235)','rgb(200,150,255)','rgb(210,200,255)',
        'rgb(255,117,116)','rgb(255,189,189)'],
    17: ['rgb(48,255,255)','rgb(219,255,255)','rgb(179,206,255)','rgb(194,236,255)',
        'rgb(169,200,211)','rgb(200,220,231)'],
    18: ['rgb(116,246,210)','rgb(178,255,225)','rgb(84,255,126)','rgb(179,255,157)',
        'rgb(220,200,179)','rgb(235,220,199)'],
    19: ['rgb(255,117,116)','rgb(255,189,189)','rgb(255,168,63)','rgb(255,199,146)',
        'rgb(255,244,155)','rgb(255,255,219)'],
    20: ['rgb(255,215,235)','rgb(210,200,255)','rgb(194,236,255)','rgb(219,255,255)',
        'rgb(200,220,231)','rgb(178,255,225)'],
    21: ['rgb(255,48,255)','rgb(181,62,255)','rgb(181,62,255)','rgb(0,21,255)','rgb(98,160,181)',
        'rgb(51,231,200)'],
    22: ['rgb(121,0,100)','rgb(80,20,101)','rgb(45,7,152)','rgb(0,3,91)','rgb(29,60,91)',
        'rgb(0,60,40)'],
    23: ['rgb(178,255,225)','rgb(179,255,157)','rgb(255,255,219)','rgb(255,199,146)',
        'rgb(255,189,189)','rgb(235,220,199)'],
    24: ['rgb(51,231,200)','rgb(0,255,28)','rgb(255,254,0)','rgb(255,137,0)','rgb(255,0,0)',
        'rgb(100,59,43)'],
    25: ['rgb(0,60,40)','rgb(39,75,0)','rgb(140,114,0)','rgb(100,44,80)','rgb(90,0,39)',
        'rgb(40,19,0)'],
    26: ['rgb(15,115,37)','rgb(0,170,43)','rgb(0,210,63)','rgb(255,117,138)','rgb(255,164,163)',
        'rgb(255,215,235)'],
    27: ['rgb(78,130,161)','rgb(98,160,181)','rgb(119,170,191)','rgb(190,101,255)',
        'rgb(200,150,255)','rgb(210,200,255)'],
    28: ['rgb(181,73,31)','rgb(201,87,0)','rgb(226,112,0)','rgb(0,221,255)','rgb(48,255,255)',
        'rgb(219,255,255)'],
    29: ['rgb(100,59,43)','rgb(135,114,99)','rgb(175,144,129)','rgb(8,239,34)','rgb(84,255,126)',
        'rgb(179,255,157)'],
    30: ['rgb(201,28,202)','rgb(255,48,255)','rgb(255,87,190)','rgb(159,171,255)',
        'rgb(179,206,255)','rgb(194,236,255)'],
    31: ['rgb(0,120,90)','rgb(0,150,120)','rgb(0,181,150)','rgb(255,53,50)','rgb(255,117,116)',
        'rgb(255,189,189)'],
    32: ['rgb(221,179,0)','rgb(255,219,0)','rgb(255,254,0)','rgb(51,231,200)','rgb(116,246,210)',
        'rgb(178,255,225)'],
    33: ['rgb(0,21,255)','rgb(0,122,255)','rgb(54,186,255)','rgb(210,179,158)','rgb(220,200,179)',
        'rgb(235,220,199)'],
    34: ['rgb(141,35,162)','rgb(171,40,192)','rgb(181,62,255)','rgb(255,137,0)','rgb(255,168,63)',
        'rgb(255,199,146)'],
    35: ['rgb(196,0,44)','rgb(222,0,28)','rgb(255,0,0)','rgb(149,180,201)','rgb(169,200,211)',
        'rgb(200,220,231)'],
    36: ['rgb(110,46,255)','rgb(130,82,255)','rgb(150,121,255)','rgb(255,249,88)',
        'rgb(255,244,155)','rgb(255,255,219)'],
    37: ['rgb(181,73,31)','rgb(223,20,42)','rgb(227,116,0)','rgb(254,65,61)','rgb(255,170,69)',
        'rgb(255,191,189)'],
    38: ['rgb(221,179,0)','rgb(202,91,12)','rgb(254,254,0)','rgb(255,139,0)','rgb(255,244,155)',
        'rgb(255,200,149)'],
    39: ['rgb(142,44,163)','rgb(130,89,255)','rgb(181,73,255)','rgb(157,172,255)',
        'rgb(200,153,255)','rgb(193,236,255)'],
    40: ['rgb(77,130,162)','rgb(0,149,119)','rgb(118,170,191)','rgb(44,229,198)',
        'rgb(170,200,210)','rgb(178,254,224)'],
    41: ['rgb(202,47,203)','rgb(172,50,193)','rgb(255,96,194)','rgb(191,107,255)',
        'rgb(255,166,166)','rgb(210,201,255)'],
    42: ['rgb(11,114,33)','rgb(254,218,0)','rgb(0,207,54)','rgb(255,248,87)','rgb(82,253,121)',
        'rgb(255,253,218)'],
    43: ['rgb(108,58,254)','rgb(0,125,254)','rgb(148,125,255)','rgb(0,220,255)','rgb(180,206,255)',
        'rgb(219,255,255)'],
    44: ['rgb(198,17,52)','rgb(254,68,255)','rgb(255,24,24)','rgb(255,122,141)','rgb(255,122,121)',
        'rgb(255,216,235)'],
    45: ['rgb(101,59,43)','rgb(98,160,181)','rgb(177,145,130)','rgb(149,180,201)',
        'rgb(221,200,179)','rgb(200,220,229)'],
    46: ['rgb(1,37,255)','rgb(1,168,36)','rgb(45,186,255)','rgb(1,252,1)','rgb(35,254,255)',
        'rgb(178,252,153)'],
    47: ['rgb(0,119,87)','rgb(136,114,100)','rgb(1,180,151)','rgb(211,180,159)','rgb(114,246,207)',
        'rgb(236,219,199)'],
    48: ['rgb(141,114,1)','rgb(71,40,19)','rgb(222,180,0)','rgb(136,114,100)','rgb(255,253,0)',
        'rgb(211,180,159)'],
    49: ['rgb(91,3,41)','rgb(28,94,7)','rgb(198,17,52)','rgb(1,168,36)','rgb(255,23,23)',
        'rgb(0,251,0)'],
    50: ['rgb(0,6,92)','rgb(57,101,130)','rgb(1,37,255)','rgb(96,161,181)','rgb(45,186,255)',
        'rgb(149,180,200)'],
    51: ['rgb(122,13,102)','rgb(1,19,163)','rgb(202,47,203)','rgb(0,125,254)','rgb(255,97,194)',
        'rgb(0,220,255)'],
    52: ['rgb(41,20,0)','rgb(142,61,60)','rgb(101,59,43)','rgb(202,91,12)','rgb(176,144,129)',
        'rgb(255,139,0)'],
    53: ['rgb(40,74,0)','rgb(84,37,203)','rgb(11,114,33)','rgb(130,89,255)','rgb(0,208,54)',
        'rgb(157,172,255)'],
    54: ['rgb(82,25,102)','rgb(152,11,63)','rgb(142,44,163)','rgb(223,20,42)','rgb(181,73,255)',
        'rgb(254,65,61)'],
    55: ['rgb(0,59,39)','rgb(181,140,0)','rgb(0,119,89)','rgb(254,218,0)','rgb(0,179,149)',
        'rgb(255,248,87)'],
    56: ['rgb(28,61,92)','rgb(111,37,132)','rgb(77,130,162)','rgb(172,50,193)','rgb(118,170,191)',
        'rgb(191,107,255)'],
    57: ['rgb(101,47,81)','rgb(0,89,57)','rgb(183,76,40)','rgb(0,149,119)','rgb(229,115,0)',
        'rgb(44,229,198)'],
    58: ['rgb(44,18,153)','rgb(163,31,153)','rgb(108,58,254)','rgb(254,68,255)','rgb(148,125,255)',
        'rgb(255,122,141)'],
    59: ['rgb(198,17,52)','rgb(223,20,42)','rgb(255,96,192)','rgb(255,122,141)','rgb(255,170,69)',
        'rgb(255,199,148)'],
    60: ['rgb(202,47,203)','rgb(254,68,255)','rgb(181,73,255)','rgb(191,107,255)',
        'rgb(255,244,155)','rgb(254,254,218)'],
    61: ['rgb(221,179,0)','rgb(254,218,0)','rgb(0,207,54)','rgb(1,252,1)','rgb(35,254,255)',
        'rgb(219,255,255)'],
    62: ['rgb(108,58,254)','rgb(128,90,255)','rgb(118,170,191)','rgb(149,180,201)',
        'rgb(82,253,121)','rgb(178,252,153)'],
    63: ['rgb(101,59,43)','rgb(137,115,101)','rgb(229,115,0)','rgb(255,139,0)','rgb(169,202,211)',
        'rgb(200,220,231)'],
    64: ['rgb(0,119,89)','rgb(0,149,119)','rgb(150,125,255)','rgb(157,172,255)','rgb(114,244,208)',
        'rgb(178,254,224)'],
    65: ['rgb(182,75,39)','rgb(202,91,12)','rgb(255,253,0)','rgb(255,248,87)','rgb(200,153,255)',
        'rgb(210,201,254)'],
    66: ['rgb(77,130,162)','rgb(98,160,181)','rgb(255,24,24)','rgb(254,65,61)','rgb(255,166,166)',
        'rgb(255,216,235)'],
    67: ['rgb(142,44,163)','rgb(172,50,193)','rgb(45,186,255)','rgb(0,220,255)','rgb(221,200,179)',
        'rgb(236,219,199)'],
    68: ['rgb(11,114,33)','rgb(1,168,36)','rgb(0,179,149)','rgb(44,229,198)','rgb(180,206,255)',
        'rgb(193,236,255)'],
    69: ['rgb(1,37,255)','rgb(0,125,254)','rgb(177,145,130)','rgb(211,180,159)','rgb(254,122,120)',
        'rgb(255,191,191)'],
    70: ['rgb(122,13,102)','rgb(163,31,153)','rgb(1,37,255)','rgb(0,125,254)','rgb(0,207,54)',
        'rgb(1,252,1)','rgb(255,170,69)','rgb(255,200,149)'],
    71: ['rgb(142,44,163)','rgb(172,50,193)','rgb(0,179,149)','rgb(44,229,198)','rgb(255,244,155)',
        'rgb(254,254,218)','rgb(91,3,41)','rgb(152,11,63)'],
    72: ['rgb(45,186,255)','rgb(0,220,255)','rgb(82,253,121)','rgb(178,252,153)',
        'rgb(101,47,81)','rgb(142,61,60)','rgb(101,59,43)','rgb(136,114,100)'],
    73: ['rgb(114,244,208)','rgb(178,254,224)','rgb(141,114,1)','rgb(181,140,0)',
        'rgb(255,23,23)','rgb(254,65,61)','rgb(170,200,210)','rgb(200,220,231)'],
    74: ['rgb(40,74,0)','rgb(28,94,7)','rgb(183,76,40)','rgb(202,91,12)','rgb(177,145,130)',
        'rgb(211,180,159)','rgb(180,206,255)','rgb(194,235,255)'],
    75: ['rgb(202,47,203)','rgb(254,68,255)','rgb(222,180,0)','rgb(254,218,0)','rgb(255,122,121)',
        'rgb(255,191,191)','rgb(28,61,92)','rgb(59,100,132)'],
    76: ['rgb(181,73,255)','rgb(191,107,255)','rgb(227,116,0)','rgb(255,139,0)','rgb(221,200,179)',
        'rgb(236,219,199)','rgb(44,18,153)','rgb(84,37,203)'],
    77: ['rgb(200,153,255)','rgb(210,201,255)','rgb(0,59,39)','rgb(0,89,59)','rgb(41,20,1)',
        'rgb(71,40,19)','rgb(108,58,254)','rgb(130,89,255)'],
    78: ['rgb(255,96,194)','rgb(255,122,141)','rgb(35,254,255)','rgb(219,255,255)',
        'rgb(11,114,33)','rgb(1,168,36)','rgb(198,17,52)','rgb(222,19,41)'],
    79: ['rgb(82,25,102)','rgb(111,37,132)','rgb(0,119,89)','rgb(0,149,117)','rgb(255,253,0)',
        'rgb(77,130,162)','rgb(77,130,162)','rgb(98,160,181)'],
    80: ['rgb(255,166,165)','rgb(255,216,235)','rgb(0,6,92)','rgb(1,19,163)','rgb(118,170,191)',
        'rgb(148,180,201)','rgb(150,125,255)','rgb(157,172,255)'],
    81: ['rgb(41,20,1)','rgb(71,40,19)','rgb(108,58,254)','rgb(130,89,255)','rgb(255,96,194)',
        'rgb(255,122,141)'],
    82: ['rgb(82,25,102)','rgb(111,37,132)','rgb(0,119,89)','rgb(43,121,107)','rgb(255,253,0)',
        'rgb(255,248,87)'],
    83: ['rgb(76,129,160)','rgb(98,160,181)','rgb(255,166,166)','rgb(255,216,235)',
        'rgb(0,6,92)','rgb(1,19,163)'],
    84: ['rgb(181,73,255)','rgb(191,107,255)','rgb(227,116,0)','rgb(255,140,1)','rgb(221,200,179)',
        'rgb(235,220,199)'],
    85: ['rgb(114,244,208)','rgb(179,254,224)','rgb(141,114,1)','rgb(181,140,0)',
        'rgb(255,24,24)','rgb(254,65,61)'],
    86: ['rgb(177,145,130)','rgb(211,180,159)','rgb(180,206,255)','rgb(193,236,255)',
        'rgb(202,47,203)','rgb(254,68,255)'],
    87: ['rgb(255,244,155)','rgb(254,254,218)','rgb(91,3,41)','rgb(152,11,63)','rgb(45,186,255)',
        'rgb(0,220,255)'],
    88: ['rgb(170,200,210)','rgb(200,220,231)','rgb(38,74,0)','rgb(28,94,7)','rgb(183,76,40)',
        'rgb(202,91,12)'],
    89: ['rgb(121,12,101)','rgb(163,31,153)','rgb(1,37,255)','rgb(0,125,254)','rgb(0,207,54)',
        'rgb(1,252,0)'],
    90: ['rgb(255,170,67)','rgb(255,200,149)','rgb(142,44,163)','rgb(172,50,193)',
        'rgb(0,179,147)','rgb(44,229,198)'],
    91: ['rgb(35,255,255)','rgb(219,255,255)','rgb(11,114,33)','rgb(1,168,36)','rgb(198,16,54)',
        'rgb(223,20,42)'],
    92: ['rgb(222,180,0)','rgb(254,218,0)','rgb(255,121,118)','rgb(255,191,191)',
        'rgb(28,61,92)','rgb(57,101,130)'],
    93: ['rgb(44,18,153)','rgb(84,37,203)','rgb(200,153,255)','rgb(210,201,255)',
        'rgb(0,59,39)','rgb(0,89,59)'],
    94: ['rgb(82,253,121)','rgb(178,252,153)','rgb(101,47,81)','rgb(93,93,93)','rgb(101,59,43)',
        'rgb(137,115,101)'],
    95: ['rgb(118,170,191)','rgb(93,93,93)','rgb(150,125,255)','rgb(157,172,255)',
        'rgb(122,13,102)','rgb(163,31,153)'],
    96: ['rgb(40,74,0)','rgb(27,95,10)','rgb(142,44,163)','rgb(172,50,193)','rgb(255,96,194)',
        'rgb(255,122,141)'],
    97: ['rgb(0,6,92)','rgb(0,21,163)','rgb(222,180,0)','rgb(254,218,0)','rgb(0,207,54)',
        'rgb(1,252,1)'],
    98: ['rgb(93,69,82)','rgb(152,11,63)','rgb(1,37,255)','rgb(0,125,254)','rgb(181,73,255)',
        'rgb(191,107,255)'],
    99: ['rgb(141,114,1)','rgb(181,140,0)','rgb(77,130,162)','rgb(98,160,181)','rgb(148,125,255)',
        'rgb(157,172,255)'],
    100: ['rgb(44,18,153)','rgb(84,37,203)','rgb(0,119,89)','rgb(0,149,119)','rgb(174,145,129)',
        'rgb(212,180,159)'],
    101: ['rgb(28,61,92)','rgb(59,100,132)','rgb(202,47,203)','rgb(254,68,255)','rgb(227,116,0)',
        'rgb(255,139,0)'],
    102: ['rgb(122,13,102)','rgb(163,31,153)','rgb(101,59,43)','rgb(137,115,101)',
        'rgb(255,24,24)','rgb(254,65,61)'],
    103: ['rgb(101,47,81)','rgb(142,61,60)','rgb(198,17,52)','rgb(223,20,42)','rgb(45,186,255)',
        'rgb(0,220,255)'],
    104: ['rgb(0,59,39)','rgb(0,89,59)','rgb(183,76,40)','rgb(202,90,14)','rgb(255,253,0)',
        'rgb(255,248,87)'],
    105: ['rgb(82,25,102)','rgb(111,37,132)','rgb(108,58,254)','rgb(130,89,255)',
        'rgb(118,170,191)','rgb(149,180,201)'],
    106: ['rgb(41,20,1)','rgb(71,40,19)','rgb(11,114,33)','rgb(11,114,33)','rgb(1,168,36)',
        'rgb(44,229,198)']
};

var generate = function (ref) {
    if ( ref === void 0 ) ref = {};
    var units = ref.units; if ( units === void 0 ) units = [24];
    var width = ref.width; if ( width === void 0 ) width = 240;
    var height = ref.height; if ( height === void 0 ) height = 240;
    var groundsLength = ref.groundsLength; if ( groundsLength === void 0 ) groundsLength = 2;
    var percentOfStraightLines = ref.percentOfStraightLines; if ( percentOfStraightLines === void 0 ) percentOfStraightLines = 0.5;
    var percentOfGradients = ref.percentOfGradients; if ( percentOfGradients === void 0 ) percentOfGradients = 0.5;
    var percentOfSimplexGradients = ref.percentOfSimplexGradients; if ( percentOfSimplexGradients === void 0 ) percentOfSimplexGradients = 0.1;
    var swatch = ref.swatch; if ( swatch === void 0 ) swatch = ['rgb(0, 0, 0)'];
    var backgroundColor = ref.backgroundColor; if ( backgroundColor === void 0 ) backgroundColor = 'rgb(255, 255, 255)';
    var symbols$$1 = ref.symbols; if ( symbols$$1 === void 0 ) symbols$$1 = ['debug'];
    var canvas = ref.canvas; if ( canvas === void 0 ) canvas = null;
    var random = ref.random; if ( random === void 0 ) random = prng.random;

    var patterns = symbols$$1.map(function (symbolName) { return makePattern(symbols[symbolName]); });
    var grounds = new Array(groundsLength).fill(true).map(function (_, index, grounds) {
        var rnd = random() * 100;
        var unit = randomOf(units, random);
        var foregroundColor = randomOf(swatch, random);
        var pattern = randomOf(patterns, random);
        var gradient = rnd > percentOfGradients * 100 ? Gradient.fix(random()) : rnd < percentOfSimplexGradients * 100 ? Gradient.simplex({
            seed: rnd
        }) : Gradient.linear(rnd);
        var offy = height * (Math.pow( (1 - index / grounds.length), (random() * 3) ));
        var line = new Line(function (x) {
            if (rnd < percentOfStraightLines * 100) {
                return offy / height;
            } else {
                var n = Line.perlin({
                    seed: rnd,
                    octaves: 3,
                    resolution: 64,
                    lacunarity: 2,
                    gain: 0.5
                })(x / (2 + rnd / 100 * 3));
                return offy / height / 2 + n;
            }
        });
        return new Ground({
            unit: unit,
            line: line,
            gradient: gradient,
            width: width,
            height: height,
            foregroundColor: foregroundColor,
            backgroundColor: backgroundColor,
            pattern: pattern
        });
    });
    return new Landscape(grounds, {
        canvas: canvas,
        backgroundColor: backgroundColor
    });
};

exports.generate = generate;
exports.prng = prng;
exports.erode = erode;
exports.hueRotate = hueRotate;
exports.swatches = swatches;

})));
//# sourceMappingURL=ffp-generate.umd.js.map
