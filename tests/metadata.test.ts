import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeSourceMetadata,
  resolveMetadataStatus,
  type SourceMetadata,
} from "../scripts/lib/metadata";

test("null registry fields do not erase valid GitHub fallbacks", () => {
  const merged = mergeSourceMetadata([
    {
      complete: true,
      createdAt: "2024-01-02T00:00:00.000Z",
      stars: 1,
    },
    {
      complete: false,
      createdAt: null,
      latestReleaseAt: null,
    },
  ]);

  assert.equal(merged.createdAt, "2024-01-02T00:00:00.000Z");
  assert.equal(merged.stars, 1);
  assert.equal(merged.latestReleaseAt, undefined);
  assert.equal(merged.complete, false);
});

test("fulfilled but incomplete sources are marked partial", () => {
  const incomplete: SourceMetadata = { complete: false, createdAt: null };
  assert.equal(
    resolveMetadataStatus([{ status: "fulfilled", value: incomplete }], false),
    "partial",
  );
});

test("failed sources without fallback data are unavailable", () => {
  assert.equal(
    resolveMetadataStatus(
      [{ status: "rejected", reason: new Error("offline") }],
      false,
    ),
    "unavailable",
  );
  assert.equal(resolveMetadataStatus([], false), "unavailable");
});
