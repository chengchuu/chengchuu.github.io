export const siteConfig = {
  name: "Cheng",
  title: "Cheng – Full-Stack Developer",
  description:
    "Full-stack developer working with Go, Node.js, TypeScript, React, Vue, PHP, and developer automation.",
  origin: "https://chengchuu.github.io",
  basePath: "/",
  theme: {
    storageKey: "CHENGCHUU_THEME",
    defaultPreference: "system",
    lightThemeColor: "#ffffff",
    darkThemeColor: "#141414",
  },
  assets: {
    profilePhoto: "/images/chengchuu-512x512.jpg",
    favicon32: "/images/logo-32x32.png",
    icon192: "/images/logo-192x192.png",
    icon512: "/images/logo-512x512.png",
    maskableIcon512: "/images/logo-maskable-512x512.png",
    openGraph: "/images/logo-open-graph-1200x630.png",
  },
} as const;
