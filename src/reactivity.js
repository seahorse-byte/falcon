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
      // NEW: Add cleanup dependency tracking (Advanced - for later optimization if needed)
      // currentObserver.dependencies.add(observers); // We might need this later if we implement manual dispose()
    }
    return value;
  };

  // Setter function
  const setValue = newValue => {
    // Use Object.is for comparison (handles NaN and -0/+0 correctly)
    if (!Object.is(value, newValue)) {
      value = newValue;
      // Notify all observers
      // Create a copy before iterating to handle potential nested updates
      const observersToNotify = new Set(observers);
      observersToNotify.forEach(observer => {
        // Check if the observer function still exists (might be cleaned up)
        if (typeof observer === 'function') {
          observer();
        } else {
          // Optional: Remove dead observers if we implement manual cleanup later
          // observers.delete(observer);
        }
      });
    }
  };

  return [getValue, setValue];
}

/**
 * Creates an effect that re-runs when its dependencies change.
 * The callback can optionally return a cleanup function.
 * @param {Function} callback The function to run as an effect. Should return the cleanup function if needed.
 */
export function createEffect(callback) {
  // Original name
  let cleanup; // Variable to store the cleanup function from the previous run

  const execute = () => {
    // --- Run cleanup function before executing the effect again ---
    if (typeof cleanup === 'function') {
      try {
        cleanup(); // Call the cleanup function from the *previous* execution
      } catch (err) {
        console.error('Error during effect cleanup:', err);
      }
    }
    // --- End Cleanup Logic ---

    currentObserver = execute;
    // execute.dependencies = new Set(); // For potential future cleanup optimization

    try {
      // Run the user's callback and potentially get a new cleanup function
      cleanup = callback(); // Store the returned value
    } catch (err) {
      console.error('Error during effect execution:', err);
      cleanup = undefined; // Ensure faulty cleanup isn't stored
    } finally {
      currentObserver = null;
    }
  };

  // Run the effect immediately the first time
  execute();

  // We are not returning a manual dispose function for now.
}

/**
 * Creates a memoized computation based on signals read within the function.
 * @param {Function} fn The function to memoize.
 * @returns {Function} A getter function for the memoized value.
 */
export function createMemo(fn) {
  // Original name, refined logic
  let memoizedValue;
  let isInitialized = false;
  // Internal signal used ONLY to trigger effects that depend on this memo
  const [trackMemo, triggerMemo] = createSignal(undefined, { equals: false });

  createEffect(() => {
    // This effect recalculates the value when fn's dependencies change
    const newValue = fn();
    if (!isInitialized || !Object.is(memoizedValue, newValue)) {
      memoizedValue = newValue;
      isInitialized = true;
      // Notify downstream effects that *this memo's value* has changed
      triggerMemo();
    }
  });

  // The getter function returned to the user
  return () => {
    // When this getter is called within an effect,
    // it registers a dependency on `trackMemo`
    trackMemo();
    // Note: isInitialized check might still be needed if used outside effects,
    // or if scheduling allows reading before the initial effect runs.
    // For simplicity, we assume the effect runs at least once before read.
    if (!isInitialized) {
      // This can happen if the memo is read outside of an effect/component
      // before the initial computation. Let's compute synchronously in this edge case.
      // This is a deviation from Solid's lazy evaluation but simpler for now.
      console.warn(
        'Memo read before initial computation; computing synchronously.',
      );
      try {
        memoizedValue = fn();
        isInitialized = true;
      } catch (err) {
        console.error('Error computing memo synchronously:', err);
        // What should we return? Undefined? Throw?
        return undefined;
      }
    }
    return memoizedValue;
  };
}
