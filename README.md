# VPFX Docs Site

Documentation site for **VPFX (Vulkan PostFX)**, an experimental external post-processing and shadow-pack platform for Minecraft Fabric.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm, included with Node.js

### Install Dependencies

```bash
npm install
```

### Local Development

```bash
npm run dev
```

The dev server starts at `http://localhost:4321`.

### Build

```bash
npm run build
```

The build output goes to `dist/` as a static site.

### Preview Build

```bash
npm run preview
```

## Project Structure

```text
vpfx-docs-site/
├── package.json
├── package-lock.json
├── astro.config.mjs
├── tsconfig.json
├── README.md
├── public/
│   ├── icon.png          # Original PNG icon source
│   └── favicon.png       # PNG favicon generated from icon.png
└── src/
    ├── assets/
    │   └── logo.png      # PNG navbar/site logo generated from icon.png
    ├── components/
    │   └── PageTitle.astro
    ├── content/
    │   ├── config.ts
    │   └── docs/
    │       ├── index.mdx
    │       ├── community-quick-start.md
    │       ├── player-testing-guide.md
    │       ├── pack-author-quick-start.md
    │       ├── pack-manifest-format.md
    │       ├── post-effect-graph.md
    │       ├── uniform-reference.md
    │       ├── shadow-depth-guide.md
    │       ├── common-errors.md
    │       └── publishing-guide.md
    └── pages/
```

## Icon Configuration

This package uses the PNG icon rather than the placeholder SVG assets.

Relevant configuration in `astro.config.mjs`:

```js
favicon: "/favicon.png",
logo: {
  src: "./src/assets/logo.png",
  alt: "VPFX",
  replacesTitle: true,
},
```

The original uploaded icon is preserved as:

```text
public/icon.png
```

The generated derived assets are:

```text
public/favicon.png
src/assets/logo.png
```

## Adding New Documentation

1. Create a new `.md` or `.mdx` file in `src/content/docs/`.
2. Add frontmatter at the top:

```yaml
---
title: Your Doc Title
description: A short description for SEO and search.
---
```

3. Add the page to the sidebar in `astro.config.mjs` under the appropriate section.
4. The page will appear in navigation, search, and the prev/next pagination automatically.

## Deployment

This site produces a static build and can be deployed to Vercel, Cloudflare Pages, GitHub Pages, or any static host.

### Cloudflare Pages / Vercel

```text
Framework preset: Astro
Build command: npm run build
Output directory: dist
Root directory: repository root / this folder
```

## Clean Package Notes

This package intentionally does **not** include:

```text
node_modules/
dist/
.astro/
__MACOSX/
.DS_Store
```

`package-lock.json` is included so deployments install the same dependency tree that worked locally.
# vpfx-docs
