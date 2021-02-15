let elementalApp = (function() {
  let grid;
  class Grid {
    constructor() {
      this.rowSize = 128;
      this.colSize = 128;
      this.scale = 1;
      this.generation = 0;
      this.particles = {};
      this.dirtyParticles = {};
      this.tool = "sand";
    }

    createParticle(x, y, type, color) {
      let newParticle = new Particle();
      newParticle.x = x;
      newParticle.y = y;

      newParticle.type = type || "sand";
      newParticle.color = color || "#c2b280";
      this.particles[`${x}-${y}`] = newParticle;
      this.dirtyParticles[`${x}-${y}`] = newParticle;
    }
  }

  class Particle {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.color = "#c2b280";
      this.size = 1;
      this.type = "sand";
    }

    assignCellColor() {
      let color = "#c2b280";
      this.color = color;
    }

    updateParticle() {
      if (this.y + 1 > grid.rowSize) {
        return;
      } else if (this.x - 1 < 0) {
        return;
      } else if (this.x + 1 > grid.colSize - 1) {
        return;
      }
      // if down empty
      if (!grid.particles[`${this.x}-${this.y + 1}`]) {
        // move down
        this.y++;
        delete grid.dirtyParticles[`${this.x}-${this.y - 1}`];
        delete grid.particles[`${this.x}-${this.y - 1}`];
        grid.particles[`${this.x}-${this.y}`] = this;
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
      } else if (grid.particles[`${this.x}-${this.y + 1}`].type === "water" && this.type === "sand") {
        this.y++;
        delete grid.dirtyParticles[`${this.x}-${this.y - 1}`];
        delete grid.particles[`${this.x}-${this.y - 1}`];
        delete grid.dirtyParticles[`${this.x}-${this.y}`];
        delete grid.particles[`${this.x}-${this.y}`];
        grid.createParticle(this.x, this.y-1, "water", "#0077be");
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
        grid.particles[`${this.x}-${this.y}`] = this;
      } else if (!grid.particles[`${this.x - 1}-${this.y + 1}`]) {
      // else if down and left empty
        // move down left
        this.y++;
        this.x--;
        delete grid.dirtyParticles[`${this.x + 1}-${this.y - 1}`];
        delete grid.particles[`${this.x + 1}-${this.y - 1}`];
        grid.particles[`${this.x}-${this.y}`] = this;
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
      } else if (!grid.particles[`${this.x + 1}-${this.y + 1}`]) {
        // else if down and right empty
        // move down right
        this.y++;
        this.x++;
        delete grid.dirtyParticles[`${this.x - 1}-${this.y - 1}`];
        delete grid.particles[`${this.x - 1}-${this.y - 1}`];
        grid.particles[`${this.x}-${this.y}`] = this;
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
      } else if (this.type === "water" && !grid.particles[`${this.x - 1}-${this.y}`]) {
        this.x--;
        delete grid.dirtyParticles[`${this.x + 1}-${this.y}`]
        delete grid.particles[`${this.x + 1}-${this.y}`];
        grid.particles[`${this.x}-${this.y}`] = this;
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
      } else if (this.type === "water" && !grid.particles[`${this.x + 1}-${this.y}`]) {
        this.x++;
        delete grid.dirtyParticles[`${this.x - 1}-${this.y}`];
        delete grid.particles[`${this.x - 1}-${this.y}`];
        grid.particles[`${this.x}-${this.y}`] = this;
        grid.dirtyParticles[`${this.x}-${this.y}`] = this;
      } else {
        delete grid.dirtyParticles[`${this.x}-${this.y}`];
      }
    }
  }

  function init() {
    grid = new Grid();
  }

  function update() {
    let particles = Object.keys(grid.dirtyParticles);
    let gridParts = grid.dirtyParticles;
    if (grid.generation%5 == 0) {
      particles = Object.keys(grid.particles);
      gridParts = grid.particles;
    }
    console.log(particles.length);
    particles.forEach((particle) => {
      gridParts[particle].updateParticle();
    });

    grid.generation++;
  }

  function draw() {
    let canvas = document.getElementById('canvas');
    canvas.width = 512;
    canvas.height = 512;
    if (canvas.getContext) {
      let ctx = canvas.getContext('2d');
      let particles = Object.keys(grid.particles);
      ctx.clearRect(0, 0, 512, 512);

      particles.forEach((particle) => {
        let rectParticle = grid.particles[particle];
        ctx.fillStyle = rectParticle.color;
        ctx.fillRect(rectParticle.x * 4, rectParticle.y * 4, rectParticle.size * 4, rectParticle.size * 4);
      });
    }
  }

  var clickInterval = null;
  var isDrawing = false;

  // Paint Circle
  function distance(p1, p2)
  {
    dx = p2.x - p1.x; dx *= dx;
    dy = p2.y - p1.y; dy *= dy;
    return Math.sqrt( dx + dy );
  }

  function getPoints(x, y, r)
  {
      var ret = [];
      for (var j=x-r; j<=x+r; j++)
        for (var k=y-r; k<=y+r; k++)
            if (distance({x:j,y:k},{x:x,y:y}) <= r) ret.push({x:j,y:k});
      return ret;
  }

  function getMousePosition(canvas, event) { 
    let rect = canvas.getBoundingClientRect(); 
    let x = Math.floor((event.clientX - rect.left) / 4); 
    let y = Math.floor((event.clientY - rect.top) / 4); 
    let brushPoints = getPoints(x, y, 5);

    brushPoints.forEach((point) => {
      if (point.x % 5 && point.y % 5) {
        if (grid.tool === "sand") {
          grid.createParticle(point.x, point.y, "sand", "#c2b280");
        } else if (grid.tool === "water") {
          grid.createParticle(point.x, point.y, "water", "#0077be");
        } else if (grid.tool === "eraser") {
          delete grid.particles[`${point.x}-${point.y}`];
          delete grid.dirtyParticles[`${point.x}-${point.y}`];
        }
      }
    });
  }

  let canvasElem = document.querySelector("canvas"); 
    
  canvasElem.addEventListener("mousedown", (e) => {
    isDrawing = true;
    getMousePosition(canvasElem, e);
  }); 

  canvasElem.addEventListener("mouseup", (e) => {
    isDrawing = false;
  })

  canvasElem.addEventListener('mousemove', (e) => {
    if (isDrawing) {
      getMousePosition(canvasElem, e);
    }
  });

  document.addEventListener('keydown', switchTool);

  function switchTool(e) {
    if (e.code === "KeyE") {
      grid.tool = "eraser";
    } else if (e.code === "KeyW") {
      grid.tool = "water";
    } else if (e.code === "KeyS") {
      grid.tool = "sand";
    }
  }

  init();

  function performAnimation () {
    let debugTimerStart;
    let debugTimerEnd;
    debugTimerStart = performance.now();
    update();
    draw();
    debugTimerEnd = performance.now();
    //console.log(`play() took: ${debugTimerEnd - debugTimerStart}`);
    //console.log(grid.generation);
    requestAnimationFrame(performAnimation);
  }

  requestAnimationFrame(performAnimation);
})();
