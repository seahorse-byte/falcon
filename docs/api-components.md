# FalconJS API Reference: Components

This document provides a reference for the built-in components that handle rendering logic in FalconJS.

```bash
<Show>

Renders its children only when a specific condition is met. It's the primary way to handle conditional rendering.

Props
when: A reactive boolean value (usually a signal or memo). If true, the children are rendered.

fallback (optional): Content to be rendered when the when condition is false.
```

```bash
Example
import { createSignal, Show } from '@olsigjeci/falconjs';

const [isLoggedIn, setIsLoggedIn] = createSignal(false);

<div>
  <Show
    when={isLoggedIn}
    fallback={<button>Log In</button>}
  >
    <p>Welcome back, user!</p>
  </Show>
</div>
```

```jsx
<For>
{/* Efficiently renders a list of items from a reactive array. It uses keyed reconciliation to minimize DOM updates, making it highly performant for dynamic lists.

    Props
    each: A reactive array (usually a signal).

    Children */}
{/* The <For> component expects a single child: a mapping function that receives an item from the array and its index, and returns the content to be rendered for that item. */}
```

Example

```jsx
import { createSignal, For } from '@olsigjeci/falconjs';

const [todos, setTodos] = createSignal([
  { id: 1, text: 'Learn FalconJS', completed: true },
  { id: 2, text: 'Build an app', completed: false },
]);
```

```jsx
<ul>
  <For each={todos}>
    {(todo, index) => (
      <li>
        {index + 1}: {todo.text}
      </li>
    )}
  </For>
</ul>
```

````bash
<Fragment>
A special component that allows you to group multiple elements without adding an extra wrapper node to the DOM. This is useful for keeping your HTML output clean.

Syntax
You can use the shorthand <>...</> syntax for Fragments.

Example
Without a Fragment, you would need a wrapper <div>:

// Renders a <div> with two <p> tags inside.


```jsx
    function UserInfo() {
        return (

            <div>
    <p>Name: John</p>
<p>Age: 30</p>
</div>
);
}
```

# With a Fragment, the <p> tags are rendered directly without the extra <div>:

```jsx
import { Fragment } from '@olsigjeci/falconjs';

function UserInfo() {
return (
<>

<p>Name: John</p>
<p>Age: 30</p>
</>
);
}
```
````
