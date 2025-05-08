import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname === "/admin/login";
    const isAdminPage =
      req.nextUrl.pathname.startsWith("/admin") && !isAuthPage;

    // 1. Allow unauthenticated access to login page
    if (!isAuth && isAuthPage) {
      return NextResponse.next();
    }

    // 2. Redirect unauthenticated users trying to access admin pages
    if (!isAuth && isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // 3. Redirect authenticated users trying to access login page
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 4. Role check
    if (
      isAuth &&
      isAdminPage &&
      token.role !== "ADMIN" &&
      token.role !== "EDITOR" &&
      token.role !== "OWNER"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/admin/login", // <-- Add this so next-auth knows your custom login page
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"], // This includes login, but we handle it inside
};
