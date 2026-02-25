import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Public routes - no auth required
  const publicPaths = ["/", "/login", "/register", "/products", "/product", "/compare", "/cart", "/store", "/privacy", "/terms", "/about", "/contact", "/api/auth", "/api/seed-admin", "/auth/redirect"];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  if (isPublic) return NextResponse.next();

  // API routes for public access
  if (pathname.startsWith("/api/products")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/compare") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/stores") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/vendors") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/branches") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/bundles") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/featured") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/categories")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/cart")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/banners") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/brochures") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/price-history") && req.method === "GET") {
    return NextResponse.next();
  }

  // Auth required for everything else
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Dashboard routes (vendor or admin)
  if (
    pathname.startsWith("/dashboard") &&
    user.role !== "vendor" &&
    user.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.ico$).*)"],
};
