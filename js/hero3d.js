/* ============================================
   hero3d.js · Three.js 3D 像素立方体 Hero
   ============================================ */

var Hero3D = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  group: null,
  isDragging: false,
  prevX: 0, prevY: 0,
  rotVelX: 0, rotVelY: 0.0035,
  palette: [0xD8C2D6, 0xB8CDE0, 0xFFFFFF, 0xC8C4D0, 0xE8D9E8],
  rafId: null,

  init: function () {
    this.container = document.getElementById("hero-3d");
    if (!this.container || typeof THREE === "undefined") {
      if (this.container) this.container.style.background = "var(--color-primary)";
      return;
    }
    try {
      this.readPalette();
      this.scene = new THREE.Scene();
      var w = this.container.clientWidth || window.innerWidth;
      var h = this.container.clientHeight || window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
      this.camera.position.set(0, 0, 9);

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      this.group = new THREE.Group();
      this.buildCubes();
      this.scene.add(this.group);

      var ambient = new THREE.AmbientLight(0xffffff, 0.75);
      this.scene.add(ambient);
      var dir = new THREE.DirectionalLight(0xffffff, 0.65);
      dir.position.set(6, 8, 6);
      this.scene.add(dir);
      var dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
      dir2.position.set(-6, -4, -6);
      this.scene.add(dir2);

      this.bindInteraction();
      window.addEventListener("resize", this.onResize.bind(this));
      this.animate();
    } catch (e) {
      console.warn("3D 初始化失败，降级为纯色背景:", e);
    }
  },

  readPalette: function () {
    var cs = getComputedStyle(document.documentElement);
    var raw = cs.getPropertyValue("--cube-palette").trim();
    if (raw) {
      this.palette = raw.split(",").map(function (s) {
        s = s.trim();
        return s.indexOf("0x") === 0 ? parseInt(s, 16) : parseInt(s, 16);
      }).filter(function (n) { return !isNaN(n); });
      if (!this.palette.length) this.palette = [0xD8C2D6, 0xB8CDE0, 0xFFFFFF];
    }
  },

  rebuild: function () {
    if (!this.scene || typeof THREE === "undefined") return;
    this.readPalette();
    // 移除旧方块
    while (this.group.children.length) {
      var c = this.group.children[0];
      this.group.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    this.buildCubes();
  },

  buildCubes: function () {
    var geo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    // 3x3x3 阵列，中心更密集、外围随机镂空
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        for (var z = -1; z <= 1; z++) {
          var dist = Math.abs(x) + Math.abs(y) + Math.abs(z);
          var keepChance = dist <= 1 ? 1 : (dist === 2 ? 0.75 : 0.45);
          if (Math.random() > keepChance) continue;
          var color = this.palette[Math.floor(Math.random() * this.palette.length)];
          var mat = new THREE.MeshLambertMaterial({ color: color });
          var cube = new THREE.Mesh(geo, mat);
          cube.position.set(x * 1.02, y * 1.02, z * 1.02);
          cube.userData.originalY = y * 1.02;
          cube.userData.phase = Math.random() * Math.PI * 2;
          this.group.add(cube);
        }
      }
    }
  },

  bindInteraction: function () {
    var el = this.renderer.domElement;
    var down = (x, y) => { this.isDragging = true; this.prevX = x; this.prevY = y; this.rotVelY = 0; };
    var move = (x, y) => {
      if (!this.isDragging) return;
      var dx = x - this.prevX, dy = y - this.prevY;
      this.rotVelY = dx * 0.008;
      this.group.rotation.y += dx * 0.008;
      this.group.rotation.x += dy * 0.008;
      this.group.rotation.x = Math.max(-1.2, Math.min(1.2, this.group.rotation.x));
      this.prevX = x; this.prevY = y;
    };
    var up = () => { this.isDragging = false; };

    el.addEventListener("mousedown", e => down(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
    window.addEventListener("mouseup", up);
    el.addEventListener("touchstart", e => { down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener("touchmove", e => {
      if (this.isDragging) { move(e.touches[0].clientX, e.touches[0].clientY); }
    }, { passive: true });
    window.addEventListener("touchend", up);
  },

  onResize: function () {
    if (!this.renderer) return;
    var w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  },

  animate: function () {
    this.rafId = requestAnimationFrame(this.animate.bind(this));
    if (!this.isDragging) {
      this.group.rotation.y += this.rotVelY;
      // 惯性回弹
      this.rotVelY += (0.0035 - this.rotVelY) * 0.02;
    }
    var t = Date.now() * 0.001;
    for (var i = 0; i < this.group.children.length; i++) {
      var c = this.group.children[i];
      c.position.y = c.userData.originalY + Math.sin(t + c.userData.phase) * 0.08;
    }
    this.renderer.render(this.scene, this.camera);
  }
};
