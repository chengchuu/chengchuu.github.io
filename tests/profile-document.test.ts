import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  displayStars,
  displayVersion,
  ProfileDocument,
} from "../src/site/ProfileDocument";

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

test("theme and project filters expose accessible group names", () => {
  const html = renderToStaticMarkup(
    createElement(ProfileDocument, { projects: [] }),
  );

  assert.match(
    html,
    /class="theme-switcher" role="group" aria-label="Theme preference"/,
  );
  assert.match(
    html,
    /class="filter-list" role="group" aria-label="Filter projects"/,
  );
  assert.match(html, /class="row align-items-center gy-5 gx-0 gx-sm-5"/);
});
