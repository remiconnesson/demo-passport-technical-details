# Vercel Passport demo

A Next.js app that demonstrates a completed Vercel Passport authentication
flow. The deployed app reads the Vercel-injected
`x-vercel-oidc-passport-token` header on the server and presents the decoded
identity claims without sending the raw token to the browser.

## Development

```bash
pnpm install
pnpm dev
```

Local requests do not pass through Vercel Deployment Protection, so the local
page shows the pending proof state. On a Passport-protected Vercel deployment,
the page shows the authenticated identity and request proof after sign-in.

The `/api/passport` route exposes the same server-side proof as JSON. It returns
`401` when the Passport header is absent or malformed.
