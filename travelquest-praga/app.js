/* TravelQuest · Praga — app principal.
   Sin dependencias de compilación: HTML + JS. Datos compartidos en Supabase
   (tiempo real); sin configuración funciona en modo demo local. */
(() => {
'use strict';

const CFG = window.TQ_CONFIG || {};
const D = window.TQ_DATA;
const REMOTE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY && window.supabase);
const CACHE_KEY = REMOTE ? 'tq-cache' : 'tq-demo';
const TRIP_CODE = new URLSearchParams(location.search).get('c') || CFG.TRIP_CODE || '';

/* ---------------- Utilidades ---------------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
const round2 = n => Math.round(n * 100) / 100;
const eur = n => (Math.round(n * 100) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(round2(n)) ? 0 : 2, maximumFractionDigits: 2 });
const czk = n => Math.round(n).toLocaleString('es-ES') + ' Kč';
const $ = s => document.querySelector(s);
const nowIso = () => new Date().toISOString();

function pragueNow() {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const p = {}; f.formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}
const pragueDate = iso => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const dateLabel = d => { const dd = D.days.find(x => x.date === d); if (dd) return dd.label; return new Date(d + 'T12:00:00Z').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }); };

/* ---------------- Iconos ---------------- */
const IC = {
  plan: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  map: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4.5M16 6h3a3 3 0 0 1-3 4.5M12 13v4M8.5 21h7M10 17h4v4h-4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', chev: '<path d="m9 6 6 6-6 6"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>', back: '<path d="m15 6-6 6 6 6"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  nav: '<path d="M3 11 21 3l-8 18-2-8z"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  sunrise: '<path d="M4 18h16M7 14a5 5 0 0 1 10 0M12 4v3M4.9 8.9l1.4 1.4M19.1 8.9l-1.4 1.4M2 14h2M20 14h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  food: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17.5 21V3c-2 .8-3.5 3-3.5 6.5V13h3.5"/>',
  beer: '<path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 4"/>',
  plane: '<path d="M21 15.5v-2L13.5 9V4.5a1.5 1.5 0 0 0-3 0V9L3 13.5v2l7.5-2.3V18l-2 1.5V21l3.5-1 3.5 1v-1.5l-2-1.5v-4.8z"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="m9.5 21 2.2-6.2 2.8 2.7V21M8 11.5 11 8.5l3 2.5 3 1M11 8.5 10 14"/>',
  boat: '<path d="M3 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0M5 14l-1-4h16l-1 4M8 10V6h6l2 4M12 6V3"/>',
  castle: '<path d="M4 21V9h3V6h2v3h2V4h2v5h2V6h2v3h3v12zM10 21v-4a2 2 0 0 1 4 0v4"/>',
  tower: '<path d="M12 2v3M9.5 21 12 5l2.5 16M7 21h10M10 13h4M9 17h6"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
  tram: '<rect x="6" y="4" width="12" height="13" rx="3"/><path d="M6 11h12M9 17l-2 4M15 17l2 4M10 2h4"/>',
  ticket: '<path d="M3 8V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V8a2.5 2.5 0 0 0 0 5v4.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V13a2.5 2.5 0 0 0 0-5z"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>', dots: '<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', spark: '<path d="M12 3.5 13.7 9 19 10.5 13.7 12 12 17.5 10.3 12 5 10.5 10.3 9z"/>',
  flame: '<path fill="currentColor" stroke="none" d="M12 2.5c.8 3.4 5.5 5.6 5.5 10.6a5.5 5.5 0 0 1-11 0c0-2.3 1.1-3.9 2.3-5 .1 2 1 3.2 2.2 3.4-.4-3.2.3-6.2 1-9z"/>',
  locate: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'
};
const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

const SLOTS = [['manana', 'Mañana', 'sunrise'], ['tarde', 'Tarde', 'sun'], ['noche', 'Noche', 'moon'], ['comer', 'Dónde comer', 'food']];
const CATS = {
  comida: ['Comida', 'food', 't-orange'], bebida: ['Bebida', 'beer', 't-violet'], transporte: ['Transporte', 'tram', 't-blue'],
  entradas: ['Entradas', 'ticket', 't-coral'], alojamiento: ['Alojamiento', 'bed', 't-violet'], compras: ['Compras', 'bag', 't-green'], otros: ['Otros', 'dots', 't-gray']
};

/* ---------------- Estado y datos ---------------- */
const db = { trip: null, members: [], activities: [], expenses: [], payments: [], quiz_answers: [], challenges_done: [] };
let me = null, tripId = null, status = REMOTE ? 'connecting' : 'demo';
let outbox = REMOTE ? LS.get('tq-outbox', []) : [];
const ui = { tab: 'plan', day: null, mapDay: 0, focus: null, sheet: null, quiz: null, testMode: LS.get('tq-test', false), installDismissed: LS.get('tq-install-off', false) };
const KEYS = { activities: ['id'], expenses: ['id'], payments: ['id'], members: ['id'], quiz_answers: ['member_id', 'quiz_id', 'q'], challenges_done: ['member_id', 'challenge_id'] };
const keyOf = (t, r) => KEYS[t].map(k => r[k]).join('|');

function applyOp(op) {
  if (op.table === 'trips') { if (op.op === 'upsert') db.trip = { ...db.trip, ...op.row }; return; }
  const arr = db[op.table];
  if (op.op === 'upsert') {
    const k = keyOf(op.table, op.row), i = arr.findIndex(r => keyOf(op.table, r) === k);
    if (i >= 0) arr[i] = { ...arr[i], ...op.row }; else arr.push(op.row);
  } else {
    db[op.table] = arr.filter(r => !Object.entries(op.match).every(([k, v]) => r[k] === v));
  }
}
const saveCache = () => LS.set(CACHE_KEY, { db, me, tripId });
const member = id => db.members.find(m => m.id === id) || { id, name: '?', color: '#888' };
const myName = () => member(me).name;

/* ---------------- Supabase ---------------- */
let sb = null, chan = null, flushing = false, refreshTimer = null;
if (REMOTE) sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
const isNet = e => !navigator.onLine || /fetch|network|load failed|timeout/i.test((e && (e.message || e.details)) || '');

async function refresh() {
  if (!REMOTE || !tripId) return;
  const T = ['members', 'activities', 'expenses', 'payments', 'quiz_answers', 'challenges_done'];
  const res = await Promise.all([sb.from('trips').select('*').eq('id', tripId).single(), ...T.map(t => sb.from(t).select('*').eq('trip_id', tripId))]);
  const bad = res.find(r => r.error);
  if (bad) throw bad.error;
  db.trip = res[0].data;
  T.forEach((t, i) => { db[t] = res[i + 1].data || []; });
  outbox.forEach(applyOp);
  if (!db.activities.length && !LS.get('tq-seeded-' + tripId, false)) await seed();
  saveCache();
  if (!outbox.length) setStatus('live');
  render();
}
async function seed() {
  const rows = D.activities.map(a => ({ ...a, trip_id: tripId, updated_by: null, updated_at: nowIso() }));
  if (REMOTE) {
    const r = await sb.from('activities').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (r.error) throw r.error;
    LS.set('tq-seeded-' + tripId, true);
  }
  db.activities = rows;
}
function subscribe() {
  if (!REMOTE || chan) return;
  chan = sb.channel('trip-' + tripId)
    .on('postgres_changes', { event: '*', schema: 'public' }, onRemote)
    .subscribe(s => {
      if (s === 'SUBSCRIBED') { if (!outbox.length) setStatus('live'); }
      else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') setStatus('offline');
    });
}
function onRemote(p) {
  const n = p.new || {};
  if (n.trip_id && n.trip_id !== tripId) return;
  if (p.table === 'members' && p.eventType === 'INSERT' && n.id !== me) toast(`${n.name} se ha unido al viaje`);
  const who = n.updated_by || n.created_by || (p.table === 'challenges_done' ? n.member_id : null);
  if (who && who !== me && p.eventType !== 'DELETE') {
    const name = member(who).name;
    let msg = null;
    if (p.table === 'activities') msg = p.eventType === 'INSERT' ? `${name} ha añadido «${n.title}»` : `${name} ha cambiado «${n.title}»`;
    else if (p.table === 'expenses' && p.eventType === 'INSERT') msg = `${name} ha apuntado: ${n.description} (${eur(+n.amount_eur)})`;
    else if (p.table === 'payments' && p.eventType === 'INSERT') msg = `${member(n.from_member).name} ha pagado ${eur(+n.amount_eur)} a ${member(n.to_member).name}`;
    else if (p.table === 'challenges_done' && p.eventType === 'INSERT') { const c = D.challenges.find(x => x.id === n.challenge_id); msg = `${name} ha completado el reto «${c ? c.title : ''}»`; }
    if (msg) toast(msg);
  }
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => refresh().catch(() => setStatus('offline')), 350);
}
async function flush() {
  if (!REMOTE || flushing || !tripId) return;
  flushing = true;
  try {
    while (outbox.length) {
      const op = outbox[0];
      let r;
      try {
        if (op.table === 'trips') r = await sb.from('trips').update(op.row).eq('id', op.row.id);
        else if (op.op === 'upsert') {
          const oc = { quiz_answers: 'member_id,quiz_id,q', challenges_done: 'member_id,challenge_id' }[op.table];
          r = await sb.from(op.table).upsert(op.row, oc ? { onConflict: oc } : undefined);
        } else r = await sb.from(op.table).delete().match(op.match);
      } catch (e) { r = { error: e }; }
      if (r.error) {
        if (isNet(r.error)) { setStatus('offline'); break; }
        console.error(r.error);
        toast('No se pudo guardar un cambio: ' + (r.error.message || 'error'));
      }
      outbox.shift();
      LS.set('tq-outbox', outbox);
    }
    if (!outbox.length && navigator.onLine && status === 'offline' && chan) setStatus('live');
  } finally { flushing = false; }
}
function write(op) {
  applyOp(op); saveCache(); render();
  if (REMOTE) { outbox.push(op); LS.set('tq-outbox', outbox); flush(); }
}
const put = (table, row) => write({ op: 'upsert', table, row });
const del = (table, match) => write({ op: 'delete', table, match });

