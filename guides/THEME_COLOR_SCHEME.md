# Theme color scheme

This guide records the color system used by `chengchuu.github.io`. Reuse the semantic roles and theme behavior together; do not copy isolated hex values without checking their intended foreground, background, and interaction state.

The implementation sources are:

- [`src/styles/theme.css`](../src/styles/theme.css) for semantic tokens and Bootstrap mappings.
- [`src/styles/site.css`](../src/styles/site.css) for component treatments and derived colors.
- [`src/config/site.ts`](../src/config/site.ts) for browser and manifest theme colors.
- [`src/client/theme-dom.ts`](../src/client/theme-dom.ts) for applying the resolved light or dark theme.

## Semantic palette

Use the `--profile-*` properties as the primary interface. Component CSS should depend on semantic roles instead of direct light- or dark-theme values.

| Token                  | Light     | Dark      | Purpose                                           |
|:-----------------------|:----------|:----------|:--------------------------------------------------|
| `--profile-primary`    | `#4d8ffb` | `#5089e8` | Links, buttons, selected controls, and accents    |
| `--profile-on-primary` | `#141414` | `#141414` | Text and icons displayed on the primary color     |
| `--profile-surface`    | `#ffffff` | `#141414` | Page, header, footer, field, and control surfaces |
| `--profile-heading`    | `#2d2d2d` | `#d6d6d6` | Headings and other high-emphasis text             |
| `--profile-body`       | `#626262` | `#a5a5a5` | Body text and default navigation text             |
| `--profile-muted`      | `#828282` | `#878787` | Metadata and secondary text                       |
| `--profile-divider`    | `#f6f6f6` | `#1d1d1d` | Fine section, header, and footer dividers         |
| `--profile-field`      | `#ebebeb` | `#272727` | Form, control, and card borders                   |
| `--profile-focus`      | `#d9d9d9` | `#373737` | Reserved focus-border color                       |
| `--profile-fieldset`   | `#c0c0c0` | `#4e4e4e` | Fieldset and dashed empty-state borders           |
| `--profile-code-bg`    | `#eeeeee` | `#242424` | Code-block and inline-code backgrounds            |
| `--profile-code`       | `#e83e8c` | `#d44386` | Inline-code text                                  |
| `--profile-highlight`  | `#fff9c0` | `#413f2b` | Text selection, insertion, and highlights         |

`--profile-focus`, `--profile-code-bg`, and `--profile-code` are part of the current palette even though the homepage does not currently consume them directly.

## Canonical CSS

Define the light palette on `:root` and override theme-dependent values under Bootstrap's `data-bs-theme="dark"` selector.

```css
:root {
  color-scheme: light;
  --profile-primary: #4d8ffb;
  --profile-on-primary: #141414;
  --profile-surface: #ffffff;
  --profile-heading: #2d2d2d;
  --profile-body: #626262;
  --profile-muted: #828282;
  --profile-divider: #f6f6f6;
  --profile-field: #ebebeb;
  --profile-focus: #d9d9d9;
  --profile-fieldset: #c0c0c0;
  --profile-code-bg: #eeeeee;
  --profile-code: #e83e8c;
  --profile-highlight: #fff9c0;
}

[data-bs-theme="dark"] {
  color-scheme: dark;
  --profile-primary: #5089e8;
  --profile-surface: #141414;
  --profile-heading: #d6d6d6;
  --profile-body: #a5a5a5;
  --profile-muted: #878787;
  --profile-divider: #1d1d1d;
  --profile-field: #272727;
  --profile-focus: #373737;
  --profile-fieldset: #4e4e4e;
  --profile-code-bg: #242424;
  --profile-code: #d44386;
  --profile-highlight: #413f2b;
}
```

The dark block inherits `--profile-on-primary: #141414` from `:root`. Keep this dark foreground on both primary blues; white text does not provide the intended contrast for these controls.

## Bootstrap mapping

Map Bootstrap variables to the semantic palette so framework components and custom components resolve the same theme.

```css
:root {
  --bs-primary: #4d8ffb;
  --bs-primary-rgb: 77, 143, 251;
  --bs-body-bg: #ffffff;
  --bs-body-color: #626262;
  --bs-heading-color: #2d2d2d;
  --bs-border-color: #ebebeb;
  --bs-link-color: #4d8ffb;
  --bs-link-hover-color: #2f73df;
}

[data-bs-theme="dark"] {
  --bs-primary: #5089e8;
  --bs-primary-rgb: 80, 137, 232;
  --bs-body-bg: #141414;
  --bs-body-color: #a5a5a5;
  --bs-heading-color: #d6d6d6;
  --bs-border-color: #272727;
  --bs-link-color: #5089e8;
  --bs-link-hover-color: #79a7f1;
}
```

