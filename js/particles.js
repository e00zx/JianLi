/* ============================================
   particles.js · 像素粒子雨 + 星空
   ============================================ */

var ParticleSystem = {
  canvas: null,
  ctx: null,
  raindrops: [],
  stars: [],
  config: { rainCount: 70, starCount: 110, speed: 1 },
  colorRGB: "196, 158, 192",
  starRGB: "143, 169, 196",
  running: true,
  rafId: null,

  init: function () {
    this.canvas = document.getElementById("particle-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", this.resize.bind(this));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { this.running = false; cancelAnimationFrame(this.rafId); }
      else if (!this.running) { this.running = true; this.animate(); }
    });
    this.applyConfig(SiteConfig.particles);
    this.readThemeColors();
    this.animate();
  },

  readThemeColors: function () {
    var cs = getComputedStyle(document.documentElement);
    this.colorRGB = cs.getPropertyValue("--particle-color").trim() || this.colorRGB;
    this.starRGB = cs.getPropertyValue("--star-color").trim() || this.starRGB;
  },

  resize: function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createRain();
    this.createStars();
  },

  applyConfig: function (cfg) {
    Object.assign(this.config, cfg);
    this.createRain();
    this.createStars();
    this.canvas.style.display = cfg.enabled ? "block" : "none";
  },

  createRain: function () {
    this.raindrops = [];
    var count = this.config.rainCount;
    for (var i = 0; i < count; i++) {
      this.raindrops.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.floor(Math.random() * 3) + 2,
        speed: Math.random() * 1.4 + this.config.speed * 0.6,
        opacity: Math.random() * 0.4 + 0.15
      });
    }
  },

  createStars: function () {
    this.stars = [];
    var count = this.config.starCount;
    for (var i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() < 0.7 ? 2 : 3,
        twinkle: Math.random() * 0.03 + 0.006,
        phase: Math.random() * Math.PI * 2
      });
    }
  },

  animate: function () {
    if (!this.running) return;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;

    // 星星
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      s.phase += s.twinkle;
      var op = 0.25 + Math.abs(Math.sin(s.phase)) * 0.55;
      ctx.fillStyle = "rgba(" + this.starRGB + "," + op.toFixed(2) + ")";
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // 像素粒子雨
    for (var j = 0; j < this.raindrops.length; j++) {
      var d = this.raindrops[j];
      d.y += d.speed;
      if (d.y > this.canvas.height) {
        d.y = -d.size;
        d.x = Math.random() * this.canvas.width;
      }
      ctx.fillStyle = "rgba(" + this.colorRGB + "," + d.opacity.toFixed(2) + ")";
      ctx.fillRect(Math.floor(d.x), Math.floor(d.y), d.size, d.size);
    }

    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }
};
