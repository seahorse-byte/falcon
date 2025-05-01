// Global variable to track the currently running effect
let currentObserver = null;

export function createSignal(initialValue, options) {
  // Accept options
  let value = initialValue;
  const observers = new Set();
  // --- Add/Restore this line ---
  // If options.equals is explicitly false, use a function that always returns false.
  // Otherwise, use Object.is for comparison.
  const equals = options?.equals === false ? () => false : Object.is;
  // --- End Add/Restore ---

  const signalId = `Signal[${initialValue}]`; // Basic identifier (keep logs)

  const getValue = () => {
    if (currentObserver) {
      const observerName =
        currentObserver.name ||
        'effect' + Math.random().toString(36).substring(7);
      console.log(
        `%c${signalId}: Adding observer: ${observerName}`,
        'color: teal;',
      );
      observers.add(currentObserver);
    }
    return value;
  };

  const setValue = newValue => {
    // --- Modify this line ---
    if (!equals(value, newValue)) {
      // Use the equals function we defined above
      // --- End Modify ---
      const oldValue = value;
      value = newValue;
      console.log(
        `%c${signalId}: Value set from ${oldValue} to ${value}. Notifying ${observers.size} observers.`,
        'color: red; font-weight: bold;',
      );
      const observersToNotify = new Set(observers);
      observersToNotify.forEach(observer => {
        const observerName =
          observer.name || 'effect' + Math.random().toString(36).substring(7);
        console.log(
          `%c${signalId}: Notifying observer: ${observerName}`,
          'color: red;',
        );
        if (typeof observer === 'function') {
          observer();
        } else {
          console.warn(
            `${signalId}: Attempted to notify non-function observer:`,
            observer,
          );
          observers.delete(observer);
        }
      });
    } else {
      console.log(
        `%c${signalId}: Skipping update from ${value} to ${newValue} due to equals check.`,
        'color: gray;',
      ); // Log skips
    }
  };

  return [getValue, setValue];
}

/**
 * Creates a memoized computation based on signals read within the function.
 * @param {Function} fn The function to memoize.
 * @returns {Function} A getter function for the memoized value.
 */
export function createMemo(fn) {
  // ... other memo code from previous steps...
  console.log('createMemo: Initializing memo for function:', fn.toString());
  let memoizedValue;
  let isInitialized = false;
  // This line is key: passes the option to disable equality check for the trigger signal
  const [trackMemo, triggerMemo] = createSignal(undefined, { equals: false });

  createEffect(() => {
    // Effect B
    console.log('%ccreateMemo: Internal effect (B) START', 'color: blue;');
    const newValue = fn();
    console.log('%c  Calculated newValue:', 'color: blue;', newValue);
    if (!isInitialized || !Object.is(memoizedValue, newValue)) {
      // Check actual value change
      console.log(
        '%c  Value changed! Old:',
        'color: blue;',
        memoizedValue,
        'New:',
        newValue,
      );
      memoizedValue = newValue;
      isInitialized = true;
      console.log('%c  Calling triggerMemo()', 'color: blue;');
      triggerMemo(); // This will now call setValue on Signal[undefined] which uses equals = () => false
    } else {
      console.log('%c  Value NOT changed.', 'color: blue;');
    }
    console.log('%ccreateMemo: Internal effect (B) END', 'color: blue;');
  });

  // The getter function returned to the user
  return () => {
    // Getter C
    console.log('%ccreateMemo: Getter (C) called.', 'color: green;');
    const observerName = currentObserver
      ? currentObserver.name ||
        'effect' + Math.random().toString(36).substring(7)
      : 'none';
    console.log('%c  Current observer:', 'color: green;', observerName);
    trackMemo(); // This subscribes the caller (Effect D) to Signal[undefined]
    if (!isInitialized) {
      // ... synchronous compute logic ...
    }
    console.log('%c  Returning memoizedValue:', 'color: green;', memoizedValue);
    return memoizedValue;
  };
}

/**
 * Creates an effect that re-runs when its dependencies change.
 * The callback can optionally return a cleanup function.
 * Initial execution is deferred using queueMicrotask.
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
      console.log('Effect Execute: Running user callback'); // <-- Add log here
      cleanup = callback(); // Store the returned value
    } catch (err) {
      console.error('Error during effect execution:', err);
      cleanup = undefined; // Ensure faulty cleanup isn't stored
    } finally {
      console.log('Effect Execute: Clearing currentObserver'); // <-- Add log here
      currentObserver = null;
    }
  };

  // --- MODIFICATION ---
  // Schedule the FIRST execution asynchronously using queueMicrotask
  // Subsequent executions triggered by signals will run normally based on setValue notifications.
  console.log('createEffect: Scheduling initial execution'); // <-- Add log here
  queueMicrotask(execute);
  // --- END MODIFICATION ---

  // We are not returning a manual dispose function for now.
}
