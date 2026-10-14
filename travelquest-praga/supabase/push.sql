-- =====================================================================
-- TravelQuest · Praga — avisos al móvil (notificaciones push)
-- 1. Cambia TU-PROYECTO en la línea marcada con <<< por el código de tu
--    proyecto (el de https://TU-PROYECTO.supabase.co).
-- 2. Pega todo en Supabase → SQL Editor → Run.
-- Se puede ejecutar más de una vez.
-- =====================================================================

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Suscripciones de cada móvil
create table if not exists push_subs (
  endpoint   text primary key,
  trip_id    uuid not null references trips(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
alter table push_subs enable row level security;
drop policy if exists push_own_read on push_subs;
drop policy if exists push_own_write on push_subs;
drop policy if exists push_own_update on push_subs;
drop policy if exists push_own_delete on push_subs;
create policy push_own_read   on push_subs for select using (owns_member(member_id));
create policy push_own_write  on push_subs for insert with check (owns_member(member_id) and is_member(trip_id));
create policy push_own_update on push_subs for update using (owns_member(member_id)) with check (owns_member(member_id) and is_member(trip_id));
create policy push_own_delete on push_subs for delete using (owns_member(member_id));
grant select, insert, update, delete on push_subs to authenticated;

-- Dónde está la función y la contraseña compartida (no la ve nadie desde la app)
create table if not exists notify_config (id int primary key default 1 check (id = 1), url text not null, secret text not null);
alter table notify_config enable row level security;
revoke all on notify_config from anon, authenticated;

insert into notify_config (id, url, secret)
values (1, 'https://TU-PROYECTO.supabase.co/functions/v1/notify', 't7Lo3pvNd5ngu5OxmnpWPU7T1XMWEVtL')   -- <<< cambia TU-PROYECTO
on conflict (id) do update set url = excluded.url, secret = excluded.secret;

create or replace function call_notify(payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare c notify_config;
begin
  select * into c from notify_config where id = 1;
  if c is null or c.url like '%TU-PROYECTO%' then return; end if;
  perform net.http_post(
    url := c.url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', c.secret),
    body := payload
  );
end $$;

create or replace function notify_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform call_notify(jsonb_build_object(
    'type', tg_op, 'table', tg_table_name,
    'record', to_jsonb(new),
    'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end));
  return new;
end $$;

drop trigger if exists push_expenses on expenses;
create trigger push_expenses after insert on expenses for each row execute function notify_push();

drop trigger if exists push_activities on activities;
create trigger push_activities after insert or update on activities for each row execute function notify_push();

do $$
begin
  if to_regclass('public.docs') is not null then
    execute 'drop trigger if exists push_docs on docs';
    execute 'create trigger push_docs after insert on docs for each row execute function notify_push()';
  end if;
end $$;

-- Quiz del día: a las 18:00 de Praga (17:00 UTC; ese finde ya es horario de invierno)
do $$
begin
  perform cron.unschedule(jobid) from cron.job where jobname in ('tq-quiz-oct', 'tq-quiz-nov');
end $$;
select cron.schedule('tq-quiz-oct', '0 17 27-31 10 *', $$ select public.call_notify('{"type":"quiz"}'::jsonb) $$);
select cron.schedule('tq-quiz-nov', '0 17 1 11 *',     $$ select public.call_notify('{"type":"quiz"}'::jsonb) $$);
