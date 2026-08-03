require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: b, error: be } = await supabase.from('bookings').select('*, users(nama)').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Bookings:");
  console.dir(b, { depth: null });

  const { data: s, error: se } = await supabase.from('services').select('*, users(nama)').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Services:");
  console.dir(s, { depth: null });

  const { data: p, error: pe } = await supabase.from('payments').select('*, users(nama)').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Payments:");
  console.dir(p, { depth: null });
}

run();