Keep each `--bs-primary-rgb` value synchronized with its hexadecimal primary value. The site uses this RGB triplet for translucent backgrounds and focus rings.

## Derived component colors

Use `color-mix()` and alpha colors for secondary treatments rather than adding one-off palette values.

| Treatment                | Current expression                                                       |
|:-------------------------|:-------------------------------------------------------------------------|
| Page accent glow         | `rgb(var(--bs-primary-rgb) / 10%)`                                       |
| Translucent header       | `color-mix(in srgb, var(--profile-surface) 88%, transparent)`            |
| Global focus outline     | `color-mix(in srgb, var(--profile-primary) 55%, transparent)`            |
| Search focus ring        | `rgb(var(--bs-primary-rgb) / 18%)`                                       |
| Portrait outline         | `color-mix(in srgb, var(--profile-primary) 35%, var(--profile-field))`   |
| Project-card surface     | `color-mix(in srgb, var(--profile-surface) 94%, var(--profile-primary))` |
| Project-card hover edge  | `color-mix(in srgb, var(--profile-primary) 45%, var(--profile-field))`   |
| Project-link border      | `color-mix(in srgb, var(--profile-primary) 30%, var(--profile-field))`   |
| Button hover background  | `color-mix(in srgb, var(--profile-primary) 88%, #ffffff)`                |
| Button active background | `color-mix(in srgb, var(--profile-primary) 80%, #ffffff)`                |
| Portrait shadow          | `rgb(0 0 0 / 16%)`                                                       |
| Project-card shadow      | `rgb(0 0 0 / 8%)`                                                        |

Use `--profile-on-primary` for text and icons on primary buttons, selected filters, selected theme controls, focused project links, and the skip link.

## Browser theme colors

The resolved theme controls the root attribute and the browser chrome color.

| Setting                     | Light                   | Dark                   |
|:----------------------------|:------------------------|:-----------------------|
| Root attribute              | `data-bs-theme="light"` | `data-bs-theme="dark"` |
| `<meta name="theme-color">` | `#ffffff`               | `#141414`              |
| CSS `color-scheme`          | `light`                 | `dark`                 |

Keep the browser values in `siteConfig.theme.lightThemeColor` and `siteConfig.theme.darkThemeColor`. Update `<meta name="theme-color">` whenever the resolved theme changes. The generated web app manifest uses the light surface, `#ffffff`, for both `background_color` and `theme_color`.

## Contrast constraints

The following ratios use the WCAG relative-luminance calculation.

| Foreground and background | Light     | Dark      | Reuse guidance                                  |
|:--------------------------|:----------|:----------|:------------------------------------------------|
| Heading on surface        | `13.77:1` | `12.68:1` | Suitable for normal text                        |
| Body on surface           | `6.10:1`  | `7.48:1`  | Suitable for normal text                        |
| Muted on surface          | `3.84:1`  | `5.13:1`  | Keep light muted text secondary and noncritical |
| On-primary on primary     | `5.82:1`  | `5.34:1`  | Suitable for normal control text                |
| Primary on surface        | `3.16:1`  | `5.34:1`  | In light mode, use for UI accents or large text |
| Link hover on surface     | `4.53:1`  | `7.55:1`  | Suitable for normal text                        |

The light primary blue does not reach `4.5:1` against white. Do not reuse it for small, essential body text when WCAG AA normal-text contrast is required. Use the light hover blue, `#2f73df`, or select another verified text color while retaining `#4d8ffb` for borders, controls, focus accents, and large display text.

Do not rely on color alone to communicate state. Preserve visible focus indicators and state attributes such as `aria-pressed`.

## Reuse checklist

When you apply this scheme to another project:

1. Copy the semantic tokens and Bootstrap mappings together.
2. Apply `data-bs-theme="light"` or `data-bs-theme="dark"` to the root document.
3. Use semantic variables in components instead of direct theme hex values.
4. Keep `--profile-on-primary` on every primary-filled interactive control.
5. Update browser theme metadata when the resolved theme changes.
6. Recheck contrast when font size, weight, opacity, backgrounds, or mixed-color percentages change.
7. Test keyboard focus, selected states, text selection, and both color schemes.
