/* eslint-disable @typescript-eslint/ban-ts-comment */
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import authConfig from "./auth.config";
import {
  publicRoutes,
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_ADMIN_ROUTES,
} from "@/routes";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

const { auth } = NextAuth(authConfig);

//@ts-ignore
export default auth(async req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(
      new URL(`/auth/login?${encodedCallbackUrl}`, nextUrl)
    );
  }
  if (
    user?.role === UserRole.USER &&
    nextUrl.pathname === DEFAULT_ADMIN_ROUTES
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    user?.role === UserRole.ADMIN &&
    (nextUrl.pathname === "/dashboard" ||
      nextUrl.pathname === "/dashboard/withdraw")
  ) {
    return NextResponse.redirect(new URL(DEFAULT_ADMIN_ROUTES, req.url));
  }

  return null;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
