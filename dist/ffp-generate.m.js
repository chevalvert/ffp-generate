import r from"tumult";import{normalize as g,radians as t,lerp as b}from"missing-math";import i from"lineclip";import n from"canvas2svg";import o from"file-saver";import e from"fast-random";import a from"@internet/raf";import s from"animejs";var u=function(r){void 0===r&&(r=function(r,g,t,b){return 1}),this.compute=r.bind(this)},c={methods:{configurable:!0}};function h(r,g,t,b,i){void 0===i&&(i={});var n=i.ctx,o=i.color;"transparent"!==o&&(o&&(n.fillStyle=o),n.fillRect(r,g,t,b))}function d(r){return function(g,t,b){void 0===b&&(b={});var i=b.ctx,n=b.unit,o=b.scale;void 0===o&&(o=1);var e=b.foregroundColor;void 0===e&&(e="black");var a=b.backgroundColor;void 0===a&&(a="white"),i.isSVG&&i.beginSVGGroup(),h(g,t,n,n,{ctx:i,color:a}),i.fillStyle=e,r(g,t,{ctx:i,unit:n,scale:o}),i.isSVG&&i.endSVGGroup()}}function l(r,g){r.beginPath(),g.forEach(function(g,t){r[0===t?"moveTo":"lineTo"].apply(r,g)})}function v(r,g){return Math.floor(r/g)*g}function f(r,g){return r/g}c.methods.get=function(){return Object.getOwnPropertyNames(u).filter(function(r){return"methods"!==r}).filter(function(r){return"function"==typeof u[r]})},u.normalize=function(r,t,b,i){return[g(r,0,b),g(t,0,i)]},u.simplex=function(t){void 0===t&&(t={});var b=t.seed;void 0===b&&(b=null);var i=t.octaves;void 0===i&&(i=2);var n=t.power;void 0===n&&(n=1);var o=Math.pow(2,i),e=new r.Simplex2(b);return new u(function(r,t,b,i){var a=u.normalize(r,t,b,i);return Math.pow(g(e.gen(a[0]/o,a[1]/o),-1,1),n)})},u.linear=function(r){return void 0===r&&(r=0),new u(function(g,i,n,o){var e=u.normalize(g,i,n,o),a=e[0],s=e[1],c=t(r);return(b(1-a,a,(Math.sin(c)+1)/2)+b(1-s,s,(Math.cos(c)+1)/2))/2})},u.random=function(r){return void 0===r&&(r=Math.random),new u(r)},u.fix=function(r){return void 0===r&&(r=1),new u(function(){return r})},Object.defineProperties(u,c);var p={empty:function(){},debug:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1),b.strokeStyle="black",b.lineWidth=i/12,b.strokeRect(r,g,i,i)},square:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24));o<0||b.fillRect(r+i/2-o/2,g+i/2-o/2,o,o)},square_offset:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24))-10;o<0||b.fillRect(r+i/2-o/2,g+i/2-o/2,o,o)},vertical_line:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24));o<0||b.fillRect(r+i/2-o/2,g,o,i)},vertical_line_offset:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24))-10;o<0||b.fillRect(r+i/2-o/2,g,o,i)},horizontal_line:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24));o<0||b.fillRect(r,g+i/2-o/2,i,o)},horizontal_line_offset:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24))-10;o<0||b.fillRect(r,g+i/2-o/2,i,o)},diagonal:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o=v(i*n,f(i,24));o<0||(b.beginPath(),b.moveTo(r+i-o,g),b.lineTo(r+i,g),b.lineTo(r+o,g+i),b.lineTo(r,g+i),b.fill())},diamond:function(r,g,t){void 0===t&&(t={});var b=t.ctx,n=t.unit,o=t.scale;void 0===o&&(o=1);var e=v(n*o,f(n,24))-1;e<0||(l(b,i.polygon([[r+n/2,g+e],[r+n-e,g+n/2],[r+n/2,g+n-e],[r+e,g+n/2]],[r,g,r+n,g+n])),b.fill())},circle:function(r,g,b){void 0===b&&(b={});var n=b.ctx,o=b.unit,e=b.scale;void 0===e&&(e=1);var a=v((o-1)*e,f(o,24));if(!(a<0)){for(var s=[],u=0;u<360;u+=10){var c=t(u);s.push([r+o/2+Math.sin(c)*a,g+o/2+Math.cos(c)*a])}l(n,i.polygon(s,[r,g,r+o,g+o])),n.closePath(),n.fill()}},ffp:function(r,g,t){void 0===t&&(t={});var b=t.ctx,i=t.unit,n=t.scale;void 0===n&&(n=1);var o="FFP".split(""),e=o[Math.floor(Math.random()*o.length)];e&&(b.font=1.2*i+"px Space Mono",b.fillText(e,r,g+i))}};var m=function(r){void 0===r&&(r={});var g=r.width,t=r.height,b=r.unit;void 0===b&&(b=24);var i=r.line,n=r.gradient,o=r.pattern;void 0===o&&(o=d(p.debug));var e=r.foregroundColor;void 0===e&&(e="black");var a=r.backgroundColor;void 0===a&&(a="white"),this.width=g,this.height=t,this.unit=b,this.line=i,this.gradient=n,this.pattern=o,this.backgroundColor=a,this.foregroundColor=e,this.grid=[],this.cells=[],this._populate()},x={isEmpty:{configurable:!0}};m.prototype._populate=function(){for(var r=0;r<this.width;r+=this.unit)for(var g=Math.floor(r/this.unit),t=this.line.compute(g)*this.height;t<this.height;t+=this.unit){var b=Math.floor(t/this.unit);this.setCell(g,b)}},m.prototype.setCell=function(r,g){this.grid[r]||(this.grid[r]=[]);var t={i:r,j:g,x:r*this.unit,y:g*this.unit,shouldRender:!0};this.grid[r][g]=t,this.cells.push(t)},m.prototype.hasCell=function(r,g){return this.grid[r]&&this.grid[r][g]},m.prototype.isInFrontOf=function(r,g){var t=Math.floor(r/this.unit),b=Math.floor(g/this.unit);return this.hasCell(t,b)},m.prototype.setBehind=function(r){this.grid.forEach(function(g){g.forEach(function(g){g&&g.shouldRender&&(g.shouldRender=!r.some(function(r){return r.isInFrontOf(g.x,g.y)}))})})},x.isEmpty.get=function(){return!this.cells.find(function(r){return r.shouldRender})},m.prototype.render=function(r){var g=this;this.cells.forEach(function(t){t.shouldRender&&g.pattern(t.x,t.y,{ctx:r,unit:g.unit,backgroundColor:g.backgroundColor,foregroundColor:g.foregroundColor,scale:g.gradient.compute(t.x,t.y,g.width,g.height)})})},m.prototype.createSprite=function(r){if(r.isSVG)throw new Error("Sprite rendering only works on non-SVG context");this.sprite=function(r){if(r.isSVG)throw new Error("This function does not handle SVG context");var g=document.createElement("canvas");return g.width=r.canvas.width,g.height=r.canvas.height,g}(r),this.render(this.sprite.getContext("2d"))},Object.defineProperties(m.prototype,x);var y=function(r,g,t){var b=this;if(!r||!g)throw new Error("You must specify a width and a height");this.width=r,this.height=g,this.canvas=t,this.canvas&&(this.canvas.width=this.width,this.canvas.height=this.height,this.canvas.style.width=this.width+"px",this.canvas.style.height=this.height+"px"),this.ctx=this.canvas?this.canvas.getContext("2d"):new n(r,g),this.ctx.isSVG=!this.canvas,this.ctx.beginSVGGroup=this.ctx.save,this.ctx.endSVGGroup=this.ctx.restore,this.ctx.group=function(r){b.ctx.isSVG&&b.ctx.beginSVGGroup(),r(),b.ctx.isSVG&&b.ctx.endSVGGroup()}},w={context:{configurable:!0},svg:{configurable:!0},serializedSvg:{configurable:!0}},S={SUPPORTED_MIME_TYPES:{configurable:!0}};w.context.get=function(){return this.ctx},w.svg.get=function(){return this.ctx.getSvg()},w.serializedSvg.get=function(){return this.ctx.getSerializedSvg(!0)},y.prototype.toBlob=function(r){return new Promise(function(g,t){var b=this;return r||(r=this.ctx.isSVG?"image/svg+xml":"image/png"),y.isSupportedMimeType(r)?"image/svg+xml"!==r||this.ctx.isSVG?g("image/svg+xml"===r?new Blob([this.serializedSvg],{type:"image/svg+xml;charset=utf-8"}):new Promise(function(g){return b.canvas.toBlob(g,r)})):t(new Error("image/svg+xml mime type is not compatible with the current context.")):t(new Error("Invalid or unsupported mime type.\nSupported mime types are: "+y.SUPPORTED_MIME_TYPES))}.bind(this))},y.prototype.didMount=function(){},y.prototype.mount=function(r,g){void 0===g&&(g=null),r&&!this.mounted&&(this.parent=r,this.el=this.canvas||this.svg,g?this.parent.insertBefore(this.el,g):this.parent.appendChild(this.el),this.mounted=!0,this.didMount(this.el))},y.prototype.background=function(r){h(0,0,this.width,this.height,{color:r,ctx:this.ctx})},y.prototype.copy=function(r){if(void 0===r&&(r=document.createElement("canvas")),this.ctx.isSVG)throw new Error("Copying canvas with SVG context is not supported yet");return r.width=this.width,r.height=this.height,r.getContext("2d").drawImage(this.canvas,0,0),r},y.prototype.clear=function(){if(this.ctx.isSVG){if(!this.mounted)return;this.el.querySelector("g").innerHTML=""}else this.ctx.clearRect(0,0,this.width,this.height)},S.SUPPORTED_MIME_TYPES.get=function(){return["image/png","image/jpeg","image/svg+xml"]},y.isSupportedMimeType=function(r){return y.SUPPORTED_MIME_TYPES.includes(r)},y.prototype.save=function(r,g){void 0===r&&(r=Date.now()),void 0===g&&(g={});var t=g.type;return void 0===t&&(t="image/png"),new Promise(function(g,b){return y.isSupportedMimeType(t)?this.toBlob(t).then(function(t){try{return g(o.saveAs(t,r))}catch(r){return b(r)}},b):b(new Error("Invalid or unsupported mime type.\nSupported mime types are: "+y.SUPPORTED_MIME_TYPES))}.bind(this))},Object.defineProperties(y.prototype,w),Object.defineProperties(y,S);var M=function(r){function g(g,t){void 0===t&&(t={});var b=t.canvas;void 0===b&&(b=null);var i=t.backgroundColor;void 0===i&&(i="transparent"),r.call(this,g[0].width,g[0].height,b),this.backgroundColor=i,this.grounds=g}r&&(g.__proto__=r),(g.prototype=Object.create(r&&r.prototype)).constructor=g;var t={grounds:{configurable:!0}};return t.grounds.get=function(){return this._grounds},t.grounds.set=function(r){var g=this,t=[];this._grounds=r.map(function(r,b){return r.setBehind(t),r.isEmpty?null:(t.push(r),g.ctx.isSVG||r.createSprite(g.ctx),r)}).filter(Boolean)},g.prototype.render=function(g){return void 0===g&&(g=this.ctx),r.prototype.background.call(this,this.backgroundColor),this.grounds.forEach(function(r,t){r.sprite?g.drawImage(r.sprite,0,0):r.render(g)}),this},g.prototype.ensureSVGContext=function(){return this.ctx.isSVG?this:new g(this.grounds,{canvas:null,backgroundColor:this.backgroundColor}).render()},g.prototype.save=function(g,t){void 0===t&&(t={});var b=t.type;return"image/svg+xml"!==b||this.ctx.isSVG?r.prototype.save.call(this,g,{type:b}):this.ensureSVGContext().save(g,{type:b})},Object.defineProperties(g.prototype,t),g}(y),C=function(r){void 0===r&&(r=function(r){return.5}),this._equation=r,this.points=[]};function E(r,g){return void 0===g&&(g=Math.random),r[Math.floor(g()*r.length)]}C.prototype.compute=function(r,g){void 0===g&&(g={});var t=g.force;return void 0===t&&(t=!1),(t||void 0===this.points[r])&&(this.points[r]=this._equation(r)),this.points[r]},C.perlin=function(t){void 0===t&&(t={});var b=t.seed;void 0===b&&(b=null);var i=t.octaves;void 0===i&&(i=2);var n=t.lacunarity;void 0===n&&(n=2);var o=t.gain;void 0===o&&(o=.5);var e=t.resolution;void 0===e&&(e=32);var a=new r.Perlin1(b).transform(function(r){return g(this.gen(r/e),-1,1)});return function(r){for(var g=0,t=.5,b=1,e=0;e<i;e++)g+=t*a(b*r),b*=n,t*=o;return Math.sin(g)}},C.simplex=function(g){void 0===g&&(g={});var t=g.seed;void 0===t&&(t=null);var b=g.octaves;void 0===b&&(b=2);var i=Math.pow(2,b);return new r.Simplex1(t).transform(function(r){return(Math.sin(1/this.gen(r/i))+1)/2})};var G=Date.now(),P=e(G),V={set seed(r){P=e(G=r)},get seed(){return G},reset:function(){P=e(G)},random:function(){return P.nextFloat()},randomOf:function(r){return E(r,P.nextFloat)},randomFloat:function(r,g){return P.nextFloat()*(g-r)+r},randomInt:function(r,g){return Math.floor(P.nextFloat()*(g-r)+r)}},_=function(r,g){void 0===g&&(g={});var t=g.step;void 0===t&&(t=24);var b=g.snapToGrid;void 0===b&&(b=!0);var i=g.autoplay;if(void 0===i&&(i=!0),r.ctx.isSVG)throw new Error("Eroding canvas only works on non SVG context for now");var n=i,o=r.copy(),e=new C(function(r){return C.perlin({seed:1,octaves:1,resolution:32,lacunarity:2,gain:.5})((r+e.frameCount)/10)*t*10});return e.frameCount=0,a.add(s),{play:function(){n=!0},pause:function(){n=!1},clear:function(){a.remove(s)}};function s(g){if(n){e.frameCount+=1,r.background(r.backgroundColor);for(var i=0;i<r.width;i+=t){var a=e.compute(i,{force:!0}),s=b?v(a,t):a;r.ctx.drawImage(o,i,0,t,o.height,i,s,t,o.height)}}}},k=function(r,g){void 0===g&&(g={});var t=g.autoplay;void 0===t&&(t=!0);var b=g.duration;void 0===b&&(b=1e3);var i=g.easing;void 0===i&&(i="linear");var n=g.loop;void 0===n&&(n=!0);var o=g.containerClass;void 0===o&&(o="ffp-container");var e=r.parent||r.canvas.parentNode,a=document.createElement("div");a.classList.add(o),e.insertBefore(a,r.canvas.nextSibling),r.canvas.style.display="none",a.style.position="absolute",a.style.width=r.width+"px",a.style.height=r.height+"px",a.style.backgroundColor=r.backgroundColor,r.grounds.forEach(function(r){var g=new Image;g.src=r.sprite.toDataURL(),g.style.position="absolute",a.appendChild(g)});var u=s({autoplay:t,duration:b,easing:i,loop:n,targets:a.querySelectorAll("img"),filter:function(){var r=Math.floor(360*Math.random());return["hue-rotate("+r+"deg)","hue-rotate("+(r+360*Math.sign(Math.sin(Math.random()*Math.PI)))+"deg)"]}});return u.clear=function(){a.remove(),r.canvas.style.display=""},u},T={1:["rgb(120,0,100)","rgb(160,15,150)","rgb(200,30,200)","rgb(255,50,255)","rgb(255,90,190)","rgb(255,120,140)","rgb(255,165,165)","rgb(255,215,235)"],2:["rgb(80,20,100)","rgb(110,30,130)","rgb(140,35,160)","rgb(170,40,190)","rgb(180,60,255)","rgb(190,100,255)","rgb(200,150,255)","rgb(210,200,255)"],3:["rgb(0,0,90)","rgb(0,0,160)","rgb(0,0,255)","rgb(0,120,255)","rgb(60,185,255)","rgb(0,200,255)","rgb(60,255,255)","rgb(220,255,255)"],4:["rgb(0,60,39)","rgb(0,90,59)","rgb(0,120,90)","rgb(0,151,120)","rgb(0,181,150)","rgb(52,231,200)","rgb(116,246,210)","rgb(179,254,225)"],5:["rgb(39,75,0)","rgb(27,95,15)","rgb(14,116,36)","rgb(0,170,43)","rgb(0,210,63)","rgb(0,252,29)","rgb(85,253,127)","rgb(178,253,157)"],6:["rgb(140,114,0)","rgb(180,139,0)","rgb(221,179,0)","rgb(255,218,0)","rgb(255,253,0)","rgb(255,249,88)","rgb(255,245,155)","rgb(255,254,218)"],7:["rgb(101,44,80)","rgb(141,58,57)","rgb(181,72,30)","rgb(201,88,0)","rgb(226,113,0)","rgb(255,137,0)","rgb(255,168,64)","rgb(255,199,147)"],8:["rgb(91,4,38)","rgb(151,11,57)","rgb(197,15,43)","rgb(222,18,27)","rgb(255,22,6)","rgb(255,53,49)","rgb(255,118,116)","rgb(255,189,189)"],9:["rgb(40,19,0)","rgb(71,39,17)","rgb(101,59,42)","rgb(136,115,99)","rgb(175,145,128)","rgb(210,179,158)","rgb(220,200,179)","rgb(236,220,199)"],10:["rgb(28,61,91)","rgb(59,100,131)","rgb(78,130,161)","rgb(98,161,181)","rgb(119,170,191)","rgb(150,180,201)","rgb(169,200,210)","rgb(199,220,230)"],11:["rgb(44,18,153)","rgb(85,28,202)","rgb(109,45,255)","rgb(130,82,255)","rgb(150,122,255)","rgb(160,171,255)","rgb(180,206,255)","rgb(194,235,255)"],12:["rgb(121,0,100)","rgb(161,12,151)","rgb(80,20,101)","rgb(110,30,131)","rgb(90,0,39)","rgb(151,0,58)"],13:["rgb(0,3,91)","rgb(0,9,162)","rgb(45,7,152)","rgb(85,26,203)","rgb(29,60,91)","rgb(59,100,131)"],14:["rgb(0,60,40)","rgb(0,90,60)","rgb(39,75,0)","rgb(28,95,15)","rgb(40,19,0)","rgb(70,39,17)"],15:["rgb(100,44,80)","rgb(141,58,58)","rgb(90,0,39)","rgb(151,0,58)","rgb(140,114,0)","rgb(181,139,0)"],16:["rgb(255,164,163)","rgb(255,215,235)","rgb(200,150,255)","rgb(210,200,255)","rgb(255,117,116)","rgb(255,189,189)"],17:["rgb(48,255,255)","rgb(219,255,255)","rgb(179,206,255)","rgb(194,236,255)","rgb(169,200,211)","rgb(200,220,231)"],18:["rgb(116,246,210)","rgb(178,255,225)","rgb(84,255,126)","rgb(179,255,157)","rgb(220,200,179)","rgb(235,220,199)"],19:["rgb(255,117,116)","rgb(255,189,189)","rgb(255,168,63)","rgb(255,199,146)","rgb(255,244,155)","rgb(255,255,219)"],20:["rgb(255,215,235)","rgb(210,200,255)","rgb(194,236,255)","rgb(219,255,255)","rgb(200,220,231)","rgb(178,255,225)"],21:["rgb(255,48,255)","rgb(181,62,255)","rgb(181,62,255)","rgb(0,21,255)","rgb(98,160,181)","rgb(51,231,200)"],22:["rgb(121,0,100)","rgb(80,20,101)","rgb(45,7,152)","rgb(0,3,91)","rgb(29,60,91)","rgb(0,60,40)"],23:["rgb(178,255,225)","rgb(179,255,157)","rgb(255,255,219)","rgb(255,199,146)","rgb(255,189,189)","rgb(235,220,199)"],24:["rgb(51,231,200)","rgb(0,255,28)","rgb(255,254,0)","rgb(255,137,0)","rgb(255,0,0)","rgb(100,59,43)"],25:["rgb(0,60,40)","rgb(39,75,0)","rgb(140,114,0)","rgb(100,44,80)","rgb(90,0,39)","rgb(40,19,0)"],26:["rgb(15,115,37)","rgb(0,170,43)","rgb(0,210,63)","rgb(255,117,138)","rgb(255,164,163)","rgb(255,215,235)"],27:["rgb(78,130,161)","rgb(98,160,181)","rgb(119,170,191)","rgb(190,101,255)","rgb(200,150,255)","rgb(210,200,255)"],28:["rgb(181,73,31)","rgb(201,87,0)","rgb(226,112,0)","rgb(0,221,255)","rgb(48,255,255)","rgb(219,255,255)"],29:["rgb(100,59,43)","rgb(135,114,99)","rgb(175,144,129)","rgb(8,239,34)","rgb(84,255,126)","rgb(179,255,157)"],30:["rgb(201,28,202)","rgb(255,48,255)","rgb(255,87,190)","rgb(159,171,255)","rgb(179,206,255)","rgb(194,236,255)"],31:["rgb(0,120,90)","rgb(0,150,120)","rgb(0,181,150)","rgb(255,53,50)","rgb(255,117,116)","rgb(255,189,189)"],32:["rgb(221,179,0)","rgb(255,219,0)","rgb(255,254,0)","rgb(51,231,200)","rgb(116,246,210)","rgb(178,255,225)"],33:["rgb(0,21,255)","rgb(0,122,255)","rgb(54,186,255)","rgb(210,179,158)","rgb(220,200,179)","rgb(235,220,199)"],34:["rgb(141,35,162)","rgb(171,40,192)","rgb(181,62,255)","rgb(255,137,0)","rgb(255,168,63)","rgb(255,199,146)"],35:["rgb(196,0,44)","rgb(222,0,28)","rgb(255,0,0)","rgb(149,180,201)","rgb(169,200,211)","rgb(200,220,231)"],36:["rgb(110,46,255)","rgb(130,82,255)","rgb(150,121,255)","rgb(255,249,88)","rgb(255,244,155)","rgb(255,255,219)"],37:["rgb(181,73,31)","rgb(223,20,42)","rgb(227,116,0)","rgb(254,65,61)","rgb(255,170,69)","rgb(255,191,189)"],38:["rgb(221,179,0)","rgb(202,91,12)","rgb(254,254,0)","rgb(255,139,0)","rgb(255,244,155)","rgb(255,200,149)"],39:["rgb(142,44,163)","rgb(130,89,255)","rgb(181,73,255)","rgb(157,172,255)","rgb(200,153,255)","rgb(193,236,255)"],40:["rgb(77,130,162)","rgb(0,149,119)","rgb(118,170,191)","rgb(44,229,198)","rgb(170,200,210)","rgb(178,254,224)"],41:["rgb(202,47,203)","rgb(172,50,193)","rgb(255,96,194)","rgb(191,107,255)","rgb(255,166,166)","rgb(210,201,255)"],42:["rgb(11,114,33)","rgb(254,218,0)","rgb(0,207,54)","rgb(255,248,87)","rgb(82,253,121)","rgb(255,253,218)"],43:["rgb(108,58,254)","rgb(0,125,254)","rgb(148,125,255)","rgb(0,220,255)","rgb(180,206,255)","rgb(219,255,255)"],44:["rgb(198,17,52)","rgb(254,68,255)","rgb(255,24,24)","rgb(255,122,141)","rgb(255,122,121)","rgb(255,216,235)"],45:["rgb(101,59,43)","rgb(98,160,181)","rgb(177,145,130)","rgb(149,180,201)","rgb(221,200,179)","rgb(200,220,229)"],46:["rgb(1,37,255)","rgb(1,168,36)","rgb(45,186,255)","rgb(1,252,1)","rgb(35,254,255)","rgb(178,252,153)"],47:["rgb(0,119,87)","rgb(136,114,100)","rgb(1,180,151)","rgb(211,180,159)","rgb(114,246,207)","rgb(236,219,199)"],48:["rgb(141,114,1)","rgb(71,40,19)","rgb(222,180,0)","rgb(136,114,100)","rgb(255,253,0)","rgb(211,180,159)"],49:["rgb(91,3,41)","rgb(28,94,7)","rgb(198,17,52)","rgb(1,168,36)","rgb(255,23,23)","rgb(0,251,0)"],50:["rgb(0,6,92)","rgb(57,101,130)","rgb(1,37,255)","rgb(96,161,181)","rgb(45,186,255)","rgb(149,180,200)"],51:["rgb(122,13,102)","rgb(1,19,163)","rgb(202,47,203)","rgb(0,125,254)","rgb(255,97,194)","rgb(0,220,255)"],52:["rgb(41,20,0)","rgb(142,61,60)","rgb(101,59,43)","rgb(202,91,12)","rgb(176,144,129)","rgb(255,139,0)"],53:["rgb(40,74,0)","rgb(84,37,203)","rgb(11,114,33)","rgb(130,89,255)","rgb(0,208,54)","rgb(157,172,255)"],54:["rgb(82,25,102)","rgb(152,11,63)","rgb(142,44,163)","rgb(223,20,42)","rgb(181,73,255)","rgb(254,65,61)"],55:["rgb(0,59,39)","rgb(181,140,0)","rgb(0,119,89)","rgb(254,218,0)","rgb(0,179,149)","rgb(255,248,87)"],56:["rgb(28,61,92)","rgb(111,37,132)","rgb(77,130,162)","rgb(172,50,193)","rgb(118,170,191)","rgb(191,107,255)"],57:["rgb(101,47,81)","rgb(0,89,57)","rgb(183,76,40)","rgb(0,149,119)","rgb(229,115,0)","rgb(44,229,198)"],58:["rgb(44,18,153)","rgb(163,31,153)","rgb(108,58,254)","rgb(254,68,255)","rgb(148,125,255)","rgb(255,122,141)"],59:["rgb(198,17,52)","rgb(223,20,42)","rgb(255,96,192)","rgb(255,122,141)","rgb(255,170,69)","rgb(255,199,148)"],60:["rgb(202,47,203)","rgb(254,68,255)","rgb(181,73,255)","rgb(191,107,255)","rgb(255,244,155)","rgb(254,254,218)"],61:["rgb(221,179,0)","rgb(254,218,0)","rgb(0,207,54)","rgb(1,252,1)","rgb(35,254,255)","rgb(219,255,255)"],62:["rgb(108,58,254)","rgb(128,90,255)","rgb(118,170,191)","rgb(149,180,201)","rgb(82,253,121)","rgb(178,252,153)"],63:["rgb(101,59,43)","rgb(137,115,101)","rgb(229,115,0)","rgb(255,139,0)","rgb(169,202,211)","rgb(200,220,231)"],64:["rgb(0,119,89)","rgb(0,149,119)","rgb(150,125,255)","rgb(157,172,255)","rgb(114,244,208)","rgb(178,254,224)"],65:["rgb(182,75,39)","rgb(202,91,12)","rgb(255,253,0)","rgb(255,248,87)","rgb(200,153,255)","rgb(210,201,254)"],66:["rgb(77,130,162)","rgb(98,160,181)","rgb(255,24,24)","rgb(254,65,61)","rgb(255,166,166)","rgb(255,216,235)"],67:["rgb(142,44,163)","rgb(172,50,193)","rgb(45,186,255)","rgb(0,220,255)","rgb(221,200,179)","rgb(236,219,199)"],68:["rgb(11,114,33)","rgb(1,168,36)","rgb(0,179,149)","rgb(44,229,198)","rgb(180,206,255)","rgb(193,236,255)"],69:["rgb(1,37,255)","rgb(0,125,254)","rgb(177,145,130)","rgb(211,180,159)","rgb(254,122,120)","rgb(255,191,191)"],70:["rgb(122,13,102)","rgb(163,31,153)","rgb(1,37,255)","rgb(0,125,254)","rgb(0,207,54)","rgb(1,252,1)","rgb(255,170,69)","rgb(255,200,149)"],71:["rgb(142,44,163)","rgb(172,50,193)","rgb(0,179,149)","rgb(44,229,198)","rgb(255,244,155)","rgb(254,254,218)","rgb(91,3,41)","rgb(152,11,63)"],72:["rgb(45,186,255)","rgb(0,220,255)","rgb(82,253,121)","rgb(178,252,153)","rgb(101,47,81)","rgb(142,61,60)","rgb(101,59,43)","rgb(136,114,100)"],73:["rgb(114,244,208)","rgb(178,254,224)","rgb(141,114,1)","rgb(181,140,0)","rgb(255,23,23)","rgb(254,65,61)","rgb(170,200,210)","rgb(200,220,231)"],74:["rgb(40,74,0)","rgb(28,94,7)","rgb(183,76,40)","rgb(202,91,12)","rgb(177,145,130)","rgb(211,180,159)","rgb(180,206,255)","rgb(194,235,255)"],75:["rgb(202,47,203)","rgb(254,68,255)","rgb(222,180,0)","rgb(254,218,0)","rgb(255,122,121)","rgb(255,191,191)","rgb(28,61,92)","rgb(59,100,132)"],76:["rgb(181,73,255)","rgb(191,107,255)","rgb(227,116,0)","rgb(255,139,0)","rgb(221,200,179)","rgb(236,219,199)","rgb(44,18,153)","rgb(84,37,203)"],77:["rgb(200,153,255)","rgb(210,201,255)","rgb(0,59,39)","rgb(0,89,59)","rgb(41,20,1)","rgb(71,40,19)","rgb(108,58,254)","rgb(130,89,255)"],78:["rgb(255,96,194)","rgb(255,122,141)","rgb(35,254,255)","rgb(219,255,255)","rgb(11,114,33)","rgb(1,168,36)","rgb(198,17,52)","rgb(222,19,41)"],79:["rgb(82,25,102)","rgb(111,37,132)","rgb(0,119,89)","rgb(0,149,117)","rgb(255,253,0)","rgb(77,130,162)","rgb(77,130,162)","rgb(98,160,181)"],80:["rgb(255,166,165)","rgb(255,216,235)","rgb(0,6,92)","rgb(1,19,163)","rgb(118,170,191)","rgb(148,180,201)","rgb(150,125,255)","rgb(157,172,255)"],81:["rgb(41,20,1)","rgb(71,40,19)","rgb(108,58,254)","rgb(130,89,255)","rgb(255,96,194)","rgb(255,122,141)"],82:["rgb(82,25,102)","rgb(111,37,132)","rgb(0,119,89)","rgb(43,121,107)","rgb(255,253,0)","rgb(255,248,87)"],83:["rgb(76,129,160)","rgb(98,160,181)","rgb(255,166,166)","rgb(255,216,235)","rgb(0,6,92)","rgb(1,19,163)"],84:["rgb(181,73,255)","rgb(191,107,255)","rgb(227,116,0)","rgb(255,140,1)","rgb(221,200,179)","rgb(235,220,199)"],85:["rgb(114,244,208)","rgb(179,254,224)","rgb(141,114,1)","rgb(181,140,0)","rgb(255,24,24)","rgb(254,65,61)"],86:["rgb(177,145,130)","rgb(211,180,159)","rgb(180,206,255)","rgb(193,236,255)","rgb(202,47,203)","rgb(254,68,255)"],87:["rgb(255,244,155)","rgb(254,254,218)","rgb(91,3,41)","rgb(152,11,63)","rgb(45,186,255)","rgb(0,220,255)"],88:["rgb(170,200,210)","rgb(200,220,231)","rgb(38,74,0)","rgb(28,94,7)","rgb(183,76,40)","rgb(202,91,12)"],89:["rgb(121,12,101)","rgb(163,31,153)","rgb(1,37,255)","rgb(0,125,254)","rgb(0,207,54)","rgb(1,252,0)"],90:["rgb(255,170,67)","rgb(255,200,149)","rgb(142,44,163)","rgb(172,50,193)","rgb(0,179,147)","rgb(44,229,198)"],91:["rgb(35,255,255)","rgb(219,255,255)","rgb(11,114,33)","rgb(1,168,36)","rgb(198,16,54)","rgb(223,20,42)"],92:["rgb(222,180,0)","rgb(254,218,0)","rgb(255,121,118)","rgb(255,191,191)","rgb(28,61,92)","rgb(57,101,130)"],93:["rgb(44,18,153)","rgb(84,37,203)","rgb(200,153,255)","rgb(210,201,255)","rgb(0,59,39)","rgb(0,89,59)"],94:["rgb(82,253,121)","rgb(178,252,153)","rgb(101,47,81)","rgb(93,93,93)","rgb(101,59,43)","rgb(137,115,101)"],95:["rgb(118,170,191)","rgb(93,93,93)","rgb(150,125,255)","rgb(157,172,255)","rgb(122,13,102)","rgb(163,31,153)"],96:["rgb(40,74,0)","rgb(27,95,10)","rgb(142,44,163)","rgb(172,50,193)","rgb(255,96,194)","rgb(255,122,141)"],97:["rgb(0,6,92)","rgb(0,21,163)","rgb(222,180,0)","rgb(254,218,0)","rgb(0,207,54)","rgb(1,252,1)"],98:["rgb(93,69,82)","rgb(152,11,63)","rgb(1,37,255)","rgb(0,125,254)","rgb(181,73,255)","rgb(191,107,255)"],99:["rgb(141,114,1)","rgb(181,140,0)","rgb(77,130,162)","rgb(98,160,181)","rgb(148,125,255)","rgb(157,172,255)"],100:["rgb(44,18,153)","rgb(84,37,203)","rgb(0,119,89)","rgb(0,149,119)","rgb(174,145,129)","rgb(212,180,159)"],101:["rgb(28,61,92)","rgb(59,100,132)","rgb(202,47,203)","rgb(254,68,255)","rgb(227,116,0)","rgb(255,139,0)"],102:["rgb(122,13,102)","rgb(163,31,153)","rgb(101,59,43)","rgb(137,115,101)","rgb(255,24,24)","rgb(254,65,61)"],103:["rgb(101,47,81)","rgb(142,61,60)","rgb(198,17,52)","rgb(223,20,42)","rgb(45,186,255)","rgb(0,220,255)"],104:["rgb(0,59,39)","rgb(0,89,59)","rgb(183,76,40)","rgb(202,90,14)","rgb(255,253,0)","rgb(255,248,87)"],105:["rgb(82,25,102)","rgb(111,37,132)","rgb(108,58,254)","rgb(130,89,255)","rgb(118,170,191)","rgb(149,180,201)"],106:["rgb(41,20,1)","rgb(71,40,19)","rgb(11,114,33)","rgb(11,114,33)","rgb(1,168,36)","rgb(44,229,198)"]},R=function(r){void 0===r&&(r={});var g=r.units;void 0===g&&(g=[24]);var t=r.width;void 0===t&&(t=240);var b=r.height;void 0===b&&(b=240);var i=r.groundsLength;void 0===i&&(i=2);var n=r.percentOfStraightLines;void 0===n&&(n=.5);var o=r.percentOfGradients;void 0===o&&(o=.5);var e=r.percentOfSimplexGradients;void 0===e&&(e=.1);var a=r.swatch;void 0===a&&(a=["rgb(0, 0, 0)"]);var s=r.backgroundColor;void 0===s&&(s="rgb(255, 255, 255)");var c=r.symbols;void 0===c&&(c=["debug"]);var h=r.canvas;void 0===h&&(h=null);var l=r.random;void 0===l&&(l=V.random);var v=c.map(function(r){return d(p[r])}),f=new Array(i).fill(!0).map(function(r,i,c){var h=100*l(),d=E(g,l),f=E(a,l),p=E(v,l),x=h>100*o?u.fix(l()):h<100*e?u.simplex({seed:h}):u.linear(h),y=b*Math.pow(1-i/c.length,3*l()),w=new C(function(r){if(h<100*n)return y/b;var g=C.perlin({seed:h,octaves:3,resolution:64,lacunarity:2,gain:.5})(r/(2+h/100*3));return y/b/2+g});return new m({unit:d,line:w,gradient:x,width:t,height:b,foregroundColor:f,backgroundColor:s,pattern:p})});return new M(f,{canvas:h,backgroundColor:s})};export{R as generate,V as prng,_ as erode,k as hueRotate,T as swatches};
//# sourceMappingURL=ffp-generate.m.js.map
