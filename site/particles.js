const obj = (id) => document.querySelector(id);
Node.prototype.on = function (a, b, c) {
  this.addEventListener(a, b, c);
};
const random = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
const rColor = () =>
  "rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")";
function show(o) {
  o.style.visibility = "inherit";
}
function hide(o) {
  o.style.visibility = "hidden";
}
function create(el, text = "") {
  let e = document.createElement(el);
  e.innerHTML = text;
  return e;
}
function map(v, n1, n2, m1, m2) {
  return ((v - n1) / (n2 - n1)) * (m2 - m1) + m1;
}
// const distance=(x,y,x1,y1)=>Math.round(Math.sqrt((x-x1)**2+(y-y1)**2));
function range(min, max) {
  let a = [],
    i;
  for (i = min; i < max; i++) a.push(i);
  return a;
}
function download(filename, text) {
  var e = create("a");
  e.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
  e.download = filename;
  e.style.display = "none";
  document.body.appendChild(e);
  e.click();
  document.body.removeChild(e);
}
function upload(inputObject, cal) {
  inputObject.on("change", function (e) {
    for (let f of e.target.files) {
      if (f) {
        var r = new FileReader();
        r.readAsText(f);
        r.onload = function (e) {
          cal(e.target.result, f.name);
        };
      }
    }
  });
}
function xml(f, fn) {
  var x = new XMLHttpRequest();
  x.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) fn(this.responseText);
  };
  x.open("GET", f, true);
  x.send();
}

