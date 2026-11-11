# Epics

Orun-style work programs. Each epic is a folder carrying `epic.yaml` (the
declaration the platform reads: slug, key prefix, milestones with exit
criteria and task keys) beside its doc set. The pull request that adds the
folder is the adoption; the merge creates the epic in the workspace.

| Epic | Cluster | Status | What it is |
|------|---------|--------|------------|
| [`nitro-websockets/`](./nitro-websockets/) | **WS** | In progress (WS0) | Vercel's Nitro + WebSockets Starter, its page and room kept, built by Nitro's cloudflare_durable preset into one Cloudflare Worker whose room is a Durable Object — and an Orun baseline that instantiates it in one landing (WS2) |

As-built ≠ intent: what shipped lives in each epic's `IMPLEMENTATION-STATUS.md`.
