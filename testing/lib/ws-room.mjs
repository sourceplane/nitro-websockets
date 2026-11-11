// Real WebSocket clients in the room: node ws-room.mjs <ws://host:port/api/ws> [idle-seconds]
//
// Drives the deployed (or `wrangler dev`) Worker as browsers do, over Node's
// own WebSocket: presence on join, a cursor fanned out to the others and
// clamped, a reaction, a rejected reaction, a ping, a leave, and the roster a
// later joiner is welcomed with. With idle-seconds it then leaves the room
// quiet that long — past the window in which workerd hibernates an idle
// Durable Object — and checks the room still knows everyone after it wakes.
// Exits non-zero, naming the check, on the first failure.
const [url, idleArg] = process.argv.slice(2);
const idle = Number(idleArg || 0);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = false;
const check = (ok, what) => {
  console.log(`   ${ok ? "ok" : "✕ "} ${what}`);
  if (!ok) failed = true;
};

function join(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const frames = [];
    const waiters = [];
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      frames.push(m);
      for (const w of [...waiters]) if (w.pred(m)) { waiters.splice(waiters.indexOf(w), 1); w.done(m); }
    });
    ws.addEventListener("open", () => resolve({
      name, ws, frames,
      next: (pred, ms = 5000) => new Promise((res, rej) => {
        const hit = frames.find(pred);
        if (hit) return res(hit);
        const t = setTimeout(() => rej(new Error(`${name}: timed out waiting`)), ms);
        waiters.push({ pred, done: (m) => { clearTimeout(t); res(m); } });
      }),
      send: (m) => ws.send(JSON.stringify(m)),
    }));
    ws.addEventListener("error", () => reject(new Error(`${name}: could not connect to ${url}`)));
  });
}

try {
  const a = await join("A");
  const self = (await a.next((m) => m.t === "welcome")).self;
  check(/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(self.name) && /^hsl\(/.test(self.color), `A is welcomed as ${self.name}`);
  const b = await join("B");
  const wb = await b.next((m) => m.t === "welcome");
  check(wb.peers.some((p) => p.id === self.id), "B's welcome lists A");
  check((await a.next((m) => m.t === "join")).peer.id === wb.self.id, "A hears B join");

  a.send({ t: "cursor", x: 0.25, y: 1.7 });
  const c = await b.next((m) => m.t === "cursor");
  check(c.id === self.id && c.x === 0.25 && c.y === 1, "A's cursor reaches B, clamped to 0..1");
  b.send({ t: "reaction", emoji: "💩", x: 0.5, y: 0.5 });
  b.send({ t: "reaction", emoji: "🔥", x: 0.5, y: 0.5 });
  const r = await a.next((m) => m.t === "reaction");
  check(r.emoji === "🔥" && r.id === wb.self.id, "B's 🔥 reaches A, and the unknown emoji does not");
  a.send({ t: "ping" });
  check((await a.next((m) => m.t === "pong")).t === "pong", "A's ping gets a pong");
  await wait(300);
  check(!a.frames.some((m) => m.t === "cursor"), "A's own cursor never came back to A");

  const c2 = await join("C");
  const wc = await c2.next((m) => m.t === "welcome");
  check(wc.peers.length === 2, `C is welcomed with 2 others (${wc.peers.map((p) => p.name).join(", ")})`);
  b.ws.close(1000, "bye");
  check((await a.next((m) => m.t === "leave")).id === wb.self.id, "A hears B leave");
  check((await c2.next((m) => m.t === "leave")).id === wb.self.id, "C hears B leave");

  if (idle > 0) {
    console.log(`   … the room is left quiet for ${idle}s, long enough for its Durable Object to hibernate`);
    await wait(idle * 1000);
    a.send({ t: "cursor", x: 0.1, y: 0.2 });
    const after = await c2.next((m) => m.t === "cursor" && m.x === 0.1);
    check(after.id === self.id, "after the wake, A's cursor still reaches C as A's");
    const d = await join("D");
    const wd = await d.next((m) => m.t === "welcome");
    check(wd.peers.map((p) => p.id).sort().join() === [self.id, wc.self.id].sort().join(), "after the wake, D is welcomed with A and C");
    c2.ws.close(1000);
    check((await a.next((m) => m.t === "leave" && m.id === wc.self.id)).id === wc.self.id, "after the wake, A hears C leave");
    d.ws.close(1000);
  } else {
    c2.ws.close(1000);
  }
  a.ws.close(1000);
} catch (e) {
  check(false, String(e.message || e));
}
await wait(200);
process.exit(failed ? 1 : 0);
