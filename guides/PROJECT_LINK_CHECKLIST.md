# Project link checklist

Use this checklist to review the `home`, `playground`, and `examples` resources for every configured project. [`src/config/projects.ts`](../src/config/projects.ts) remains the only source of truth; this document tracks review progress only.

Status conventions:

- `[x]` with a link means the resource is configured.
- `[ ]` means the resource still requires review.
- If a resource does not apply, complete it as `[x]` with `N/A` and a short reason.

## npm projects

### Mazey (`mazey`)

- [x] Home — [Mazey home](https://chengchuu.github.io/mazey/)
- [x] Playground — [Mazey playground](https://chengchuu.github.io/mazey/playground/)
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### WeChat Launch App (`mazey-wechat-launch-app`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### Taro Utils (`mazey-taro-utils`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### Aliyun OSS CLI (`aliyunoss-cli`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### Lazy Load Images (`mazey-lazy-load-images`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### WordPress Utils (`mazey-wordpress-utils`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

## Go projects

### GURL (`gurl`)

- [ ] Home — Add `home` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [ ] Examples — Add `examples` to `src/config/projects.ts` or mark this item `N/A`.

### AsiaTZ (`asiatz`)

- [x] Home — [AsiaTZ home](https://chengchuu.github.io/asiatz/)
- [ ] Playground — Add `playground` to `src/config/projects.ts` or mark this item `N/A`.
- [x] Examples — [AsiaTZ examples](https://chengchuu.github.io/asiatz/examples/)

## Complete a checklist item

1. Confirm that the resource belongs to the project and uses an absolute HTTP or HTTPS URL.
2. Add the corresponding `home`, `playground`, or `examples` field to `src/config/projects.ts`.
3. Replace the unchecked item with a checked item and a descriptive link.
4. If the resource does not apply, use the format `- [x] Resource — N/A: <reason>.` instead.
5. Run the repository checks.

Do not create a standalone top-level portfolio page to satisfy an item. Link only to a project-specific resource that already exists or is implemented in the project that owns it.

```bash
npm run validate:config
npm run check
git diff --check
git status --short
git -C ../chengchuu status --short
```

`npm run check` refreshes external metadata, rebuilds `dist/`, and regenerates `../chengchuu/README.md`. Inspect both repositories after it finishes.
