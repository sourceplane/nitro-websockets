# nitro-websockets — risks and open questions

## WS-A — No live bootstrap yet (OPEN)

Everything short of the platform is proven on every pull request: the card
against the build, the blueprint read by the pinned orun, the leak gate, the
offline bootstrap with the blueprint's own hooks, the app's own plan for the
01-product merge, and the produced app built, dry-deployed, served,
smoke-tested, read route by route and driven by real WebSocket clients in
the job tree orun stages. Not proven: the repository created and linked, the
token minted, a real `wrangler deploy` creating the Durable Object, the
smoke against workers.dev, and two browsers in the deployed room.

## WS-B — `nitro` pinned to the template's beta (ACCEPTED)

`3.0.260610-beta`, exactly as the template pins it. Nitro v3 is in beta; an
upgrade is a pull request that bumps the pin, regenerates the lockfile and
re-runs the tests and the e2e (the preset's class name and output layout are
what the committed config names, WS-C).

## WS-C — The committed config names Nitro's output and class (WATCH)

`wrangler.jsonc`'s `main` is `.output/server/index.mjs`, its assets
directory `.output/public`, and its Durable Object class `$DurableObject`:
the `cloudflare_durable` preset's today. A Nitro release that moves any of
them breaks the dry run or the deploy; the e2e runs the lane's own build and
dry run over the output on every change.

## WS-D — One room per deployment (ACCEPTED)

The preset sends every upgrade to one Durable Object instance (`server`), so
every visitor of an environment is in one room, as on Vercel. A room per page
or per team is an owner's change (crossws's `resolveDurableStub`).

## WS-E — The first landing relies on orun's seeded initial commit (WATCH)

`orun plan --changed` plans nothing for a push with no `before`; the first
landing merges into the empty commit orun seeds. Confirmed by the first live
bootstrap.

## WS-F — stack-tectonic 0.19.0 (ACCEPTED)

The family's one pin.

## WS-G — The deploy smoke is a passer-by (ACCEPTED)

The smoke opens a real WebSocket to prove the upgrade reaches the room; for
the 3 seconds it holds it, anyone on the page sees an anonymous visitor join
and leave.

## WS-H — Identities depend on crossws's attachment state (WATCH)

`server/utils/presence.ts` reaches the Durable Object's socket at
`peer._internal.ws` and extends the state object crossws caches there
(`_crosswsState`), so crossws's own later writes keep the identity. Neither
is public API. crossws is pinned to 0.4.6 workspace-wide, `tests/web` drives
the room through that adapter across a simulated wake, and the e2e idles real
clients past a wake; a crossws bump that changes either fails them.
