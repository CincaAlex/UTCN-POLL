# UTCN-POLL Frontend Architecture Overview

This document provides a comprehensive overview of the frontend structure, key files, and important functionalities of the UTCN-POLL application. The application is built using React, leveraging modern hooks, context API for state management, and React Router for navigation.

## Table of Contents
1.  [Core Application Setup](#1-core-application-setup)
    *   [`src/index.jsx`](#srcindexjsx)
    *   [`src/App.jsx`](#srcappjsx)
    *   [`src/theme.css`](#srcthemecss)
2.  [Context Management](#2-context-management)
    *   [`src/context/ThemeContext.jsx`](#srccontextthemecontextjsx)
3.  [Custom Hooks](#3-custom-hooks)
    *   [`src/hooks/useOutsideClick.js`](#srchooksuseoutsideclickjs)
    *   [`src/hooks/useScrollDirection.js`](#srchooksusescrolldirectionjs)
4.  [Reusable Components](#4-reusable-components)
    *   [`src/components/Modal/Modal/Modal.jsx`](#srccomponentsmodalmodaljsx)
5.  [Application Pages](#5-application-pages)
    *   [`src/pages/homepage/Homepage.jsx`](#srcpageshomepagehomepagejsx)
    *   [`src/pages/homepage/CreatePost.jsx`](#srcpageshomepagecreatepostjsx)
    *   [`src/pages/homepage/PostCard.jsx`](#srcpageshomepagepostcardjsx)
    *   [`src/pages/login/Login.jsx`](#srcpagesloginloginjsx)
    *   [`src/pages/register/Register.jsx`](#srcpagesregisterregisterjsx)
    *   [`src/pages/welcome/Welcome.jsx`](#srcpageswelcomewelcomejsx)

---

## 1. Core Application Setup

### `src/index.jsx`
This is the entry point of the React application.
*   **Purpose**: Renders the root React component (`App`) into the DOM.
*   **Key Functions/Components**:
    *   `ReactDOM.createRoot(document.getElementById('root')).render()`: Initializes the React application and attaches it to the HTML element with the ID 'root'.
    *   `<React.StrictMode>`: A wrapper component that helps identify potential problems in an application.
    *   `<ThemeProvider>`: Wraps the entire application, making the theme context available to all components.
    *   `import './theme.css'`: Imports the global stylesheet.

### `src/App.jsx`
The main application component that sets up routing and global theme application.
*   **Purpose**: Defines the application's routes using `react-router-dom` and applies the current theme to the `body` element.
*   **Key Functions/Components**:
    *   `BrowserRouter as Router`, `Routes`, `Route`: Components from `react-router-dom` for declarative routing.
    *   `useContext(ThemeContext)`: Accesses the global theme state.
    *   `useEffect(() => { document.body.className = theme; }, [theme])`: A side effect that updates the `body`'s class name whenever the `theme` changes, allowing global CSS variables to apply.
    *   **Routes Defined**:
        *   `/`: `Homepage`
        *   `/login`: `Login`
        *   `/register`: `Register`
        *   `/profile`: `Profile`
        *   `/create-poll`: `UnderConstruction`
        *   `/dashboard`: `UnderConstruction`

### `src/theme.css`
The global stylesheet for the application.
*   **Purpose**: Defines base styles, imports a custom font, and sets up CSS variables for light and dark themes.
*   **Key Features**:
    *   `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap')`: Imports the Poppins font from Google Fonts.
    *   `body.light` and `body.dark` classes: Define a set of CSS custom properties (variables) for colors, backgrounds, text, accents, borders, and shadows, allowing for easy theme switching.
    *   `transition: background-color 0.3s ease, color 0.3s ease;`: Smooth transitions for theme changes.

---

## 2. Context Management

### `src/context/ThemeContext.jsx`
Manages the application's theme state (light/dark).
*   **Purpose**: Provides a global way to access and change the current theme across the application without prop-drilling.
*   **Key Functions/Components**:
    *   `ThemeContext = createContext()`: Creates a React Context object.
    *   `ThemeProvider({ children })`: A functional component that provides the theme context.
    *   `useState('dark')`: Manages the `theme` state, initialized to 'dark'.
    *   `toggleTheme()`: A function to switch the theme between 'light' and 'dark'.
    *   `useMemo(() => ({ theme, toggleTheme }), [theme])`: Memoizes the context value to prevent unnecessary re-renders of consuming components.

---

## 3. Custom Hooks

### `src/hooks/useOutsideClick.js`
A custom React hook to detect clicks outside a specified DOM element.
*   **Purpose**: Useful for closing modals, dropdowns, or other UI elements when a user clicks anywhere outside them.
*   **Key Functions/Components**:
    *   `useRef()`: Creates a ref object to hold a reference to the DOM element.
    *   `useEffect()`: Attaches and detaches a `mousedown` event listener to the `document`.
    *   `handleClick(event)`: The event handler that checks if the click occurred outside the referenced element and calls the provided `callback` function.

### `src/hooks/useScrollDirection.js`
A custom React hook to determine the user's scroll direction.
*   **Purpose**: Allows components to react to scroll events, for example, by hiding or showing elements based on whether the user is scrolling up or down.
*   **Key Functions/Components**:
    *   `useState(null)`: Manages the `scrollDirection` state ('up' or 'down').
    *   `useEffect()`: Attaches and detaches a `scroll` event listener to the `window`.
    *   `updateScrollDirection()`: Compares the current scroll position (`window.pageYOffset`) with the `lastScrollY` to determine the direction. Includes a threshold to prevent minor scrolls from triggering state changes.

---

## 4. Reusable Components

### `src/components/Modal/Modal.jsx`
A generic, reusable modal component.
*   **Purpose**: Displays content in an overlay above the rest of the application, typically for alerts, forms, or detailed views.
*   **Key Functions/Components**:
    *   `ReactDOM.createPortal(..., document.body)`: Renders the modal content outside the parent component's DOM hierarchy, directly into the `body`, ensuring it's always on top.
    *   `isOpen`, `onClose`, `title`, `children`: Props to control visibility, close behavior, modal title, and content.
    *   `styles.modalOverlay`: Handles clicks on the overlay to close the modal.
    *   `styles.modalContent`: Prevents clicks inside the modal from propagating to the overlay.
    *   `FiX` (from `react-icons/fi`): Provides a close icon.

---

## 5. Application Pages

### `src/pages/homepage/Homepage.jsx`
The main landing page for authenticated users.
*   **Purpose**: Orchestrates the display of various homepage sections like the top bar, search bar, post creation, and the main feed.
*   **Key Functions/Components**:
    *   `useScrollDirection()`: Utilizes the custom hook to dynamically hide/show the `SearchBar` based on scroll direction.
    *   Integrates `TopBar`, `SearchBar`, `CreatePost`, and `Feed` components.

### `src/pages/homepage/CreatePost.jsx`
A component allowing users to create new posts.
*   **Purpose**: Provides an input field and a button for users to type and submit their thoughts.
*   **Key Functions/Components**:
    *   `useState('')`: Manages the `postText` state for the input field.
    *   `handlePost()`: A function to handle post submission (currently logs to console).
    *   `disabled={!postText.trim()}`: Disables the post button if the input is empty.

### `src/pages/homepage/PostCard.jsx`
Displays an individual post with interactive features.
*   **Purpose**: Renders a single post, including user information, content, and engagement options like reactions, comments, and sharing.
*   **Key Functions/Components**:
    *   `useState` and `useRef`: Manages various UI states (e.g., `isReactionsVisible`, `isShareIconsVisible`, `selectedReaction`, `isCommentSectionVisible`, `isLikesModalOpen`, `comments`, `counts`, `newComment`).
    *   `handleReaction(reactionType)`: Toggles reactions (like, heart, haha, sad, angry) and updates like counts.
    *   `handleShare(platform)`: Simulates sharing to different platforms and updates share counts.
    *   `handleAddComment(e)`: Adds a new comment to the post's comment list.
    *   `handleReactionMouseEnter`, `handleReactionMouseLeave`, `handleShareMouseEnter`, `handleShareMouseLeave`: Control the visibility of reaction and share pickers on hover, using timeouts for a smoother UX.
    *   `ReactionDisplay()`: A helper component to show the currently selected reaction icon and text.
    *   `Modal`: Used to display a list of users who liked the post when the like count is clicked.
    *   Integrates icons from `react-icons/fi`, `react-icons/fa`, `react-icons/ai`.

### `src/pages/login/Login.jsx`
The user login page.
*   **Purpose**: Provides a form for users to enter their email and password to log in.
*   **Key Functions/Components**:
    *   `useState` for `formData` (email, password) and `errors`.
    *   `handleChange(e)`: Updates form data as the user types.
    *   `validate()`: Performs client-side validation for email format and password presence.
    *   `handleSubmit(e)`: Prevents default form submission, runs validation, and (currently) logs data and shows an alert for successful login.
    *   Uses Material UI components (`Container`, `Typography`, `TextField`, `Button`, `Box`) for styling and structure.

### `src/pages/register/Register.jsx`
The user registration page.
*   **Purpose**: Provides a form for new users to create an account.
*   **Key Functions/Components**:
    *   `useState` for `formData` (name, email, password, confirmPassword) and `errors`.
    *   `handleChange(e)`: Updates form data.
    *   `validate()`: Performs client-side validation for name presence, UTCN email domain, password length, and password matching.
    *   `handleSubmit(e)`: Prevents default form submission, runs validation, and (currently) logs data and shows an alert for successful registration.
    *   Uses Material UI components (`Container`, `Typography`, `TextField`, `Button`, `Box`).

### `src/pages/welcome/Welcome.jsx`
The initial landing page for visitors.
*   **Purpose**: Greets users, provides a brief description of the application, and directs them to login or register.
*   **Key Functions/Components**:
    *   `useContext(ThemeContext)`: Accesses the current theme to dynamically load the appropriate logo (`logoLight` or `logoDark`).
    *   `Link` (from `react-router-dom`): Provides navigation to the login and registration pages.
    *   `Welcome.css`: Specific styles for this page.
    *   `animation: 'fadeIn 1s ease-in-out'`: Applies a fade-in animation to the logo.

---