import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-session"
    : "session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export function setSessionCookie(token: string) {
  setCookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE,
  });
}

export function getSessionCookie(): string | null {
  return getCookie(COOKIE_NAME) ?? null;
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, COOKIE_OPTIONS);
}