-- =====================================================================
-- TravelQuest · Praga — planning v2 (comida y cena cada día)
-- Ejecuta en Supabase → SQL Editor → Run.
-- Sustituye el itinerario inicial por el nuevo. Los planes que hayáis
-- añadido vosotros desde la app se conservan; los del itinerario inicial
-- (aunque los hayáis editado) se reemplazan.
-- =====================================================================

alter table activities drop constraint if exists activities_slot_check;
alter table activities add constraint activities_slot_check check (slot in ('manana','comer','tarde','cena','noche'));

delete from activities where id::text like 'a0000000-0000-4000-8000-%';

with t as (select id from trips where join_code = 'PRAGA-BVHMWG')
insert into activities (id, trip_id, day, slot, position, title, time, items, note, price, tier, address, lat, lng)
select v.id::uuid, t.id, v.day::date, v.slot, 0, v.title, v.time, v.items::jsonb, v.note, v.price, v.tier, v.address, v.lat::double precision, v.lng::double precision
from t, (values
  ('a0000002-0000-4000-8000-000000000001', '2026-10-27', 'manana', 'Llegada a Praga', '≈14:00', '[{"t":"Traslado al hotel","lat":50.1008,"lng":14.26},{"t":"Check-in y descanso","lat":50.0917,"lng":14.4215}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000002', '2026-10-27', 'tarde', 'Primer contacto con Praga', '16:00 aprox.', '[{"t":"Plaza de la Ciudad Vieja","lat":50.0875,"lng":14.4213},{"t":"Reloj Astronómico","lat":50.087,"lng":14.4207},{"t":"Iglesia de Týn","lat":50.0877,"lng":14.4227},{"t":"Paseo por el centro"}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000003', '2026-10-27', 'noche', 'Puente de Carlos y Malá Strana', null, '[{"t":"Puente de Carlos iluminado","lat":50.0865,"lng":14.4114},{"t":"Pequeña vuelta por Malá Strana","lat":50.088,"lng":14.4034}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000004', '2026-10-27', 'cena', 'Lokál Dlouhááá', null, '[]', 'Junto al hotel. Goulash, schnitzel y cerveza checa.', '12–18 € por persona', '€', 'Dlouhá 33, Praha 1', 50.0905, 14.4252),
  ('a0000002-0000-4000-8000-000000000005', '2026-10-28', 'manana', 'Free tour en español', '10:00–12:30', '[{"t":"Plaza de la Ciudad Vieja","lat":50.0875,"lng":14.4213},{"t":"Reloj Astronómico","lat":50.087,"lng":14.4207},{"t":"Barrio Judío (exterior)","lat":50.0901,"lng":14.4187}]', 'Hoy es fiesta nacional en Chequia (28 de octubre): puede haber más gente y algún horario especial.', null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000006', '2026-10-28', 'comer', 'U Parlamentu', null, '[]', 'Cerca del tour. Cocina checa tradicional.', '10–15 € por persona', '€', 'Valentinská 8, Praha 1', 50.0889, 14.4172),
  ('a0000002-0000-4000-8000-000000000007', '2026-10-28', 'tarde', 'Josefov y centro', null, '[{"t":"Sinagogas y Cementerio Judío (entrada)","lat":50.0896,"lng":14.4166},{"t":"Torre de la Pólvora","lat":50.087,"lng":14.4278},{"t":"Casa Municipal","lat":50.0878,"lng":14.4281},{"t":"Plaza de Wenceslao","lat":50.0814,"lng":14.427},{"t":"Museo Nacional (exterior)","lat":50.079,"lng":14.431}]', 'El Museo Judío cierra a las 16:30 y no abre el sábado: empezad la tarde por las sinagogas. Entrada unos 550 CZK (≈22 €).', null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000008', '2026-10-28', 'cena', 'U Pivrnce', null, '[]', 'En el centro, cerca del hotel. Comida checa y ambiente local.', '15–22 € por persona', '€€', 'Maiselova 3, Praha 1', 50.0891, 14.419),
  ('a0000002-0000-4000-8000-000000000009', '2026-10-28', 'noche', 'Café y ambiente en el centro', null, '[{"t":"Café Louvre (opcional)","lat":50.0821,"lng":14.4196},{"t":"Ambiente en el centro"}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000010', '2026-10-29', 'manana', 'Malá Strana', null, '[{"t":"Puente de Carlos (de día)","lat":50.0865,"lng":14.4114},{"t":"Iglesia de San Nicolás","lat":50.088,"lng":14.4034},{"t":"Muro de John Lennon","lat":50.0862,"lng":14.4069},{"t":"Isla Kampa","lat":50.0845,"lng":14.408},{"t":"Paseo por Malá Strana","lat":50.088,"lng":14.4034}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000011', '2026-10-29', 'comer', 'Restaurace U Mlynáře', null, '[]', 'Comida temprana en Malá Strana. Cocina checa con buenas vistas.', '12–18 € por persona', '€€', 'Nerudova 18, Praha 1', 50.0883, 14.4013),
  ('a0000002-0000-4000-8000-000000000012', '2026-10-29', 'tarde', 'Crucero por el Moldava', '15:00–16:50', '[{"t":"14:30 embarque"},{"t":"Crucero de 1 h 50 min"},{"t":"Vistas de los monumentos desde el río"}]', 'Entrada unos 25 €. Añade el punto de embarque cuando tengáis el billete.', null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000013', '2026-10-29', 'cena', 'Kozlovna Apropos', null, '[]', 'Cerca del Puente de Carlos. Cocina checa tradicional.', '15–22 € por persona', '€€', 'Křížovnická 4, Praha 1', 50.0878, 14.4161),
  ('a0000002-0000-4000-8000-000000000014', '2026-10-29', 'noche', 'Río y Ciudad Vieja iluminada', null, '[{"t":"Paseo por el río","lat":50.0848,"lng":14.4128},{"t":"Ciudad Vieja iluminada","lat":50.0875,"lng":14.4213}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000015', '2026-10-30', 'manana', 'Castillo de Praga (entrada)', '9:00–13:00', '[{"t":"Catedral de San Vito","lat":50.0909,"lng":14.4005},{"t":"Antiguo Palacio Real","lat":50.0903,"lng":14.4019},{"t":"Basílica de San Jorge","lat":50.091,"lng":14.4031},{"t":"Callejón del Oro","lat":50.0921,"lng":14.404},{"t":"Vistas de Hradčany","lat":50.0894,"lng":14.3978}]', 'Entrada unos 450 CZK (≈18 €).', null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000016', '2026-10-30', 'comer', 'St. Martin', null, '[]', 'En Malá Strana. Cocina checa tradicional.', '12–18 € por persona', '€€', 'Vlašská 7, Praha 1', 50.087, 14.4),
  ('a0000002-0000-4000-8000-000000000017', '2026-10-30', 'tarde', 'Bajada a Malá Strana', null, '[{"t":"Bajada por Hradčany y calle Nerudova","lat":50.0886,"lng":14.398},{"t":"Tiempo libre en Malá Strana","lat":50.088,"lng":14.4034},{"t":"Paseo junto al Moldava","lat":50.0848,"lng":14.4128}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000018', '2026-10-30', 'cena', 'Restaurace U Černého vola', null, '[]', 'En Hradčany. Ambiente histórico.', '15–25 € por persona', '€€', 'Loretánské nám. 1, Praha 1', 50.0889, 14.3925),
  ('a0000002-0000-4000-8000-000000000019', '2026-10-30', 'noche', 'Noche en el centro', null, '[{"t":"Puente de Carlos o centro","lat":50.0865,"lng":14.4114},{"t":"Ambiente nocturno"}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000020', '2026-10-31', 'manana', 'Petřín y Strahov', null, '[{"t":"Funicular de Petřín","lat":50.0815,"lng":14.4047},{"t":"Torre de Petřín","lat":50.0835,"lng":14.3951},{"t":"Jardines y miradores","lat":50.083,"lng":14.399},{"t":"Monasterio de Strahov","lat":50.0863,"lng":14.3893}]', 'El funicular reabrió en septiembre de 2026 tras dos años de obras: 100 CZK el trayecto.', null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000021', '2026-10-31', 'comer', 'Strahov Monastery Brewery', null, '[]', 'Junto al monasterio. Cocina checa y cerveza propia.', '12–18 € por persona', '€€', 'Strahovské nádvoří 301, Praha 1', 50.0864, 14.389),
  ('a0000002-0000-4000-8000-000000000022', '2026-10-31', 'tarde', 'Tarde libre', null, '[{"t":"Bajada a Malá Strana","lat":50.088,"lng":14.4034},{"t":"Compras o visitas pendientes"},{"t":"Vinohrady (si apetece)","lat":50.0755,"lng":14.441},{"t":"Letná (si apetece)","lat":50.0965,"lng":14.417}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000023', '2026-10-31', 'cena', 'Mlejnice', null, '[]', 'En el centro, junto a la Plaza Vieja. Ideal para una cena especial.', '18–30 € por persona', '€€€', 'Kožná 14, Praha 1', 50.0858, 14.4209),
  ('a0000002-0000-4000-8000-000000000024', '2026-10-31', 'noche', 'Halloween en Praga', null, '[{"t":"Copas y ambiente"}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000025', '2026-11-01', 'manana', 'Vyšehrad', '9:30–12:30', '[{"t":"Fortaleza y murallas","lat":50.064,"lng":14.418},{"t":"Basílica de San Pedro y San Pablo","lat":50.0645,"lng":14.4185},{"t":"Cementerio Slavín","lat":50.0648,"lng":14.4176},{"t":"Vistas del Moldava","lat":50.0634,"lng":14.4198}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000026', '2026-11-01', 'comer', 'U Medvídků', null, '[]', 'En el centro. Cocina checa y cerveza histórica.', '12–20 € por persona', '€€', 'Na Perštýně 7, Praha 1', 50.0829, 14.4193),
  ('a0000002-0000-4000-8000-000000000027', '2026-11-01', 'tarde', 'Últimas horas en Praga', 'hasta 15:30–16:00', '[{"t":"Última vuelta por la Ciudad Vieja","lat":50.0875,"lng":14.4213},{"t":"Compras de recuerdos"},{"t":"Recoger maletas en el hotel","lat":50.0917,"lng":14.4215}]', null, null, null, null, null, null),
  ('a0000002-0000-4000-8000-000000000028', '2026-11-01', 'noche', 'Traslado al aeropuerto', null, '[{"t":"Salir del hotel aprox. 16:00","lat":50.0917,"lng":14.4215},{"t":"Vuelo sobre las 19:00","lat":50.1008,"lng":14.26}]', null, null, null, null, null, null)
) as v(id, day, slot, title, time, items, note, price, tier, address, lat, lng)
on conflict (id) do nothing;
