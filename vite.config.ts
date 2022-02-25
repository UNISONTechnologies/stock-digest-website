import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import htmlConfig from "vite-plugin-html-config";

const name = "Stock Digest";
const keywords =
    "stocks digest email track tracker unisontech unisontechnologies";
const description = "A daily email service with updates for your stocks";
const faviconUrl = "";
const twitterUsername = "@unisontechnologies";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        htmlConfig({
            metas: [
                { charset: "UTF-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1.0",
                },
                {
                    name: "keywords",
                    content: keywords,
                },
                {
                    name: "description",
                    content: description,
                },
                { name: "robots", content: "index, follow" },

                // Open Graph
                { property: "og:title", content: name },
                {
                    property: "og:image",
                    content: faviconUrl,
                },
                { property: "og:type", content: "website" },
                { property: "og:description", content: description },

                // Twitter Cards
                { name: "twitter:card", content: "summary" },
                { name: "twitter:site", content: twitterUsername },
                { name: "twitter:creator", content: twitterUsername },
                { name: "twitter:title", content: name },
                { name: "twitter:description", content: description },
                {
                    name: "twitter:image",
                    content: faviconUrl,
                },
                {
                    name: "twitter:image:alt",
                    content: `The ${name} logo`,
                },
            ],
            links: [
                // { rel: "icon", type: "image/png", href: "/favicon.png" },
                // { rel: "icon", href: "/favicon.ico" },
                { rel: "preconnect", href: "https://fonts.googleapis.com/" },
                {
                    rel: "preconnect",
                    href: "https://fonts.gstatic.com",
                    crossorigin: "",
                },
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700&display=swap",
                },
            ],
        }),
        vue(),
    ],
});
