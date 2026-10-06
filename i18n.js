(function () {
'use strict';
/* ============================================================
 * 国际化：中 / 英 双语切换
 * - 静态文案：元素加 data-i18n（纯文本）或 data-i18n-html（带标签）
 * - 动态文案：window.I18N.t(key, vars)
 * - 语言持久化在 localStorage('danaiwa.lang.v1')，默认跟随浏览器语言
 * ============================================================ */

const DICT = {
  zh: {
    /* 标题 / meta */
    title: '合成大奶娃',
    metaDesc: '合成大奶娃 · 纯前端小游戏：拖动瞄准、松手投放，相同的撞在一起合成更大的一只。',
    /* 语言切换按钮（显示另一种语言） */
    langBtn: 'EN',
    langBtnTitle: '切换语言',
    /* 游戏区 */
    reviveTitle: '还能再救一下',
    reviveScoreLabel: '本局得分',
    reviveHint: '清掉警戒线以上的水果，接着玩',
    giveUpBtn: '不了，结束吧',
    reviveBtn: '🪙 用一枚复活币',
    reviveLeft: '还剩 {n} 枚',
    overTitle: '游戏结束',
    scoreLabel: '本局得分',
    bestLabel: '最高分',
    settling: '正在结算…',
    nameLabel: '昵称：',
    defaultName: '默认用户',
    editNameBtn: '改昵称',
    retrySubmit: '重试提交',
    boardBtn: '排行榜',
    playAgainBtn: '再来一局',
    sponsorBtn: '🌶️ 赏作者一包辣条嘛',
    restartHint: '按 R 键也可重新开始',
    /* 侧边面板 */
    gameTitle: '合成大奶娃',
    subtitle: '相同的撞在一起，越合越大',
    statScore: '分数',
    statBest: '最高分',
    nextLabel: '下一个',
    chainLabel: '合成表',
    chainNote: '✨ 两个大西瓜撞在一起会一起炸掉，换 <strong>500 分</strong> + <strong>一枚复活币</strong>',
    soundOn: '音效开',
    soundOff: '音效关',
    resetBtn: '重开',
    tips: '鼠标：移动瞄准、点击投放；触屏：拖动瞄准、松手投放。<br>← → 微调位置，空格投放，R 重开。<br>每 <strong>2000 分</strong>攒一枚<strong>复活币</strong>，只在本局有效。',
    /* 排行榜 */
    boardTitle: '🏆 最近高手榜',
    nickLabel: '我的昵称',
    boardNote: '只取最近 20 次提交，成绩会被后来的人挤下去',
    refreshBtn: '刷新',
    boardLoading: '正在读取排行榜…',
    boardEmpty: '最近还没有人提交，快去玩一局！',
    submitCooldown: '刚提交过啦，稍等一下',
    submitting: '正在提交…',
    submitted: '已上榜 ✓　{name} · {score} 分',
    submitFailed: '提交失败（本地存储不可用）',
    anonymous: '匿名玩家',
    /* 激励弹窗 */
    sponsorTitle: '🌶️ 请作者吃包辣条',
    sponsorNote: '这游戏完全免费，也没有任何广告。<br>要是它逗你笑了一下，赏作者一包辣条呗 🌶️',
    sponsorHint: '微信扫一扫 · 一包辣条 · 全凭心意',
    sponsorThanks: '谢谢每一位投喂的玩家 ❤️',
    sponsorEnHint: '海外玩家也可以用 PayPal 打赏 💛',
    sponsorEnBtn: '💛 用 PayPal 打赏作者',
    closeBtn: '关闭',
    /* 游戏内动态文字 */
    floatBigMerge: '两个大西瓜 💥',
    floatRevive: '+1 复活币'
  },

  en: {
    title: 'Fruit Merge',
    metaDesc: 'Fruit Merge · a pure front-end mini game: aim by dragging, drop by releasing; same fruits merge into a bigger one.',
    langBtn: '中文',
    langBtnTitle: 'Switch language',
    reviveTitle: 'One more chance',
    reviveScoreLabel: 'Score',
    reviveHint: 'Clear the fruits above the line to keep playing',
    giveUpBtn: 'No, end it',
    reviveBtn: '🪙 Use a revive coin',
    reviveLeft: '{n} left',
    overTitle: 'Game Over',
    scoreLabel: 'Score',
    bestLabel: 'Best',
    settling: 'Finalizing…',
    nameLabel: 'Name:',
    defaultName: 'Default Player',
    editNameBtn: 'Change',
    retrySubmit: 'Retry',
    boardBtn: 'Leaderboard',
    playAgainBtn: 'Play Again',
    sponsorBtn: '🌶️ Buy the author a snack',
    restartHint: 'Press R to restart too',
    gameTitle: 'Fruit Merge',
    subtitle: 'Same fruits merge into a bigger one',
    statScore: 'Score',
    statBest: 'Best',
    nextLabel: 'Next',
    chainLabel: 'Merge Chain',
    chainNote: '✨ Two big watermelons explode together: <strong>500 pts</strong> + <strong>a revive coin</strong>',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    resetBtn: 'Reset',
    tips: 'Mouse: move to aim, click to drop; Touch: drag to aim, release to drop.<br>← → fine-tune, Space to drop, R to restart.<br>Every <strong>2000 pts</strong> earns a <strong>revive coin</strong> (current game only).',
    boardTitle: '🏆 Recent Top Scores',
    nickLabel: 'My Nickname',
    boardNote: 'Only the latest 20 submissions count; newer scores push yours down',
    refreshBtn: 'Refresh',
    boardLoading: 'Loading leaderboard…',
    boardEmpty: 'No scores yet – go play a round!',
    submitCooldown: 'Just submitted – hold on a sec',
    submitting: 'Submitting…',
    submitted: 'On the board ✓　{name} · {score} pts',
    submitFailed: 'Submit failed (local storage unavailable)',
    anonymous: 'Anonymous',
    sponsorTitle: '🌶️ Buy the author a snack',
    sponsorNote: 'This game is completely free with no ads.<br>If it made you smile, treat the author to a snack 🌶️',
    sponsorHint: 'Scan to treat the author – totally optional',
    sponsorThanks: 'Thanks to everyone who feeds the author ❤️',
    sponsorEnHint: 'Outside China? Send a tip via PayPal – totally optional 💛',
    sponsorEnBtn: '💛 Tip via PayPal',
    closeBtn: 'Close',
    floatBigMerge: 'Two big watermelons! 💥',
    floatRevive: '+1 Revive Coin'
  }
};

const STORE_KEY = 'danaiwa.lang.v1';
let lang = 'zh';

function detect() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) { }
  const nav = (navigator.language || '').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
}

