import assert from "node:assert/strict";
import test from "node:test";
import { initializeSectionNavigation } from "../src/client/section-navigation";

function fixture(href: string, missing = "") {
  const actions: unknown[] = [];
  const state = { retained: true };
  const events = new EventTarget();
  const heading = {
    tabIndex: 0,
    focus: (options: FocusOptions) => actions.push(["focus", options]),
  };
  const view = {
    addEventListener: events.addEventListener.bind(events),
    location: { href },
    history: {
      state,
      replaceState: (...args: unknown[]) => actions.push(["replace", ...args]),
    },
    scrollY: 100,
    scrollTo: (options: ScrollToOptions) => actions.push(["scroll", options]),
  } as unknown as Parameters<typeof initializeSectionNavigation>[0];
  const document = {
    getElementById: (id: string) => id === missing ? null :
      id === "projects" ? { getBoundingClientRect: () => ({ top: 400 }) } : heading,
    querySelector: () => missing === "header" ? null :
      { getBoundingClientRect: () => ({ height: 64 }) },
  } as unknown as Parameters<typeof initializeSectionNavigation>[1];
  return { actions, state, heading, view, document, show: () => events.dispatchEvent(new Event("pageshow")) };
}

test("alias preserves history and other parameters, focuses and reveals Projects", () => {
  const f = fixture("https://chengchuu.github.io/?theme=dark&section=projects");
  initializeSectionNavigation(f.view, f.document);
  assert.deepEqual(f.actions, []);
  f.show();
  assert.deepEqual(f.actions, [
    ["replace", f.state, "", "https://chengchuu.github.io/?theme=dark#projects"],
    ["focus", { preventScroll: true }],
    ["scroll", { top: 420, behavior: "instant" }],
  ]);
  assert.equal(f.heading.tabIndex, -1);
  f.show();
  assert.equal(f.actions.length, 3, "restoring the page must not repeat navigation");
});

test("alias alone normalizes to the native section URL", () => {
  const f = fixture("https://chengchuu.github.io/?section=projects");
  initializeSectionNavigation(f.view, f.document);
  f.show();
  assert.deepEqual(f.actions[0], [
    "replace", f.state, "", "https://chengchuu.github.io/#projects",
  ]);
});

test("irrelevant, ambiguous, and fragment URLs remain untouched", () => {
  for (const suffix of [
    "", "?section=", "?section=other", "?section=Projects",
    "?section=projects&section=projects", "?section=other&section=projects",
    "?section=projects#projects", "?section=projects#about", "#projects",
  ]) {
    const f = fixture("https://chengchuu.github.io/" + suffix);
    initializeSectionNavigation(f.view, f.document);
    f.show();
    assert.deepEqual(f.actions, [], suffix);
  }
});

test("missing DOM targets leave URL and focus untouched", () => {
  for (const missing of ["projects", "projects-title", "header"]) {
    const f = fixture("https://chengchuu.github.io/?section=projects", missing);
    initializeSectionNavigation(f.view, f.document);
    f.show();
    assert.deepEqual(f.actions, [], missing);
  }
});
