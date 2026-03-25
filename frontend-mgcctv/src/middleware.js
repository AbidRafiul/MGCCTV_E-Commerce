import { NextResponse } from "next/server";

// Routes yang hanya boleh diakses oleh admin / superadmin
const ADMIN_ROUTES = ["/admin"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ambil token & role dari cookie
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase();

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminOrSuperadmin = role === "admin" || role === "superadmin";

  // Proteksi halaman admin: kalau tidak ada token / bukan admin → redirect ke login
  if (isAdminRoute && (!token || !isAdminOrSuperadmin)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Terapkan middleware ke semua route kecuali static files & API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api).*)"],
};
