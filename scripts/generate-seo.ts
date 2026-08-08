import path from "node:path";
import { siteConfig } from "../src/config/site";
import { writeJson, writeText } from "./lib/files";
import { distDir } from "./lib/paths";

async function main(): Promise<void> {
  const canonicalUrl = `${siteConfig.origin}${siteConfig.basePath}`;

  await writeText(
    path.join(distDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.origin}/sitemap.xml\n`,
  );

  await writeText(
    path.join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${canonicalUrl}</loc>\n  </url>\n</urlset>\n`,
  );

  await writeJson(path.join(distDir, "site.webmanifest"), {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: siteConfig.basePath,
    scope: siteConfig.basePath,
    display: "standalone",
    background_color: siteConfig.theme.lightThemeColor,
    theme_color: siteConfig.theme.lightThemeColor,
    icons: [
      {
        src: siteConfig.assets.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: siteConfig.assets.icon512,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: siteConfig.assets.maskableIcon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  });

  console.log("Generated robots.txt, sitemap.xml, and site.webmanifest.");
}

void main();
