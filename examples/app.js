import { createFalconElement } from "../src/core.js";

const appTitle = createFalconElement(
  "h1",
  { id: "app-title", class: "title" },
  "Welcome to FalconJS"
);

const appDescription = createFalconElement(
  "p",
  { class: "description" },
  "This is a simple example of using FalconJS to create HTML elements."
);

const appButton = createFalconElement(
  "button",
  {
    id: "app-button",
    class: "button",
    onClick: () => alert("Button clicked!"),
  },
  "Click Falcon Button"
);

const appContainer = createFalconElement(
  "div",
  { id: "app-container", class: "container" },
  appTitle,
  appDescription,
  appButton
);

// Get the root element from the HTML
const rootElement = document.getElementById("root");

// Append our created element structure to the DOM
rootElement.appendChild(appContainer);

// we can also use the createFalconElement function to create more complex structures
const nestedElement = createFalconElement(
  "div",
  { class: "nested" },
  createFalconElement("p", null, "This is a Falcon nested paragraph."),
  createFalconElement("span", null, "This is a Falcon nested span.")
);
// Append the nested element to the appContainer
rootElement.appendChild(nestedElement);
// we can also create elements with no properties or children
const emptyElement = createFalconElement("div");
// Append the empty element to the appContainer
rootElement.appendChild(emptyElement);
