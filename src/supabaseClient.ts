import { createClient } from '@supabase/supabase-js';

// Corrected to match your .env file's variable names: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// Forcing new deploy hash (this comment is fine)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: If you're using TypeScript, you might want to define the database type
// import { Database } from './database.types'; // Generate this type with Supabase CLI
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);