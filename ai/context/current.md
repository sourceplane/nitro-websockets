# nitro-websockets — where this repository stands

The entry page for anyone (or any agent) picking this repository up. It is
this repository's own state and does not ship to an app built from it; the
two pages that do are [operations.md](operations.md) and
[deployment.md](deployment.md).

## What it is

Vercel's Nitro + WebSockets Starter — live cursors, presence and reactions
over one WebSocket, on a Nitro v3 + React page — as one Cloudflare Worker whose
room is a Durable Object of hibernatable WebSockets, built by Vite and Nitro's
own `cloudflare_durable` preset, beside an `/api/health` route, packaged as an Orun
baseline: `orun new --blueprint repo-blueprint.yaml` builds a new app in its
own repository and takes it to live on stage and prod in one landing
(`01-product`), then records what went live (`02-docs`).

## Release

| | |
|---|---|
| Latest tag | `baseline-v1` (WS2 — the baseline) |
| Proven live | No. Everything short of the platform is proven offline in Baseline CI — the Worker built by Vite and Nitro, served by `wrangler dev`, every route read and real WebSocket clients in the room across a hibernation; a live bootstrap from a tag is still to come (risk WS-A) |

## Where to read

| Question | Page |
|---|---|
| What shipped, and every departure from upstream | `specs/epics/nitro-websockets/IMPLEMENTATION-STATUS.md` |
| Why it is built this way | [decisions.md](decisions.md), then `specs/epics/nitro-websockets/design.md` |
| What could still go wrong | [open-risks.md](open-risks.md), then `specs/epics/nitro-websockets/risks-and-open-questions.md` |
| How to instantiate it | `BOOTSTRAP.md`, `docs/phases/` |
| What each component is | `apps/web/docs/`, `tests/web/docs/` (generated; `python3 tooling/catalog/gen-component-docs.py`) |

## Next

1. Bootstrap one app from `baseline-v1` against a workspace, open its page in
   two browsers on workers.dev, and record its timings (closes WS-A).
