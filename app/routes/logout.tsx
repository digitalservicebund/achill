import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  const headers = new Headers();
  headers.append("Set-Cookie", await destroySession(session));

  return redirect("/login", {
    headers,
  });
}
