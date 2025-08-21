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
          { text: 'API: Routing', link: '/api-routing' },
          { text: 'API: State Management', link: '/api-state-management' },
          { text: 'API: Async', link: '/api-async' },
        ],
      },
    ],
  },
};
