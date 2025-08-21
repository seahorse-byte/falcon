// docs/.vitepress/config.js

export default {
  title: 'FalconJS',
  description: 'A lightweight, fine-grained reactive JS framework.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api-reactivity' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'API: Reactivity', link: '/api-reactivity' },
          { text: 'API: Components', link: '/api-components' },
        ],
      },
    ],
  },
};
