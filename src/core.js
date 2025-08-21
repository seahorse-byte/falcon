import { createEffect, createMemo, untrack } from './reactivity.js';

function appendChild(parent, child) {
  if (Array.isArray(child)) {
    child.forEach(nestedChild => appendChild(parent, nestedChild));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child));
  } else if (typeof child === 'function') {
    // --- THIS IS THE FIX ---
    // If a function is passed (like a signal getter), create a reactive text node.
    const textNode = document.createTextNode('');
    createEffect(() => {
      textNode.textContent = child();
    });
    parent.appendChild(textNode);
  } else if (child == null || typeof child === 'boolean') {
    // Intentionally do nothing for null, undefined, or booleans.
  } else {
    console.warn('An unknown child type was passed to appendChild:', child);
  }
}

/**
 * Creates an HTML element for the Falcon framework with reactive capabilities.
 * @param {string} tag - The HTML tag name (e.g., 'div', 'h1', 'p').
 * @param {object | null} props - An object containing attributes/properties. Values can be static or functions (for reactivity).
 * @param {...(Node | string | Function | Comment)} children - Children can be nodes, strings, functions, or the result of helpers like Show().
 * @returns {HTMLElement} The created HTML element.
 */
export function createFalconElement(tag, props, ...children) {
  if (typeof tag === 'function') {
    return tag({ ...props, children });
  }

  const element = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (typeof value === 'function' && !key.startsWith('on')) {
        createEffect(() => {
          const result = value();
          if (
            typeof result === 'boolean' &&
            ['checked', 'disabled', 'selected'].includes(key)
          ) {
            if (result) {
              element.setAttribute(key, '');
            } else {
              element.removeAttribute(key);
            }
          } else {
            element.setAttribute(key, result);
          }
        });
      } else if (key !== 'children') {
        element.setAttribute(key, value);
      }
    }
  }

  appendChild(element, children);
  return element;
}

/**
 * Renders content into a container element.
 * It now handles both component functions and pre-rendered JSX elements.
 * @param {Function|Node} content The component function or JSX element to render.
 * @param {HTMLElement} container The DOM element to render into.
 */
export function render(content, container) {
  container.innerHTML = '';
  // If content is a function, it's a component that needs to be called.
  // If it's already a Node (from JSX), we can use it directly.
  const elementToRender = typeof content === 'function' ? content() : content;
  appendChild(container, elementToRender);
}

/**
 * A special component that renders its children without a wrapper element.
 * The JSX transform will use this for the <>...</> syntax.
 */
export function Fragment(props) {
  return props.children;
}

function normalizeNode(content) {
  if (content instanceof Node) return content;
  if (content == null || typeof content === 'boolean') {
    return document.createComment('falcon-empty-content');
  }
  return document.createTextNode(String(content));
}

export function For(props) {
  const mapFn = props.children?.[0];
  if (typeof mapFn !== 'function') {
    console.error('<For> component requires a function as its only child.');
    return normalizeNode(null);
  }

  const startMarker = document.createComment('falcon-for-start');
  const endMarker = document.createComment('falcon-for-end');
  let prevNodesMap = new Map();

  createEffect(() => {
    const newItems = props.each();
    const parent = startMarker.parentNode;
    if (!Array.isArray(newItems) || !parent) return;

    const newNodesMap = new Map();
    const newNodesArray = [];

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      const key = item.id;
      const existingNode = prevNodesMap.get(key);

      if (existingNode) {
        newNodesArray.push(existingNode);
        newNodesMap.set(key, existingNode);
        prevNodesMap.delete(key);
      } else {
        const newNode = normalizeNode(mapFn(item, i));
        newNode._falcon_item_key_ = key;
        newNodesArray.push(newNode);
        newNodesMap.set(key, newNode);
      }
    }

    let currentElement = startMarker.nextSibling;
    for (const newNode of newNodesArray) {
      if (currentElement === newNode) {
        currentElement = currentElement.nextSibling;
      } else {
        parent.insertBefore(newNode, currentElement);
      }
    }

    while (currentElement !== endMarker) {
      const next = currentElement.nextSibling;
      const key = currentElement._falcon_item_key_;
      if (prevNodesMap.has(key)) {
        parent.removeChild(currentElement);
      }
      currentElement = next;
    }

    prevNodesMap = newNodesMap;
  });

  const fragment = document.createDocumentFragment();
  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);
  return fragment;
}

// export function Show(props) {
//   const { when, fallback, children } = props;
//   const marker = document.createComment('falcon-show');
//   let currentContentNodes = [];
//   const condition = createMemo(() => !!when());

//   createEffect(() => {
//     const showContent = condition();
//     const parent = marker.parentNode;
//     if (!parent) return;

//     if (currentContentNodes.length > 0) {
//       currentContentNodes.forEach(node => {
//         if (node.parentNode === parent) parent.removeChild(node);
//       });
//     }
//     currentContentNodes = [];

//     const contentToRender = showContent ? children : fallback;
//     const fragment = document.createDocumentFragment();

//     function renderContentPart(part) {
//       if (Array.isArray(part)) {
//         part.forEach(renderContentPart);
//       } else if (typeof part === 'function') {
//         renderContentPart(part());
//       } else if (part instanceof Node) {
//         fragment.appendChild(part);
//       } else if (part != null && typeof part !== 'boolean') {
//         fragment.appendChild(document.createTextNode(String(part)));
//       }
//     }
//     renderContentPart(contentToRender);

//     const insertedNodes = Array.from(fragment.childNodes);
//     parent.insertBefore(fragment, marker.nextSibling);
//     currentContentNodes = insertedNodes;
//   });

//   return marker;
// }

export function Show(props) {
  const { when, fallback, children } = props;
  const marker = document.createComment('falcon-show');
  let currentContentNodes = [];
  const condition = createMemo(() => !!when());

  createEffect(() => {
    const showContent = condition();
    const parent = marker.parentNode;
    if (!parent) return;

    if (currentContentNodes.length > 0) {
      currentContentNodes.forEach(node => {
        if (node.parentNode === parent) parent.removeChild(node);
      });
    }
    currentContentNodes = [];

    const contentToRender = showContent ? children : fallback;
    const fragment = document.createDocumentFragment();

    function renderContentPart(part) {
      if (Array.isArray(part)) {
        part.forEach(p => renderContentPart(p));
      } else if (typeof part === 'function') {
        renderContentPart(part());
      } else if (part instanceof Node) {
        fragment.appendChild(part);
      } else if (part != null && typeof part !== 'boolean') {
        fragment.appendChild(document.createTextNode(String(part)));
      }
    }

    // We wrap the rendering of children in `untrack` to prevent the <Show>
    // component's effect from subscribing to signals used inside the children.
    untrack(() => {
      renderContentPart(contentToRender);
    });

    const insertedNodes = Array.from(fragment.childNodes);
    parent.insertBefore(fragment, marker.nextSibling);
    currentContentNodes = insertedNodes;
  });

  return marker;
}
