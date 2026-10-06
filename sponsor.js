(function () {
'use strict';
/* 激励作者弹窗：二维码图片为 assets/sponsor-qr.jpg（可自行替换成自己的收款码） */
const $ = (id) => document.getElementById(id);

function open() {
  const m = $('sponsorModal');
  if (!m) return;
  m.classList.add('show');
  m.setAttribute('aria-hidden', 'false');
}
function close() {
  const m = $('sponsorModal');
  if (!m) return;
  m.classList.remove('show');
  m.setAttribute('aria-hidden', 'true');
}
function bind() {
  const btn = $('sponsorBtn');
  if (btn) btn.addEventListener('click', open);
  const x = $('sponsorClose');
  if (x) x.addEventListener('click', close);
  const ok = $('sponsorOk');
  if (ok) ok.addEventListener('click', close);
  const m = $('sponsorModal');
  if (m) {
    m.addEventListener('click', (e) => {
      if (e.target === m) close();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}
window.DanaiwaSponsor = { open: open, close: close };
})();
