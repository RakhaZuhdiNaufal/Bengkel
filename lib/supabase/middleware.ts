import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Tanpa env: jangan crash seluruh app — lanjutkan request biasa
  if (!url || !key) {
    console.error(
      "[supabase] Env missing in middleware. Pastikan .env.local ada dan restart npm run dev."
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/lupa-password");
  const isProtected =
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/admin") ||
    path.startsWith("/akun");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      profile?.role === "admin" || profile?.role === "kasir"
        ? "/admin"
        : "/profile";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin" && profile?.role !== "kasir") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/profile";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
