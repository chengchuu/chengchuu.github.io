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
- Home — <https://chengchuu.github.io/mazey-wechat-launch-app/>
- Playground — <https://chengchuu.github.io/mazey-wechat-launch-app/playground/>
- API — <https://chengchuu.github.io/mazey-wechat-launch-app/api/>
- GitHub — <https://github.com/chengchuu/mazey-wechat-launch-app>
- npm — <https://www.npmjs.com/package/mazey-wechat-launch-app>

### Taro Utils

- Slug: mazey-taro-utils
- Home — <https://chengchuu.github.io/mazey-taro-utils/>
- Playground — <https://chengchuu.github.io/mazey-taro-utils/playground/>
- API — <https://chengchuu.github.io/mazey-taro-utils/api/>
- GitHub — <https://github.com/chengchuu/mazey-taro-utils>
- npm — <https://www.npmjs.com/package/mazey-taro-utils>

### Aliyun OSS CLI

- Slug: aliyunoss-cli
- Home — <https://chengchuu.github.io/aliyunoss-cli/>
- Examples — <https://chengchuu.github.io/aliyunoss-cli/examples/>
- API — <https://chengchuu.github.io/aliyunoss-cli/api/>
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
- Home — <https://chengchuu.github.io/mazey-wordpress-utils/>
- Playground — <https://chengchuu.github.io/mazey-wordpress-utils/playground/>
- API — <https://chengchuu.github.io/mazey-wordpress-utils/api/>
- GitHub — <https://github.com/chengchuu/mazey-wordpress-utils>
- npm — <https://www.npmjs.com/package/mazey-wordpress-utils>

## Go projects

### GURL

- Slug: gurl
- Home — <https://chengchuu.github.io/gurl/>
- Examples — <https://chengchuu.github.io/gurl/examples/>
- API — <https://chengchuu.github.io/gurl/api/>
- GitHub — <https://github.com/chengchuu/gurl>

### AsiaTZ

- Slug: asiatz
- Home — <https://chengchuu.github.io/asiatz/>
- Examples — <https://chengchuu.github.io/asiatz/examples/>
- API — <https://chengchuu.github.io/asiatz/api/>
- GitHub — <https://github.com/chengchuu/asiatz>

## GitHub projects

### vue-china-map

- Slug: vue-china-map
- Demo — <https://chengchuu.github.io/vue-china-map/>
- GitHub — <https://github.com/chengchuu/vue-china-map>

### bootstrap-blueprints

- Slug: bootstrap-blueprints
- Home — <https://i.mazey.net/bootstrap-blueprints/>
- GitHub — <https://github.com/chengchuu/bootstrap-blueprints>

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
