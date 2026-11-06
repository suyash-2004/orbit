(() => {
'use strict';

/* ================= Helpers ================= */
const VERSION = '1.0';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const mkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const daysIn = d => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sum = (arr, type) => arr.reduce((s, t) => s + (t.type === type ? t.amount : 0), 0);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = MONTHS.map(m => m.slice(0, 3));
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const svg = (d, w = 1.9) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  chevL: svg('<path d="m15 18-6-6 6-6"/>', 2.2),
  chevR: svg('<path d="m9 18 6-6-6-6"/>', 2.2),
  chevD: svg('<path d="m6 9 6 6 6-6"/>', 2.2),
  gear: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  trash: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>'),
  cal: svg('<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>', 2.2),
  back: svg('<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m17 9-6 6M11 9l6 6"/>', 1.8),
  rotate: svg('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>'),
  share: svg('<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
  mark: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="5.4" fill="#fff"/><ellipse cx="12" cy="12" rx="10.6" ry="3.6" stroke="#fff" stroke-width="1.6" transform="rotate(-22 12 12)" opacity=".85"/></svg>'
};

/* ================= Data ================= */
const CATS = [
  { id: 'food', name: 'Food', emoji: '🍜', color: '#FF8A5B', type: 'expense' },
  { id: 'groceries', name: 'Groceries', emoji: '🥑', color: '#7BD88F', type: 'expense' },
  { id: 'transport', name: 'Transport', emoji: '🚕', color: '#FFD166', type: 'expense' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#FF6FB5', type: 'expense' },
  { id: 'bills', name: 'Bills', emoji: '💡', color: '#6FC3FF', type: 'expense' },
  { id: 'rent', name: 'Rent', emoji: '🏠', color: '#A78BFA', type: 'expense' },
  { id: 'fun', name: 'Fun', emoji: '🎬', color: '#F472B6', type: 'expense' },
  { id: 'health', name: 'Health', emoji: '💊', color: '#34D399', type: 'expense' },
  { id: 'travel', name: 'Travel', emoji: '✈️', color: '#38BDF8', type: 'expense' },
  { id: 'subs', name: 'Subscriptions', emoji: '📺', color: '#C084FC', type: 'expense' },
  { id: 'edu', name: 'Learning', emoji: '📚', color: '#FBBF24', type: 'expense' },
  { id: 'gifts', name: 'Gifts', emoji: '🎁', color: '#FB7185', type: 'expense' },
  { id: 'other', name: 'Other', emoji: '✨', color: '#94A3B8', type: 'expense' },
  { id: 'salary', name: 'Salary', emoji: '💼', color: '#4BE3B0', type: 'income' },
  { id: 'freelance', name: 'Freelance', emoji: '💻', color: '#5EEAD4', type: 'income' },
  { id: 'invest', name: 'Investments', emoji: '📈', color: '#86EFAC', type: 'income' },
  { id: 'refund', name: 'Refunds', emoji: '↩️', color: '#93C5FD', type: 'income' },
  { id: 'giftin', name: 'Gifts', emoji: '🎉', color: '#FDE68A', type: 'income' },
  { id: 'otherin', name: 'Other', emoji: '💰', color: '#A7F3D0', type: 'income' }
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
const cat = id => CAT[id] || CAT.other;
const ACCOUNTS = [
  { id: 'upi', name: 'UPI', emoji: '📱' },
  { id: 'card', name: 'Card', emoji: '💳' },
  { id: 'cash', name: 'Cash', emoji: '💵' },
  { id: 'bank', name: 'Bank', emoji: '🏦' }
];
const acc = id => ACCOUNTS.find(a => a.id === id) || ACCOUNTS[0];
const CURRENCIES = [
  { code: 'INR', label: 'Indian rupee', loc: 'en-IN' },
  { code: 'USD', label: 'US dollar', loc: 'en-US' },
  { code: 'EUR', label: 'Euro', loc: 'en-IE' },
  { code: 'GBP', label: 'British pound', loc: 'en-GB' },
  { code: 'AED', label: 'UAE dirham', loc: 'en-AE' },
  { code: 'SGD', label: 'Singapore dollar', loc: 'en-SG' },
  { code: 'AUD', label: 'Australian dollar', loc: 'en-AU' },
  { code: 'CAD', label: 'Canadian dollar', loc: 'en-CA' },
  { code: 'JPY', label: 'Japanese yen', loc: 'ja-JP' }
];

/* ================= Storage ================= */
const KEY = 'orbit.v1';
let memCopy = null;
function fresh() {
  return { v: 1, onboarded: false, name: '', currency: 'INR', haptics: true, tilt: true,
    budget: { total: 0, cats: {} }, lastAcc: 'upi', lastCat: {}, hideInstall: false, tx: [] };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* storage blocked */ }
  return memCopy;
}
function persist() {
  memCopy = state;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
}
function normalize(s) {
  const st = Object.assign(fresh(), s || {});
  if (!Array.isArray(st.tx)) st.tx = [];
  st.tx = st.tx.filter(t => t && t.date && isFinite(t.amount)).map(t => ({
    id: t.id || uid(), type: t.type === 'income' ? 'income' : 'expense', amount: Number(t.amount),
    cat: t.cat || 'other', acc: t.acc || 'upi', note: t.note || '', date: String(t.date).slice(0, 10), ts: t.ts || Date.now()
  }));
  if (!st.budget || typeof st.budget !== 'object') st.budget = { total: 0, cats: {} };
  if (!st.budget.cats) st.budget.cats = {};
  if (!st.lastCat) st.lastCat = {};
  return st;
}
let state = normalize(load());

/* ================= Formatting ================= */
const fmtCache = new Map();
const curInfo = () => CURRENCIES.find(c => c.code === state.currency) || CURRENCIES[0];
function nf(opts) {
  const k = state.currency + JSON.stringify(opts);
  let f = fmtCache.get(k);
  if (!f) {
    try { f = new Intl.NumberFormat(curInfo().loc, Object.assign({ style: 'currency', currency: state.currency }, opts)); }
    catch (e) { f = new Intl.NumberFormat('en-US', Object.assign({ style: 'currency', currency: 'USD' }, opts)); }
    fmtCache.set(k, f);
  }
  return f;
}
function money(n, o = {}) {
  let dec = o.dec;
  if (dec == null) dec = Math.abs(n - Math.round(n)) > 0.004 ? 2 : 0;
  if (state.currency === 'JPY') dec = 0;
  return nf({ minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n).replace('-', '−');
}
const short = n => nf({ notation: 'compact', maximumFractionDigits: 1 }).format(n);
function curSymbol() {
  try { return nf({ maximumFractionDigits: 0 }).formatToParts(0).find(p => p.type === 'currency').value; }
  catch (e) { return state.currency; }
}
const signed = t => (t.type === 'income' ? '+' : '−') + money(t.amount);
function dayLabel(s) {
  const d = parseYmd(s), now = new Date(), yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (s === ymd(now)) return 'Today';
  if (s === ymd(yest)) return 'Yesterday';
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? ' ' + d.getFullYear() : ''}`;
}
function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function darken(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round(((n >> 16) & 255) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`;
}

/* ================= Queries ================= */
const ui = {
  view: 'home', month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  filter: 'all', q: '', fcat: null, prev: {}, barSel: null, daySel: null, calSel: null, donutSel: null,
  firstPaint: true, seenMonth: mkey(new Date())
};
const isCurrentMonth = m => mkey(m) === mkey(new Date());
const monthTx = (m = ui.month) => { const k = mkey(m); return state.tx.filter(t => t.date.slice(0, 7) === k); };
const sortTx = arr => arr.slice().sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
function groupCats(arr, type) {
  const m = {};
  arr.forEach(t => {
    if (t.type !== type) return;
    if (!m[t.cat]) m[t.cat] = { id: t.cat, amount: 0, count: 0 };
    m[t.cat].amount += t.amount; m[t.cat].count++;
  });
  return Object.values(m).sort((a, b) => b.amount - a.amount);
}
const lastCat = type => (state.lastCat && state.lastCat[type]) || (type === 'expense' ? 'food' : 'salary');
const daysElapsed = m => isCurrentMonth(m) ? new Date().getDate() : daysIn(m);

/* ================= Haptics ================= */
// iOS 18+ gives a light tap when a "switch" checkbox toggles. Other phones use vibrate().
const hapticEl = (() => {
  const l = document.createElement('label');
  l.setAttribute('aria-hidden', 'true');
  l.style.cssText = 'position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
  const i = document.createElement('input');
  i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1;
  l.appendChild(i); document.body.appendChild(l);
  return l;
})();
function haptic(kind) {
  if (!state.haptics) return;
  try {
    if (navigator.vibrate) { navigator.vibrate(kind === 'heavy' ? [10, 30, 14] : 8); return; }
    hapticEl.click();
  } catch (e) { /* not supported */ }
}

/* ================= Count-up numbers ================= */
function countUp(node, key, to, o = {}) {
  if (!node) return;
  const from = ui.prev[key] != null ? ui.prev[key] : (o.from != null ? o.from : 0);
  ui.prev[key] = to;
  const dec = Math.abs(to - Math.round(to)) > 0.004 ? 2 : 0;
  const f = o.fmt || (v => money(dec ? v : Math.round(v), { dec }));
  if (reduced || from === to) { node.textContent = f(to); return; }
  const dur = o.dur || 1000, t0 = performance.now() + (o.delay || 0);
  node.textContent = f(from);
  const step = now => {
    if (!node.isConnected) return;
    const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
    node.textContent = f(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ================= Rendering ================= */
const views = { home: renderHome, activity: renderActivity, insights: renderInsights, budgets: renderBudgets };
function render(name = ui.view, anim = true) {
  const v = $('#v-' + name);
  v.classList.toggle('calm', !anim);
  views[name](v, anim);
}
const refresh = () => render(ui.view, false);

function monthSw() {
  return `<div class="month-sw">
    <button data-m="-1" aria-label="Previous month">${I.chevL}</button>
    <span class="month-label">${MONTHS[ui.month.getMonth()]} ${ui.month.getFullYear()}</span>
    <button data-m="1" aria-label="Next month" ${isCurrentMonth(ui.month) || ui.month > new Date() ? 'disabled' : ''}>${I.chevR}</button>
  </div>`;
}
function avatar() {
  const n = state.name.trim();
  return `<button class="avatar" data-act="settings" aria-label="Settings">${n ? esc(Array.from(n)[0].toUpperCase()) : I.gear}</button>`;
}
function emptyState(title, text, btn) {
  return `<div class="empty"><div class="empty-orbit"><div class="ring"></div><div class="planet"></div></div>
    <b>${title}</b><p>${text}</p>${btn ? `<button class="btn primary" data-act="add">${btn}</button>` : ''}</div>`;
}
function txRow(t, i, sub) {
  const c = cat(t.cat);
  const small = sub === 'acc' ? esc(t.note || acc(t.acc).name) : esc(t.note || dayLabel(t.date));
  return `<div class="tx flip" data-id="${t.id}" style="--i:${Math.min(i, 14)}">
    <div class="tx-del">${I.trash}<span>Delete</span></div>
    <div class="tx-main" role="button" tabindex="0" aria-label="Edit ${esc(c.name)} ${esc(money(t.amount))}">
      <span class="tx-ico" style="--c:${c.color}">${c.emoji}</span>
      <div class="tx-txt"><b>${esc(c.name)}</b><small>${small}</small></div>
      <div class="tx-amt ${t.type}">${signed(t)}<small>${sub === 'acc' ? '' : esc(acc(t.acc).name)}</small></div>
    </div></div>`;
}

/* ---------- Home ---------- */
let homeData = null;
function renderHome(v, anim) {
  const m = ui.month, mt = monthTx(m);
  const inc = sum(mt, 'income'), exp = sum(mt, 'expense');
  const bal = sum(state.tx, 'income') - sum(state.tx, 'expense');
  const intro = ui.firstPaint && anim && !reduced;
  if (anim) ui.firstPaint = false;
  if (intro) { ui.prev.bal = 0; ui.prev.cin = 0; ui.prev.cout = 0; }

  const byCat = groupCats(mt, 'expense');
  const top = byCat[0];
  const avg = exp / daysElapsed(m);
  const saveRate = inc > 0 ? Math.round((inc - exp) / inc * 100) : null;
  const dim = daysIn(m), daily = Array(dim).fill(0);
  mt.forEach(t => { if (t.type === 'expense') daily[+t.date.slice(8) - 1] += t.amount; });
  const dmax = Math.max(...daily, 1);
  const todayD = isCurrentMonth(m) ? new Date().getDate() : 0;
  homeData = { daily, avg, m };

  const balStr = money(bal);
  const cw = Math.min(v.clientWidth || 390, 560) - 40 - 46;
  const fs = clamp(Math.floor(cw / (balStr.length * 0.76)), 22, 42);
  const B = state.budget.total;
  const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const name = state.name.trim();

  let budgetHtml = '';
  if (B > 0) {
    const pct = exp / B, left = B - exp;
    budgetHtml = `<button class="budget-line rise" style="--i:1;width:100%;text-align:left" data-go="budgets">
      <div class="bl-txt">${left >= 0 ? `<b>${money(left)}</b> left of your ${money(B)} budget` : `<b>${money(-left)}</b> over your ${money(B)} budget`}
        <div class="bl-bar"><i class="${pct > 1 ? 'over' : pct > 0.8 ? 'warn' : ''}" style="width:${Math.min(pct, 1) * 100}%"></i></div></div>
      ${I.chevR.replace('<svg', '<svg style="width:16px;height:16px;color:var(--dust-2)"')}
    </button>`;
  }

  v.innerHTML = `
  <header class="top">
    <div><p class="hello">${greeting()}${name ? ', ' + esc(name) : ''}</p><h1 class="title">Overview</h1></div>
    ${avatar()}
  </header>
  ${monthSw()}
  <div class="card-stage">
    <div class="card3d ${intro ? 'intro' : ''}" id="card">
      <div class="card-face front">
        <div class="card-noise"></div>
        <div class="card-row pop"><div class="brand">${I.mark}Orbit</div><div class="card-chip"></div></div>
        <div class="pop-lg"><div class="bal-label">Total balance</div><div class="bal num" id="bal" style="font-size:${fs}px">${money(bal)}</div></div>
        <div class="inout pop">
          <div class="in"><small><i>↑</i>Income</small><b id="cin">${money(inc)}</b></div>
          <div class="out"><small><i>↓</i>Spent</small><b id="cout">${money(exp)}</b></div>
        </div>
      </div>
      <div class="card-face back">
        <div class="stripe"></div>
        <div class="back-grid pop">
          <div><small>Saved in ${MON[m.getMonth()]}</small><b>${saveRate == null ? '—' : saveRate + '%'}</b></div>
          <div><small>Top category</small><b>${top ? cat(top.id).emoji + ' ' + esc(cat(top.id).name) : 'None yet'}</b></div>
          <div><small>Transactions</small><b>${mt.length}</b></div>
          <div><small>Daily average</small><b>${money(avg, { dec: 0 })}</b></div>
        </div>
        <div class="card-row pop"><span class="back-name">${esc((name || 'Orbit member').toUpperCase())}</span><div class="brand">${I.mark}</div></div>
      </div>
    </div>
    <div class="card-shadow"></div>
  </div>
  <p class="card-hint">Tap the card to flip it. Tilt your phone to move it.</p>
  ${budgetHtml}
  ${isIOS && !standalone && !state.hideInstall ? `
  <div class="install rise" style="--i:1" id="install">
    <div class="ico">${I.share}</div>
    <p><b>Add Orbit to your Home Screen</b>In Safari, tap ••• then Share, then Add to Home Screen. Keep "Open as Web App" on.</p>
    <button class="x" data-act="hide-install" aria-label="Dismiss">${I.close}</button>
  </div>` : ''}
  <section class="block rise" style="--i:2">
    <div class="block-head"><h2>Daily spending</h2><span class="aside" id="daily-info">${dailyText()}</span></div>
    <div class="daily" id="daily">${daily.map((a, i) => `<button data-day="${i + 1}" aria-label="${i + 1} ${MON[m.getMonth()]}: ${esc(money(a))}" class="${i + 1 === todayD ? 'today' : ''} ${todayD && i + 1 > todayD ? 'future' : ''} ${ui.daySel === i + 1 ? 'sel' : ''}" style="--h:${Math.max(4, Math.sqrt(a / dmax) * 100)}%;--i:${i}"><i></i></button>`).join('')}</div>
    <div class="daily-axis"><span>1</span><span>${Math.ceil(dim / 2)}</span><span>${dim}</span></div>
  </section>
  ${byCat.length ? `
  <section class="block rise" style="--i:3">
    <div class="block-head"><h2>Where it went</h2><button class="link" data-go="insights">Details</button></div>
    <div class="hscroll">${byCat.slice(0, 8).map((c, i) => { const k = cat(c.id); return `
      <button class="cchip" data-fcat="${c.id}" style="--c:${k.color};--i:${i}">
        <span class="e">${k.emoji}</span><span class="n">${esc(k.name)}</span><span class="a">${money(c.amount)}</span>
        <span class="p"><i style="width:${c.amount / exp * 100}%"></i></span>
      </button>`; }).join('')}</div>
  </section>` : ''}
  <section class="block rise" style="--i:4">
    <div class="block-head"><h2>Recent</h2>${mt.length > 5 ? '<button class="link" data-go="activity">See all</button>' : ''}</div>
    <div class="tx-list">${sortTx(mt).slice(0, 5).map((t, i) => txRow(t, i)).join('') ||
      emptyState(isCurrentMonth(m) ? 'Nothing logged yet' : 'No transactions in this month', 'Tap the + button to add an expense or income. It takes about three seconds.', isCurrentMonth(m) ? 'Add transaction' : '')}</div>
  </section>`;

  const card = $('#card', v);
  attachCard(card);
  countUp($('#bal', v), 'bal', bal, { delay: intro ? 350 : 0, dur: intro ? 1400 : 900 });
  countUp($('#cin', v), 'cin', inc, { delay: intro ? 500 : 0 });
  countUp($('#cout', v), 'cout', exp, { delay: intro ? 500 : 0 });
}
function dailyText() {
  if (!homeData) return '';
  const { daily, avg, m } = homeData;
  if (ui.daySel && daily[ui.daySel - 1] != null) return `${ui.daySel} ${MON[m.getMonth()]}: ${money(daily[ui.daySel - 1])}`;
  return `About ${money(avg, { dec: 0 })} a day`;
}
function selectDay(d) {
  ui.daySel = ui.daySel === d ? null : d;
  $$('#daily button').forEach(b => b.classList.toggle('sel', +b.dataset.day === ui.daySel));
  const info = $('#daily-info'); if (info) info.textContent = dailyText();
  haptic();
}

/* ---------- 3D card physics ---------- */
const Card = { el: null, rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0, flip: 0, vf: 0, tf: 0, touching: false, g: null, raf: 0, got: false };
function attachCard(card) {
  if (!card) return;
  Card.el = card; Card.flip = Card.tf = 0; Card.vf = 0;
  const stage = card.parentElement;
  const track = e => {
    const r = stage.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
    Card.ty = (px - 0.5) * 28; Card.tx = -(py - 0.5) * 22;
    kick();
  };
  stage.addEventListener('pointerdown', e => { Card.touching = true; track(e); });
  stage.addEventListener('pointermove', e => { if (Card.touching || e.pointerType === 'mouse') track(e); });
  const end = () => { Card.touching = false; Card.tx = 0; Card.ty = 0; kick(); };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('pointerleave', end);
  card.addEventListener('click', () => { Card.tf = Card.tf ? 0 : 180; haptic(); kick(); askMotion(); });
  if (card.classList.contains('intro')) card.addEventListener('animationend', () => card.classList.remove('intro'), { once: true });
  kick();
}
function kick() { if (!Card.raf) Card.raf = requestAnimationFrame(cardStep); }
function cardStep() {
  Card.raf = 0;
  const c = Card.el;
  if (!c || !c.isConnected) return;
  const gx = !Card.touching && Card.g ? Card.g.x : 0, gy = !Card.touching && Card.g ? Card.g.y : 0;
  const k = 0.11, d = 0.76;
  Card.vx = (Card.vx + (Card.tx + gx - Card.rx) * k) * d; Card.rx += Card.vx;
  Card.vy = (Card.vy + (Card.ty + gy - Card.ry) * k) * d; Card.ry += Card.vy;
  Card.vf = (Card.vf + (Card.tf - Card.flip) * 0.065) * 0.8; Card.flip += Card.vf;
  const s = c.style;
  s.setProperty('--rx', Card.rx.toFixed(2) + 'deg');
  s.setProperty('--ry', (Card.ry + Card.flip).toFixed(2) + 'deg');
  s.setProperty('--mx', (50 + Card.ry * 2.4).toFixed(1) + '%');
  s.setProperty('--my', (35 - Card.rx * 2.4).toFixed(1) + '%');
  const sh = c.parentElement.querySelector('.card-shadow');
  if (sh) sh.style.setProperty('--ryn', (Card.ry / 14).toFixed(2));
  const busy = Math.abs(Card.vx) + Math.abs(Card.vy) + Math.abs(Card.vf) > 0.01 ||
    Math.abs(Card.tx + gx - Card.rx) + Math.abs(Card.ty + gy - Card.ry) + Math.abs(Card.tf - Card.flip) > 0.05;
  if (busy) kick();
}
function onOrient(e) {
  if (e.beta == null || e.gamma == null) return;
  Card.got = true;
  const b = clamp(e.beta - 45, -30, 30), g = clamp(e.gamma, -30, 30);
  Card.g = { x: -b * 0.4, y: g * 0.55 };
  kick();
}
let gyroOn = false, askedMotion = false;
function startGyro() { if (gyroOn) return; gyroOn = true; window.addEventListener('deviceorientation', onOrient); }
function stopGyro() { gyroOn = false; window.removeEventListener('deviceorientation', onOrient); Card.g = null; kick(); }
async function requestMotion() {
  const D = window.DeviceOrientationEvent;
  if (!D) return false;
  if (typeof D.requestPermission === 'function') {
    try { return (await D.requestPermission()) === 'granted'; } catch (e) { return false; }
  }
  return true;
}
async function askMotion() {
  if (!state.tilt || Card.got || askedMotion) return;
  askedMotion = true;
  if (await requestMotion()) startGyro();
}

/* ---------- Activity ---------- */
function renderActivity(v, anim) {
  v.innerHTML = `
  <header class="top"><h1 class="title">Activity</h1>${avatar()}</header>
  ${monthSw()}
  <label class="search">${I.search}<input type="search" id="q" placeholder="Search notes or categories" value="${esc(ui.q)}" enterkeyhint="search" autocomplete="off"></label>
  <div class="filters">${filterChips()}</div>
  <div id="act-list"></div>`;
  const q = $('#q', v);
  q.addEventListener('input', () => { ui.q = q.value; renderActList(v, false); });
  q.addEventListener('keydown', e => { if (e.key === 'Enter') q.blur(); });
  renderActList(v, anim);
}
function filterChips() {
  let s = '';
  if (ui.fcat) { const c = cat(ui.fcat); s += `<button class="fchip on" data-clearcat aria-label="Remove category filter">${c.emoji} ${esc(c.name)} ${I.close}</button>`; }
  s += [['all', 'All'], ['expense', 'Spent'], ['income', 'Received']].map(([k, l]) => `<button class="fchip ${ui.filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('');
  return s;
}
function renderActList(v) {
  const box = $('#act-list', v);
  if (!box) return;
  const all = monthTx(), q = ui.q.trim().toLowerCase();
  let list = all;
  if (ui.filter !== 'all') list = list.filter(t => t.type === ui.filter);
  if (ui.fcat) list = list.filter(t => t.cat === ui.fcat);
  if (q) list = list.filter(t => (t.note || '').toLowerCase().includes(q) || cat(t.cat).name.toLowerCase().includes(q) || acc(t.acc).name.toLowerCase().includes(q) || String(t.amount).includes(q));
  list = sortTx(list);
  let html = `<div class="totals"><div><small>Spent</small><b>${money(sum(list, 'expense'))}</b></div><div class="in"><small>Received</small><b>${money(sum(list, 'income'))}</b></div></div>`;
  if (!list.length) {
    html += all.length ? emptyState('Nothing matches', 'Try another word, or clear the filters above.')
      : emptyState('No transactions this month', 'Tap the + button to add your first one.', isCurrentMonth(ui.month) ? 'Add transaction' : '');
  } else {
    let cur = null, i = 0;
    const days = {};
    list.forEach(t => { const d = days[t.date] || (days[t.date] = { out: 0, inc: 0 }); if (t.type === 'expense') d.out += t.amount; else d.inc += t.amount; });
    list.forEach(t => {
      if (t.date !== cur) {
        cur = t.date;
        const d = days[cur];
        html += `<div class="day-head"><b>${dayLabel(cur)}</b><span>${d.out ? '−' + money(d.out) : ''}${d.out && d.inc ? '  ' : ''}${d.inc ? '+' + money(d.inc) : ''}</span></div>`;
      }
      html += txRow(t, i++, 'acc');
    });
  }
  box.innerHTML = html;
}

/* Swipe left to delete */
let sw = null;
document.addEventListener('pointerdown', e => {
  const main = e.target.closest && e.target.closest('.tx-main');
  if (!main) return;
  sw = { main, row: main.parentElement, x0: e.clientX, y0: e.clientY, dx: 0, dir: null, id: e.pointerId, armed: false };
}, { passive: true });
document.addEventListener('pointermove', e => {
  if (!sw || e.pointerId !== sw.id) return;
  const dx = e.clientX - sw.x0, dy = e.clientY - sw.y0;
  if (!sw.dir) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    sw.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
  }
  if (sw.dir !== 'h') return;
  sw.dx = dx < 0 ? dx : dx * 0.15;
  sw.main.style.transition = 'none';
  sw.main.style.transform = `translateX(${sw.dx}px)`;
  const del = sw.row.querySelector('.tx-del');
  del.style.width = Math.max(0, -sw.dx) + 'px';
  const armed = sw.dx < -110;
  if (armed !== sw.armed) { sw.armed = armed; del.style.background = armed ? '#FF3B5C' : ''; if (armed) haptic(); }
}, { passive: true });
function swEnd(e, cancel) {
  if (!sw || e.pointerId !== sw.id) return;
  const s = sw; sw = null;
  if (s.dir !== 'h') return;
  s.main.dataset.swiped = '1';
  setTimeout(() => { delete s.main.dataset.swiped; }, 60);
  const del = s.row.querySelector('.tx-del');
  if (!cancel && s.armed) {
    s.main.style.transition = 'transform .25s ease-in';
    s.main.style.transform = 'translateX(-110%)';
    del.style.transition = 'width .25s ease-in';
    del.style.width = '100%';
    setTimeout(() => deleteTx(s.row.dataset.id, s.row), 200);
  } else {
    s.main.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
    s.main.style.transform = '';
    del.style.transition = 'width .4s cubic-bezier(.16,1,.3,1)';
    del.style.width = '0px';
    setTimeout(() => { del.style.transition = ''; }, 420);
  }
}
document.addEventListener('pointerup', e => swEnd(e, false));
document.addEventListener('pointercancel', e => swEnd(e, true));

function deleteTx(id, row) {
  const idx = state.tx.findIndex(t => t.id === id);
  if (idx < 0) return;
  const [t] = state.tx.splice(idx, 1);
  persist();
  haptic('heavy');
  const done = () => refresh();
  if (row && row.isConnected) {
    row.style.height = row.offsetHeight + 'px';
    void row.offsetHeight;
    row.classList.add('removing');
    row.style.height = '0px';
    setTimeout(done, 330);
  } else done();
  toast('Transaction deleted', { icon: '🗑️', action: 'Undo', onAction: () => { state.tx.push(t); persist(); refresh(); haptic(); } });
}

/* ---------- Insights ---------- */
let insData = null;
function renderInsights(v, anim) {
  const m = ui.month, mt = monthTx(m);
  const exp = sum(mt, 'expense'), inc = sum(mt, 'income'), net = inc - exp;
  const avg = exp / daysElapsed(m);
  const pm = new Date(m.getFullYear(), m.getMonth() - 1, 1);
  let pmt = monthTx(pm);
  if (isCurrentMonth(m)) { const d = new Date().getDate(); pmt = pmt.filter(t => +t.date.slice(8) <= d); }
  const pexp = sum(pmt, 'expense');
  const delta = pexp > 0 ? (exp - pexp) / pexp * 100 : null;
  const six = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(m.getFullYear(), m.getMonth() - i, 1); six.push({ d, label: MON[d.getMonth()], value: sum(monthTx(d), 'expense') }); }
  if (ui.barSel == null || ui.barSel > 5) ui.barSel = 5;
  const byCat = groupCats(mt, 'expense');

  // donut segments
  const R = 84, C = 2 * Math.PI * R;
  let off = 0;
  const segs = byCat.map(c => { const len = c.amount / exp * C; const s = { id: c.id, amount: c.amount, len, off, color: cat(c.id).color }; off += len; return s; });
  if (ui.donutSel && !segs.find(s => s.id === ui.donutSel)) ui.donutSel = null;

  // calendar
  const dim = daysIn(m), daily = Array(dim).fill(0), cnt = Array(dim).fill(0);
  mt.forEach(t => { if (t.type === 'expense') { const i = +t.date.slice(8) - 1; daily[i] += t.amount; cnt[i]++; } });
  insData = { m, daily, cnt };

  const deltaHtml = delta == null ? '' : `<span class="delta ${delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat'}">${delta > 1 ? '↑' : delta < -1 ? '↓' : ''} ${Math.abs(Math.round(delta))}% vs last month</span>`;

  v.innerHTML = `
  <header class="top"><h1 class="title">Insights</h1>${avatar()}</header>
  ${monthSw()}
  <div class="stats rise" style="--i:0">
    <div class="stat"><small>Spent</small><b>${money(exp)}</b>${deltaHtml}</div>
    <div class="stat"><small>Received</small><b style="color:var(--aurora)">${money(inc)}</b></div>
    <div class="stat"><small>${net >= 0 ? 'Saved' : 'Overspent'}</small><b>${money(Math.abs(net))}</b>${inc > 0 ? `<span class="delta ${net >= 0 ? 'down' : 'up'}">${Math.round(Math.abs(net) / inc * 100)}% of income</span>` : ''}</div>
    <div class="stat"><small>Daily average</small><b>${money(avg, { dec: 0 })}</b></div>
  </div>
  <section class="block rise" style="--i:1">
    <div class="block-head"><h2>Six-month trend</h2></div>
    <div class="panel">
      <p class="panel-sub" id="b3-info"></p>
      <div class="b3-scene" id="b3">${bars3D(six)}</div>
      <div class="hint">${I.rotate} Drag sideways to rotate. Tap a bar for details.</div>
    </div>
  </section>
  <section class="block rise" style="--i:2">
    <div class="block-head"><h2>Categories</h2>${byCat.length ? `<span class="aside">${byCat.length} with spending</span>` : ''}</div>
    <div class="panel">${byCat.length ? donutHtml(segs, exp, anim) : emptyState('No spending yet', 'Your categories show up here once you add an expense.')}</div>
  </section>
  <section class="block rise" style="--i:3">
    <div class="block-head"><h2>Spending calendar</h2></div>
    <div class="panel"><p class="panel-sub" id="cal-info">${calText()}</p>${calHtml(m, daily)}</div>
  </section>`;

  setupBars(v, six, anim);
  if (byCat.length) setupDonut(v, segs, exp, C);
}

function bars3D(data) {
  const W = 30, gap = 20, n = data.length, tw = n * W + (n - 1) * gap, H = 140;
  const max = Math.max(...data.map(d => d.value), 1);
  return `<div class="b3-stage" style="width:${tw}px;--rx:-18deg;--ry:-26deg">
    <div class="b3-floor" style="left:-50px;width:${tw + 100}px"></div>
    ${data.map((d, i) => `<div class="b3-bar ${i === ui.barSel ? 'on' : ''}" data-bar="${i}" style="left:${i * (W + gap)}px;--h:${Math.max(4, d.value / max * H).toFixed(1)}px;--d:${i * 80}ms">
      <div class="b3-grow"><i class="bk"></i><i class="lf"></i><i class="rt"></i><i class="fr"></i><i class="tp"></i></div>
      <span class="b3-label">${d.label}</span><span class="b3-val">${esc(short(d.value))}</span>
    </div>`).join('')}
  </div>`;
}
function setupBars(v, six, anim) {
  const scene = $('#b3', v), stage = $('.b3-stage', scene), info = $('#b3-info', v);
  const st = { rx: -18, ry: -26, vry: 0, drag: null };
  const apply = () => { stage.style.setProperty('--rx', st.rx.toFixed(2) + 'deg'); stage.style.setProperty('--ry', st.ry.toFixed(2) + 'deg'); };
  const setInfo = i => { const d = six[i]; info.innerHTML = `<b>${MONTHS[d.d.getMonth()]} ${d.d.getFullYear()}</b>: ${esc(money(d.value))} spent`; };
  setInfo(ui.barSel);
  if (anim && !reduced) {
    let pos = -78, vel = 0;
    st.ry = pos; apply();
    const tick = () => {
      if (st.drag || !stage.isConnected) return;
      vel = (vel + (-26 - pos) * 0.045) * 0.86; pos += vel; st.ry = pos; apply();
      if (Math.abs(vel) > 0.02 || Math.abs(-26 - pos) > 0.05) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 250);
  }
  scene.addEventListener('pointerdown', e => {
    st.drag = { x: e.clientX, y: e.clientY, ry: st.ry, rx: st.rx, lx: e.clientX, lt: performance.now(), moved: false };
    st.vry = 0;
  });
  scene.addEventListener('pointermove', e => {
    const d = st.drag; if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) d.moved = true;
    st.ry = clamp(d.ry + dx * 0.45, -80, 80);
    if (e.pointerType === 'mouse') st.rx = clamp(d.rx - dy * 0.3, -60, -4);
    const now = performance.now();
    st.vry = (e.clientX - d.lx) * 0.45 / Math.max(1, now - d.lt) * 16;
    d.lx = e.clientX; d.lt = now;
    apply();
  });
  scene.addEventListener('pointerup', e => {
    const d = st.drag; st.drag = null;
    if (!d) return;
    if (!d.moved) {
      const bar = e.target.closest('[data-bar]');
      if (bar) { ui.barSel = +bar.dataset.bar; $$('.b3-bar', stage).forEach((b, j) => b.classList.toggle('on', j === ui.barSel)); setInfo(ui.barSel); haptic(); }
      return;
    }
    const tick = () => {
      if (st.drag || !stage.isConnected) return;
      st.vry *= 0.92; st.ry = clamp(st.ry + st.vry, -80, 80); apply();
      if (Math.abs(st.vry) > 0.05) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  scene.addEventListener('pointercancel', () => { st.drag = null; });
  scene.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') st.drag = null; });
}

function donutHtml(segs, total, anim) {
  const R = 84, SW = 30, C = 2 * Math.PI * R, gap = segs.length > 1 ? 2.5 : 0;
  const layer = (cls, z, shade) => `<svg class="d3-layer ${cls}" viewBox="0 0 220 220" style="transform:translateZ(${z}px)"><g transform="rotate(-90 110 110)">${segs.map(s =>
    `<circle data-seg="${s.id}" class="${ui.donutSel === s.id ? 'on' : ''}" cx="110" cy="110" r="${R}" fill="none" stroke="${shade ? darken(s.color, shade) : s.color}" stroke-width="${SW}" stroke-dasharray="${Math.max(0.01, s.len - gap).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${(-s.off).toFixed(2)}"/>`).join('')}</g></svg>`;
  let layers = '';
  for (let i = 9; i >= 1; i--) layers += layer('side', -i * 2.2, 0.78 - i * 0.045);
  layers += layer('top', 0, 0);
  const sel = segs.find(s => s.id === ui.donutSel);
  return `<div class="d3-wrap">
    <div class="d3-scene" id="d3">
      <div class="d3-stage ${anim && !reduced ? 'intro' : ''} ${sel ? 'focus' : ''}">${layers}</div>
      <div class="d3-center"><div><small id="d3-lbl">${sel ? esc(cat(sel.id).name) : 'Total spent'}</small><b id="d3-val">${money(sel ? sel.amount : total)}</b></div></div>
    </div>
    <div class="hint" style="margin-top:0">${I.rotate} Spin the ring or tap a slice</div>
    <div class="legend">${segs.map((s, i) => { const c = cat(s.id); const p = s.amount / total * 100; return `
      <button class="lg ${ui.donutSel === s.id ? 'on' : ''}" data-lg="${s.id}" style="--c:${c.color};--i:${i}">
        <span class="e">${c.emoji}</span>
        <span class="mid"><span>${esc(c.name)} <em>${p < 1 ? '<1' : Math.round(p)}%</em></span><span class="bar"><i style="width:${p}%"></i></span></span>
        <span class="amt">${money(s.amount)}</span>
      </button>`; }).join('')}</div>
  </div>`;
}
function setupDonut(v, segs, total, C) {
  const scene = $('#d3', v), stage = $('.d3-stage', scene);
  const st = { spin: 0, vel: 0, target: null, drag: null, raf: 0 };
  if (stage.classList.contains('intro')) stage.addEventListener('animationend', () => stage.classList.remove('intro'), { once: true });
  const apply = () => stage.style.setProperty('--spin', st.spin.toFixed(2) + 'deg');
  const loop = () => {
    st.raf = 0;
    if (st.drag || !stage.isConnected) return;
    if (st.target != null) st.vel = (st.vel + (st.target - st.spin) * 0.06) * 0.8;
    else st.vel *= 0.95;
    st.spin += st.vel; apply();
    if (Math.abs(st.vel) > 0.03 || (st.target != null && Math.abs(st.target - st.spin) > 0.05)) st.raf = requestAnimationFrame(loop);
  };
  const run = () => { if (!st.raf) st.raf = requestAnimationFrame(loop); };
  const focus = id => {
    ui.donutSel = ui.donutSel === id ? null : id;
    stage.classList.toggle('focus', !!ui.donutSel);
    $$('.d3-layer.top circle', stage).forEach(c => c.classList.toggle('on', c.dataset.seg === ui.donutSel));
    $$('.lg', v).forEach(r => r.classList.toggle('on', r.dataset.lg === ui.donutSel));
    const s = segs.find(x => x.id === ui.donutSel);
    $('#d3-lbl', v).textContent = s ? cat(s.id).name : 'Total spent';
    $('#d3-val', v).textContent = money(s ? s.amount : total);
    if (s) {
      // bring the chosen slice to the front of the ring
      const mid = (s.off + s.len / 2) / C * 360;
      let t = 180 - mid;
      t = st.spin + ((((t - st.spin) % 360) + 540) % 360) - 180;
      st.target = t; run();
    }
    haptic();
  };
  scene.addEventListener('pointerdown', e => { st.drag = { x: e.clientX, lx: e.clientX, lt: performance.now(), spin: st.spin, moved: false }; st.target = null; st.vel = 0; });
  scene.addEventListener('pointermove', e => {
    const d = st.drag; if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    st.spin = d.spin + dx * 0.7;
    const now = performance.now();
    st.vel = (e.clientX - d.lx) * 0.7 / Math.max(1, now - d.lt) * 16;
    d.lx = e.clientX; d.lt = now;
    apply();
  });
  scene.addEventListener('pointerup', e => {
    const d = st.drag; st.drag = null;
    if (!d) return;
    if (!d.moved) { const c = e.target.closest('circle[data-seg]'); if (c) focus(c.dataset.seg); return; }
    run();
  });
  scene.addEventListener('pointercancel', () => { st.drag = null; });
  scene.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && st.drag) { st.drag = null; run(); } });
  $$('.lg', v).forEach(r => r.addEventListener('click', () => focus(r.dataset.lg)));
}

function calHtml(m, daily) {
  const dim = daysIn(m), offset = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7;
  const max = Math.max(...daily, 1), todayD = isCurrentMonth(m) ? new Date().getDate() : 0;
  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<i></i>';
  for (let d = 1; d <= dim; d++) {
    const a = Math.sqrt(daily[d - 1] / max);
    cells += `<button data-cal="${d}" aria-label="${d} ${MON[m.getMonth()]}: ${esc(money(daily[d - 1]))}" class="${a > 0.6 ? 'hot' : ''} ${d === todayD ? 'today' : ''} ${todayD && d > todayD ? 'future' : ''} ${ui.calSel === d ? 'sel' : ''}" style="--a:${a.toFixed(3)};--i:${d}">${d}</button>`;
  }
  return `<div class="cal-dow">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="cal-grid">${cells}</div>`;
}
function calText() {
  if (!insData || !ui.calSel) return 'Brighter days are the ones you spent more. Tap a day.';
  const { m, daily, cnt } = insData, d = ui.calSel;
  const date = ymd(new Date(m.getFullYear(), m.getMonth(), d));
  const n = cnt[d - 1];
  return `<b>${dayLabel(date)}</b>: ${esc(money(daily[d - 1]))}${n ? ` across ${n} ${n === 1 ? 'expense' : 'expenses'}` : ''}`;
}
function selectCal(d) {
  ui.calSel = ui.calSel === d ? null : d;
  $$('#v-insights [data-cal]').forEach(b => b.classList.toggle('sel', +b.dataset.cal === ui.calSel));
  const info = $('#cal-info'); if (info) info.innerHTML = calText();
  haptic();
}

/* ---------- Budgets ---------- */
function renderBudgets(v, anim) {
  const m = ui.month, mt = monthTx(m), exp = sum(mt, 'expense');
  const B = state.budget.total || 0, limits = state.budget.cats || {};
  const head = `<header class="top"><h1 class="title">Budgets</h1>${avatar()}</header>${monthSw()}`;
  if (!B && !Object.values(limits).some(x => x > 0)) {
    v.innerHTML = head + `<div class="rise">${emptyState('No budget yet', 'Pick a monthly amount and Orbit will tell you how much you can spend each day to stay on track.', '')}
      <div style="text-align:center"><button class="btn primary" data-act="edit-budget">Set a budget</button></div></div>`;
    return;
  }
  const total = B || Object.values(limits).reduce((a, b) => a + b, 0);
  const left = total - exp, pct = total ? exp / total : 0;
  const cur = isCurrentMonth(m), dim = daysIn(m), today = new Date().getDate();
  const daysLeft = cur ? dim - today + 1 : 0;
  const perDay = cur && left > 0 ? left / daysLeft : 0;
  // Fixed costs (rent, bills, subscriptions, one-off big payments) are already paid, so only project everyday spending forward.
  const isFixed = t => ['rent', 'bills', 'subs'].includes(t.cat) || t.amount > total * 0.2;
  const variable = mt.reduce((a, t) => a + (t.type === 'expense' && !isFixed(t) ? t.amount : 0), 0);
  const proj = cur ? exp + variable / today * (dim - today) : exp;
  const R = 100, C = 2 * Math.PI * R, offset = C * (1 - Math.min(pct, 1));
  const tone = pct > 1 ? 'bad' : pct > 0.8 || (cur && proj > total) ? 'warn' : 'ok';
  const grad = tone === 'bad' ? ['#FF9F6B', '#FF5C7A'] : tone === 'warn' ? ['#FFD58A', '#FF9F6B'] : ['#4BE3B0', '#9D8CFF'];

  let pace;
  if (!cur) pace = `<div class="pace ${pct > 1 ? 'bad' : ''}">In ${MONTHS[m.getMonth()]} you spent <b>${money(exp)}</b> of your ${money(total)} budget${pct > 1 ? `, <b>${money(-left)}</b> over` : `, with <b>${money(left)}</b> to spare`}.</div>`;
  else if (pct > 1) pace = `<div class="pace bad">You're <b>${money(-left)}</b> over budget this month. Holding off on extras until the 1st will help.</div>`;
  else if (proj > total) pace = `<div class="pace warn">At this pace you'll spend about <b>${money(proj, { dec: 0 })}</b> by the end of the month. Keep it under <b>${money(perDay, { dec: 0 })}</b> a day to stay on budget.</div>`;
  else pace = `<div class="pace">You're on track. At this pace you'll finish near <b>${money(proj, { dec: 0 })}</b> and keep <b>${money(total - proj, { dec: 0 })}</b>.</div>`;

  const spentBy = Object.fromEntries(groupCats(mt, 'expense').map(c => [c.id, c.amount]));
  const rows = CATS.filter(c => c.type === 'expense' && (limits[c.id] > 0 || spentBy[c.id] > 0))
    .map(c => ({ c, lim: limits[c.id] || 0, spent: spentBy[c.id] || 0 }))
    .sort((a, b) => (b.lim > 0) - (a.lim > 0) || (b.lim && a.lim ? b.spent / b.lim - a.spent / a.lim : b.spent - a.spent));

  v.innerHTML = head + `
  <div class="panel rise" style="--i:0">
    <div class="ring-wrap">
      <div class="ring">
        <svg viewBox="0 0 236 236">
          <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${grad[0]}"/><stop offset="1" stop-color="${grad[1]}"/></linearGradient></defs>
          <circle class="track" cx="118" cy="118" r="${R}" fill="none" stroke-width="18"/>
          <circle class="prog" cx="118" cy="118" r="${R}" fill="none" stroke="url(#ringg)" stroke-width="18" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${anim ? C.toFixed(2) : offset.toFixed(2)}"/>
        </svg>
        <div class="inner"><div><small>${left >= 0 ? 'Left to spend' : 'Over budget'}</small><b id="bleft">${money(Math.abs(left))}</b><em>of ${money(total)}</em></div></div>
      </div>
    </div>
    <div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:14px">
      <div class="stat"><small>Spent</small><b style="font-size:16px">${money(exp)}</b></div>
      <div class="stat"><small>Days left</small><b style="font-size:16px">${cur ? daysLeft : '—'}</b></div>
      <div class="stat"><small>Per day</small><b style="font-size:16px">${cur ? money(perDay, { dec: 0 }) : '—'}</b></div>
    </div>
    ${pace}
  </div>
  <section class="block rise" style="--i:1">
    <div class="block-head"><h2>By category</h2><button class="link" data-act="edit-budget">Edit</button></div>
    <div>${rows.length ? rows.map((r, i) => {
      const over = r.lim && r.spent > r.lim;
      return `<div class="brow" style="--c:${r.c.color};--i:${i}">
        <span class="e">${r.c.emoji}</span>
        <div class="mid">
          <div class="t"><span>${esc(r.c.name)}</span><em>${money(r.spent)}${r.lim ? ' of ' + money(r.lim) : ''}</em></div>
          ${r.lim ? `<div class="bar"><i class="${over ? 'over' : ''}" style="width:${Math.min(r.spent / r.lim, 1) * 100}%"></i></div>
          <div class="sub ${over ? 'over' : ''}">${over ? money(r.spent - r.lim) + ' over' : money(r.lim - r.spent) + ' left'}</div>` : '<div class="sub">No limit set</div>'}
        </div></div>`;
    }).join('') : '<p class="muted" style="font-size:14px">No spending yet this month.</p>'}</div>
  </section>`;
  if (anim) {
    const prog = $('.prog', v);
    requestAnimationFrame(() => requestAnimationFrame(() => { prog.style.strokeDashoffset = offset.toFixed(2); }));
  }
  countUp($('#bleft', v), 'bleft', Math.abs(left), { delay: anim ? 200 : 0, dur: 1200 });
}
function openBudgetEditor() {
  const exp = CATS.filter(c => c.type === 'expense');
  const body = el(`<div>
    <h2 class="sheet-title">Monthly budget</h2>
    <div class="group"><label class="row static"><span class="lbl">Total per month</span><input inputmode="decimal" id="b-total" placeholder="${esc(curSymbol())}0" value="${state.budget.total || ''}"></label></div>
    <p class="group-title">Limits for each category (optional)</p>
    <div class="group">${exp.map(c => `<label class="row static"><span class="ico" style="background:color-mix(in srgb,${c.color} 20%,transparent)">${c.emoji}</span><span class="lbl">${esc(c.name)}</span><input inputmode="decimal" data-bcat="${c.id}" placeholder="No limit" value="${state.budget.cats[c.id] || ''}"></label>`).join('')}</div>
    <button class="btn primary block" id="b-save">Save budget</button>
  </div>`);
  const sh = openSheet({ body });
  const num = s => { const n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0; };
  $('#b-save', body).addEventListener('click', () => {
    const cats = {};
    $$('[data-bcat]', body).forEach(i => { const n = num(i.value); if (n) cats[i.dataset.bcat] = n; });
    let total = num($('#b-total', body).value);
    if (!total) total = Object.values(cats).reduce((a, b) => a + b, 0);
    state.budget = { total, cats };
    persist();
    haptic('heavy');
    sh.close();
    toast('Budget saved', { icon: '🎯' });
    refresh();
  });
}

/* ================= Sheets ================= */
let sheetCount = 0;
function openSheet({ body, onClose }) {
  const wrap = el(`<div class="sheet-wrap"><div class="sheet-backdrop"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grab" aria-hidden="true"><span></span></div><div class="sheet-body"></div></div></div>`);
  const sheet = $('.sheet', wrap), bodyEl = $('.sheet-body', wrap);
  bodyEl.append(body);
  $('#sheets').append(wrap);
  sheetCount++;
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    wrap.classList.remove('open'); wrap.classList.add('closing');
    sheetCount = Math.max(0, sheetCount - 1);
    if (!sheetCount) document.body.classList.remove('sheet-open');
    if (document.activeElement && wrap.contains(document.activeElement)) document.activeElement.blur();
    cleanup();
    setTimeout(() => { wrap.remove(); if (onClose) onClose(); }, 360);
  };
  $('.sheet-backdrop', wrap).addEventListener('click', close);
  const cleanup = dragToClose([$('.sheet-grab', wrap), ...$$('[data-drag]', body)], sheet, close);
  return { el: sheet, body: bodyEl, close };
}
function dragToClose(handles, sheet, close) {
  let st = null;
  const down = e => { st = { y0: e.clientY, dy: 0, t0: performance.now(), active: false, id: e.pointerId }; };
  const move = e => {
    if (!st || e.pointerId !== st.id) return;
    const dy = e.clientY - st.y0;
    if (!st.active) { if (dy > 7) { st.active = true; sheet.classList.add('dragging'); } else return; }
    st.dy = Math.max(0, dy);
    sheet.style.transform = `translateY(${st.dy}px)`;
  };
  const up = e => {
    if (!st || e.pointerId !== st.id) return;
    const s = st; st = null;
    if (!s.active) return;
    const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', eat, true);
    setTimeout(() => window.removeEventListener('click', eat, true), 300);
    sheet.classList.remove('dragging');
    const vel = s.dy / Math.max(1, performance.now() - s.t0);
    if (s.dy > 110 || vel > 0.7) close(); else sheet.style.transform = '';
  };
  handles.forEach(h => h && h.addEventListener('pointerdown', down));
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
}

/* ---------- Add / edit transaction ---------- */
function openAdd(tx) {
  const editing = !!tx;
  const s = {
    type: tx ? tx.type : 'expense', amount: tx ? String(tx.amount) : '', cat: tx ? tx.cat : null,
    acc: tx ? tx.acc : (state.lastAcc || 'upi'), note: tx ? tx.note || '' : '',
    date: tx ? tx.date : (isCurrentMonth(ui.month) ? ymd(new Date()) : ymd(new Date(ui.month.getFullYear(), ui.month.getMonth(), daysIn(ui.month))))
  };
  if (!s.cat) s.cat = lastCat(s.type);
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
  const body = el(`<div class="add">
    <div class="add-top" data-drag>
      <div class="seg ${s.type}" role="tablist">
        <button data-type="expense" role="tab" class="${s.type === 'expense' ? 'on' : ''}">Expense</button>
        <button data-type="income" role="tab" class="${s.type === 'income' ? 'on' : ''}">Income</button>
        <i class="seg-pill"></i>
      </div>
      ${editing ? `<button class="icon-btn danger" id="a-del" aria-label="Delete transaction">${I.trash}</button>` : ''}
    </div>
    <div class="amount-wrap">
      <div class="amount ${s.type}" aria-live="polite"><span class="cur">${esc(curSymbol())}</span><span class="digits">0</span></div>
      <input class="note" placeholder="Add a note" maxlength="60" value="${esc(s.note)}" enterkeyhint="done" autocomplete="off">
    </div>
    <div class="cats" role="listbox" aria-label="Category"></div>
    <div class="metas">
      <label class="mchip">${I.cal}<span class="date-lbl"></span><input type="date" class="overlay-input" aria-label="Date" value="${s.date}"></label>
      <label class="mchip"><span class="acc-e"></span><span class="acc-lbl"></span><select class="overlay-input" aria-label="Paid with">${ACCOUNTS.map(a => `<option value="${a.id}" ${a.id === s.acc ? 'selected' : ''}>${a.emoji} ${a.name}</option>`).join('')}</select></label>
    </div>
    <div class="keypad">${keys.map(k => `<button class="key" data-k="${k}" aria-label="${k === 'del' ? 'Delete digit' : k === '.' ? 'Decimal point' : k}">${k === 'del' ? I.back : k}</button>`).join('')}</div>
    <button class="save ${s.type}"></button>
  </div>`);
  const sh = openSheet({ body });
  const seg = $('.seg', body), amtEl = $('.amount', body), digEl = $('.digits', body), catsEl = $('.cats', body);
  const saveBtn = $('.save', body), noteIn = $('.note', body), dateIn = $('input[type=date]', body), accSel = $('select', body);

  const fmtAmount = a => {
    if (!a) return '0';
    const [i, d] = a.split('.');
    const intF = new Intl.NumberFormat(curInfo().loc).format(Number(i || 0));
    return d !== undefined ? `${intF}.${d}` : intF;
  };
  const renderAmount = pop => {
    const txt = fmtAmount(s.amount);
    digEl.textContent = txt;
    amtEl.classList.toggle('empty', !s.amount);
    const n = txt.length;
    digEl.style.setProperty('--fs', (n > 11 ? 32 : n > 9 ? 38 : n > 7 ? 44 : 52) + 'px');
    if (pop) { digEl.classList.remove('pop'); void digEl.offsetWidth; digEl.classList.add('pop'); }
  };
  const renderCats = swap => {
    catsEl.innerHTML = CATS.filter(c => c.type === s.type).map(c => `<button class="cat ${c.id === s.cat ? 'on' : ''}" data-cat="${c.id}" role="option" aria-selected="${c.id === s.cat}" style="--c:${c.color}"><span class="e">${c.emoji}</span><span>${esc(c.name)}</span></button>`).join('');
    if (swap) { catsEl.classList.remove('swap'); void catsEl.offsetWidth; catsEl.classList.add('swap'); }
    const on = $('.cat.on', catsEl);
    catsEl.scrollLeft = on ? Math.max(0, on.offsetLeft - catsEl.clientWidth / 2 + on.offsetWidth / 2) : 0;
  };
  const renderMeta = () => {
    $('.date-lbl', body).textContent = dayLabel(s.date);
    $('.acc-e', body).textContent = acc(s.acc).emoji;
    $('.acc-lbl', body).textContent = acc(s.acc).name;
    saveBtn.textContent = editing ? 'Save changes' : s.type === 'expense' ? 'Save expense' : 'Save income';
  };
  const bad = () => { haptic('heavy'); amtEl.classList.remove('shake'); void amtEl.offsetWidth; amtEl.classList.add('shake'); };
  const press = k => {
    let a = s.amount;
    if (k === 'del') { if (!a) return; a = a.slice(0, -1); }
    else if (k === '.') { if (a.includes('.') || state.currency === 'JPY') return bad(); a = (a || '0') + '.'; }
    else {
      const [i, d] = a.split('.');
      if (d !== undefined) { if (d.length >= 2) return bad(); }
      else if ((i || '').length >= 9) return bad();
      a = a === '0' ? k : a + k;
    }
    s.amount = a; haptic(); renderAmount(true);
  };

  renderAmount(false); renderCats(false); renderMeta();

  $$('.seg button', body).forEach(b => b.addEventListener('click', () => {
    if (s.type === b.dataset.type) return;
    s.type = b.dataset.type;
    s.cat = editing && tx.type === s.type ? tx.cat : lastCat(s.type);
    seg.className = 'seg ' + s.type;
    $$('.seg button', body).forEach(x => x.classList.toggle('on', x === b));
    amtEl.classList.toggle('income', s.type === 'income');
    saveBtn.className = 'save ' + s.type;
    renderCats(true); renderMeta(); haptic();
  }));
  catsEl.addEventListener('click', e => {
    const b = e.target.closest('.cat'); if (!b) return;
    s.cat = b.dataset.cat;
    $$('.cat', catsEl).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    haptic();
  });
  const keypad = $('.keypad', body);
  let hold = 0;
  keypad.addEventListener('pointerdown', e => {
    const k = e.target.closest('.key'); if (!k) return;
    const r = k.getBoundingClientRect(), rip = document.createElement('span');
    rip.className = 'rip'; rip.style.left = (e.clientX - r.left - 5) + 'px'; rip.style.top = (e.clientY - r.top - 5) + 'px';
    k.appendChild(rip); setTimeout(() => rip.remove(), 600);
    if (k.dataset.k === 'del') hold = setTimeout(() => { hold = -1; if (s.amount) { s.amount = ''; renderAmount(true); haptic('heavy'); } }, 550);
  });
  const clearHold = () => { if (hold > 0) clearTimeout(hold); };
  keypad.addEventListener('pointerup', clearHold);
  keypad.addEventListener('pointercancel', clearHold);
  keypad.addEventListener('click', e => {
    const k = e.target.closest('.key'); if (!k) return;
    if (hold === -1) { hold = 0; return; }
    press(k.dataset.k);
  });
  noteIn.addEventListener('input', () => { s.note = noteIn.value; });
  noteIn.addEventListener('keydown', e => { if (e.key === 'Enter') noteIn.blur(); });
  const onDate = () => { if (dateIn.value) { s.date = dateIn.value; renderMeta(); } };
  dateIn.addEventListener('input', onDate); dateIn.addEventListener('change', onDate);
  accSel.addEventListener('change', () => { s.acc = accSel.value; renderMeta(); haptic(); });
  const delBtn = $('#a-del', body);
  if (delBtn) delBtn.addEventListener('click', () => { sh.close(); setTimeout(() => deleteTx(tx.id), 200); });

  saveBtn.addEventListener('click', () => {
    const amount = Math.round(parseFloat(s.amount) * 100) / 100;
    if (!amount || amount <= 0) return bad();
    const data = { type: s.type, amount, cat: s.cat, acc: s.acc, note: s.note.trim(), date: s.date };
    if (editing) Object.assign(tx, data);
    else state.tx.push(Object.assign({ id: uid(), ts: Date.now() }, data));
    state.lastAcc = s.acc;
    state.lastCat[s.type] = s.cat;
    persist();
    const r = saveBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, s.type);
    haptic('heavy');
    const d = parseYmd(s.date);
    if (mkey(d) !== mkey(ui.month)) ui.month = new Date(d.getFullYear(), d.getMonth(), 1);
    sh.close();
    refresh();
    toast(editing ? 'Changes saved' : s.type === 'expense' ? 'Expense saved' : 'Income saved', { icon: cat(s.cat).emoji });
  });
}

/* ---------- Settings ---------- */
function openSettings() {
  const curLabel = () => `${state.currency} ${curSymbol()}`;
  const body = el(`<div>
    <h2 class="sheet-title">Settings</h2>
    <p class="group-title">Profile</p>
    <div class="group">
      <label class="row static"><span class="lbl">Name</span><input type="text" id="s-name" value="${esc(state.name)}" placeholder="Your name" maxlength="24" autocomplete="given-name"></label>
      <label class="row"><span class="lbl">Currency</span><span class="val" id="s-cur">${esc(curLabel())}</span>${I.chevR.replace('<svg', '<svg class="chev"')}
        <select class="overlay-input" id="s-cursel" aria-label="Currency">${CURRENCIES.map(c => `<option value="${c.code}" ${c.code === state.currency ? 'selected' : ''}>${c.label} (${c.code})</option>`).join('')}</select></label>
    </div>
    <p class="group-title">Feel</p>
    <div class="group">
      <div class="row static"><span class="lbl">Haptic feedback<small>Light taps when you press buttons</small></span><button class="toggle" data-tg="haptics" aria-pressed="${state.haptics}" aria-label="Haptic feedback"></button></div>
      <div class="row static"><span class="lbl">Motion tilt<small>The card moves as you tilt your phone</small></span><button class="toggle" data-tg="tilt" aria-pressed="${state.tilt}" aria-label="Motion tilt"></button></div>
    </div>
    <p class="group-title">Your data</p>
    <div class="group">
      <button class="row" data-set="backup"><span class="ico">💾</span><span class="lbl">Back up data<small>Save a file you can restore later</small></span>${I.chevR.replace('<svg', '<svg class="chev"')}</button>
      <label class="row"><span class="ico">📥</span><span class="lbl">Restore from backup</span>${I.chevR.replace('<svg', '<svg class="chev"')}<input type="file" class="overlay-input" id="s-file" accept=".json,application/json"></label>
      <button class="row" data-set="csv"><span class="ico">📊</span><span class="lbl">Export spreadsheet<small>A CSV file that opens in Excel or Numbers</small></span>${I.chevR.replace('<svg', '<svg class="chev"')}</button>
    </div>
    <div class="group">
      <button class="row" data-set="demo"><span class="ico">🪐</span><span class="lbl">Load sample data</span>${I.chevR.replace('<svg', '<svg class="chev"')}</button>
      <button class="row danger" data-set="erase"><span class="ico" style="background:rgba(255,122,144,.15)">🗑️</span><span class="lbl">Erase all data</span></button>
    </div>
    <p class="fine">Orbit keeps everything on this iPhone. Nothing is uploaded.<br>Make a backup now and then so your history is safe.<br>Version ${VERSION}</p>
  </div>`);
  const sh = openSheet({ body, onClose: () => refresh() });
  const nameIn = $('#s-name', body);
  nameIn.addEventListener('input', () => { state.name = nameIn.value.slice(0, 24); persist(); });
  nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
  $('#s-cursel', body).addEventListener('change', e => { state.currency = e.target.value; persist(); $('#s-cur', body).textContent = curLabel(); haptic(); refresh(); });
  $$('[data-tg]', body).forEach(t => t.addEventListener('click', async () => {
    const k = t.dataset.tg, on = !state[k];
    if (k === 'tilt' && on) {
      const ok = await requestMotion();
      if (!ok) { toast('Motion access is off for this app', { icon: '📵' }); return; }
      startGyro();
    }
    if (k === 'tilt' && !on) stopGyro();
    state[k] = on; persist();
    t.setAttribute('aria-pressed', on);
    haptic();
  }));
  $('#s-file', body).addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const obj = JSON.parse(await f.text());
      const data = obj && obj.state ? obj.state : obj;
      if (!data || !Array.isArray(data.tx)) throw new Error('bad');
      const ok = await confirmDlg({ title: 'Restore this backup?', text: `It has ${data.tx.length} transactions and will replace what's on this phone now.`, ok: 'Restore' });
      if (!ok) return;
      state = normalize(Object.assign({}, data, { onboarded: true }));
      persist(); ui.prev = {};
      sh.close();
      toast('Backup restored', { icon: '📥' });
    } catch (err) {
      toast("That file isn't an Orbit backup", { icon: '⚠️' });
    }
  });
  body.addEventListener('click', async e => {
    const b = e.target.closest('[data-set]'); if (!b) return;
    const k = b.dataset.set;
    if (k === 'backup') {
      await shareFile(`orbit-backup-${ymd(new Date())}.json`, JSON.stringify({ app: 'orbit', version: 1, exported: new Date().toISOString(), state }, null, 2), 'application/json');
    } else if (k === 'csv') {
      const rows = [['Date', 'Type', 'Category', 'Amount', 'Currency', 'Paid with', 'Note']].concat(sortTx(state.tx).map(t => [t.date, t.type, cat(t.cat).name, t.amount, state.currency, acc(t.acc).name, t.note || '']));
      const csv = rows.map(r => r.map(x => { const v = String(x); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(',')).join('\n');
      await shareFile(`orbit-${ymd(new Date())}.csv`, csv, 'text/csv');
    } else if (k === 'demo') {
      if (state.tx.length && !(await confirmDlg({ title: 'Load sample data?', text: 'This replaces your transactions and budget with example data.', ok: 'Load sample' }))) return;
      loadDemo(); ui.prev = {};
      sh.close();
      toast('Sample data loaded', { icon: '🪐' });
    } else if (k === 'erase') {
      if (!(await confirmDlg({ title: 'Erase everything?', text: 'All transactions, budgets and settings will be deleted from this phone. This cannot be undone.', ok: 'Erase', danger: true }))) return;
      state = fresh(); persist(); ui.prev = {}; ui.firstPaint = true;
      sh.close();
      setTimeout(showOnboarding, 300);
    }
  });
}
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare && navigator.share) {
    try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; } }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ================= Toasts & dialogs ================= */
function toast(msg, { icon = '', action, onAction, ms = 2600 } = {}) {
  const root = $('#toasts');
  root.innerHTML = '';
  const t = el(`<div class="toast" role="status">${icon ? `<span class="t-ico">${icon}</span>` : ''}<span class="t-msg">${esc(msg)}</span>${action ? `<button class="t-act">${esc(action)}</button>` : ''}</div>`);
  root.append(t);
  const bye = () => { if (t.isConnected && !t.classList.contains('bye')) { t.classList.add('bye'); setTimeout(() => t.remove(), 420); } };
  if (action) $('.t-act', t).addEventListener('click', () => { if (onAction) onAction(); bye(); });
  setTimeout(bye, action ? 4500 : ms);
}
function confirmDlg({ title, text, ok = 'Confirm', danger = false }) {
  return new Promise(res => {
    const w = el(`<div class="dlg-wrap"><div class="dlg" role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="acts"><button class="btn ghost" data-r="0">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(ok)}</button></div></div></div>`);
    document.body.append(w);
    w.addEventListener('click', e => {
      const b = e.target.closest('[data-r]');
      if (!b && e.target !== w) return;
      w.classList.add('bye'); setTimeout(() => w.remove(), 200);
      res(b ? b.dataset.r === '1' : false);
    });
  });
}

/* ================= Confetti burst ================= */
const fx = $('#fx'), fctx = fx.getContext('2d');
let parts = [], fxRaf = 0;
function burst(x, y, type) {
  if (reduced) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = type === 'income' ? ['#4BE3B0', '#7CF5CF', '#EEF0FF', '#9D8CFF', '#FFC46B'] : ['#FF7A90', '#9D8CFF', '#EEF0FF', '#FFC46B', '#4BE3B0'];
  for (let i = 0; i < 80; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3, sp = 5 + Math.random() * 10;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2.5 + Math.random() * 4, c: cols[i % cols.length], life: 1, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5, sq: Math.random() > 0.45 });
  }
  if (!fxRaf) fxRaf = requestAnimationFrame(fxTick);
}
function fxTick() {
  fctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
  for (const p of parts) {
    p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.012;
    fctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
    fctx.fillStyle = p.c;
    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
    if (p.sq) fctx.fillRect(-p.r, -p.r / 2.5, p.r * 2, p.r / 1.25);
    else { fctx.beginPath(); fctx.arc(0, 0, p.r * 0.65, 0, Math.PI * 2); fctx.fill(); }
    fctx.restore();
  }
  fctx.globalAlpha = 1;
  fxRaf = parts.length ? requestAnimationFrame(fxTick) : 0;
  if (!parts.length) fctx.clearRect(0, 0, innerWidth, innerHeight);
}

