FalconJS API Reference: Reactivity
This document provides a detailed reference for the core reactive primitives in FalconJS.

createSignal(initialValue)
Creates a reactive container for a piece of state. It's the foundation of reactivity in FalconJS.

Signature
createSignal&lt;T&gt;(initialValue: T): [get: () => T, set: (newValue: T) => void]

Returns
An array containing two functions:

get: A getter function that returns the current value of the signal. Accessing this function within an effect or memo will create a subscription.

set: A setter function that updates the signal's value and notifies all subscribers.

Example
import { createSignal, createEffect } from '@olsigjeci/falconjs';

const [count, setCount] = createSignal(0);

createEffect(() => {
// This effect runs whenever the count changes.
console.log(`The count is now: ${count()}`);
});

// Later, in an event handler...
setCount(count() + 1); // This will trigger the effect to log the new value.

createEffect(fn)
Creates a reactive computation that automatically re-runs whenever its dependencies (signals) change. It's used for creating side effects, like manually updating the DOM or logging to the console.

Signature
createEffect(fn: () => void): void

Parameters
fn: A function to be executed. Any signals accessed inside this function will be registered as dependencies.

Example
const [name, setName] = createSignal('Falcon');

createEffect(() => {
document.title = `Hello, ${name()}`;
});

// This will automatically update the document title to "Hello, World"
setName('World');

createMemo(fn)
Creates a memoized, read-only signal. The memo's computation function re-runs only when its specific dependencies change, making it highly efficient for deriving state.

Signature
createMemo&lt;T&gt;(fn: () => T): get: () => T

Parameters
fn: A function that computes the memo's value. Any signals accessed inside will be registered as dependencies.

Returns
A getter function that returns the current memoized value.

Example
const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Doe');

// This memo will only re-calculate if firstName() or lastName() changes.
const fullName = createMemo(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

setFirstName('Jane');
console.log(fullName()); // "Jane Doe"
