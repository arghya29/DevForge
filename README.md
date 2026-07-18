# DevForge

A free, open-source, zero-dependency code editor and interactive curriculum
for learning HTML, CSS, and JavaScript — right in the browser, with no
account, no build step, and no server required.

DevForge is a real code editor (with syntax highlighting, a live preview,
and a console) that is _also_ the lesson itself: the code you write, the
goals you're working toward, and your progress all live in the same place.

## Features

- HTML / CSS / JS editor with syntax highlighting and line numbers
- Live preview (sandboxed iframe) with desktop/tablet/mobile views
- Console panel that captures `console.log`/`warn`/`error` and runtime errors
  from the preview
- A curriculum of lessons, each with starter code, a description, a tip, and
  auto-checked goals
- A free-play Playground alongside the curriculum
- XP, streaks, lesson completion tracking, and achievements — all stored
  locally, no account required
- Code snippets, progress export/import, workspace layout presets, keyboard
  shortcuts, and a learner analytics view
- Fully static: clone it and open `index.html`. Nothing to install, nothing
  to build.

## Getting started

```bash
git clone https://github.com/<org>/devforge.git
cd devforge
```

Then just open `index.html` in a browser. That's it — there is no build
step for using the app.

### Running the test suite

Tests use [Vitest](https://vitest.dev/) with jsdom, and are only needed if
you're developing DevForge itself (not required to use the app).

```bash
npm install
npm test
```

### Linting / formatting

```bash
npm run lint
npm run format
```

## Project structure

```
devforge/
├── index.html
├── css/            → base tokens, layout, editor, components, modals
├── js/             → one module per concern (see js/*.js for details)
├── tests/          → Vitest test suite
└── .github/        → CI workflows, issue/PR templates
```

Each JS file is a plain classic script (no bundler, no ES modules — modules
don't load reliably over `file://`, and keeping this dependency-free is a
deliberate project goal). See `js/main.js` for load order and
[`CODEBASE_GUIDE.md`](./CODEBASE_GUIDE.md) for a full, beginner-friendly
walkthrough of what every file does.

## Contributing

Contributions are very welcome, especially new lessons — see
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for a short guide, including exactly
how to add a lesson to the curriculum, and
[`CODEBASE_GUIDE.md`](./CODEBASE_GUIDE.md) for a deeper look at how the
whole project fits together, file by file — written for contributors who
are new to this codebase (or new to programming in general).

See [`ROADMAP.md`](./ROADMAP.md) for the project's current direction and
priorities.

## License

[Apache-2.0](./LICENSE)
