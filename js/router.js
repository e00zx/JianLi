/* ============================================
   router.js · Hash 路由 + 滚动入场动画
   ============================================ */

var Router = {
  current: "home",
  pages: ["home", "works", "about", "contact"],

  init: function () {
    window.addEventListener("hashchange", () => this.handle());
    this.handle();

    // 页面内 data-goto 按钮
    document.addEventListener("click", e => {
      var goto = e.target.closest("[data-goto]");
      if (goto) {
        this.navigate(goto.getAttribute("data-goto"));
        AudioFX.click();
      }
    });

    // 汉堡菜单
    var burger = document.getElementById("hamburger");
    if (burger) {
      burger.addEventListener("click", () => {
        document.getElementById("nav-links").classList.toggle("open");
        AudioFX.click();
      });
    }
  },

  handle: function () {
    var hash = (window.location.hash || "#home").slice(1);
    if (this.pages.indexOf(hash) === -1) hash = "home";
    this.show(hash);
  },

  navigate: function (pageId) {
    if (this.pages.indexOf(pageId) === -1) pageId = "home";
    window.location.hash = pageId;
    // hashchange 会触发 show；若相同则手动触发
    if (this.current === pageId) this.show(pageId);
  },

  show: function (pageId) {
    this.current = pageId;
    document.querySelectorAll("[data-page]").forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-page") === pageId);
    });
    document.querySelectorAll("[data-nav-link]").forEach(n => {
      n.classList.toggle("active", n.getAttribute("data-nav-link") === pageId);
    });
    // 关闭移动端菜单
    var nav = document.getElementById("nav-links");
    if (nav) nav.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "auto" });
    // 触发新页面入场动画
    requestAnimationFrame(() => Reveal.observe());
  }
};

/* 滚动入场观察器 */
var Reveal = {
  io: null,
  init: function () {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
      return;
    }
    this.io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          this.io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    this.observe();
  },
  observe: function () {
    if (!this.io) return;
    document.querySelectorAll(".reveal:not(.visible)").forEach(el => this.io.observe(el));
  }
};
