import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply to admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Public routes in admin (login page)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // If not logged in, redirect to login
  if (!token) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Check role-based access
  const userRole = token.role as string;

  // Admin-only routes
  const adminRoutes = [
    "/admin/authors",
    "/admin/advertisements",
    "/admin/newsletter",
  ];

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute && userRole !== "ADMIN" && userRole !== "OWNER") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Owner-only routes
  const ownerRoutes = [
    "/admin/security",
    "/admin/analytics",
    "/admin/settings",
  ];
  const isOwnerRoute = ownerRoutes.some((route) => pathname.startsWith(route));

  if (isOwnerRoute && userRole !== "OWNER") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}
