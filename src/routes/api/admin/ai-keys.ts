import { createFileRoute } from '@tanstack/react-router';

const providers = ['openai', 'anthropic', 'google', 'openrouter'] as const;
type Provider = (typeof providers)[number];

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.includes('admin_session=');
}

function envName(provider: Provider) {
  return {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  }[provider];
}

function mask(value: string | undefined) {
  if (!value) return '';
  return value.length <= 8 ? '••••••••' : `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function getStatus() {
  return Object.fromEntries(providers.map((provider) => {
    const value = process.env[envName(provider)];
    return [provider, { configured: Boolean(value), masked: mask(value) }];
  }));
}

export const Route = createFileRoute('/api/admin/ai-keys')({
  server: {
    handlers: {
      GET: ({ request }) => {
        if (!isAdmin(request)) return new Response('Unauthorized', { status: 401 });
        return Response.json(getStatus(), { headers: { 'Cache-Control': 'no-store' } });
      },
      POST: async ({ request }) => {
        if (!isAdmin(request)) return new Response('Unauthorized', { status: 401 });
        const body = await request.json().catch(() => null) as Record<string, unknown> | null;
        if (!body || typeof body !== 'object') return new Response('Invalid JSON', { status: 400 });
        const submitted = providers.filter((provider) => typeof body[provider] === 'string' && body[provider].trim());
        if (submitted.length === 0) return new Response('No key supplied', { status: 400 });
        return new Response(
          'The runtime environment is immutable. Configure these values in Vercel Environment Variables: ' + submitted.map(envName).join(', '),
          { status: 501, headers: { 'Cache-Control': 'no-store' } },
        );
      },
    },
  },
});
