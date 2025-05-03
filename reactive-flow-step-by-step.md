# walk through the lifecycle and data flow of your FalconJs reactive application, based on the components we've built (`createSignal`, `createEffect`, `createMemo`, `createFalconElement`, `Show`, `render`).

We'll break it down into two main phases: **Initialization** (when the app first loads) and **Update** (when reactive state changes).

---

**Phase 1: Initialization (Loading `index.html`)**

1.  **HTML Load:** The browser loads `index.html`. It finds the `<div id="root"></div>` container and the `<script type="module" src="app.js"></script>`.
2.  **Module Execution (`app.js`):** The browser fetches and executes `app.js`.
    * **Imports:** Functions like `createSignal`, `createEffect`, `createMemo`, `createFalconElement`, `render`, `Show` are imported from `reactivity.js` and `core.js`.
    * **State Creation (`createSignal`)**: Calls like `createSignal(0)` execute. For each signal:
        * An internal variable holds the initial value (e.g., `0`).
        * An empty `Set` (`observers`) is created to store dependent effects.
        * `getValue` and `setValue` functions (closures) are created, capturing the internal value and observers set.
        * The `[getValue, setValue]` pair is returned (e.g., `[count, setCount]`).
    * **Memo Creation (`createMemo`)**: Calls like `createMemo(() => count() * 2)` execute. For each memo:
        * An internal signal (`trackMemo`, `triggerMemo`) is created using `createSignal(undefined, { equals: false })`. This special signal ignores value changes and notifies *every time* `triggerMemo` is called.
        * An internal effect (`Effect B`) is created using `createEffect(() => { ... })`. This effect's job is:
            * Run the user's calculation function (`() => count() * 2`). This automatically subscribes `Effect B` to upstream signals (like `count`).
            * Compare the result to the previously stored `memoizedValue`.
            * If the value changed, update `memoizedValue` and call `triggerMemo()`.
        * The *initial* execution of `Effect B` is scheduled asynchronously via `queueMicrotask`.
        * The memo getter function (`() => { trackMemo(); return memoizedValue; }`) is returned (e.g., assigned to `doubleCount`).
    * **Component Definition:** JavaScript functions like `App`, `CounterDisplay`, `ToggleButton`, etc., are defined. These functions typically call `createFalconElement` or helpers like `Show`.
    * **Render Call:** `render(App, rootElement)` is called at the end of `app.js`.

3.  **Initial Render (`render` in `core.js`):**
    * `render` clears the `container` (`#root`).
    * It calls the root component function: `App()`.
    * **Element Creation (`App` -> `createFalconElement` -> `appendChild`):**
        * `App()` executes, calling `createFalconElement('div', ...)` for the main container.
        * `createFalconElement` creates the actual DOM node (`document.createElement('div')`).
        * It iterates through props:
            * Static props (`id`, `style`) are set directly.
            * Event listeners (`onclick`) are attached using `element.addEventListener`.
            * *Reactive* props (like `<input value={inputText}>`): An effect is created (`createEffect(() => element.setAttribute('value', inputText()))`) and its initial run is scheduled via `queueMicrotask`. This effect subscribes to `inputText`.
        * It iterates through children, using the `appendChild` helper:
            * **Static Nodes/Text:** Appended directly (`<h1>`, `<hr>`, strings).
            * **Component Functions (`ToggleButton()`):** The function is called. It returns an element (e.g., `<button>`). This element is appended. If *its* children include reactive parts, effects are scheduled during its creation.
            * **Reactive Functions (`{count}`, `{buttonText}`):** A text node is created and appended as a placeholder. An effect (`createEffect(() => { textNode.textContent = count() })`) is created to update this text node, and its initial run is scheduled via `queueMicrotask`. This effect subscribes to the relevant signal/memo (`count` or `buttonText`).
            * **`Show(...)` Component:** `Show` is called. It creates a `` node, sets up its internal condition `memo`, schedules its main DOM-manipulating effect (`Effect S`) via `queueMicrotask`, and returns the `marker`. The `marker` node is appended.
    * `App()` returns the fully constructed root `div` element (containing static content, placeholders, and markers).
    * `render` appends this root `div` to the `#root` container in the actual DOM.

