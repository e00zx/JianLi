/* ============================================
   audio.js · 柔和现代 UI 音效（Web Audio 合成）
   ============================================ */

var AudioFX = {
  ctx: null,
  enabled: true,
  volume: 0.25,

  init: function () {
    this.enabled = SiteConfig.audio.enabled;
    this.volume = SiteConfig.audio.volume;
    // 首次交互时创建 AudioContext（浏览器策略）
    var unlock = () => {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
  },

  // 柔和音调：正弦波 + 快速衰减
  tone: function (freq, dur, type, vol) {
    if (!this.enabled || !this.ctx) return;
    try {
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      var v = (vol || 1) * this.volume;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + (dur || 0.15));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + (dur || 0.15));
    } catch (e) {}
  },

  hover: function () { this.tone(660, 0.08, "sine", 0.4); },
  click: function () { this.tone(520, 0.12, "triangle", 0.6); setTimeout(() => this.tone(780, 0.1, "sine", 0.4), 0.04); },
  open: function () { this.tone(440, 0.15, "sine", 0.5); setTimeout(() => this.tone(660, 0.15, "sine", 0.5), 0.08); },
  save: function () { this.tone(587, 0.1, "sine", 0.5); setTimeout(() => this.tone(880, 0.18, "sine", 0.5), 0.09); },
  toggle: function () { this.tone(330, 0.1, "triangle", 0.5); }
};
