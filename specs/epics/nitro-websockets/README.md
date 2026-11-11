# nitro-websockets — Vercel's Nitro + WebSockets Starter on Cloudflare Workers

**The starter is a realtime room — live cursors, presence and emoji reactions
over one WebSocket, on a Nitro v3 + React page — and Nitro ships a preset that
runs crossws's pub/sub on a Durable Object, so the port keeps the app as it
is: Vite and Nitro's own `cloudflare_durable` preset build it into one
Cloudflare Worker that sends every upgrade to one Durable Object of
hibernatable WebSockets, with the room's state moved onto its sockets so it
survives a wake, an `/api/health` route beside it, deployed by Orun to stage
and prod on every merge — and the baseline that makes a copy of it somebody
else's app in one landing.**

| | |
|---|---|
| Status | ✅ Shipped (`baseline-v1`) — proven offline in Baseline CI; not yet live (risk WS-A) |
| Upstream | [vercel/examples `websockets/nitro`](https://github.com/vercel/examples/tree/main/websockets/nitro) (MIT), at `de86723` (2026-10-16) |
| Reference | [nitro-boilerplate](https://github.com/sourceplane/nitro-boilerplate) — the same Nitro on a plain Worker, scaffolding, tests and bootstrap; [commerce](https://github.com/sourceplane/commerce) — a Durable Object declared in wrangler |
| Key | `WS` |

## Read in this order

1. [design.md](design.md) — the starter, how each Vercel piece maps to
   Cloudflare, what the spike proved, the repository and the build, and the
   alternatives rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones and
   what each one lands.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream starter.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| WS0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | WS-1 |
| WS1 — the room on Workers | the starter in `apps/web`, built by the `cloudflare_durable` preset, its room on one Durable Object, its tests, the README | WS-2 |
| WS2 — a baseline | the console card, the build document, the context pack and the baseline's tests | WS-3 |
