/* DevForge — curriculum.js
   All lesson content lives here: the free Playground plus the full
   HTML / CSS / JavaScript curriculum. Add new lessons by pushing another
   object into the relevant category's `items` array — nothing else in
   the app needs to change. */
'use strict';

var PLAYGROUND = {
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

var CURRICULUM = [
  {
    category: 'HTML Foundations',
    items: [
      {
        id: 'html-first-element',
        title: 'Your First Element',
        tag: 'HTML',
        xp: 20,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\n  <!-- add a <title> tag here -->\n\n</head>\n<body>\n\n  <!-- add an <h1> heading with your name -->\n\n  <p>My first webpage.</p>\n  <!-- add one more <p> paragraph below, like the one above -->\n\n</body>\n</html>',
        css: '/* No styles yet — head to CSS Styling lessons! */\n',
        js: '// JavaScript comes later — for now, focus on structure.\n',
        description:
          '<h3>What is an HTML element?</h3><p>HTML describes the <b>structure</b> of a webpage. Every piece of content lives inside an <code>element</code> — made of an opening tag, content, and a closing tag.</p><p>Add a <code>&lt;title&gt;</code> in the <code>&lt;head&gt;</code>, an <code>&lt;h1&gt;</code> with your name, and one more <code>&lt;p&gt;</code> paragraph, then click <b>Run</b>.</p>',
        tip: 'Tags come in pairs: <code>&lt;tag&gt;</code> … <code>&lt;/tag&gt;</code>. The <code>&lt;p&gt;</code> tag creates a paragraph.',
        goals: [
          { text: 'Contains an &lt;h1&gt; heading', check: f => /<h1[\s>]/i.test(f.html) },
          {
            text: 'Contains at least 2 &lt;p&gt; paragraphs',
            check: f => (f.html.match(/<p[\s>]/gi) || []).length >= 2
          },
          {
            text: 'Has a &lt;title&gt; in the head',
            check: f => /<title>[^<]*<\/title>/i.test(f.html)
          }
        ],
        hints: [
          'The starter already has one <p> paragraph — copy its shape to add the second one.',
          'A <title> goes inside <head>, like this: <title>My Page</title>.',
          'Every tag needs a matching closing tag with a forward slash, e.g. <p>text</p>.'
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
      },
      {
        id: 'html-tables-captions',
        title: 'Tables & Captions',
        tag: 'HTML',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Weekly Schedule</title>\n</head>\n<body>\n\n  <h1>Weekly Schedule</h1>\n\n  <table>\n\n    <!-- add a caption element here, as the first child of the table -->\n\n    <tr>\n      <!-- these two should be header cells, with scope="col" -->\n      <td>Day</td>\n      <td>Topic</td>\n    </tr>\n    <tr>\n      <td>Monday</td>\n      <td>HTML</td>\n    </tr>\n    <tr>\n      <td>Tuesday</td>\n      <td>CSS</td>\n    </tr>\n  </table>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\ntable{ border-collapse: collapse; }\ncaption{ text-align: left; padding-bottom: .5rem; font-weight: 600; }\nth, td{ border: 1px solid #3a3f4b; padding: .5rem 1rem; text-align: left; }\n',
        js: '',
        description:
          "<h3>Tables describe data, not layout</h3><p>A table holds rows of related data. Each row is a <code>&lt;tr&gt;</code>, each ordinary cell a <code>&lt;td&gt;</code>, and each <b>header</b> cell a <code>&lt;th&gt;</code>. A <code>&lt;caption&gt;</code> gives the whole table a title and is read out by screen readers before the data.</p><p>Add a caption to this table, and turn the first row's cells into header cells.</p>",
        tip: 'Add <code>scope="col"</code> to a header at the top of a column, or <code>scope="row"</code> for one at the start of a row — it tells assistive tech which cells each header describes.',
        goals: [
          { text: 'Contains a &lt;table&gt;', check: f => /<table[\s>]/i.test(f.html) },
          {
            text: 'Contains a &lt;caption&gt; describing the table',
            check: f =>
              /<table[\s>][\s\S]*?<caption[\s>][^<]*\S[^<]*<\/caption>[\s\S]*?<tr[\s>]/i.test(
                f.html
              )
          },
          {
            text: 'Marks the header row with &lt;th scope="col"&gt; cells',
            check: f =>
              /<th[^>]*\sscope\s*=\s*["']?(col|row)\b/i.test(f.html) && /<td[\s>]/i.test(f.html)
          }
        ],
        hints: [
          'The <caption> goes directly inside <table>, before the first row.',
          'Swap the two cells in the first row from <td> to <th> — remember to change the closing tags too.',
          'A column header is written <th scope="col">Day</th>.'
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
        {
        id: 'css-keyframes',
        title: 'Keyframe Animations',
        tag: 'CSS',
        xp: 35,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Keyframe Animations</title>\n</head>\n<body>\n\n  <div class="loader"></div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.loader{\n  width: 40px;\n  height: 40px;\n  border: 4px solid #3a3f4b;\n  border-top-color: #4d8dff;\n  border-radius: 50%;\n  /* add your animation property here */\n}\n\n/* define @keyframes spin below */\n',
        js: '',
        description: '<h3>Continuous animation</h3><p>While transitions only happen when a property changes (like on hover), <code>@keyframes</code> lets you define complex, multi-step animations that run automatically.</p><p>Define a <code>@keyframes spin</code> that rotates from <code>0deg</code> to <code>360deg</code>, then apply it to <code>.loader</code> using <code>animation: spin 1s linear infinite;</code>.</p>',
        tip: 'Use <code>transform: rotate(360deg);</code> inside your keyframe blocks.',
        goals: [
          { text: 'Defines @keyframes spin', check: f => /@keyframes\s+spin/.test(f.css.replace(/\/\*[\s\S]*?\*\//g, '')) },
          { text: 'Applies the animation to .loader', check: f => /\.loader\s*\{[^}]*animation\s*:\s*spin/.test(f.css.replace(/\/\*[\s\S]*?\*\//g, '')) },
          { text: 'Uses transform: rotate', check: f => /transform\s*:\s*rotate/.test(f.css.replace(/\/\*[\s\S]*?\*\//g, '')) }
        ]
      },\n      {\n        id: 'css-positioning',
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
      },
      {
        id: 'css-media-queries',
        title: 'Responsive Layout with Media Queries',
        tag: 'CSS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Responsive Layout</title>\n</head>\n<body>\n\n  <h1>Resize the preview</h1>\n\n  <div class="layout">\n    <div class="panel">Panel one</div>\n    <div class="panel">Panel two</div>\n    <div class="panel">Panel three</div>\n  </div>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n\n.layout{\n  display: flex;\n  flex-direction: row;\n  gap: 1rem;\n}\n\n.panel{\n  flex: 1;\n  background: #1a1d24;\n  border-radius: 8px;\n  padding: 1rem;\n}\n\n/* These three panels sit side by side at every width, which is cramped on a\n   phone. Add a rule at the bottom that only applies below 600px and stacks\n   them into a single column instead. */\n',
        js: '',
        description:
          '<h3>One layout does not fit every screen</h3><p>A media query applies a block of CSS only when a condition about the viewport holds. <code>@media (max-width: 600px)</code> means "apply this when the viewport is 600px wide or narrower".</p><p>Add a query that switches <code>.layout</code> from a row to a column on narrow screens, then drag the divider between the editor and the preview to see it flip.</p>',
        tip: 'Design mobile-first by writing your base styles for small screens and using <code>min-width</code> queries to add complexity as space allows — it usually produces less CSS than overriding a desktop layout downwards.',
        goals: [
          {
            text: 'Adds an @media rule',
            check: f => /@media[\s(]/i.test(f.css.replace(/\/\*[\s\S]*?\*\//g, ''))
          },
          {
            text: 'Targets a width breakpoint (max-width or min-width)',
            check: f =>
              /@media[^{]*\((max|min)-width\s*:/i.test(f.css.replace(/\/\*[\s\S]*?\*\//g, ''))
          },
          {
            text: 'Changes the layout inside that media query',
            check: f => {
              const css = f.css.replace(/\/\*[\s\S]*?\*\//g, '');
              const re = /@media[\s(]/gi;
              let m;
              while ((m = re.exec(css))) {
                const open = css.indexOf('{', m.index);
                if (open < 0) continue;
                let depth = 0;
                let end = open;
                while (end < css.length) {
                  if (css[end] === '{') depth += 1;
                  else if (css[end] === '}') {
                    depth -= 1;
                    if (depth === 0) break;
                  }
                  end += 1;
                }
                const inside = css.slice(open + 1, end);
                if (/(flex-direction|flex-flow|grid-template|display)\s*:/i.test(inside)) {
                  return true;
                }
                re.lastIndex = end;
              }
              return false;
            }
          }
        ],
        hints: [
          'Start the block with @media (max-width: 600px) followed by a pair of braces.',
          'Inside it, target .layout again — a later rule of equal specificity wins.',
          'Setting flex-direction: column inside the query stacks the panels vertically.'
        ]
      },
      {
        id: 'css-variables-theming',
        title: 'CSS Variables & Theming',
        tag: 'CSS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Theming</title>\n</head>\n<body>\n\n  <h1>Theme me</h1>\n\n  <div class="card">\n    <p>This card and the button below should share one colour.</p>\n    <button class="button">Click me</button>\n  </div>\n\n</body>\n</html>',
        css: 'body{\n  font-family: sans-serif;\n  padding: 2rem;\n  background: #0f1115;\n  color: #e6e6e6;\n}\n\n/* Every colour below is hard-coded, so changing the accent means editing\n   more than one rule. Define your theme once at the top of this file,\n   then point each rule at it. */\n\n.card{\n  background: #1a1d24;\n  border: 2px solid #4d8dff;\n  border-radius: 8px;\n  padding: 1rem;\n}\n\n.button{\n  background: #4d8dff;\n  color: #0f1115;\n  border: none;\n  border-radius: 6px;\n  padding: .5rem 1rem;\n  cursor: pointer;\n}\n',
        js: '',
        description:
          '<h3>Define a colour once, use it everywhere</h3><p>CSS custom properties let you name a value and reuse it. Declare them on <code>:root</code> so the whole document can see them, then read them back with <code>var(--name)</code>.</p><p>Move the accent colour into a custom property and use it in both the card border and the button, so changing one line restyles both.</p>',
        tip: 'Custom property names are case-sensitive and must start with two dashes, e.g. <code>--accent: #4d8dff;</code>. <code>var(--accent, #4d8dff)</code> supplies a fallback if the property is missing.',
        goals: [
          {
            text: 'Declares a custom property inside :root',
            check: f => /:root\s*\{[^}]*--[\w-]+\s*:/is.test(f.css.replace(/\/\*[\s\S]*?\*\//g, ''))
          },
          {
            text: 'Reads one of those declared properties with var()',
            check: f => {
              const css = f.css.replace(/\/\*[\s\S]*?\*\//g, '');
              const root = (css.match(/:root\s*\{([^}]*)\}/is) || ['', ''])[1];
              const declared = new Set(Array.from(root.matchAll(/--([\w-]+)\s*:/g), m => m[1]));
              return Array.from(css.matchAll(/var\(\s*--([\w-]+)/g)).some(m => declared.has(m[1]));
            }
          },
          {
            text: 'Reuses the same declared property in at least two rules',
            check: f => {
              const css = f.css.replace(/\/\*[\s\S]*?\*\//g, '');
              const root = (css.match(/:root\s*\{([^}]*)\}/is) || ['', ''])[1];
              const declared = new Set(Array.from(root.matchAll(/--([\w-]+)\s*:/g), m => m[1]));
              const uses = {};
              Array.from(css.matchAll(/var\(\s*--([\w-]+)/g)).forEach(m => {
                if (declared.has(m[1])) uses[m[1]] = (uses[m[1]] || 0) + 1;
              });
              return Object.keys(uses).some(k => uses[k] >= 2);
            }
          }
        ],
        hints: [
          'Add a :root block at the very top, e.g. :root { --accent: #4d8dff; }',
          'Then replace the hard-coded #4d8dff in .card with var(--accent).',
          'Do the same in .button — one property, two rules, and now a single edit re-themes both.'
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
        js: '// Declare a variable with let (can change) and const (can\'t)\nlet score = 0;\nconst playerName = "Player One";\n\n// try logging different types: string, number, boolean, array\nconsole.log(playerName);\nconsole.log(score);\n\n// now combine playerName and score into one message using a template\n// literal (backticks with ${...}) and log that instead\n',
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
        js: "async function loadUser() {\n  try {\n    // fetch 'https://jsonplaceholder.typicode.com/users/1', await the\n    // response, parse it as JSON, then log the user's name\n\n  } catch (err) {\n    console.error('Failed to load:', err.message);\n  }\n}\n\nloadUser();\n",
        description:
          '<h3>Asynchronous code</h3><p><code>fetch()</code> requests data from a server and returns a Promise. Marking a function <code>async</code> lets you use <code>await</code> inside it to pause until that Promise resolves — much easier to read than chained <code>.then()</code> calls.</p><p>Fill in the <code>try</code> block: <code>await fetch(...)</code> the URL, <code>await response.json()</code> to parse it, then log <code>data.name</code>.</p>',
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
      },
      {
        id: 'js-objects-properties',
        title: 'Objects & Properties',
        tag: 'JS',
        xp: 25,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Objects</title>\n</head>\n<body>\n\n  <h1>Objects &amp; Properties</h1>\n  <p>Open the console panel to see your output.</p>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\n',
        js: '// An object groups related values under names instead of positions.\n//\n// 1. Create a book object with a title and a page count.\n\n\n// 2. Log just the title, reading it off the object.\n\n\n// 3. Give the book an author, then log the finished object.\n',
        description:
          '<h3>Named values, not numbered ones</h3><p>An array holds values in order; an object holds them under <b>keys</b>. You read a property with dot notation, <code>book.title</code>, or bracket notation, <code>book["title"]</code> — brackets are what you need when the key is held in a variable.</p><p>Create the object, read a property off it, then add or change one, and watch the console.</p>',
        tip: 'Bracket notation takes an expression, so <code>book[key]</code> looks up whatever <code>key</code> currently holds — dot notation would look for a property literally named "key".',
        goals: [
          {
            text: 'Creates an object literal named book',
            check: f => /(const|let|var)\s+book\s*=\s*\{/.test(f.js)
          },
          {
            text: 'Reads a property off the object',
            check: f => /\bbook\s*(\.\s*\w+|\[\s*[^\]]+\])/.test(f.js)
          },
          {
            text: 'Adds or updates a property',
            check: f => /\bbook\s*(\.\s*\w+|\[\s*[^\]]+\])\s*=[^=]/.test(f.js)
          }
        ],
        hints: [
          "An object literal looks like: const book = { title: 'Some Book', pages: 352 };",
          'Reading a property looks like console.log(book.title);',
          "Adding one is just an assignment: book.author = 'Hunt & Thomas'; and assigning to a key that already exists updates it instead."
        ]
      },
      {
        id: 'js-form-validation',
        title: 'Form Validation & Input Events',
        tag: 'JS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Sign Up</title>\n</head>\n<body>\n\n  <h1>Sign Up</h1>\n\n  <form id="signupForm">\n    <label for="email">Email</label>\n    <input type="text" id="email" placeholder="you@example.com">\n    <button type="submit">Join</button>\n  </form>\n\n  <p id="message"></p>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\nform{ display: flex; flex-direction: column; gap: .5rem; max-width: 20rem; }\ninput, button{ padding: .5rem; border-radius: 6px; border: 1px solid #3a3f4b; }\nbutton{ background: #4d8dff; color: #0f1115; border: none; cursor: pointer; }\n#message{ margin-top: 1rem; font-weight: 600; }\n',
        js: "const form = document.getElementById('signupForm');\nconst email = document.getElementById('email');\nconst message = document.getElementById('message');\n\n// Right now this form reloads the page and loses whatever was typed.\n//\n// 1. Listen for the form's submit event.\n// 2. Stop the browser doing its default reload.\n// 3. Read what the user typed, and put a result in the message element.\n",
        description:
          '<h3>Catching a submit before the browser acts</h3><p>Submitting a form navigates the page by default, which throws away anything JavaScript was doing. Listening for the <code>submit</code> event and calling <code>event.preventDefault()</code> hands control to your code instead.</p><p>Validate the email box — reject it when it is empty or missing an <code>@</code> — and write the outcome into the message paragraph.</p>',
        tip: 'Listen on the <b>form</b> rather than the button: a form can also be submitted by pressing Enter in a text field, and a click listener on the button would miss that entirely.',
        goals: [
          {
            text: "Listens for the form's submit event",
            check: f =>
              /addEventListener\(\s*['\"](submit|input)['\"]/.test(
                f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
              )
          },
          {
            text: 'Calls preventDefault() to stop the reload',
            check: f =>
              /preventDefault\s*\(/.test(
                f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
              )
          },
          {
            text: 'Reads the typed value and writes a result into the page',
            check: f => {
              const js = f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
              return /\.value\b/.test(js) && /(textContent|innerText|innerHTML)\s*=[^=]/.test(js);
            }
          }
        ],
        hints: [
          "form.addEventListener('submit', function (event) { ... });",
          'The listener receives the event — call event.preventDefault() first thing inside it.',
          'email.value.trim() gives you the typed text; assign to message.textContent to show a result.'
        ]
      },
      {
        id: 'js-localstorage',
        title: 'LocalStorage Persistence',
        tag: 'JS',
        xp: 30,
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Persistence</title>\n</head>\n<body>\n\n  <h1>Remember me</h1>\n\n  <label for="nameInput">Your name</label>\n  <input type="text" id="nameInput" placeholder="e.g. Ada">\n  <button id="saveBtn">Save</button>\n\n  <p id="output">Nothing saved yet.</p>\n\n</body>\n</html>',
        css: 'body{ font-family: sans-serif; padding: 2rem; }\ninput, button{ padding: .5rem; border-radius: 6px; border: 1px solid #3a3f4b; }\nbutton{ background: #4d8dff; color: #0f1115; border: none; cursor: pointer; }\n#output{ margin-top: 1rem; font-weight: 600; }\n',
        js: "const nameInput = document.getElementById('nameInput');\nconst saveBtn = document.getElementById('saveBtn');\nconst output = document.getElementById('output');\n\n// Everything here is forgotten the moment the preview reloads.\n//\n// 1. When Save is clicked, keep the typed name under a key.\n// 2. On load, look that key up again and show it in the output paragraph.\n\nsaveBtn.addEventListener('click', function () {\n\n});\n",
        description:
          '<h3>Surviving a reload</h3><p><code>localStorage</code> is a small store the browser keeps per site, and it outlives both reloads and closing the tab. <code>localStorage.setItem(key, value)</code> writes, and <code>localStorage.getItem(key)</code> reads back — returning <code>null</code> when the key was never set.</p><p>Save the typed name, then read it back when the page loads so it is still there.</p>',
        tip: 'Everything in localStorage is a string. Objects and arrays need <code>JSON.stringify()</code> going in and <code>JSON.parse()</code> coming out, or you will read back the text "[object Object]".',
        goals: [
          {
            text: 'Saves the typed name with localStorage.setItem()',
            check: f =>
              /localStorage\s*\.\s*setItem\s*\(\s*[^,)]+,\s*[^)]*\.\s*value\b/.test(
                f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
              )
          },
          {
            text: 'Reads it back with localStorage.getItem() using the same key',
            check: f => {
              const js = f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
              // The key can be a string literal or a variable, so compare the written expression
              // with quotes stripped -- 'name', "name" and KEY all compare consistently.
              const norm = s => s.trim().replace(/^['"]|['"]$/g, '');
              const saved = js.match(
                /localStorage\s*\.\s*setItem\s*\(\s*([^,)]+?)\s*,\s*[^)]*\.\s*value\b/
              );
              if (!saved) return false;
              const key = norm(saved[1]);
              return Array.from(
                js.matchAll(/localStorage\s*\.\s*getItem\s*\(\s*([^)]+?)\s*\)/g),
                m => norm(m[1])
              ).includes(key);
            }
          },
          {
            text: 'Shows the value it read back on the page',
            check: f => {
              const js = f.js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
              const norm = s => s.trim().replace(/^['"]|['"]$/g, '');
              const saved = js.match(
                /localStorage\s*\.\s*setItem\s*\(\s*([^,)]+?)\s*,\s*[^)]*\.\s*value\b/
              );
              if (!saved) return false;
              const key = norm(saved[1]);
              // Variables that hold the value read back under that same key.
              const held = Array.from(
                js.matchAll(
                  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*localStorage\s*\.\s*getItem\s*\(\s*([^)]+?)\s*\)/g
                )
              )
                .filter(m => norm(m[2]) === key)
                .map(m => m[1]);
              return Array.from(
                js.matchAll(/(?:textContent|innerText|innerHTML)\s*=\s*([^;\n]+)/g),
                m => m[1]
              ).some(rhs => {
                const direct = rhs.match(/localStorage\s*\.\s*getItem\s*\(\s*([^)]+?)\s*\)/);
                if (direct && norm(direct[1]) === key) return true;
                return held.some(name => new RegExp('\\b' + name + '\\b').test(rhs));
              });
            }
          }
        ],
        hints: [
          "Inside the click handler: localStorage.setItem('name', nameInput.value);",
          "Outside the handler, run localStorage.getItem('name') once when the script loads.",
          'getItem returns null if nothing was stored, so check before writing it into output.textContent.'
        ]
      }
    ]
  }
];

var FLAT_LESSONS = CURRICULUM.flatMap(c => c.items);
