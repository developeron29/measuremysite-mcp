// Bridges MCP over stdio to the local server's POST /mcp: one JSON-RPC message per line in, one reply per line out.
// Started by scripts/stdio.sh once wrangler dev is up. Requests run in order, so replies keep their order.
import { createInterface } from "node:readline";

const url = "http://127.0.0.1:8787/mcp";
const headers = { "content-type": "application/json", authorization: `Bearer ${process.env.MCP_READ_KEY}` };

for await (const line of createInterface({ input: process.stdin })) {
  if (!line.trim()) continue;
  try {
    const res = await fetch(url, { method: "POST", headers, body: line });
    const text = await res.text();
    if (res.status !== 202 && text) process.stdout.write(text.trim() + "\n");
  } catch (e) {
    const id = (() => { try { return JSON.parse(line).id ?? null; } catch { return null; } })();
    if (id !== null) process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message: String(e) } }) + "\n");
  }
}
