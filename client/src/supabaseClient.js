// client/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcankhscmdilajwhdmiv.supabase.co';
// Si usas variable de entorno en tu .env del client (Vite):
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O puedes colocar tu anon key pública directamente aquí:
const supabaseAnonKey = 'sb_publishable_FG_EcMcBV3U5x823-CBzYg_dxJwIuwM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);