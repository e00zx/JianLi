/* ============================================
   theme.js · 主题切换
   ============================================ */

var THEMES = {
  "misty-pink": "雾烟粉黛",
  "cyber-neon": "赛博霓虹",
  "retro-pixel": "复古像素",
  "morandi": "莫兰迪",
  "night-stars": "暗夜星辰"
};

var ThemeManager = {
  current: "misty-pink",

  apply: function (themeId) {
    if (!THEMES[themeId]) themeId = "misty-pink";
    this.current = themeId;
    document.documentElement.setAttribute("data-theme", themeId);
    SiteConfig.theme = themeId;
    // 主题切换后同步粒子颜色与 3D 配色
    if (window.ParticleSystem && ParticleSystem.readThemeColors) ParticleSystem.readThemeColors();
    if (window.Hero3D && Hero3D.rebuild) Hero3D.rebuild();
  }
};
