// src/supabaseClient.js or src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and public anon key
// You can find these in your Supabase project settings -> API
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: If you're using TypeScript, you might want to define the database type
// import { Database } from './database.types'; // Generate this type with Supabase CLI
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);