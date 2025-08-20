// This file is the main entry point for the FalconJS library.
// It exports all the public APIs from the different modules.

// Core rendering functions
export { createFalconElement, render, Show, For } from './core.js';

// Reactivity primitives
export {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
} from './reactivity.js';

// Asynchronous resource handling
export { createResource } from './resource.js';

// Client-side routing
export { Route, Link, navigate } from './router.js';

// Global state management
export { createStore } from './store.js';
