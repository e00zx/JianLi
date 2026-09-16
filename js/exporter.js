/* ============================================
   exporter.js · 导出单文件 HTML
   ============================================ */

var Exporter = {
  async exportHTML() {
    try {
      AudioFX.click();
      // 先保存最新配置
      Storage.save(SiteConfig);

      // 克隆当前文档
      var doctype = "<!DOCTYPE html>";
      var html = doctype + "\n" + document.documentElement.outerHTML;

      // 1. 内联本地 CSS
      var links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));
      for (var link of links) {
        try {
          var css = await this.fetchText(link.href);
          html = html.replace(link.outerHTML, "<style>\n" + css + "\n</style>");
        } catch (e) { /* 保留外链（如 Google Fonts） */ }
      }

      // 2. 内联本地 JS（js/ 目录下的应用脚本）
      var scripts = Array.from(document.querySelectorAll("script[src]"));
      for (var sc of scripts) {
        if (sc.src.indexOf("/js/") === -1) continue; // Three.js 等 CDN 保留
        try {
          var js = await this.fetchText(sc.src);
          html = html.replace(sc.outerHTML, "<script>\n" + js + "\n</" + "script>");
        } catch (e) { /* 保留 */ }
      }

      // 3. 注入导出模式标志 + 配置数据（在 <head> 后、应用脚本前）
      var configJSON = JSON.stringify(SiteConfig);
      var inject =
        "<script>window.__EXPORT_MODE__ = true;" +
        "window.__PORTFOLIO_CONFIG__ = " + configJSON + ";" +
        "</" + "script>";
      // 插入到 </head> 之前
      html = html.replace("</head>", inject + "\n</head>");

      // 4. 移除工坊开关按钮（导出后不可编辑）
      html = html.replace(/<button class="icon-btn" id="workshop-toggle"[\s\S]*?<\/button>/, "");

      // 下载
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, "pixelverse-portfolio.html");
      if (window.Workshop) Workshop.toast("✓ 已导出单文件 HTML");
    } catch (err) {
      console.error("导出失败:", err);
      alert("导出失败：" + err.message + "\n\n建议通过本地服务器打开（如 python -m http.server）后再导出。");
    }
  },

  fetchText(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error("加载失败 " + url);
      return r.text();
    });
  }
};