function t(key, vars) {
  let s = (DICT[lang] && DICT[lang][key] !== undefined) ? DICT[lang][key]
        : (DICT.zh[key] !== undefined ? DICT.zh[key] : key);
  if (vars) {
    for (const k in vars) {
      s = s.split('{' + k + '}').join(String(vars[k]));
    }
  }
  return s;
}

function applyDom() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr');   // 例：title:langBtnTitle
    const [attr, key] = spec.split(':');
    if (attr && key) el.setAttribute(attr, t(key));
  });
  document.querySelectorAll('[data-i18n-lang]').forEach((el) => {
    el.style.display = (el.getAttribute('data-i18n-lang') === lang) ? '' : 'none';
  });
  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = t('title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('metaDesc'));
  const metaApp = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (metaApp) metaApp.setAttribute('content', t('title'));
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: lang }));
}

function setLang(l) {
  if (l !== 'zh' && l !== 'en') return;
  lang = l;
  try { localStorage.setItem(STORE_KEY, l); } catch (e) { }
  applyDom();
}

function init() {
  lang = detect();
  const btn = document.getElementById('langBtn');
  if (btn) btn.addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDom);
  } else {
    applyDom();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.I18N = { t: t, setLang: setLang, getLang: () => lang, applyDom: applyDom };
})();
