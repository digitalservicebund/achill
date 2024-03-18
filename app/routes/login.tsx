import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { initializePersonioApi } from "~/apis/personio/PersonioApiController";
import { initializeTroiApi } from "~/apis/troi/TroiApiController";
import Spinner from "~/components/common/Spinner";
import { commitSession, destroySession, getSession } from "~/sessions.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Track your time" },
    { name: "description", content: "Hello DigitalService!" },
  ];
};

const troiBaseUrl = "https://digitalservice.troi.software/api/v2/rest";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("username")) {
    return redirect("/");
  }

  return json(null);
}

export async function action({ request }: ActionFunctionArgs) {
  const bodyParams = await request.formData();
  const username = bodyParams.get("username")?.toString();
  const password = bodyParams.get("password")?.toString();
  if (!username || !password) {
    return json(
      { message: "Please provide username and password." },
      { status: 400 },
    );
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  try {
    session.set("username", username);
    session.set("troiPassword", password);

    const [{ troiClientId, troiEmployeeId }, personioEmployee] =
      await Promise.all([
        initializeTroiApi(session),
        initializePersonioApi(username),
      ]);

    session.set("troiClientId", troiClientId);
    session.set("troiEmployeeId", troiEmployeeId);
    session.set("personioEmployee", personioEmployee);
  } catch (error) {
    await destroySession(session);
    if (error instanceof Error && error.message === "Invalid credentials") {
      return json({
        message: "Login failed! Please check your username & password.",
      });
    } else {
      throw error;
    }
  }

  const headers = new Headers();
  headers.append("Set-Cookie", await commitSession(session));

  return redirect("/", { headers });
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isIdle = navigation.state === "idle";

  return (
    <main>
      <div className="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-sm bg-white px-8 py-6 shadow-md">
        <h1 className="mb-8 mt-4 text-center text-3xl font-bold text-blue-600">
          Enter. Time.
        </h1>

        {actionData?.message && (
          <div className="mt-4 w-full rounded-sm bg-red-500 text-white">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
              <div className="flex">
                <svg viewBox="0 0 40 40" className="h-6 w-6 fill-current">
                  <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z" />
                </svg>

                <p className="mx-3">{actionData.message}</p>
              </div>
            </div>
          </div>
        )}

        <Form method="post">
          <div className="mt-4 w-full">
            <label
              htmlFor="username"
              className="mb-2 block text-sm text-gray-600"
            >
              Troi username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="firstName.lastName"
              className="mt-2 block w-full px-4 py-2"
            />
          </div>

          <div className="mt-4 w-full">
            <label
              title="Troi → security center → API v2 / Troi App → Token"
              htmlFor="password"
              className="mb-2 block text-sm text-gray-600"
            >
              Troi password or Troi v2 token ⓘ
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="hunter2"
              className="mt-2 block w-full px-4 py-2"
            />
          </div>

          <div className="mb-4 mt-8">
            <button className="tracky-btn w-full inline-flex justify-center">
              {isIdle ? (
                "Sign in"
              ) : (
                <>
                  <Spinner />
                  Signing in
                </>
              )}
            </button>
          </div>
        </Form>
      </div>
    </main>
  );
}
