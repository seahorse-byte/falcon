# FalconJS API Reference: Routing

This document provides a reference for the client-side routing utilities in FalconJS, which allow you to build single-page applications (SPAs).

```jsx
<Route>
```

A component that renders its content only when the current URL path matches its path prop.

Props
path: A string representing the URL path to match (e.g., /, /about, /users/:id).

component: The component function to render when the path matches.

Example
import { Route, HomePage, AboutPage } from '@olsigjeci/falconjs';

```jsx
<main>
  <Route path="/" component={HomePage} />
  <Route path="/about" component={AboutPage} />
</main>
```

```jsx
<Link>
```

Creates a navigation link that updates the URL without a full page reload. It should be used for all internal navigation within your FalconJS application.

Props
to: The destination path for the link (e.g., /, /about).

Example
import { Link } from '@olsigjeci/falconjs';

```jsx
<nav>
  <Link to="/">Home</Link>
  <Link to="/about">About Us</Link>
</nav>
```

```jsx
navigate(to);
```

A programmatic navigation function that allows you to change the URL from within your component logic, such as after a form submission or a button click.

Signature

```jsx
navigate(to: string): void
```

Parameters
to: The destination path to navigate to.

Example

```jsx
import { navigate } from '@olsigjeci/falconjs';

function LoginForm() {
  const handleLogin = () => {
    // Perform login logic...

    // Then redirect to the dashboard.
    navigate('/dashboard');
  };

  return <button onClick={handleLogin}>Log In</button>;
}
```
