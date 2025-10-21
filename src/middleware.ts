/**
 * Middleware de Next.js
 * Protege rutas y redirige según el rol del usuario
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Rutas de API pública (no requieren autenticación)
  const publicApiRoutes = ["/api/auth/login", "/api/auth/signup", "/api/public"];
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));
  
  // Si es una ruta de API pública, permitir acceso
  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  // Si no hay sesión y no es ruta pública, redirigir a login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay sesión, decodificar y verificar rol
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );

      // Si ya está autenticado e intenta acceder a rutas de auth, redirigir según rol
      if (isPublicRoute) {
        if (sessionData.role === "coordinador") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (sessionData.role === "acolito") {
          return NextResponse.redirect(new URL("/acolyte", request.url));
        }
      }

      // Proteger rutas de admin
      if (pathname.startsWith("/admin") && sessionData.role !== "coordinador") {
        return NextResponse.redirect(new URL("/acolyte", request.url));
      }

      // Proteger rutas de acolyte
      if (pathname.startsWith("/acolyte") && sessionData.role !== "acolito") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch (error) {
      console.error("Error parsing session in middleware:", error);
      // Si hay error, limpiar cookie y redirigir a login
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
