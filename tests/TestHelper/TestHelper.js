export const fixedCurrentDate = new Date("June 7 2023 5:00:00");

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initializeTestSetup(context, apiStub) {
  await context.route(
    "https://digitalservice.troi.software/api/v2/rest/**",
    async (route) => {
      const authnHeader = await route.request().headerValue("Authorization");
      if (!apiStub.isAuthorized(authnHeader)) {
        route.fulfill(await apiStub.unauthorizedResponse());
        return;
      }

      const method = route.request().method();
      const { pathname, searchParams: params } = new URL(route.request().url());
      const postData = route.request().postDataJSON();
      const matchedResponse = await apiStub.match(
        method,
        pathname,
        params,
        postData
      );

      if (matchedResponse !== null) {
        route.fulfill(matchedResponse);
      } else {
        console.log({ matchedResponse, method, pathname, params, postData });
        route.abort();
      }
    }
  );

  await context.route("/time_entries/*", async (route) => {
    const { pathname } = new URL(route.request().url());
    const method = route.request().method();

    const id = parseInt(pathname.split("/").at(-1));

    if (method === "DELETE") {
      apiStub.deleteEntry(id);
      // Simulate trois api delay
      await sleep(500);
      route.fulfill(apiStub._response({}));
    } else {
      route.continue();
    }
  });
}

export async function setFixedCurrentDate(page) {
  await page.addInitScript(`{
  // Extend Date constructor to default to fakeNow
  Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(${fixedCurrentDate.valueOf()});
      } else {
        super(...args);
      }
    }
  }
  // Override Date.now() to start from fakeNow
  const __DateNowOffset = ${fixedCurrentDate.valueOf()} - Date.now();
  const __DateNow = Date.now;
  Date.now = () => __DateNow() + __DateNowOffset;
}`);
}
