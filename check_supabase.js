import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('evaluations').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Data:", data);
  }
}

check();
