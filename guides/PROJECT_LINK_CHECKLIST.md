# Project links

This document lists configured project resources. [`src/config/projects.ts`](../src/config/projects.ts) remains the only source of truth. If a resource is not configured, omit it from this document.

## npm projects

### Mazey

- Slug: mazey
- Home — <https://chengchuu.github.io/mazey/>
- Playground — <https://chengchuu.github.io/mazey/playground/>
- API — <https://chengchuu.github.io/mazey/api/>
- GitHub — <https://github.com/chengchuu/mazey>
- npm — <https://www.npmjs.com/package/mazey>

### WeChat Launch App

- Slug: mazey-wechat-launch-app
- GitHub — <https://github.com/chengchuu/mazey-wechat-launch-app>
- npm — <https://www.npmjs.com/package/mazey-wechat-launch-app>

### Taro Utils

- Slug: mazey-taro-utils
- GitHub — <https://github.com/chengchuu/mazey-taro-utils>
- npm — <https://www.npmjs.com/package/mazey-taro-utils>

### Aliyun OSS CLI

- Slug: aliyunoss-cli
- GitHub — <https://github.com/chengchuu/aliyunoss-cli>
- npm — <https://www.npmjs.com/package/aliyunoss-cli>

### Lazy Load Images

- Slug: mazey-lazy-load-images
- Home — <https://chengchuu.github.io/mazey-lazy-load-images/>
- Playground — <https://chengchuu.github.io/mazey-lazy-load-images/playground/>
- API — <https://chengchuu.github.io/mazey-lazy-load-images/api/>
- GitHub — <https://github.com/chengchuu/mazey-lazy-load-images>
- npm — <https://www.npmjs.com/package/mazey-lazy-load-images>

### WordPress Utils

- Slug: mazey-wordpress-utils
- GitHub — <https://github.com/chengchuu/mazey-wordpress-utils>
- npm — <https://www.npmjs.com/package/mazey-wordpress-utils>

## Go projects

### GURL

- Slug: gurl
- GitHub — <https://github.com/chengchuu/gurl>

### AsiaTZ

- Slug: asiatz
- Home — <https://chengchuu.github.io/asiatz/>
- Examples — <https://chengchuu.github.io/asiatz/examples/>
- API — <https://chengchuu.github.io/asiatz/api/>
- GitHub — <https://github.com/chengchuu/asiatz>

## Add a project link

1. Confirm that the resource belongs to the project and uses an absolute HTTP or HTTPS URL.
2. Add the corresponding field to `src/config/projects.ts`.
3. Add the resource to this document after it is configured.
4. Run the repository checks.

Do not create a standalone top-level portfolio page to satisfy an item. Link only to a project-specific resource that already exists or is implemented in the project that owns it.

```bash
npm run validate:config
npm run check
git diff --check
git status --short
git -C ../chengchuu status --short
```

`npm run check` refreshes external metadata, rebuilds `dist/`, and regenerates `../chengchuu/README.md`. Inspect both repositories after it finishes.
