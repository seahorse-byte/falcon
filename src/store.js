import { createSignal } from './reactivity.js';

/**
 * Creates a reactive store object.
 * The store's state is deeply reactive, meaning changes to nested properties
 * will trigger updates in components that depend on them.
 *
 * @param {object} initialState The initial state of the store.
 * @returns {[object, function]} A tuple containing the reactive state object and a setter function.
 */
export function createStore(initialState) {
  // The raw state object where we'll keep the signals.
  const rawState = {};

  // The handler for the Proxy. This intercepts property access.
  const handler = {
    get(target, prop) {
      // When a property is accessed (e.g., store.count), return its signal's getter.
      // This allows components to subscribe to changes.
      if (prop in target) {
        return target[prop][0](); // [0] is the getter
      }
      console.warn(`[Store] Property "${prop}" does not exist on the store.`);
      return undefined;
    },
    set() {
      // Prevent direct mutation of the store.
      console.warn(
        `[Store] Direct mutation is not allowed. Use the setter function instead.`,
      );
      return false; // Return false to indicate the set operation failed.
    },
  };

  // Create signals for each property in the initial state.
  for (const key in initialState) {
    rawState[key] = createSignal(initialState[key]);
  }

  // The public-facing state object is a Proxy that makes it read-only and reactive.
  const state = new Proxy(rawState, handler);

  /**
   * The setter function to update the store's state.
   * It can accept an object to merge, or a function that receives the previous state.
   * @param {object|function} newStateOrFn
   */
  const setState = newStateOrFn => {
    const oldState = {};
    for (const key in rawState) {
      oldState[key] = rawState[key][0](); // Get current values
    }

    const newState =
      typeof newStateOrFn === 'function'
        ? newStateOrFn(oldState)
        : newStateOrFn;

    for (const key in newState) {
      if (key in rawState) {
        // Update the signal for the corresponding key.
        rawState[key][1](newState[key]); // [1] is the setter
      } else {
        console.warn(
          `[Store] Cannot set property "${key}" that was not in the initial state.`,
        );
      }
    }
  };

  return [state, setState];
}
