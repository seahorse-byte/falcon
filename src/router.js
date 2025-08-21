import { createSignal, createMemo, createEffect } from './reactivity.js';
import { createFalconElement } from './core.js';

// A global signal that holds the current URL path. All routes will react to this.
const [location, setLocation] = createSignal(window.location.pathname);

// Listen to the browser's back/forward buttons and update our signal.
window.addEventListener('popstate', () => {
  setLocation(window.location.pathname);
});

/**
 * Programmatically navigates to a new URL without a page reload.
 * @param {string} to The path to navigate to (e.g., '/about').
 */
export function navigate(to) {
  window.history.pushState({}, '', to);
  setLocation(to);
}

/**
 * A component that renders its content only when the current URL
 * matches its `path` prop. This is a more robust, self-contained implementation.
 */
export function Route(props) {
  const { path, component } = props;
  const marker = document.createComment(`falcon-route: ${path}`);
  let currentElement = null;

  createEffect(() => {
    const isMatch = location() === path;
    const parent = marker.parentNode;

    if (isMatch) {
      // If the route matches and it's not already rendered, render it.
      if (!currentElement) {
        const newElement = createFalconElement(component, {});
        if (parent) {
          // Insert the new element right after the marker.
          parent.insertBefore(newElement, marker.nextSibling);
        }
        currentElement = newElement;
      }
    } else {
      // If the route doesn't match and it is currently rendered, remove it.
      if (currentElement) {
        if (parent) {
          parent.removeChild(currentElement);
        }
        currentElement = null;
      }
    }
  });

  return marker;
}

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
