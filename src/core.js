// src/core.js
import { createEffect, createMemo } from './reactivity.js';

/**
 * Creates an HTML element for the Falcon framework with reactive capabilities.
 * @param {string} tag - The HTML tag name (e.g., 'div', 'h1', 'p').
 * @param {object | null} props - An object containing attributes/properties. Values can be static or functions (for reactivity).
 * @param {...(Node | string | Function | Comment)} children - Children can be nodes, strings, functions, or the result of helpers like Show().
 * @returns {HTMLElement} The created HTML element.
 */
export function createFalconElement(tag, props, ...children) {
  const element = document.createElement(tag);

  // Apply properties/attributes (with reactivity)
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        // Event listeners
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (typeof value === 'function' && !key.startsWith('on')) {
        // Reactive attributes (but not event listeners)
        createEffect(() => {
          const result = value();
          // Handle boolean attributes correctly
          if (typeof result === 'boolean') {
            if (result) {
              element.setAttribute(key, ''); // Set boolean attribute present
            } else {
              element.removeAttribute(key); // Remove boolean attribute
            }
          } else {
            element.setAttribute(key, result);
          }
        });
      } else {
        // Static attributes
        element.setAttribute(key, value);
      }
    }
  }

  // Append children (with reactivity)
  for (const child of children) {
    appendChild(element, child);
  }

  return element;
}

/**
 * Helper function to append various child types to a parent element.
 * Handles Nodes, strings, numbers, functions (reactive text), and arrays.
 * @param {Node} parent The parent node to append to.
 * @param {*} child The child to append.
 */
function appendChild(parent, child) {
  if (child === null || child === undefined || typeof child === 'boolean') {
    // Ignore null, undefined, boolean children (common in conditional logic)
    return;
  } else if (Array.isArray(child)) {
    // If child is an array, append each item recursively
    child.forEach(innerChild => appendChild(parent, innerChild));
  } else if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child.toString()));
  } else if (child instanceof Node) {
    // Includes regular HTMLElements, TextNodes, CommentNodes, DocumentFragments
    parent.appendChild(child);
  } // Inside appendChild helper function (or createFalconElement if logic is there)
  else if (typeof child === 'function') {
    const textNode = document.createTextNode('');
    parent.appendChild(textNode);
    const effectFnName = child.name || 'anonymousFn'; // Get function name if possible
    console.log(
      `%ccore.js: Setting up effect (D) for reactive text node (${effectFnName})`,
      'color: purple;',
    ); // Log effect setup
    createEffect(() => {
      // Effect D
      const value = child();
      console.log(
        `%ccore.js: Reactive text effect (D) for ${effectFnName} running. Got value:`,
        'color: purple;',
        value,
      ); // Log effect run and value
      textNode.textContent = String(value); // Ensure string conversion
    });
  } else {
    console.warn('Attempted to append unsupported child type:', child);
  }
}

/**
 * Renders a given element into a container DOM node for the Falcon framework.
 * @param {Function | HTMLElement} rootContent - The root element or a function returning it.
 * @param {HTMLElement} container - The DOM node to render into.
 */
export function render(rootContent, container) {
  container.innerHTML = ''; // Clear previous content
  const elementToRender =
    typeof rootContent === 'function' ? rootContent() : rootContent;
  if (elementToRender instanceof Node) {
    appendChild(container, elementToRender); // Use appendChild helper
  } else {
    console.error(
      'Root content must be an HTMLElement or a function returning one.',
    );
  }
}

/**
 * Conditionally renders children or a fallback based on a reactive condition.
 * @param {object} props - Properties object.
 * @param {Function} props.when - A function (signal getter or memo) returning a boolean condition.
 * @param {*} [props.fallback] - Content to render when the condition is false. Can be Node, string, number, array, or function returning one.
 * @param {...*} children - Content to render when the condition is true. Can be Nodes, strings, numbers, arrays, or functions returning them. Captured as an array.
 * @returns {Comment} A comment node acting as an anchor for the conditional content.
 */
