/* ============================================
   storage.js · 本地存储与工具函数
   ============================================ */

var STORAGE_KEY = "pixelverse_portfolio_data_v1";

/* ---------- 工具函数 ---------- */
function debounce(fn, wait) {
  var t;
  return function () {
    var args = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, args); }, wait);
  };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 深度合并：saved 覆盖 base
function deepMerge(base, saved) {
  if (!saved || typeof saved !== "object") return deepClone(base);
  var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  Object.keys(saved).forEach(function (key) {
    var bv = base ? base[key] : undefined;
    var sv = saved[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) &&
        bv && typeof bv === "object" && !Array.isArray(bv)) {
      out[key] = deepMerge(bv, sv);
    } else {
      out[key] = sv;
    }
  });
  return out;
}

// 按点路径读取对象值
function getNestedValue(obj, path) {
  return path.split(".").reduce(function (o, k) {
    return (o == null) ? undefined : o[k];
  }, obj);
}

// 按点路径写入对象值
function setNestedValue(obj, path, value) {
  var keys = path.split(".");
  var cur = obj;
  for (var i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ---------- 视频外链解析（B站 / YouTube） ---------- */
function parseVideoUrl(url) {
  if (!url) return null;
  url = String(url).trim();
  // YouTube: youtube.com/watch?v=ID / youtu.be/ID / shorts/ID
  var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) {
    var id = yt[1];
    return {
      platform: "youtube",
      platformLabel: "YouTube",
      id: id,
      embed: "https://www.youtube.com/embed/" + id + "?autoplay=1&mute=1&loop=1&playlist=" + id + "&rel=0&modestbranding=1",
      thumb: "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg",
      thumbFallback: "https://img.youtube.com/vi/" + id + "/hqdefault.jpg",
      original: url
    };
  }
  // B站: bilibili.com/video/BVxxx 或 /video/av123
  var bv = url.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  var av = url.match(/bilibili\.com\/video\/av(\d+)/i);
  if (bv) {
    return {
      platform: "bilibili",
      platformLabel: "哔哩哔哩",
      id: bv[1],
      embed: "https://player.bilibili.com/player.html?bvid=" + bv[1] + "&autoplay=1&muted=1&loop=1&high_quality=1&danmaku=0",
      thumb: "", // B站缩略图无法纯前端跨域获取，使用默认封面
      original: url
    };
  }
  if (av) {
    return {
      platform: "bilibili",
      platformLabel: "哔哩哔哩",
      id: av[1],
      embed: "https://player.bilibili.com/player.html?aid=" + av[1] + "&autoplay=1&muted=1&loop=1&high_quality=1&danmaku=0",
      thumb: "",
      original: url
    };
  }
  // 不支持的链接
  return { platform: "unknown", platformLabel: "未知链接", id: "", embed: "", thumb: "", original: url };
}

/* 通过 B站公开接口抓取视频真实封面（需联网，失败返回空串） */
async function fetchBiliCover(parsed) {
  try {
    if (!parsed || parsed.platform !== "bilibili" || !parsed.id) return "";
    var q = /^BV/i.test(parsed.id) ? "bvid=" + encodeURIComponent(parsed.id) : "aid=" + encodeURIComponent(parsed.id.replace(/\D/g, ""));
    var controller = new AbortController();
    var timer = setTimeout(() => controller.abort(), 6000);
    var res = await fetch("https://api.bilibili.com/x/web-interface/view?" + q, { signal: controller.signal });
    clearTimeout(timer);
    var json = await res.json();
    if (json && json.data && json.data.pic) {
      var pic = json.data.pic;
      if (pic.indexOf("//") === 0) pic = "https:" + pic;
      return pic;
    }
  } catch (e) { /* 跨域或网络失败时静默回退 */ }
  return "";
}

/* ---------- 作品数据标准化（旧数据兼容兜底） ---------- */
function normalizeWork(w) {
  if (!w) return w;
  // type 兜底：旧数据无 type 视为 image
  w.type = w.type === "video" ? "video" : "image";
  // section 兜底：视频→video；图片且有系列名→gallery(漫剧资产)；否则→other
  if (!w.section) {
    w.section = (w.type === "video") ? "video" : (w.series ? "gallery" : "other");
  }
  if (w.type === "video") {
    // 视频封面：显式封面 > 平台缩略图 > 默认封面
    if (!w.cover) {
      var parsed = parseVideoUrl(w.videoUrl || w.url || "");
      w.cover = (parsed && parsed.thumb) ? parsed.thumb : DEFAULT_VIDEO_COVER;
    }
  } else {
    // 图片漫剧资产类目兜底
    if (w.section === "gallery" && !w.category) w.category = COMIC_CATEGORIES[0];
    w.series = w.series || "";
  }
  w.tags = Array.isArray(w.tags) ? w.tags : [];
  return w;
}

function normalizeWorks(list) {
  return (list || []).map(normalizeWork);
}

// 复制文本到剪贴板（带降级）
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
  }
  return Promise.resolve(fallbackCopy(text));
}
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

// 文件转 base64
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) { resolve(e.target.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 压缩图片到指定最大尺寸并返回 base64
function compressImage(file, maxSize) {
  maxSize = maxSize || 1400;
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- 存储模块 ---------- */
var Storage = {
  load: function () {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        return deepMerge(DEFAULT_CONFIG, parsed);
      }
    } catch (e) {
      console.warn("加载配置失败，使用默认值:", e);
    }
    return deepClone(DEFAULT_CONFIG);
  },

  save: debounce(function (config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn("保存失败（可能存储空间不足）:", e);
      alert("保存失败：本地存储空间不足，请尝试压缩图片后重试。");
    }
  }, 400),

  reset: function () {
    localStorage.removeItem(STORAGE_KEY);
    return deepClone(DEFAULT_CONFIG);
  },

  exportJSON: function (config) {
    var blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    downloadBlob(blob, "portfolio-config.json");
  },

  importJSON: function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try { resolve(JSON.parse(e.target.result)); }
        catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};
