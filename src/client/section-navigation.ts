export function initializeSectionNavigation(
  view: Pick<Window, "location" | "history" | "scrollY" | "scrollTo" | "addEventListener">,
  document: Pick<Document, "getElementById" | "querySelector">,
): void {
  // Navigate after the browser's initial fragment navigation and focus reset.
  view.addEventListener("pageshow", () => navigateToProjects(view, document), {
    once: true,
  });
}

function navigateToProjects(
  view: Pick<Window, "location" | "history" | "scrollY" | "scrollTo">,
  document: Pick<Document, "getElementById" | "querySelector">,
): void {
  const url = new URL(view.location.href);
  const sections = url.searchParams.getAll("section");
  if (url.hash || sections.length !== 1 || sections[0] !== "projects") {
    return;
  }

  const section = document.getElementById("projects");
  const heading = document.getElementById("projects-title");
  const header = document.querySelector<HTMLElement>(".site-header");
  if (!section || !heading || !header) {
    return;
  }

  const top = Math.max(
    0,
    view.scrollY + section.getBoundingClientRect().top -
      header.getBoundingClientRect().height - 16,
  );
  url.searchParams.delete("section");
  url.hash = "projects";
  view.history.replaceState(view.history.state, "", url.href);
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  view.scrollTo({ top, behavior: "instant" });
}
