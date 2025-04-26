// Global variable to track the currently running effect
let currentObserver = null;

/**
 * Creates a reactive signal.
 * @param {*} initialValue The initial value of the signal.
 * @returns {[Function, Function]} A tuple [getValue, setValue].
 */
export function createSignal(initialValue) {
  let value = initialValue;
  // Set to store observers (effects) that depend on this signal
  const observers = new Set();

  // Getter function
  const getValue = () => {
    // If there's an observer running, subscribe it to this signal
    if (currentObserver) {
      observers.add(currentObserver);
    }
    return value;
  };

  // Setter function
  const setValue = (newValue) => {
    if (value !== newValue) {
      // Only update and notify if value changed
      value = newValue;
      // Notify all observers
      // Create a copy before iterating to handle potential nested updates
      const observersToNotify = new Set(observers);
      observersToNotify.forEach((observer) => observer());
    }
  };

  return [getValue, setValue];
}

/**
 * Creates an effect that re-runs when its dependencies change.
 * @param {Function} callback The function to run as an effect.
 */
export function createEffect(callback) {
  const execute = () => {
    // Set the current observer to this effect's execution function
    currentObserver = execute;
    try {
      callback(); // Run the user's callback function
    } finally {
      // Clean up the current observer after execution
      currentObserver = null;
    }
  };

  // Store dependencies for this effect (needed for cleanup later, advanced)
  // For now, we mainly rely on the signal storing the observer.
  // execute.dependencies = new Set(); // Future enhancement

  // Run the effect immediately the first time
  execute();
}

// --- We might need more later (e.g., createMemo, cleanup logic) ---

export function createMemo(fn) {
  const [signal, setSignal] = createSignal();
  createEffect(() => setSignal(fn()));
  return signal;
}