function setStatus(s) {
  if (!REMOTE) s = 'demo';
  status = s;
  const el = $('#sync');
  if (el) el.outerHTML = syncPill();
}
const syncPill = () => {
  const pend = outbox.length;
  if (status === 'demo') return '<span class="sync demo" id="sync"><i></i>Demo</span>';
  if (status === 'live') return '<span class="sync" id="sync"><i></i>En vivo</span>';
  if (status === 'connecting') return '<span class="sync off" id="sync"><i></i>Conectando</span>';
  return `<span class="sync off" id="sync"><i></i>Sin conexión${pend ? ' · ' + pend : ''}</span>`;
};

/* ---------------- Arranque y unirse ---------------- */
const app = $('#app');
async function boot() {
  const c = LS.get(CACHE_KEY);
  if (c && c.me) { Object.assign(db, c.db); me = c.me; tripId = c.tripId; showApp(); }
  if (!REMOTE) { if (!c || !c.me) showJoin(); return; }
  let session = null;
  try { session = (await sb.auth.getSession()).data.session; } catch (e) {}
  if (!session) { if (!c || !c.me) showJoin(); return; }
  try {
    const { data, error } = await sb.from('member_devices').select('trip_id,member_id').eq('user_id', session.user.id);
    if (error) throw error;
    if (!data.length) { LS.del(CACHE_KEY); me = null; showJoin(); return; }
    const first = !me;
    tripId = data[0].trip_id; me = data[0].member_id;
    if (first) showApp();
    await refresh(); subscribe(); flush();
  } catch (e) {
    if (!me) showJoin(isNet(e) ? 'Sin conexión. Conéctate a internet para entrar la primera vez.' : 'Error: ' + (e.message || e));
    else setStatus('offline');
  }
}

async function showJoin(err) {
  app.innerHTML = `<div class="join">
    <div class="tile t-coral" style="width:64px;height:64px;border-radius:20px">${ic('castle', 34)}</div>
    <h1>Nuestro viaje a Praga</h1>
    <p class="lead">27 de octubre – 1 de noviembre. Plan, mapa, gastos y quiz, compartidos con todo el grupo.</p>
    ${TRIP_CODE ? '' : '<div class="lbl">Código del viaje</div><input class="field" id="jcode" placeholder="PRAGA-XXXXXX" autocomplete="off" style="text-transform:uppercase">'}
    <div id="jnames"></div>
    <div class="lbl">¿Cómo te llamas?</div>
    <input class="field" id="jname" maxlength="30" placeholder="Tu nombre" autocomplete="given-name">
    <div class="err" id="jerr">${err ? esc(err) : ''}</div>
    <div style="flex:1;min-height:24px"></div>
    <button class="btn btn-primary btn-block" data-a="join">Entrar al viaje</button>
    ${REMOTE ? '' : '<p class="note2">Modo demo: los datos se guardan solo en este dispositivo. Configura Supabase en config.js para compartirlo con el grupo.</p>'}
  </div>`;
  if (REMOTE && TRIP_CODE) {
    try {
      const { data } = await sb.rpc('trip_member_names', { p_code: TRIP_CODE });
      if (data && data.length) $('#jnames').innerHTML = `<div class="lbl">¿Ya entraste en otro móvil? Toca tu nombre</div><div class="chips wrap">${data.map(m => `<button class="chip" data-a="pickName" data-n="${esc(m.name)}"><span class="av sm" style="background:${esc(m.color)}">${esc(m.name[0])}</span>${esc(m.name)}</button>`).join('')}</div>`;
    } catch (e) {}
  }
}
async function doJoin() {
  const name = ($('#jname').value || '').trim();
  const code = TRIP_CODE || ($('#jcode') ? $('#jcode').value.trim() : '');
  const errEl = $('#jerr');
  if (!name) { errEl.textContent = 'Escribe tu nombre.'; return; }
  if (!REMOTE) { demoJoin(name); return; }
  if (!code) { errEl.textContent = 'Escribe el código del viaje.'; return; }
  const btn = document.querySelector('[data-a="join"]'); btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    if (!(await sb.auth.getSession()).data.session) {
      const r = await sb.auth.signInAnonymously();
      if (r.error) throw r.error;
    }
    const r = await sb.rpc('join_trip', { p_code: code, p_name: name });
    if (r.error) throw r.error;
    tripId = r.data.trip_id; me = r.data.member_id;
    await refresh(); showApp(); subscribe(); flush();
    toast(`¡Hola, ${name}!`);
  } catch (e) {
    const m = (e && e.message) || String(e);
    errEl.textContent = /bad_code/.test(m) ? 'El código del viaje no es correcto.'
      : /anonymous/i.test(m) ? 'Falta activar «Allow anonymous sign-ins» en Supabase (ver README).'
      : isNet(e) ? 'Sin conexión. Inténtalo con internet.' : 'No se pudo entrar: ' + m;
    btn.disabled = false; btn.textContent = 'Entrar al viaje';
  }
}
function demoJoin(name) {
  tripId = 'demo';
  db.trip = { id: 'demo', name: 'Praga', start_date: D.trip.start, end_date: D.trip.end, join_code: 'DEMO', eur_czk: 24.36 };
  const pal = ['#FF5A4E', '#2B59FF', '#13A89E', '#A560F8'];
  const names = [name, ...['Ana', 'Diego', 'Marta'].filter(n => n.toLowerCase() !== name.toLowerCase())].slice(0, 4);
  db.members = names.map((n, i) => ({ id: uuid(), trip_id: 'demo', name: n, color: pal[i] }));
  me = db.members[0].id;
  db.activities = D.activities.map(a => ({ ...a, trip_id: 'demo', updated_by: null }));
  const all = db.members.map(m => m.id);
  db.expenses = [
    { id: uuid(), trip_id: 'demo', description: 'Hotel Caruso (5 noches)', amount: 780, currency: 'EUR', amount_eur: 780, payer: db.members[1].id, participants: all, category: 'alojamiento', spent_at: '2026-09-20T10:00:00Z', created_by: db.members[1].id },
    { id: uuid(), trip_id: 'demo', description: 'Crucero por el Moldava', amount: 1960, currency: 'CZK', amount_eur: round2(1960 / 24.36), payer: me, participants: all, category: 'entradas', spent_at: '2026-10-10T10:00:00Z', created_by: me }
  ];
  db.payments = []; db.quiz_answers = []; db.challenges_done = [];
  saveCache(); showApp();
}

