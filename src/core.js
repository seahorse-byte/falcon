// src/core.js
import { createEffect } from "./reactivity.js"; // Keep this import

/**
 * Creates an HTML element for the Falcon framework with reactive capabilities.
 * @param {string} tag - The HTML tag name (e.g., 'div', 'h1', 'p'). // ex. button, div, span, etc. see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
 * @param {object | null} props - An object containing attributes/properties. Values can be static or functions (for reactivity).
 * @param {...(Node | string | Function)} children - Children can be nodes, strings, or functions (for reactive text).
 * @returns {HTMLElement} The created HTML element.
 */
export function createFalconElement(tag, props, ...children) {
  // Renamed function
  // 1. Create the DOM element
  const element = document.createElement(tag);

  // 2. Apply properties/attributes (with reactivity)
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith("on") && typeof value === "function") {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (typeof value === "function") {
        createEffect(() => {
          // Basic attribute setting for now:
          element.setAttribute(key, value());
        });
      } else {
        element.setAttribute(key, value);
      }
    }
  }

  // 3. Append children (with reactivity)
  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(child.toString()));
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else if (typeof child === "function") {
      const textNode = document.createTextNode("");
      element.appendChild(textNode);
      createEffect(() => {
        textNode.textContent = child();
      });
    }
  }

  return element;
}

/**
 * Renders a given element into a container DOM node for the Falcon framework.
 * @param {HTMLElement} element - The element to render (e.g., result of createFalconElement).
 * @param {HTMLElement} container - The DOM node to render into.
 */
export function render(element, container) {
  // Should we rename this too? e.g., renderFalconApp? Let's keep it simple for now.
  container.innerHTML = "";
  container.appendChild(element);
}
