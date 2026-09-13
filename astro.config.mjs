// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wiserrise.com',
  trailingSlash: 'never',
  build: {
    // /tr/index.html -> served at /tr (matches existing canonicals)
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr', 'de'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', tr: 'tr', de: 'de' },
      },
      filter: (page) => !/\/(success)(\/|$)/.test(page),
      serialize(item) {
        // Astro emits directory-format URLs with a trailing slash; strip it so
        // sitemap <loc> matches the canonical tags exactly. The root keeps its
        // slash, since that is what the homepage canonical points at.
        const strip = (u) => {
          const url = new URL(u);
          if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
          return url.toString();
        };
        item.url = strip(item.url);
        if (item.links) {
          for (const link of item.links) link.url = strip(link.url);
          // The integration emits no x-default; add it pointing at the English page.
          const fallback = item.links.find((l) => l.lang === 'en');
          if (fallback && !item.links.some((l) => l.lang === 'x-default')) {
            item.links.push({ lang: 'x-default', url: fallback.url });
          }
        }
        return item;
      },
    }),
  ],
});
