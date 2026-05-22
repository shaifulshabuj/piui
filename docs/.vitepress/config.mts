import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'piui',
  description: 'Desktop UI for the pi coding agent',
  base: '/piui/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/usage-guide' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'GitHub', link: 'https://github.com/shaifulshabuj/piui' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Usage Guide', link: '/usage-guide' },
          { text: 'Configuration', link: '/configuration' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'Architecture Overview', link: '/architecture' },
          { text: 'RPC Protocol', link: '/rpc-protocol' },
          { text: 'pi CLI Integration', link: '/pi-cli-integration' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Development Guide', link: '/development' },
          { text: 'Testing', link: '/testing' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shaifulshabuj/piui' },
    ],

    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
