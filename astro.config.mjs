import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// TODO: Shusei — update site and base before deploying to GitHub Pages:
//   site: 'https://YOUR_GITHUB_USERNAME.github.io'
//   base: '/YOUR_REPO_NAME'  (omit if deploying to username.github.io root repo)
export default defineConfig({
  site: 'https://shuseiisengeneer.github.io',
  base: '/-proposal_mock',
  integrations: [tailwind()],
});
