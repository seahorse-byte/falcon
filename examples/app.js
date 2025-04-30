// examples/app.js
// Import the renamed function
import { createFalconElement, render } from '../src/core.js';
import { createSignal, createEffect } from '../src/reactivity.js';

// --- Reactive State ---
const [count, setCount] = createSignal(0);
const [inputText, setInputText] = createSignal('Initial Text');
const doubleCount = () => count() * 2;

// --- Components (using createFalconElement) ---
function CounterDisplay() {
  // Use createFalconElement instead of createElement
  return createFalconElement('p', {}, 'Count: ', count);
}

function DoubleCounterDisplay() {
  return createFalconElement('p', {}, 'Double Count: ', doubleCount);
}

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

function TextInput() {
  const handleInput = event => {
    setInputText(event.target.value);
  };
  return createFalconElement('input', {
    type: 'text',
    value: inputText,
    oninput: handleInput,
  });
}

function DisplayInputText() {
  return createFalconElement('p', {}, 'You typed: ', inputText);
}

// --- Main App Component (using createFalconElement) ---
function App() {
  // Use createFalconElement throughout
  return createFalconElement(
    'div',
    { id: 'app-container' },
    createFalconElement('h1', {}, 'My Falcon Framework!'), // Updated title
    CounterDisplay(),
    DoubleCounterDisplay(),
    ClickButton(),
    createFalconElement('hr'),
    TextInput(),
    DisplayInputText(),
  );
}

// --- Rendering Logic ---
const rootElement = document.getElementById('root');
const appElement = App();
render(appElement, rootElement); // Using the original 'render' name for now

console.log('Falcon App rendered!');

// Example of updating signals after initial render
// setTimeout(() => {
//   console.log('Setting count to 10 programmatically after 2 seconds...');
//   setCount(10);
// }, 2000);

// setTimeout(() => {
//   console.log('Setting input text programmatically after 4 seconds...');
//   setInputText('Changed from timeout!');
// }, 4000);

createEffect(() => {
  const currentCount = count(); // Depend on the count signal
  console.log('Effect running, count is:', currentCount);

  const timerId = setInterval(() => {
    console.log(`Interval running (count was ${currentCount})`);
  }, 2000);

  // --- Return the cleanup function ---
  return () => {
    console.log(
      `CLEANUP running for count ${currentCount}. Clearing interval.`,
    );
    clearInterval(timerId);
  };
});

// Example update to trigger the effect and cleanup
setTimeout(() => {
  console.log('\nUpdating count to 5...\n');
  setCount(5);
}, 5000);

setTimeout(() => {
  console.log('\nUpdating count to 10...\n');
  setCount(10);
}, 8000);
