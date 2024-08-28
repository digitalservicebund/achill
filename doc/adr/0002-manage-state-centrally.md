# 2. Centrally manage state in index route

Date: 2024-08-28

## Status

Accepted

## Context

Track-Your-Time is designed to be an SPA that gets all its data from several external APIs (Troi, Personio and NocoDB).
The relevant data here are the users working hours, absences, the project times etc.
The way that Remix is meant to be used (nested routes each having it's own loader) doesn't lend itself well to this SPA approach and the way the data is fetched and posted.
A previous version of the app relied heavily on storing the data in a session with a self-built caching middleware, which led to a lot of complexity and introduced [several bugs in the form of race conditions](https://remix.run/docs/en/main/guides/gotchas#writing-to-sessions-in-loaders).

We need to find a simpler way to manage the state of the app that works well enough with Remix.

## Decision

We will use the loader function of the `index` route to fetch the user data in parallel.

We will centrally store the state of the app in the `index` route.

We will fetch the unchanging user data (working hours, holidays, etc.) only once when the app is loaded.

The individual components will be responsible for communicating with the respective external API on user input with their own forms.

The individual components will update the data in the `index` route after successful form submission to reduce interaction times.

## Consequences

We will pass down the data from the `index` route to the respective components.

After a successful form submission in an individual component the `index` route will reload the user data from all the external APIs (due to the way Remix is designed). This data should be the same as the updated data as the form submission was successful. We could look into [shouldRevalidate()](https://remix.run/docs/en/main/route/should-revalidate#shouldrevalidate) to prevent the data from being reloaded.

We will use a timestamp in the `index` route loader to prevent race conditions when multiple components are updating the data at the same time.

We will need to create an error handling mechanism that constrains errors in the external APIs to the relevant components.
