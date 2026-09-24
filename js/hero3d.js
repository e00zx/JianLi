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
  /* 环绕魔方公转的作品图片平面 */
  orbit: null,
  orbitOpacity: 0.55,
  orbitSpin: 0,
  tmpQuat: null,
  orbitParticles: null,
  styleGlow: [0.5, 0.85],
  styleCore: null,
  styleSpark: null,

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
      this.tmpQuat = new THREE.Quaternion();
      this.buildOrbitImages();

      var ambient = new THREE.AmbientLight(0xffffff, 0.32);
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
    // 风格模板优先（工坊可选），auto 则跟随全站主题 CSS 变量
    var tpl = null;
    var styleId = (typeof SiteConfig !== "undefined" && SiteConfig.home && SiteConfig.home.hero) ? SiteConfig.home.hero.style : "auto";
    if (typeof HERO_CUBE_STYLES !== "undefined" && styleId !== "auto") tpl = HERO_CUBE_STYLES[styleId];
    if (tpl && tpl.palette) {
      this.palette = tpl.palette.slice();
      this.styleCore = tpl.core || null;
      this.styleGlow = tpl.glow || [0.5, 0.85];
      this.styleSpark = tpl.spark || null;
      return;
    }
    this.styleCore = null;
    this.styleGlow = (tpl && tpl.glow) || [0.5, 0.85];
    this.styleSpark = (tpl && tpl.spark) || null;
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
    // 移除旧方块（含描边子对象与发光核心，统一释放资源）
    while (this.group.children.length) {
      var c = this.group.children[0];
      this.group.remove(c);
      c.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    this.coreMesh = null;
    this.buildCubes();
    // 粒子配色跟随新模板刷新（不重建图片，避免纹理重新加载）
    this.refreshOrbitParticles();
  },

  buildCubes: function () {
    // 方块略缩（0.88）加宽缝隙，透出内部发光核心
    var geo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    var edges = new THREE.EdgesGeometry(geo);
    // 3x3x3 阵列，中心更密集、外围随机镂空
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        for (var z = -1; z <= 1; z++) {
          var dist = Math.abs(x) + Math.abs(y) + Math.abs(z);
          var keepChance = dist <= 1 ? 1 : (dist === 2 ? 0.75 : 0.45);
          if (Math.random() > keepChance) continue;   // 镂空处露出核心光 → 缝隙发光
          var color = this.palette[Math.floor(Math.random() * this.palette.length)];
          // 暗色基底 + 高强度原色自发光 → 发光灯块；白描边强化像素霓虹轮廓
          var gMin = this.styleGlow[0], gMax = this.styleGlow[1];
          var mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color(color).multiplyScalar(0.5),
            emissive: color,
            emissiveIntensity: gMin + Math.random() * (gMax - gMin)
          });
          var cube = new THREE.Mesh(geo, mat);
          cube.position.set(x * 1.02, y * 1.02, z * 1.02);
          cube.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.7
          })));
          cube.userData.originalY = y * 1.02;
          cube.userData.phase = Math.random() * Math.PI * 2;
          cube.userData.glowBase = mat.emissiveIntensity;
          this.group.add(cube);
        }
      }
    }
    // 内部发光核心：贴近外壳内壁，镂空位与缝隙强烈透光；模板色优先，否则跟随主题
    var coreColor = this.styleCore ||
      (this.palette.indexOf(0xFFFFFF) !== -1 ? 0xFFFFFF : (this.palette[0] || 0xFFFFFF));
    this.coreMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.8, 2.8),
      new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.85 })
    );
    this.group.add(this.coreMesh);
    // 中心光：映亮缝隙与外围方块内侧
    var pl = new THREE.PointLight(this.styleCore || this.palette[0] || 0xffffff, 1.5, 14);
    this.group.add(pl);
  },

  /* ---------- 环绕魔方公转的作品图片（半透明 · 透视 · 透明度可调） ---------- */

  heroOrbitConfig: function () {
    var cfg = (typeof SiteConfig !== "undefined" && SiteConfig.home && SiteConfig.home.hero) || {};
    return {
      enabled: cfg.orbitImages !== false,
      opacity: (cfg.orbitOpacity != null && !isNaN(cfg.orbitOpacity)) ? cfg.orbitOpacity : 0.55
    };
  },

  orbitWorks: function () {
    var list = (typeof SiteConfig !== "undefined" && SiteConfig.works_list) || [];
    var ids = (typeof SiteConfig !== "undefined" && SiteConfig.home && SiteConfig.home.featuredIds) || [];
    var imgs = list.filter(function (w) {
      return w.type !== "video" && w.cover && ids.indexOf(w.id) !== -1;
    });
    if (!imgs.length) {
      imgs = list.filter(function (w) { return w.type !== "video" && w.cover; }).slice(0, 6);
    }
    return imgs.slice(0, 8);
  },

  buildOrbitImages: function () {
    if (!this.scene) return;
    this.clearOrbit();
    var cfg = this.heroOrbitConfig();
    this.orbitOpacity = cfg.opacity;
    if (!cfg.enabled) return;

    var works = this.orbitWorks();
    if (!works.length) return;

    var orbit = new THREE.Group();
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    var self = this;

    works.forEach(function (w, i) {
      // 散乱分布：均匀间隔加随机抖动（保证方位角错开），半径与高度随机错落，互不遮挡
      var angle = (i / works.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      var radius = 3.4 + Math.random() * 1.0;                       // 3.4 ~ 4.4
      var ySide = (i % 2 === 0 ? 1 : -1);                           // 交替偏上/偏下
      var y = ySide * (0.3 + Math.random() * 0.8);                  // ±0.3 ~ ±1.1
      var mat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,               // 纹理加载完成后渐显到目标透明度
        side: THREE.DoubleSide,
        depthWrite: false
      });
      var plane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), mat);
      plane.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      plane.userData.targetOpacity = self.orbitOpacity;
      plane.userData.mapReady = false;
      orbit.add(plane);

      loader.load(w.cover, function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.NearestFilter;  // 保持像素风锐利感
        mat.map = tex;
        mat.needsUpdate = true;
        plane.userData.mapReady = true;
      }, undefined, function () {
        // 图片跨域或加载失败：从轨道移除该平面
        orbit.remove(plane);
        plane.geometry.dispose();
        mat.dispose();
      });
    });

    this.orbit = orbit;
    this.scene.add(orbit);
    this.buildOrbitParticles(orbit);
  },

  /* ---------- 环绕发光粒子（加入 orbit 组，随魔方拖拽同频转动） ---------- */

  glowSprite: function () {
    // 径向渐变圆点纹理（每次新建小纹理，避免共享纹理被 clearOrbit 误释放）
    var cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    var ctx = cv.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.65)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  },

  buildOrbitParticles: function (orbit) {
    var count = 140;
    var spark = this.styleSpark || [0xffffff, 0xffd9ec, 0xaee3ff, 0xfff3b0];
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var color = new THREE.Color();
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = 3.0 + Math.random() * 1.9;              // 环带 3.0 ~ 4.9（与图片轨道重叠交错）
      var y = (Math.random() - 0.5) * 2.8;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;
      color.setHex(spark[Math.floor(Math.random() * spark.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.15,
      map: this.glowSprite(),
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.orbitParticles = new THREE.Points(geo, mat);
    orbit.add(this.orbitParticles);
  },

  /* 模板/主题切换后刷新粒子配色（无需重新加载图片纹理） */
  refreshOrbitParticles: function () {
    if (!this.orbit || !this.orbitParticles) return;
    this.orbit.remove(this.orbitParticles);
    if (this.orbitParticles.geometry) this.orbitParticles.geometry.dispose();
    if (this.orbitParticles.material) {
      if (this.orbitParticles.material.map) this.orbitParticles.material.map.dispose();
      this.orbitParticles.material.dispose();
    }
    this.orbitParticles = null;
    this.buildOrbitParticles(this.orbit);
  },

  clearOrbit: function () {
    if (!this.orbit) return;
    this.orbitParticles = null;   // 粒子作为 children 一并在下方循环中释放
    while (this.orbit.children.length) {
      var p = this.orbit.children[0];
      this.orbit.remove(p);
      if (p.geometry) p.geometry.dispose();
      if (p.material) {
        if (p.material.map) p.material.map.dispose();
        p.material.dispose();
      }
    }
    this.scene.remove(this.orbit);
    this.orbit = null;
  },

  /* 工坊设置实时调节入口：开关 / 透明度 */
  applyOrbitConfig: function () {
    if (!this.scene) return;
    var cfg = this.heroOrbitConfig();
    this.orbitOpacity = cfg.opacity;
    if (!cfg.enabled) {
      this.clearOrbit();
      return;
    }
    if (!this.orbit) {
      this.buildOrbitImages();
      return;
    }
    var self = this;
    this.orbit.children.forEach(function (p) {
      p.userData.targetOpacity = self.orbitOpacity;
      if (p.userData.mapReady) p.material.opacity = self.orbitOpacity; // 调节即时生效
    });
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
      if (c.userData.originalY == null) continue;   // 跳过发光核心与点光源
      c.position.y = c.userData.originalY + Math.sin(t + c.userData.phase) * 0.08;
      // 外立面发光呼吸脉动
      if (c.userData.glowBase != null) {
        c.material.emissiveIntensity = c.userData.glowBase + Math.sin(t * 2 + c.userData.phase) * 0.18;
      }
    }
    // 内部核心光呼吸（缝隙透光明暗起伏）
    if (this.coreMesh) {
      this.coreMesh.material.opacity = 0.73 + Math.sin(t * 1.6) * 0.12;
    }
    // 环绕图片：随魔方同频转动（拖拽/回弹同步）+ 自身公转 + 始终面向相机 + 透明度渐变
    if (this.orbit) {
      this.orbitSpin += 0.0045;
      this.orbit.rotation.y = this.group.rotation.y + this.orbitSpin;
      this.orbit.rotation.x = this.group.rotation.x;
      // 发光粒子：绕轨道差速流动 + 明暗呼吸（在 orbit 内自动随魔方拖拽同频）
      if (this.orbitParticles) {
        this.orbitParticles.rotation.y -= 0.0016;
        this.orbitParticles.material.opacity = 0.7 + Math.sin(t * 2.2) * 0.2;
        this.orbitParticles.material.size = 0.15 + Math.sin(t * 1.4) * 0.035;
      }
      this.orbit.updateMatrixWorld();
      this.tmpQuat.setFromRotationMatrix(this.orbit.matrixWorld).invert();
      var camQuat = this.camera.quaternion;
      for (var j = 0; j < this.orbit.children.length; j++) {
        var p = this.orbit.children[j];
        // 世界空间面向相机 = orbit 世界旋转的逆 × 相机朝向（抵消轨道倾斜，图片始终正对屏幕）
        p.quaternion.copy(this.tmpQuat).multiply(camQuat);
        if (p.userData.mapReady && p.material.opacity < p.userData.targetOpacity) {
          p.material.opacity = Math.min(p.userData.targetOpacity, p.material.opacity + 0.02);
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
};
