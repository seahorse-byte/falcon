import { createFalconElement, render, Show, For } from '../src/core.js';
import { createSignal, createMemo } from '../src/reactivity.js';

// State for the list
let nextId = 4;
const [items, setItems] = createSignal([
  { id: 1, text: 'Learn FalconJs Core' },
  { id: 2, text: 'Build Conditional Rendering' },
  { id: 3, text: 'Implement List Rendering' },
]);

// A simple shuffle function
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
  const addItem = () =>
    setItems([...items(), { id: nextId++, text: `New Task #${nextId - 1}` }]);

  const shuffleItems = () => setItems(shuffle([...items()])); // Create a shuffled copy

  const removeItem = () => {
    setItems(items().slice(0, -1));
  };
  const updateItem = () => {
    const newItems = items().slice();
    if (newItems.length > 0) {
      newItems[0] = { ...newItems[0], text: newItems[0].text + '!' };
      setItems(newItems);
    }
  };
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

    // FOR
    createFalconElement('h1', {}, 'Keyed Todo List'),
    createFalconElement(
      'p',
      {},
      'Click an item to highlight it. Then shuffle the list!',
    ),
    createFalconElement(
      'div',
      { style: 'margin-bottom: 10px;' },
      createFalconElement('button', { onclick: addItem }, 'Add Item'),
      createFalconElement(
        'button',
        { onclick: shuffleItems },
        'Shuffle Items 🔀',
      ),
    ),
    createFalconElement(
      'ul',
      {},
      For({
        each: items,
        children: [
          item =>
            createFalconElement(
              'li',
              {
                // Add an onclick to toggle a class. THIS STATE will be preserved!
                onclick: e => e.target.classList.toggle('highlight'),
              },
              `[ID: ${item.id}] - ${item.text}`,
            ),
        ],
      }),
    ),
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
