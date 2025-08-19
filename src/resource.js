import { createSignal, createEffect } from './reactivity.js';

/**
 * A reactive primitive designed for handling asynchronous data fetching.
 * It wraps an async function and provides reactive signals for the data,
 * loading state, and any potential errors.
 *
 * @param {Function} fetcher An async function that returns a promise.
 * @returns {Function} A main getter function for the data. This function also
 * has `.loading` and `.error` properties, which are reactive getters for those states.
 */
export function createResource(fetcher) {
  const [data, setData] = createSignal(undefined);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      console.error('[createResource] Fetching failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Wrap the fetch call in an effect. This makes the resource "re-fetch"
  // automatically if the fetcher function depends on other signals.
  createEffect(fetchData);

  // The main getter for the data.
  const resourceGetter = () => data();

  // Attach the loading and error state getters to the main getter.
  resourceGetter.loading = () => loading();
  resourceGetter.error = () => error();

  return resourceGetter;
}
