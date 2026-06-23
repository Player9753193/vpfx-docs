import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://vpfx.dev",
  base: "/",
  integrations: [
    starlight({
      title: "VPFX Docs",
      description:
        "Documentation for VPFX, an experimental external post-processing and shadow-pack platform for Minecraft Fabric.",
      favicon: "/favicon.png",
      defaultLocale: "en",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
      components: {
        PageTitle: "./src/components/PageTitle.astro",
      },
      logo: {
        src: "./src/assets/logo.png",
        alt: "VPFX",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/VulkanPostFX",
      },
      sidebar: [
        {
          label: "Introduction",
          items: [
            {
              label: "Community Quick Start",
              slug: "community-quick-start",
            },
          ],
        },
        {
          label: "For Players",
          items: [
            {
              label: "Player Testing Guide",
              slug: "player-testing-guide",
            },
          ],
        },
        {
          label: "For Pack Authors",
          items: [
            {
              label: "Pack Author Quick Start",
              slug: "pack-author-quick-start",
            },
            {
              label: "Pack Manifest Format",
              slug: "pack-manifest-format",
            },
            {
              label: "Post Effect Graph Format",
              slug: "post-effect-graph",
            },
            {
              label: "Uniform Reference",
              slug: "uniform-reference",
            },
            {
              label: "shadow_depth Guide",
              slug: "shadow-depth-guide",
            },
            {
              label: "Common Errors and Troubleshooting",
              slug: "common-errors",
            },
          ],
        },
        {
          label: "Publishing",
          items: [
            {
              label: "Pack Publishing Guide",
              slug: "publishing-guide",
            },
          ],
        },
      ],
      pagination: true,
      lastUpdated: true,
      editLink: {
        baseUrl: "https://github.com/VulkanPostFX/vpfx-docs/edit/main/",
      },
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        styleOverrides: {
          borderRadius: "0.375rem",
          frames: {
            shadowColor: "transparent",
          },
        },
      },
      head: [
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            href: "/icon.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "VPFX Docs",
          },
        },
      ],
    }),
  ],
});