4.  **Microtask Queue Execution (The Reactive "Ignition"):**
    * The synchronous execution of `app.js` and the initial `render` call completes.
    * The browser processes the microtask queue, running all the effects scheduled via `queueMicrotask` during initialization.
    * **Memo Effects (`Effect B`) Run:** They perform their initial calculation, establish dependencies on upstream signals (e.g., `count`), store the initial memoized value, and call `triggerMemo()` (which notifies 0 observers at this stage).
    * **DOM Effects (`Effect D`, `Effect F`, `Effect G`, `Effect S`) Run:**
        * They execute their callback function.
        * **Dependency Tracking:** Inside the callback, whenever a signal getter (`count()`) or memo getter (`doubleCount()`) is called, the `getValue`/`trackMemo` function sees that `currentObserver` is set (to the currently running effect's `execute` function) and adds the effect to the signal/memo's `observers` set. This establishes the reactive link.
        * **DOM Updates:** They perform their initial DOM manipulation (e.g., setting `textContent`, `setAttribute`, or inserting/removing nodes for `Show`).
    * At the end of this phase, the initial UI is fully rendered, and the reactive graph (which signals/memos trigger which effects) is established.

---

**Phase 2: Update (e.g., User clicks "Increment Count")**

1.  **Event Trigger:** The user clicks the button. The browser invokes the `onclick` handler attached by `createFalconElement`.
2.  **Signal Update (`handleClick` -> `setCount`):** The handler calls `setCount(newValue)`.
3.  **`setValue` Execution (`createSignal` for `count`):**
    * The `setValue` function for the `count` signal runs.
    * It compares the `newValue` with the current `value` using `Object.is`.
    * If the value has changed:
        * It updates the internal `value`.
        * It gets the `observers` Set for this signal (containing effects that depend on `count`, e.g., `Effect B` for `doubleCount`, `Effect B` for `isEven`, `Effect E` for `CounterDisplay` text).
        * It iterates through a *copy* of the `observers` Set.
        * For each `observer` (which is an effect's `execute` function), it **calls `observer()`**. *(Note: FalconJs currently runs effects immediately on notification. More advanced frameworks often schedule/batch these updates.)*

4.  **Effect Execution (Cascade):**
    * The `execute` function for each notified effect runs:
        * **(Cleanup):** The effect first runs any cleanup function returned from its *previous* execution.
        * **(Set Observer):** It sets the global `currentObserver` to itself.
        * **(Re-run Callback):** It executes its main callback function again.
            * **Re-subscribe:** As the callback re-reads signals/memos (`count()`, `doubleCount()`, `isEven()`), it automatically re-subscribes to them (adds itself back to their `observers` via `getValue`/`trackMemo`).
            * **Get New Values:** It retrieves the latest values from signals/memos.
            * **Perform Action:** It performs its action with the new values (e.g., `textNode.textContent = count()`, `element.setAttribute(...)`, complex DOM updates in `Show`).
            * **(Return Cleanup):** It potentially returns a new cleanup function for the *next* run.
        * **(Clear Observer):** The `finally` block ensures `currentObserver` is reset to `null`.
    * **Memo Updates:** If `setCount` triggers a memo's `Effect B`:
        * `Effect B` recalculates. If the memoized value changes, it calls `triggerMemo()`.
        * `triggerMemo()` calls `setValue` on the memo's internal signal (`equals: false`).
        * This signal notifies *its* observers (e.g., the text effect `Effect D` using `doubleCount`, or the `Show` effect `Effect S` using `isEven`).
        * These downstream effects then execute, get the new memoized value, and update the DOM.
    * **`Show` Component Update (`Effect S`):** If triggered (e.g., by `showCounter` changing or its `condition` memo changing):
        * Reads the new boolean condition.
        * Runs cleanup logic (removes previously inserted nodes stored in `currentContentNodes`).
        * Selects `children` or `fallback`.
        * Calls `renderContentPart` to populate a fragment.
        * Inserts the fragment's content after the marker node.
        * Updates `currentContentNodes` tracker.

5.  **DOM Update:** Once all triggered effects have run and made their changes to the DOM nodes, the browser repaints the screen, showing the updated UI.

---

This cycle of `event -> signal update -> effect execution -> DOM update` repeats whenever a reactive state changes, driven by the dependency graph established during initialization and maintained during updates.