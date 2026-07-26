# DevForge Architecture

DevForge is a lightweight static web application designed to be simple, fast, and easy to host. It primarily consists of HTML, CSS, and Vanilla JavaScript, with no complex backend frameworks required to serve the frontend.

## 🏗 High-Level Overview

The architecture is entirely client-side. The structure is separated into concerns:

1. **Presentation Layer**: `index.html` serves as the entry point and structural skeleton.
2. **Styling Layer**: The `css/` directory contains stylesheets to handle layout, typography, and responsive design.
3. **Logic Layer**: The `js/` directory holds modular Vanilla JavaScript files that manage DOM manipulation, user interactions, and logic.

### 📊 Architecture Diagram

```mermaid
graph TD
    A[Browser / Client] -->|Requests Static Assets| B(Static File Server)
    B -->|Serves| C[index.html]
    B -->|Serves| D[css/*.css]
    B -->|Serves| E[js/*.js]

    C -.->|Links to| D
    C -.->|Imports| E

    subgraph Frontend Application
        C
        D
        E
    end

    E -->|DOM Manipulation| C
```

## 📂 Directory Structure

- **`index.html`**: Main application view.
- **`css/`**: Global and component-specific stylesheets.
- **`js/`**: Frontend JavaScript logic.
- **`tests/`**: Unit tests running via Vitest.
- **`tests-e2e/`**: End-to-end tests running via Playwright.

### 🧩 Component Relationship

```mermaid
classDiagram
    class index_html {
        +Header
        +Main Content
        +Footer
    }
    class main_css {
        +CSS Variables
        +Global Layout
    }
    class app_js {
        +init()
        +bindEvents()
    }

    index_html --> main_css : Links
    index_html --> app_js : Includes
```

## 🧪 Testing Strategy

DevForge emphasizes test-driven development:

- **Unit Testing**: Powered by [Vitest](https://vitest.dev/), focusing on JavaScript logic and utility functions.
- **E2E Testing**: Powered by [Playwright](https://playwright.dev/), ensuring that user flows function correctly in a real browser environment.

## 🚀 Deployment

Because DevForge is a static site, it can be deployed to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify) by simply serving the root directory.

```mermaid
graph LR
    Code[Source Code] --> GitHub[GitHub Repository]
    GitHub -->|Trigger| CI[GitHub Actions CI/CD]
    CI -->|Deploy| Hosting[Static Hosting]
    Hosting --> User[End User]
```
