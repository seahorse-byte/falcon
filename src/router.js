import { createSignal, createMemo } from './reactivity.js';
import { createFalconElement, Show } from './core.js';

// --- 1. Reactive Location ---
// A global signal that holds the current URL path. All routes will react to this.
const [location, setLocation] = createSignal(window.location.pathname);

// Listen to the browser's back/forward buttons and update our signal.
window.addEventListener('popstate', () => {
  setLocation(window.location.pathname);
});

// --- 2. Navigation Function ---
/**
 * Programmatically navigates to a new URL without a page reload.
 * @param {string} to The path to navigate to (e.g., '/about').
 */
export function navigate(to) {
  window.history.pushState({}, '', to);
  setLocation(to);
}

// --- 3. Route Component ---
/**
 * A component that renders its children only when the current URL
 * matches its `path` prop.
 */
export function Route(props) {
  const { path, children } = props;

  // A memoized boolean that is `true` only when the path matches.
  const isMatch = createMemo(() => location() === path);

  // We can reuse our powerful <Show> component to handle the rendering logic!
  return Show({
    when: isMatch,
    children: children,
  });
}

// --- 4. Link Component ---
/**
 * A component that creates a navigation link.
 * It prevents the default browser reload and uses our `navigate` function.
 */
export function Link(props) {
  const { to, children } = props;

  const handleClick = event => {
    event.preventDefault(); // This is key to preventing a full page refresh.
    navigate(to);
  };

  // Renders a standard `<a>` tag with our custom click handler.
  return createFalconElement('a', { href: to, onclick: handleClick }, children);
}
