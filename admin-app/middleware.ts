import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'admin-auth-token',
      },
      auth: {
        storageKey: 'admin-auth-token',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login") || path.startsWith("/kasir-login") || path.startsWith("/mekanik-login");
  
  // Jika belum login, hanya boleh akses halaman login
  if (!user && !isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // Ambil profile dari public.users untuk cek role
    const { data: profile, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Pastikan email sakti selalu lolos walau query RLS gagal/telat update
    const isStaff = 
      profile?.role === "admin" || 
      profile?.role === "kasir" || 
      profile?.role === "mekanik" ||
      user.email === "admin@autocraft.com" ||
      user.email === "admin@gmail.com";

    // Jika bukan staff, paksa logout atau larang akses
    if (!isStaff) {
      if (!isAuthPage) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        redirectUrl.searchParams.set("error", "Bukan Staff");
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Jika staff mengakses halaman login, arahkan ke dashboard masing-masing
      if (isAuthPage) {
        const redirectUrl = request.nextUrl.clone();
        if (profile?.role === "mekanik") {
          redirectUrl.pathname = "/mekanik/dashboard";
        } else if (profile?.role === "kasir") {
          redirectUrl.pathname = "/kasir/dashboard";
        } else {
          redirectUrl.pathname = "/";
        }
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
