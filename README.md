# TravelQuest · Praga

Web instalable (PWA) para el viaje a Praga del 27 de octubre al 1 de noviembre de 2026.
Plan por días editable, mapa, gastos compartidos, quiz diario y retos. Lo que cambia uno
lo ven los demás al momento, y funciona sin conexión con lo último que se cargó.

No hay que compilar nada: son archivos estáticos. Los datos compartidos viven en Supabase
(plan gratuito) y la web se sirve desde Vercel.

---

## 1. Supabase (10 minutos, una sola vez)

1. Entra en https://supabase.com y crea un proyecto nuevo.
   - Región: **Central EU (Frankfurt)**, la más cercana a Praga y a España.
   - Guarda la contraseña de la base de datos en algún sitio (no la necesita la app).
2. Ve a **SQL Editor → New query**, pega el contenido completo de `supabase/setup.sql`
   y pulsa **Run**. Debe terminar sin errores.
3. Ve a **Authentication → Sign In / Providers** y activa **Allow anonymous sign-ins**.
   Así cada uno entra solo con su nombre, sin contraseñas ni emails.
4. Ve a **Project Settings → API Keys** (o **API**) y copia:
   - la **Project URL** (`https://xxxx.supabase.co`)
   - la clave **publishable** (`sb_publishable_...`) o, en proyectos antiguos, la **anon public**.
   Nunca uses la `service_role` / `secret`.
5. Pégalas en `config.js`:

```js
window.TQ_CONFIG = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_KEY: 'sb_publishable_xxxxxxxx',
  TRIP_CODE: 'PRAGA-BVHMWG'
};
```

> Los proyectos gratuitos de Supabase se pausan tras 7 días sin uso. Abrid la app de vez
> en cuando antes del viaje; si se pausa, se reactiva con un clic desde el panel.

## 2. Publicar en Vercel

**Opción A (recomendada): GitHub + Vercel**
1. Crea un repositorio en GitHub y sube esta carpeta.
2. En Vercel: **Add New → Project → Import** ese repositorio.
3. Framework Preset: **Other**. Sin comando de build. Output directory: la raíz.
4. Deploy. Cada vez que subas un cambio a GitHub se publica solo.

**Opción B: desde el ordenador, sin GitHub**
```bash
cd travelquest-praga
npx vercel --prod
```

Te dará una dirección tipo `https://travelquest-praga.vercel.app`.

## 3. Compartir con el grupo

Manda el enlace por WhatsApp. Cada uno:
1. Lo abre (en iPhone, **en Safari**).
2. Lo instala: iPhone → Compartir → *Añadir a pantalla de inicio*. Android → menú ⋮ → *Instalar aplicación*.
3. Abre la app desde el icono y escribe su nombre.

Si alguien cambia de móvil o la reinstala, que toque su nombre en la lista: recupera su usuario.

Antes de salir, que cada uno abra **Mapa → botón de descarga** con wifi para guardar el mapa
del centro y usarlo sin datos.

## Qué incluye

- **Plan**: los 6 días con mañana, tarde, noche y dónde comer. Todo editable por cualquiera.
  Al tocar un sitio se abre en el mapa; los restaurantes tienen «Cómo llegar» con Google Maps.
- **Mapa**: todos los puntos por colores de día, ruta del día, hotel, tu ubicación y mapa sin conexión.
- **Gastos**: en euros o coronas, quién pagó y entre quién se divide. Calcula el mínimo de pagos para quedar en paz.
- **Quiz y retos**: un quiz de calentamiento ya disponible y uno por día que se abre a las 18:00
  (hora de Praga) sobre lo visitado ese día, más un reto diario. Ranking del grupo.
  En **Ajustes → Modo prueba** se pueden ver todos sin que puntúen.

## Cambiar cosas

- Preguntas del quiz, retos, días, hotel: `data.js`.
- Itinerario inicial: también en `data.js`, pero solo se carga la primera vez. Después se edita desde la app.
- Si cambias archivos, sube el número de `VERSION` en `sw.js` para que los móviles se actualicen.

## Privacidad

Solo los miembros del viaje pueden leer y escribir sus datos (seguridad por filas en Supabase).
Para unirse basta con el enlace de la app, así que no lo publiquéis en abierto.
La búsqueda de direcciones usa OpenStreetMap (Nominatim) y el mapa usa teselas de CARTO.

## Limitaciones conocidas

- No hay notificaciones push: el aviso del quiz aparece dentro de la app.
- Si dos personas editan el mismo plan a la vez, gana el último en guardar.
# Prague-trip
