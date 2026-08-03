const { Client } = require('pg');
const client = new Client("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
client.connect().then(async () => {
  try {
    await client.query("ALTER TABLE public.payments ALTER COLUMN service_id DROP NOT NULL;");
    await client.query("ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id);");
    console.log("DB Altered Successfully");
  } catch(e) { console.error("Error altering DB:", e); }
  finally { client.end(); }
});
