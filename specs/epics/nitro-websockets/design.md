# nitro-websockets — design

## 1. The starter

vercel/examples `websockets/nitro` at `de86723` is a Nitro v3
(`3.0.260610-beta`) + React 19 app built by Vite 8 through `nitro/vite`:
`app/` is the page (a hero, a live canvas of cursors and reactions, a
presence bar, three feature cards; shadcn/ui on Base UI, Tailwind 4),
`shared/types/realtime.ts` the wire protocol, and `server/api/ws.ts` one
`defineWebSocketHandler` at `/api/ws`. Each connection gets an anonymous
identity (`server/utils/identity.ts`) and subscribes to one `room` topic;
cursor moves, reactions, joins and leaves are broadcast with crossws's
`peer.publish`; the roster is a module-level `Map` replayed in the `welcome`
frame; each peer's identity sits in `peer.context`. On Vercel the preset
bridges the upgrade through `crossws/adapters/vercel` (the Vercel Functions
WebSockets beta). The template ships no tests.

## 2. How each Vercel piece maps, and the one thing a Durable Object changes

| Vercel | Here |
|---|---|
| The Vercel preset's socket bridge | Nitro's `cloudflare_durable` preset: the Worker forwards every upgrade to ONE Durable Object (class and binding `$DurableObject`, instance `server`), where crossws's Cloudflare adapter accepts it with `ctx.acceptWebSocket` — the Hibernation API — so `peer.publish` reaches every socket in the room |
| The function's memory for room state | Each socket's serialized attachment, and the room's live sockets |
| Vercel's CDN for the SPA | Workers Static Assets over `.output/public`; the preset's renderer answers every other page path with `index.html` |
| Deploy on push | Orun's `cloudflare-worker-turbo` lane: `wrangler deploy --env <env>`, smoke on `/api/health` and the `/api/ws` handshake |

**Hibernation.** A Durable Object whose sockets are quiet is evicted; the
sockets stay open, and the next message constructs the object again with new
socket wrappers. Module memory and every `peer.context` are gone; what
survives is each socket's attachment (`serializeAttachment`), where crossws
keeps the peer's id, URL and topics. The spike measured it under `wrangler
dev`: two clients connected, the room left idle 75 s, the object was
constructed again (a `cloudflare:durable:init` hook logged it) when the next
cursor arrived. With upstream's handler that cursor was dropped (`identity`
was undefined, `if (!identity) return`) and the next leave was never
announced; the roster survived only because local workerd kept the isolate's
module memory, which production does not promise. The port keeps the
handler's shape and moves the state: `rememberIdentity` writes the identity
into the attachment beside crossws's own fields (extending the state object
crossws caches on the socket, so its later writes keep it),
`recallIdentity` reads it back after a wake, and `othersOf` builds the roster
from `peer.peers` — the object's live sockets. The same idle run then passed:
the cursor arrived as its sender's, a new joiner got both identities, and
the leave reached everyone.

## 3. The repository and the build

nitro-boilerplate's monorepo, unchanged in shape: `apps/web` is the app,
`tests/web` its tests, `tooling/` the shared configs and the wrangler
renderer. `vite build` writes `.output/server/index.mjs` (the Worker, with
the `$DurableObject` class exported) and `.output/public` (the page's
assets); Nitro's own wrangler output is off (`cloudflare.deployConfig:
false`), and the committed `wrangler.jsonc` names both, binds the Durable
Object in every env block (wrangler does not inherit `durable_objects` into
an environment; it warns and binds nothing) and declares one top-level
`new_sqlite_classes` migration, so Workers Free runs it. The Durable Object
needs no Terraform: the first deploy creates it from the migration.

crossws is pinned to 0.4.6 for the whole workspace: `presence.ts` relies on
how that version keeps a socket's attachment, and the tests drive the same
version through its real adapter.

## 4. Tests

The starter has none. `tests/web` drives the exported `room` hooks through
`crossws/adapters/cloudflare` over a stand-in Durable Object with the
Hibernation API's shape (`acceptWebSocket`, `getWebSockets`, attachments
that round-trip through structured clone): the welcome roster, a cursor fanned
out and clamped, rejected frames, ping, leave, the identity in the
attachment, and a simulated wake — new socket wrappers, a fresh adapter, no
context — after which cursors, the roster and leaves still work. Without the
attachment the wake test fails. The baseline's e2e then drives real
WebSocket clients against the built Worker under `wrangler dev`, including
an 80-second idle past a wake.

## 5. Alternatives rejected

- **A hand-written Durable Object** in place of the preset: it would replace
  the template's handler, and the preset already does exactly this routing.
- **Nitro 2 with the same preset**: the template is Nitro v3 (`nitro/vite`,
  `defineWebSocketHandler` from `nitro`); moving it back would rewrite it.
- **Deriving identities from the peer id** (no attachment writes): it would
  survive a wake with public API alone, but an owner who swaps in an
  authenticated user (the template's own suggestion) needs somewhere to keep
  that user; the attachment is that place.
- **Durable Object storage for the roster**: the handler cannot reach the
  object's storage after a wake (a restored peer carries no request context),
  and the live sockets already are the roster.
