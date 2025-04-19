/**
 * Creates an HTML element.
 * @param {string} tag - The HTML tag name (e.g., 'div', 'h1', 'p').
 * @param {object | null} props - An object containing attributes/properties (e.g., { id: 'my-id', class: 'container' }).
 * @param {...(Node | string)} children - The children of the element (other elements or strings).
 * @returns {HTMLElement} The created HTML element.
 */
export function createFalconElement(tag, props, ...children) {
  // 1. Create the DOM element // ex. button, div, span, etc. see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  const element = document.createElement(tag);

  // 2. Apply properties/attributes
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      // Simple attribute setting for now
      // We need to handle events, style, className vs class etc. later
      if (key.startsWith("on") && typeof value === "function") {
        // Basic event handling
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  // 3. Append children
  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") {
      // If child is string or number, create a text node
      element.appendChild(document.createTextNode(child.toString()));
    } else if (child instanceof Node) {
      // If child is already a DOM Node, append it directly
      element.appendChild(child);
    }
    // We might want to handle null/undefined children, or arrays of children later
  }

  // 4. Return the created element
  return element;
}

// We might add a render function later to mount the element to the DOM
// export function render(element, container) { ... }
