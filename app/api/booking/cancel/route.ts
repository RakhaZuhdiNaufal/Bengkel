import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { booking_id, service_id } = await req.json();

    if (!booking_id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: 'user-auth-token' },
        auth: { storageKey: 'user-auth-token' },
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: bookingCheck } = await adminClient
      .from("bookings")
      .select("user_id")
      .eq("id", booking_id)
      .single();

    if (bookingCheck?.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await adminClient.from("bookings").update({ status: 'batal' }).eq('id', booking_id);

    if (service_id) {
      await adminClient.from("services").update({ status: 'dibatalkan' }).eq('id', service_id);
      await adminClient.from("payments").update({ status: 'dibatalkan' }).eq('service_id', service_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
