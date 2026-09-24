/* ============================================
   workshop.js · 可视化内容工坊
   左侧编辑面板 + 右侧实时预览
   ============================================ */

var Workshop = {
  panel: null,
  isOpen: false,
  activeTab: "home",
  selectedEl: null,
  editingWorkId: null,

  init: function () {
    if (!window.WORKSHOP_ENABLED) return;
    this.buildPanel();
    this.bindGlobal();
    this.switchTab("home");
  },

  /* ---------- 构建面板 ---------- */
  buildPanel: function () {
    var panel = document.createElement("aside");
    panel.id = "workshop-panel";
    panel.innerHTML =
      '<div class="ws-header">' +
        '<h2>🛠 内容工坊</h2>' +
        '<button class="ws-close" id="ws-close" title="关闭">×</button>' +
      '</div>' +
      '<div class="ws-tabs">' +
        '<button class="ws-tab" data-tab="home">首页</button>' +
        '<button class="ws-tab" data-tab="works">作品</button>' +
        '<button class="ws-tab" data-tab="about">关于</button>' +
        '<button class="ws-tab" data-tab="contact">联系</button>' +
        '<button class="ws-tab" data-tab="settings">设置</button>' +
      '</div>' +
      '<div class="ws-toolbar">' +
        '<div class="ws-toolbar-row">' +
          '<button class="ws-btn" id="ws-undo" title="撤销 (Ctrl+Z)">↶ 撤销</button>' +
          '<button class="ws-btn" id="ws-redo" title="重做 (Ctrl+Y)">↷ 重做</button>' +
        '</div>' +
        '<div class="ws-toolbar-row">' +
          '<button class="ws-btn accent" id="ws-export">⬇ 导出HTML</button>' +
          '<button class="ws-btn" id="ws-save">💾 保存</button>' +
        '</div>' +
        '<div class="ws-toolbar-row">' +
          '<button class="ws-btn" id="ws-export-json">导出配置</button>' +
          '<button class="ws-btn" id="ws-import-json">导入配置</button>' +
          '<button class="ws-btn danger" id="ws-reset">恢复默认</button>' +
        '</div>' +
        '<input type="file" id="ws-import-file" accept="application/json" style="display:none">' +
      '</div>' +
      '<div class="ws-inspector" id="ws-inspector"></div>';
    document.body.appendChild(panel);
    this.panel = panel;
  },

  bindGlobal: function () {
    var self = this;

    document.getElementById("workshop-toggle").addEventListener("click", () => this.toggle());
    document.getElementById("ws-close").addEventListener("click", () => this.close());

    // 标签切换
    this.panel.querySelectorAll(".ws-tab").forEach(tab => {
      tab.addEventListener("click", () => this.switchTab(tab.getAttribute("data-tab")));
    });

    // 工具栏按钮
    document.getElementById("ws-undo").addEventListener("click", () => this.undo());
    document.getElementById("ws-redo").addEventListener("click", () => this.redo());
    document.getElementById("ws-export").addEventListener("click", () => { AudioFX.click(); Exporter.exportHTML(); });
    document.getElementById("ws-save").addEventListener("click", () => this.manualSave());

    // 撤销/重做快捷键（输入框内不拦截，保留原生文本撤销）
    document.addEventListener("keydown", e => {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      var k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); this.undo(); }
      else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); this.redo(); }
    });
    document.getElementById("ws-reset").addEventListener("click", () => this.resetAll());
    document.getElementById("ws-export-json").addEventListener("click", () => { AudioFX.click(); Storage.exportJSON(SiteConfig); });
    document.getElementById("ws-import-json").addEventListener("click", () => document.getElementById("ws-import-file").click());
    document.getElementById("ws-import-file").addEventListener("change", e => this.importConfig(e));

    // 预览区点击选中可编辑元素
    document.addEventListener("click", e => {
      if (!this.isOpen) return;
      // 点击的是面板内部则不处理
      if (e.target.closest("#workshop-panel")) return;
      var el = e.target.closest("[data-editable]");
      // 可编辑按钮（如首页「联系我」）：单击放行跳转，双击才进入文字编辑
      if (el && el.hasAttribute("data-goto")) return;
      if (el) {
        e.preventDefault();
        e.stopPropagation();
        this.selectElement(el);
      }
    }, true);

    // 双击可编辑按钮进入编辑（区别于单击跳转）
    document.addEventListener("dblclick", e => {
      if (!this.isOpen) return;
      if (e.target.closest("#workshop-panel")) return;
      var el = e.target.closest("[data-editable][data-goto]");
      if (el) this.selectElement(el);
    }, true);

    // ESC 关闭面板
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && this.isOpen) this.close();
    });
  },

  toggle: function () {
    this.isOpen ? this.close() : this.open();
  },

  open: function () {
    if (!window.WORKSHOP_ENABLED) return;
    this.isOpen = true;
    this.panel.classList.add("open");
    document.body.classList.add("workshop-open", "workshop-editing");
    AudioFX.open();
  },

  close: function () {
    this.isOpen = false;
    this.panel.classList.remove("open");
    document.body.classList.remove("workshop-open", "workshop-editing");
    this.clearSelection();
    AudioFX.toggle();
  },

  clearSelection: function () {
    if (this.selectedEl) this.selectedEl.classList.remove("ws-selected");
    this.selectedEl = null;
  },

  switchTab: function (tab) {
    this.activeTab = tab;
    this.clearSelection();
    this.panel.querySelectorAll(".ws-tab").forEach(t =>
      t.classList.toggle("active", t.getAttribute("data-tab") === tab));
    this.renderInspector();
    AudioFX.hover();
  },

  /* ---------- 选中元素 ---------- */
  selectElement: function (el) {
    this.clearSelection();
    this.selectedEl = el;
    el.classList.add("ws-selected");
    var path = el.getAttribute("data-editable");
    this.renderElementEditor(path, el);
    AudioFX.click();
  },

  /* ---------- 检查器渲染 ---------- */
  renderInspector: function () {
    var ins = document.getElementById("ws-inspector");
    var html = "";
    switch (this.activeTab) {
      case "home": html = this.homeForm(); break;
      case "works": html = this.worksForm(); break;
      case "about": html = this.aboutForm(); break;
      case "contact": html = this.contactForm(); break;
      case "settings": html = this.settingsForm(); break;
    }
    ins.innerHTML = '<p class="ws-hint">💡 也可以直接点击右侧预览区的文字/图片进行快速编辑</p>' + html;
    this.bindInspectorEvents();
  },

  homeForm: function () {
    var c = SiteConfig;
    return this.sectionTitle("首页 Hero") +
      this.textField("home.hero.title", "主标题", c.home.hero.title) +
      this.textField("home.hero.subtitle", "副标题", c.home.hero.subtitle) +
      this.sectionTitle("首页区块") +
      this.textArea("home.aboutPreview.intro", "关于简介", c.home.aboutPreview.intro) +
      this.textField("home.contactPreview.text", "联系横幅标题", c.home.contactPreview.text) +
      this.textField("home.contactPreview.ctaText", "联系按钮文字", c.home.contactPreview.ctaText);
  },

  aboutForm: function () {
    var c = SiteConfig;
    return this.sectionTitle("头像") +
      this.imageField("about.avatar", c.about.avatar) +
      this.sectionTitle("个人信息") +
      this.textField("about.name", "名字", c.about.name) +
      this.textArea("about.bio", "个人简介", c.about.bio) +
      this.sectionTitle("技能（用逗号分隔）") +
      this.textArea("about.skillsText", "", (c.about.skills || []).join(", "), true) +
      this.sectionTitle("创作历程（每行：日期|标题|描述）") +
      this.timelineField();
  },

  contactForm: function () {
    var c = SiteConfig;
    var socials = (c.contact.socials || []).map((s, i) =>
      '<div class="ws-social-row">' +
        this.textField("social.platform." + i, "平台 " + (i + 1), s.platform, true) +
        this.textField("social.url." + i, "链接 " + (i + 1), s.url, true) +
        '<button class="ws-btn danger" data-social-del="' + i + '" style="flex:0 0 auto;align-self:flex-end;margin-bottom:4px;">删除</button>' +
      '</div>'
    ).join("");
    return this.sectionTitle("联系方式（联系页可一键复制）") +
      this.textField("contact.email", "邮箱", c.contact.email) +
      this.textField("contact.wechat", "微信号", c.contact.wechat) +
      this.sectionTitle("社交链接（最多 4 个）") +
      socials +
      '<button class="ws-add-btn" id="ws-add-social">+ 添加社交链接</button>';
  },

  settingsForm: function () {
    var c = SiteConfig;
    var themeOpts = Object.keys(THEMES).map(id =>
      '<option value="' + id + '"' + (id === c.theme ? " selected" : "") + '">' + THEMES[id] + '</option>'
    ).join("");
    return this.sectionTitle("页脚（最下方页角文字）") +
      this.textField("footer.logo", "左下文字", (c.footer && c.footer.logo) || "") +
      this.textField("footer.copy", "右下版权文字（© 年份自动）", (c.footer && c.footer.copy) || "") +
      this.sectionTitle("外观主题") +
      '<div class="ws-control"><label>选择主题（共 5 套）</label><select id="set-theme">' + themeOpts + '</select></div>' +
      this.sectionTitle("粒子动效") +
      '<label class="ws-check"><input type="checkbox" id="set-particles-on"' + (c.particles.enabled ? " checked" : "") + '> 启用像素粒子雨 + 星空</label>' +
      this.rangeField("set-rain", "粒子雨数量", c.particles.rainCount, 10, 200, 10) +
      this.rangeField("set-star", "星空数量", c.particles.starCount, 20, 300, 10) +
      this.rangeField("set-speed", "下落速度", c.particles.speed, 0.2, 3, 0.1) +
      this.sectionTitle("主页魔方环绕图") +
      '<label class="ws-check"><input type="checkbox" id="set-orbit-on"' + (c.home.hero.orbitImages !== false ? " checked" : "") + '> 精选作品图片环绕魔方旋转</label>' +
      this.rangeField("set-orbit-opacity", "环绕图片透明度",
        (c.home.hero.orbitOpacity != null && !isNaN(c.home.hero.orbitOpacity)) ? c.home.hero.orbitOpacity : 0.55, 0.05, 1, 0.05) +
      this.sectionTitle("发光魔方风格") +
      '<div class="ws-control"><label>风格模板</label><select id="set-hero-style">' +
        Object.keys(HERO_CUBE_STYLES).map(id =>
          '<option value="' + id + '"' + ((c.home.hero.style || "auto") === id ? " selected" : "") + '>' + HERO_CUBE_STYLES[id].label + '</option>'
        ).join("") +
      '</select></div>' +
      '<p style="font-size:0.75rem;color:var(--color-text);margin:4px 0 10px;">切换后魔方灯块配色、核心透光色与环绕发光粒子同步换装</p>' +
      this.sectionTitle("音效") +
      '<label class="ws-check"><input type="checkbox" id="set-audio-on"' + (c.audio.enabled ? " checked" : "") + '> 启用交互音效</label>' +
      this.rangeField("set-volume", "音量", c.audio.volume, 0, 1, 0.05);
  },

  worksForm: function () {
    var list = normalizeWorks(SiteConfig.works_list || []);
    var groups = [
      { key: "gallery", label: "图片作品（漫剧资产）", icon: "🖼" },
      { key: "video", label: "视频作品（外链）", icon: "🎬" },
      { key: "other", label: "其他作品", icon: "◆" }
    ];
    var html = '<div class="ws-add-row">' +
      '<button class="ws-btn accent" id="ws-add-gallery" style="flex:1;">+ 添加图片资产</button>' +
      '<button class="ws-btn accent" id="ws-add-video" style="flex:1;">+ 添加视频</button>' +
      '</div>' +
      '<div class="ws-add-row">' +
      '<button class="ws-btn accent" id="ws-add-other" style="flex:1;">+ 添加其他作品</button>' +
      '</div>';
    groups.forEach(g => {
      var arr = list.filter(w => w.section === g.key);
      html += '<div class="ws-section-title">' + g.icon + ' ' + g.label + '（' + arr.length + '）</div>';
      if (!arr.length) {
        html += '<p style="font-size:0.8rem;color:var(--color-text);padding:4px 0 10px;">暂无内容</p>';
      } else {
        html += '<div class="ws-work-list">' + arr.map(w =>
          '<div class="ws-work-item" data-work-edit="' + esc(w.id) + '">' +
          (w.cover ? '<img src="' + esc(w.cover) + '" alt="">' :
            '<div style="width:40px;height:40px;background:var(--color-primary);display:flex;align-items:center;justify-content:center;">' +
            (w.type === "video" ? "▶" : "🖼") + '</div>') +
          '<span>' + esc(w.title) + (w.series ? ' <small style="opacity:.7;">· ' + esc(w.series) + '</small>' : '') + '</span>' +
          '<button class="ws-btn danger" data-work-del="' + esc(w.id) + '" style="flex:0;padding:6px 10px;">删</button>' +
          '</div>'
        ).join("") + '</div>';
      }
    });
    return html + '<div id="ws-work-editor"></div>';
  },

  /* 图片资产编辑器（漫剧：名称/系列/类目/标签） */
  galleryEditor: function (w) {
    w = w || null;
    var existingSeries = Array.from(new Set(
      normalizeWorks(SiteConfig.works_list || []).filter(x => x.series).map(x => x.series)
    ));
    var v = w || { title: "", series: "", category: COMIC_CATEGORIES[0], description: "", tags: [], cover: "" };
    var catOpts = COMIC_CATEGORIES.map(c =>
      '<option value="' + esc(c) + '"' + (v.category === c ? " selected" : "") + '>' + esc(c) + '</option>').join("");
    return '<div class="ws-section-title">' + (w ? "编辑图片资产" : "添加图片资产") + '</div>' +
      '<div class="ws-form-group">' +
        this.imageField("work.cover", v.cover) +
        this.textField("work.title", "资产名称", v.title, true) +
        '<div class="ws-control"><label>所属项目系列</label>' +
        '<input type="text" list="series-list" data-edit-path="work.series" data-edit-type="text" placeholder="如：像素江湖 第一集" value="' + esc(v.series) + '">' +
        '<datalist id="series-list">' + existingSeries.map(s => '<option value="' + esc(s) + '">').join("") + '</datalist></div>' +
        '<div class="ws-control" style="margin-top:10px;"><label>资产类目</label><select id="work-category">' + catOpts + '</select></div>' +
        this.textArea("work.description", "资产说明（可选）", v.description, true) +
        this.textField("work.tagsText", "标签（逗号分隔）", (v.tags || []).join(", "), true) +
        '<button class="ws-btn accent" id="ws-save-work" data-work-kind="gallery" style="width:100%;margin-top:8px;">' + (w ? "✓ 保存" : "✓ 添加资产") + '</button>' +
        '<button class="ws-btn" id="ws-cancel-work" style="width:100%;margin-top:8px;">取消</button>' +
      '</div>';
  },

  /* 视频编辑器（外链播放 B站/YouTube + 可自行添加封面） */
  videoEditor: function (w) {
    var v = w || { title: "", series: "", description: "", tags: [], videoUrl: "", cover: "" };
    return '<div class="ws-section-title">' + (w ? "编辑视频" : "添加视频") + '</div>' +
      '<div class="ws-form-group">' +
        '<label>视频链接（仅支持 B站 / YouTube）</label>' +
        '<input type="text" id="work-video-url" placeholder="粘贴 bilibili.com 或 youtube.com 视频链接" value="' + esc(v.videoUrl || "") + '" style="width:100%;padding:9px 11px;background:var(--color-bg);border:2px solid var(--color-border);font-weight:700;margin-bottom:6px;">' +
        '<p id="video-parse-hint" style="font-size:0.78rem;font-weight:700;margin-bottom:10px;color:var(--color-text);">粘贴链接后自动识别平台并生成内嵌播放器</p>' +
        this.textField("work.title", "视频标题", v.title, true) +
        this.textField("work.series", "所属系列（可选）", v.series, true) +
        this.textArea("work.description", "视频简介", v.description, true) +
        this.imageField("work.cover", v.cover, "视频封面（可自行上传图片或填写图片链接；留空则自动获取）") +
        this.textField("work.tagsText", "标签（逗号分隔）", (v.tags || []).join(", "), true) +
        '<p style="font-size:0.75rem;color:var(--color-text);margin:6px 0 10px;">未自定义封面时自动获取：YouTube 高清缩略图 / B站真实封面（需联网，失败用默认封面）</p>' +
        '<button class="ws-btn accent" id="ws-save-work" data-work-kind="video" style="width:100%;margin-top:8px;">' + (w ? "✓ 保存" : "✓ 添加视频") + '</button>' +
        '<button class="ws-btn" id="ws-cancel-work" style="width:100%;margin-top:8px;">取消</button>' +
      '</div>';
  },

  /* 其他作品编辑器（独立单幅） */
  otherEditor: function (w) {
    var v = w || { title: "", description: "", date: new Date().toISOString().slice(0, 10), tools: "", prompt: "", tags: [], cover: "" };
    return '<div class="ws-section-title">' + (w ? "编辑其他作品" : "添加作品") + '</div>' +
      '<div class="ws-form-group">' +
        this.imageField("work.cover", v.cover) +
        this.textField("work.title", "作品标题", v.title, true) +
        this.textArea("work.description", "作品描述", v.description, true) +
        this.textField("work.date", "日期", v.date, true) +
        this.textField("work.tools", "使用工具", v.tools, true) +
        this.textArea("work.prompt", "Prompt（可选）", v.prompt, true) +
        this.textField("work.tagsText", "标签（逗号分隔）", (v.tags || []).join(", "), true) +
        '<button class="ws-btn accent" id="ws-save-work" data-work-kind="other" style="width:100%;margin-top:8px;">' + (w ? "✓ 保存" : "✓ 添加作品") + '</button>' +
        '<button class="ws-btn" id="ws-cancel-work" style="width:100%;margin-top:8px;">取消</button>' +
      '</div>';
  },

  /* ---------- 表单控件生成 ---------- */
  sectionTitle: t => '<div class="ws-section-title">' + t + '</div>',

  textField: function (path, label, val, raw) {
    return '<div class="ws-form-group"><label>' + esc(label) + '</label>' +
      '<input type="text" data-edit-path="' + path + '" data-edit-type="text" value="' + esc(val == null ? "" : val) + '">' +
      '</div>';
  },

  textArea: function (path, label, val, raw) {
    return '<div class="ws-form-group"><label>' + esc(label) + '</label>' +
      '<textarea data-edit-path="' + path + '" data-edit-type="textarea">' + esc(val == null ? "" : val) + '</textarea>' +
      '</div>';
  },

  rangeField: function (id, label, val, min, max, step) {
    return '<div class="ws-control" style="margin-bottom:10px;"><label>' + esc(label) + ': <span id="' + id + '-val">' + val + '</span></label>' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></div>';
  },

  imageField: function (path, val, title) {
    var isExternal = val && val.indexOf("data:") !== 0;
    return '<div class="ws-form-group"><label>' + esc(title || "图片（点击上传，或使用链接）") + '</label>' +
      '<label class="ws-file-label">📁 选择图片文件<input type="file" accept="image/*" data-edit-type="imgfile" data-edit-path="' + path + '"></label>' +
      '<input type="text" data-edit-path="' + path + '" data-edit-type="imgsrc" placeholder="或粘贴图片 URL..." value="' + esc(isExternal ? val : "") + '">' +
      (val ? '<img class="ws-preview-thumb" src="' + esc(val) + '" alt="预览">' : '') +
      '</div>';
  },

  timelineField: function () {
    var lines = (SiteConfig.about.timeline || []).map(t => t.date + "|" + t.title + "|" + t.desc).join("\n");
    return '<div class="ws-form-group"><textarea data-edit-type="timeline" rows="5">' + esc(lines) + '</textarea></div>';
  },

  /* ---------- 元素快速编辑器（点击预览区） ---------- */
  renderElementEditor: function (path, el) {
    var ins = document.getElementById("ws-inspector");
    var val = getNestedValue(SiteConfig, path);
    var tag = el.tagName;
    var html = '<div class="ws-section-title">正在编辑：' + esc(path) + '</div>';

    if (tag === "IMG" || path.indexOf("avatar") !== -1 || path.indexOf("cover") !== -1) {
      html += '<div class="ws-form-group">' + this.imageField(path, val) + '</div>';
      // 图片样式调整
      html += this.imgStyleControls(path);
    } else {
      html += '<div class="ws-form-group"><label>文本内容</label>' +
        '<textarea data-edit-path="' + path + '" data-edit-type="textarea" rows="3">' + esc(val || "") + '</textarea></div>';
      html += this.textStyleControls(path, el);
    }
    ins.innerHTML = html;
    this.bindInspectorEvents();
  },

  textStyleControls: function (path, el) {
    var cs = getComputedStyle(el);
    var color = rgbToHex(cs.color) || "#2C2C3A";
    return '<div class="ws-section-title">文字美化</div>' +
      '<div class="ws-control-grid">' +
      '<div class="ws-control"><label>字体</label><select data-style-path="' + path + '" data-style="fontFamily">' +
        '<option value="">默认</option>' +
        '<option value="\'Noto Sans SC\', sans-serif">思源黑体</option>' +
        '<option value="\'Noto Serif SC\', serif">思源宋体</option>' +
        '<option value="\'Press Start 2P\', monospace">像素字体</option>' +
        '<option value="\'ZCOOL KuaiLe\', cursive">站酷快乐体</option>' +
      '</select></div>' +
      '<div class="ws-control"><label>颜色</label><input type="color" data-style-path="' + path + '" data-style="color" value="' + color + '"></div>' +
      '<div class="ws-control"><label>字号</label><input type="range" data-style-path="' + path + '" data-style="fontSize" min="12" max="72" step="1" value="' + parseInt(cs.fontSize) + '"></div>' +
      '<div class="ws-control"><label>字重</label><select data-style-path="' + path + '" data-style="fontWeight">' +
        '<option value="400">常规</option><option value="700">粗体</option><option value="900">特粗</option></select></div>' +
      '</div>';
  },

  imgStyleControls: function (path) {
    return '<div class="ws-section-title">图片美化</div>' +
      '<div class="ws-control-grid">' +
      '<div class="ws-control"><label>透明度</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="opacity" min="0" max="1" step="0.05" value="1"></div>' +
      '<div class="ws-control"><label>圆角(px)</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="radius" min="0" max="60" step="1" value="0"></div>' +
      '<div class="ws-control"><label>亮度</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="brightness" min="0.3" max="2" step="0.1" value="1"></div>' +
      '<div class="ws-control"><label>对比度</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="contrast" min="0.3" max="2" step="0.1" value="1"></div>' +
      '<div class="ws-control"><label>饱和度</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="saturate" min="0" max="2" step="0.1" value="1"></div>' +
      '<div class="ws-control"><label>模糊(px)</label><input type="range" data-img-style-path="' + path + '" data-imgstyle="blur" min="0" max="10" step="0.5" value="0"></div>' +
      '</div>';
  },

  /* ---------- 绑定检查器事件 ---------- */
  bindInspectorEvents: function () {
    var ins = document.getElementById("ws-inspector");
    if (!ins) return;

    // 文本/文本域修改
    ins.querySelectorAll("[data-edit-path]").forEach(input => {
      input.addEventListener("input", () => this.handleEdit(input));
      input.addEventListener("change", () => this.handleEdit(input));
    });

    // 图片文件上传（作品编辑器内的封面由其保存按钮统一处理，此处跳过 work.* 路径）
    ins.querySelectorAll("[data-edit-type='imgfile']").forEach(file => {
      file.addEventListener("change", async e => {
        var f = e.target.files[0];
        if (!f) return;
        var path = file.getAttribute("data-edit-path");
        if (path && path.indexOf("work.") === 0) return;
        var base64 = await compressImage(f, 1400);
        setNestedValue(SiteConfig, path, base64);
        this.commit();
      });
    });

    // 文字样式
    ins.querySelectorAll("[data-style-path]").forEach(ctrl => {
      ctrl.addEventListener("input", () => {
        var path = ctrl.getAttribute("data-style-path");
        var prop = ctrl.getAttribute("data-style");
        var el = document.querySelector('[data-editable="' + path + '"]');
        if (!el) return;
        var v = ctrl.value;
        if (prop === "fontSize") v += "px";
        el.style[prop] = v;
        this.saveStyle(path, prop, v);
      });
    });

    // 图片样式
    ins.querySelectorAll("[data-img-style-path]").forEach(ctrl => {
      ctrl.addEventListener("input", () => {
        var path = ctrl.getAttribute("data-img-style-path");
        var prop = ctrl.getAttribute("data-imgstyle");
        var el = document.querySelector('[data-editable="' + path + '"]');
        if (!el) return;
        var v = parseFloat(ctrl.value);
        this.applyImgStyle(el, prop, v);
        this.saveImgStyle(path, prop, v);
      });
    });

    // 时间线
    var tl = ins.querySelector("[data-edit-type='timeline']");
    if (tl) tl.addEventListener("input", () => {
      var lines = tl.value.split("\n").filter(l => l.trim());
      SiteConfig.about.timeline = lines.map(l => {
        var parts = l.split("|");
        return { date: (parts[0] || "").trim(), title: (parts[1] || "").trim(), desc: (parts[2] || "").trim() };
      });
      this.commit(false);
      Renderer.renderTimeline();
    });

    // 技能
    var skills = ins.querySelector('[data-edit-path="about.skillsText"]');
    if (skills) skills.addEventListener("input", () => {
      SiteConfig.about.skills = skills.value.split(/[,，]/).map(s => s.trim()).filter(Boolean);
      this.commit(false);
      Renderer.renderSkills();
    });

    // 作品：选择编辑（按类型选择对应编辑器）
    ins.querySelectorAll("[data-work-edit]").forEach(item => {
      item.addEventListener("click", e => {
        if (e.target.closest("[data-work-del]")) return;
        var id = item.getAttribute("data-work-edit");
        var w = normalizeWork(SiteConfig.works_list.find(x => x.id === id));
        var editor = document.getElementById("ws-work-editor");
        if (w.type === "video") editor.innerHTML = this.videoEditor(w);
        else if (w.section === "gallery") editor.innerHTML = this.galleryEditor(w);
        else editor.innerHTML = this.otherEditor(w);
        this.editingWorkId = w.id;
        this.bindWorkEditor(w);
      });
    });
    // 作品：删除
    ins.querySelectorAll("[data-work-del]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        var id = btn.getAttribute("data-work-del");
        if (!confirm("确定删除这个作品？")) return;
        SiteConfig.works_list = SiteConfig.works_list.filter(x => x.id !== id);
        this.commit(true, true);
      });
    });
    // 作品：添加图片资产
    var addG = document.getElementById("ws-add-gallery");
    if (addG) addG.addEventListener("click", () => {
      this.editingWorkId = "w" + Date.now();
      document.getElementById("ws-work-editor").innerHTML = this.galleryEditor(null);
      this.bindWorkEditor(null);
    });
    // 作品：添加视频
    var addV = document.getElementById("ws-add-video");
    if (addV) addV.addEventListener("click", () => {
      this.editingWorkId = "w" + Date.now();
      document.getElementById("ws-work-editor").innerHTML = this.videoEditor(null);
      this.bindWorkEditor(null);
    });
    // 作品：添加其他作品
    var addO = document.getElementById("ws-add-other");
    if (addO) addO.addEventListener("click", () => {
      this.editingWorkId = "w" + Date.now();
      document.getElementById("ws-work-editor").innerHTML = this.otherEditor(null);
      this.bindWorkEditor(null);
    });

    // 社交：添加
    var addS = document.getElementById("ws-add-social");
    if (addS) addS.addEventListener("click", () => {
      SiteConfig.contact.socials.push({ platform: "新平台", url: "https://", icon: "default" });
      this.commit(true, true);
      this.switchTab("contact");
    });
    // 社交：删除单项
    ins.querySelectorAll("[data-social-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        var idx = parseInt(btn.getAttribute("data-social-del"));
        if (!confirm("确定删除这个社交链接？")) return;
        SiteConfig.contact.socials.splice(idx, 1);
        this.commit(true, true);
        this.switchTab("contact");
      });
    });
    // 社交字段
    ins.querySelectorAll("[data-edit-path^='social.']").forEach(input => {
      input.addEventListener("input", () => {
        var parts = input.getAttribute("data-edit-path").split(".");
        var field = parts[1], idx = parseInt(parts[2]);
        if (SiteConfig.contact.socials[idx]) {
          SiteConfig.contact.socials[idx][field] = input.value;
          this.commit(false);
          Renderer.renderSocials();
        }
      });
    });

    // 设置
    var themeSel = document.getElementById("set-theme");
    if (themeSel) themeSel.addEventListener("change", () => { ThemeManager.apply(themeSel.value); this.commit(false); });
    var pOn = document.getElementById("set-particles-on");
    if (pOn) pOn.addEventListener("change", () => {
      SiteConfig.particles.enabled = pOn.checked;
      ParticleSystem.applyConfig(SiteConfig.particles);
      this.commit(false);
    });
    [["set-rain","rainCount"],["set-star","starCount"],["set-speed","speed"]].forEach(([id, key]) => {
      var r = document.getElementById(id);
      if (r) r.addEventListener("input", () => {
        SiteConfig.particles[key] = parseFloat(r.value);
        var lab = document.getElementById(id + "-val"); if (lab) lab.textContent = r.value;
        ParticleSystem.applyConfig(SiteConfig.particles);
        this.commit(false);
      });
    });
    var aOn = document.getElementById("set-audio-on");
    if (aOn) aOn.addEventListener("change", () => {
      SiteConfig.audio.enabled = aOn.checked;
      AudioFX.enabled = aOn.checked;
      this.updateAudioBtn();
      this.commit(false);
    });
    var vol = document.getElementById("set-volume");
    if (vol) vol.addEventListener("input", () => {
      SiteConfig.audio.volume = parseFloat(vol.value);
      AudioFX.volume = parseFloat(vol.value);
      var lab = document.getElementById("set-volume-val"); if (lab) lab.textContent = vol.value;
      this.commit(false);
    });
    // 主页魔方环绕图
    var oOn = document.getElementById("set-orbit-on");
    if (oOn) oOn.addEventListener("change", () => {
      if (!SiteConfig.home.hero) SiteConfig.home.hero = {};
      SiteConfig.home.hero.orbitImages = oOn.checked;
      if (window.Hero3D) Hero3D.applyOrbitConfig();
      this.commit(false);
    });
    var oOp = document.getElementById("set-orbit-opacity");
    if (oOp) oOp.addEventListener("input", () => {
      if (!SiteConfig.home.hero) SiteConfig.home.hero = {};
      SiteConfig.home.hero.orbitOpacity = parseFloat(oOp.value);
      var oLab = document.getElementById("set-orbit-opacity-val"); if (oLab) oLab.textContent = oOp.value;
      if (window.Hero3D) Hero3D.applyOrbitConfig();
      this.commit(false);
    });
    // 发光魔方风格模板
    var hStyle = document.getElementById("set-hero-style");
    if (hStyle) hStyle.addEventListener("change", () => {
      if (!SiteConfig.home.hero) SiteConfig.home.hero = {};
      SiteConfig.home.hero.style = hStyle.value;
      if (window.Hero3D) Hero3D.rebuild();   // 重建灯块/核心/粒子配色
      this.commit(false);
    });
  },

  bindWorkEditor: function (existing) {
    var root = document.getElementById("ws-work-editor");
    var saveBtn = document.getElementById("ws-save-work");
    var cancelBtn = document.getElementById("ws-cancel-work");
    if (cancelBtn) cancelBtn.addEventListener("click", () => { root.innerHTML = ""; });

    // 视频链接实时解析提示
    var urlInput = document.getElementById("work-video-url");
    if (urlInput) {
      var hint = document.getElementById("video-parse-hint");
      var updateHint = () => {
        var parsed = parseVideoUrl(urlInput.value);
        if (!urlInput.value.trim()) { hint.textContent = "粘贴链接后自动识别平台并生成内嵌播放器"; hint.style.color = "var(--color-text)"; }
        else if (parsed && parsed.platform === "unknown" || !parsed.embed) { hint.textContent = "⚠ 未识别该链接，请粘贴 B站 或 YouTube 视频链接"; hint.style.color = "#E76F51"; }
        else { hint.textContent = "✓ 已识别：" + parsed.platformLabel + "（将大方框内嵌播放，自动播放/静音/循环）"; hint.style.color = "#2A9D8F"; }
      };
      urlInput.addEventListener("input", updateHint);
      updateHint();
    }

    if (!saveBtn) return;
    var kind = saveBtn.getAttribute("data-work-kind");
    saveBtn.addEventListener("click", () => {
      var val = (path, type) => {
        var sel = '[data-edit-path="' + path + '"]' + (type ? '[data-edit-type="' + type + '"]' : '');
        var e = root.querySelector(sel);
        return e ? e.value : "";
      };
      var base = {
        id: this.editingWorkId,
        title: val("work.title", "text") || "未命名",
        description: val("work.description", "textarea"),
        tags: val("work.tagsText", "text").split(/[,，]/).map(s => s.trim()).filter(Boolean)
      };
      var data;

      if (kind === "video") {
        // 视频：外链播放；封面可自行上传/填链接，留空则自动获取
        var url = urlInput ? urlInput.value.trim() : "";
        var parsed = parseVideoUrl(url);
        if (!parsed || !parsed.embed) { alert("请粘贴有效的 B站 或 YouTube 视频链接"); return; }

        // 封面判定：文件 > 用户填写的 URL > 自动封面（缩略图/默认）
        var coverFile = root.querySelector('[data-edit-type="imgfile"][data-edit-path="work.cover"]');
        var hasFile = !!(coverFile && coverFile.files && coverFile.files[0]);
        var coverInput = val("work.cover", "imgsrc");            // 输入框值（base64 封面时为空）
        var prevCover = existing ? (existing.cover || "") : "";
        var prevInputVal = (prevCover && prevCover.indexOf("data:") !== 0) ? prevCover : "";
        var prevManual = existing ? !!existing.coverManual : false;
        // 是否为用户自定义封面：新增时看是否填了；编辑时未改动沿用旧标记，改动看新值
        var manual = hasFile ? true
          : (!existing ? !!coverInput
            : (coverInput === prevInputVal ? prevManual : !!coverInput));
        var autoCover = parsed.thumb || DEFAULT_VIDEO_COVER;
        var finalCover = hasFile ? autoCover // 文件异步压缩后替换
          : (!existing ? (coverInput || autoCover)
            : (coverInput === prevInputVal ? (prevCover || autoCover) : (coverInput || autoCover)));

        data = Object.assign(base, {
          type: "video",
          section: "video",
          videoUrl: url,
          series: val("work.series", "text"),
          cover: finalCover,
          coverManual: manual
        });

        var saveVideo = () => {
          this.upsertWork(data);
          // 仅在用户未自定义封面时，B站才异步抓取真实封面（不覆盖用户封面）
          if (!data.coverManual && parsed.platform === "bilibili") {
            fetchBiliCover(parsed).then(pic => {
              if (!pic) return;
              var saved = SiteConfig.works_list.find(x => x.id === data.id);
              if (saved && !saved.coverManual) { saved.cover = pic; Storage.save(SiteConfig); Renderer.renderWorks(); }
            });
          }
        };
        if (hasFile) {
          compressImage(coverFile.files[0], 1400).then(b64 => { data.cover = b64; data.coverManual = true; saveVideo(); });
        } else {
          saveVideo();
        }
        return;
      }

      if (kind === "gallery") {
        // 图片资产（漫剧）
        var catEl = root.querySelector("#work-category");
        var coverUrl = val("work.cover", "imgsrc");
        data = Object.assign(base, {
          type: "image",
          section: "gallery",
          series: val("work.series", "text"),
          category: catEl ? catEl.value : COMIC_CATEGORIES[0],
          cover: coverUrl || (existing ? existing.cover : "")
        });
      } else {
        // 其他作品
        data = Object.assign(base, {
          type: "image",
          section: "other",
          date: val("work.date", "text"),
          tools: val("work.tools", "text"),
          prompt: val("work.prompt", "textarea"),
          cover: val("work.cover", "imgsrc") || (existing ? existing.cover : "")
        });
      }

      // 封面文件上传处理（图片类）
      var coverFile = root.querySelector('[data-edit-type="imgfile"][data-edit-path="work.cover"]');
      if (coverFile && coverFile.files && coverFile.files[0]) {
        compressImage(coverFile.files[0], 1400).then(b64 => {
          data.cover = b64;
          this.upsertWork(data);
        });
      } else {
        this.upsertWork(data);
      }
    });
  },

  /* 新增或更新作品并刷新 */
  upsertWork: function (data) {
    data = normalizeWork(data);
    var idx = SiteConfig.works_list.findIndex(x => x.id === data.id);
    if (idx === -1) SiteConfig.works_list.push(data);
    else SiteConfig.works_list[idx] = data;
    document.getElementById("ws-work-editor").innerHTML = "";
    this.commit(true, true);
    this.switchTab("works");
    AudioFX.save();
  },

  /* 处理普通字段编辑 */
  handleEdit: function (input) {
    var path = input.getAttribute("data-edit-path");
    var type = input.getAttribute("data-edit-type");
    if (!path) return;
    // 跳过作品编辑器内部字段（由 workEditor 单独处理）
    if (path.indexOf("work.") === 0) return;
    var val = input.value;
    if (type === "imgsrc") {
      setNestedValue(SiteConfig, path, val);
      this.commit();
      // 更新预览缩略图
      var thumb = input.parentElement.querySelector(".ws-preview-thumb");
      if (thumb) thumb.src = val;
      return;
    }
    setNestedValue(SiteConfig, path, val);
    this.commit();
  },

  /* 应用图片样式到预览 */
  applyImgStyle: function (el, prop, v) {
    if (prop === "opacity") el.style.opacity = v;
    else if (prop === "radius") el.style.borderRadius = v + "px";
    else el.style.filter = (el.style.filter || "").replace(/[a-z-]+\([^)]*\)/g, "").trim() +
      " brightness(1) contrast(1) saturate(1) blur(0px)";
    if (prop !== "opacity" && prop !== "radius") {
      var filters = {};
      el.parentElement.querySelectorAll("[data-imgstyle]").forEach(c => {
        filters[c.getAttribute("data-imgstyle")] = parseFloat(c.value);
      });
      el.style.filter = "brightness(" + (filters.brightness||1) + ") contrast(" + (filters.contrast||1) +
        ") saturate(" + (filters.saturate||1) + ") blur(" + (filters.blur||0) + "px)";
    }
  },

  /* 样式持久化（存到 SiteConfig._styles） */
  saveStyle: function (path, prop, val) {
    SiteConfig._styles = SiteConfig._styles || {};
    SiteConfig._styles[path] = SiteConfig._styles[path] || {};
    SiteConfig._styles[path][prop] = val;
    this.commit(false);
  },
  saveImgStyle: function (path, prop, val) {
    SiteConfig._imgStyles = SiteConfig._imgStyles || {};
    SiteConfig._imgStyles[path] = SiteConfig._imgStyles[path] || {};
    SiteConfig._imgStyles[path][prop] = val;
    this.commit(false);
  },

  /* 应用已保存的样式（加载时） */
  applySavedStyles: function () {
    if (SiteConfig._styles) {
      Object.keys(SiteConfig._styles).forEach(path => {
        var el = document.querySelector('[data-editable="' + path + '"]');
        if (el) Object.assign(el.style, SiteConfig._styles[path]);
      });
    }
    if (SiteConfig._imgStyles) {
      Object.keys(SiteConfig._imgStyles).forEach(path => {
        var el = document.querySelector('[data-editable="' + path + '"]');
        if (el) {
          var s = SiteConfig._imgStyles[path];
          if (s.opacity != null) el.style.opacity = s.opacity;
          if (s.radius != null) el.style.borderRadius = s.radius + "px";
          el.style.filter = "brightness(" + (s.brightness||1) + ") contrast(" + (s.contrast||1) +
            ") saturate(" + (s.saturate||1) + ") blur(" + (s.blur||0) + "px)";
        }
      });
    }
  },

  /* 提交：重新渲染 + 保存 + 记录历史；forceRecord=true 强制作为新的一步 */
  commit: function (rerender, forceRecord) {
    if (rerender !== false) Renderer.renderAll();
    Storage.save(SiteConfig);
    this.record(forceRecord);
  },

  /* ---------- 撤销 / 重做历史栈 ---------- */
  hist: [],
  histIdx: -1,
  _lastRecord: 0,
  HIST_MAX: 30,

  /* 记录快照；force=true 时强制作为新的一步（结构性操作） */
  record: function (force) {
    var snap;
    try { snap = JSON.stringify(SiteConfig); } catch (e) { return; }
    var now = Date.now();
    if (!force && this.hist.length && this.histIdx === this.hist.length - 1 &&
        now - this._lastRecord < 1000) {
      // 连续编辑（如打字）合并为同一步
      this.hist[this.histIdx] = snap;
    } else {
      // 丢弃 redo 分支
      this.hist = this.hist.slice(0, this.histIdx + 1);
      this.hist.push(snap);
      if (this.hist.length > this.HIST_MAX) this.hist.shift();
      this.histIdx = this.hist.length - 1;
    }
    this._lastRecord = now;
    this.updateHistBtns();
  },

  /* 初始基线（加载完成后调用一次） */
  recordBaseline: function () {
    this.hist = [];
    this.histIdx = -1;
    try { this.hist.push(JSON.stringify(SiteConfig)); this.histIdx = 0; } catch (e) {}
    this._lastRecord = Date.now();
    this.updateHistBtns();
  },

  undo: function () {
    if (this.histIdx <= 0) return;
    this.histIdx--;
    this.restoreHist();
    AudioFX.hover();
  },

  redo: function () {
    if (this.histIdx >= this.hist.length - 1) return;
    this.histIdx++;
    this.restoreHist();
    AudioFX.hover();
  },

  restoreHist: function () {
    try {
      SiteConfig = JSON.parse(this.hist[this.histIdx]);
      Storage.save(SiteConfig);
      Renderer.renderAll();
      if (this.isOpen) this.renderInspector();
      this._lastRecord = 0; // 恢复后的下次编辑强制新步
      this.updateHistBtns();
    } catch (e) {}
  },

  updateHistBtns: function () {
    var u = document.getElementById("ws-undo");
    var r = document.getElementById("ws-redo");
    if (u) { u.disabled = this.histIdx <= 0; u.classList.toggle("ws-btn-disabled", this.histIdx <= 0); }
    if (r) { r.disabled = this.histIdx >= this.hist.length - 1; r.classList.toggle("ws-btn-disabled", this.histIdx >= this.hist.length - 1); }
  },

  manualSave: function () {
    Storage.save(SiteConfig);
    AudioFX.save();
    this.toast("✓ 已保存到本地");
  },

  resetAll: function () {
    if (!confirm("确定恢复所有内容为默认值？此操作不可撤销。")) return;
    SiteConfig = Storage.reset();
    localStorage.removeItem(STORAGE_KEY + "_styles");
    location.reload();
  },

  importConfig: async function (e) {
    var file = e.target.files[0];
    if (!file) return;
    try {
      var data = await Storage.importJSON(file);
      SiteConfig = deepMerge(DEFAULT_CONFIG, data);
      Storage.save(SiteConfig);
      this.toast("✓ 配置已导入");
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      alert("导入失败：配置文件格式错误");
    }
  },

  updateAudioBtn: function () {
    var btn = document.getElementById("audio-toggle");
    if (btn) btn.classList.toggle("muted", !SiteConfig.audio.enabled);
  },

  toast: function (msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:400;padding:14px 26px;background:var(--color-primary);border:3px solid var(--color-title);box-shadow:5px 5px 0 var(--color-shadow);font-weight:900;color:var(--color-title);";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }
};

/* rgb 转 hex */
function rgbToHex(rgb) {
  var m = rgb && rgb.match(/\d+/g);
  if (!m || m.length < 3) return null;
  return "#" + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
}
