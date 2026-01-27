import { join } from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginRss } from "@rspress/plugin-rss";
import { pluginSitemap } from "@rspress/plugin-sitemap";
import { pluginOpenGraph } from "rsbuild-plugin-open-graph";
import { pluginFontFigtree } from "rspress-plugin-font-figtree";
import { pluginOpenApi } from "./plugins/openApiPlugin";

const PUBLISH_URL = process.env.PUBLISH_URL || "https://evidos.github.io";

const ogImageUrl = new URL(PUBLISH_URL);
ogImageUrl.pathname = "/og_image.png";

export default defineConfig({
  llms: true,
  builderConfig: {
    plugins: [
      pluginOpenGraph({
        title: "Signhost Developer Hub",
        type: "website",
        url: PUBLISH_URL,
        description: "Entrust Signhost Developer Hub",
        locale: "en",
        image: ogImageUrl.href,
      }),
    ],
  },
  root: join(__dirname, "docs"),
  title: "Signhost Developer Hub",
  description: "Entrust Signhost Developer Hub",
  icon: "/favicon.png",
  logo: "/signhost.svg",
  globalStyles: join(__dirname, "theme", "index.css"),
  route: {
    cleanUrls: true,
  },
  plugins: [
    pluginOpenApi({ clean: true }),
    pluginFontFigtree(),
    pluginSitemap({ siteUrl: PUBLISH_URL }),
    pluginRss({
      siteUrl: PUBLISH_URL,
      feed: [
        {
          id: "blog-rss",
          test: "/blog/posts",
          language: "en",
          output: {
            type: "atom",
            filename: "blog-rss.xml",
          },
        },
      ],
    }),
  ],
  themeConfig: {
    darkMode: false,
    footer: {
      message: `© ${new Date().getFullYear()} Entrust Corporation. All Rights Reserved.`,
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/evidos",
      },
    ],
  },
});
