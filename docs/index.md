---
layout: home

hero:
  name: 'FalconJS'
  text: 'A Modern, Fine-Grained Reactive Framework.'
  tagline: Build fast, efficient user interfaces with a lightweight framework inspired by the best ideas in modern web development.
  actions:
    - theme: brand
      text: Get Started
      link: /api-reactivity
    - theme: alt
      text: View on GitHub
      link: https://github.com/seahorse-byte/falconjs

features:
  - title: 'Fine-Grained Reactivity'
    details: "Built from the ground up with signals, effects, and memos. FalconJS updates only what's necessary, without a Virtual DOM, leading to exceptional performance."
  - title: 'Modern JSX Syntax'
    details: 'Write your components with the clean, intuitive, and familiar HTML-like syntax of JSX. Our build process handles the transformation to optimized JavaScript.'
  - title: 'Complete Feature Set'
    details: 'Comes with a built-in router, global state management, and async data handling primitives, giving you everything you need to build a complete application.'
---

## Why FalconJS?

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem;">
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-divider); border-radius: 12px;">
    <h3>Performance by Default</h3>
    <p>FalconJS was built on the principle that performance should not be an afterthought. By leveraging a fine-grained reactive system, your applications are fast and efficient from the start.</p>
  </div>
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-divider); border-radius: 12px;">
    <h3>Simplicity and Ergonomics</h3>
    <p>We believe a powerful framework doesn't have to be complex. With a minimal API and familiar JSX syntax, you can be productive in minutes, not days.</p>
  </div>
  <div style="padding: 1.5rem; border: 1px solid var(--vp-c-divider); border-radius: 12px;">
    <h3>Everything Included</h3>
    <p>Stop wrestling with libraries. FalconJS comes with a built-in router, global store, and data fetching utilities, providing a cohesive development experience out of the box.</p>
  </div>
</div>

---

## See it in Action

FalconJS makes reactivity simple and intuitive. Here is a complete, working counter component that demonstrates the core concepts of signals and JSX.

```jsx
import { createSignal } from '@olsigjeci/falconjs';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>Click Me</button>
    </div>
  );
}
```

---

## Get Started in Seconds

Launch a new FalconJS project with a single command.

```bash
npx @olsigjeci/falcon-start my-falcon-app
```

---

## Join the Community & Contribute

FalconJS is an open-source project and we welcome contributions of all kinds.

- **Found a bug?** Have a feature request? Open an issue on our [GitHub repository](https://github.com/seahorse-byte/falconjs/issues).
- **Want to contribute?** We'd love your help! Feel free to fork the repository and submit a pull request.
