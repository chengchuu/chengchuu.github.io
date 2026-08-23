export function hasLightThemeRoot(html: string): boolean {
  const rootTag = html.match(/<html\b[^>]*>/)?.[0];

  return Boolean(
    rootTag?.includes('data-bs-theme="light"') &&
      rootTag.includes('data-theme-preference="light"'),
  );
}
