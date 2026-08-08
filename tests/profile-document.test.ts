import assert from "node:assert/strict";
import test from "node:test";
import { displayStars, displayVersion } from "../src/site/ProfileDocument";

test("displayVersion does not duplicate an existing v prefix", () => {
  assert.equal(displayVersion("1.2.3"), "v1.2.3");
  assert.equal(displayVersion("v1.2.3"), "v1.2.3");
  assert.equal(displayVersion(null), null);
});

test("displayStars uses the correct singular and plural labels", () => {
  assert.equal(displayStars(0), "0 stars");
  assert.equal(displayStars(1), "1 star");
  assert.equal(displayStars(2), "2 stars");
});
