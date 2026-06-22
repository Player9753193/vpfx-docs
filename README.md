# VPFX Docs Site

Documentation site for **VPFX (Vulkan PostFX)**, an experimental external post-processing and shadow-pack platform for Minecraft Fabric.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Install Dependencies

```bash
npm install
```

### Local Development

```bash
npm run dev
```

The dev server starts at `http://localhost:4321`. Changes to documentation files hot-reload automatically.

### Build

```bash
npm run build
```

The build output goes to `dist/` as a static site.

### Preview Build

```bash
npm run preview
```

Serves the built static site locally for testing before deployment.

## Project Structure

```
vpfx-docs-site/
├── package.json
├── astro.config.mjs        # Astro + Starlight configuration
├── tsconfig.json
├── README.md
├── public/
│   └── favicon.svg
└── src/
    ├── assets/
    │   └── logo.svg
    ├── components/
    ├── content/
    │   ├── config.ts        # Content collections config
    │   └── docs/
    │       ├── index.mdx                # Homepage
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

## Adding New Documentation

1. Create a new `.md` file in `src/content/docs/`.
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

This site produces a static build. It can be deployed to:

### Vercel

1. Import the repository into Vercel.
2. Framework preset: **Astro** (auto-detected).
3. Build command: `npm run build`
4. Output directory: `dist`

### Cloudflare Pages

1. Connect the repository in Cloudflare Pages.
2. Build command: `npm run build`
3. Build output directory: `dist`

### GitHub Pages

Use the [Astro GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/) or the `@astrojs/starlight` deployment docs.

## Features

- Full-text search (Pagefind, built into Starlight)
- Syntax highlighting for JSON, GLSL, Java, Bash, Markdown, and more
- Fixed sidebar navigation with active page highlighting
- Auto-generated table of contents from headings
- Previous/Next page navigation
- Dark/light mode
- Mobile-responsive
- SEO with Open Graph tags
- Fully static output (no database, no backend)

## License

Documentation content is maintained by the VPFX community. See individual document frontmatter for details.

## Clean Package Notes

This clean package intentionally does **not** include `node_modules/`, `dist/`, `.astro/`, `__MACOSX/`, or `.DS_Store` files.

Recommended deployment root is this directory, where `package.json` is located.

```bash
npm install
npm run dev
npm run build
npm run preview
```

For Cloudflare Pages / Vercel:

```text
Framework preset: Astro
Build command: npm run build
Output directory: dist
Root directory: repository root / this folder
```


## Cloudflare Pages

Build command: `npm run build`

Build output directory: `dist`

Recommended environment variable: `NODE_VERSION=22`

This package pins `@astrojs/sitemap` to `3.1.6` for compatibility with the current Astro 4 + Starlight 0.28 stack.
