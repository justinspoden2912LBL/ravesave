# Contributing

## Autonomous workflow

The repository uses a guarded automation workflow for routine coding tasks:

1. Work on a short-lived branch.
2. Keep secrets in Vercel or another managed secret store; never commit `.env` files.
3. Open a pull request against `main`.
4. Let CI run installation, lint, build, and environment-file checks.
5. Use the Vercel Preview deployment for verification.
6. Request an AI review and inspect all findings.
7. Merge only after the pull request and any database changes have been reviewed.

## Explicit safety boundaries

Automation must not merge pull requests automatically, expose secrets, alter production data, or apply Supabase production migrations without an explicit human review. Vercel production deployments remain controlled by the Git integration and branch settings.

## Database changes

Add schema changes as reviewed Supabase migrations. Test them against a development or preview project first. Never use a production service-role key in client-side code.

## Secret handling

Use Vercel Environment Variables for deployment secrets. Use `.env.example` only as a names-only template. If a secret was committed, rotate it and remove it from the history using an appropriate repository-security procedure.
