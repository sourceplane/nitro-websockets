# nitro-websockets — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | The template's Nitro v3 + React app, its page and room unchanged but for the platform's name and links, built by Vite and Nitro's own `cloudflare_durable` preset into one Worker (`cloudflare-worker-turbo`) | The preset is how Nitro runs crossws pub/sub on Workers: every upgrade goes to one Durable Object, where the room's sockets live; no adapter of ours | `specs/epics/nitro-websockets/design.md` |
| 2 | Each connection's identity in its socket's serialized attachment, the roster read from the live sockets — not a module `Map` or `peer.context` | The Durable Object hibernates when the room is quiet; a wake keeps only the sockets and their attachments. Measured: with the template's state, a cursor after a wake was dropped and a leave never announced | design.md §2, risk WS-H |
| 3 | crossws pinned to 0.4.6 for the whole workspace (pnpm `overrides`) | `server/utils/presence.ts` extends the attachment state crossws 0.4 keeps (`_internal.ws`, `_crosswsState`); the tests drive the same version | `pnpm-workspace.yaml`, risk WS-H |
| 4 | `nitro` pinned to the template's exact beta (`3.0.260610-beta`) | Nitro v3 is in beta; the template pins it, and an upgrade is a deliberate pull request the e2e re-checks | risk WS-B |
| 5 | `wrangler.jsonc` is committed, and Nitro's own generated config is off (`cloudflare.deployConfig: false`); `durable_objects` repeated in every env block, one top-level `new_sqlite_classes` migration | One config a deploy reads; wrangler does not inherit bindings into an environment; the SQLite class runs on Workers Free | `apps/web/wrangler.jsonc` |
| 6 | `GET /api/health` and one name seam (`apps/web/shared/site.ts`) the page's title reads; the smoke also checks the `/api/ws` handshake | The deploy smoke and the bootstrap's probes read `/api/health`; a 101 proves the upgrade reached the room | IMPLEMENTATION-STATUS |
| 7 | A missing file is a 404 (`server/middleware/missing-file.ts`), every other page path the app | The template's renderer answered `/assets/old.js` with the page's HTML and a 200 | IMPLEMENTATION-STATUS |
| 8 | The tests drive the room through crossws's own Cloudflare adapter over a stand-in Durable Object, a hibernation simulated; the e2e drives real WebSocket clients against `wrangler dev`, idle past a wake | The template ships no tests; the hibernation rule is the one the platform imposes | `tests/web/src/room.test.ts` |
| 9 | One landing (`01-product`) then the record (`02-docs`) | A landing has a fixed cost; the plan, not the phases, carries deploy order (cirrus-baseline since baseline-v22) | `repo-blueprint.yaml` |
| 10 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME` | A bootstrap cannot set a repository variable | hono-api's design |
| 11 | stack-tectonic 0.19.0 | The family's one pin (risk WS-F) | risks-and-open-questions.md |
| 12 | `subdomain` is read from the Cloudflare connection, never asked; the console asks for no domain | It belongs to the account; a domain is an owner's step after the bootstrap | `blueprint.yaml` |
