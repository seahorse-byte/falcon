import { createFalconElement, render, Show, For } from '../src/index.js';
import { createSignal, createMemo, createEffect } from '../src/index.js';
import { createStore } from '../src/index.js';
import { createResource } from '../src/index.js';
import { Route, Link } from '../src/index.js';

// --- Global Store ---
const [store, setStore] = createStore({ theme: 'light' });

// --- Page Components (with JSX) ---

function HomePage() {
  return (
    <div>
      <h2>Welcome to FalconJS</h2>
      <p>This is a showcase of the core features of the FalconJS framework.</p>
      <p>Use the navigation above to explore the different demos.</p>
    </div>
  );
}

function SignalsPage() {
  const [count, setCount] = createSignal(0);
  const doubleCount = createMemo(() => count() * 2);
  const isEven = createMemo(() => count() % 2 === 0);

  return (
    <div>
      <h2>Reactivity Demo (Signals & Memos)</h2>
      <p>Count: {count()}</p>
      <p>Double Count: {doubleCount()}</p>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
      <Show when={isEven}>
        <p class="tag">Count is Even</p>
      </Show>
    </div>
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

  return (
    <div>
      <h2>Keyed List Rendering (&lt;For&gt;)</h2>
      <div class="controls">
        <button
          onClick={() =>
            setItems([...items(), { id: nextId++, text: `New Item` }])
          }
        >
          Add Item
        </button>
        <button onClick={() => setItems(shuffle(items()))}>
          Shuffle Items
        </button>
      </div>
      <ul>
        <For each={items}>
          {item => (
            <li onClick={e => e.target.classList.toggle('highlight')}>
              [ID: {item.id}] - {item.text}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function StorePage() {
  const toggleTheme = () => {
    setStore(prev => ({ theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <div>
      <h2>Global Store (createStore)</h2>
      <p>The current theme is: {store.theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
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

  return (
    <div>
      <h2>Async Data Fetching (createResource)</h2>
      <div class="controls">
        <button onClick={() => setUserId(1)}>Fetch User 1</button>
        <button onClick={() => setUserId(2)}>Fetch User 2</button>
      </div>
      <Show when={userData.loading}>
        <p>Loading...</p>
      </Show>
      <Show when={() => userData() && !userData.loading()}>
        {() => (
          <div class="card">
            <p>Name: {userData().name}</p>
            <p>Email: {userData().email}</p>
          </div>
        )}
      </Show>
    </div>
  );
}

// --- Main App Layout ---
function App() {
  createEffect(() => {
    document.body.className = store.theme;
  });

  return (
    <div id="app-container">
      <header>
        <h1>🦅 FalconJS</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/signals">Signals</Link>
          <Link to="/list">Lists</Link>
          <Link to="/store">Store</Link>
          <Link to="/fetching">Fetching</Link>
        </nav>
      </header>
      <main>
        {/* --- THE FIX IS HERE --- */}
        {/* Reverted to using the `component` prop for routing, */}
        {/* as the underlying Route component likely expects this pattern. */}
        <Route path="/" component={HomePage} />
        <Route path="/signals" component={SignalsPage} />
        <Route path="/list" component={ListPage} />
        <Route path="/store" component={StorePage} />
        <Route path="/fetching" component={FetchingPage} />
      </main>
    </div>
  );
}

// --- Render ---
render(<App />, document.getElementById('root'));
