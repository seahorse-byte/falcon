import { createFalconElement, render, Show, For } from '../src/core.js';
import {
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
} from '../src/reactivity.js';
import { Route, Link } from '../src/router.js';

// --- 1. Define Page Components ---
// Each "page" is just a regular component.

function HomePage() {
  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'Home Page'),
    createFalconElement(
      'p',
      {},
      'Welcome to the FalconJS router demo! Click the links above.',
    ),
  );
}

function AboutPage() {
  return createFalconElement(
    'div',
    {},
    createFalconElement('h2', {}, 'About Page'),
    createFalconElement(
      'p',
      {},
      'This entire application is running client-side. Notice how the URL changes without a page reload.',
    ),
  );
}

// A convenience helper for code that should run once on mount.
const onMount = fn => {
  // This simple version of onMount just uses createEffect.
  // A key assumption is that the user won't put signals inside
  // that would cause it to re-run, defeating the "once" purpose.
  createEffect(fn);
};

// --- The Timer Component ---
// This component demonstrates the use of onMount and onCleanup.
function TimerComponent() {
  const [count, setCount] = createSignal(0);

  // This effect will run once when the component is created (mounted).
  onMount(() => {
    console.log('%cTimerComponent MOUNTED', 'color: green; font-weight: bold;');

    // Set up a side effect: an interval timer.
    const timerId = setInterval(() => {
      // This is a standard signal update.
      setCount(count() + 1);
    }, 1000);

    // Register a cleanup function for this effect's scope.
    // This will run when the component is destroyed (unmounted).
    onCleanup(() => {
      console.log(
        `%cTimerComponent CLEANUP: Clearing interval ${timerId}`,
        'color: red; font-weight: bold;',
      );
      clearInterval(timerId); // <-- This prevents memory leaks!
    });
  });

  // The UI for the component.
  return createFalconElement(
    'div',
    { style: 'border: 1px solid #ccc; padding: 10px; margin-top: 10px;' },
    createFalconElement('h3', {}, 'Live Timer'),
    // This text will be reactive thanks to the signal.
    createFalconElement('p', {}, () => `Count: ${count()}`),
  );
}

// --- 1. The Reactive Child Component ---
// This component knows how to handle reactive props.
function ReactiveGreeting(props) {
  // `props.name` is the signal's getter function: () => "initial value"
  const { name } = props;

  // Create a text node that we can update directly.
  const greetingText = document.createTextNode('');

  // Create an effect that listens to the `name` signal.
  createEffect(() => {
    // When the signal from the parent changes,
    // this effect re-runs and updates the text node's content.
    const newName = name(); // We call the signal's getter here!
    console.log(
      `%cEffect in ReactiveGreeting: Name changed to "${newName}"`,
      'color: dodgerblue;',
    );
    greetingText.textContent = `Hello, ${newName}!`;
  });

  // The component returns a static element containing our reactive text node.
  return createFalconElement('h2', {}, greetingText);
}

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
  return Show({
    when: shouldShow,
    children: [createFalconElement('p', {}, 'Double Count: ', doubleCount)],
  });
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
  // Create a signal to hold the name.
  const [name, setName] = createSignal('World');

  // A signal to control the visibility of the TimerComponent.
  const [showTimer, setShowTimer] = createSignal(true);

  const handleInput = event => {
    setName(event.target.value);
  };

  const addItem = () =>
    setItems([...items(), { id: nextId++, text: `New Task #${nextId - 1}` }]);

  const shuffleItems = () => setItems(shuffle([...items()])); // Create a shuffled copy

  return createFalconElement(
    'div',
    { id: 'app-container', class: 'counter-section' },
    createFalconElement('h1', {}, 'FALCON JS'),
    // --- Navigation Header ---
    createFalconElement(
      'header',
      {
        style: 'background-color: #f0f0f0; padding: 15px; border-radius: 8px;',
      },
      createFalconElement(
        'nav',
        { style: 'display: flex; gap: 20px; font-size: 1.1em;' },
        // Use the Link component for navigation
        Link({ to: '/', children: ['Home'] }),
        Link({ to: '/about', children: ['About'] }),
      ),
    ),

    // --- Content Area ---
    // The Route components will render their content here based on the URL.
    createFalconElement(
      'main',
      { style: 'padding: 20px 0;' },
      Route({ path: '/', children: [HomePage({})] }),
      Route({ path: '/about', children: [AboutPage({})] }),
    ),
    createFalconElement('hr'),
    createFalconElement('br'),
    createFalconElement('br'),
    // Add the button to toggle the counter section's visibility
    ToggleButton(),

    createFalconElement('hr'),

    // --- Use Show Component for the Counter Section ---
    Show({
      when: showCounter, // The reactive condition (signal getter)
      fallback: createFalconElement(
        'p',
        { style: 'color: gray;' },
        'Counter section is hidden.',
      ),
      children: [
        // This div and its contents will only be rendered when showCounter() is true
        createFalconElement(
          'div',
          { class: 'counter-section' },
          CounterDisplay(),
          DoubleCounterDisplay(), // Contains nested Show component
          ClickButton(),

          // Example of showing Even/Odd status conditionally
          Show({
            when: isEven,
            children: [createFalconElement('p', {}, 'Count is Even')],
          }),
          Show({
            when: () => !isEven(),
            children: [createFalconElement('p', {}, 'Count is Odd')],
          }),
        ),
      ],
    }),
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
      { style: 'margin: 10px; display:flex; gap: 10px;' },
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
              { onclick: e => e.target.classList.toggle('highlight') },
              `[ID: ${item.id}] - ${item.text}`,
            ),
        ],
      }),
    ),

    createFalconElement('hr', {}),
    createFalconElement('br', {}),
    createFalconElement('br', {}),
    createFalconElement('h1', {}, 'Reactive Props Demo'),
    createFalconElement('p', {}, 'Edit the text in the box below.'),
    createFalconElement('input', {
      type: 'text',
      value: name, // Pass signal getter directly for reactive attribute
      oninput: handleInput, // Update signal on every keystroke
      style: 'padding: 5px; font-size: 1em;',
    }),
    createFalconElement('hr', {}),

    // Pass the name signal's getter function directly as a prop.
    ReactiveGreeting({ name: name }),
    createFalconElement('hr', {}),
    createFalconElement('br', {}),
    createFalconElement('br', {}),

    createFalconElement('h1', {}, 'Component Lifecycle Demo'),
    createFalconElement(
      'button',
      {
        onclick: () => setShowTimer(!showTimer()),
      },
      'Toggle Timer Component',
    ),

    Show({
      when: showTimer,
      children: [TimerComponent({})],
      fallback: createFalconElement(
        'p',
        { style: 'margin-top: 10px;' },
        'Timer is hidden.',
      ),
    }),
  );
}

// --- Rendering Logic ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('#root element not found in index.html!');
} else {
  render(App, rootElement);
  console.log('Falcon App rendered!');
}
