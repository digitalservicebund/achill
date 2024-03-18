import type { Cookie, Session } from "@remix-run/node";
import {
  createCookie,
  createFileSessionStorage,
  createMemorySessionStorage,
  redirect,
} from "@remix-run/node";
import type { PersonioEmployee } from "./apis/personio/Personio.types";

export type SessionData = {
  username: string;
  troiPassword: string;
  troiClientId: string;
  troiEmployeeId: string;
  personioEmployee: PersonioEmployee;
};

function createSessionStorage(cookie: Cookie) {
  if (process.env.MOCK_EXTERNAL_APIS && process.env.NODE_ENV !== "production") {
    return createMemorySessionStorage<SessionData>({
      cookie,
    });
  }

  return createFileSessionStorage<SessionData>({
    dir: "./sessions",
    cookie,
  });
}

const sessionCookieSecret = process.env.SESSION_COOKIE_SECRET;
if (sessionCookieSecret === undefined) {
  throw new Error(
    "Missing secret for session cookie (enviroment variable SESSION_COOKIE_SECRET)",
  );
}

const sessionCookie = createCookie("__session", {
  maxAge: 30 * 24 * 60 * 60,
  secrets: [sessionCookieSecret],
  sameSite: "lax",
  secure: true,
  httpOnly: true,
});

const { getSession, commitSession, destroySession } =
  createSessionStorage(sessionCookie);

export async function getSessionAndThrowIfInvalid(
  request: Request,
): Promise<Session> {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);
  if (!(session.has("username") && session.has("troiPassword"))) {
    console.error("Invalid session");
    throw redirect("/login");
  }
  return session;
}

export { commitSession, destroySession, getSession };
