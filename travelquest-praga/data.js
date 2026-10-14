/* TravelQuest · Praga — datos iniciales del viaje, quizzes y retos.
   El itinerario se copia a la base de datos la primera vez que alguien entra;
   después todo se edita desde la app. Los quizzes y retos viven aquí. */

window.TQ_DATA = (() => {
  const P = { // lugares: [lat, lng]
    hotel: [50.0917, 14.4215], airport: [50.1008, 14.2600],
    oldTownSq: [50.0875, 14.4213], clock: [50.0870, 14.4207], tyn: [50.0877, 14.4227],
    charlesBr: [50.0865, 14.4114], malaStrana: [50.0880, 14.4034], stNicholas: [50.0880, 14.4034],
    lennon: [50.0862, 14.4069], kampa: [50.0845, 14.4080], riverWalk: [50.0848, 14.4128],
    carolinum: [50.0863, 14.4237], powderTower: [50.0870, 14.4278], municipal: [50.0878, 14.4281],
    wenceslas: [50.0814, 14.4270], natMuseum: [50.0790, 14.4310], novemesto: [50.0800, 14.4230],
    josefov: [50.0901, 14.4187], louvre: [50.0821, 14.4196],
    stVitus: [50.0909, 14.4005], oldPalace: [50.0903, 14.4019], stGeorge: [50.0910, 14.4031],
    goldenLane: [50.0921, 14.4040], hradcany: [50.0894, 14.3978], nerudova: [50.0886, 14.3980],
    spanishSyn: [50.0901, 14.4214], maiselSyn: [50.0886, 14.4196], pinkasSyn: [50.0896, 14.4166], jewCemetery: [50.0899, 14.4168],
    funicular: [50.0815, 14.4047], petrinTower: [50.0835, 14.3951], petrinGardens: [50.0830, 14.3990], strahov: [50.0863, 14.3893],
    vysehrad: [50.0640, 14.4180], basilica: [50.0645, 14.4185], slavin: [50.0648, 14.4176], vysView: [50.0634, 14.4198],
    vinohrady: [50.0755, 14.4410], letna: [50.0965, 14.4170]
  };
  const it = (t, p) => p ? { t, lat: P[p][0], lng: P[p][1] } : { t };
  let n = 0;
  const id = () => 'a0000002-0000-4000-8000-' + String(++n).padStart(12, '0');
  const A = (day, slot, title, items, extra = {}) => ({ id: id(), day, slot, position: 0, title, items, time: null, note: null, price: null, tier: null, address: null, lat: null, lng: null, ...extra });
  const R = (day, slot, title, desc, tier, price, address, latlng) => A(day, slot, title, [], { note: desc, tier, price, address, lat: latlng ? latlng[0] : null, lng: latlng ? latlng[1] : null });

  const activities = [
    // Martes 27 · Llegada y primer contacto
    A('2026-10-27', 'manana', 'Llegada a Praga', [it('Traslado al hotel', 'airport'), it('Check-in y descanso', 'hotel')], { time: '≈14:00' }),
    A('2026-10-27', 'tarde', 'Primer contacto con Praga', [it('Plaza de la Ciudad Vieja', 'oldTownSq'), it('Reloj Astronómico', 'clock'), it('Iglesia de Týn', 'tyn'), it('Paseo por el centro')], { time: '16:00 aprox.' }),
    A('2026-10-27', 'noche', 'Puente de Carlos y Malá Strana', [it('Puente de Carlos iluminado', 'charlesBr'), it('Pequeña vuelta por Malá Strana', 'malaStrana')]),
    R('2026-10-27', 'cena', 'Lokál Dlouhááá', 'Junto al hotel. Goulash, schnitzel y cerveza checa.', '€', '12–18 € por persona', 'Dlouhá 33, Praha 1', [50.0905, 14.4252]),
    // Miércoles 28 · Ciudad Vieja y Josefov
    A('2026-10-28', 'manana', 'Free tour en español', [it('Plaza de la Ciudad Vieja', 'oldTownSq'), it('Reloj Astronómico', 'clock'), it('Barrio Judío (exterior)', 'josefov')], { time: '10:00–12:30', note: 'Hoy es fiesta nacional en Chequia (28 de octubre): puede haber más gente y algún horario especial.' }),
    R('2026-10-28', 'comer', 'U Parlamentu', 'Cerca del tour. Cocina checa tradicional.', '€', '10–15 € por persona', 'Valentinská 8, Praha 1', [50.0889, 14.4172]),
    A('2026-10-28', 'tarde', 'Josefov y centro', [it('Sinagogas y Cementerio Judío (entrada)', 'pinkasSyn'), it('Torre de la Pólvora', 'powderTower'), it('Casa Municipal', 'municipal'), it('Plaza de Wenceslao', 'wenceslas'), it('Museo Nacional (exterior)', 'natMuseum')], { note: 'El Museo Judío cierra a las 16:30 y no abre el sábado: empezad la tarde por las sinagogas. Entrada unos 550 CZK (≈22 €).' }),
    R('2026-10-28', 'cena', 'U Pivrnce', 'En el centro, cerca del hotel. Comida checa y ambiente local.', '€€', '15–22 € por persona', 'Maiselova 3, Praha 1', [50.0891, 14.4190]),
    A('2026-10-28', 'noche', 'Café y ambiente en el centro', [it('Café Louvre (opcional)', 'louvre'), it('Ambiente en el centro')]),
    // Jueves 29 · Malá Strana y crucero
    A('2026-10-29', 'manana', 'Malá Strana', [it('Puente de Carlos (de día)', 'charlesBr'), it('Iglesia de San Nicolás', 'stNicholas'), it('Muro de John Lennon', 'lennon'), it('Isla Kampa', 'kampa'), it('Paseo por Malá Strana', 'malaStrana')]),
    R('2026-10-29', 'comer', 'Restaurace U Mlynáře', 'Comida temprana en Malá Strana. Cocina checa con buenas vistas.', '€€', '12–18 € por persona', 'Nerudova 18, Praha 1', [50.0883, 14.4013]),
    A('2026-10-29', 'tarde', 'Crucero por el Moldava', [it('14:30 embarque'), it('Crucero de 1 h 50 min'), it('Vistas de los monumentos desde el río')], { time: '15:00–16:50', note: 'Entrada unos 25 €. Añade el punto de embarque cuando tengáis el billete.' }),
    R('2026-10-29', 'cena', 'Kozlovna Apropos', 'Cerca del Puente de Carlos. Cocina checa tradicional.', '€€', '15–22 € por persona', 'Křížovnická 4, Praha 1', [50.0878, 14.4161]),
    A('2026-10-29', 'noche', 'Río y Ciudad Vieja iluminada', [it('Paseo por el río', 'riverWalk'), it('Ciudad Vieja iluminada', 'oldTownSq')]),
    // Viernes 30 · Castillo de Praga
    A('2026-10-30', 'manana', 'Castillo de Praga (entrada)', [it('Catedral de San Vito', 'stVitus'), it('Antiguo Palacio Real', 'oldPalace'), it('Basílica de San Jorge', 'stGeorge'), it('Callejón del Oro', 'goldenLane'), it('Vistas de Hradčany', 'hradcany')], { time: '9:00–13:00', note: 'Entrada unos 450 CZK (≈18 €).' }),
    R('2026-10-30', 'comer', 'St. Martin', 'En Malá Strana. Cocina checa tradicional.', '€€', '12–18 € por persona', 'Vlašská 7, Praha 1', [50.0870, 14.4000]),
    A('2026-10-30', 'tarde', 'Bajada a Malá Strana', [it('Bajada por Hradčany y calle Nerudova', 'nerudova'), it('Tiempo libre en Malá Strana', 'malaStrana'), it('Paseo junto al Moldava', 'riverWalk')]),
    R('2026-10-30', 'cena', 'Restaurace U Černého vola', 'En Hradčany. Ambiente histórico.', '€€', '15–25 € por persona', 'Loretánské nám. 1, Praha 1', [50.0889, 14.3925]),
    A('2026-10-30', 'noche', 'Noche en el centro', [it('Puente de Carlos o centro', 'charlesBr'), it('Ambiente nocturno')]),
    // Sábado 31 · Petřín + Halloween
    A('2026-10-31', 'manana', 'Petřín y Strahov', [it('Funicular de Petřín', 'funicular'), it('Torre de Petřín', 'petrinTower'), it('Jardines y miradores', 'petrinGardens'), it('Monasterio de Strahov', 'strahov')], { note: 'El funicular reabrió en septiembre de 2026 tras dos años de obras: 100 CZK el trayecto.' }),
    R('2026-10-31', 'comer', 'Strahov Monastery Brewery', 'Junto al monasterio. Cocina checa y cerveza propia.', '€€', '12–18 € por persona', 'Strahovské nádvoří 301, Praha 1', [50.0864, 14.3890]),
    A('2026-10-31', 'tarde', 'Tarde libre', [it('Bajada a Malá Strana', 'malaStrana'), it('Compras o visitas pendientes'), it('Vinohrady (si apetece)', 'vinohrady'), it('Letná (si apetece)', 'letna')]),
    R('2026-10-31', 'cena', 'Mlejnice', 'En el centro, junto a la Plaza Vieja. Ideal para una cena especial.', '€€€', '18–30 € por persona', 'Kožná 14, Praha 1', [50.0858, 14.4209]),
    A('2026-10-31', 'noche', 'Halloween en Praga', [it('Copas y ambiente')]),
    // Domingo 1 · Vyšehrad y regreso
    A('2026-11-01', 'manana', 'Vyšehrad', [it('Fortaleza y murallas', 'vysehrad'), it('Basílica de San Pedro y San Pablo', 'basilica'), it('Cementerio Slavín', 'slavin'), it('Vistas del Moldava', 'vysView')], { time: '9:30–12:30' }),
    R('2026-11-01', 'comer', 'U Medvídků', 'En el centro. Cocina checa y cerveza histórica.', '€€', '12–20 € por persona', 'Na Perštýně 7, Praha 1', [50.0829, 14.4193]),
    A('2026-11-01', 'tarde', 'Últimas horas en Praga', [it('Última vuelta por la Ciudad Vieja', 'oldTownSq'), it('Compras de recuerdos'), it('Recoger maletas en el hotel', 'hotel')], { time: 'hasta 15:30–16:00' }),
    A('2026-11-01', 'noche', 'Traslado al aeropuerto', [it('Salir del hotel aprox. 16:00', 'hotel'), it('Vuelo sobre las 19:00', 'airport')])
  ];

  const days = [
    { date: '2026-10-27', label: 'Martes 27', short: 'Mar 27', theme: 'Llegada y primer contacto', tag: 'Llegada', walk: '5–10 min', color: '#E0473C', icon: 'plane' },
    { date: '2026-10-28', label: 'Miércoles 28', short: 'Mié 28', theme: 'Ciudad Vieja y Josefov', tag: 'Josefov', walk: '0–15 min (todo el día)', color: '#2B59FF', icon: 'walk' },
    { date: '2026-10-29', label: 'Jueves 29', short: 'Jue 29', theme: 'Malá Strana y crucero', tag: 'Crucero', walk: '10–20 min (por el puente)', color: '#2E9E3A', icon: 'boat' },
    { date: '2026-10-30', label: 'Viernes 30', short: 'Vie 30', theme: 'Castillo de Praga', tag: 'Castillo', walk: '20–30 min (o tranvía)', color: '#E07F00', icon: 'castle' },
    { date: '2026-10-31', label: 'Sábado 31', short: 'Sáb 31', theme: 'Petřín + Halloween', tag: 'Halloween', walk: '20–30 min (o tranvía y funicular)', color: '#8A4FD8', icon: 'tower' },
    { date: '2026-11-01', label: 'Domingo 1', short: 'Dom 1', theme: 'Vyšehrad y regreso', tag: 'Regreso', walk: '0–10 min (centro)', color: '#0E7CB5', icon: 'plane' }
  ];

  const hotel = { name: 'Hotel Caruso Old Town', address: 'U Milosrdných 2, Praha 1', note: '4*, desayuno incluido. Junto a Josefov.', lat: P.hotel[0], lng: P.hotel[1] };

  const tips = [
    ['Comida económica', '7–12 € por persona'],
    ['Comida normal', '12–18 € por persona'],
    ['Cena especial', '20–30 € por persona'],
    ['Cerveza local (0,5 l)', '1,5–3,5 €; en restaurante, 2–4 €'],
    ['Castillo de Praga', '450 CZK (≈18 €)'],
    ['Museo Judío (sinagogas)', '550 CZK (≈22 €)'],
    ['Crucero por el Moldava', '≈25 €']
  ];

  // Quizzes: 'pre' disponible ya; los de cada día se desbloquean a las 18:00 (hora de Praga).
  const quizzes = [
    { id: 'pre', day: null, title: 'Calentamiento', sub: 'Antes de volar', qs: [
      { q: '¿Qué moneda se usa en Chequia?', o: ['El euro', 'La corona checa', 'El złoty', 'El florín'], a: 1, e: 'Chequia sigue usando la corona checa (CZK). En muchos sitios aceptan euros, pero con mal cambio: mejor pagar con tarjeta en coronas.' },
      { q: '¿Qué río atraviesa Praga?', o: ['El Danubio', 'El Elba', 'El Moldava', 'El Rin'], a: 2, e: 'El Moldava (Vltava en checo). Desemboca en el Elba unos 30 km al norte de Praga.' },
      { q: '¿Cómo se apoda a Praga?', o: ['La ciudad de las cien torres', 'La ciudad de los mil puentes', 'La Venecia del norte', 'La ciudad eterna'], a: 0, e: '«La ciudad de las cien torres», aunque en realidad tiene muchas más.' },
      { q: '¿Qué escritor nacido en Praga escribió «La metamorfosis»?', o: ['Milan Kundera', 'Franz Kafka', 'Jaroslav Hašek', 'Václav Havel'], a: 1, e: 'Franz Kafka nació en Praga en 1883, junto a la Plaza de la Ciudad Vieja.' },
      { q: '¿Qué estilo de cerveza nació en la ciudad checa de Plzeň en 1842?', o: ['Stout', 'IPA', 'Pilsner', 'Weissbier'], a: 2, e: 'La Pilsner Urquell se elaboró por primera vez en 1842 y dio nombre al estilo pilsner.' }
    ]},
    { id: 'd27', day: '2026-10-27', title: 'Ciudad Vieja y el puente', qs: [
      { q: '¿En qué año se instaló el Reloj Astronómico?', o: ['1410', '1592', '1784', '1891'], a: 0, e: 'En 1410. Es el reloj astronómico más antiguo del mundo que sigue funcionando.' },
      { q: 'En el Reloj Astronómico, ¿qué hace la figura del esqueleto en cada hora?', o: ['Baila', 'Toca una campana', 'Saluda con el sombrero', 'Abre un libro'], a: 1, e: 'El esqueleto representa la Muerte y tira de la cuerda de una campana mientras desfilan los apóstoles.' },
      { q: '¿Qué rey impulsó la construcción del Puente de Carlos en 1357?', o: ['Carlos IV', 'Carlos V', 'Wenceslao I', 'Rodolfo II'], a: 0, e: 'Carlos IV, rey de Bohemia y emperador. El puente lleva su nombre desde el siglo XIX.' },
      { q: '¿Cuántas estatuas y grupos escultóricos adornan el Puente de Carlos?', o: ['12', '20', '30', '44'], a: 2, e: 'Treinta, casi todas barrocas. Hoy la mayoría son réplicas; los originales están en museos.' },
      { q: '¿Qué santo fue arrojado al Moldava desde el puente, según la tradición?', o: ['San Wenceslao', 'San Juan Nepomuceno', 'San Vito', 'San Jorge'], a: 1, e: 'San Juan Nepomuceno, en 1393. Tocar la placa de bronce de su estatua da buena suerte.' }
    ]},
    { id: 'd28', day: '2026-10-28', title: 'Josefov y centro', qs: [
      { q: 'Hoy, 28 de octubre, es fiesta nacional en Chequia. ¿Qué se celebra?', o: ['La Revolución de Terciopelo', 'La fundación de Checoslovaquia en 1918', 'La entrada en la UE', 'La coronación de Carlos IV'], a: 1, e: 'El 28 de octubre de 1918 se proclamó la independencia de Checoslovaquia, precisamente en la Casa Municipal que habéis visto hoy.' },
      { q: 'En las paredes de la Sinagoga Pinkas están escritos los nombres de...', o: ['Los rabinos de Praga', 'Casi 80.000 víctimas judías del Holocausto de Bohemia y Moravia', 'Los fundadores del barrio', 'Los benefactores de la sinagoga'], a: 1, e: 'Es un memorial con los nombres de casi 80.000 víctimas judías de Bohemia y Moravia.' },
      { q: '¿Por qué la Torre de la Pólvora se llama así?', o: ['Explotó en 1700', 'Se usó para almacenar pólvora', 'La construyó un fabricante de armas', 'Por su color gris'], a: 1, e: 'En el siglo XVII se usó como almacén de pólvora y le quedó el nombre.' },
      { q: '¿Qué acontecimiento de 1989 tuvo su gran escenario en la Plaza de Wenceslao?', o: ['La caída del Muro de Berlín', 'La Revolución de Terciopelo', 'La Primavera de Praga', 'Un concierto de los Rolling Stones'], a: 1, e: 'La Revolución de Terciopelo, que acabó pacíficamente con el régimen comunista.' },
      { q: 'Según la leyenda del Barrio Judío, ¿qué creó el rabino Loew con barro del Moldava?', o: ['Un dragón', 'Un gólem', 'Un reloj mágico', 'Un puente'], a: 1, e: 'El Gólem, un gigante de barro que protegía el gueto. Dicen que sus restos siguen en el desván de la Sinagoga Vieja-Nueva.' }
    ]},
    { id: 'd29', day: '2026-10-29', title: 'Malá Strana y el río', qs: [
      { q: '¿Tras qué suceso empezó a llenarse de pintadas el Muro de John Lennon?', o: ['Un concierto de los Beatles en Praga', 'El asesinato de Lennon en 1980', 'La caída del comunismo', 'El estreno de «Imagine»'], a: 1, e: 'Tras el asesinato de Lennon en 1980 aparecieron mensajes de paz y protesta contra el régimen.' },
      { q: '¿De qué estilo es la Iglesia de San Nicolás de Malá Strana?', o: ['Gótico', 'Románico', 'Barroco', 'Art Nouveau'], a: 2, e: 'Es una de las grandes joyas del barroco en Europa central.' },
      { q: '¿Qué esculturas gigantes de David Černý hay en la Isla Kampa?', o: ['Bebés gateando', 'Pingüinos amarillos', 'Caballos al revés', 'Cabezas que giran'], a: 0, e: 'Bebés de bronce gateando, con la cara como un código de barras.' },
      { q: '¿Cómo se llama el canal que separa la Isla Kampa de Malá Strana?', o: ['Čertovka, el Canal del Diablo', 'Canal del Rey', 'Canal de los Molinos de Oro', 'Vltavka'], a: 0, e: 'Čertovka, «la diablilla». Desde ella se ve una noria de molino.' },
      { q: '¿Qué compositor checo dedicó al Moldava uno de sus poemas sinfónicos más famosos?', o: ['Antonín Dvořák', 'Bedřich Smetana', 'Leoš Janáček', 'Mozart'], a: 1, e: 'Bedřich Smetana, en el ciclo «Mi patria». Seguro que lo habéis oído en algún anuncio.' }
    ]},
    { id: 'd30', day: '2026-10-30', title: 'Castillo y Hradčany', qs: [
      { q: '¿Qué récord tiene el Castillo de Praga?', o: ['Castillo más alto de Europa', 'Mayor complejo de castillo antiguo del mundo', 'Castillo con más torres', 'Castillo más visitado de Europa'], a: 1, e: 'El Guinness lo reconoce como el mayor complejo de castillo antiguo del mundo.' },
      { q: '¿Cuándo se terminó la Catedral de San Vito, empezada en 1344?', o: ['1420', '1650', '1800', '1929'], a: 3, e: 'En 1929, casi 600 años después de colocar la primera piedra.' },
      { q: '¿Qué escritor vivió y escribió en la casa número 22 del Callejón del Oro?', o: ['Kafka', 'Kundera', 'Rilke', 'Hašek'], a: 0, e: 'Franz Kafka trabajó allí en 1916 y 1917, en la casa de su hermana Ottla.' },
      { q: '¿Qué poeta chileno tomó su seudónimo del escritor que da nombre a la calle Nerudova?', o: ['Gabriela Mistral', 'Pablo Neruda', 'Vicente Huidobro', 'Nicanor Parra'], a: 1, e: 'Ricardo Neftalí Reyes adoptó el nombre de Pablo Neruda inspirado por el escritor checo Jan Neruda.' },
      { q: 'Las joyas de la Corona de Bohemia se guardan en la Catedral de San Vito. ¿Cuántas llaves hacen falta para abrir su cámara?', o: ['Una', 'Tres', 'Siete', 'Doce'], a: 2, e: 'Siete, repartidas entre siete personas, entre ellas el presidente de la República y el arzobispo de Praga.' }
    ]},
    { id: 'd31', day: '2026-10-31', title: 'Petřín, Strahov y Halloween', qs: [
      { q: '¿En qué monumento se inspiró la Torre de Petřín?', o: ['El Big Ben', 'La Torre Eiffel', 'La Torre de Pisa', 'La Torre de Londres'], a: 1, e: 'En la Torre Eiffel. Se construyó en 1891 para la Exposición del Jubileo.' },
      { q: '¿Qué atracción curiosa hay junto a la Torre de Petřín?', o: ['Un laberinto de espejos', 'Un acuario', 'Una montaña rusa', 'Un museo de cera'], a: 0, e: 'Un laberinto de espejos de 1891, también de la Exposición del Jubileo.' },
      { q: '¿Por qué es especialmente famoso el Monasterio de Strahov?', o: ['Por su biblioteca histórica', 'Por su zoológico', 'Por su faro', 'Por sus termas'], a: 0, e: 'Por su biblioteca barroca, con las salas Teológica y Filosófica. Y además tiene cervecería propia.' },
      { q: 'Halloween no es tradición checa. ¿Qué celebran los checos el 2 de noviembre?', o: ['Dušičky, día de los difuntos, con velas en los cementerios', 'La fiesta de la cerveza', 'El día de San Martín', 'El carnaval'], a: 0, e: 'Dušičky: las familias llenan los cementerios de velas. Mañana veréis el de Vyšehrad.' },
      { q: '¿Cuánto mide aproximadamente la Torre de Petřín?', o: ['35 m', '63 m', '120 m', '300 m'], a: 1, e: 'Unos 63,5 metros. Parece poca cosa, pero está en lo alto de la colina: subid los 299 escalones y lo entenderéis.' }
    ]},
    { id: 'd01', day: '2026-11-01', title: 'Vyšehrad y despedida', qs: [
      { q: '¿Qué pintor del Art Nouveau está enterrado en el cementerio de Vyšehrad?', o: ['Gustav Klimt', 'Alfons Mucha', 'Egon Schiele', 'Toulouse-Lautrec'], a: 1, e: 'Alfons Mucha, junto a Dvořák, Smetana y otras figuras checas en el panteón Slavín.' },
      { q: 'Según la leyenda, ¿qué princesa profetizó la fundación de Praga desde Vyšehrad?', o: ['Libuše', 'Ludmila', 'Drahomíra', 'Sissi'], a: 0, e: 'La princesa Libuše vio en una visión «una gran ciudad cuya gloria tocaría las estrellas».' },
      { q: '¿Qué son los knedlíky que acompañan a tantos platos checos?', o: ['Encurtidos', 'Bolas o rodajas de masa cocida', 'Patatas fritas', 'Salchichas'], a: 1, e: 'Masa de harina o patata cocida, perfecta para mojar en salsa, como en el svíčková.' },
      { q: 'El trdelník, el dulce enrollado que veréis por todas partes, ¿es un postre tradicional checo?', o: ['Sí, de la época de Carlos IV', 'No, su origen se atribuye a Hungría y Eslovaquia', 'Sí, lo inventaron en Malá Strana', 'Es austriaco'], a: 1, e: 'Se vende como «típico de Praga», pero su origen se sitúa en la región de Hungría y Eslovaquia.' },
      { q: '¿Cómo se dice «¡salud!» al brindar en checo?', o: ['Prost', 'Na zdraví', 'Dobrý den', 'Děkuji'], a: 1, e: 'Na zdraví. Y mirad a los ojos al chocar las jarras, que es lo tradicional.' }
    ]}
  ];

  const challenges = [
    { id: 'c27', day: '2026-10-27', title: 'Primer brindis', text: 'Foto del grupo brindando con cerveza checa la primera noche.', pts: 20 },
    { id: 'c28', day: '2026-10-28', title: 'Habla checo', text: 'Brinda diciendo «Na zdraví» y da las gracias en checo: «Děkuji».', pts: 20 },
    { id: 'c29', day: '2026-10-29', title: 'Buena suerte', text: 'Toca la placa de San Juan Nepomuceno en el Puente de Carlos.', pts: 20 },
    { id: 'c30', day: '2026-10-30', title: 'Tras los pasos de Kafka', text: 'Encuentra la casa nº 22 del Callejón del Oro y hazte una foto.', pts: 20 },
    { id: 'c31', day: '2026-10-31', title: 'Noche de Halloween', text: 'Lleva algo de disfraz o prueba un svařák (vino caliente) en un puesto.', pts: 20 },
    { id: 'c01', day: '2026-11-01', title: 'Despedida', text: 'Pide la cuenta en checo: «Zaplatím, prosím».', pts: 20 }
  ];

  return { trip: { name: 'Praga', start: '2026-10-27', end: '2026-11-01' }, days, activities, hotel, tips, quizzes, challenges };
})();