var FULLSCREEN = false;
document.onfullscreenchange = () => {
  FULLSCREEN = !FULLSCREEN;
};
class mouse {
  static pos = { x: 0, y: 0 };
  static down = false;
  static right = false;
  static transformPos(e) {
    var x, y;
    var element = e.target;
    let br = element.getBoundingClientRect();
    if (FULLSCREEN) {
      let ratio = window.innerHeight / canvas.height;
      let offset = (window.innerWidth - canvas.width * ratio) / 2;
      x = map(
        e.clientX - br.left - offset,
        0,
        canvas.width * ratio,
        0,
        element.width
      );
      y = map(e.clientY - br.top, 0, canvas.height * ratio, 0, element.height);
    } else {
      x = e.clientX - br.left;
      y = e.clientY - br.top;
    }
    return { x, y };
  }
  static start(element = document.documentElement) {
    function mousemove(e) {
      let pos = mouse.transformPos(e);
      mouse.pos.x = pos.x;
      mouse.pos.y = pos.y;
    }
    function mouseup(e) {
      if (e.which == 1) {
        mouse.down = false;
      } else if (e.which == 3) {
        mouse.right = false;
      }
    }
    function mousedown(e) {
      if (e.target != element) return;
      mousemove(e);
      if (e.which == 1) {
        mouse.down = true;
      } else if (e.which == 3) {
        mouse.right = true;
      }
    }
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }
}
class keys {
  static keys = [];
  static start() {
    function keydown(e) {
      keys.keys[e.key.toLowerCase()] = true;
    }
    function keyup(e) {
      keys.keys[e.key.toLowerCase()] = false;
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
  }
  static down(key) {
    if (key.toLowerCase() in keys.keys) {
      return keys.keys[key.toLowerCase()];
    }
    return false;
  }
}
class Touch {
  static touches = [];
  static resolved = [];
  static init(callback) {
    function fixid(id) {
      return Math.abs(id % 10);
    }

    document.on("touchstart", (e) => {
      for (let touch of e.changedTouches) {
        Touch.touches[fixid(touch.identifier)] = touch;
        // try{e.preventDefault()}catch(e){};
      }
    });

    document.on("touchmove", (e) => {
      if (Touch.touches.filter((e) => e).length == 1) {
        for (let touch of e.changedTouches) {
          let last_pos = Touch.touches[fixid(touch.identifier)];
          callback({
            type: "scroll",
            x: touch.clientX,
            y: touch.clientY,
            dx: touch.clientX - last_pos.clientX,
            dy: touch.clientY - last_pos.clientY,
            target: last_pos.target,
          });
          touch.action = "scroll";
          Touch.touches[fixid(touch.identifier)] = touch;
        }
      } else {
        let counter = 0;
        let tmps = [];
        for (let last_pos of Touch.touches.filter((e) => e)) {
          let touch = [...e.changedTouches].filter(
            (e) => last_pos.identifier == e.identifier
          )[0];
          if (touch) {
            tmps.push({
              x: touch.clientX,
              y: touch.clientY,
              dx: touch.clientX - last_pos.clientX,
              dy: touch.clientY - last_pos.clientY,
            });
            touch.action = "zoom";
            Touch.touches[fixid(touch.identifier)] = touch;
          } else {
            tmps.push({
              x: last_pos.clientX,
              y: last_pos.clientY,
              dx: 0,
              dy: 0,
            });
          }
          if (++counter == 2) break;
        }
        let scaley =
          (tmps[0].y + tmps[0].dy - tmps[1].y - tmps[1].dy) /
          (tmps[0].y - tmps[1].y);
        let scalex =
          (tmps[0].x + tmps[0].dx - tmps[1].x - tmps[1].dx) /
          (tmps[0].x - tmps[1].x);
        let ct = {
          x: (tmps[0].x + tmps[1].x) / 2,
          y: (tmps[0].y + tmps[1].y) / 2,
        };
        // let scale = Math.abs(1-scalex)>Math.abs(1-scaley)?scalex:scaley;
        scalex = Math.max(Math.min(scalex, 2), 0.5);
        scaley = Math.max(Math.min(scaley, 2), 0.5);
        let scale = scaley;
        if (Math.abs(scale) > 2) return;
        if (isNaN(scale)) return;
        if (scale == 0) return;
        callback({
          type: "zoom",
          touch1: tmps[0],
          touch2: tmps[1],
          scale,
          ct,
        });
      }
    });

    document.on("touchend", (e) => {
      for (let touch of e.changedTouches) {
        let ot = Touch.touches[fixid(touch.identifier)];
        if (!ot.action) {
          let dx = ot.clientX - touch.clientX,
            dy = ot.clientY - touch.clientY;
          let br = ot.target.getBoundingClientRect();
          if (Math.sqrt(dx ** 2 + dy ** 2) < 5) {
            callback({
              type: "click",
              x: ot.clientX - br.x,
              y: ot.clientY - br.y,
              target: ot.target,
            });
          }
        } else {
          let br = ot.target.getBoundingClientRect();
          callback({
            type: "end",
            x: ot.clientX - br.x,
            y: ot.clientY - br.y,
            target: ot.target,
          });
        }
        Touch.touches[fixid(touch.identifier)] = null;
      }
    });
  }
}

class Vector {
  static distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  static getDir(x, y) {
    return ((Math.atan(y / x) + (x < 0 ? 0 : Math.PI)) * 180) / Math.PI;
  }
  static rad(deg) {
    return (deg * Math.PI) / 180;
  }
  static getPointIn(dir, dist, ox = 0, oy = 0) {
    let x = ox + Math.cos(dir) * dist;
    let y = oy + Math.sin(dir) * dist;
    return new Vector(x, y);
  }
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  mult(m) {
    return new Vector(this.x * m, this.y * m);
  }
  add(x, y) {
    return new Vector(this.x + x, this.y + y);
  }
  clone() {
    return new Vector(this.x, this.y);
  }
}
function Line(px1 = 0, py1 = 0, px2 = 1, py2 = 1) {
  var x1 = px1;
  var y1 = py1;
  var x2 = px2;
  var y2 = py2;
  function setPos(px1, py1, px2, py2) {
    x1 = px1;
    y1 = py1;
    x2 = px2;
    y2 = py2;
  }
  function getPosA() {
    return new Vector(x1, y1);
  }
  function getPosB() {
    return new Vector(x2, y2);
  }
  function touches(line) {
    let posA = line.getPosA();
    let posB = line.getPosB();
    const x3 = posA.x;
    const y3 = posA.y;
    const x4 = posB.x;
    const y4 = posB.y;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      const pt = new Vector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else return;
  }
  function draw(color = "white") {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  this.getPosA = getPosA;
  this.getPosB = getPosB;
  this.touches = touches;
  this.draw = draw;
  this.setPos = setPos;
}
class Animation {
  static xml(path, fn) {
    var x = new XMLHttpRequest();
    x.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) fn(this.responseText);
    };
    x.open("GET", path, true);
    x.send();
  }
  #animID = 0;
  #frLists = [];
  #dir = "";
  #prom;
  constructor(element, data) {
    var file = JSON.parse(data);
    this.file = file;
    this.frames = [];
    this.element = element;
    this.current_frame = 0;
    this.#animID = 0;
    this.#frLists = file.frames.map((e) => e.frames);
    this.names = file.frames.map((e) => e.name);
    this.fps = 30;
    this.frame_count = file.count;
    this.#dir = file.dirname;
    this.isLoop = false;
    this.playing = false;
    this.name = "";
    this.last_time = new Date().getTime();
    this.next_frame = null;
    this.end = () => {};
    for (let i = 0; i < this.frame_count; i++) {
      this.frames.push(createImage(this.pad(i)));
    }
    this.element.src = this.frames[0].src;
    this.next_frame = this.frames[0];

    function createImage(path) {
      let i = document.createElement("img");
      i.src = path;
      return i;
    }
  }
  pad(n) {
    let len = (this.frame_count + "").length;
    return this.#dir + "/" + ("0".repeat(len) + n).slice(-len) + ".png";
  }
  loop() {
    if (!this.playing) return;
    let t = new Date().getTime();
    let diff = t - this.last_time;
    if (diff > 1000 / this.fps) {
      if (this.current_frame < this.#frLists[this.#animID].length) {
        let id = this.#animID;
        this.element.src = this.next_frame.src;
        this.next_frame = this.frames[this.#frLists[id][this.current_frame]];
        this.current_frame++;
      } else {
        if (this.isLoop) {
          this.current_frame = 0;
          this.loop();
        } else {
          this.playing = false;
          this.stop();
        }
      }
      this.last_time = t;
    }
  }
  play(name, is_loop = false) {
    if (this.name == name) return new Promise((r) => r(0));
    if (this.playing) {
      this.stop();
    }
    const THIS = this;
    if (this.playing && this.name == name) return new Promise((r) => r(0));
    this.isLoop = is_loop;
    this.playing = true;
    this.current_frame = 1;
    var index = this.names.indexOf(name);
    if (index != -1) {
      this.fps = this.file.frames[index].fps;
      this.#animID = index;
      this.name = name;
      this.current_frame = 1;
      this.next_frame =
        this.frames[
          this.#frLists[index][Math.min(0, this.#frLists[index].length)]
        ];
      this.last_time = new Date().getTime();
      this.#prom = new Promise((resolve) => {
        THIS.end = (c) => {
          resolve(c);
        };
      });
      return this.#prom;
    } else {
      console.warn("Not a valid Animation: " + name);
      return new Promise((r) => r(0));
    }
  }
  stop() {
    let arr = this.#frLists[this.#animID];
    if (arr) {
      this.element.src = this.frames[arr[arr.length - 1]].src;
    }
    this.playing = false;
    this.isLoop = false;
    this.name = "";
    this.end(1);
  }
}
class Hitbox {
  static show = false;
  constructor(pos, w, h) {
    this.pos = pos;
    this.w = w;
    this.h = h;
    this.lines = [new Line(), new Line(), new Line(), new Line()];
    this.angles = [];
    this.scale = new Vector(1, 1);
    this.offset = new Vector();
    this.dir = 0;
    this.update();
  }
  update() {
    let scaleX = this.scale.x;
    let scaleY = this.scale.y;
    let w2 = (this.w * scaleX) / 2;
    let h2 = (this.h * scaleY) / 2;
    let px = this.pos.x;
    let py = this.pos.y;
    this.angles[0] = Vector.getDir(-w2, -h2);
    this.angles[1] = Vector.getDir(w2, -h2);
    this.angles[2] = Vector.getDir(w2, h2);
    this.angles[3] = Vector.getDir(-w2, h2);
    let points = [];
    let dist = Vector.distance(px, py, px - w2, py - h2);
    let offsetX = this.offset.x;
    let offsetY = this.offset.y;
    for (let i = 0; i < 4; i++) {
      let ln = this.lines[i];
      let an = this.angles[i];
      let pt = Vector.getPointIn(
        Vector.rad(this.dir + an),
        dist,
        px + offsetX,
        py + offsetY
      );
      points.push(pt);
    }
    for (let i = 4; i < 8; i++) {
      let pt1 = points[i % 4];
      let pt2 = points[(i - 1) % 4];
      this.lines[i % 4].setPos(pt1.x, pt1.y, pt2.x, pt2.y);
    }
  }
  DRAW(color = "white") {
    ctx.fillStyle = color;
    ctx.fillRect(this.pos.x - 1, this.pos.y - 1, 3, 3);
    ctx.beginPath();
    ctx.lineWidth = 3;
    for (let line of this.lines) {
      line.draw(color);
    }
    ctx.stroke();
  }
  touches(hitbox) {
    if (hitbox instanceof Hitbox) {
      let lines = this.lines;
      let other = hitbox.lines;
      for (let l1 of lines) {
        for (let l2 of other) {
          if (l1.touches(l2)) {
            return true;
          }
        }
      }
    } else if (hitbox instanceof Line) {
      for (let l1 of this.lines) {
        if (l1.touches(hitbox)) {
          return true;
        }
      }
    }
    return false;
  }
  set direction(d) {
    this.dir = d;
    this.update();
    return d;
  }
  set position(v) {
    this.pos.x = v.x;
    this.pos.y = v.y;
    this.update();
    return v;
  }
  set width(w) {
    this.w = w;
    this.update();
    return w;
  }
  set height(h) {
    this.h = h;
    this.update();
    return h;
  }
  set setScale(v) {
    this.scale.x = v.x;
    this.scale.y = v.y;
    this.update();
    return v;
  }
  set setOffset(v) {
    this.offset.x = v.x;
    this.offset.y = v.y;
    this.update();
    return v;
  }
}
class Sprite extends Hitbox {
  #iter = 0;
  #max_iter = 0;
  #slide_x = 0;
  #slide_y = 0;
  #end_slide;
  constructor(image_path, ready_callback = () => {}) {
    var once = false;
    super(new Vector(-100, -100), 1, 1);
    const THIS = this;
    this.element = document.createElement("img");
    this.element.src = image_path;
    this.animation;
    this.transformX = 1;
    this.sliding = false;
    this.visible = true;
    this.alpha = -1;
    this.element.onload = function () {
      if (once) return;
      once = true;
      THIS.width = THIS.element.width;
      THIS.height = THIS.element.height;
      ready_callback();
    };
    this.move = (data) => {};
  }
  draw() {
    if (!this.visible) return;
    if (this.animation) this.animation.loop();
    if (this.sliding) {
      if (this.#iter <= this.#max_iter) {
        let p = this.pos;
        this.position = new Vector(p.x + this.#slide_x, p.y + this.#slide_y);
      } else {
        this.sliding = false;
        if (typeof this.#end_slide == "function") {
          this.#end_slide();
        }
      }
      this.#iter++;
    } else {
      this.move(this.pos.clone());
    }
    let pos = this.pos;
    let drawPos = this.lines[2].getPosA();
    let ga;
    if (this.alpha != -1) {
      ga = ctx.globalAlpha;
      ctx.globalAlpha = this.alpha;
    }
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(Vector.rad(this.dir));
    ctx.scale(this.transformX, 1);
    ctx.drawImage(this.element, -this.w / 2, -this.h / 2);
    ctx.restore();
    if (this.alpha != -1) {
      ctx.globalAlpha = ga;
    }
    if (Hitbox.show) this.DRAW();
  }
  addAnimation(animation_path) {
    return new Promise((resolve) => {
      Animation.xml(animation_path, (data) => {
        this.animation = new Animation(this.element, data);
        resolve();
      });
    });
  }
  addMovement(callback) {
    this.move = callback;
  }
  slideTo(x, y, segs = 8) {
    return new Promise((resolve) => {
      this.sliding = true;
      let pos = this.pos;
      this.#max_iter = segs;
      this.#iter = 1;
      this.#slide_x = (x - pos.x) / segs;
      this.#slide_y = (y - pos.y) / segs;
      this.#end_slide = function () {
        resolve();
      };
    });
  }
  distanceTo(sprite) {
    if (sprite instanceof Sprite) {
      let d = Vector.distance(
        this.pos.x,
        this.pos.y,
        sprite.pos.x,
        sprite.pos.y
      );
      return d;
    }
  }
}
class TileSprite extends Hitbox {
  constructor(tile) {
    super(tile.getCenter(), tile.grid.scale, tile.grid.scale);
    const THIS = this;
    this.tile = tile;
    this.animation = null;
    this.transformX = 1;
    tile.img = new Image();
    tile.img.src = "";
    this.angle = 0;
    tile.drawImg = function () {
      let c = tile.getCenter();
      let s = tile.grid.scale;
      ctx.beginPath();
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((THIS.angle * Math.PI) / 180);
      ctx.scale(THIS.transformX, 1);
      ctx.drawImage(this.img, -s / 2, -s / 2, s, s);
      ctx.restore();

      if (THIS.animation) {
        THIS.animation.loop();
      }
    };
    tile.sprite = this;
  }
  addAnimation(path) {
    return new Promise((resolve) => {
      Animation.xml(path, (text) => {
        this.animation = new Animation(this.tile.img, text);
        resolve(this.animation);
      });
    });
  }
}