/* ================= Navigation ================= */
const ORDER = ['home', 'activity', 'insights', 'budgets'];
function go(name) {
  if (name === ui.view) { const v = $('#v-' + name); render(name, false); v.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const from = $('#v-' + ui.view), to = $('#v-' + name);
  const dir = ORDER.indexOf(name) > ORDER.indexOf(ui.view) ? 'r' : 'l';
  ui.view = name;
  render(name, true);
  from.classList.remove('active', 'enter-l', 'enter-r');
  from.classList.add('out');
  setTimeout(() => from.classList.remove('out'), 320);
  to.classList.remove('enter-l', 'enter-r', 'out');
  to.scrollTop = 0;
  void to.offsetWidth;
  to.classList.add('active', 'enter-' + dir);
  updateTabs();
  haptic();
}
function updateTabs() {
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === ui.view));
  movePill();
}
function movePill() {
  const on = $('.tab.on'), pill = $('.tab-pill');
  if (!on || !pill) return;
  pill.style.transform = `translateX(${on.offsetLeft + on.offsetWidth / 2 - 29}px)`;
}
function shiftMonth(dir) {
  const next = new Date(ui.month.getFullYear(), ui.month.getMonth() + dir, 1);
  if (dir > 0 && next > new Date()) return;
  ui.month = next;
  ui.daySel = ui.calSel = ui.donutSel = null; ui.barSel = null;
  render(ui.view, true);
  const lab = $('#v-' + ui.view + ' .month-label');
  if (lab) lab.classList.add(dir < 0 ? 'slide-l' : 'slide-r');
  haptic();
}

