/* ============================================
   renderer.js · 根据配置渲染页面内容
   ============================================ */

/* ---------- 视频播放窗口（外链内嵌） ----------
   封面态 -> 点击播放钮后才创建 iframe；
   iframe 直接加载 B站/YouTube 官方播放器页——平台自带播放/暂停/
   进度条/音量/全屏等原生控件，解码/跨域/防盗链由平台处理，
   本站只负责展示这个 16:9 窗口。 */
var VideoPlayer = {
  wrap: null,
  work: null,

  destroy: function () {
    this.wrap = null;
    this.work = null;
  },

  /* 封面态：点击中央播放钮后才加载平台官方播放器窗口 */
  showPoster: function (media, w) {
    this.destroy();
    this.work = w;
    var parsed = parseVideoUrl(w.videoUrl || w.url || "");
    if (!parsed || !parsed.embed) {
      media.innerHTML = '<div class="vplayer vp-unsupported">暂不支持该视频链接，请粘贴 B站 / YouTube 链接</div>';
      this.wrap = null;
      return;
    }
    var cover = w.cover || parsed.thumb || DEFAULT_VIDEO_COVER;
    var fb = parsed.thumbFallback || DEFAULT_VIDEO_COVER;
    media.innerHTML =
      '<div class="vplayer">' +
        '<div class="vp-poster">' +
          '<img src="' + esc(cover) + '" alt="' + esc(w.title) + '" data-fb="' + esc(fb) + '" ' +
            'onerror="this.onerror=null;if(this.dataset.fb&&this.src!==this.dataset.fb)this.src=this.dataset.fb;">' +
          '<button class="vp-play-big" type="button" aria-label="播放视频"><span class="vp-triangle"></span></button>' +
        '</div>' +
      '</div>';
    this.wrap = media.querySelector(".vplayer");
    this.wrap.querySelector(".vp-play-big").addEventListener("click", () => {
      AudioFX.click();
      // 平台官方播放器窗口：autoplay 参数加载即播，播放/暂停/进度/全屏均为原生控件
      this.wrap.innerHTML =
        '<div class="vp-frame"><iframe src="' + esc(parsed.embed) +
          '" title="' + esc(w.title) + '" allowfullscreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media" ' +
          'referrerpolicy="no-referrer-when-downgrade" frameborder="0"></iframe></div>';
    });
  }
};

