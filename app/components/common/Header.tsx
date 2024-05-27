import { Form } from "@remix-run/react";

export default function Header({ username }: { username?: string }) {
  return (
    <nav className="flex h-16 justify-between items-center border-1 w-full border-b pb-1 text-left">
      <img
        src="timetracking_blue.svg"
        alt="Track-Your-Time logo"
        className="pr-4 py-1"
      />
      <div className="flex-grow">
        <h1 className="font-bold">Track-Your-Time</h1>
        {username && <div className="text-sm">Logged in as {username}.</div>}
      </div>
      {username && (
        <Form method="post" action="/logout">
          <button className="tracky-btn">Logout</button>
        </Form>
      )}
    </nav>
  );
}
