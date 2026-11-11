# nitro-websockets — implementation plan

Three milestones, one task each, each landed as one pull request.

## WS0 — the spec (WS-1)

The repository is born with nitro-boilerplate's frame — `intent.yaml` (dev
verify-only, stage, prod after stage; the placeholder workspace
`ws_CHANGE_ME`, so CI plans nothing until it is linked), `ci.yml` byte for
byte turso-starter's (as hono-api carries it), the shared TypeScript and
ESLint configuration, the wrangler renderer, the pnpm workspace and turbo
pipeline, and the spec index — and this doc set and the three task
contracts land on it.

## WS1 — the room on Workers (WS-2)

- `apps/web` is the upstream app: the page, the protocol, the handler, the
  public files, upstream's dependency versions.
- `vite.config.ts` adds the `cloudflare_durable` preset and the name plugin;
  `wrangler.jsonc` binds the Durable Object per environment with its
  migration; `component.yaml` deploys it, smoke-testing `/api/health` and
  the `/api/ws` handshake.
- `server/utils/presence.ts` keeps identities in the sockets' attachments;
  `server/api/ws.ts` reads them back and builds the roster from the live
  sockets; `server/api/health.ts` and `server/middleware/missing-file.ts`
  are added; `shared/site.ts` is the name seam.
- `tests/web` drives the room through crossws's adapter across a simulated
  wake.
- The README says how to run, test and deploy it, how the room runs on
  Cloudflare, and how each Vercel piece maps.

## WS2 — a baseline (WS-3)

The console card, the build document (`01-product` lands the whole app in
one pull request and one convergence deploys it; `02-docs` records it), the
context pack and the product README, the rename engine and its tests, and
the baseline's tests — contract, leak, placement and the e2e with real
WebSocket clients — then the `baseline-v1` tag.
