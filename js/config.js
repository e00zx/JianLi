/* ============================================
   config.js · 默认配置数据
   ============================================ */

// 生成 AI 图片资源 URL（像素/体素风格示例作品）
function aiImg(prompt, size) {
  return "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(prompt) + "&image_size=" + (size || "square");
}

// 默认头像（3D 像素风格人物）
var DEFAULT_AVATAR = aiImg(
  "cute 3D voxel pixel art character avatar, Minecraft style blocky head, pastel pink and blue hair, soft misty colors, isometric render, white background",
  "square"
);

// 默认视频封面（B站等无法自动抓取缩略图时使用）
var DEFAULT_VIDEO_COVER = aiImg(
  "3D voxel pixel art video play button on dark screen, Minecraft style cubes, big play triangle icon, cinematic clapperboard, dark purple background with pink and blue glow, isometric",
  "landscape_16_9"
);

/* AI 漫剧图片资产标准类目 */
var COMIC_CATEGORIES = ["角色立绘", "场景背景", "道具物件"];

/* 主页发光魔方风格模板（palette=灯块发光色 core=核心透光色 glow=发光强度区间 spark=粒子色） */
var HERO_CUBE_STYLES = {
  auto:   { label: "跟随主题", palette: null, core: null, glow: [0.5, 0.85], spark: [0xffffff, 0xffd9ec, 0xaee3ff, 0xfff3b0] },
  cyber:  { label: "赛博霓虹", palette: [0x2a1a4a, 0x9d4edd, 0x00f5d4, 0xff2ec4, 0x4a3aff], core: 0x00f5d4, glow: [0.7, 1.15], spark: [0x00f5d4, 0xff2ec4, 0x9d4edd, 0xffffff] },
  ember:  { label: "熔金炉火", palette: [0x3a1c12, 0xff7b33, 0xffb347, 0xd94f30, 0x8c2f0f], core: 0xffb347, glow: [0.6, 1.0], spark: [0xffb347, 0xff7b33, 0xffe3a3, 0xffffff] },
  frost:  { label: "寒霜月辉", palette: [0x1c2a4a, 0x7ec8ff, 0xdbefff, 0x4a9de0, 0x9ad8ff], core: 0xffffff, glow: [0.7, 1.15], spark: [0xffffff, 0xaee3ff, 0x7ec8ff, 0xdbefff] },
  sakura: { label: "夜樱幻粉", palette: [0x4a1c38, 0xff8fc7, 0xffd6e8, 0xe05a9d, 0x7a2f56], core: 0xffd6e8, glow: [0.6, 1.0], spark: [0xffd6e8, 0xff8fc7, 0xffffff, 0xffc2e0] }
};

/* 作品分区定义 */
var WORK_SECTIONS = {
  gallery: { label: "图片作品", desc: "AI 漫剧制作资产 · 按项目系列归档" },
  video: { label: "视频作品", desc: "漫剧视频 / 动态成片 · 大方框内嵌播放" },
  other: { label: "其他作品", desc: "独立创作的单幅作品" }
};