export function Show(props, ...children) {
  const { when, fallback } = props;

  // Use a comment node as an anchor/marker in the DOM
  const marker = document.createComment('falcon-show');
  // Use an array to track the list of currently rendered nodes for proper cleanup
  let currentContentNodes = [];

  // Memoize the condition for efficiency. Ensures the effect only runs
  // when the boolean result of the condition actually changes.
  const condition = createMemo(() => !!when()); // Ensure boolean conversion

  console.log('Show component initialized (outside effect)');

  // This effect handles the DOM changes based on the condition
  createEffect(() => {
    const showContent = condition(); // Get the boolean value from the memo
    const parent = marker.parentNode;

    console.log(
      `%cShow Effect RUNNING. Condition is: ${showContent}`,
      'font-weight: bold;',
    ); // Log effect run state

    if (!parent) {
      // This can happen if the Show component itself is rendered conditionally
      // and the marker isn't yet attached to the DOM when the effect first runs.
      console.warn(
        `   Show effect: Parent node for marker not found! Deferring render.`,
      );
      return; // Skip execution until the marker is attached
    }
    console.log(`   Parent found: ${parent.tagName}`);
    console.log(
      '   Current tracked nodes (before cleanup):',
      currentContentNodes,
    );

    // --- 1. Cleanup Phase ---
    // Remove previously rendered nodes before inserting new ones
    if (Array.isArray(currentContentNodes) && currentContentNodes.length > 0) {
      console.log('   Attempting cleanup of old nodes...');
      currentContentNodes.forEach(node => {
        if (node.parentNode === parent) {
          // Check if node still exists and has the expected parent
          try {
            parent.removeChild(node);
            console.log('      Removed node:', node);
          } catch (e) {
            console.error('      Error removing node during cleanup:', node, e);
          }
        } else {
          console.log(
            '      Node not found under parent for removal (already removed or changed?):',
            node,
          );
        }
      });
    } else {
      console.log('   No previous nodes to cleanup.');
    }
    currentContentNodes = []; // Reset tracker *before* rendering new content

    // --- 2. Rendering Phase ---
    // Select the content based on the condition
    const contentToRender = showContent ? children : fallback;

    // Use a DocumentFragment for efficient batch insertion
    const fragment = document.createDocumentFragment();

    // Helper function to recursively process and append content parts
    function renderContentPart(part) {
      console.log('    renderContentPart: Received part:', part, typeof part); // Log input
      if (typeof part === 'function') {
        console.log('    renderContentPart: Calling function...');
        renderContentPart(part()); // Execute functions to get the actual content
      } else if (Array.isArray(part)) {
        console.log('    renderContentPart: Processing array:', part); // Log array processing
        part.forEach(renderContentPart); // Process each item in the array
      } else if (part instanceof Node) {
        console.log('    renderContentPart: Part is Node. Appending:', part); // Log appending node attempt
        try {
          fragment.appendChild(part); // Append the node to the fragment
          console.log(
            '      renderContentPart: Node appended successfully to fragment.',
          ); // Log success
        } catch (e) {
          console.error(
            '      renderContentPart: ERROR appending node to fragment:',
            e,
            'Node:',
            part,
          ); // Log error
        }
      } else if (
        part !== null &&
        part !== undefined &&
        typeof part !== 'boolean'
      ) {
        // Handle primitives (strings, numbers) by creating text nodes
        console.log(
          '    renderContentPart: Part is primitive. Appending as text:',
          part,
        ); // Log appending primitive attempt
        try {
          fragment.appendChild(document.createTextNode(String(part)));
          console.log(
            '      renderContentPart: Primitive appended successfully to fragment.',
          ); // Log success
        } catch (e) {
          console.error(
            '      renderContentPart: ERROR appending primitive to fragment:',
            e,
            'Primitive:',
            part,
          );
        }
      } else {
        console.log(
          '    renderContentPart: Ignoring part (null, undefined, boolean):',
          part,
        ); // Log ignored part
      }
    }

    // Process the selected content (children array or fallback item)
    console.log('--- Before calling renderContentPart ---');
    renderContentPart(contentToRender);
    console.log('--- After calling renderContentPart ---');
    console.log('    Fragment child count:', fragment.childNodes.length); // Check fragment state
    console.log('    Fragment children:', fragment.childNodes); // See the actual nodes in the fragment

    // --- 3. Insertion Phase ---
    // Keep track of the nodes actually added to the fragment
    const insertedNodes = Array.from(fragment.childNodes);
    console.log('   Nodes to insert:', insertedNodes); // Log the nodes about to be inserted

    try {
      console.log('   Attempting parent.insertBefore...'); // Log before attempt
      parent.insertBefore(fragment, marker.nextSibling); // Insert the fragment content into the DOM
      console.log('   Nodes inserted after marker.'); // Log success

      // Update tracker only on successful insertion
      currentContentNodes = insertedNodes; // Track the newly inserted nodes for the next cleanup cycle
      console.log('   Updated tracked content:', currentContentNodes); // Log the updated tracker
    } catch (error) {
      // Log any error during the DOM insertion
      console.error('!!! ERROR during parent.insertBefore:', error);
      console.error('    Parent:', parent);
      console.error('    Fragment:', fragment); // Log the fragment state on error
      console.error('    Marker:', marker);
      console.error("    Marker's nextSibling:", marker.nextSibling);
      // Ensure tracker is clean after failure
      currentContentNodes = [];
    }
    console.log(
      `%cShow Effect END. Condition was: ${showContent}`,
      'font-weight: bold;',
    ); // Log effect end
  }); // End of createEffect

  // The Show component itself only returns the marker node to the main rendering flow
  return marker;
}

// Helper to ensure we're always working with a DOM Node
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
  let renderedNodes = [];

  createEffect(() => {
    const newItems = props.each(); // Get latest array from signal
    const parent = startMarker.parentNode;
    if (!Array.isArray(newItems) || !parent) return;

    console.log(
      `%cFor Effect: Syncing list with ${newItems.length} items.`,
      'color: orange;',
    );

    // Simple Index-Based Reconciliation
    for (let i = 0; i < newItems.length; i++) {
      const newItem = newItems[i];
      const oldNode = renderedNodes[i];

      if (!oldNode) {
        // Add new nodes
        const newNode = normalizeNode(mapFn(newItem, i));
        parent.insertBefore(newNode, endMarker);
        renderedNodes.push(newNode);
      } else if (oldNode._falcon_item_ !== newItem) {
        // Replace existing nodes if data is different
        const newNode = normalizeNode(mapFn(newItem, i));
        parent.replaceChild(newNode, oldNode);
        renderedNodes[i] = newNode;
      }
      // Tag the node with its data item for the next check
      renderedNodes[i]._falcon_item_ = newItem;
    }

    // Remove extra nodes from the end
    if (renderedNodes.length > newItems.length) {
      for (let i = newItems.length; i < renderedNodes.length; i++) {
        parent.removeChild(renderedNodes[i]);
      }
      renderedNodes.length = newItems.length;
    }
  });

  const fragment = document.createDocumentFragment();
  fragment.appendChild(startMarker);
  fragment.appendChild(endMarker);
  return fragment;
}
