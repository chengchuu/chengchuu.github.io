import assert from "node:assert/strict";
import test from "node:test";
import { fetchText, settleInBatches } from "../scripts/lib/fetch";

test("fetchText does not retry permanent HTTP failures", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response("missing", { status: 404, statusText: "Not Found" });
  };

  try {
    await assert.rejects(
      fetchText("https://example.test/missing", {}, 3),
      /404 Not Found/,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("settleInBatches rejects invalid batch sizes", async () => {
  await assert.rejects(settleInBatches([], 0), /positive integer/);
  await assert.rejects(settleInBatches([], 1.5), /positive integer/);
});
