/* DevForge — curriculum.js
   All lesson content lives here: the free Playground plus the full
   HTML / CSS / JavaScript curriculum. Add new lessons by pushing another
   object into the relevant category's `items` array — nothing else in
   the app needs to change. */
'use strict';

const PLAYGROUND = {
  id: '__playground__',
  title: 'Playground',
  html: '<h1>Hello, playground!</h1>\n<p>Write any HTML, CSS or JavaScript here.</p>\n',
  css: 'body{\n  font-family: sans-serif;\n  padding: 2rem;\n}\n',
  js: '// Free play — try:\nconsole.log("Hello from the playground!");\n',
  description:
    '<p>This is your free playground. Write any HTML, CSS or JavaScript and hit <b>Run</b> — nothing here is graded. Pick a lesson from the curriculum on the left to start learning.</p>',
  tip: null,
  goals: []
};

const CURRICULUM = [
  {
    category: 'HTML Foundations',
    items: [
      {
        id: 'html-first-element',
        title: 'Your First Element',
        tag: 'HTML',
        xp: 20,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Hello World</title>\n</head>\n<body>\n\n  <h1>Hello, World!</h1>\n  <p>My first webpage.</p>\n  <p>HTML stands for HyperText Markup Language.</p>\n\n</body>\n</html>',
        css: '/* No styles yet — head to CSS Styling lessons! */\n',
        js: '// JavaScript comes later — for now, focus on structure.\n',
        description:
          '<h3>What is an HTML element?</h3><p>HTML describes the <b>structure</b> of a webpage. Every piece of content lives inside an <code>element</code> — made of an opening tag, content, and a closing tag.</p><p>Try changing the text inside <code>&lt;h1&gt;</code> to your name, then click <b>Run</b>.</p>',
        tip: 'Tags come in pairs: <code>&lt;tag&gt;</code> … <code>&lt;/tag&gt;</code>. The <code>&lt;p&gt;</code> tag creates a paragraph.',
        goals: [
          { text: 'Contains an &lt;h1&gt; heading', check: f => /<h1[\s>]/i.test(f.html) },
          {
            text: 'Contains at least one &lt;p&gt; paragraph',
            check: f => /<p[\s>]/i.test(f.html)
          },
          {
            text: 'Has a &lt;title&gt; in the head',
            check: f => /<title>[^<]*<\/title>/i.test(f.html)
          }
        ],
        hints: [
          'The starter code already has an &lt;h1&gt; and two &lt;p&gt; tags — try just editing the text inside them first.',
          'A &lt;title&gt; goes inside &lt;head&gt;, like this: &lt;title&gt;My Page&lt;/title&gt;.',
          'Every tag needs a matching closing tag with a forward slash, e.g. &lt;p&gt;text&lt;/p&gt;.'
        ]
      },
      {
        id: 'html-headings',
        title: 'Headings & Paragraphs',
        tag: 'HTML',
        xp: 20,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Headings</title>\n</head>\n<body>\n\n  <h1>Main Title</h1>\n  <h2>A Section</h2>\n  <p>Add more headings below.</p>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: '',
        description:
          '<h3>Six levels of headings</h3><p>HTML gives you six heading levels, <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>, in decreasing importance. Use exactly one <code>&lt;h1&gt;</code> per page for the main title.</p><p>Add an <code>&lt;h3&gt;</code> below the <code>&lt;h2&gt;</code>.</p>',
        tip: "Never skip levels just for a smaller font — that's what CSS is for. Headings describe document structure, not size.",
        goals: [
          {
            text: 'Has exactly one &lt;h1&gt;',
            check: f => (f.html.match(/<h1[\s>]/gi) || []).length === 1
          },
          { text: 'Has an &lt;h2&gt;', check: f => /<h2[\s>]/i.test(f.html) },
          { text: 'Has an &lt;h3&gt;', check: f => /<h3[\s>]/i.test(f.html) }
        ]
      },
      {
        id: 'html-lists-links',
        title: 'Lists & Links',
        tag: 'HTML',
        xp: 20,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Lists & Links</title>\n</head>\n<body>\n\n  <h1>My Favorite Sites</h1>\n  <ul>\n    <li>Add a list item</li>\n  </ul>\n\n  <a href="https://example.com">A link</a>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\na{ color: #4d8dff; }\n',
        js: '',
        description:
          '<h3>Lists and links</h3><p><code>&lt;ul&gt;</code> makes an unordered (bulleted) list, <code>&lt;ol&gt;</code> an ordered (numbered) one. Each entry is an <code>&lt;li&gt;</code>. Links use <code>&lt;a href="..."&gt;</code>.</p><p>Add two more <code>&lt;li&gt;</code> items and a second link.</p>',
        tip: 'The <code>href</code> attribute tells the browser where a link points. Always quote attribute values.',
        goals: [
          {
            text: 'Has a &lt;ul&gt; or &lt;ol&gt; list',
            check: f => /<(ul|ol)[\s>]/i.test(f.html)
          },
          {
            text: 'Has at least 3 &lt;li&gt; items',
            check: f => (f.html.match(/<li[\s>]/gi) || []).length >= 3
          },
          {
            text: 'Has at least 2 links',
            check: f => (f.html.match(/<a\s[^>]*href/gi) || []).length >= 2
          }
        ]
      },
      {
        id: 'html-images',
        title: 'Images & Attributes',
        tag: 'HTML',
        xp: 20,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Images & Attributes</title>\n</head>\n<body>\n\n  <h1>My Photo Gallery</h1>\n  <img src="https://picsum.photos/300/200" alt="A random placeholder photo">\n\n  <!-- add a second image below -->\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\nimg{ border-radius: 8px; margin: 8px 0; display: block; }\n',
        js: '',
        description:
          '<h3>The &lt;img&gt; element</h3><p>Images use a self-closing tag: <code>&lt;img src="..." alt="..."&gt;</code>. The <code>src</code> attribute points to the file, and <code>alt</code> describes it for screen readers and for when the image fails to load.</p><p>Add a second <code>&lt;img&gt;</code> with its own <code>src</code> and <code>alt</code>.</p>',
        tip: "Never leave <code>alt</code> empty for meaningful images — it's essential for accessibility and SEO.",
        goals: [
          { text: 'Contains an &lt;img&gt; element', check: f => /<img[\s>]/i.test(f.html) },
          {
            text: 'Every image has an alt attribute',
            check: f => {
              const imgs = f.html.match(/<img[^>]*>/gi) || [];
              return imgs.length > 0 && imgs.every(t => /alt\s*=/i.test(t));
            }
          },
          {
            text: 'Contains at least 2 images',
            check: f => (f.html.match(/<img[\s>]/gi) || []).length >= 2
          }
        ]
      },
      {
        id: 'html-forms',
        title: 'Forms & Inputs',
        tag: 'HTML',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Forms & Inputs</title>\n</head>\n<body>\n\n  <h1>Sign Up</h1>\n  <form>\n    <label for="name">Name</label>\n    <input type="text" id="name" placeholder="Your name">\n\n    <!-- add an email input and a submit button below -->\n\n  </form>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\nform{ display: flex; flex-direction: column; gap: 10px; max-width: 260px; }\ninput{ padding: 8px; border-radius: 6px; border: 1px solid #ccc; }\nbutton{ padding: 8px; border-radius: 6px; border: none; background: #4d8dff; color: #fff; cursor: pointer; }\n',
        js: '',
        description:
          '<h3>Collecting input</h3><p><code>&lt;form&gt;</code> wraps input controls. Each <code>&lt;input&gt;</code> needs a <code>type</code> (text, email, password…) and should be paired with a <code>&lt;label&gt;</code> so users know what to type.</p><p>Add an <code>&lt;input type="email"&gt;</code> and a <code>&lt;button&gt;</code> to submit the form.</p>',
        tip: 'Connect a label to its input with matching <code>for</code> and <code>id</code> attributes — clicking the label then focuses the input.',
        goals: [
          { text: 'Contains a &lt;form&gt;', check: f => /<form[\s>]/i.test(f.html) },
          {
            text: 'Contains at least 2 &lt;input&gt; elements',
            check: f => (f.html.match(/<input[\s>]/gi) || []).length >= 2
          },
          { text: 'Contains a &lt;button&gt;', check: f => /<button[\s>]/i.test(f.html) }
        ]
      },
      {
        id: 'html-semantic',
        title: 'Semantic HTML Elements',
        tag: 'HTML',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Semantic HTML</title>\n</head>\n<body>\n\n  <!-- replace these divs with semantic elements -->\n  <div>My Site</div>\n\n  <div>\n    <p>Welcome to my page.</p>\n  </div>\n\n  <div>© 2026 My Site</div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\nheader, main, footer{ display: block; padding: 12px 0; }\n',
        js: '',
        description:
          '<h3>Meaningful markup</h3><p>Semantic elements describe their purpose: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code>, and <code>&lt;footer&gt;</code> instead of generic <code>&lt;div&gt;</code>s.</p><p>Replace the three <code>&lt;div&gt;</code>s with <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;footer&gt;</code>.</p>',
        tip: "Screen readers and search engines use semantic tags to understand your page's structure — it's not just about styling.",
        goals: [
          { text: 'Uses a &lt;header&gt;', check: f => /<header[\s>]/i.test(f.html) },
          { text: 'Uses a &lt;main&gt;', check: f => /<main[\s>]/i.test(f.html) },
          { text: 'Uses a &lt;footer&gt;', check: f => /<footer[\s>]/i.test(f.html) }
        ]
      }
    ]
  },
  {
    category: 'CSS Styling',
    items: [
      {
        id: 'css-selectors',
        title: 'Selectors & Specificity',
        tag: 'CSS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Selectors</title>\n</head>\n<body>\n\n  <h1 id="title">Selector Practice</h1>\n  <p class="highlight">Style me with a class.</p>\n  <p>Style all paragraphs with a tag selector.</p>\n\n</body>\n</html>',
        css: 'body{\n  font-family: sans-serif;\n  padding: 2rem;\n}\n\n#title{\n  color: #4d8dff;\n}\n\n/* add a .highlight class rule below */\n',
        js: '',
        description:
          '<h3>Three core selectors</h3><p><code>#id</code> targets one element, <code>.class</code> targets any number of elements, and a bare tag name (like <code>p</code>) targets every element of that type.</p><p>Add a rule for <code>.highlight</code> that changes its background color.</p>',
        tip: 'IDs beat classes, and classes beat tag selectors — that\'s "specificity". Prefer classes for reusable styling.',
        goals: [
          { text: 'Has an #id selector rule', check: f => /#[a-zA-Z][\w-]*\s*\{/.test(f.css) },
          { text: 'Has a .class selector rule', check: f => /\.[a-zA-Z][\w-]*\s*\{/.test(f.css) },
          {
            text: 'Has a plain tag selector rule',
            check: f => /(^|\})\s*(p|h1|h2|body|div)\s*\{/.test(f.css)
          }
        ]
      },
      {
        id: 'css-box-model',
        title: 'The Box Model',
        tag: 'CSS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Box Model</title>\n</head>\n<body>\n\n  <div class="box">Edit my box model!</div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.box{\n  background: #4d8dff;\n  color: white;\n  padding: 16px;\n  margin: 12px;\n  border: 3px solid #1a3d7a;\n}\n',
        js: '',
        description:
          '<h3>Content, padding, border, margin</h3><p>Every element is a box: <code>content</code> in the middle, wrapped by <code>padding</code>, then a <code>border</code>, then <code>margin</code> spacing outside it.</p><p>Try changing the <code>padding</code> and <code>border-radius</code> on <code>.box</code>.</p>',
        tip: 'Add <code>border-radius</code> to round the corners of any box — no separate shape element needed.',
        goals: [
          { text: 'Sets padding on an element', check: f => /padding\s*:/.test(f.css) },
          { text: 'Sets a border', check: f => /border\s*:/.test(f.css) },
          { text: 'Sets border-radius', check: f => /border-radius\s*:/.test(f.css) }
        ]
      },
      {
        id: 'css-flexbox',
        title: 'Flexbox Layout',
        tag: 'CSS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Flexbox</title>\n</head>\n<body>\n\n  <div class="row">\n    <div class="card">1</div>\n    <div class="card">2</div>\n    <div class="card">3</div>\n  </div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.row{\n  /* turn this into a flex container */\n  gap: 12px;\n}\n\n.card{\n  background: #4d8dff;\n  color: white;\n  padding: 20px;\n  border-radius: 8px;\n  flex: 1;\n  text-align: center;\n}\n',
        js: '',
        description:
          '<h3>display: flex</h3><p>Add <code>display: flex</code> to <code>.row</code> to lay the three cards out side by side, then try <code>justify-content</code> and <code>align-items</code> to control spacing and alignment.</p>',
        tip: 'flex-direction: row (default) lays children left-to-right; column stacks them top-to-bottom.',
        goals: [
          {
            text: '.row uses display: flex',
            check: f => /\.row\s*\{[^}]*display\s*:\s*flex/is.test(f.css)
          },
          { text: 'Uses justify-content', check: f => /justify-content\s*:/.test(f.css) },
          { text: 'Uses gap', check: f => /gap\s*:/.test(f.css) }
        ],
        hints: [
          'Add the line <code>display: flex;</code> inside the <code>.row</code> rule.',
          '<code>justify-content: space-between;</code> (or <code>center</code>, <code>space-around</code>) controls horizontal spacing between the cards.',
          '<code>gap</code> is already set on <code>.row</code> in the starter code — you just need <code>display: flex</code> for it to take effect.'
        ]
      },
      {
        id: 'css-grid',
        title: 'CSS Grid',
        tag: 'CSS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>CSS Grid</title>\n</head>\n<body>\n\n  <div class="grid">\n    <div class="cell">1</div>\n    <div class="cell">2</div>\n    <div class="cell">3</div>\n    <div class="cell">4</div>\n  </div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.grid{\n  /* turn this into a grid container */\n}\n\n.cell{\n  background: #4d8dff;\n  color: white;\n  padding: 24px;\n  text-align: center;\n  border-radius: 8px;\n}\n',
        js: '',
        description:
          '<h3>display: grid</h3><p>Add <code>display: grid</code> to <code>.grid</code>, then define columns with <code>grid-template-columns: repeat(2, 1fr)</code> and spacing with <code>gap</code>.</p>',
        tip: '<code>repeat(2, 1fr)</code> means "2 equal-width columns" — much shorter than writing <code>1fr 1fr</code>.',
        goals: [
          {
            text: '.grid uses display: grid',
            check: f => /\.grid\s*\{[^}]*display\s*:\s*grid/is.test(f.css)
          },
          {
            text: 'Defines grid-template-columns',
            check: f => /grid-template-columns\s*:/.test(f.css)
          },
          { text: 'Uses gap', check: f => /gap\s*:/.test(f.css) }
        ]
      },
      {
        id: 'css-transitions',
        title: 'Transitions & Animations',
        tag: 'CSS',
        xp: 35,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Transitions & Animations</title>\n</head>\n<body>\n\n  <button class="btn">Hover me</button>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.btn{\n  padding: 12px 24px;\n  border: none;\n  border-radius: 8px;\n  background: #4d8dff;\n  color: white;\n  font-size: 15px;\n  cursor: pointer;\n  /* add a transition below */\n}\n\n.btn:hover{\n  /* change something here, e.g. background or transform */\n}\n',
        js: '',
        description:
          '<h3>Smooth changes</h3><p><code>transition: all 0.2s ease;</code> makes property changes animate smoothly instead of jumping instantly. Pair it with a <code>:hover</code> rule that changes something — background color, <code>transform: scale(1.05)</code>, etc.</p>',
        tip: 'For real keyframe animations (not tied to hover), use <code>@keyframes name { ... }</code> and apply it with <code>animation: name 1s infinite;</code>.',
        goals: [
          { text: 'Sets a transition property', check: f => /transition\s*:/.test(f.css) },
          { text: 'Has a :hover rule', check: f => /:hover/.test(f.css) },
          {
            text: 'The hover rule changes a visual property',
            check: f => /:hover\s*\{[^}]*(background|transform|color)\s*:/is.test(f.css)
          }
        ]
      },
      {
        id: 'css-positioning',
        title: 'Positioning',
        tag: 'CSS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Positioning</title>\n</head>\n<body>\n\n  <div class="card">\n    Card content\n    <span class="badge">New</span>\n  </div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.card{\n  position: relative;\n  background: #eee;\n  padding: 30px;\n  border-radius: 8px;\n  width: 220px;\n}\n\n.badge{\n  /* position this in the top-right corner of .card */\n  background: #ff7a59;\n  color: white;\n  padding: 4px 8px;\n  border-radius: 999px;\n  font-size: 12px;\n}\n',
        js: '',
        description:
          '<h3>relative + absolute</h3><p>Setting <code>position: relative</code> on a parent lets you place a child precisely with <code>position: absolute</code> plus <code>top</code>/<code>right</code>/<code>bottom</code>/<code>left</code> offsets, relative to that parent.</p><p>Position <code>.badge</code> in the top-right corner of <code>.card</code>.</p>',
        tip: 'Without a positioned ancestor, an absolutely-positioned element is placed relative to the whole page.',
        goals: [
          {
            text: '.badge uses position: absolute',
            check: f => /\.badge\s*\{[^}]*position\s*:\s*absolute/is.test(f.css)
          },
          { text: 'Sets a top offset', check: f => /\.badge\s*\{[^}]*top\s*:/is.test(f.css) },
          { text: 'Sets a right offset', check: f => /\.badge\s*\{[^}]*right\s*:/is.test(f.css) }
        ]
      }
    ]
  },
  {
    category: 'JavaScript',
    items: [
      {
        id: 'js-variables',
        title: 'Variables & Types',
        tag: 'JS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Variables & Types</title>\n</head>\n<body>\n\n  <h1>Open the console to see your output!</h1>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: '// Declare a variable with let (can change) and const (can\'t)\nlet score = 0;\nconst playerName = "Player One";\n\n// try logging different types: string, number, boolean, array\nconsole.log(playerName);\nconsole.log(score);\n\n// add a template literal below, e.g.:\n// console.log(`${playerName} has ${score} points`);\n',
        description:
          "<h3>let, const & data types</h3><p>Use <code>let</code> for values that change and <code>const</code> for values that don't. JavaScript's core types are strings, numbers, booleans, arrays, and objects.</p><p>Add a template literal (backticks with <code>${...}</code>) that combines <code>playerName</code> and <code>score</code>, then log it.</p>",
        tip: 'Template literals use backticks <code>`</code> not quotes, and let you embed expressions directly with <code>${expression}</code>.',
        goals: [
          {
            text: 'Declares a variable with let or const',
            check: f => /\b(let|const)\s+\w+/.test(f.js)
          },
          { text: 'Logs to the console', check: f => /console\.log\(/.test(f.js) },
          {
            text: 'Uses a template literal with an expression',
            check: f => /`[^`]*\$\{[^}]+\}[^`]*`/.test(f.js)
          }
        ]
      },
      {
        id: 'js-functions',
        title: 'Functions',
        tag: 'JS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Functions</title>\n</head>\n<body>\n\n  <h1>Open the console to see your output!</h1>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: '// Define a function that takes two numbers and returns their sum\nfunction add(a, b) {\n  // your code here\n\n}\n\nconsole.log(add(2, 3));\n',
        description:
          '<h3>Reusable logic</h3><p>Functions package up code you can run again with different inputs. <code>function add(a, b) { return a + b; }</code> takes parameters and <code>return</code>s a result.</p><p>Fill in <code>add</code> so it returns the sum of <code>a</code> and <code>b</code>.</p>',
        tip: 'A function without a <code>return</code> statement gives back <code>undefined</code> — always return explicitly when you need a value.',
        goals: [
          { text: 'Declares a function', check: f => /function\s+\w*\s*\(/.test(f.js) },
          { text: 'Uses return', check: f => /\breturn\b/.test(f.js) },
          {
            text: 'Calls add() and logs the result',
            check: f => /console\.log\(\s*add\(/.test(f.js)
          }
        ],
        hints: [
          'Inside the function body, add up the two parameters: <code>a + b</code>.',
          'Use the <code>return</code> keyword in front of that sum, e.g. <code>return a + b;</code>.',
          'The function declaration and the <code>console.log(add(2, 3))</code> call are already there — you only need to fill in the body.'
        ]
      },
      {
        id: 'js-arrays-loops',
        title: 'Arrays & Loops',
        tag: 'JS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Arrays & Loops</title>\n</head>\n<body>\n\n  <h1>Open the console to see your output!</h1>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: 'const fruits = ["apple", "banana", "cherry"];\n\n// loop over the array and log each item\nfor (let i = 0; i < fruits.length; i++) {\n\n}\n\n// bonus: try fruits.forEach() or fruits.map() instead\n',
        description:
          '<h3>Storing lists of data</h3><p>Arrays hold ordered collections: <code>const fruits = ["apple","banana"];</code>. Loop over them with a classic <code>for</code> loop, or the more modern <code>.forEach()</code> / <code>.map()</code>.</p><p>Fill in the <code>for</code> loop to log every fruit in the array.</p>',
        tip: "<code>array.length</code> gives you the number of items — use it as your loop's stopping condition.",
        goals: [
          { text: 'Declares an array', check: f => /=\s*\[[^\]]*\]/.test(f.js) },
          {
            text: 'Uses a loop',
            check: f => /\bfor\s*\(|\.forEach\(|\.map\(|\bwhile\s*\(/.test(f.js)
          },
          { text: 'Logs inside the run', check: f => /console\.log\(/.test(f.js) }
        ]
      },
      {
        id: 'js-dom',
        title: 'DOM Manipulation',
        tag: 'JS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>DOM Manipulation</title>\n</head>\n<body>\n\n  <h1 id="title">Click the button!</h1>\n  <button id="changeBtn">Change text</button>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\nbutton{ padding: 8px 16px; border-radius: 6px; border: none; background: #4d8dff; color: #fff; cursor: pointer; margin-top: 12px; }\n',
        js: "const btn = document.getElementById('changeBtn');\nconst title = document.getElementById('title');\n\n// add a click listener that changes title's text below\nbtn.addEventListener('click', function() {\n\n});\n",
        description:
          "<h3>Reacting to clicks</h3><p><code>document.getElementById()</code> and <code>document.querySelector()</code> grab elements from the page. <code>addEventListener('click', ...)</code> runs code when they're clicked, and <code>element.textContent = \"...\"</code> changes their text.</p><p>Inside the click handler, set <code>title.textContent</code> to a new message.</p>",
        tip: "<code>textContent</code> is safer than <code>innerHTML</code> when you're just changing text, since it won't accidentally run injected HTML.",
        goals: [
          {
            text: 'Selects an element',
            check: f => /document\.(getElementById|querySelector)\(/.test(f.js)
          },
          {
            text: 'Adds a click listener',
            check: f => /addEventListener\(\s*['"]click['"]/.test(f.js)
          },
          { text: 'Updates text content', check: f => /\.(textContent|innerText)\s*=/.test(f.js) }
        ],
        hints: [
          'The click listener already exists — you just need to write one line inside its curly braces.',
          'Set the heading\'s text with <code>title.textContent = "...";</code>.',
          'Put that line between <code>function() {</code> and <code>}</code> in the <code>addEventListener</code> call.'
        ]
      },
      {
        id: 'js-fetch-async',
        title: 'Fetch & Async/Await',
        tag: 'JS',
        xp: 40,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Fetch & Async/Await</title>\n</head>\n<body>\n\n  <h1>Open the console to see your output!</h1>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: "async function loadUser() {\n  try {\n    const response = await fetch('https://jsonplaceholder.typicode.com/users/1');\n    const data = await response.json();\n    console.log(data.name);\n  } catch (err) {\n    console.error('Failed to load:', err.message);\n  }\n}\n\nloadUser();\n",
        description:
          '<h3>Asynchronous code</h3><p><code>fetch()</code> requests data from a server and returns a Promise. Marking a function <code>async</code> lets you use <code>await</code> inside it to pause until that Promise resolves — much easier to read than chained <code>.then()</code> calls.</p><p>This lesson calls a public test API. Try changing the URL to fetch a different user (e.g. <code>/users/2</code>).</p>',
        tip: "Always wrap <code>await</code> calls in <code>try/catch</code> — network requests can fail, and you don't want that to crash the rest of your script.",
        goals: [
          {
            text: 'Declares an async function',
            check: f => /\basync\s+function|\basync\s*\(/.test(f.js)
          },
          { text: 'Uses await', check: f => /\bawait\b/.test(f.js) },
          { text: 'Uses fetch()', check: f => /\bfetch\s*\(/.test(f.js) }
        ]
      },
      {
        id: 'js-todo-app',
        title: 'Build a Todo App',
        tag: 'JS',
        xp: 50,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Todo App</title>\n</head>\n<body>\n\n  <h1>My Todos</h1>\n  <input id="todoInput" type="text" placeholder="What needs doing?">\n  <button id="addBtn">Add</button>\n  <ul id="todoList"></ul>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; max-width: 360px; }\ninput{ padding: 8px; border-radius: 6px; border: 1px solid #ccc; width: 60%; }\nbutton{ padding: 8px 14px; border-radius: 6px; border: none; background: #4d8dff; color: #fff; cursor: pointer; }\nul{ list-style: none; padding: 0; margin-top: 16px; }\nli{ display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f3f3f3; border-radius: 6px; margin-bottom: 6px; }\nli button{ background: #f85149; padding: 4px 8px; font-size: 12px; }\n',
        js: "const input = document.getElementById('todoInput');\nconst addBtn = document.getElementById('addBtn');\nconst list = document.getElementById('todoList');\nlet todos = [];\n\nfunction render() {\n  list.innerHTML = '';\n  todos.forEach(function(todo, index) {\n    const li = document.createElement('li');\n    li.textContent = todo;\n\n    const removeBtn = document.createElement('button');\n    removeBtn.textContent = 'Delete';\n    removeBtn.addEventListener('click', function() {\n      todos.splice(index, 1);\n      render();\n    });\n\n    li.appendChild(removeBtn);\n    list.appendChild(li);\n  });\n}\n\n// add a click listener on addBtn that pushes input.value into todos,\n// clears the input, and calls render()\naddBtn.addEventListener('click', function() {\n\n});\n",
        description:
          '<h3>Putting it all together</h3><p>This mini-project combines everything so far: DOM selection, event listeners, arrays, and dynamically created elements. The delete button already works — your job is to make <b>Add</b> work.</p><p>Inside the <code>addBtn</code> click handler: push <code>input.value</code> into the <code>todos</code> array, clear the input, then call <code>render()</code>.</p>',
        tip: 'Always call <code>render()</code> after changing <code>todos</code> — the list on screen only updates when you re-render it.',
        goals: [
          {
            text: 'addBtn has a click listener',
            check: f => /addBtn\.addEventListener\(\s*['"]click['"]/.test(f.js)
          },
          { text: 'Pushes into the todos array', check: f => /todos\.push\(/.test(f.js) },
          {
            text: 'Calls render() after adding',
            check: f => (f.js.match(/render\(\)/g) || []).length >= 2
          }
        ],
        hints: [
          "Inside the empty <code>addBtn.addEventListener('click', function() { ... })</code>, start with <code>todos.push(input.value);</code>.",
          "Clear the input afterward with <code>input.value = '';</code> so it's ready for the next todo.",
          "Finish by calling <code>render();</code> — without it, the array changes but the list on screen won't update."
        ]
      },
      {
        id: 'js-classes-oop',
        title: 'JavaScript Classes & OOP',
        tag: 'JS',
        xp: 35,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Classes & OOP</title>\n</head>\n<body>\n\n  <h1>Open the console to see your output!</h1>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: "class Animal {\n  constructor(name, sound) {\n    this.name = name;\n    this.sound = sound;\n  }\n\n  speak() {\n    console.log(this.name + ' says ' + this.sound);\n  }\n}\n\n// create an instance of Animal below and call .speak() on it\n",
        description:
          '<h3>Blueprints for objects</h3><p>A <code>class</code> is a blueprint: <code>constructor(...)</code> sets up each new instance\'s properties, and methods like <code>speak()</code> define behavior shared by every instance.</p><p>Create a new <code>Animal</code> with <code>new Animal("Rex", "Woof")</code> and call its <code>.speak()</code> method.</p>',
        tip: '<code>this</code> inside a class method refers to the specific instance it was called on.',
        goals: [
          { text: 'Defines a class', check: f => /\bclass\s+\w+/.test(f.js) },
          { text: 'Has a constructor', check: f => /constructor\s*\(/.test(f.js) },
          { text: 'Creates an instance with new', check: f => /\bnew\s+\w+\(/.test(f.js) }
        ]
      }
    ]
  }
];

const FLAT_LESSONS = CURRICULUM.flatMap(c => c.items);
