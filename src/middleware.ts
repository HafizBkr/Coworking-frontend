import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./services/auth/session.service";
import { canAccesDashboard, shouldRedirectToLogin } from "./guards/auth.guard";
import { routes } from "./config/routes";

// specifier les routes public et privee !
const protectedRoutes = ["/dedkjnei"];
const publicRoutes = [
    routes.auth.signin,
    routes.auth.signup,
    routes.auth.otp,
    routes.dashboard.home,
    routes.dashboard.calendar
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await getSession();
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const isLoggedIn = session?.isAuthenticated ?? false;

  if (shouldRedirectToLogin(isLoggedIn, isProtectedRoute)) {
    return NextResponse.redirect(new URL(routes.auth.signin, req.nextUrl));
  }

  if (canAccesDashboard(isLoggedIn, isPublicRoute)) {
    return NextResponse.redirect(new URL(routes.dashboard.home, req.nextUrl));
  }

  return NextResponse.next();
  
}



// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
