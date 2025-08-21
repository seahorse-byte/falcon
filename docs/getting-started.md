# Getting Started: Building a Todo App

Welcome to FalconJS! This tutorial will guide you through building your first application: a simple, reactive Todo list. You'll learn the fundamentals of state management, rendering, and handling user input.

1. Project Setup
   First, let's create a new FalconJS project. Open your terminal and run the official starter command:

```bash
npx @olsigjeci/falcon-start my-todo-app
```

Once it's finished, navigate into the new directory and start the development server:

```bash
cd my-todo-app
npm install
npm run dev
```

Now, open src/app.jsx in your code editor. This is where we'll build our app.

2.Setting Up the Component
Let's start by clearing the existing app.jsx and creating a basic structure for our Todo app.

```jsx
import { createFalconElement, render, createSignal } from '@olsigjeci/falconjs';

function TodoApp() {
  return (
    <div>
      <h1>My Todo List</h1>
      <input type="text" placeholder="What needs to be done?" />
      <ul>{/* Our list will go here */}</ul>
    </div>
  );
}

render(<TodoApp />, document.getElementById('root'));
```

3.Creating Reactive State
To store our list of todos, we need a reactive piece of state. We'll use createSignal for this. A signal will ensure that our UI automatically updates whenever the list changes.

Let's add a signal to our TodoApp component to hold an array of todo items.

```jsx
import {
  createFalconElement,
  render,
  createSignal,
  For,
} from '@olsigjeci/falconjs';

function TodoApp() {
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn FalconJS', completed: false },
    { id: 2, text: 'Build a cool app', completed: true },
  ]);

  return (
    <div>
      <h1>My Todo List</h1>
      <input type="text" placeholder="What needs to be done?" />
      <ul>
        <For each={todos}>{todo => <li>{todo.text}</li>}</For>
      </ul>
    </div>
  );
}

render(<TodoApp />, document.getElementById('root'));
```

We've now imported the `<For>` component and used it to render our initial list. Your browser should now display the two todo items.

4.Adding New Todos
Next, let's make the input field functional. We need two more signals: one to track the text in the input field, and a function to handle adding a new todo to our list.

```jsx
// ... imports

let nextId = 3; // Keep track of the next available ID

function TodoApp() {
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn FalconJS', completed: false },
    { id: 2, text: 'Build a cool app', completed: true },
  ]);

  const [newTodoText, setNewTodoText] = createSignal('');

  const addTodo = e => {
    // We only add the todo if the user presses Enter
    if (e.key === 'Enter' && newTodoText().trim() !== '') {
      setTodos([
        ...todos(),
        { id: nextId++, text: newTodoText(), completed: false },
      ]);
      setNewTodoText(''); // Clear the input field
    }
  };

  return (
    <div>
      <h1>My Todo List</h1>
      <input
        type="text"
        placeholder="What needs to be done?"
        value={newTodoText()}
        onInput={e => setNewTodoText(e.target.value)}
        onKeyDown={addTodo}
      />
      <ul>
        <For each={todos}>{todo => <li>{todo.text}</li>}</For>
      </ul>
    </div>
  );
}

// ... render call
```

Now, you can type in the input box and press Enter to add new items to your list. The UI updates instantly!

Congratulations, you've built your first fully reactive application with FalconJS!
