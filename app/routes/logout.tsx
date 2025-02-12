import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroySession, getSession } from "~/sessions.server";

export async function action({ request }: Route.ActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const headers = new Headers();
  headers.append("Set-Cookie", await destroySession(session));

  return redirect("/login", {
    headers,
  });
}
