import { createFalconElement, render, Show, For } from '../src/index.js';
import { createSignal, createMemo, createEffect } from '../src/index.js';
import { createStore } from '../src/index.js';
import { createResource } from '../src/index.js';
import { Route, Link } from '../src/index.js';

// --- 1. Global Store ---
// A simple store to demonstrate cross-component state.
const [store, setStore] = createStore({
  theme: 'light',
});

// --- 2. Page Components ---

function HomePage() {
  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Welcome to FalconJS'),
    createFalconElement(
      'p',
      {},
      'This is a showcase of the core features of the FalconJS framework.',
    ),
    createFalconElement(
      'p',
      {},
      'Use the navigation above to explore the different demos.',
    ),
  );
}

function SignalsPage() {
  const [count, setCount] = createSignal(0);
  const doubleCount = createMemo(() => count() * 2);
  const isEven = createMemo(() => count() % 2 === 0);

  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Reactivity Demo (Signals & Memos)'),
    // --- THE FIX IS HERE ---
    // We now pass functions as children to make the text reactive.
    createFalconElement('p', {}, () => `Count: ${count()}`),
    createFalconElement('p', {}, () => `Double Count: ${doubleCount()}`),
    createFalconElement(
      'button',
      { onclick: () => setCount(count() + 1) },
      'Increment',
    ),
    Show({
      when: isEven,
      children: [createFalconElement('p', { class: 'tag' }, 'Count is Even')],
    }),
  );
}

function ListPage() {
  let nextId = 4;
  const [items, setItems] = createSignal([
    { id: 1, text: 'Render a list' },
    { id: 2, text: 'Preserve state on shuffle' },
    { id: 3, text: 'Minimize DOM updates' },
  ]);
  const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Keyed List Rendering (<For>)'),
    createFalconElement(
      'div',
      { class: 'controls' },
      createFalconElement(
        'button',
        {
          onclick: () =>
            setItems([...items(), { id: nextId++, text: `New Item` }]),
        },
        'Add Item',
      ),
      createFalconElement(
        'button',
        { onclick: () => setItems(shuffle(items())) },
        'Shuffle Items',
      ),
    ),
    createFalconElement(
      'ul',
      {},
      For({
        each: items,
        children: [
          item =>
            createFalconElement(
              'li',
              {
                onclick: e => e.target.classList.toggle('highlight'),
              },
              `[ID: ${item.id}] - ${item.text}`,
            ),
        ],
      }),
    ),
  );
}

function StorePage() {
  const toggleTheme = () => {
    setStore(prev => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Global Store (createStore)'),
    createFalconElement('p', {}, () => `The current theme is: ${store.theme}`),
    createFalconElement('button', { onclick: toggleTheme }, 'Toggle Theme'),
  );
}

function FetchingPage() {
  const fetchUserData = async id => {
    await new Promise(res => setTimeout(res, 1000));
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
    );
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  };

  const [userId, setUserId] = createSignal(1);
  const userData = createResource(() => fetchUserData(userId()));

  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Async Data Fetching (createResource)'),
    createFalconElement(
      'div',
      { class: 'controls' },
      createFalconElement(
        'button',
        { onclick: () => setUserId(1) },
        'Fetch User 1',
      ),
      createFalconElement(
        'button',
        { onclick: () => setUserId(2) },
        'Fetch User 2',
      ),
    ),
    Show({
      when: userData.loading,
      children: [createFalconElement('p', {}, 'Loading...')],
    }),
    Show({
      when: () => userData() && !userData.loading(),
      children: [
        createFalconElement(
          'div',
          { class: 'card' },
          createFalconElement('p', {}, () => `Name: ${userData().name}`),
          createFalconElement('p', {}, () => `Email: ${userData().email}`),
        ),
      ],
    }),
  );
}

// --- Main App Layout ---
function App() {
  // An effect to apply the theme class from the store to the body.
  createEffect(() => {
    document.body.className = store.theme;
  });

  return createFalconElement(
    'div',
    { id: 'app-container' },
    createFalconElement(
      'header',
      {},
      createFalconElement('h1', {}, '🦅 FalconJS'),
      createFalconElement(
        'nav',
        {},
        Link({ to: '/', children: ['Home'] }),
        Link({ to: '/signals', children: ['Signals'] }),
        Link({ to: '/list', children: ['Lists'] }),
        Link({ to: '/store', children: ['Store'] }),
        Link({ to: '/fetching', children: ['Fetching'] }),
      ),
    ),
    createFalconElement(
      'main',
      {},
      Route({ path: '/', children: [HomePage({})] }),
      Route({ path: '/signals', children: [SignalsPage({})] }),
      Route({ path: '/list', children: [ListPage({})] }),
      Route({ path: '/store', children: [StorePage({})] }),
      Route({ path: '/fetching', children: [FetchingPage({})] }),
    ),
  );
}

// --- Render ---
render(App, document.getElementById('root'));
