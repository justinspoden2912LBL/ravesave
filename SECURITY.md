# Security

## Environment variables

Never commit `.env` files, API keys, service-role keys, access tokens, or database credentials. Use `.env.example` as the template for local development and configure production secrets in the deployment provider.

If a secret was ever committed, remove it from the repository and rotate it immediately. Removing the file from the current branch does not erase it from Git history.

## Reporting a vulnerability

Please do not publish credentials or exploit details in a public issue. Contact the project maintainer privately with reproduction steps and the affected component.
