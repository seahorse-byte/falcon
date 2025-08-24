# 🦅 FalconJS

[![Netlify Status](https://api.netlify.com/api/v1/badges/46b3aec6-f9a8-4ce4-8c69-06041e0f1e98/deploy-status)](https://app.netlify.com/projects/falconjs/deploys)

FalconJS is a lightweight and powerful JavaScript framework for building modern user interfaces. Inspired by the principles of SolidJS, it provides a fine-grained reactive system that minimizes DOM updates and maximizes performance, all without a Virtual DOM.

## Key Features

Fine-Grained Reactivity: Built from the ground up with reactive primitives (createSignal, createEffect, createMemo) that automatically track dependencies and update only what's necessary.

Component-Based Architecture: Create reusable UI components as simple JavaScript functions with modern JSX syntax.

High-Performance Rendering: Includes efficient, keyed list rendering (`<For>`) and conditional rendering (`<Show>`) components.

Client-Side Routing: A complete routing solution (`<Route>, <Link>`) for building fast single-page applications.

Global State Management: A simple yet powerful createStore utility for managing shared application state.

Async Handling: A dedicated createResource primitive to elegantly manage asynchronous data fetching.

### Documentation

See [https://falconjs.netlify.app/](https://falconjs.netlify.app/)

### API

See [https://falconjs.netlify.app/api-reactivity.html](https://falconjs.netlify.app/api-reactivity.html)

### Getting Started

The best way to start a new FalconJS project is by using the official starter template. Open your terminal and run:

```bash
npx @olsigjeci/falcon-start my-falcon-app
```

Then, navigate into your new project and start the development server:

```bash
cd my-falcon-app
npm install
npm run dev
```

### Core Concepts

Reactivity with Signals
State in FalconJS is managed with signals. A signal is a container for a value that automatically tracks where it's used and notifies them of changes.

```jsx
import { createSignal, createMemo } from '@olsigjeci/falconjs';

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubleCount = createMemo(() => count() \* 2);

  return (
    <div>
      <p>Count: {count()}</p>
      <p>Double Count: {doubleCount()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

List Rendering with `<For>`
The `<For>` component efficiently renders a list of items from an array. It uses keyed reconciliation to minimize DOM operations during updates, shuffles, or re-orders.

```jsx
import { createSignal, For } from '@olsigjeci/falconjs';

function TodoList() {
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn FalconJS' },
    { id: 2, text: 'Build something amazing' },
  ]);

  return (
    <ul>
      <For each={todos()}>{todo => <li>{todo.text}</li>}</For>
    </ul>
  );
}
```

License: FalconJS is open-source and licensed under the MIT License.
