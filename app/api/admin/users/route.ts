import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "kasir")) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, profile, supabase };
}

export async function POST(request: Request) {
  const auth = await requireStaff();
  if ("error" in auth && auth.error) return auth.error;

  const body = await request.json();
  const {
    email,
    password,
    nama,
    nomor_hp,
    nomor_pelanggan,
    status = "aktif",
    role = "customer",
  } = body;

  if (!email || !nama) {
    return NextResponse.json({ error: "Email dan nama wajib." }, { status: 400 });
  }

  const finalRole =
    auth.profile!.role === "admin" ? role : "customer";

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: password || crypto.randomUUID().slice(0, 12) + "Aa1!",
      email_confirm: true,
      user_metadata: { full_name: nama, nomor_hp },
      app_metadata: { role: finalRole },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      await admin
        .from("users")
        .update({
          nama,
          nomor_hp: nomor_hp || null,
          nomor_pelanggan: nomor_pelanggan || undefined,
          status,
          role: finalRole,
        })
        .eq("id", data.user.id);
    }

    return NextResponse.json({ user: data.user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal membuat user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireStaff();
  if ("error" in auth && auth.error) return auth.error;
  if (auth.profile!.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal hapus user" },
      { status: 500 }
    );
  }
}