/* 默认全局配置 */
var DEFAULT_CONFIG = {
  site: {
    name: "像素工坊",
    tagline: "AI 生成艺术作品集"
  },

  theme: "misty-pink",

  particles: {
    enabled: true,
    rainCount: 70,
    starCount: 110,
    speed: 1
  },

  audio: {
    enabled: true,
    volume: 0.25
  },

  home: {
    hero: {
      title: "像素工坊",
      subtitle: "AI 生成艺术 · 立方像素世界",
      /* 主页魔方环绕图：精选作品封面以半透明平面围绕魔方公转，透明度可调 */
      orbitImages: true,
      orbitOpacity: 0.7,
      /* 发光魔方风格模板：auto=跟随全站主题，其余取 HERO_CUBE_STYLES 预设 */
      style: "auto"
    },
    featuredIds: ["w1", "w2", "w3", "w4", "w5", "w6"],
    aboutPreview: {
      intro: "热爱用 AI 探索视觉边界的数字艺术家，在像素与光之间构建想象中的世界。"
    },
    contactPreview: {
      text: "欢迎合作交流",
      ctaText: "联系我"
    }
  },

  works: {
    searchPlaceholder: "搜索作品标题、标签..."
  },

  about: {
    name: "像素创作者",
    avatar: DEFAULT_AVATAR,
    bio: "你好，我是一名 AI 数字艺术家。我热衷于使用 Midjourney、Stable Diffusion 等工具，将脑海中的想象转化为视觉作品。3D 像素风、赛博朋克、东方美学都是我探索的方向。每一个方块，都是一个小小的世界。",
    skills: ["Midjourney", "Stable Diffusion", "DALL·E 3", "3D 像素艺术", "体素建模", "赛博朋克风", "东方美学", "视频生成", "Prompt 工程"],
    timeline: [
      { date: "2024.03", title: "初识 AI 绘画", desc: "第一次接触 Midjourney，被 AI 生成的视觉奇观震撼，开始探索。" },
      { date: "2024.09", title: "确立像素风格", desc: "迷上 3D 体素 / Minecraft 美学，形成自己独特的方块视觉语言。" },
      { date: "2025.06", title: "系列作品发布", desc: "完成首个像素世界系列，在社交平台获得大量关注与合作邀约。" },
      { date: "2026.01", title: "建立个人作品集", desc: "搭建这座可在线编辑的像素工坊，持续收录最新创作。" }
    ]
  },

  contact: {
    email: "hello@pixelverse.art",
    wechat: "pixelverse_art",
    socials: [
      { platform: "微博", url: "https://weibo.com", icon: "weibo" },
      { platform: "小红书", url: "https://xiaohongshu.com", icon: "book" },
      { platform: "B站", url: "https://bilibili.com", icon: "tv" },
      { platform: "Instagram", url: "https://instagram.com", icon: "instagram" }
    ]
  },

  /* 页脚（logo 为整行文字；copy 为版权行中「© 年份」之后的部分，年份自动取当前年） */
  footer: {
    logo: "◆ 像素工坊",
    copy: "PixelVerse · 用像素构筑想象"
  },

  works_list: [
    {
      id: "w1",
      title: "漂浮的像素花园",
      cover: aiImg("3D voxel pixel art floating island garden, Minecraft style cubes, cherry blossom trees, pastel pink and misty blue, soft clouds, isometric view, dreamy atmosphere"),
      type: "image",
      description: "一座漂浮在云海之上的体素花园，樱花方块随风飘落。尝试用柔和的雾烟粉与雾霭蓝构建治愈系场景。",
      date: "2026-01-15",
      tools: "Midjourney v6",
      prompt: "3D voxel floating island, cherry blossom garden, Minecraft cubes, pastel pink #D8C2D6 and blue #B8CDE0, isometric, soft lighting --ar 1:1",
      tags: ["风景", "治愈", "体素"]
    },
    {
      id: "w2",
      title: "赛博霓虹街巷",
      cover: aiImg("3D voxel pixel art cyberpunk city street at night, neon purple and cyan glowing blocks, Minecraft style, rainy, holographic signs, dark background, cinematic"),
      type: "image",
      description: "霓虹灯下的赛博街巷，像素方块组成的全息招牌在雨中闪烁。致敬赛博朋克美学。",
      date: "2025-12-20",
      tools: "Stable Diffusion XL",
      prompt: "voxel cyberpunk alley, neon purple #9D4EDD cyan #00F5D4, glowing cube signs, rainy night, cinematic --ar 1:1",
      tags: ["赛博朋克", "夜景", "霓虹"]
    },
    {
      id: "w3",
      title: "方块城堡黎明",
      cover: aiImg("3D voxel pixel art medieval castle at dawn, Minecraft style blocky castle, warm golden sunrise light, misty mountains, low poly cubes, epic landscape"),
      type: "image",
      description: "黎明时分的方块城堡，金色阳光穿过薄雾洒在城墙上。探索史诗感体素风景。",
      date: "2025-11-08",
      tools: "Midjourney v6",
      prompt: "voxel medieval castle, dawn golden light, misty mountains, Minecraft blocks, epic --ar 1:1",
      tags: ["建筑", "风景", "史诗"]
    },
    {
      id: "w4",
      title: "深海像素生物",
      cover: aiImg("3D voxel pixel art cute deep sea creature, glowing jellyfish made of cubes, bioluminescent blue, dark ocean, Minecraft style, magical underwater"),
      type: "image",
      description: "由发光方块组成的深海水母，在幽蓝海水中缓缓漂浮。生物荧光与体素的奇妙结合。",
      date: "2025-10-22",
      tools: "DALL·E 3",
      prompt: "voxel glowing jellyfish, bioluminescent blue cubes, deep sea, dark underwater, magical --ar 1:1",
      tags: ["生物", "海洋", "荧光"]
    },
    {
      id: "w5",
      title: "复古像素市集",
      cover: aiImg("3D voxel pixel art retro game style marketplace, colorful stalls made of cubes, nostalgic amber and green colors, Minecraft style, busy little characters, isometric"),
      type: "image",
      description: "复古游戏机色调的热闹市集，方块小摊与小人穿梭其间。怀旧感满满。",
      date: "2025-09-14",
      tools: "Midjourney v6",
      prompt: "voxel retro marketplace, amber and green retro palette, cube stalls, tiny characters, isometric --ar 1:1",
      tags: ["复古", "场景", "生活"]
    },
    {
      id: "w6",
      title: "星尘像素列车",
      cover: aiImg("3D voxel pixel art fantasy train flying through starry space, cubes, stardust trail, night stars, deep blue and white, Minecraft style, magical journey"),
      type: "image",
      description: "穿越星河的方块列车，拖着星尘尾迹驶向宇宙深处。暗夜星辰主题的灵感来源。",
      date: "2025-08-30",
      tools: "Stable Diffusion XL",
      prompt: "voxel space train, stardust trail, starry night, deep blue white cubes, magical --ar 1:1",
      tags: ["星空", "幻想", "旅程"]
    },
    {
      id: "w7",
      title: "莫兰迪静物",
      cover: aiImg("3D voxel pixel art still life, vases and plants made of soft muted cubes, Morandi color palette beige gray green, minimal calm, Minecraft style isometric"),
      type: "image",
      description: "低饱和莫兰迪色调的体素静物，方块花瓶与植物，安静而高级。",
      date: "2025-07-19",
      tools: "Midjourney v6",
      prompt: "voxel still life, Morandi muted palette, beige gray green cubes, minimal calm --ar 1:1",
      tags: ["静物", "莫兰迪", "极简"]
    },
    {
      id: "w8",
      title: "熔岩像素巨龙",
      cover: aiImg("3D voxel pixel art dragon made of lava cubes, glowing orange red, Minecraft style, epic fantasy, dark cave, embers flying, dramatic"),
      type: "image",
      description: "由熔岩方块构成的巨龙，橙红光点亮幽暗洞穴。最具冲击力的幻想作品。",
      date: "2025-06-05",
      tools: "Stable Diffusion XL",
      prompt: "voxel lava dragon, glowing orange cubes, dark cave, embers, epic fantasy --ar 1:1",
      tags: ["幻想", "生物", "熔岩"]
    }
  ]
};
