// TravelQuest · Praga — función "notify": envía los avisos al móvil.
// Se despliega en Supabase → Edge Functions → nombre: notify (ver README).
// La llaman la base de datos (al apuntar un gasto, subir un documento o
// cambiar el plan) y una tarea programada a las 18:00 de Praga (quiz del día).

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const QUIZ: Record<string, { quiz: string; reto: string }> = {
  '2026-10-27': { quiz: 'Ciudad Vieja y el puente', reto: 'Primer brindis' },
  '2026-10-28': { quiz: 'Josefov y centro', reto: 'Habla checo' },
  '2026-10-29': { quiz: 'Malá Strana y el río', reto: 'Buena suerte' },
  '2026-10-30': { quiz: 'Castillo y Hradčany', reto: 'Tras los pasos de Kafka' },
  '2026-10-31': { quiz: 'Petřín, Strahov y Halloween', reto: 'Noche de Halloween' },
  '2026-11-01': { quiz: 'Vyšehrad y despedida', reto: 'Despedida' }
};
const DAY_NAMES: Record<string, string> = {
  '2026-10-27': 'el martes', '2026-10-28': 'el miércoles', '2026-10-29': 'el jueves',
  '2026-10-30': 'el viernes', '2026-10-31': 'el sábado', '2026-11-01': 'el domingo'
};

const pragueDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
};
const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

type Msg = { member: string; title: string; body: string; tab: string; tag: string };

export async function buildMessages(payload: any, sb: any): Promise<Msg[]> {
  const out: Msg[] = [];
  const rec = payload.record || {};
  const nameOf = async (id: string) => {
    if (!id) return 'Alguien';
    const { data } = await sb.from('members').select('name').eq('id', id).maybeSingle();
    return (data && data.name) || 'Alguien';
  };
  const membersOf = async (trip: string) => {
    const { data } = await sb.from('members').select('id').eq('trip_id', trip);
    return (data || []).map((m: any) => m.id as string);
  };

  if (payload.type === 'quiz') {
    const today = pragueDate();
    const q = QUIZ[today];
    if (!q) return out;
    const { data: trips } = await sb.from('trips').select('id').lte('start_date', today).gte('end_date', today);
    for (const t of trips || []) {
      for (const m of await membersOf(t.id)) {
        out.push({ member: m, title: 'Quiz del día disponible', body: `«${q.quiz}»: 5 preguntas sobre lo de hoy. Y el reto del día: ${q.reto}.`, tab: 'quiz', tag: 'quiz-' + today });
      }
    }
    return out;
  }

  if (payload.table === 'expenses' && payload.type === 'INSERT') {
    const who = rec.created_by || rec.payer;
    const payerName = await nameOf(rec.payer);
    const parts: string[] = rec.participants || [];
    const share = parts.length ? Math.round((Number(rec.amount_eur) / parts.length) * 100) / 100 : 0;
    for (const m of parts) {
      if (m === who || m === rec.payer) continue;
      out.push({ member: m, title: `${payerName} ha apuntado un gasto`, body: `${rec.description}: ${eur(Number(rec.amount_eur))}. Te tocan ${eur(share)}.`, tab: 'gastos', tag: 'exp-' + rec.id });
    }
    return out;
  }

  if (payload.table === 'docs' && payload.type === 'INSERT') {
    const name = await nameOf(rec.created_by);
    for (const m of await membersOf(rec.trip_id)) {
      if (m === rec.created_by) continue;
      out.push({ member: m, title: `${name} ha subido un documento`, body: rec.title, tab: 'docs', tag: 'doc-' + rec.id });
    }
    return out;
  }

  if (payload.table === 'activities' && (payload.type === 'INSERT' || payload.type === 'UPDATE')) {
    if (!rec.updated_by) return out;
    const old = payload.old_record || {};
    const days = [pragueDate(), pragueDate(1)];
    const touched = days.includes(rec.day) || (old.day && days.includes(old.day));
    if (!touched) return out;
    if (payload.type === 'UPDATE' && old.title === rec.title && old.time === rec.time && old.day === rec.day && old.slot === rec.slot &&
        JSON.stringify(old.items) === JSON.stringify(rec.items) && old.note === rec.note && old.address === rec.address) return out;
    const name = await nameOf(rec.updated_by);
    const when = rec.day === days[0] ? 'hoy' : rec.day === days[1] ? 'mañana' : (DAY_NAMES[rec.day] || rec.day);
    const verb = payload.type === 'INSERT' ? 'ha añadido' : 'ha cambiado';
    for (const m of await membersOf(rec.trip_id)) {
      if (m === rec.updated_by) continue;
      out.push({ member: m, title: `Cambio en el plan de ${when}`, body: `${name} ${verb} «${rec.title}»${rec.time ? ' (' + rec.time + ')' : ''}.`, tab: 'plan', tag: 'act-' + rec.id });
    }
    return out;
  }
  return out;
}

async function send(sb: any, msgs: Msg[]) {
  let sent = 0, gone = 0;
  for (const msg of msgs) {
    const { data: subs } = await sb.from('push_subs').select('endpoint,p256dh,auth').eq('member_id', msg.member);
    for (const s of subs || []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: msg.title, body: msg.body, tab: msg.tab, tag: msg.tag }), { TTL: 6 * 3600, urgency: 'normal' });
        sent++;
      } catch (e: any) {
        if (e && (e.statusCode === 404 || e.statusCode === 410)) { await sb.from('push_subs').delete().eq('endpoint', s.endpoint); gone++; }
        else console.error('push error', e && e.statusCode, e && e.body);
      }
    }
  }
  return { sent, gone };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('ok');
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) return new Response('unauthorized', { status: 401 });
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') || 'mailto:viaje@example.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, (Deno.env.get('SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!);
  const payload = await req.json().catch(() => ({}));
  const msgs = await buildMessages(payload, sb);
  const r = await send(sb, msgs);
  return new Response(JSON.stringify({ messages: msgs.length, ...r }), { headers: { 'Content-Type': 'application/json' } });
});
