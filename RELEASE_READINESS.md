# Release readiness

## Current admin flow

The supported admin entry point is `/admin-login` using a Supabase Magic Link for the allowlisted administrator email. Password and passkey routes are not part of the release flow.

## Required deployment configuration

Public client variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Server-only variables required by privileged server functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key to the browser or commit it to Git.

## Supabase Auth URLs

Configure the production site URL and the `/admin-login` redirect URL in the Supabase Auth dashboard before enabling production admin access.

## Release gates

- CI install, lint, and build are green.
- Preview deployment is `READY`.
- No new runtime errors are caused by the release.
- Magic Link is tested with the allowlisted administrator account.
- Production deployment is reviewed before promotion.