document.addEventListener('click', e => {
  const t = e.target;
  if (!t.closest || t.closest('.sheet-wrap') || t.closest('.dlg-wrap')) return;
  const tab = t.closest('[data-tab]'); if (tab) return go(tab.dataset.tab);
  if (t.closest('#fab')) { haptic(); return openAdd(); }
  const m = t.closest('[data-m]'); if (m) return shiftMonth(+m.dataset.m);
  const g = t.closest('[data-go]'); if (g) return go(g.dataset.go);
  const fc = t.closest('[data-fcat]');
  if (fc) { ui.fcat = fc.dataset.fcat; ui.filter = 'all'; ui.q = ''; return go('activity'); }
  const f = t.closest('[data-filter]'); if (f) { ui.filter = f.dataset.filter; render('activity', false); haptic(); return; }
  if (t.closest('[data-clearcat]')) { ui.fcat = null; render('activity', false); haptic(); return; }
  const a = t.closest('[data-act]');
  if (a) {
    const k = a.dataset.act;
    if (k === 'add') return openAdd();
    if (k === 'settings') return openSettings();
    if (k === 'edit-budget') return openBudgetEditor();
    if (k === 'hide-install') {
      state.hideInstall = true; persist();
      const box = $('#install');
      if (box) { box.style.transition = 'opacity .3s, transform .3s'; box.style.opacity = '0'; box.style.transform = 'scale(.95)'; setTimeout(() => box.remove(), 300); }
      return;
    }
  }
  const day = t.closest('[data-day]'); if (day) return selectDay(+day.dataset.day);
  const c = t.closest('[data-cal]'); if (c) return selectCal(+c.dataset.cal);
  const main = t.closest('.tx-main');
  if (main && !main.dataset.swiped) { const tx = state.tx.find(x => x.id === main.parentElement.dataset.id); if (tx) openAdd(tx); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tx-main')) { e.preventDefault(); e.target.click(); }
});

/* ================= Sample data ================= */
function loadDemo() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const now = new Date(), tx = [];
  for (let off = 5; off >= 0; off--) {
    const first = new Date(now.getFullYear(), now.getMonth() - off, 1);
    const last = off === 0 ? now.getDate() : daysIn(first);
    const add = (day, type, c, amount, note, a = 'upi') => {
      if (day > last) return;
      tx.push({ id: uid(), type, cat: c, amount: Math.round(amount), note, acc: a, date: ymd(new Date(first.getFullYear(), first.getMonth(), day)), ts: first.getTime() + day * 864e5 + Math.floor(rnd() * 864e5) });
    };
    add(1, 'income', 'salary', 85000, 'Monthly salary', 'bank');
    add(2, 'expense', 'rent', 18000, 'House rent', 'bank');
    add(5, 'expense', 'bills', 1100 + rnd() * 900, 'Electricity bill');
    add(6, 'expense', 'bills', 799, 'Wi-Fi bill');
    add(7, 'expense', 'subs', 649, 'Netflix', 'card');
    add(7, 'expense', 'subs', 119, 'Spotify', 'card');
    add(10, 'expense', 'bills', 349, 'Phone recharge');
    if (rnd() > 0.45) add(12 + Math.floor(rnd() * 12), 'income', 'freelance', 6000 + rnd() * 14000, 'Freelance project', 'bank');
    if (rnd() > 0.7) add(3 + Math.floor(rnd() * 20), 'income', 'refund', 300 + rnd() * 1500, 'Amazon refund', 'card');
    if (rnd() > 0.55) add(14 + Math.floor(rnd() * 10), 'expense', 'travel', 2500 + rnd() * 6000, pick(['Train tickets', 'Weekend trip', 'Flight to Goa', 'Hotel stay']), 'card');
    if (rnd() > 0.6) add(4 + Math.floor(rnd() * 20), 'expense', 'edu', 499 + rnd() * 2500, pick(['Online course', 'Books', 'Udemy course']), 'card');
    for (let d = 1; d <= last; d++) {
      if (rnd() < 0.72) add(d, 'expense', 'food', 120 + rnd() * 480, pick(['Swiggy dinner', 'Zomato lunch', 'Chai and snacks', 'Cafe coffee', 'Office canteen', 'Dinner with friends']));
      if (rnd() < 0.45) add(d, 'expense', 'transport', 60 + rnd() * 340, pick(['Uber to office', 'Metro card top-up', 'Rapido', 'Auto ride', 'Petrol']));
      if (rnd() < 0.17) add(d, 'expense', 'groceries', 300 + rnd() * 1500, pick(['Blinkit order', 'Zepto groceries', 'BigBasket', 'Vegetables and fruit']));
      if (rnd() < 0.07) add(d, 'expense', 'shopping', 600 + rnd() * 3500, pick(['Myntra order', 'Amazon', 'New shoes', 'Decathlon']), 'card');
      if (rnd() < 0.06) add(d, 'expense', 'fun', 250 + rnd() * 900, pick(['Movie tickets', 'Bowling', 'Concert', 'Gaming']));
      if (rnd() < 0.03) add(d, 'expense', 'health', 200 + rnd() * 1200, pick(['Pharmacy', 'Doctor visit', 'Gym membership']));
      if (rnd() < 0.02) add(d, 'expense', 'gifts', 500 + rnd() * 2000, pick(['Birthday gift', 'Wedding gift']));
    }
  }
  state.tx = tx;
  state.budget = { total: 55000, cats: { food: 7000, transport: 3000, groceries: 4500, shopping: 4000, fun: 2000, subs: 1000, bills: 3500 } };
  persist();
}

