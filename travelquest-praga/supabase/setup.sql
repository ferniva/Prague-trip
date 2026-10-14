-- =====================================================================
-- TravelQuest · Praga — esquema de base de datos para Supabase
-- Pega TODO este archivo en Supabase → SQL Editor → Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------
create table if not exists trips (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  start_date  date not null,
  end_date    date not null,
  join_code   text not null unique,
  eur_czk     numeric(8,4) not null default 24.36,
  created_at  timestamptz not null default now()
);

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips(id) on delete cascade,
  name        text not null,
  color       text not null,
  created_at  timestamptz not null default now()
);
create unique index if not exists members_trip_name on members(trip_id, lower(name));

-- Un mismo miembro puede usar varios dispositivos (móvil, tablet...)
create table if not exists member_devices (
  user_id    uuid not null references auth.users(id) on delete cascade,
  trip_id    uuid not null references trips(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  primary key (user_id, trip_id)
);

create table if not exists activities (
  id          uuid primary key,
  trip_id     uuid not null references trips(id) on delete cascade,
  day         date not null,
  slot        text not null check (slot in ('manana','comer','tarde','cena','noche')),
  position    int  not null default 0,
  title       text not null,
  time        text,
  items       jsonb not null default '[]'::jsonb,   -- [{t, lat, lng}]
  note        text,
  price       text,
  tier        text,
  address     text,
  lat         double precision,
  lng         double precision,
  updated_by  uuid references members(id) on delete set null,
  updated_at  timestamptz not null default now()
);
create index if not exists activities_trip_day on activities(trip_id, day);

create table if not exists expenses (
  id            uuid primary key,
  trip_id       uuid not null references trips(id) on delete cascade,
  description   text not null,
  amount        numeric(12,2) not null check (amount > 0),
  currency      text not null default 'EUR' check (currency in ('EUR','CZK')),
  amount_eur    numeric(12,2) not null check (amount_eur > 0),
  payer         uuid not null references members(id) on delete cascade,
  participants  uuid[] not null,
  category      text not null default 'otros',
  spent_at      timestamptz not null default now(),
  created_by    uuid references members(id) on delete set null,
  updated_at    timestamptz not null default now()
);
create index if not exists expenses_trip on expenses(trip_id);

create table if not exists payments (
  id           uuid primary key,
  trip_id      uuid not null references trips(id) on delete cascade,
  from_member  uuid not null references members(id) on delete cascade,
  to_member    uuid not null references members(id) on delete cascade,
  amount_eur   numeric(12,2) not null check (amount_eur > 0),
  created_by   uuid references members(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists quiz_answers (
  trip_id     uuid not null references trips(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  quiz_id     text not null,
  q           int  not null,
  choice      int  not null,
  correct     boolean not null,
  answered_at timestamptz not null default now(),
  primary key (member_id, quiz_id, q)
);

create table if not exists challenges_done (
  trip_id      uuid not null references trips(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  challenge_id text not null,
  done_at      timestamptz not null default now(),
  primary key (member_id, challenge_id)
);

-- ---------- Funciones de seguridad ----------
create or replace function is_member(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from member_devices where user_id = auth.uid() and trip_id = t);
$$;

create or replace function owns_member(m uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from member_devices where user_id = auth.uid() and member_id = m);
$$;

-- Nombres de los miembros de un viaje (para la pantalla de "¿Quién eres?")
create or replace function trip_member_names(p_code text)
returns table(name text, color text)
language sql stable security definer set search_path = public as $$
  select m.name, m.color from members m
  join trips t on t.id = m.trip_id
  where upper(t.join_code) = upper(trim(p_code))
  order by m.created_at;
$$;

-- Unirse a un viaje con el código y un nombre. Si el nombre ya existe,
-- este dispositivo pasa a ser de esa persona (útil al cambiar de móvil).
create or replace function join_trip(p_code text, p_name text)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_trip uuid;
  v_member uuid;
  v_n int;
  v_palette text[] := array['#FF5A4E','#2B59FF','#13A89E','#A560F8','#E07F00','#E2448C','#3FA700','#0E7CB5','#B5651D','#6B6B6B'];
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  if coalesce(trim(p_name),'') = '' or length(trim(p_name)) > 30 then raise exception 'bad_name'; end if;
  select id into v_trip from trips where upper(join_code) = upper(trim(p_code));
  if v_trip is null then raise exception 'bad_code'; end if;

  select id into v_member from members where trip_id = v_trip and lower(name) = lower(trim(p_name));
  if v_member is null then
    select count(*) into v_n from members where trip_id = v_trip;
    insert into members(trip_id, name, color)
      values (v_trip, trim(p_name), v_palette[(v_n % array_length(v_palette,1)) + 1])
      returning id into v_member;
  end if;

  insert into member_devices(user_id, trip_id, member_id) values (auth.uid(), v_trip, v_member)
    on conflict (user_id, trip_id) do update set member_id = excluded.member_id;

  return json_build_object('trip_id', v_trip, 'member_id', v_member);
end;
$$;

-- ---------- Seguridad por filas (solo los miembros ven y editan su viaje) ----------
alter table trips           enable row level security;
alter table members         enable row level security;
alter table member_devices  enable row level security;
alter table activities      enable row level security;
alter table expenses        enable row level security;
alter table payments        enable row level security;
alter table quiz_answers    enable row level security;
alter table challenges_done enable row level security;

do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
    and tablename in ('trips','members','member_devices','activities','expenses','payments','quiz_answers','challenges_done')
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

create policy trips_read   on trips   for select using (is_member(id));
create policy trips_update on trips   for update using (is_member(id)) with check (is_member(id));

create policy members_read   on members for select using (is_member(trip_id));
create policy members_update on members for update using (owns_member(id)) with check (owns_member(id));

create policy devices_read on member_devices for select using (user_id = auth.uid());

create policy act_all on activities for all using (is_member(trip_id)) with check (is_member(trip_id));
create policy exp_all on expenses   for all using (is_member(trip_id)) with check (is_member(trip_id));
create policy pay_all on payments   for all using (is_member(trip_id)) with check (is_member(trip_id));

create policy qa_read  on quiz_answers for select using (is_member(trip_id));
create policy qa_write on quiz_answers for insert with check (is_member(trip_id) and owns_member(member_id));
create policy qa_upd   on quiz_answers for update using (owns_member(member_id)) with check (owns_member(member_id));

create policy ch_read  on challenges_done for select using (is_member(trip_id));
create policy ch_write on challenges_done for insert with check (is_member(trip_id) and owns_member(member_id));
create policy ch_del   on challenges_done for delete using (owns_member(member_id));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on function join_trip(text,text) from public;
grant execute on function join_trip(text,text) to authenticated;
grant execute on function trip_member_names(text) to anon, authenticated;
grant execute on function is_member(uuid), owns_member(uuid) to authenticated;

-- ---------- Tiempo real ----------
do $$
declare t text;
begin
  foreach t in array array['trips','members','activities','expenses','payments','quiz_answers','challenges_done'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Vuestro viaje ----------
-- El itinerario lo carga la app automáticamente la primera vez que alguien entra.
insert into trips(name, start_date, end_date, join_code, eur_czk)
values ('Praga', '2026-10-27', '2026-11-01', 'PRAGA-BVHMWG', 24.36)
on conflict (join_code) do nothing;


-- ---------- Documentos y fotos ----------
-- Ejecuta también supabase/files.sql (tabla de documentos y almacenamiento de archivos).
