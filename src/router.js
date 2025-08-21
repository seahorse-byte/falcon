import { createSignal, createMemo } from './reactivity.js';
import { createFalconElement, Show } from './core.js';

const [location, setLocation] = createSignal(window.location.pathname);

window.addEventListener('popstate', () => {
  setLocation(window.location.pathname);
});

export function navigate(to) {
  window.history.pushState({}, '', to);
  setLocation(to);
}

/**
 * A component that renders its content only when the current URL
 * matches its `path` prop. It now correctly uses the `component` prop.
 */
export function Route(props) {
  const { path, component } = props;

  const isMatch = createMemo(() => location() === path);

  // We use the deferred rendering pattern here.
  // The component is only created and rendered when the route matches.
  return Show({
    when: isMatch,
    children: [() => createFalconElement(component, {})],
  });
}

export function Link(props) {
  const { to, children } = props;

  const handleClick = event => {
    event.preventDefault();
    navigate(to);
  };

  return createFalconElement('a', { href: to, onclick: handleClick }, children);
}
