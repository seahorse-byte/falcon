import { describe, it, expect, vi } from 'vitest';
import { createSignal, createEffect, createMemo } from './reactivity.js';

// Helper function to wait for the next microtask queue turn.
const tick = () => new Promise(resolve => queueMicrotask(resolve));

describe('Reactivity System', () => {
  it('createSignal should set and get a value', () => {
    const [count, setCount] = createSignal(0);
    expect(count()).toBe(0);
    setCount(5);
    expect(count()).toBe(5);
  });

  // --- THE FIX IS HERE ---
  // The test function is now `async`.
  it('createEffect should run when a dependency changes', async () => {
    const [count, setCount] = createSignal(0);

    const effectFn = vi.fn(() => {
      count();
    });

    createEffect(effectFn);

    // The effect runs asynchronously, so we wait for it.
    await tick();
    expect(effectFn).toHaveBeenCalledTimes(1);

    // Update the signal.
    setCount(10);

    // Signal updates are synchronous, so the effect runs immediately.
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  // --- THE FIX IS HERE ---
  // The test function is now `async`.
  it('createMemo should only recompute when its dependencies change', async () => {
    const [count, setCount] = createSignal(0);

    const computationFn = vi.fn(() => count() * 2);
    const doubleCount = createMemo(computationFn);

    // The internal effect of createMemo is also async.
    await tick();
    expect(computationFn).toHaveBeenCalledTimes(1);

    // Accessing the memo should return the computed value.
    expect(doubleCount()).toBe(0);
    // Accessing it again should not recompute.
    expect(doubleCount()).toBe(0);
    expect(computationFn).toHaveBeenCalledTimes(1);

    // Update the dependency.
    setCount(5);

    // The internal effect re-runs.
    await tick();
    expect(computationFn).toHaveBeenCalledTimes(2);
    expect(doubleCount()).toBe(10);
  });
});