/* ---------------- Lógica de viaje ---------------- */
function todayIndex() { const t = pragueNow().date; return D.days.findIndex(d => d.date === t); }
function quizUnlocked(q) { if (ui.testMode || !q.day) return true; const n = pragueNow(); return n.date > q.day || (n.date === q.day && n.time >= '18:00'); }
function challengeUnlocked(c) { return ui.testMode || pragueNow().date >= c.day; }
const myAnswers = qid => db.quiz_answers.filter(a => a.member_id === me && a.quiz_id === qid);
function pendingQuiz() {
  const avail = D.quizzes.filter(q => quizUnlocked(q) && myAnswers(q.id).length < q.qs.length);
  return avail.sort((a, b) => (b.day || '').localeCompare(a.day || ''))[0] || null;
}
function scores() {
  const s = {}; db.members.forEach(m => { s[m.id] = { q: 0, c: 0, pts: 0 }; });
  db.quiz_answers.forEach(a => { if (s[a.member_id] && a.correct) { s[a.member_id].q++; s[a.member_id].pts += 10; } });
  db.challenges_done.forEach(c => { const ch = D.challenges.find(x => x.id === c.challenge_id); if (s[c.member_id] && ch) { s[c.member_id].c++; s[c.member_id].pts += ch.pts; } });
  return s;
}
function balances() {
  // Todo en céntimos para que las cuentas cuadren exactas.
  const net = {}; db.members.forEach(m => { net[m.id] = 0; });
  db.expenses.forEach(e => {
    const parts = (e.participants || []).filter(p => p in net).slice().sort();
    if (!parts.length || !(e.payer in net)) return;
    const cents = Math.round(+e.amount_eur * 100);
    net[e.payer] += cents;
    const base = Math.floor(cents / parts.length), extra = cents - base * parts.length;
    parts.forEach((p, i) => { net[p] -= base + (i < extra ? 1 : 0); });
  });
  db.payments.forEach(p => { if (p.from_member in net && p.to_member in net) { const c = Math.round(+p.amount_eur * 100); net[p.from_member] += c; net[p.to_member] -= c; } });
  Object.keys(net).forEach(k => { net[k] = net[k] / 100; });
  return net;
}
function transfers(net) {
  const deb = [], cre = [];
  Object.entries(net).forEach(([k, v]) => { const c = Math.round(v * 100); if (c < 0) deb.push([k, -c]); else if (c > 0) cre.push([k, c]); });
  deb.sort((a, b) => b[1] - a[1]); cre.sort((a, b) => b[1] - a[1]);
  const out = []; let i = 0, j = 0;
  while (i < deb.length && j < cre.length) {
    const a = Math.min(deb[i][1], cre[j][1]);
    out.push({ from: deb[i][0], to: cre[j][0], amt: a / 100 });
    deb[i][1] -= a; cre[j][1] -= a;
    if (!deb[i][1]) i++; if (!cre[j][1]) j++;
  }
  return out;
}
const rate = () => +(db.trip && db.trip.eur_czk) || 24.36;
const gmapsDir = (lat, lng, q) => lat != null ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}&travelmode=walking`;
const gmapsSearch = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* ---------------- Shell ---------------- */
const TABS = [['plan', 'Plan', 'plan'], ['mapa', 'Mapa', 'map'], ['gastos', 'Gastos', 'wallet'], ['quiz', 'Quiz', 'trophy']];
function showApp() {
  if (ui.day == null) { const t = todayIndex(); ui.day = t >= 0 ? t : 0; }
  app.innerHTML = `<header class="topbar"><h1 id="title">Praga</h1><span id="syncwrap">${syncPill()}</span><button class="iconbtn" data-a="settings" aria-label="Ajustes" id="mebtn"></button></header>
    <main class="screen" id="screen"></main>
    <button class="fab" id="fab" hidden></button>
    <nav class="tabbar" id="tabbar" aria-label="Secciones"></nav>
    <div class="scrim" id="scrim" data-a="closeSheet"></div>
    <section class="sheet" id="sheet" role="dialog" aria-modal="true"></section>
    <section class="ov" id="ov" role="dialog" aria-modal="true"></section>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  render(true);
}
let mapObj = null;
function render(resetScroll) {
  const scr = $('#screen'); if (!scr || !me) return;
  const top = scr.scrollTop;
  const m = member(me);
  $('#mebtn').innerHTML = `<span class="av" style="background:${esc(m.color)}">${esc((m.name || '?')[0])}</span>`;
  $('#tabbar').innerHTML = TABS.map(([k, l, i]) => `<button class="tab ${ui.tab === k ? 'on' : ''}" data-a="tab" data-t="${k}" ${ui.tab === k ? 'aria-current="page"' : ''}>${ic(i, 24)}${l}${k === 'quiz' && pendingQuiz() ? '<span class="nb"></span>' : ''}</button>`).join('');
  const fab = $('#fab');
  fab.hidden = ui.tab !== 'gastos';
  if (!fab.hidden) { fab.dataset.a = 'newExpense'; fab.setAttribute('aria-label', 'Añadir gasto'); fab.innerHTML = ic('plus', 28); }
  if (ui.tab !== 'mapa' && mapObj) { mapObj.remove(); mapObj = null; scr.classList.remove('map-mode'); }
  if (ui.tab === 'mapa') { $('#title').textContent = 'Mapa'; renderMap(); return; }
  const fn = { plan: scrPlan, gastos: scrGastos, quiz: scrQuiz }[ui.tab];
  $('#title').textContent = { plan: 'Praga', gastos: 'Gastos', quiz: 'Quiz y retos' }[ui.tab];
  scr.innerHTML = fn();
  scr.scrollTop = resetScroll ? 0 : top;
}

