# nitro-websockets — implementation status

| Milestone | State | Landed |
|---|---|---|
| WS0 — the spec | ✅ | WS-1 |
| WS1 — the room on Workers | ✅ | WS-2 |
| WS2 — a baseline | planned | WS-3 |

## Departures from the upstream starter

Everything not listed here is the starter as it is upstream at `de86723`.

| # | What | Why |
|---|---|---|
| 1 | The app lives in `apps/web` of a pnpm workspace (`@app/web`); upstream's `package.json` name, `packageManager` (pnpm 11.7), `.gitignore` and README are replaced by the workspace's (pnpm 10.12.1); its dependencies and versions are kept, `dev` moves to port 3000, `preview` runs `wrangler dev` over the build, and `lint` and `deploy` are added, with `wrangler` beside the tools | The workspace's shape (nitro-boilerplate's) |
| 2 | `vite.config.ts`: `nitro({ preset: "cloudflare_durable", compatibilityDate: "2026-10-01", cloudflare: { deployConfig: false, nodeCompat: true } })` beside upstream's `serverDir` and `features.websocket`; a `site-name` plugin writes `SITE_NAME` into `index.html` | Nitro's Durable Object preset in place of the Vercel preset; one wrangler config (design §3) |
| 3 | `server/api/ws.ts`: the hooks are exported as `room` beside the handler; the module-level roster `Map` is gone — the roster is read from the room's live sockets (`othersOf`) and each identity is kept with its socket (`rememberIdentity` / `recallIdentity`, `server/utils/presence.ts`) | The Durable Object hibernates when the room is quiet; a wake keeps only the sockets and their attachments, so upstream's state dropped cursors and leaves after a wake (measured, design §2) |
| 4 | crossws pinned to 0.4.6 for the whole workspace (pnpm `overrides`) | `presence.ts` extends crossws's attachment state; one version for the app and the tests (risk WS-H) |
| 5 | `server/api/health.ts` added: `{"status":"ok","name":SITE_NAME,"environment":…}` from `event.req.runtime.cloudflare.env.ENVIRONMENT` (`process.env` on Node) | The deploy's smoke and the bootstrap's probes read it (hono-api's contract) |
| 6 | `server/middleware/missing-file.ts` added: a path whose last segment has a dot, outside `/api/`, that reached the app is a 404 | Upstream's renderer answered `/assets/old.js` with the page's HTML and a 200 |
| 7 | `shared/site.ts` added: `export const SITE_NAME = "Nitro WebSockets Starter"` (upstream's `site.name`); `app/lib/site.ts` reads it, its Vercel `title`, `description` and `deployUrl` replaced by a Cloudflare description and `docsUrl`; `index.html`'s `<title>` and `og:title` are `__SITE_NAME__`, its description and keywords name Cloudflare, and its `author` (Vercel Labs) and `twitter:site` (@vercel) tags are dropped | One rename seam; the page no longer names a platform it does not run on |
| 8 | `app/App.tsx`: the Vercel triangle is a plain cloud mark (`CloudflareMark`, not Cloudflare's logo); "Deploy with Vercel" is "WebSockets on Durable Objects", linking Cloudflare's guide; the badge, heading and lede name Cloudflare Workers and Durable Objects; the footer's "Vercel WebSockets" link is "Cloudflare Durable Objects"; the footer's vercel/examples credit stays | The page describes where it runs |
| 9 | `app/hooks/use-realtime.ts`: one comment (the reconnect's reason) | Vercel Functions' max duration does not apply |
| 10 | `tsconfig.json` keeps upstream's (`nitro/tsconfig`, React JSX, the `@/` alias) and adds `strict: true` and excludes `eslint.config.js` | The workspace type-checks strictly; the lint config is eslint's to check |
| 11 | `wrangler.jsonc` (`<repo>-web`, `nodejs_compat`, `.output/server/index.mjs`, Static Assets over `.output/public` with `ASSETS`, the `$DurableObject` binding in every env block and one `new_sqlite_classes` migration, `env.{dev,stage,prod}` vars) and `component.yaml` (`cloudflare-worker-turbo`, a smoke over `/api/health` and the `/api/ws` handshake) | The Worker's config and the deploy contract replace Vercel's (design §2–3) |
| 12 | `apps/web/LICENSE.md` is vercel/examples' MIT licence (upstream's `package.json` says MIT) | The example ships under the repository's licence; the product carries it |
| 13 | Tests: `tests/web` (vitest): the room driven through crossws's Cloudflare adapter over a stand-in Durable Object, a hibernation simulated; the name seam and the page's text | The starter ships none |
