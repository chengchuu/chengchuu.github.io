import type { ReactElement } from "react";
import type { GeneratedProject } from "../types/project";
import { projectResourceFields } from "../config/project-resources";
import { siteConfig } from "../config/site";

interface ProfileDocumentProps {
  projects: GeneratedProject[];
}

function displayDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function displayVersion(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.startsWith("v") ? value : `v${value}`;
}

function releaseTimestamp(value: string | null): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function sortProjectsByLatestRelease(
  projects: readonly GeneratedProject[],
): GeneratedProject[] {
  return projects
    .map((project, index) => ({
      index,
      project,
      timestamp: releaseTimestamp(project.latestReleaseAt),
    }))
    .sort((left, right) => {
      if (left.timestamp !== right.timestamp) {
        return right.timestamp - left.timestamp;
      }

      return left.index - right.index;
    })
    .map(({ project }) => project);
}

function ProjectCard({ project }: { project: GeneratedProject }): ReactElement {
  const created = displayDate(project.createdAt);
  const released = displayDate(project.latestReleaseAt);
  const version = displayVersion(project.latestVersion);
  const searchText = [
    project.name,
    project.slug,
    project.category,
    project.description ?? "",
    project.primaryLanguage ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase();

  return (
    <article
      className="project-card"
      data-project-card
      data-project-category={project.category}
      data-project-search={searchText}
      data-project-slug={project.slug}
    >
      <div className="project-category">
        {project.category === "go" ? "Go package" : project.category}
      </div>
      <h3 className="project-name">{project.name}</h3>
      {project.description ? (
        <p className="project-description">{project.description}</p>
      ) : (
        <p className="project-description">
          Open-source work maintained by Cheng.
        </p>
      )}
      <div className="project-meta" aria-label={`${project.name} metadata`}>
        {version || project.primaryLanguage ? (
          <div className="project-meta-row">
            {version ? <span>{version}</span> : null}
            {project.primaryLanguage ? <span>{project.primaryLanguage}</span> : null}
          </div>
        ) : null}
        {created || released ? (
          <div className="project-meta-row">
            {created ? (
              <span>
                Created <time dateTime={created}>{created}</time>
              </span>
            ) : null}
            {released ? (
              <span>
                Released <time dateTime={released}>{released}</time>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="project-links" aria-label={`${project.name} resources`}>
        {projectResourceFields.map(([field, label]) => {
          const href = project[field];
          return href ? (
            <a className="project-link" href={href} key={field}>
              {label}
            </a>
          ) : null;
        })}
      </div>
    </article>
  );
}

export function ProfileDocument({
  projects,
}: ProfileDocumentProps): ReactElement {
  const projectsForDisplay = sortProjectsByLatestRelease(projects);
  const canonicalUrl = `${siteConfig.origin}${siteConfig.basePath}`;
  const profilePhotoUrl = new URL(
    siteConfig.assets.profilePhoto,
    `${siteConfig.origin}/`,
  ).toString();
  const openGraphUrl = new URL(
    siteConfig.assets.openGraph,
    `${siteConfig.origin}/`,
  ).toString();
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: canonicalUrl,
    image: profilePhotoUrl,
    knowsAbout: [
      "Go",
      "Node.js",
      "TypeScript",
      "React",
      "Vue.js",
      "PHP",
      "Developer automation",
    ],
  };

  return (
    <html lang="en" data-bs-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{siteConfig.title}</title>
        <meta name="description" content={siteConfig.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={openGraphUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.title} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={openGraphUrl} />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={siteConfig.assets.favicon32}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href={siteConfig.assets.icon192}
        />
        <link rel="apple-touch-icon" href={siteConfig.assets.icon192} />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="theme-color"
          content={siteConfig.theme.lightThemeColor}
        />
        <script src="/assets/theme-runtime.js" />
        <link rel="stylesheet" href="/assets/index.css" />
        <link rel="stylesheet" href="/assets/theme.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script defer src="/assets/index.js" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <nav className="navbar navbar-expand" aria-label="Primary navigation">
            <div className="container py-2">
              <a className="navbar-brand" href="/" aria-label="Cheng home">
                Cheng
              </a>
              <div className="d-flex align-items-center gap-2 gap-md-4">
                <a className="nav-link d-none d-sm-inline" href="#projects">
                  Projects
                </a>
                <a
                  className="nav-link d-none d-md-inline"
                  href="https://github.com/chengchuu"
                >
                  GitHub
                </a>
                <div
                  className="theme-switcher"
                  role="group"
                  aria-label="Theme preference"
                >
                  {(["light", "dark"] as const).map((preference) => (
                    <button
                      className="theme-option"
                      type="button"
                      data-theme-preference={preference}
                      aria-label={`Use ${preference} theme`}
                      aria-pressed={preference === "light" ? "true" : "false"}
                      key={preference}
                    >
                      {preference.slice(0, 1).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </header>
        <main id="main-content">
          <section className="hero">
            <div className="container">
              <div className="row align-items-center gy-5 gx-0 gx-sm-5">
                <div className="col-lg-7">
                  <p className="eyebrow">Full-Stack Developer</p>
                  <h1 className="hero-title">Building useful software, end to end.</h1>
                  <p className="hero-copy">
                    I’m Cheng. I work across Go, Node.js, TypeScript, React,
                    Vue, PHP, and developer automation—with a focus on clear
                    systems that are practical to operate and evolve.
                  </p>
                  <a className="btn btn-primary px-4 py-2" href="#projects">
                    Explore projects
                  </a>
                </div>
                <div className="col-lg-5">
                  <div className="portrait-frame">
                    <img
                      className="profile-photo"
                      src={siteConfig.assets.profilePhoto}
                      alt="Portrait of Cheng"
                      width="512"
                      height="512"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section" id="projects" aria-labelledby="projects-title">
            <div className="container">
              <p className="eyebrow">Selected work and utilities</p>
              <h2 className="section-heading" id="projects-title">
                Projects
              </h2>
              <p className="section-copy">
                Open-source packages, tools, and experiments. Browse every
                configured project here without leaving the homepage.
              </p>
              <div className="project-toolbar">
                <label>
                  <span className="visually-hidden">Search projects</span>
                  <input
                    className="search-field"
                    type="search"
                    placeholder="Search projects"
                    data-project-search
                  />
                </label>
                <div
                  className="filter-list"
                  role="group"
                  aria-label="Filter projects"
                >
                  {[
                    ["all", "All"],
                    ["npm", "npm"],
                    ["go", "Go"],
                    ["github", "GitHub"],
                  ].map(([value, label]) => (
                    <button
                      className="filter-button"
                      type="button"
                      data-project-filter={value}
                      aria-pressed={value === "all" ? "true" : "false"}
                      key={value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="project-grid">
                {projectsForDisplay.map((project) => (
                  <ProjectCard project={project} key={project.slug} />
                ))}
              </div>
              <p className="empty-state" data-empty-state hidden>
                No projects match this search.
              </p>
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <div className="container d-flex flex-wrap justify-content-between gap-2">
            <span>© {new Date().getUTCFullYear()} Cheng</span>
            <a href="https://github.com/chengchuu">github.com/chengchuu</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
