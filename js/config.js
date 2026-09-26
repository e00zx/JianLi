/* ============================================
   config.js · 默认配置数据（2026-09-26 从内容工坊同步）
   ============================================ */

// 生成 AI 图片资源 URL
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
    name: "渊绘集",
    tagline: "AI 生成艺术作品集"
  },

  theme: "misty-pink",

  particles: {
    enabled: true,
    rainCount: 100,
    starCount: 110,
    speed: 1
  },

  audio: {
    enabled: true,
    volume: 0.25
  },

  home: {
    hero: {
      title: "渊绘集",
      subtitle: "AI 漫剧 · 内容创作 · 奇幻视觉",
      /* 主页魔方环绕图：精选作品封面以半透明平面围绕魔方公转，透明度可调 */
      orbitImages: true,
      orbitOpacity: 0.8,
      /* 发光魔方风格模板：auto=跟随全站主题，其余取 HERO_CUBE_STYLES 预设 */
      style: "auto",
      ctaText: "查看作品"
    },
    /* 精选作品：8 幅独立创作中的前 6 幅 */
    featuredIds: ["w1790000356577", "w1790000477432", "w1790000565880", "w1790000872092", "w1790000926150", "w1790000958114"],
    aboutPreview: {
      intro: "一个 AIGC 创作者。不聊概念，只交付成品：完整走完剧本、人设、角色与场景资产、分镜提示词、文生图到文生视频的全链路。"
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
    name: "周潇",
    avatar: DEFAULT_AVATAR,
    bio: "AIGC 创作者，主业 AI 漫剧和内容创作。别人还在出图，我在出片：一部漫剧从 Logline 到分镜提示词，从角色立绘到视频成片，整条链路一个人跑通。正在推进的是《花葬行者》。踩过的坑比出的图多，但正因为都踩过，才知道哪条路是通的。作品只有两类——做完的，和正在做的。",
    skills: ["Midjourney", "LibTV", "ChatGPT", "即梦", "角色资产设计", "场景资产设计", "分镜提示词工程", "视频生成", "Prompt 工程"],
    timeline: [
      { date: "2026.07", title: "开始用 AI 做影像", desc: "/ 从一张图开始，慢慢走到剧本、人物、分镜，把整条链路跑通。" },
      { date: "2026.08", title: "《雾潮遗坞》立项", desc: "第一部完整推进的漫剧项目，确立阵营化叙事与探索向节奏。" },
      { date: "2026.08", title: "《良辰尽》", desc: "第一次尝试时间循环的故事。" },
      { date: "2026.09", title: "建立个人作品集", desc: "把做过的资产、分镜和成片收进来，留一个可以一直存放作品的地方。" }
    ]
  },

  contact: {
    email: "13337818187@136.com",
    wechat: "wxid_c0vo2foxb4hv22",
    socials: [
      { platform: "抖音", url: "https://www.douyin.com/user/self", icon: "book" },
      { platform: "B站", url: "https://space.bilibili.com/", icon: "tv" }
    ]
  },

  /* 页脚（logo 为整行文字；copy 为版权行中「© 年份」之后的部分，年份自动取当前年） */
  footer: {
    logo: "◆ 渊绘集",
    copy: "周潇 · AI 漫剧与内容创作"
  },

  works_list: [
  {
    "id": "w1790000356577",
    "title": "敦煌飞天与神鸟幻境",
    "description": "国潮重彩国风插画，敦煌飞天神女，头戴镶嵌珍珠的繁复鎏金宝冠，垂坠长流苏，紫蓝渐变长发，飘逸华丽飞天披帛，黑金配色传统飞天服饰，人物手持玉笛；画面左侧巨大卷曲神鸟瑞兽，兽面华丽夸张，红金蓝紫流动羽纹；大量回旋卷曲祥云纹样，鎏金勾边，珠光细闪，散落星光碎钻，背景隐现敦煌石窟与古殿，色彩浓烈丰富，红、金、紫、蓝撞色，线条繁复流畅",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000356577.jpg",
    "series": ""
  },
  {
    "id": "w1790000477432",
    "title": "花海幻境中的酸奶瓶",
    "description": "超现实写实合成广告，中心是一只由花海负空间构成的安慕希酸奶瓶剪影，瓶内是明亮花彩、鲜花、花茎、花叶、蜜蜂、远处花丘，瓶外是深粉色花田与暗部花丛，顶部光线垂直洒入瓶型轮廓，形成通透玻璃般的明暗边界，平视中心对称，花卉层次丰富，质感真实，清新高级，梦幻商业摄影，极致细节",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000477432.jpg",
    "series": ""
  },
  {
    "id": "w1790000565880",
    "title": "月下九尾狐女与荒废神社",
    "description": "哥特象征主义插画，绝色九尾狐人型女主，九条蓬松狐尾如墨色丝绸，尾尖浸染暗红血色，狐耳毛发根根分明，立于破碎古老神社鸟居之下，枯败彼岸花铺满地面，冷银满月悬于暗紫夜空，月光勾勒人物轮廓，薄纱玄色长袍绣暗金狐纹，眼神幽邃妖异，构图居中带大量负空间，细腻罩染技法，低饱和暗调配色，油画肌理，氛围感厚重，神秘诡谲，电影级光影，极致细节，艺术典藏级画面",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000565880.jpg",
    "series": ""
  },
  {
    "id": "w1790000872092",
    "title": "問山河_江湖不灭",
    "description": "国风史诗游戏宣传竖版海报，半身女性侧脸肖像，冷冽清美的面容，乌黑长发随风狂舞，发丝汇入山河背景，人物轮廓双重曝光合成，人像内部叠层：海岸悬崖、落日、礁石上执剑白衣女子剪影、远处城关、飞鸟、冰雪战场剪影，宣纸斑驳肌理，泛黄纸纹，水墨晕染，暗金尘埃颗粒，悲壮宿命感，中心构图，竖版游戏宣发海报，毛笔书法大字标题，侧边竖排古风诗文，底部英文副标题，东方武侠史诗，电影级光影，8K，超高细节，大师级海报排版",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000872092.jpg",
    "series": ""
  },
  {
    "id": "w1790000926150",
    "title": "霓虹樱花下的涩谷之梦",
    "description": "真实摄影 + 2D 矢量插画混合媒体，Subway Doodle 涂鸦潮玩，东京涩谷波普海报，高饱和霓虹，3:4 竖版。底图涩谷十字路口实拍，高楼广告牌人流。叠加矢量：巨型粉卡通兔子坐楼顶，双腿垂落，大圆眼蓝鼻尖，建筑樱花粉 + 电光蓝霓虹描边，空中漂浮樱花、爱心、星星贴纸。左上角粗体 TOKYO，小字**CHERRY BLOOM**，现实都市 + 超现实萌物，波普街头艺术",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000926150.jpg",
    "series": ""
  },
  {
    "id": "w1790000958114",
    "title": "小兔与红月的温柔明天",
    "description": "平面设计，童话卡通风，极简主义艺术，梦幻红绿撞色，一只绿色小兔子站在红色月亮上，怀里抱着装满星星的小篮子，脚下是极简几何花田和微型风车，夜空中有像剪纸一样漂浮的花瓣和音符，主体部分为拍扁挤压的 3D 凸起，丝网印刷质感，萌物、宿命感、故事感，先锋前卫艺术，柔美、优美、诗意，Octane 渲染，64K 高清画质，大师级配色，大师级排版，高细节，高级感，艺术抽象，肌理感，布局协调，极具视觉冲击力，获奖作品",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-21",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790000958114.jpg",
    "series": ""
  },
  {
    "id": "w1790056318004",
    "title": "抽象流动艺术海报",
    "description": "竖构图高级艺术概念海报，极简主义与极繁细节并存，画面主体为抽象流动的墨迹与液态色带，隐约凝聚成飞鸟振翅的形态，而非明确写实生物。整体采用雾白、深海蓝、孔雀绿、鎏金的层次色调，冷调柔光从画面左上方斜入，局部金箔反光形成耀斑，背景为细腻磨砂宣纸与半透明树脂质感叠加。画面融合莫奈式朦胧色块、梵高式短促旋转笔触、伦勃朗式暗部层次、金箔岩彩颗粒和细腻摄影质感，油画厚涂边缘与3D透明流体结构互相交织，Octane渲染，细腻笔触、细闪颗粒、反射折射、柔和渐变、动感模糊、朦胧美学，局部极繁纹理与大面积留白形成对比。画面中央偏下使用流动的毛笔手绘字体呈现“FLOW BEFORE FORM”，纤细笔画、笔画拉丝、灵动曲线、墨色浓淡变化，白色微金光感。右下角以极小极细无衬线字体呈现“2026”。底部低对比白色极细无衬线装饰文字依次排布“GhostZ” + “FLOW STATE” + “AIGC” + “Silence is the first rhythm”。整体文艺雅致、诗意、梦幻、耀变反射、肌理感强，大师级配色与排版，高细节，超高清，布局协调，无水印感，无logo感，无塑料感，无卡通渲染，无过度锐化。",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-22",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790056318004.jpg",
    "series": ""
  },
  {
    "id": "w1790056358602",
    "title": "单骑救主—赵云",
    "description": "东方赛博武侠概念海报，竖构图，电影级质感。墨青黑冷灰磨砂基底，覆霜蚀颗粒与青铜锈斑，近景失焦糊化。画面中央悬浮一骑腾跃剪影：赵云披龙鳞亮银铠、白袍残破，单骑腾空战马，右手持龙胆亮银枪斜指苍穹，左臂环抱襁褓幼主，披风、长发与马鬃化作飞散光丝。冷银月辉自左上斜切，猩红战火余烬自下缘上涌，银蓝与猩红渐变光斑穿透昏暗，枪尖高光爆闪。冷锻金属拉丝与冰裂纹釉面并存，霓虹光线条与轮廓交错角力，电子迷幻纹样与水墨飞白在拖影中交融，折射光斑在虚化里织出美丽的混乱；磨砂模糊近景，光朦却显出甲片、织纹与发丝的微妙层次。主体后方压印巨型中文标题 \"单骑救主，一枪破万\"，杂志级排版，低透明度、被主体遮断、边缘微光。右下角毛笔飞白手签 \"ZY\"。古战场肃杀与赛博霓虹躁动冲突共生，朦胧而立体的叙事感漫溢画面。\n少女、长剑、蒸汽波、深棕色调、紫色霓虹、现代城市、低分辨率、面部模糊、畸形手指、多余肢体、五官崩坏、比例失调、多余人物、乱码文字、水印、logo、边框、塑料感、过度锐化、卡通渲染、标题拼写错误、签名位于画面中央",
    "tags": [],
    "type": "image",
    "section": "other",
    "date": "2026-09-22",
    "tools": "GPT",
    "prompt": "",
    "cover": "media/images/w1790056358602.jpg",
    "series": ""
  },
  {
    "id": "w1790056401423",
    "title": "汐澜",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056401423.jpg"
  },
  {
    "id": "w1790056522919",
    "title": "琉璃",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056522919.jpg"
  },
  {
    "id": "w1790056559823",
    "title": "沧澈",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056559823.jpg"
  },
  {
    "id": "w1790056582624",
    "title": "汐澜潜水装",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056582624.jpg"
  },
  {
    "id": "w1790056604190",
    "title": "黑溟",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056604190.jpg"
  },
  {
    "id": "w1790056625307",
    "title": "雾影",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056625307.jpg"
  },
  {
    "id": "w1790056655925",
    "title": "东区猎手",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056655925.jpg"
  },
  {
    "id": "w1790056688457",
    "title": "溺亡军团",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056688457.jpg"
  },
  {
    "id": "w1790056748071",
    "title": "老巫婆",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056748071.jpg"
  },
  {
    "id": "w1790056835467",
    "title": "猎团大汉",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056835467.jpg"
  },
  {
    "id": "w1790056852822",
    "title": "胖商贩",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056852822.jpg"
  },
  {
    "id": "w1790056869976",
    "title": "机械鹦鹉",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056869976.jpg"
  },
  {
    "id": "w1790056891964",
    "title": "小孩",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "角色立绘",
    "cover": "media/images/w1790056891964.jpg"
  },
  {
    "id": "w1790056932445",
    "title": "保险箱",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790056932445.jpg"
  },
  {
    "id": "w1790056995615",
    "title": "蓝色水晶",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790056995615.jpg"
  },
  {
    "id": "w1790057020658",
    "title": "古玉佩",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790057020658.jpg"
  },
  {
    "id": "w1790057066610",
    "title": "金属碎片",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790057066610.jpg"
  },
  {
    "id": "w1790057089276",
    "title": "玉佩残片",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790057089276.jpg"
  },
  {
    "id": "w1790057111849",
    "title": "心脏",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790057111849.jpg"
  },
  {
    "id": "w1790057154527",
    "title": "拾荒艇-螺号",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "道具物件",
    "cover": "media/images/w1790057154527.jpg"
  },
  {
    "id": "w1790057266362",
    "title": "雾潮遗坞",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057266362.jpg"
  },
  {
    "id": "w1790057340898",
    "title": "海底探险",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057340898.jpg"
  },
  {
    "id": "w1790057390689",
    "title": "实验室",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057390689.jpg"
  },
  {
    "id": "w1790057511639",
    "title": "东遗迹区",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057511639.jpg"
  },
  {
    "id": "w1790057639032",
    "title": "工坊内全景",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057639032.jpg"
  },
  {
    "id": "w1790057663032",
    "title": "街道",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057663032.jpg"
  },
  {
    "id": "w1790057686183",
    "title": "琉璃炼金台",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057686183.jpg"
  },
  {
    "id": "w1790057706077",
    "title": "门口",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "雾潮遗坞",
    "category": "场景背景",
    "cover": "media/images/w1790057706077.jpg"
  },
  {
    "id": "w1790059082156",
    "title": "叶无痕",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059082156.jpg"
  },
  {
    "id": "w1790059189942",
    "title": "叶无痕全副武装",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059189942.jpg"
  },
  {
    "id": "w1790059216451",
    "title": "叶无痕婚服",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059216451.jpg"
  },
  {
    "id": "w1790059241606",
    "title": "沈青鸾婚服",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059241606.jpg"
  },
  {
    "id": "w1790059264425",
    "title": "沈青鸾素装",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059264425.jpg"
  },
  {
    "id": "w1790059289241",
    "title": "顾无颜",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059289241.jpg"
  },
  {
    "id": "w1790059343987",
    "title": "顾无颜婚服",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059343987.jpg"
  },
  {
    "id": "w1790059382143",
    "title": "刺客老大",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059382143.jpg"
  },
  {
    "id": "w1790059405950",
    "title": "刺客老大婚服",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059405950.jpg"
  },
  {
    "id": "w1790059436358",
    "title": "刺客小弟",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059436358.jpg"
  },
  {
    "id": "w1790059456536",
    "title": "店小二",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059456536.jpg"
  },
  {
    "id": "w1790059475049",
    "title": "乐队",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059475049.jpg"
  },
  {
    "id": "w1790059499040",
    "title": "丫鬟",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059499040.jpg"
  },
  {
    "id": "w1790059520080",
    "title": "贴身丫鬟",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "角色立绘",
    "cover": "media/images/w1790059520080.jpg"
  },
  {
    "id": "w1790059548782",
    "title": "青色酒壶",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "道具物件",
    "cover": "media/images/w1790059548782.jpg"
  },
  {
    "id": "w1790059628039",
    "title": "马",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "道具物件",
    "cover": "media/images/w1790059628039.jpg"
  },
  {
    "id": "w1790059654966",
    "title": "宝剑",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "道具物件",
    "cover": "media/images/w1790059654966.jpg"
  },
  {
    "id": "w1790059675101",
    "title": "宝剑婚服",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "道具物件",
    "cover": "media/images/w1790059675101.jpg"
  },
  {
    "id": "w1790059725905",
    "title": "江南酒楼",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "场景背景",
    "cover": "media/images/w1790059725905.jpg"
  },
  {
    "id": "w1790059770820",
    "title": "花轿",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "道具物件",
    "cover": "media/images/w1790059770820.jpg"
  },
  {
    "id": "w1790059806952",
    "title": "客栈",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "场景背景",
    "cover": "media/images/w1790059806952.jpg"
  },
  {
    "id": "w1790059830871",
    "title": "竹林",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "场景背景",
    "cover": "media/images/w1790059830871.jpg"
  },
  {
    "id": "w1790059861111",
    "title": "庭院",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "场景背景",
    "cover": "media/images/w1790059861111.jpg"
  },
  {
    "id": "w1790059899533",
    "title": "坟墓",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "良辰尽",
    "category": "场景背景",
    "cover": "media/images/w1790059899533.jpg"
  },
  {
    "id": "w1790146840323",
    "title": "男主",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "角色立绘",
    "cover": "media/images/w1790146840323.jpg"
  },
  {
    "id": "w1790146889731",
    "title": "男主  战损",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "角色立绘",
    "cover": "media/images/w1790146889731.jpg"
  },
  {
    "id": "w1790146915550",
    "title": "魔尊",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "角色立绘",
    "cover": "media/images/w1790146915550.jpg"
  },
  {
    "id": "w1790146934759",
    "title": "脉动产品",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "道具物件",
    "cover": "media/images/w1790146934759.jpg"
  },
  {
    "id": "w1790146971472",
    "title": "脉动 系统",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "道具物件",
    "cover": "media/images/w1790146971472.jpg"
  },
  {
    "id": "w1790146994593",
    "title": "特效",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "道具物件",
    "cover": "media/images/w1790146994593.jpg"
  },
  {
    "id": "w1790147023757",
    "title": "主场景",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "场景背景",
    "cover": "media/images/w1790147023757.jpg"
  },
  {
    "id": "w1790147060977",
    "title": "山崩",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "场景背景",
    "cover": "media/images/w1790147060977.jpg"
  },
  {
    "id": "w1790147090679",
    "title": "破碎平台",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "场景背景",
    "cover": "media/images/w1790147090679.jpg"
  },
  {
    "id": "w1790147121928",
    "title": "人物站位图",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "场景背景",
    "cover": "media/images/w1790147121928.jpg"
  },
  {
    "id": "w1790147167640",
    "title": "男主开大",
    "description": "",
    "tags": [],
    "type": "image",
    "section": "gallery",
    "series": "脉动广告",
    "category": "角色立绘",
    "cover": "media/images/w1790147167640.jpg"
  },
  {
    "id": "w1790233640242",
    "title": "雾潮遗坞",
    "description": "",
    "tags": [],
    "type": "video",
    "section": "video",
    "videoUrl": "https://www.bilibili.com/video/BV1PGaP6eEtv/?vd_source=fc24685570374827f9a904946bc54e7f",
    "series": "",
    "cover": "media/images/w1790233640242.jpg",
    "coverManual": true
  },
  {
    "id": "w1790271878488",
    "title": "良辰尽",
    "description": "",
    "tags": [],
    "type": "video",
    "section": "video",
    "videoUrl": "https://www.bilibili.com/video/BV18FaP6rE5M/?spm_id_from=333.1387.homepage.video_card.click&vd_source=fc24685570374827f9a904946bc54e7f",
    "series": "",
    "cover": "media/images/w1790271878488.jpg",
    "coverManual": true
  },
  {
    "id": "w1790272631668",
    "title": "脉动广告",
    "description": "",
    "tags": [],
    "type": "video",
    "section": "video",
    "videoUrl": "https://www.bilibili.com/video/BV1XzaK6QEjJ/?spm_id_from=333.1387.homepage.video_card.click&vd_source=fc24685570374827f9a904946bc54e7f",
    "series": "",
    "cover": "media/images/w1790272631668.jpg",
    "coverManual": true
  }
  ]
};
