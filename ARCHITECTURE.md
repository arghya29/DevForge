# Architecture

DevForge is a zero-dependency web-based code editor and interactive curriculum for learning web development. It is built purely with HTML, CSS, and JavaScript, without any bundlers or external libraries on the frontend.

## System Components

```mermaid
graph TD
    A[index.html] --> B[js/main.js]
    A --> C[css/base.css]
    B --> D[js/editor.js]
    B --> E[js/curriculum.js]
    D --> F[js/highlighter.js]
    E --> G[js/lesson-load.js]
    B --> H[js/store.js]
    B --> I[js/dom-utils.js]
```

## Data Flow

- **Editor State**: The user types in the editor (`js/editor.js`), which triggers updates and highlighting (`js/highlighter.js`).
- **Store**: Application state is managed via `js/store.js` and `js/state.js`.
- **Lessons**: Curriculum data is loaded through `js/curriculum.js` and displayed via `js/lesson-load.js`.

