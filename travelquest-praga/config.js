/* Configuración de TravelQuest · Praga
   1. Pega aquí la URL y la clave pública de tu proyecto de Supabase
      (Supabase → Project Settings → API / API Keys).
   2. Si lo dejas vacío, la app funciona en "modo demo": los datos se guardan
      solo en ese móvil y no se comparten. */
window.TQ_CONFIG = {
  SUPABASE_URL: 'https://msbacinmcekoiqadgzgj.supabase.co',          // p. ej. 'https://abcdefgh.supabase.co'
  SUPABASE_KEY: 'sb_publishable_HswPCyWaPtQsCLU1K1FicA_X6DER-YL',          // la clave "publishable" o "anon public" (nunca la service_role)
  TRIP_CODE: 'PRAGA-BVHMWG'  // el mismo código que está al final de supabase/setup.sql
};
