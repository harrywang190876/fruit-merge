(function () {
'use strict';
/* ============================================================
 * 排行榜 · 本地独立版
 * 分数与昵称全部保存在浏览器 localStorage，不依赖任何云端服务。
 * API 与原版 window.DanaiwaBoard 完全一致：
 *   open / close / refresh / onGameOver / fetchTop / submitScore
 *   myName / setName / hasName
 * ============================================================ */

const STORE_KEY = 'danaiwa.board.local.v1';
const NAME_KEY = 'danaiwa.nick.v1';
const MUTE_MIN_GAP = 3000;
const MAX_SCORE = 99999999;
const MAX_RECORDS = 20;      // 只保留最近 20 次提交

const $ = (id) => document.getElementById(id);

/* ---------- 本地数据层 ---------- */

function readAll() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function writeAll(arr) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(arr)); } catch (e) { }
}

function addScore(name, score) {
  const rec = {
    tag: 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    name: String(name || DEFAULT_NAME).slice(0, 12),
    score: Number(score) || 0,
    t: Date.now()
  };
  const arr = readAll();
  arr.push(rec);
  arr.sort((a, b) => (b.t - a.t) || (a.tag > b.tag ? 1 : -1));
  writeAll(arr.slice(0, MAX_RECORDS));
  return Promise.resolve(rec);
}

function fetchTop() {
  const arr = readAll();
  const rows = [];
  for (let i = 0; i < arr.length; i++) {
    const r = arr[i];
    if (!r) continue;
    const s = Number(r.score);
    if (!isFinite(s) || s < 0 || s > MAX_SCORE) continue;
    rows.push({ tag: r.tag, name: String(r.name || I18N.t('anonymous')).slice(0, 16), score: s, t: Number(r.t) || 0 });
  }
  /* 先取最近 20 次提交，再按分数从高到低排 */
  rows.sort((a, b) => (b.t - a.t) || (b.tag > a.tag ? 1 : -1));
  const fresh = rows.slice(0, MAX_RECORDS);
  fresh.sort((a, b) => (b.score - a.score) || (b.t - a.t));
  return Promise.resolve(fresh);
}

/* ---------- 昵称 ---------- */

