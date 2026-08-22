# RaveSave

RaveSave is a harm-reduction web application for safer nightlife and informed decisions.

## Development

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env` locally and fill in the required values. Never commit `.env` files or production credentials.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

Production deployments should be configured in Vercel with the required environment variables. For the custom domain, add the domain in Vercel and configure the DNS records at the domain provider. DNS and deployment-provider settings are external to this repository.

See `SECURITY.md` for credential handling and vulnerability reporting guidance.
