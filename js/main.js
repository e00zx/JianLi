/* ============================================
   main.js · 应用入口
   ============================================ */

var SiteConfig = null;
var IS_EXPORT = window.__EXPORT_MODE__ === true;

(function () {
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    // 1. 加载配置（导出模式用注入的配置，否则读 localStorage）
    if (IS_EXPORT && window.__PORTFOLIO_CONFIG__) {
      SiteConfig = window.__PORTFOLIO_CONFIG__;
    } else {
      SiteConfig = Storage.load();
    }
    window.SiteConfig = SiteConfig;

    // 2. 应用主题
    ThemeManager.apply(SiteConfig.theme);

    // 3. 初始化音效
    AudioFX.init();
    AudioFX.enabled = SiteConfig.audio.enabled;
    AudioFX.volume = SiteConfig.audio.volume;

    // 4. 初始化粒子背景
    ParticleSystem.init();

    // 5. 初始化 3D Hero
    Hero3D.init();

    // 6. 渲染所有内容
    Renderer.renderAll();
    // 应用已保存的自定义样式
    if (window.Workshop) Workshop.applySavedStyles();

    // 7. 路由与入场动画
    Router.init();
    Reveal.init();

    // 8. 绑定 UI 交互
    bindInteractions();

    // 9. 可视化工坊（导出模式不启用）
    if (!IS_EXPORT) {
      Workshop.init();
      Workshop.updateAudioBtn();
      Workshop.recordBaseline();
    } else {
      // 导出模式隐藏工坊开关（按钮已在导出时移除，这里兜底）
      var wt = document.getElementById("workshop-toggle");
      if (wt) wt.style.display = "none";
    }

    // 10. 隐藏 Loading
    setTimeout(() => {
      var ls = document.getElementById("loading-screen");
      if (ls) ls.classList.add("hide");
    }, 600);
  }

  function bindInteractions() {
    // 弹窗：关闭 / 上一张 / 下一张
    document.querySelectorAll("[data-close-modal]").forEach(el => {
      el.addEventListener("click", () => { Renderer.closeModal(); AudioFX.toggle(); });
    });
    var prev = document.getElementById("modal-prev");
    var next = document.getElementById("modal-next");
    if (prev) prev.addEventListener("click", e => { e.stopPropagation(); Renderer.navModal(-1); });
    if (next) next.addEventListener("click", e => { e.stopPropagation(); Renderer.navModal(1); });

    // 键盘
    document.addEventListener("keydown", e => {
      var modal = document.getElementById("work-modal");
      if (modal.classList.contains("open")) {
        if (e.key === "Escape") Renderer.closeModal();
        if (e.key === "ArrowLeft") Renderer.navModal(-1);
        if (e.key === "ArrowRight") Renderer.navModal(1);
      }
    });

    // 作品搜索（跨全部分区）
    var search = document.getElementById("works-search");
    if (search) {
      search.addEventListener("input", e => Renderer.setKeyword(e.target.value));
    }

    // 作品分区标签切换
    document.querySelectorAll(".section-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        Renderer.switchSection(tab.getAttribute("data-section"));
      });
    });

    // 联系页：一键复制
    document.querySelectorAll(".contact-copy").forEach(btn => {
      btn.addEventListener("click", () => {
        var kind = btn.getAttribute("data-copy");
        var text = kind === "email" ? SiteConfig.contact.email : SiteConfig.contact.wechat;
        copyText(text).then(() => {
          var original = btn.textContent;
          btn.textContent = "✓ 已复制";
          btn.classList.add("copy-done");
          AudioFX.save();
          setTimeout(() => { btn.textContent = original; btn.classList.remove("copy-done"); }, 1800);
        });
      });
    });

    // 音效开关
    var audioBtn = document.getElementById("audio-toggle");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        SiteConfig.audio.enabled = !SiteConfig.audio.enabled;
        AudioFX.enabled = SiteConfig.audio.enabled;
        audioBtn.classList.toggle("muted", !SiteConfig.audio.enabled);
        Storage.save(SiteConfig);
        AudioFX.click();
      });
    }

    // 导航链接音效
    document.querySelectorAll(".nav-link").forEach(a => {
      a.addEventListener("click", () => AudioFX.hover());
    });

    // 导航栏滚动阴影
    window.addEventListener("scroll", () => {
      var nav = document.getElementById("navbar");
      if (nav) nav.style.boxShadow = window.scrollY > 20 ? "0 4px 0 var(--color-shadow)" : "none";
    });
  }
})();