function cleanName(raw) {
  let n = String(raw || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (n.length > 12) n = n.slice(0, 12);
  return n;
}
function loadName() {
  try { return cleanName(localStorage.getItem(NAME_KEY) || ''); } catch (e) { return ''; }
}
function saveName(n) {
  try { localStorage.setItem(NAME_KEY, n); } catch (e) { }
}
function myName() {
  return loadName() || I18N.t('defaultName');
}

/* ---------- UI（与原版一致，仅去网络） ---------- */

const listEl = $('boardList');
const modal = $('boardModal');
const msgEl = $('submitMsg');
const nickInput = $('nickInput');
const nameLabel = $('myNameLabel');
const submitBtn = $('submitBtn');
const submitBox = $('submitBox');
let lastSubmitAt = 0;
let submitting = false;
let pendingScore = 0;

function setMsg(text, kind) {
  if (!msgEl) return;
  msgEl.textContent = text || '';
  msgEl.className = 'submit-msg' + (kind ? ' is-' + kind : '');
}
function showRetry(show) {
  if (submitBtn) submitBtn.hidden = !show;
}
function paintName() {
  const n = myName();
  if (nameLabel) nameLabel.textContent = n;
  if (nickInput && document.activeElement !== nickInput) nickInput.value = loadName();
}
function boardMessage(text) {
  if (!listEl) return;
  listEl.textContent = '';
  const p = document.createElement('p');
  p.className = 'board-empty';
  p.textContent = text;
  listEl.appendChild(p);
}
function rankClass(i) {
  return i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
}
function renderBoard(rows, myScore) {
  if (!listEl) return;
  listEl.textContent = '';
  if (!rows.length) {
    boardMessage(I18N.t('boardEmpty'));
    return;
  }
  let marked = false;
  rows.forEach((row, i) => {
    const line = document.createElement('div');
    line.className = 'board-row ' + rankClass(i);
    const rank = document.createElement('span');
    rank.className = 'board-rank';
    rank.textContent = i < 3 ? ['🥇', '🥈', '🥉'][i] : String(i + 1);
    const name = document.createElement('span');
    name.className = 'board-name';
    name.textContent = row.name;
    const score = document.createElement('span');
    score.className = 'board-score';
    score.textContent = row.score;
    line.appendChild(rank);
    line.appendChild(name);
    line.appendChild(score);
    if (!marked && myScore != null && row.score === myScore) {
      line.classList.add('is-mine');
      marked = true;
    }
    listEl.appendChild(line);
  });
}
function refreshBoard(myScore) {
  boardMessage(I18N.t('boardLoading'));
  return fetchTop().then((rows) => {
    renderBoard(rows, myScore);
    return rows;
  });
}
function openBoard() {
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  refreshBoard(null);
}
function closeBoard() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}
function pushScore(name, score, viaRetry) {
  if (submitting) return Promise.resolve(false);
  if (!viaRetry) {
    const now = Date.now();
    if (now - lastSubmitAt < MUTE_MIN_GAP) {
      setMsg(I18N.t('submitCooldown'), 'bad');
      return Promise.resolve(false);
    }
  }
  submitting = true;
  showRetry(false);
  setMsg(I18N.t('submitting'), '');
  return addScore(name, score).then((rec) => {
    lastSubmitAt = Date.now();
    setMsg(I18N.t('submitted', { name: rec.name || name, score: rec.score || score }), 'good');
    return refreshBoard(score).then(() => true, () => true);
  }).catch(() => {
    setMsg(I18N.t('submitFailed'), 'bad');
    showRetry(true);
    return false;
  }).then((ok) => {
    submitting = false;
    return ok;
  });
}
function retry() {
  if (!pendingScore) return;
  pushScore(myName(), pendingScore, true);
}
function onGameOver(score) {
  if (!submitBox) return;
  pendingScore = Number(score) || 0;
  paintName();
  showRetry(false);
  if (!(pendingScore > 0)) {
    submitBox.style.display = 'none';
    return;
  }
  submitBox.style.display = '';
  setMsg(I18N.t('settling'), '');
  pushScore(myName(), pendingScore, true);
}
function bind() {
  const boardBtn = $('boardBtn');
  if (boardBtn) boardBtn.addEventListener('click', openBoard);
  const boardBtn2 = $('boardBtn2');
  if (boardBtn2) boardBtn2.addEventListener('click', openBoard);
  const closeBtn = $('boardClose');
  if (closeBtn) closeBtn.addEventListener('click', closeBoard);
  const refreshBtn = $('boardRefresh');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    refreshBoard(null);
  });
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBoard();
    });
  }
  if (submitBtn) submitBtn.addEventListener('click', retry);
  if (nickInput) {
    nickInput.value = loadName();
    const commit = () => {
      saveName(cleanName(nickInput.value));
      nickInput.value = loadName();
      paintName();
    };
    nickInput.addEventListener('change', commit);
    nickInput.addEventListener('blur', commit);
    nickInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); nickInput.blur(); }
    });
  }
  const editNameBtn = $('editNameBtn');
  if (editNameBtn) {
    editNameBtn.addEventListener('click', () => {
      openBoard();
      if (nickInput) setTimeout(() => { nickInput.focus(); nickInput.select(); }, 260);
    });
  }
  paintName();
  window.addEventListener('i18n:change', () => {
    paintName();
    refreshBoard(null);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBoard();
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}
window.DanaiwaBoard = {
  open: openBoard,
  close: closeBoard,
  refresh: refreshBoard,
  onGameOver: onGameOver,
  fetchTop: fetchTop,
  submitScore: addScore,
  myName: myName,
  setName: function (n) { saveName(cleanName(n)); paintName(); },
  hasName: function () { return !!loadName(); }
};
})();