/* ---------------- Plan ---------------- */
function heroHtml() {
  const n = pragueNow(), ti = todayIndex();
  let big, sub;
  const until = daysBetween(n.date, D.trip.start);
  if (ti >= 0) { big = `Día ${ti + 1} de ${D.days.length}`; sub = D.days[ti].theme; }
  else if (until > 1) { big = `Faltan ${until} días`; sub = '27 de octubre – 1 de noviembre'; }
  else if (until === 1) { big = '¡Mañana nos vamos!'; sub = 'Revisa el plan y carga el móvil'; }
  else { big = '¡Qué viaje!'; sub = 'Repasad los gastos y el ranking final'; }
  return `<div class="hero"><svg class="sky" viewBox="0 0 230 120" fill="#fff" aria-hidden="true"><path d="M0 120V92h14V70l8-14 8 14v22h12V60l10-22 10 22v32h10V78h18V52l6-12 6 12v26h16V30l8-20 8 20v62h12V66l7-10 7 10v26h16V80l9-16 9 16v40z"/></svg>
    <div class="big">${big}</div><p>${esc(sub)} · ${esc(D.hotel.name)}</p>
    <div class="avs">${db.members.map(mm => `<span class="av sm" style="background:${esc(mm.color)}" title="${esc(mm.name)}">${esc(mm.name[0])}</span>`).join('')}</div></div>`;
}
function sortActs(list) { return list.slice().sort((a, b) => (a.position || 0) - (b.position || 0) || String(a.id).localeCompare(String(b.id))); }
function actCard(a, d) {
  const by = a.updated_by && db.members.some(m => m.id === a.updated_by) ? `<div class="by"><span class="av sm" style="background:${esc(member(a.updated_by).color)}">${esc(member(a.updated_by).name[0])}</span>Editado por ${esc(member(a.updated_by).name)}</div>` : '';
  const note = a.note && a.slot !== 'comer' ? `<div class="note">${ic('info', 16)}<span>${esc(a.note)}</span></div>` : '';
  if (a.slot === 'comer') {
    const tierCls = a.tier === '€€' ? 'mid' : a.tier === '€€€' ? 'hi' : '';
    const q = a.title + ' ' + (a.address || 'Praga');
    return `<article class="card act resto"><div class="act-top"><div class="grow">
      <h3>${esc(a.title)}</h3>${a.tier ? `<span class="tier ${tierCls}">${esc(a.tier)} · ${a.tier === '€' ? 'Económico' : a.tier === '€€' ? 'Precio medio' : 'Especial'}</span>` : ''}
      ${a.note ? `<p class="desc">${esc(a.note)}</p>` : ''}${a.price ? `<p class="price">${esc(a.price)}</p>` : ''}${a.address ? `<small>${esc(a.address)}</small>` : ''}</div>
      <button class="editbtn" data-a="editAct" data-id="${a.id}" aria-label="Editar">${ic('edit', 18)}</button></div>
      <div class="actions-row"><a class="btn btn-primary btn-sm" href="${gmapsDir(null, null, q)}" target="_blank" rel="noopener">${ic('nav', 16)}Cómo llegar</a>
      ${a.lat != null ? `<button class="btn btn-secondary btn-sm" data-a="focus" data-lat="${a.lat}" data-lng="${a.lng}" data-n="${esc(a.title)}">${ic('pin', 16)}Ver en el mapa</button>` : ''}</div>${by}</article>`;
  }
  const items = (a.items || []).map(it => it.lat != null
    ? `<li><button class="it" data-a="focus" data-lat="${it.lat}" data-lng="${it.lng}" data-n="${esc(it.t)}">${esc(it.t)}<span class="pinb">${ic('pin', 16)}</span></button></li>`
    : `<li><span class="it">${esc(it.t)}</span></li>`).join('');
  return `<article class="card act"><div class="act-top"><div class="grow">${a.time ? `<span class="timepill">${esc(a.time)}</span>` : ''}<h3>${esc(a.title)}</h3></div>
    <button class="editbtn" data-a="editAct" data-id="${a.id}" aria-label="Editar">${ic('edit', 18)}</button></div>
    ${items ? `<ul class="items">${items}</ul>` : ''}${note}${by}</article>`;
}
function scrPlan() {
  const d = D.days[ui.day], ti = todayIndex();
  const pq = pendingQuiz();
  const banner = pq ? `<button class="banner" data-a="quiz" data-id="${pq.id}"><span class="tile t-green">${ic('trophy')}</span><span class="grow"><b>${pq.day ? 'Quiz del día disponible' : 'Quiz de calentamiento'}</b><small>${esc(pq.title)} · ${pq.qs.length} preguntas</small></span>${ic('chev', 18)}</button>` : '';
  const install = !isStandalone() && !ui.installDismissed ? `<button class="banner violet" data-a="install"><span class="tile t-violet">${ic('phone')}</span><span class="grow"><b>Instálala en tu móvil</b><small>Como una app, y funciona sin conexión</small></span>${ic('chev', 18)}</button>` : '';
  const chips = `<div class="chips" style="margin-top:16px">${D.days.map((x, i) => `<button class="chip daychip ${i === ui.day ? 'on' : ''}" style="--dc:${x.color}" data-a="day" data-i="${i}"><b>${esc(x.short)}</b><span class="${i === ti ? 'today' : ''}">${i === ti ? 'Hoy' : esc(x.tag)}</span></button>`).join('')}</div>`;
  const acts = db.activities.filter(a => a.day === d.date);
  const slots = SLOTS.map(([k, l, i]) => {
    const list = sortActs(acts.filter(a => a.slot === k));
    return `<section class="slot"><div class="slot-h">${ic(i, 18)}${l}<span class="line"></span><button data-a="newAct" data-slot="${k}" aria-label="Añadir en ${l}">${ic('plus', 18)}</button></div>
      ${list.length ? list.map(a => actCard(a, d)).join('') : `<button class="empty-slot" data-a="newAct" data-slot="${k}">${ic('plus', 18)}${k === 'comer' ? 'Añadir restaurante' : 'Añadir plan'}</button>`}</section>`;
  }).join('');
  const hotel = `<section class="info"><h2 class="sec" style="margin-top:0">Hotel</h2><div class="card"><div class="act-top"><span class="tile t-gray">${ic('bed')}</span><div class="grow"><b>${esc(D.hotel.name)}</b><br><small>${esc(D.hotel.address)} · ${esc(D.hotel.note)}</small></div></div>
    <div class="actions-row"><a class="btn btn-secondary btn-sm" href="${gmapsDir(D.hotel.lat, D.hotel.lng)}" target="_blank" rel="noopener">${ic('nav', 16)}Volver al hotel</a></div></div>
    <h2 class="sec">Precios orientativos</h2><div class="card">${D.tips.map(([k, v]) => `<div class="tr"><span class="grow">${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div></section>`;
  return `${heroHtml()}${banner}${install}${chips}<div style="--dc:${d.color}"><div class="dayhead"><span class="dot">${ic(d.icon, 24)}</span><div><h2>${esc(d.label)}</h2><small>${esc(d.theme)}</small></div></div>${slots}</div>${hotel}
    <p class="note2">${REMOTE ? 'Los cambios se comparten al momento con el grupo.' : 'Modo demo: los cambios solo se guardan en este dispositivo.'}</p>`;
}

function actForm(a, isNew) {
  const f = ui.sheet.f;
  const isFood = f.slot === 'comer';
  return `<h2>${isNew ? (isFood ? 'Nuevo restaurante' : 'Nuevo plan') : 'Editar'}</h2>
    <div class="lbl">Día</div><select class="field" id="fday">${D.days.map(d => `<option value="${d.date}" ${d.date === f.day ? 'selected' : ''}>${esc(d.label)} · ${esc(d.theme)}</option>`).join('')}</select>
    <div class="lbl">Momento</div><div class="seg">${SLOTS.map(([k, l]) => `<button class="${f.slot === k ? 'on' : ''}" data-a="fslot" data-v="${k}">${k === 'comer' ? 'Comer' : l}</button>`).join('')}</div>
    <div class="lbl">${isFood ? 'Nombre del sitio' : 'Título'}</div><input class="field" id="ftitle" value="${esc(f.title)}" placeholder="${isFood ? 'Lokál Dlouhááá' : 'Castillo de Praga'}">
    ${isFood ? `
      <div class="lbl">Descripción</div><input class="field" id="fnote" value="${esc(f.note)}" placeholder="Comida checa tradicional">
      <div class="lbl">Precio</div><div class="seg">${['€', '€€', '€€€'].map(t => `<button class="${f.tier === t ? 'on' : ''}" data-a="ftier" data-v="${t}">${t}</button>`).join('')}</div>
      <input class="field" id="fprice" style="margin-top:8px" value="${esc(f.price)}" placeholder="Platos 9–15 € · Para 2: 25–35 €">
      <div class="lbl">Dirección</div><input class="field" id="faddr" value="${esc(f.address)}" placeholder="Dlouhá 33, Praha 1">
      <div class="lbl">Ubicación en el mapa</div>
      <div class="locbox">${ic('pin', 18)}<span class="grow">${f.lat != null ? 'Fijada en el mapa' : 'Sin ubicación'}</span>${f.lat != null ? `<button class="btn btn-ghost btn-sm" data-a="locClear">Quitar</button>` : ''}</div>
      <div class="actions-row"><button class="btn btn-secondary btn-sm" data-a="locSearch">${ic('search', 16)}Buscar por nombre o dirección</button><button class="btn btn-secondary btn-sm" data-a="locHere">${ic('locate', 16)}Estoy aquí</button></div>
      <div class="results" id="locres"></div>`
    : `
      <div class="lbl">Hora (opcional)</div><input class="field" id="ftime" value="${esc(f.time)}" placeholder="9:00–13:00">
      <div class="lbl">Qué haremos (una cosa por línea)</div><textarea class="field" id="fitems" placeholder="Catedral de San Vito&#10;Callejón del Oro">${esc(f.itemsText)}</textarea>
      <div class="lbl">Nota (opcional)</div><input class="field" id="fnote" value="${esc(f.note)}" placeholder="Llevad las entradas impresas">`}
    <div class="actions"><button class="btn btn-primary" data-a="saveAct">Guardar</button>${isNew ? '' : `<button class="btn btn-danger" data-a="delAct">${ic('trash', 18)}Eliminar</button>`}</div>`;
}
function readActForm() {
  const f = ui.sheet.f, g = id => $('#' + id);
  if (g('fday')) f.day = g('fday').value;
  ['title', 'note', 'price', 'time'].forEach(k => { if (g('f' + k)) f[k] = g('f' + k).value; });
  if (g('faddr')) f.address = g('faddr').value;
  if (g('fitems')) f.itemsText = g('fitems').value;
}
function openActForm(a, slot) {
  const isNew = !a;
  a = a || { id: uuid(), day: D.days[ui.day].date, slot, title: '', items: [], time: '', note: '', price: '', tier: '', address: '', lat: null, lng: null };
  ui.sheet = { kind: 'act', isNew, orig: a, f: { ...a, time: a.time || '', note: a.note || '', price: a.price || '', address: a.address || '', tier: a.tier || '', itemsText: (a.items || []).map(i => i.t).join('\n') } };
  openSheet(actForm(a, isNew));
}
const redrawSheet = () => { const s = $('#sheet'), top = s.scrollTop; s.innerHTML = '<div class="grab"></div>' + (ui.sheet.kind === 'act' ? actForm(ui.sheet.orig, ui.sheet.isNew) : expForm()); s.scrollTop = top; };
function saveAct() {
  readActForm();
  const f = ui.sheet.f, o = ui.sheet.orig;
  if (!f.title.trim()) { toast('Ponle un título'); return; }
  const old = {}; (o.items || []).forEach(i => { old[i.t.trim().toLowerCase()] = i; });
  const items = f.slot === 'comer' ? [] : f.itemsText.split('\n').map(s => s.trim()).filter(Boolean).map(t => { const p = old[t.toLowerCase()]; return p && p.lat != null ? { t, lat: p.lat, lng: p.lng } : { t }; });
  const sameSlot = db.activities.filter(x => x.day === f.day && x.slot === f.slot && x.id !== o.id);
  const position = ui.sheet.isNew || o.day !== f.day || o.slot !== f.slot ? sameSlot.reduce((m, x) => Math.max(m, x.position || 0), 0) + 1 : (o.position || 0);
  const row = { id: o.id, trip_id: tripId, day: f.day, slot: f.slot, position, title: f.title.trim(), time: f.slot === 'comer' ? null : (f.time.trim() || null), items, note: f.note.trim() || null,
    price: f.slot === 'comer' ? (f.price.trim() || null) : null, tier: f.slot === 'comer' ? (f.tier || null) : null, address: f.slot === 'comer' ? (f.address.trim() || null) : null,
    lat: f.slot === 'comer' ? f.lat : null, lng: f.slot === 'comer' ? f.lng : null, updated_by: me, updated_at: nowIso() };
  closeSheet(); put('activities', row); toast(ui.sheet && ui.sheet.isNew ? 'Añadido al plan' : 'Guardado');
  const di = D.days.findIndex(d => d.date === f.day); if (di >= 0 && di !== ui.day) { ui.day = di; render(); }
}
async function locSearch() {
  readActForm();
  const f = ui.sheet.f, q = [f.title, f.address].filter(Boolean).join(', ');
  const box = $('#locres');
  if (!q.trim()) { toast('Escribe el nombre o la dirección'); return; }
  box.innerHTML = '<small>Buscando…</small>';
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=es&countrycodes=cz&viewbox=14.22,50.18,14.71,49.94&bounded=1&q=${encodeURIComponent(q)}`);
    let list = await r.json();
    if (!list.length && f.address) list = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=es&countrycodes=cz&viewbox=14.22,50.18,14.71,49.94&bounded=1&q=${encodeURIComponent(f.address)}`)).json();
    ui.sheet.results = list;
    box.innerHTML = list.length ? list.map((x, i) => `<button data-a="locPick" data-i="${i}">${esc(x.display_name)}</button>`).join('') : '<small>No se encontró. Prueba solo con la dirección, o usa «Estoy aquí» cuando estéis en el sitio.</small>';
  } catch (e) { box.innerHTML = '<small>No se pudo buscar (¿sin conexión?).</small>'; }
}

/* ---------------- Mapa ---------------- */
function mapPoints() {
  const pts = {};
  const add = (p) => { const k = p.lat.toFixed(4) + ',' + p.lng.toFixed(4) + '|' + p.name.toLowerCase(); if (pts[k]) { pts[k].subs.push(p.sub); } else pts[k] = { ...p, subs: [p.sub] }; };
  const slotOrder = { manana: 0, tarde: 1, noche: 2, comer: 3 };
  sortActs(db.activities).sort((a, b) => a.day.localeCompare(b.day) || slotOrder[a.slot] - slotOrder[b.slot]).forEach(a => {
    const di = D.days.findIndex(d => d.date === a.day); if (di < 0) return;
    if (ui.mapDay && ui.mapDay !== di + 1) return;
    if (a.slot === 'comer') { if (a.lat != null) add({ name: a.title, sub: `Comer · ${D.days[di].short}`, lat: a.lat, lng: a.lng, di, food: true, q: a.title + ' ' + (a.address || 'Praga') }); }
    else (a.items || []).forEach(it => { if (it.lat != null) add({ name: it.t, sub: `${a.title} · ${D.days[di].short}`, lat: it.lat, lng: it.lng, di, q: it.t + ', Praga' }); });
  });
  return Object.values(pts);
}
function pinIcon(p) {
  const c = D.days[p.di].color;
  return L.divIcon({ className: '', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -32], html: `<div class="pin ${p.food ? 'food' : ''}"><span class="head" style="background:${c}">${p.food ? ic('food', 14) : p.di + 1}</span><span class="tail"></span></div>` });
}
const popHtml = p => `<div class="pop"><b>${esc(p.name)}</b>${p.subs.map(s => `<small style="display:block">${esc(s)}</small>`).join('')}<div class="pbtns"><a class="go" href="${gmapsDir(p.lat, p.lng)}" target="_blank" rel="noopener">Cómo llegar</a><a href="${gmapsSearch(p.q)}" target="_blank" rel="noopener">Google Maps</a></div></div>`;
let mapLayer = null, meMarker = null;
const TILE = (dark) => dark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const darkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
function renderMap() {
  const scr = $('#screen');
  if (!window.L) { scr.innerHTML = '<p class="note2">No se pudo cargar el mapa.</p>'; return; }
  if (!mapObj) {
    scr.classList.add('map-mode'); scr.scrollTop = 0;
    scr.innerHTML = `<div id="map"></div><div class="mapbar" id="mapbar"></div>
      <div class="mapbtns"><button class="mapbtn" data-a="locate" aria-label="Mi ubicación">${ic('locate')}</button><button class="mapbtn" data-a="fit" aria-label="Ver todo">${ic('expand')}</button><button class="mapbtn" data-a="offlineMap" aria-label="Guardar mapa sin conexión">${ic('download')}</button></div>`;
    mapObj = L.map('map', { zoomControl: false, attributionControl: true }).setView([50.087, 14.415], 14);
    L.tileLayer(TILE(darkMode()), { subdomains: 'abcd', maxZoom: 19, crossOrigin: true, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>' }).addTo(mapObj);
    mapLayer = L.layerGroup().addTo(mapObj);
    mapObj.attributionControl.setPrefix(false);
  }
  $('#mapbar').innerHTML = `<div class="chips"><button class="chip ${ui.mapDay === 0 ? 'on' : ''}" data-a="mapDay" data-i="0">Todo</button>${D.days.map((d, i) => `<button class="chip ${ui.mapDay === i + 1 ? 'on' : ''}" data-a="mapDay" data-i="${i + 1}"><span style="width:10px;height:10px;border-radius:50%;background:${d.color}"></span>${esc(d.short)}</button>`).join('')}</div>`;
  drawMarkers();
}
function drawMarkers(fit) {
  mapLayer.clearLayers();
  const pts = mapPoints(), center = [50.087, 14.415], near = p => mapObj.distance(center, [p.lat, p.lng]) < 6000;
  const hotel = L.marker([D.hotel.lat, D.hotel.lng], { icon: L.divIcon({ className: '', iconSize: [34, 42], iconAnchor: [17, 42], popupAnchor: [0, -38], html: `<div class="pin hotel"><span class="head">${ic('bed', 18)}</span><span class="tail"></span></div>` }), zIndexOffset: 500 });
  hotel.bindPopup(popHtml({ name: D.hotel.name, subs: [D.hotel.address], lat: D.hotel.lat, lng: D.hotel.lng, q: D.hotel.name + ' ' + D.hotel.address })).addTo(mapLayer);
  let focusMarker = null;
  pts.forEach(p => {
    const mk = L.marker([p.lat, p.lng], { icon: pinIcon(p) }).bindPopup(popHtml(p)).addTo(mapLayer);
    if (ui.focus && Math.abs(ui.focus.lat - p.lat) < 1e-6 && Math.abs(ui.focus.lng - p.lng) < 1e-6) focusMarker = mk;
  });
  if (ui.mapDay) {
    const route = pts.filter(near).filter(p => !p.food).map(p => [p.lat, p.lng]);
    if (route.length > 1) L.polyline(route, { color: D.days[ui.mapDay - 1].color, weight: 3, dashArray: '6 7', opacity: .85 }).addTo(mapLayer);
  }
  if (ui.focus) {
    mapObj.setView([ui.focus.lat, ui.focus.lng], 17);
    if (focusMarker) setTimeout(() => focusMarker.openPopup(), 250);
    ui.focus = null;
  } else if (fit !== false) {
    const b = pts.filter(near).map(p => [p.lat, p.lng]).concat([[D.hotel.lat, D.hotel.lng]]);
    if (b.length > 1) mapObj.fitBounds(b, { padding: [40, 40], maxZoom: 16 });
  }
  setTimeout(() => mapObj && mapObj.invalidateSize(), 50);
}
async function downloadTiles() {
  const zooms = [13, 14, 15, 16], bbox = [50.060, 14.380, 50.102, 14.440];
  const lon2x = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z);
  const lat2y = (lat, z) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z);
  const r = (window.devicePixelRatio || 1) > 1 ? '@2x' : '', subs = 'abcd', base = TILE(darkMode());
  const urls = [];
  zooms.forEach(z => { for (let x = lon2x(bbox[1], z); x <= lon2x(bbox[3], z); x++) for (let y = lat2y(bbox[2], z); y <= lat2y(bbox[0], z); y++) urls.push(base.replace('{s}', subs[Math.abs(x + y) % subs.length]).replace('{z}', z).replace('{x}', x).replace('{y}', y).replace('{r}', r)); });
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) { toast('Instala la app primero para guardar el mapa'); return; }
  let done = 0, failed = 0;
  toast(`Guardando mapa del centro (${urls.length} piezas)…`);
  const worker = async () => { while (urls.length) { const u = urls.shift(); try { const res = await fetch(u, { mode: 'cors' }); if (!res.ok) failed++; } catch (e) { failed++; } done++; } };
  await Promise.all(Array.from({ length: 6 }, worker));
  toast(failed ? `Mapa guardado con ${failed} huecos. Reintenta con mejor conexión.` : 'Mapa del centro guardado para usar sin conexión');
}

/* ---------------- Gastos ---------------- */
function scrGastos() {
  const total = db.expenses.reduce((s, e) => s + +e.amount_eur, 0);
  const net = balances(), mine = net[me] || 0, trs = transfers(net).filter(t => t.from === me || t.to === me);
  if (!db.expenses.length && !db.payments.length) return `<div class="pad" style="text-align:center;padding-top:40px"><div class="tile t-orange" style="width:64px;height:64px;border-radius:20px;margin:0 auto">${ic('wallet', 32)}</div><h2 style="margin:14px 0 6px">Aún no hay gastos</h2><p class="muted" style="margin-bottom:18px">Apuntad aquí lo que pague cada uno y la app calcula quién debe a quién. Podéis apuntarlo en euros o en coronas.</p><button class="btn btn-primary" data-a="newExpense">${ic('plus', 18)}Añadir gasto</button></div>`;
  const moves = [
    ...db.expenses.map(e => ({ kind: 'e', at: e.spent_at, e })),
    ...db.payments.map(p => ({ kind: 'p', at: p.created_at, p }))
  ].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  let lastDay = '', list = '';
  moves.forEach(m => {
    const dd = pragueDate(m.at || nowIso());
    if (dd !== lastDay) { list += `<div class="group-lbl">${esc(dateLabel(dd))}</div>`; lastDay = dd; }
    if (m.kind === 'e') {
      const e = m.e, c = CATS[e.category] || CATS.otros;
      list += `<button class="exp" data-a="editExpense" data-id="${e.id}"><span class="tile ${c[2]}">${ic(c[1])}</span><span class="grow"><b>${esc(e.description)}</b><small>${e.payer === me ? 'Pagaste tú' : 'Pagó ' + esc(member(e.payer).name)} · entre ${(e.participants || []).length}</small></span><span class="amt">${eur(+e.amount_eur)}${e.currency === 'CZK' ? `<br><small>${czk(+e.amount)}</small>` : ''}</span></button>`;
    } else {
      const p = m.p;
      list += `<button class="exp" data-a="editPayment" data-id="${p.id}"><span class="tile t-green">${ic('swap')}</span><span class="grow"><b>${esc(member(p.from_member).name)} pagó a ${esc(member(p.to_member).name)}</b><small>Liquidación</small></span><span class="amt">${eur(+p.amount_eur)}</span></button>`;
    }
  });
  return `<div class="sum"><div><small>Gasto total del grupo</small><div class="big">${eur(total)}</div></div><small style="text-align:right">${eur(total / Math.max(1, db.members.length))} por persona<br>≈ ${czk(total * rate())}</small></div>
  <div class="bal ${mine > 0.004 ? 'pos' : mine < -0.004 ? 'neg' : 'zero'}"><h3>${mine > 0.004 ? 'Te deben ' + eur(mine) : mine < -0.004 ? 'Debes ' + eur(-mine) : 'Estás al día'}</h3>
    ${trs.length ? trs.map(t => `<div class="tr"><span class="av sm" style="background:${esc(member(t.from === me ? t.to : t.from).color)}">${esc(member(t.from === me ? t.to : t.from).name[0])}</span><span class="grow">${t.from === me ? 'Pagas a ' + esc(member(t.to).name) : esc(member(t.from).name) + ' te paga'} <b>${eur(t.amt)}</b></span><button class="btn btn-secondary btn-sm" style="height:32px" data-a="settle" data-from="${t.from}" data-to="${t.to}" data-amt="${t.amt}">${t.from === me ? 'Ya pagué' : 'Me pagó'}</button></div>`).join('') : '<small>Nadie te debe nada y no debes nada.</small>'}
  </div>
  <div class="pad"><h2 class="sec">Cuentas del grupo</h2><div class="card" style="padding:6px 16px">${db.members.map(mm => { const v = net[mm.id] || 0; return `<div class="netrow"><span class="av sm" style="background:${esc(mm.color)}">${esc(mm.name[0])}</span><span class="grow">${esc(mm.name)}${mm.id === me ? ' (tú)' : ''}</span><span class="v ${v > 0.004 ? 'pos-t' : v < -0.004 ? 'neg-t' : ''}">${v > 0.004 ? '+' : ''}${eur(v)}</span></div>`; }).join('')}</div>
  <h2 class="sec" style="margin-bottom:0">Movimientos</h2>${list}</div>`;
}
function expForm() {
  const f = ui.sheet.f;
  const amt = parseFloat(String(f.amount).replace(',', '.'));
  const conv = amt > 0 ? (f.currency === 'CZK' ? '≈ ' + eur(amt / rate()) : '≈ ' + czk(amt * rate())) : '&nbsp;';
  return `<h2 style="text-align:center">${ui.sheet.isNew ? 'Nuevo gasto' : 'Editar gasto'}</h2>
    <input class="amount" id="eamt" inputmode="decimal" placeholder="0" value="${esc(f.amount)}" aria-label="Importe">
    <div class="seg" style="max-width:220px;margin:0 auto">${['EUR', 'CZK'].map(c => `<button class="${f.currency === c ? 'on' : ''}" data-a="ecur" data-v="${c}">${c === 'EUR' ? '€ Euros' : 'Kč Coronas'}</button>`).join('')}</div>
    <p class="small" style="text-align:center;margin-top:6px" id="econv">${conv}</p>
    <div class="lbl">Concepto</div><input class="field" id="edesc" value="${esc(f.description)}" placeholder="Cena en Lokál">
    <div class="lbl">Categoría</div><div class="chips wrap">${Object.entries(CATS).map(([k, c]) => `<button class="chip ${f.category === k ? 'on' : ''}" data-a="ecat" data-v="${k}">${ic(c[1], 16)}${c[0]}</button>`).join('')}</div>
    <div class="lbl">Pagó</div><div class="people">${db.members.map(m => `<button class="person ${f.payer === m.id ? 'on' : ''}" data-a="epayer" data-v="${m.id}"><span class="av" style="background:${esc(m.color)}">${esc(m.name[0])}</span><span>${m.id === me ? 'Yo' : esc(m.name)}</span></button>`).join('')}</div>
    <div class="lbl" style="display:flex;justify-content:space-between;align-items:center">Se divide entre<button class="btn btn-ghost btn-sm" data-a="eall">${f.participants.length === db.members.length ? 'Ninguno' : 'Todos'}</button></div>
    <div class="people">${db.members.map(m => `<button class="person ${f.participants.includes(m.id) ? 'on' : ''}" data-a="epart" data-v="${m.id}"><span class="av" style="background:${esc(m.color)}">${esc(m.name[0])}</span><span>${m.id === me ? 'Yo' : esc(m.name)}</span></button>`).join('')}</div>
    <p class="small" style="margin-top:8px">${f.participants.length && amt > 0 ? `${eur((f.currency === 'CZK' ? amt / rate() : amt) / f.participants.length)} cada uno` : ''}</p>
    <div class="actions"><button class="btn btn-primary" data-a="saveExpense">Guardar gasto</button>${ui.sheet.isNew ? '' : `<button class="btn btn-danger" data-a="delExpense">${ic('trash', 18)}Eliminar gasto</button>`}</div>`;
}
function readExp() { const f = ui.sheet.f; const a = $('#eamt'), d = $('#edesc'); if (a) f.amount = a.value.replace(/[^\d.,]/g, ''); if (d) f.description = d.value; }
function openExpForm(e) {
  const isNew = !e;
  e = e || { id: uuid(), description: '', amount: '', currency: 'EUR', payer: me, participants: db.members.map(m => m.id), category: 'comida', spent_at: null, created_by: me };
  ui.sheet = { kind: 'exp', isNew, orig: e, f: { ...e, amount: e.amount === '' ? '' : String(e.amount).replace('.', ','), participants: [...(e.participants || [])] } };
  openSheet(expForm());
}
function saveExpense() {
  readExp();
  const f = ui.sheet.f, amt = round2(parseFloat(String(f.amount).replace(',', '.')));
  if (!(amt > 0)) { toast('Escribe el importe'); return; }
  if (!f.participants.length) { toast('Elige entre quién se divide'); return; }
  const row = { id: f.id, trip_id: tripId, description: f.description.trim() || CATS[f.category][0], amount: amt, currency: f.currency, amount_eur: f.currency === 'CZK' ? round2(amt / rate()) : amt,
    payer: f.payer, participants: f.participants, category: f.category, spent_at: f.spent_at || nowIso(), created_by: f.created_by || me, updated_at: nowIso() };
  const isNew = ui.sheet.isNew;
  closeSheet(); put('expenses', row); toast(isNew ? 'Gasto apuntado' : 'Gasto actualizado');
}

/* ---------------- Quiz y retos ---------------- */
function scrQuiz() {
  const sc = scores(), rows = db.members.map(m => ({ m, s: sc[m.id] })).sort((a, b) => b.s.pts - a.s.pts);
  const ti = todayIndex(), n = pragueNow();
  const curCh = D.challenges.find(c => c.day === n.date) || null;
  const doneBy = cid => db.challenges_done.filter(c => c.challenge_id === cid).map(c => c.member_id);
  const retoCard = c => {
    const who = doneBy(c.id), mine = who.includes(me);
    return `<div class="reto"><div class="kick">Reto de hoy · +${c.pts} puntos</div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>
      <div class="row"><span class="avs">${who.map(id => `<span class="av sm" style="background:${esc(member(id).color)}">${esc(member(id).name[0])}</span>`).join('') || '<small>Nadie todavía</small>'}</span>
      <button class="btn ${mine ? 'btn-secondary' : 'btn-game'} btn-sm" data-a="toggleCh" data-id="${c.id}">${mine ? ic('check', 16) + 'Hecho' : '¡Lo he hecho!'}</button></div></div>`;
  };
  const quizRows = D.quizzes.map(q => {
    const ans = myAnswers(q.id), ok = ans.filter(a => a.correct).length, unl = quizUnlocked(q), full = ans.length >= q.qs.length;
    const when = q.day ? `${D.days.find(d => d.date === q.day).label.toLowerCase()} a las 18:00` : 'Disponible ya';
    const badge = !unl ? `<span class="badge lock">${ic('lock', 12)} ${esc(D.days.find(d => d.date === q.day).short)}</span>` : full ? `<span class="badge done">${ok}/${q.qs.length}</span>` : `<span class="badge new">${ans.length ? 'Seguir' : 'Jugar'}</span>`;
    return `<button class="qcard ${unl ? '' : 'locked'}" data-a="quiz" data-id="${q.id}"><span class="tile ${q.day ? 't-blue' : 't-green'}">${ic(q.day ? 'spark' : 'flame')}</span><span class="grow"><b>${esc(q.title)}</b><small>${unl ? (full ? 'Completado · toca para repasar' : `${q.qs.length} preguntas`) : 'Se desbloquea el ' + esc(when)}</small></span>${badge}</button>`;
  }).join('');
  const chRows = D.challenges.map(c => {
    const unl = challengeUnlocked(c), who = doneBy(c.id), mine = who.includes(me), day = D.days.find(d => d.date === c.day);
    return `<div class="qcard ${unl ? '' : 'locked'}"><span class="tile t-orange">${ic(unl ? 'flame' : 'lock')}</span><span class="grow"><b>${unl ? esc(c.title) : 'Reto sorpresa'}</b><small>${unl ? esc(c.text) : 'Se desvela el ' + esc(day.label.toLowerCase())}</small>${who.length ? `<span class="avs" style="margin-top:6px">${who.map(id => `<span class="av sm" style="background:${esc(member(id).color)}">${esc(member(id).name[0])}</span>`).join('')}</span>` : ''}</span>
      ${unl ? `<button class="btn ${mine ? 'btn-secondary' : 'btn-game'} btn-sm" data-a="toggleCh" data-id="${c.id}">${mine ? ic('check', 16) : '+' + c.pts}</button>` : ''}</div>`;
  }).join('');
  return `<div class="pad">${ui.testMode ? '<div class="note" style="margin-top:6px;background:var(--violet-tint)">' + ic('info', 16) + '<span>Modo prueba activado: todo desbloqueado y las respuestas no puntúan.</span></div>' : ''}
    <h2 class="sec" style="margin-top:8px">Ranking del grupo</h2>
    <div class="card rank" style="padding:6px">${rows.map((r, i) => `<div class="r ${r.m.id === me ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="av sm" style="background:${esc(r.m.color)}">${esc(r.m.name[0])}</span><span class="grow">${esc(r.m.name)}</span><small>${r.s.q} aciertos · ${r.s.c} retos</small>&nbsp;&nbsp;<span class="pts">${r.s.pts}</span></div>`).join('')}</div>
    <small style="display:block;margin-top:6px">10 puntos por acierto y 20 por reto completado.</small>
    ${curCh && ti >= 0 ? `<div style="margin-top:18px">${retoCard(curCh)}</div>` : ''}
    <h2 class="sec">Quizzes</h2><small style="display:block;margin:-4px 0 10px">Cada día del viaje, a las 18:00, se abre un quiz sobre lo que habéis visitado.</small>${quizRows}
    <h2 class="sec">Retos diarios</h2>${chRows}</div>`;
}
function startQuiz(id) {
  const q = D.quizzes.find(x => x.id === id);
  if (!quizUnlocked(q)) { toast(`Se desbloquea el ${D.days.find(d => d.date === q.day).label.toLowerCase()} a las 18:00`); return; }
  const ans = myAnswers(q.id), practice = ui.testMode || ans.length >= q.qs.length;
  const first = practice ? 0 : q.qs.findIndex((_, i) => !ans.some(a => a.q === i));
  ui.quiz = { q, i: Math.max(0, first), sel: null, checked: false, practice, ok: practice ? 0 : ans.filter(a => a.correct).length };
  closeSheet();
  const ov = $('#ov'); ov.innerHTML = quizView(); ov.classList.add('on');
}
function quizView() {
  const Q = ui.quiz, qq = Q.q.qs[Q.i], right = Q.sel === qq.a;
  const pct = (Q.i + (Q.checked ? 1 : 0)) / Q.q.qs.length * 100;
  return `<div class="ov-top"><button class="iconbtn" data-a="qclose" aria-label="Salir">${ic('close', 24)}</button><div class="q-prog"><i style="width:${pct}%"></i></div><small style="font-weight:700">${Q.i + 1}/${Q.q.qs.length}</small></div>
  <div class="ov-body">${Q.practice ? '<small style="display:block;margin-bottom:6px">Repaso: estas respuestas no puntúan</small>' : ''}<div class="q-img t-blue">${ic(Q.q.day ? D.days.find(d => d.date === Q.q.day).icon : 'castle', 56)}</div><div class="q-text">${esc(qq.q)}</div>
    ${qq.o.map((o, i) => { let c = ''; if (Q.checked) { if (i === qq.a) c = 'ok'; else if (i === Q.sel) c = 'bad'; } else if (i === Q.sel) c = 'sel'; return `<button class="qopt ${c}" data-a="qsel" data-i="${i}" ${Q.checked ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span>${esc(o)}</button>`; }).join('')}</div>
  ${Q.checked ? `<div class="q-fb ${right ? 'ok' : 'bad'}"><h3>${ic(right ? 'check' : 'close', 22)}${right ? '¡Correcto!' : 'Casi'}</h3><p>${esc(qq.e)}</p><button class="btn btn-game btn-block ${right ? '' : 'red'}" data-a="qnext">Continuar</button></div>`
  : `<div class="ov-foot"><button class="btn btn-game btn-block" data-a="qcheck" ${Q.sel === null ? 'disabled' : ''}>Comprobar</button></div>`}`;
}
function quizResult() {
  const Q = ui.quiz, total = Q.q.qs.length;
  const sc = scores(), rows = db.members.map(m => ({ m, s: sc[m.id] })).sort((a, b) => b.s.pts - a.s.pts), pos = rows.findIndex(r => r.m.id === me) + 1;
  return `<div class="ov-body result"><div class="tile t-green" style="width:80px;height:80px;border-radius:26px;margin:0 auto">${ic('trophy', 40)}</div>
    <h1 style="margin-top:14px">${Q.ok === total ? '¡Perfecto!' : Q.ok >= 3 ? '¡Muy bien!' : '¡Buen intento!'}</h1><p class="muted">${esc(Q.q.title)}</p>
    <div class="rgrid"><div class="rbox g"><small>Aciertos</small><b>${Q.ok}/${total}</b></div><div class="rbox b"><small>${Q.practice ? 'Repaso' : 'Tu puesto'}</small><b>${Q.practice ? '—' : pos + 'º'}</b></div></div>
    ${Q.practice ? '' : `<div class="card rank" style="padding:6px;text-align:left">${rows.map((r, i) => `<div class="r ${r.m.id === me ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="av sm" style="background:${esc(r.m.color)}">${esc(r.m.name[0])}</span><span class="grow">${esc(r.m.name)}</span><span class="pts">${r.s.pts}</span></div>`).join('')}</div>`}</div>
    <div class="ov-foot"><button class="btn btn-game btn-block" data-a="qclose">Continuar</button></div>`;
}

/* ---------------- Ajustes e instalación ---------------- */
function settingsHtml() {
  const m = member(me);
  return `<div style="display:flex;align-items:center;gap:14px"><span class="av lg" style="background:${esc(m.color)}">${esc(m.name[0])}</span><div><h2>${esc(m.name)}</h2><small>${db.members.length} en el viaje</small></div></div>
    <div class="lbl">El grupo</div><div class="avs">${db.members.map(x => `<span class="av" style="background:${esc(x.color)}" title="${esc(x.name)}">${esc(x.name[0])}</span>`).join('')}</div>
    <small style="display:block;margin-top:6px">${db.members.map(x => esc(x.name)).join(', ')}</small>
    <div class="actions" style="margin-top:14px"><button class="btn btn-primary" data-a="invite">${ic('share', 18)}Invitar al grupo</button><button class="btn btn-secondary" data-a="install">${ic('phone', 18)}Instalar en el móvil</button></div>
    <div class="lbl">Cambio euro / corona</div><div style="display:flex;gap:8px"><input class="field" id="rate" inputmode="decimal" value="${String(rate()).replace('.', ',')}"><button class="btn btn-secondary" data-a="saveRate">Guardar</button></div>
    <small style="display:block;margin-top:6px">1 € = ${String(rate()).replace('.', ',')} Kč. Se usa para los gastos en coronas.</small>
    <div class="switchrow"><span class="grow"><b>Modo prueba</b><br><small>Desbloquea todos los quizzes y retos para verlos. No puntúa.</small></span><button class="tog ${ui.testMode ? 'on' : ''}" data-a="testMode" role="switch" aria-checked="${ui.testMode}" aria-label="Modo prueba"></button></div>
    <div class="actions"><button class="btn btn-ghost" data-a="leave">No soy ${esc(m.name)}</button></div>
    <p class="note2">${REMOTE ? 'Conectado con el grupo.' : 'Modo demo: configura Supabase en config.js para compartirlo.'} TravelQuest · Praga</p>`;
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
function installHtml() {
  if (isStandalone()) return `<h2>Ya está instalada</h2><p class="muted">La estás usando como app. Funciona sin conexión con lo último que se cargó.</p>`;
  if (deferredInstall) return `<h2>Instalar en el móvil</h2><p class="muted">Se añadirá a tu pantalla de inicio como una app.</p><div class="actions"><button class="btn btn-primary" data-a="doInstall">Instalar</button><button class="btn btn-ghost" data-a="hideInstall">Ahora no</button></div>`;
  if (isIOS()) return `<h2>Instalar en el iPhone</h2><ol style="margin:12px 0 0 20px;line-height:1.9"><li>Abre esta página en <b>Safari</b>.</li><li>Toca el botón <b>Compartir</b> (el cuadrado con la flecha).</li><li>Elige <b>Añadir a pantalla de inicio</b>.</li><li>Abre la app desde el icono y entra con tu nombre.</li></ol><p class="small" style="margin-top:10px">En iPhone, la app instalada guarda sus datos aparte de Safari: escribe tu nombre otra vez al abrirla (o tócalo en la lista).</p><div class="actions"><button class="btn btn-ghost" data-a="hideInstall">Entendido</button></div>`;
  return `<h2>Instalar en el móvil</h2><p class="muted" style="margin-top:6px">En Chrome, abre el menú ⋮ y elige <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</p><div class="actions"><button class="btn btn-ghost" data-a="hideInstall">Entendido</button></div>`;
}

/* ---------------- Hojas y avisos ---------------- */
function openSheet(h) { const s = $('#sheet'); s.innerHTML = '<div class="grab"></div>' + h; s.classList.add('on'); $('#scrim').classList.add('on'); s.scrollTop = 0; }
function closeSheet() { const s = $('#sheet'); if (!s) return; s.classList.remove('on'); $('#scrim').classList.remove('on'); }
let tt;
function toast(msg) { const t = $('#toast'); if (!t) return; t.innerHTML = `<span>${esc(msg)}</span>`; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800); }

/* ---------------- Acciones ---------------- */
const A = {
  join: doJoin,
  pickName: d => { $('#jname').value = d.n; },
  tab: d => { ui.tab = d.t; render(true); },
  day: d => { ui.day = +d.i; render(); },
  settings: () => openSheet(settingsHtml()),
  closeSheet,
  install: () => openSheet(installHtml()),
  hideInstall: () => { ui.installDismissed = true; LS.set('tq-install-off', true); closeSheet(); render(); },
  doInstall: async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; closeSheet(); },
  invite: async () => {
    const url = location.origin + location.pathname;
    const text = `Únete a nuestro viaje a Praga: ${url}${CFG.TRIP_CODE ? '' : '\nCódigo: ' + (db.trip && db.trip.join_code)}`;
    try { if (navigator.share) { await navigator.share({ title: 'TravelQuest · Praga', text, url }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); toast('Enlace copiado'); } catch (e) { toast(url); }
  },
  saveRate: () => { const v = parseFloat(($('#rate').value || '').replace(',', '.')); if (!(v > 1 && v < 100)) { toast('Escribe un cambio válido, p. ej. 24,36'); return; } put('trips', { id: tripId, eur_czk: v }); closeSheet(); toast('Cambio guardado'); },
  testMode: () => { ui.testMode = !ui.testMode; LS.set('tq-test', ui.testMode); openSheet(settingsHtml()); render(); },
  leave: () => ask('¿Entrar con otro nombre en este dispositivo?', 'Cambiar de persona', () => { LS.del(CACHE_KEY); me = null; if (chan) { sb.removeChannel(chan); chan = null; } closeSheet(); showJoin(); }),
  // Plan
  newAct: d => openActForm(null, d.slot),
  editAct: d => { const a = db.activities.find(x => x.id === d.id); if (a) openActForm(a); },
  fslot: d => { readActForm(); ui.sheet.f.slot = d.v; redrawSheet(); },
  ftier: d => { readActForm(); ui.sheet.f.tier = ui.sheet.f.tier === d.v ? '' : d.v; redrawSheet(); },
  saveAct,
  delAct: () => { const id = ui.sheet.orig.id; ask('¿Eliminar este plan para todo el grupo?', 'Eliminar', () => { closeSheet(); del('activities', { id }); toast('Eliminado'); }); },
  locSearch,
  locPick: d => { readActForm(); const x = ui.sheet.results[+d.i]; ui.sheet.f.lat = +x.lat; ui.sheet.f.lng = +x.lon; redrawSheet(); toast('Ubicación fijada'); },
  locClear: () => { readActForm(); ui.sheet.f.lat = null; ui.sheet.f.lng = null; redrawSheet(); },
  locHere: () => {
    readActForm();
    if (!navigator.geolocation) { toast('Tu navegador no da la ubicación'); return; }
    navigator.geolocation.getCurrentPosition(p => { ui.sheet.f.lat = round6(p.coords.latitude); ui.sheet.f.lng = round6(p.coords.longitude); redrawSheet(); toast('Ubicación fijada donde estás'); }, () => toast('No se pudo obtener tu ubicación'), { enableHighAccuracy: true, timeout: 10000 });
  },
  focus: d => { ui.focus = { lat: +d.lat, lng: +d.lng }; ui.mapDay = 0; ui.tab = 'mapa'; render(true); },
  // Mapa
  mapDay: d => { ui.mapDay = +d.i; renderMap(); },
  fit: () => drawMarkers(true),
  locate: () => {
    if (!navigator.geolocation) { toast('Tu navegador no da la ubicación'); return; }
    navigator.geolocation.getCurrentPosition(p => {
      if (!mapObj) return;
      const ll = [p.coords.latitude, p.coords.longitude];
      if (meMarker) meMarker.remove();
      meMarker = L.marker(ll, { icon: L.divIcon({ className: '', iconSize: [18, 18], html: '<div class="me-dot"></div>' }), zIndexOffset: 1000 }).addTo(mapObj);
      mapObj.setView(ll, 16);
    }, () => toast('No se pudo obtener tu ubicación'), { enableHighAccuracy: true, timeout: 10000 });
  },
  offlineMap: downloadTiles,
  // Gastos
  newExpense: () => openExpForm(null),
  editExpense: d => { const e = db.expenses.find(x => x.id === d.id); if (e) openExpForm(e); },
  ecur: d => { readExp(); ui.sheet.f.currency = d.v; redrawSheet(); },
  ecat: d => { readExp(); ui.sheet.f.category = d.v; redrawSheet(); },
  epayer: d => { readExp(); ui.sheet.f.payer = d.v; redrawSheet(); },
  epart: d => { readExp(); const p = ui.sheet.f.participants, i = p.indexOf(d.v); if (i >= 0) p.splice(i, 1); else p.push(d.v); redrawSheet(); },
  eall: () => { readExp(); const f = ui.sheet.f; f.participants = f.participants.length === db.members.length ? [] : db.members.map(m => m.id); redrawSheet(); },
  saveExpense,
  delExpense: () => { const id = ui.sheet.orig.id; ask('¿Eliminar este gasto para todo el grupo?', 'Eliminar', () => { closeSheet(); del('expenses', { id }); toast('Gasto eliminado'); }); },
  askYes: () => { const f = pendingAsk; pendingAsk = null; if (f) f(); },
  settle: d => { put('payments', { id: uuid(), trip_id: tripId, from_member: d.from, to_member: d.to, amount_eur: +d.amt, created_by: me, created_at: nowIso() }); toast('Pago registrado'); },
  editPayment: d => { const p = db.payments.find(x => x.id === d.id); if (!p) return; openSheet(`<h2>${esc(member(p.from_member).name)} pagó a ${esc(member(p.to_member).name)}</h2><p class="muted">${eur(+p.amount_eur)}</p><div class="actions"><button class="btn btn-danger" data-a="delPayment" data-id="${p.id}">${ic('trash', 18)}Deshacer este pago</button></div>`); },
  delPayment: d => { closeSheet(); del('payments', { id: d.id }); toast('Pago deshecho'); },
  // Quiz
  quiz: d => startQuiz(d.id),
  qsel: d => { if (ui.quiz.checked) return; ui.quiz.sel = +d.i; $('#ov').innerHTML = quizView(); },
  qcheck: () => {
    const Q = ui.quiz, qq = Q.q.qs[Q.i], ok = Q.sel === qq.a;
    Q.checked = true; if (ok) Q.ok++;
    if (!Q.practice) put('quiz_answers', { trip_id: tripId, member_id: me, quiz_id: Q.q.id, q: Q.i, choice: Q.sel, correct: ok, answered_at: nowIso() });
    $('#ov').innerHTML = quizView();
  },
  qnext: () => {
    const Q = ui.quiz;
    let next = Q.i + 1;
    if (!Q.practice) { const ans = myAnswers(Q.q.id); while (next < Q.q.qs.length && ans.some(a => a.q === next)) next++; }
    if (next >= Q.q.qs.length) { $('#ov').innerHTML = quizResult(); return; }
    Q.i = next; Q.sel = null; Q.checked = false; $('#ov').innerHTML = quizView();
  },
  qclose: () => { $('#ov').classList.remove('on'); ui.quiz = null; render(); },
  toggleCh: d => {
    const c = D.challenges.find(x => x.id === d.id);
    if (!challengeUnlocked(c)) return;
    if (ui.testMode) { toast('En modo prueba los retos no puntúan'); return; }
    const done = db.challenges_done.some(x => x.challenge_id === d.id && x.member_id === me);
    if (done) del('challenges_done', { member_id: me, challenge_id: d.id });
    else { put('challenges_done', { trip_id: tripId, member_id: me, challenge_id: d.id, done_at: nowIso() }); toast(`+${c.pts} puntos. ¡Bien hecho!`); }
  }
};
let pendingAsk = null;
function ask(msg, label, fn) { pendingAsk = fn; openSheet(`<h2>${esc(msg)}</h2><div class="actions"><button class="btn btn-primary" style="background:var(--error)" data-a="askYes">${esc(label)}</button><button class="btn btn-secondary" data-a="closeSheet">Cancelar</button></div>`); }
const round6 = n => Math.round(n * 1e6) / 1e6;

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.tagName === 'A') return;
  const fn = A[el.dataset.a];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'eamt' && ui.sheet && ui.sheet.kind === 'exp') {
    readExp();
    const f = ui.sheet.f, amt = parseFloat(String(f.amount).replace(',', '.'));
    const c = $('#econv'); if (c) c.innerHTML = amt > 0 ? (f.currency === 'CZK' ? '≈ ' + eur(amt / rate()) : '≈ ' + czk(amt * rate())) : '&nbsp;';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'jname') doJoin();
  if (e.key === 'Escape') { if ($('#ov') && $('#ov').classList.contains('on')) A.qclose(); else closeSheet(); }
});
window.addEventListener('online', () => { if (REMOTE && tripId) { flush(); refresh().catch(() => {}); } });
window.addEventListener('offline', () => setStatus('offline'));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && REMOTE && tripId && me) { flush(); refresh().catch(() => setStatus('offline')); } });
setInterval(() => { if (me && ui.tab !== 'mapa' && !$('#sheet').classList.contains('on') && !ui.quiz) render(); }, 60000);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

boot();
window.__tq = { db, ui, A, get me() { return me; }, render, balances, transfers, pendingQuiz, scores };
})();
