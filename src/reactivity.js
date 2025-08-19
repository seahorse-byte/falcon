const effectStack = [];

// Helper to get the currently running effect from the top of the stack.
const getCurrentObserver = () => effectStack[effectStack.length - 1] || null;

export function createSignal(initialValue, options) {
  let value = initialValue;
  const observers = new Set();
  const equals = options?.equals === false ? () => false : Object.is;
  const signalId = `Signal[${initialValue}]`;

  const getValue = () => {
    const currentObserver = getCurrentObserver();
    if (currentObserver) {
      const observerName =
        currentObserver.name ||
        'effect' + Math.random().toString(36).substring(7);
      console.log(
        `%c${signalId}: Adding observer: ${observerName}`,
        'color: teal;',
      );
      observers.add(currentObserver);
      // Let the observer know about this signal, so it can clean up the subscription later.
      currentObserver.dependencies.add(observers);
    }
    return value;
  };

  const setValue = newValue => {
    if (!equals(value, newValue)) {
      const oldValue = value;
      value = newValue;
      console.log(
        `%c${signalId}: Value set from ${oldValue} to ${value}. Notifying ${observers.size} observers.`,
        'color: red; font-weight: bold;',
      );

      // Notify a static copy of the observers to avoid issues with modification during iteration.
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
      );
    }
  };

  return [getValue, setValue];
}

export function createMemo(fn) {
  console.log('createMemo: Initializing memo for function:', fn.toString());
  let memoizedValue;
  let isInitialized = false;
  const [trackMemo, triggerMemo] = createSignal(undefined, { equals: false });

  createEffect(() => {
    console.log('%ccreateMemo: Internal effect (B) START', 'color: blue;');
    const newValue = fn();
    console.log('%c  Calculated newValue:', 'color: blue;', newValue);
    if (!isInitialized || !Object.is(memoizedValue, newValue)) {
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
      triggerMemo();
    } else {
      console.log('%c  Value NOT changed.', 'color: blue;');
    }
    console.log('%ccreateMemo: Internal effect (B) END', 'color: blue;');
  });

  return () => {
    console.log('%ccreateMemo: Getter (C) called.', 'color: green;');
    const currentObserver = getCurrentObserver();
    const observerName = currentObserver
      ? currentObserver.name ||
        'effect' + Math.random().toString(36).substring(7)
      : 'none';
    console.log('%c  Current observer:', 'color: green;', observerName);
    trackMemo();
    if (!isInitialized) {
      // Synchronous compute for the first run if needed, though the effect handles it.
    }
    console.log('%c  Returning memoizedValue:', 'color: green;', memoizedValue);
    return memoizedValue;
  };
}

/**
 * Runs all cleanup logic for a given effect.
 * @param {Function} effect The effect function to clean up.
 */
function runCleanup(effect) {
  // Run all cleanup functions registered via onCleanup
  for (const cleanupFn of effect.cleanups) {
    try {
      cleanupFn();
    } catch (err) {
      console.error('Error during onCleanup function:', err);
    }
  }
  // Clear the cleanup array.
  effect.cleanups.length = 0;

  // Remove this effect from all signals it subscribed to.
  for (const dependency of effect.dependencies) {
    dependency.delete(effect);
  }
  effect.dependencies.clear();
}

export function createEffect(callback) {
  const execute = () => {
    // 1. Run cleanup for any previous execution of this effect.
    runCleanup(execute);

    // 2. Set this effect as the current observer.
    effectStack.push(execute);

    try {
      // 3. Run the user's callback.
      console.log('Effect Execute: Running user callback');
      callback();
    } catch (err) {
      console.error('Error during effect execution:', err);
    } finally {
      // 4. Restore the previous observer.
      effectStack.pop();
      console.log('Effect Execute: Finished, removed from stack.');
    }
  };

  // Attach properties directly to the effect function
  execute.dependencies = new Set();
  execute.cleanups = [];

  // --- THE FIX ---
  // Schedule the FIRST execution asynchronously. This gives the DOM time to update
  // before the effect runs, which is crucial for components like <Show>.
  // Subsequent runs triggered by signals are synchronous.
  console.log('createEffect: Scheduling initial execution with queueMicrotask');
  queueMicrotask(execute);
}
/**
 * Registers a cleanup function to run when the current reactive scope is destroyed.
 * @param {Function} fn The cleanup function.
 */
export function onCleanup(fn) {
  const currentObserver = getCurrentObserver();
  if (currentObserver) {
    // Add the function to the current effect's cleanup list.
    currentObserver.cleanups.push(fn);
  } else {
    console.warn(
      'onCleanup was called outside of a reactive effect scope and will be ignored.',
    );
  }
}
