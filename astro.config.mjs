import { defineConfig } from 'astro/config';

// Minimal static site config
export default defineConfig({
  site: 'https://mrlesk.com',
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
});

