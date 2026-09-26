/* ============================================
   exporter.js · 导出单文件 HTML（纯浏览版，不含内容工坊）
   ============================================ */

var Exporter = {
  async exportHTML() {
    try {
      AudioFX.click();
      // 先保存最新配置
      Storage.save(SiteConfig);

      var html = await this.buildExportHTML();
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      downloadBlob(blob, "pixelverse-portfolio.html");
      if (window.Workshop) Workshop.toast("✓ 已导出纯浏览版单文件 HTML（不含工坊）");
    } catch (err) {
      console.error("导出失败:", err);
      alert("导出失败：" + err.message + "\n\n建议通过本地服务器打开（如 python -m http.server）后再导出。");
    }
  },

  /* 构建导出 HTML：克隆当前文档 → 剔除工坊 → 内联 CSS/JS → 注入配置 */
  async buildExportHTML() {
    // 1. 克隆运行时文档（含用户已渲染内容），从副本中剔除工坊相关节点
    var clone = document.documentElement.cloneNode(true);

    var wt = clone.querySelector("#workshop-toggle");
    if (wt) wt.remove();
    var wp = clone.querySelector("#workshop-panel");
    if (wp) wp.remove();
    // 工坊脚本与导出器脚本不进入导出产物（纯浏览版不需要）
    clone.querySelectorAll('script[src*="workshop"], script[src*="exporter"]').forEach(s => s.remove());

    // 清理工坊运行时状态：body 让位偏移 class、元素选中高亮、toast
    var body = clone.querySelector("body");
    if (body) body.classList.remove("workshop-open", "workshop-editing");
    clone.querySelectorAll(".ws-selected").forEach(el => el.classList.remove("ws-selected"));
    clone.querySelectorAll("#ws-toast").forEach(el => el.remove());

    var doctype = "<!DOCTYPE html>";
    var html = doctype + "\n" + clone.outerHTML;

    // 2. 内联本地 CSS
    var links = Array.from(clone.querySelectorAll('link[rel="stylesheet"][href]'));
    for (var link of links) {
      try {
        var css = await this.fetchText(link.href);
        html = html.replace(link.outerHTML, "<style>\n" + css + "\n</style>");
      } catch (e) { /* 保留外链（如 Google Fonts） */ }
    }

    // 3. 内联本地 JS（js/ 目录下的应用脚本；工坊/导出器已剔除）
    var scripts = Array.from(clone.querySelectorAll("script[src]"));
    for (var sc of scripts) {
      if (sc.src.indexOf("/js/") === -1) continue; // Three.js 等 CDN 保留
      if (sc.src.indexOf("workshop") > -1 || sc.src.indexOf("exporter") > -1) continue; // 双保险
      try {
        var js = await this.fetchText(sc.src);
        html = html.replace(sc.outerHTML, "<script>\n" + js + "\n</" + "script>");
      } catch (e) { /* 保留 */ }
    }

    // 4. 注入导出模式标志 + 配置数据（在 <head> 后、应用脚本前）
    var configJSON = JSON.stringify(SiteConfig);
    var inject =
      "<script>window.__EXPORT_MODE__ = true;" +
      "window.__PORTFOLIO_CONFIG__ = " + configJSON + ";" +
      "</" + "script>";
    // 插入到 </head> 之前
    html = html.replace("</head>", inject + "\n</head>");

    return html;
  },

  fetchText(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error("加载失败 " + url);
      return r.text();
    });
  }
};
