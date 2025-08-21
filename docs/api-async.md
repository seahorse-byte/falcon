# FalconJS API Reference: Async

This document provides a reference for the reactive primitives used to handle asynchronous operations in FalconJS.

```jsx
createResource(fetcher);
// Creates a reactive wrapper around an asynchronous function (like a data fetch). It provides signals to track the loading, error, and data states of the operation.
```

Signature

```jsx
createResource<T>(fetcher: () => Promise<T>): [() => T, { loading: () => boolean, error: () => Error | null }]
```

Parameters
fetcher: An asynchronous function that returns a promise. If this function depends on other signals, the resource will automatically re-fetch when those signals change.

Returns
A reactive getter function for the data. This function also has two properties attached to it:

.loading: A boolean signal getter that is true while the fetcher is in progress.

.error: A signal getter that holds an Error object if the promise rejects, otherwise it's null.

Example

```jsx
import { createResource, createSignal, Show } from '@olsigjeci/falconjs';

const [userId, setUserId] = createSignal(1);

// This resource will re-fetch whenever userId() changes.
const userData = createResource(async () => {
  const response = await fetch(`https://api.example.com/users/${userId()}`);
  return response.json();
});

return (
  <div>
    <button onClick={() => setUserId(2)}>Fetch Next User</button>

    <Show when={userData.loading}>
      <p>Loading...</p>
    </Show>

    <Show when={userData.error}>
      <p>Error: {() => userData.error().message}</p>
    </Show>

    <Show when={userData()}>{() => <p>Welcome, {userData().name}</p>}</Show>
  </div>
);
```
