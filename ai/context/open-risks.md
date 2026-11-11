# nitro-websockets — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/nitro-websockets/risks-and-open-questions.md`; this page lists only
what is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| WS-A | No live bootstrap yet: the repository created and linked, the deploy token minted, a real `wrangler deploy` that creates the room's Durable Object, the smoke and the probes against workers.dev, and two browsers in the deployed room are all unproven | OPEN | One bootstrap from a tag against a workspace |
| WS-H | `server/utils/presence.ts` extends crossws 0.4.6's attachment state through its internals (`_internal.ws`, `_crosswsState`); a crossws release that renames them loses identities after a wake | WATCH | crossws is pinned workspace-wide; `tests/web` drives the room through the real adapter across a simulated wake, and the e2e idles real clients past a wake |
| WS-C | The committed `wrangler.jsonc` names Nitro's output layout (`.output/server/index.mjs`, `.output/public`) and the preset's class name (`$DurableObject`); a Nitro release that moves either breaks the deploy | WATCH | The e2e (the lane's build, dry run and `wrangler dev` over the output) on every change, and a deliberate `nitro` bump |
| WS-E | `orun plan --changed` plans nothing for a push with no `before`; the first landing relies on merging into orun's seeded initial commit | WATCH | Confirmed by the first live bootstrap |

Accepted, and worth knowing before you change them: WS-B (`nitro` pinned to
the template's beta), WS-D (one room per deployment: every upgrade goes to the
one Durable Object instance `server`, as the preset routes it), WS-F
(stack-tectonic 0.19.0), WS-G (the deploy smoke's 3-second connection shows
as a passer-by joining and leaving).
