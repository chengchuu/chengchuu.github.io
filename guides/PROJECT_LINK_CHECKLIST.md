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

### Layer ESM

- Slug: layer-esm
- Home — <https://chengchuu.github.io/layer-esm/>
- Playground — <https://chengchuu.github.io/layer-esm/playground/>
- API — <https://chengchuu.github.io/layer-esm/api/>
- GitHub — <https://github.com/chengchuu/layer-esm>
- npm — <https://www.npmjs.com/package/layer-esm>

### Dayspan Vuetify

- Slug: mazey-dayspan-vuetify
- Playground — <https://chengchuu.github.io/mazey-dayspan-vuetify/>
- GitHub — <https://github.com/chengchuu/mazey-dayspan-vuetify>
- npm — <https://www.npmjs.com/package/mazey-dayspan-vuetify>

### Element UI

- Slug: mazey-element-ui
- Home — <https://chengchuu.github.io/mazey-element-ui/>
- GitHub — <https://github.com/chengchuu/mazey-element-ui>
- npm — <https://www.npmjs.com/package/mazey-element-ui>

### SCP Next

- Slug: scp-next
- Home — <https://chengchuu.github.io/scp-next/>
- Examples — <https://chengchuu.github.io/scp-next/examples/>
- API — <https://chengchuu.github.io/scp-next/api/>
- GitHub — <https://github.com/chengchuu/scp-next>
- npm — <https://www.npmjs.com/package/scp-next>

### Vue Screenfull

- Slug: vue-screenfull
- Home — <https://chengchuu.github.io/vue-screenfull/>
- Playground — <https://chengchuu.github.io/vue-screenfull/playground/>
- API — <https://chengchuu.github.io/vue-screenfull/api/>
- GitHub — <https://github.com/chengchuu/vue-screenfull>
- npm — <https://www.npmjs.com/package/vue-screenfull>

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

## Profile README visibility

Set `hideFromProfileReadme: true` on a project in `src/config/projects.ts` to omit it from the generated profile README. Omit the attribute or set it to `false` to show the project. Only boolean values are supported.

This setting does not affect the homepage, metadata collection, or this checklist. The checklist is documentation only; the generator does not read settings from it. README categories with no visible projects are omitted. If all projects are hidden, the introduction and image remain without project tables.

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
