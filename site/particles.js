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
    this.color = color.match(/[0-9,]+/)[0]
    this.alpha = 0;
  }
  draw() {
    ctx.beginPath();
    this.x += this.dx;
    this.y += this.dy;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${Math.max(this.alpha,255)})`;
    ctx.fill();
  }
  applyGravity() {
    this.dy++;
  }
  explode() {
    for (let i = 0; i < 60; i++) generateRandomParticle(this.x, this.y);
  }
  fade(){
    this.alpha++;
  }
}

class Firework {
    constructor(){
        let x = random(0,canvas.width);
        let y = canvas.height;
        let p = new Particle(x,y,15, random(-20,20), random(-30,-45), `0,0,0`);
        this.p = p;
        this.flying = true;
    }
    draw(){
        if(this.p.dy < 10){
            this.p.draw();
            this.p.applyGravity();
        } else if(this.flying){
            this.flying = false;
            this.p.explode();
        }
    }
}

let particles = [];

function generateRandomParticle(x = mouse.pos.x, y = mouse.pos.y) {
  let d = random(0, 360);
  let v = Vector.getPointIn(Vector.rad(d), random(5,18));
  let p = new Particle(x, y, random(3, 8), v.x, v.y, rColor());
  particles.push(p);
}
function loop() {
  setTimeout(loop, 1000 / 30);
  ctx.clearRect(-2, -2, canvas.width + 2, canvas.height + 2);
//   generateRandomParticle();
  if(mouse.down){
    particles.push(new Firework());
    mouse.down = false;
  }
  for (let p of particles) {
    p.draw();
    if(p instanceof Particle){
        p.applyGravity();
        p.fade();
    }
  }
}

loop();
