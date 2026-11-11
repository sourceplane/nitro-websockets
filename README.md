# nitro-websockets

Vercel's [Nitro + WebSockets Starter](https://github.com/vercel/examples/tree/main/websockets/nitro)
— a [Nitro v3](https://nitro.build/) + React app where everyone in the room
sees each other's cursors live, with presence and emoji reactions over one
WebSocket — running as one **Cloudflare Worker** whose room is a **Durable
Object**, built by Nitro's own `cloudflare_durable` preset (in place of the
Vercel Functions WebSockets beta), deployed by
[Orun](https://github.com/sourceplane/orun) to stage and prod on every merge.
Packaging it as an Orun baseline is the next milestone (WS2).

The template's code is the code: the React page, the wire protocol, and the
one `defineWebSocketHandler` at `/api/ws`. What the port adds is the preset in
`vite.config.ts`, the Worker's config with the Durable Object, the monorepo
wrapper, a test package, the deploy contract, an `/api/health` route the
deploy smoke-tests, and one change the room needs to survive the Durable
Object hibernating (below); what it swaps is the platform's name and links in
the page. See
[`specs/epics/nitro-websockets`](specs/epics/nitro-websockets/README.md)
for the design, the milestones and the as-built status.

The example is MIT-licensed (vercel/examples); its licence ships with the app
as `apps/web/LICENSE.md`.

## What is here (the app)

| Surface | Where |
|---|---|
| The page — live cursors, presence bar, reactions — the template's React app | `apps/web/app/` |
| `/api/ws` — the room: one WebSocket handler, pub/sub over one `room` topic | `apps/web/server/api/ws.ts` |
| Each connection's identity, kept with its socket so it survives hibernation | `apps/web/server/utils/presence.ts` |
| The wire protocol the page and the room share | `apps/web/shared/types/realtime.ts` |
| `GET /api/health` — the site's name and the environment it runs as | `apps/web/server/api/health.ts` |
| A missing file is a 404, not the page | `apps/web/server/middleware/missing-file.ts` |
| The site's name (the rename's seam) | `apps/web/shared/site.ts` |
| Nitro's config — the template's, plus the `cloudflare_durable` preset | `apps/web/vite.config.ts` |
| Worker config (name, compatibility, the Durable Object and its migration, the build output as the Worker and its Static Assets, per-environment vars) | `apps/web/wrangler.jsonc` |
| Deploy contract | `apps/web/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/web` (vitest: the room driven through crossws's own Cloudflare adapter over a stand-in Durable Object, hibernation included; the name seam; the page's text) |
| The example's licence (MIT) | `apps/web/LICENSE.md` |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # vite build → apps/web/.output (the Worker and the page's assets)
```

Run it with Vite's dev server (Node), or the built Worker under workerd with
its Durable Object:

```bash
pnpm --filter @app/web dev            # vite dev, http://localhost:3000
pnpm --filter @app/web preview        # wrangler dev over the build, http://localhost:8787
curl http://localhost:8787/api/health # {"status":"ok","name":"Nitro WebSockets Starter","environment":"local"}
```

Open the page in two tabs and move the cursor in one.

## How the room runs on Cloudflare

Every WebSocket upgrade to `/api/ws` goes to ONE Durable Object, the room
(Nitro's `cloudflare_durable` preset names it `$DurableObject`, instance
`server`). crossws, Nitro's WebSocket layer, accepts each connection there as
a **hibernatable WebSocket**, so `peer.publish` reaches every socket in the
room, and a quiet room costs nothing while its sockets stay open: the runtime
evicts the object and wakes it for the next message.

A wake keeps the sockets and nothing else: module memory and each peer's
`context` are gone. The template kept its roster in a module `Map` and each
peer's identity in `peer.context`, so after a wake a cursor was dropped
(`if (!identity) return`) and a leave was never announced — measured under
`wrangler dev`, which hibernates an idle room after about a minute. The port
keeps the handler and changes where the state lives: each identity is written
into its socket's serialized attachment beside crossws's own (peer id, URL,
topics), and the roster is read from the room's live sockets. `tests/web`
drives the room through crossws's adapter across a simulated wake.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Vercel Functions WebSockets beta: the Vercel preset bridges the socket upgrade (`crossws/adapters/vercel`) | Nitro's `cloudflare_durable` preset: the Worker sends every upgrade to one Durable Object, where crossws's Cloudflare adapter accepts it as a hibernatable WebSocket (`vite.config.ts`, `wrangler.jsonc`) |
| The room's state in the function's memory (a roster `Map`, `peer.context`) | Each identity in its socket's attachment, the roster read from the live sockets — they survive the Durable Object hibernating, where module memory does not (`server/utils/presence.ts`) |
| The SPA and its assets on Vercel's CDN | Workers Static Assets over `.output/public`; the Worker answers every other page path with the app, and a missing file with a 404 |
| "Deploy with Vercel" and the Vercel WebSockets docs in the page | A link to Cloudflare's WebSockets-on-Durable-Objects guide; the footer still credits the template (vercel/examples) |
| `vercel dev` · `vercel build` · `vercel deploy` | `vite dev` (or `wrangler dev` over the build) · `vite build` · `wrangler deploy --env <stage\|prod>` |
| Deploy on push | Orun deploys `<repo>-web-{stage,prod}` on merge to `main` and smoke-tests `/api/health` and the WebSocket handshake (`apps/web/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to an app |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow an app carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the Worker built by Vite and Nitro, type-checked and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
