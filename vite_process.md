Setting Up a Production Build with Vite
This guide will transform our FalconJS project from a development-only setup into a professional library with a robust build process powered by Vite.

Step 1: New Project Structure
First, we need to adjust our project structure slightly to work well with Vite. We'll add a package.json and a vite.config.js to the root, create a main entry point for our library, and move our example index.html to the root.

/falconjs-project
├── package.json <-- NEW: Project manifest
├── vite.config.js <-- NEW: Vite configuration
├── index.html <-- NEW: Main entry for the dev server
├── /src
│ ├── core.js
│ ├── reactivity.js
│ ├── resource.js
│ ├── router.js
│ ├── store.js
│ └── index.js <-- NEW: Library entry point
└── /examples
└── app.js <-- Our example application logic

Step 2: Create package.json
This file defines our project, its dependencies, and the scripts we'll use to run and build it. You'll need to have Node.js and npm installed. In your terminal, in the project root, run npm init -y to create a basic file, then replace its contents with the code below. After that, run npm install.

I've provided the complete package.json in a separate document.

Step 3: Create vite.config.js
This is the most important file. It tells Vite that we are building a library, not a website. It specifies our entry point (src/index.js) and the formats we want to output (ES Module and UMD for compatibility).

I've provided the complete vite.config.js in a separate document.

Step 4: Create the Library Entry Point (src/index.js)
To make our framework easy to import, we need a single file that exports all of its public-facing functions and components. This is our library's "front door."

I've provided the complete src/index.js in a separate document.

Step 5: Update the index.html
Our main index.html file will now live in the project root. This file is used by Vite's development server to run our application. Its script tag is updated to point to our example app.js file.

I've provided the complete index.html in a separate document.

Step 6: The New Workflow
With these files in place, you now have a professional development and build workflow:

To Start the Dev Server:
Run this command in your terminal:

npm run dev

Vite will start a super-fast development server. Open the URL it provides in your browser to see your app.

To Build the Library:
Run this command in your terminal:

npm run build

Vite will bundle all your src files into a /dist folder. You will get optimized, minified files (falcon.es.js and falcon.umd.js) that you could publish to npm or include in any other project!
