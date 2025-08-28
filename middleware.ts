import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	if(!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: [
    // Only protect booking and cart actions, not viewing routes
    "/book/:path*", 
    "/cart/:path*", 
    "/checkout/:path*", 
    "/orders/:path*", 
    "/profile/:path*",
    "/appointments/:path*",
    // Admin and staff routes still protected
    "/lab/:path*", 
    "/collection/:path*", 
    "/admin/:path*",
    // Specific role dashboards
    "/dashboard/:path*"
  ], // Apply middleware to specific routes
};