var Renderer = {
  modalIndex: 0,
  modalList: [],
  currentSection: "gallery",   // gallery | video | other
  keyword: "",
  collapsedSeries: {},         // 系列名 -> 是否折叠
  seriesCatFilter: {},         // 系列名 -> 当前类目('all' 或 类目名)

  /* 标准化后的作品列表 */
  works: function () {
    return normalizeWorks(SiteConfig.works_list || []);
  },

  renderAll: function () {
    this.renderEditableTexts();
    this.renderAvatars();
    this.renderWorks();
    this.renderSkills();
    this.renderTimeline();
    this.renderSocials();
    this.renderContact();
    this.renderFooter();
  },

  /* 页脚：logo 整行可编辑；版权行年份自动取当前年 */
  renderFooter: function () {
    var logo = document.querySelector(".footer-logo");
    if (logo && !logo.classList.contains("ws-editing")) {
      var v = getNestedValue(SiteConfig, "footer.logo");
      if (v != null) logo.textContent = v;
    }
    var copy = document.querySelector(".footer-copy");
    if (copy && !copy.classList.contains("ws-editing")) {
      var text = getNestedValue(SiteConfig, "footer.copy");
      copy.textContent = "© " + new Date().getFullYear() + (text ? " " + text : "");
    }
  },

  renderEditableTexts: function () {
    document.querySelectorAll("[data-editable]").forEach(el => {
      var path = el.getAttribute("data-editable");
      if (path.indexOf("footer.") === 0) return; // 页脚由 renderFooter 单独处理（版权年份自动）
      var val = getNestedValue(SiteConfig, path);
      if (val == null) return;
      var tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (tag === "IMG") el.src = val;
      else if (!el.classList.contains("ws-editing")) el.textContent = val;
    });
    var search = document.getElementById("works-search");
    if (search) search.placeholder = SiteConfig.works.searchPlaceholder || "搜索作品标题、系列、标签...";
  },

  renderAvatars: function () {
    var av = SiteConfig.about.avatar;
    var homeAv = document.getElementById("home-avatar");
    var aboutAv = document.getElementById("about-avatar");
    if (homeAv) homeAv.src = av;
    if (aboutAv) aboutAv.src = av;
  },

  /* ---------- 作品卡片 ---------- */
  cardHTML: function (w) {
    if (w.type === "video") return this.videoCardHTML(w);
    return this.imageCardHTML(w);
  },

  imageCardHTML: function (w) {
    var tags = (w.tags || []).slice(0, 3).map(t => '<span class="work-tag">' + esc(t) + '</span>').join("");
    var catBadge = (w.section === "gallery" && w.category)
      ? '<span class="cat-badge">' + esc(w.category) + '</span>' : '';
    return '<div class="work-card" data-work-id="' + esc(w.id) + '">' +
      '<div class="work-cover">' +
      (w.cover ? '<img src="' + esc(w.cover) + '" alt="' + esc(w.title) + '" loading="lazy">' : '') +
      (catBadge ? '<div style="position:absolute;top:8px;left:8px;">' + catBadge + '</div>' : '') +
      '</div>' +
      '<div class="work-body">' +
      '<h3 class="work-title">' + esc(w.title) + '</h3>' +
      '<div class="work-tags">' + tags + '</div>' +
      '</div></div>';
  },

  videoCardHTML: function (w) {
    var parsed = parseVideoUrl(w.videoUrl || w.url || "");
    var platform = parsed ? parsed.platformLabel : "视频";
    var tags = (w.tags || []).slice(0, 3).map(t => '<span class="work-tag">' + esc(t) + '</span>').join("");
    var fb = (parsed && parsed.thumbFallback) ? parsed.thumbFallback : DEFAULT_VIDEO_COVER;
    var coverImg = w.cover
      ? '<img src="' + esc(w.cover) + '" alt="' + esc(w.title) + '" loading="lazy" data-fb="' + esc(fb) + '" ' +
        'onerror="this.onerror=null;if(this.dataset.fb&&this.src!==this.dataset.fb)this.src=this.dataset.fb;">'
      : '';
    return '<div class="video-card" data-work-id="' + esc(w.id) + '">' +
      '<div class="video-cover">' +
      coverImg +
      '<span class="video-platform">' + esc(platform) + '</span>' +
      '<span class="video-play"></span>' +
      '</div>' +
      '<div class="video-info">' +
      (w.series ? '<div class="video-series">📺 ' + esc(w.series) + '</div>' : '') +
      '<h3 class="video-title">' + esc(w.title) + '</h3>' +
      (w.description ? '<p class="video-desc">' + esc(w.description) + '</p>' : '') +
      '<div class="work-tags">' + tags + '</div>' +
      '</div></div>';
  },

  /* ---------- 作品页主渲染 ---------- */
  renderWorks: function () {
    var list = this.works();

    // 首页精选（取 other 分区或全部前 6 个图片）
    var featIds = SiteConfig.home.featuredIds || [];
    var featured = list.filter(w => w.type === "image" && featIds.indexOf(w.id) !== -1);
    if (!featured.length) featured = list.filter(w => w.type === "image").slice(0, 6);
    var fGrid = document.getElementById("featured-grid");
    if (fGrid) {
      fGrid.innerHTML = featured.map(w => this.cardHTML(w)).join("");
      this.bindCardClicks(fGrid, featured); // 首页精选为独立空间
    }

    // 分区计数
    var counts = { gallery: 0, video: 0, other: 0 };
    list.forEach(w => { counts[w.section] = (counts[w.section] || 0) + 1; });
    ["gallery", "video", "other"].forEach(s => {
      var el = document.getElementById("count-" + s);
      if (el) el.textContent = counts[s];
    });

    // 搜索态：跨分区展示
    var searchView = document.getElementById("search-results-view");
    if (this.keyword) {
      if (searchView) searchView.style.display = "block";
      ["gallery", "video", "other"].forEach(s => {
        var sec = document.getElementById("section-" + s);
        if (sec) sec.style.display = "none";
      });
      var matched = list.filter(w => this.matchKeyword(w, this.keyword));
      var sGrid = document.getElementById("search-grid");
      if (sGrid) {
        sGrid.innerHTML = matched.map(w => this.cardHTML(w)).join("");
        this.bindCardClicks(sGrid, matched); // 搜索结果为独立浏览范围
      }
      var sEmpty = document.getElementById("search-empty");
      if (sEmpty) sEmpty.style.display = matched.length ? "none" : "block";
    } else {
      if (searchView) searchView.style.display = "none";
      this.showSection(this.currentSection, list);
    }
  },

  showSection: function (section, list) {
    list = list || this.works();
    this.currentSection = section;

    // 标签高亮
    document.querySelectorAll(".section-tab").forEach(t =>
      t.classList.toggle("active", t.getAttribute("data-section") === section));

    ["gallery", "video", "other"].forEach(s => {
      var sec = document.getElementById("section-" + s);
      if (sec) sec.style.display = (s === section) ? "block" : "none";
    });

    if (section === "gallery") this.renderGallery(list);
    else if (section === "video") this.renderVideo(list);
    else this.renderOther(list);
  },

  /* 图片作品：系列折叠组 + 类目筛选 */
  renderGallery: function (list) {
    var items = list.filter(w => w.section === "gallery");
    var wrap = document.getElementById("series-groups");
    var empty = document.getElementById("empty-gallery");
    if (!items.length) {
      if (wrap) wrap.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }
    if (empty) empty.style.display = "none";

    // 按系列分组（保持插入顺序）
    var seriesOrder = [];
    var groups = {};
    items.forEach(w => {
      var name = w.series || "未分类系列";
      if (!groups[name]) { groups[name] = []; seriesOrder.push(name); }
      groups[name].push(w);
    });

    wrap.innerHTML = seriesOrder.map(name => {
      var arr = groups[name];
      var collapsed = !!this.collapsedSeries[name];
      var catFilter = this.seriesCatFilter[name] || "all";
      // 该系列出现的类目
      var cats = COMIC_CATEGORIES.filter(c => arr.some(w => w.category === c));
      var catPills = ['<button class="cat-pill' + (catFilter === "all" ? " active" : "") +
        '" data-series-cat="' + esc(name) + '" data-cat="all">全部 ' + arr.length + '</button>']
        .concat(cats.map(c => {
          var n = arr.filter(w => w.category === c).length;
          return '<button class="cat-pill' + (catFilter === c ? " active" : "") +
            '" data-series-cat="' + esc(name) + '" data-cat="' + esc(c) + '">' + esc(c) + " " + n + '</button>';
        })).join("");
      var shown = catFilter === "all" ? arr : arr.filter(w => w.category === catFilter);
      return '<div class="series-group' + (collapsed ? " collapsed" : "") + '" data-series="' + esc(name) + '">' +
        '<button class="series-header" data-series-toggle="' + esc(name) + '">' +
          '<span class="series-title">📚 ' + esc(name) + '</span>' +
          '<span style="display:flex;align-items:center;gap:14px;">' +
            '<span class="series-meta">' + arr.length + ' 个资产</span>' +
            '<span class="series-arrow"></span>' +
          '</span>' +
        '</button>' +
        '<div class="series-body">' +
          '<div class="cat-filter">' + catPills + '</div>' +
          '<div class="series-grid">' + shown.map(w => this.imageCardHTML(w)).join("") + '</div>' +
        '</div>' +
      '</div>';
    }).join("");

    // 折叠事件
    wrap.querySelectorAll("[data-series-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        var name = btn.getAttribute("data-series-toggle");
        this.collapsedSeries[name] = !this.collapsedSeries[name];
        btn.closest(".series-group").classList.toggle("collapsed");
        AudioFX.hover();
      });
    });
    // 类目筛选事件
    wrap.querySelectorAll("[data-series-cat]").forEach(pill => {
      pill.addEventListener("click", () => {
        var name = pill.getAttribute("data-series-cat");
        this.seriesCatFilter[name] = pill.getAttribute("data-cat");
        AudioFX.click();
        this.renderWorks();
      });
    });
    this.bindCardClicks(wrap, items); // 图片分区为独立空间（全系列图片）
  },

  /* 视频作品：大方块网格 */
  renderVideo: function (list) {
    var items = list.filter(w => w.section === "video");
    var grid = document.getElementById("video-grid");
    var empty = document.getElementById("empty-video");
    if (grid) grid.innerHTML = items.map(w => this.videoCardHTML(w)).join("");
    if (empty) empty.style.display = items.length ? "none" : "block";
    this.bindCardClicks(grid, items); // 视频分区为独立空间
  },

  /* 其他作品：普通网格 */
  renderOther: function (list) {
    var items = list.filter(w => w.section === "other");
    var grid = document.getElementById("other-grid");
    var empty = document.getElementById("empty-other");
    if (grid) grid.innerHTML = items.map(w => this.imageCardHTML(w)).join("");
    if (empty) empty.style.display = items.length ? "none" : "block";
    this.bindCardClicks(grid, items); // 其他分区为独立空间
  },

  /* 绑定卡片点击；scopeList 为该独立空间内的浏览列表 */
  bindCardClicks: function (root, scopeList) {
    (root || document).querySelectorAll("[data-work-id]").forEach(card => {
      if (card._bound) return;
      card._bound = true;
      card.addEventListener("click", () => {
        this.openModal(card.getAttribute("data-work-id"), scopeList);
        AudioFX.click();
      });
    });
  },

  matchKeyword: function (w, kw) {
    var hay = [w.title, w.description, w.series, w.category, w.tools,
      (w.tags || []).join(" ")].join(" ").toLowerCase();
    return hay.indexOf(kw.toLowerCase()) !== -1;
  },

  setKeyword: function (kw) {
    this.keyword = (kw || "").trim();
    this.renderWorks();
  },

  switchSection: function (section) {
    this.keyword = "";
    var search = document.getElementById("works-search");
    if (search) search.value = "";
    this.showSection(section);
    AudioFX.click();
  },

  /* ---------- 关于页 ---------- */
  renderSkills: function () {
    var wrap = document.getElementById("skills-wrap");
    if (!wrap) return;
    wrap.innerHTML = (SiteConfig.about.skills || [])
      .map(s => '<span class="skill-pill">' + esc(s) + '</span>').join("");
  },

  renderTimeline: function () {
    var wrap = document.getElementById("timeline");
    if (!wrap) return;
    wrap.innerHTML = (SiteConfig.about.timeline || []).map(t =>
      '<div class="timeline-item">' +
      '<div class="timeline-date">' + esc(t.date) + '</div>' +
      '<h4 class="timeline-title">' + esc(t.title) + '</h4>' +
      '<p class="timeline-desc">' + esc(t.desc) + '</p>' +
      '</div>'
    ).join("");
  },

  /* ---------- 联系页 ---------- */
  renderSocials: function () {
    var wrap = document.getElementById("socials-wrap");
    if (!wrap) return;
    wrap.innerHTML = (SiteConfig.contact.socials || []).map(s =>
      '<a class="social-link" href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
      socialIcon(s.icon) + '<span>' + esc(s.platform) + '</span></a>'
    ).join("");
  },

  renderContact: function () {
    var email = SiteConfig.contact.email;
    var el = document.getElementById("contact-email-text");
    if (el) el.textContent = email;
  },

  /* ---------- 弹窗（每个分区/视图为独立空间，互不穿越） ---------- */
  openModal: function (workId, scopeList) {
    var list = (scopeList && scopeList.length) ? scopeList : this.works();
    this.modalList = list;
    var idx = list.findIndex(w => w.id === workId);
    if (idx === -1) idx = 0;
    this.modalIndex = idx;
    this.updateModal();
    this.updateModalNav();
    var modal = document.getElementById("work-modal");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  /* 首尾停止：到第一张/最后一张时对应箭头置灰 */
  updateModalNav: function () {
    var n = (this.modalList || []).length;
    var prev = document.getElementById("modal-prev");
    var next = document.getElementById("modal-next");
    if (prev) prev.classList.toggle("disabled", n <= 1 || this.modalIndex <= 0);
    if (next) next.classList.toggle("disabled", n <= 1 || this.modalIndex >= n - 1);
  },

  closeModal: function () {
    VideoPlayer.destroy();
    document.getElementById("work-modal").classList.remove("open");
    document.body.style.overflow = "";
    // 停止视频播放：清空 iframe
    var media = document.getElementById("modal-media");
    if (media) media.innerHTML = "";
    var body = document.querySelector(".modal-body");
    if (body) body.classList.remove("has-video");
  },

  navModal: function (dir) {
    var n = this.modalList.length;
    if (!n) return;
    var next = this.modalIndex + dir;
    if (next < 0 || next >= n) return; // 独立空间：首尾停止，不循环、不跨分区
    this.modalIndex = next;
    this.updateModal();
    this.updateModalNav();
    AudioFX.hover();
  },

  updateModal: function () {
    var w = this.modalList[this.modalIndex];
    if (!w) return;
    var modalBody = document.querySelector(".modal-body");
    var media = document.getElementById("modal-media");

    if (w.type === "video") {
      // 视频：16:9 大方框，封面态点击播放（遮罩拦截所有外链跳转）
      modalBody.classList.add("has-video");
      var parsed = parseVideoUrl(w.videoUrl || w.url || "");
      VideoPlayer.showPoster(media, w);
      document.getElementById("modal-title").textContent = w.title;
      document.getElementById("modal-meta").innerHTML =
        (parsed && parsed.embed ? '<span>📺 ' + esc(parsed.platformLabel) + '</span>' : '') +
        (w.series ? '<span>系列：' + esc(w.series) + '</span>' : '');
      document.getElementById("modal-desc").textContent = w.description || "";
      document.getElementById("modal-prompt").style.display = "none";
      document.getElementById("modal-prompt").innerHTML = "";
    } else {
      // 图片
      VideoPlayer.destroy();
      modalBody.classList.remove("has-video");
      var src = w.media || w.cover;
      media.innerHTML = src ? '<img src="' + esc(src) + '" alt="' + esc(w.title) + '">' : '';
      document.getElementById("modal-title").textContent = w.title;
      var meta = [];
      if (w.section === "gallery") {
        if (w.category) meta.push('<span>🏷 ' + esc(w.category) + '</span>');
        if (w.series) meta.push('<span>📚 ' + esc(w.series) + '</span>');
      } else {
        if (w.date) meta.push('<span>📅 ' + esc(w.date) + '</span>');
        if (w.tools) meta.push('<span>🛠 ' + esc(w.tools) + '</span>');
      }
      document.getElementById("modal-meta").innerHTML = meta.join("");
      document.getElementById("modal-desc").textContent = w.description || "";
      var promptEl = document.getElementById("modal-prompt");
      if (w.prompt && w.section !== "gallery") {
        promptEl.style.display = "block";
        promptEl.innerHTML = "<strong>Prompt</strong>" + esc(w.prompt);
      } else {
        promptEl.style.display = "none";
        promptEl.innerHTML = "";
      }
    }
    document.getElementById("modal-tags").innerHTML =
      (w.tags || []).map(t => '<span class="work-tag">' + esc(t) + '</span>').join("");
  }
};

/* HTML 转义 */
function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* 社交平台内联 SVG 图标 */
function socialIcon(name) {
  var icons = {
    weibo: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M8 12a4 4 0 0 1 8 0"></path></svg>',
    book: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"></path></svg>',
    tv: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="13" rx="1"></rect><path d="M8 22h8"></path></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"></circle></svg>',
    default: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle></svg>'
  };
  return icons[name] || icons.default;
}
