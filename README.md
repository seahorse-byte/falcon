🦅 FalconJS

FalconJS is a lightweight and powerful JavaScript framework for building modern user interfaces. Inspired by the principles of SolidJS, it provides a fine-grained reactive system that minimizes DOM updates and maximizes performance, all without a Virtual DOM.

Key Features
Fine-Grained Reactivity: Built from the ground up with reactive primitives (createSignal, createEffect, createMemo) that automatically track dependencies and update only what's necessary.

Component-Based Architecture: Create reusable UI components as simple JavaScript functions.

High-Performance Rendering: Includes efficient, keyed list rendering (<For>) and conditional rendering (<Show>) components.

Client-Side Routing: A complete routing solution (<Route>, <Link>) for building fast single-page applications.

Global State Management: A simple yet powerful createStore utility for managing shared application state.

Async Handling: A dedicated createResource primitive to elegantly manage asynchronous data fetching, including loading and error states.

Getting Started
The best way to start a new FalconJS project is by using the official starter template.

Open your terminal and run:

# npm 6.x

npm create @olsigjeci/falcon-app my-falcon-app

# npm 7+, yarn, pnpm

npm create @olsigjeci/falcon-app my-falcon-app

Then, navigate into your new project and start the development server:

cd my-falcon-app
npm install
npm run dev

Core Concepts
Reactivity with Signals
State in FalconJS is managed with signals. A signal is a container for a value that automatically tracks where it's used and notifies them of changes.

import { createSignal, createMemo } from '@olsigjeci/falconjs';

function Counter() {
const [count, setCount] = createSignal(0);
const doubleCount = createMemo(() => count() \* 2);

// When you call setCount(), any part of the UI
// that uses count() or doubleCount() will update automatically.
setInterval(() => setCount(count() + 1), 1000);

return <p>Count: {count()}, Double: {doubleCount()}</p>; // (with JSX)
}

Components
Components are just JavaScript functions that return renderable content. They receive data through a props object.

import { createFalconElement } from '@olsigjeci/falconjs';

function Greeting(props) {
return createFalconElement('h1', {}, `Hello, ${props.name}!`);
}

// Usage
Greeting({ name: 'World' });

List Rendering with <For>
The <For> component efficiently renders a list of items from an array. It uses keyed reconciliation to minimize DOM operations during updates, shuffles, or re-orders.

import { For } from '@olsigjeci/falconjs';

const [todos, setTodos] = createSignal([
{ id: 1, text: 'Learn FalconJS' },
{ id: 2, text: 'Build something amazing' }
]);

<ul>
  <For each={todos}>
    {(todo) => <li>{todo.text}</li>}
  </For>
</ul>

License
FalconJS is open-source and licensed under the MIT License.