/* ================= Onboarding ================= */
function showOnboarding() {
  const ob = el(`<div id="onboard">
    <div class="ob-orbit" aria-hidden="true">
      <div class="ob-ring r2"><i></i><b></b></div><div class="ob-ring r1"><i></i><b></b></div><div class="ob-ring r3"><i></i><b></b></div>
      <div class="ob-core" id="ob-sym">${esc(curSymbol())}</div>
    </div>
    <h1 class="ob-title">Orbit</h1>
    <p class="ob-sub">Log what you spend in a few taps and see where your money goes. Everything stays on this phone.</p>
    <div class="ob-form">
      <label class="ob-field"><input id="ob-name" placeholder="Your first name" autocomplete="given-name" maxlength="24" enterkeyhint="done" value="${esc(state.name)}"></label>
      <label class="ob-field"><span class="lbl">Currency</span><span class="val" id="ob-cur">${state.currency} ${esc(curSymbol())}</span>${I.chevD}
        <select class="overlay-input" id="ob-cursel" aria-label="Currency">${CURRENCIES.map(c => `<option value="${c.code}" ${c.code === state.currency ? 'selected' : ''}>${c.label} (${c.code})</option>`).join('')}</select></label>
      <button class="btn primary block" data-ob="start">Start tracking</button>
      <button class="btn ghost block" data-ob="demo">Explore with sample data</button>
    </div>
  </div>`);
  document.body.append(ob);
  const nameIn = $('#ob-name', ob);
  nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') nameIn.blur(); });
  $('#ob-cursel', ob).addEventListener('change', e => {
    state.currency = e.target.value;
    $('#ob-cur', ob).textContent = `${state.currency} ${curSymbol()}`;
    const core = $('#ob-sym', ob); core.textContent = curSymbol();
    core.animate([{ transform: 'scale(.6) rotateY(180deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    haptic();
  });
  ob.addEventListener('click', e => {
    const b = e.target.closest('[data-ob]'); if (!b) return;
    state.name = nameIn.value.trim().slice(0, 24);
    state.onboarded = true;
    if (b.dataset.ob === 'demo') loadDemo();
    persist();
    haptic('heavy');
    ui.firstPaint = true; ui.prev = {};
    ui.month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (ui.view !== 'home') {
      $('#v-' + ui.view).classList.remove('active', 'enter-l', 'enter-r');
      $('#v-home').classList.add('active');
      ui.view = 'home'; updateTabs();
    }
    ob.classList.add('bye');
    setTimeout(() => render('home', true), 200);
    setTimeout(() => ob.remove(), 700);
  });
}

/* ================= Boot ================= */
function registerSW() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  try { if (window.self !== window.top) return; } catch (e) { return; }
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
function boot() {
  if (state.tilt) startGyro();
  if (!state.onboarded) { render('home', false); showOnboarding(); }
  else render('home', true);
  updateTabs();
  requestAnimationFrame(movePill);
  setTimeout(movePill, 300);
  window.addEventListener('resize', () => { movePill(); });
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ignore */ }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const nowM = mkey(new Date());
    if (nowM !== ui.seenMonth) {
      if (mkey(ui.month) === ui.seenMonth) ui.month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      ui.seenMonth = nowM;
    }
    refresh();
  });
  registerSW();
}
boot();
})();