const canvas = document.createElement("canvas");
canvas.style.position = "fixed";
canvas.style.left = "0";
canvas.style.top = "0";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.resize = resize;
mouse.start(canvas);
resize();
class Particle {
  constructor(x, y, r = 5, dx = 0, dy = 0, color = "rgb(255,0,0)") {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.r = r;
    this.color = color.match(/[0-9,]+/)[0];
    this.alpha = 0;
  }
  draw() {
    ctx.beginPath();
    this.x += this.dx;
    this.y += this.dy;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${Math.max(this.alpha, 255)})`;
    ctx.fill();
  }
  applyGravity() {
    this.dy++;
  }
  explode() {
    for (let i = 0; i < 60; i++) generateRandomParticle(this.x, this.y);
  }
  fade() {
    this.alpha++;
  }
}

class Firework {
  constructor() {
    let x = random(0, canvas.width);
    let y = canvas.height;
    let p = new Particle(x, y, 15, random(-20, 20), random(-30, -45), `0,0,0`);
    this.p = p;
    this.flying = true;
  }
  draw() {
    if (this.p.dy < 10) {
      this.p.draw();
      this.p.applyGravity();
    } else if (this.flying) {
      this.flying = false;
      this.p.explode();
    }
  }
}

let particles = [];

function generateRandomParticle(x = mouse.pos.x, y = mouse.pos.y) {
  let d = random(0, 360);
  let v = Vector.getPointIn(Vector.rad(d), random(5, 18));
  let p = new Particle(x, y, random(3, 8), v.x, v.y, rColor());
  particles.push(p);
}
function loop() {
  setTimeout(loop, 1000 / 30);
  ctx.clearRect(-2, -2, canvas.width + 2, canvas.height + 2);
  //   generateRandomParticle();
  if (mouse.down) {
    particles.push(new Firework());
    mouse.down = false;
  }
  for (let p of particles) {
    p.draw();
    if (p instanceof Particle) {
      p.applyGravity();
      p.fade();
    }

    if (p.y > 8000 || (!p.flying && p instanceof Firework) ) {
      particles.splice(particles.indexOf(p), 1);
    }
  }
}

loop();
