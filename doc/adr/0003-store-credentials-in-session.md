# 3. Store user credentials in session storage

Date: 2024-08-28

## Status

Accepted

## Context

Track-Your-Time fetches the user data from several external APIs (Troi, Personio and NocoDB) that require authentication.

Additionally, the initial login / authentication (making sure the Troi password is correct, fetching the Personio auth token) takes some time.

It is common practice to have long-lived sessions in web applications to avoid having to re-authenticate the user frequently.

## Decision

In the `login` route we will store the user credentials in session storage on the server after a successful login.

We will use Remixs [sessions](https://remix.run/docs/en/main/utils/sessions) to store the credentials.

We will keep the session alive for a month.

## Consequences

We will make sure that the required security measures are in place to prevent session hijacking, i.e. sealing the secrets, using correct CSP headers, etc.

We will provide a logout route that will destroy the session.
