# FalconJS API Reference: State Management

This document provides a reference for the global state management utilities in FalconJS.

createStore(initialState)
Creates a reactive, centralized store for state that needs to be shared across multiple components. The returned state object is a read-only proxy; it must be updated using the provided setter function.

Signature

```jsx
createStore&lt;T&gt;(initialState: T): [state: T, setState: (newState: Partial&lt;T&gt; | ((prevState: T) => Partial&lt;T&gt;)) => void]
```

Returns
An array containing two items:

state: A read-only proxy object representing the current state. Accessing its properties within components or effects will create a subscription.

setState: A function to update the store's state. You can pass a new state object to merge or a function that receives the previous state and returns the new state.

Example

```jsx
import { createStore } from '@olsigjeci/falconjs';

// Create a store accessible throughout your app
const [store, setStore] = createStore({
  count: 0,
  user: { name: 'Guest' }
});

function CounterDisplay() {
  // Accessing store.count creates a subscription
  return &lt;p&gt;Count: {() => store.count}&lt;/p&gt;;
}

function IncrementButton() {
  const increment = () => {
    // Update the store using the functional form
    setStore(prevState => ({ count: prevState.count + 1 }));
  };

  return &lt;button onClick={increment}&gt;Increment&lt;/button&gt;;
}
```
