import type { Database } from '@/types/db/database.types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database, 'tucassa'>(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'tucassa' },
});
