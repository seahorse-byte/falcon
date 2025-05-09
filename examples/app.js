import { createFalconElement, render, Show } from '../src/core.js';
import { createSignal, createMemo } from '../src/reactivity.js';

// --- Reactive State ---
const [count, setCount] = createSignal(0);

// Signal to control the visibility of the counter section
const [showCounter, setShowCounter] = createSignal(true);
const [inputText, setInputText] = createSignal('');

// use createMemo for derived values
const doubleCount = createMemo(() => {
  console.log('Memo: Calculating doubleCount');
  return count() * 2;
});
const isEven = createMemo(() => count() % 2 === 0);

// --- Components (using createFalconElement) ---
function CounterDisplay() {
  // Pass the signal getter function directly as a child for reactive text
  return createFalconElement('p', {}, 'Count: ', count);
}

// Wrapped in its own Show to only appear when count > 5
function DoubleCounterDisplay() {
  const shouldShow = createMemo(() => count() > 5); // Memoize the condition
  return Show(
    { when: shouldShow }, // Use the memoized condition
    createFalconElement('p', {}, 'Double Count: ', doubleCount), // Pass the memo getter as child
  );
}

// Button to increment the count
function ClickButton() {
  const handleClick = () => {
    setCount(count() + 1);
  };
  return createFalconElement(
    'button',
    { onclick: handleClick },
    'Increment Count',
  );
}

// Button to toggle the visibility of the counter section
function ToggleButton() {
  const handleClick = () => {
    const currentVal = showCounter();
    // console.log(`ToggleButton Clicked! Toggling showCounter to: ${!currentVal}`); // Optional log
    setShowCounter(!currentVal); // Toggle the signal
  };
  // Button text changes reactively based on the showCounter state
  const buttonText = createMemo(() =>
    showCounter() ? 'Hide Counter Section' : 'Show Counter Section',
  );
  return createFalconElement(
    'button',
    { onclick: handleClick },
    buttonText, // Pass the memo getter for reactive button text
  );
}

// Input field whose value is synced with inputText signal
function TextInput() {
  const handleInput = event => {
    setInputText(event.target.value);
  };
  // For reactive attributes like 'value', pass a function (signal getter)
  return createFalconElement('input', {
    type: 'text',
    value: inputText, // Pass the signal getter function
    oninput: handleInput, // Standard event listener
  });
}

// Displays the text currently in the input field
function DisplayInputText() {
  // Pass the signal getter for reactive text display
  return createFalconElement('p', {}, 'You typed: ', inputText);
}

// --- Main App Component ---
// Assembles the UI using the components and Show for conditional logic
function App() {
  return createFalconElement(
    'div',
    { id: 'app-container', class: 'counter-section' },
    createFalconElement('h1', {}, 'FALCON JS'),
    // Add the button to toggle the counter section's visibility
    ToggleButton(),

    createFalconElement('hr'),

    // --- Use Show Component for the Counter Section ---
    Show(
      {
        when: showCounter, // The reactive condition (signal getter)
        fallback: createFalconElement(
          'p',
          { style: 'color: gray;' },
          'Counter section is hidden.',
        ), // Content when condition is false
      },
      // --- Children ---
      // This div and its contents will only be rendered when showCounter() is true
      createFalconElement(
        'div',
        { class: 'counter-section' },
        CounterDisplay(),
        DoubleCounterDisplay(), // Contains nested Show component
        ClickButton(),

        // Example of showing Even/Odd status conditionally
        Show(
          { when: isEven }, // Use memo directly as condition
          createFalconElement('p', {}, 'Count is Even'),
        ),
        Show(
          { when: () => !isEven() }, // Use arrow function deriving from memo
          createFalconElement('p', {}, 'Count is Odd'),
        ),
      ),
      // --- End Children ---
    ),
    // --- End Show Component ---

    createFalconElement('hr'),

    // --- Text Input Section ---
    TextInput(),
    DisplayInputText(),
  );
}

// --- Rendering Logic ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('#root element not found in index.html!');
} else {
  // Pass the App function itself to render.
  // render will call App() to get the element tree.
  render(App, rootElement);
  console.log('Falcon App rendered!');
}
