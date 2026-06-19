/* ═══════════════════════════════════════════════════════════════
   DevForge — curriculum.js
   All lesson content: HTML, CSS, JavaScript chapters
   Each lesson has: id, tag, title, xp, instruction HTML,
   and starter code for html / css / js tabs.
═══════════════════════════════════════════════════════════════ */

const CURRICULUM = [

  /* ══════════════════════════════════════════
     CHAPTER 1 — HTML FOUNDATIONS
  ══════════════════════════════════════════ */
  {
    chapter: "HTML Foundations",
    lessons: [

      {
        id: "html-01",
        tag: "HTML",
        title: "Your First Element",
        xp: 20,
        paneTitle: "01 · Your First Element",
        instruction: `
          <h2>What is an HTML element?</h2>
          <p>HTML describes the <em>structure</em> of a webpage. Every piece of content lives
          inside an <code>element</code> — made of an opening tag, content, and a closing tag.</p>
          <p>Try changing the text inside <code>&lt;h1&gt;</code> to your name, then click
          <strong>Run</strong>.</p>
          <div class="hint-box">
            💡 Tags come in pairs: <code>&lt;tag&gt;</code>…<code>&lt;/tag&gt;</code>.
            The <code>&lt;p&gt;</code> tag creates a paragraph.
          </div>`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Hello World</title>
</head>
<body>

  <h1>Hello, World!</h1>
  <p>My first webpage.</p>
  <p>HTML stands for HyperText Markup Language.</p>

</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 24px;
  background: #f0f4f8;
  color: #333;
}

h1 {
  color: #1a73e8;
}`,
        js: `console.log("Page loaded successfully!");`
      },

      {
        id: "html-02",
        tag: "HTML",
        title: "Headings & Paragraphs",
        xp: 20,
        paneTitle: "02 · Headings & Paragraphs",
        instruction: `
          <h2>Hierarchy with headings</h2>
          <p>HTML has six heading levels: <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>.
          Use them to create document hierarchy — <code>h1</code> for the main title,
          <code>h2</code> for sections, and so on.</p>
          <p>Use <code>&lt;strong&gt;</code> for bold and <code>&lt;em&gt;</code> for italic inline text.</p>
          <div class="hint-box">
            💡 Add an <code>&lt;h3&gt;</code> subtitle below the h2 and fill it with text.
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add a <code>&lt;blockquote&gt;</code> with your favourite quote!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>

  <h1>My Blog</h1>

  <h2>About Me</h2>
  <p>I'm learning web development. Every day I get <strong>better</strong>.</p>

  <h2>My Goals</h2>
  <p>Master <em>HTML</em>, <em>CSS</em>, and <em>JavaScript</em> this year.</p>

</body>
</html>`,
        css: `body {
  font-family: Georgia, serif;
  padding: 30px;
  max-width: 640px;
  margin: auto;
  line-height: 1.7;
  color: #222;
}

h1 {
  border-bottom: 2px solid #333;
  padding-bottom: 8px;
}

h2 {
  color: #555;
  margin-top: 24px;
}

blockquote {
  border-left: 4px solid #ccc;
  margin-left: 0;
  padding-left: 16px;
  color: #666;
  font-style: italic;
}`,
        js: ``
      },

      {
        id: "html-03",
        tag: "HTML",
        title: "Lists & Links",
        xp: 20,
        paneTitle: "03 · Lists & Links",
        instruction: `
          <h2>Organise content with lists</h2>
          <p>Use <code>&lt;ul&gt;</code> for unordered (bullet) and <code>&lt;ol&gt;</code>
          for ordered (numbered) lists. Each item goes in <code>&lt;li&gt;</code>.</p>
          <p>Links use <code>&lt;a href="URL"&gt;</code>.
          The <code>target="_blank"</code> attribute opens in a new tab.</p>
          <div class="hint-box">
            💡 Add a new <code>&lt;li&gt;</code> with your favourite website!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>

  <h1>My Favourite Sites</h1>

  <ul>
    <li><a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a></li>
    <li><a href="https://css-tricks.com" target="_blank">CSS Tricks</a></li>
    <li><a href="https://javascript.info" target="_blank">JavaScript.info</a></li>
  </ul>

  <h2>My Learning Steps</h2>
  <ol>
    <li>Learn HTML structure</li>
    <li>Style with CSS</li>
    <li>Add behaviour with JS</li>
  </ol>

</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 24px;
}

a {
  color: steelblue;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

li {
  margin: 7px 0;
}`,
        js: ``
      },

      {
        id: "html-04",
        tag: "HTML",
        title: "Images & Attributes",
        xp: 20,
        paneTitle: "04 · Images & Attributes",
        instruction: `
          <h2>Embedding images</h2>
          <p>The <code>&lt;img&gt;</code> tag is self-closing — no closing tag needed.
          It requires <code>src</code> (image URL) and <code>alt</code> (accessible description).</p>
          <p>Wrap it in <code>&lt;figure&gt;</code> and add a <code>&lt;figcaption&gt;</code>
          for a proper captioned image.</p>
          <div class="hint-box">
            💡 Change the seed number in the URL (e.g. <code>/seed/99/600/280</code>)
            for a different photo!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add a second <code>&lt;figure&gt;</code> with a different seed and caption.
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>

  <h1>Photo Gallery</h1>

  <figure>
    <img
      src="https://picsum.photos/seed/devforge/600/280"
      alt="A scenic landscape"
      width="100%"
    />
    <figcaption>A beautiful random photo from Lorem Picsum</figcaption>
  </figure>

</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 20px;
  max-width: 640px;
  margin: auto;
}

img {
  border-radius: 10px;
  display: block;
  width: 100%;
}

figure {
  margin: 0 0 20px;
}

figcaption {
  text-align: center;
  color: #888;
  font-size: .85rem;
  margin-top: 6px;
}`,
        js: ``
      },

      {
        id: "html-05",
        tag: "HTML",
        title: "Forms & Inputs",
        xp: 30,
        paneTitle: "05 · Forms & Inputs",
        instruction: `
          <h2>Collecting user input</h2>
          <p>Forms let users send data. The <code>type</code> attribute on
          <code>&lt;input&gt;</code> changes the field: <code>text</code>,
          <code>email</code>, <code>password</code>, <code>checkbox</code>…</p>
          <p>Always pair inputs with <code>&lt;label for="id"&gt;</code> for accessibility.</p>
          <div class="hint-box">
            💡 Add a <code>&lt;select&gt;</code> dropdown with 3 country options!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add a <code>&lt;textarea&gt;</code> for a bio field.
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>

  <h2>Sign Up</h2>
  <form>

    <div class="field">
      <label for="name">Full Name</label>
      <input type="text" id="name" placeholder="Your name" />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="you@example.com" />
    </div>

    <div class="field">
      <label for="pass">Password</label>
      <input type="password" id="pass" placeholder="Min 8 characters" />
    </div>

    <div class="field">
      <label>
        <input type="checkbox" /> I agree to the terms
      </label>
    </div>

    <button type="submit">Create Account</button>

  </form>

</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 28px;
  max-width: 380px;
  background: #f8f9fa;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.field {
  margin-bottom: 14px;
}

label {
  display: block;
  font-size: .85rem;
  color: #555;
  margin-bottom: 4px;
}

input[type=text],
input[type=email],
input[type=password] {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: .9rem;
  outline: none;
  transition: border-color .2s;
}

input:focus {
  border-color: steelblue;
}

button {
  width: 100%;
  padding: 11px;
  background: steelblue;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: .95rem;
  cursor: pointer;
}

button:hover {
  background: #2566a8;
}`,
        js: ``
      }

    ] /* end HTML lessons */
  },


  /* ══════════════════════════════════════════
     CHAPTER 2 — CSS STYLING
  ══════════════════════════════════════════ */
  {
    chapter: "CSS Styling",
    lessons: [

      {
        id: "css-01",
        tag: "CSS",
        title: "Selectors & Specificity",
        xp: 25,
        paneTitle: "01 · Selectors & Specificity",
        instruction: `
          <h2>Targeting elements with CSS</h2>
          <p>CSS rules have a <em>selector</em> and <em>declarations</em>.
          Selectors target by tag (<code>h1</code>), class (<code>.intro</code>),
          ID (<code>#hero</code>), or combinations (<code>ul li</code>).</p>
          <p><strong>Specificity</strong> determines which rule wins. IDs beat classes, classes beat tags.</p>
          <div class="hint-box">
            💡 Add a <code>.highlight</code> class to one <code>&lt;li&gt;</code>
            and style it in the CSS tab!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h1 id="hero">Style Me!</h1>
  <p class="intro">This paragraph has the <code>intro</code> class.</p>
  <ul>
    <li>Item one</li>
    <li class="special">Item two (special)</li>
    <li>Item three</li>
  </ul>
</body>
</html>`,
        css: `/* Tag selector */
h1 {
  color: tomato;
  font-size: 2rem;
}

/* Class selector */
.intro {
  font-style: italic;
  color: #555;
  font-size: 1.05rem;
}

/* ID selector — highest specificity */
#hero {
  text-shadow: 2px 2px 0 rgba(255, 99, 71, .2);
}

/* Descendant selector */
ul li {
  margin: 6px 0;
}

/* Class + tag combo */
li.special {
  color: steelblue;
  font-weight: bold;
  list-style-type: "★ ";
}`,
        js: ``
      },

      {
        id: "css-02",
        tag: "CSS",
        title: "The Box Model",
        xp: 25,
        paneTitle: "02 · The Box Model",
        instruction: `
          <h2>Every element is a box</h2>
          <p>Each element has layers: <code>content</code> → <code>padding</code>
          (inner space) → <code>border</code> → <code>margin</code> (outer space).</p>
          <p>Use <code>box-sizing: border-box</code> so padding and border are
          included in the element's width — almost everyone does this!</p>
          <div class="hint-box">
            💡 Change <code>padding</code> on <code>.box</code> from
            <code>20px</code> to <code>40px</code> — watch it grow!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add a <code>box-shadow</code> property:
            <code>4px 4px 12px rgba(0,0,0,.2)</code>
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2>Box Model Demo</h2>
  <div class="box">Content inside the box</div>
  <div class="box highlight">Another box — different border</div>
  <div class="box thin">Thin padding box</div>
</body>
</html>`,
        css: `*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  padding: 30px;
  background: #e8ecef;
}

h2 {
  margin-bottom: 20px;
}

.box {
  width: 260px;
  padding: 20px;
  border: 3px solid steelblue;
  margin: 14px 0;
  background: white;
  border-radius: 6px;
}

.highlight {
  border-color: tomato;
  background: #fff5f5;
}

.thin {
  padding: 8px 20px;
  border-style: dashed;
  border-color: #aaa;
  color: #888;
}`,
        js: ``
      },

      {
        id: "css-03",
        tag: "CSS",
        title: "Flexbox Layout",
        xp: 30,
        paneTitle: "03 · Flexbox Layout",
        instruction: `
          <h2>One-dimensional layouts</h2>
          <p><code>display: flex</code> turns a container into a flex container.
          Children become flex items that lay out in a row (default) or column.</p>
          <p>Key properties: <code>justify-content</code> (main axis),
          <code>align-items</code> (cross axis), <code>gap</code>, <code>flex-wrap</code>.</p>
          <div class="hint-box">
            💡 Change <code>justify-content</code> to <code>center</code>,
            <code>space-around</code>, or <code>space-evenly</code>.
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add <code>flex-direction: column</code> to the container!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2>Flex Container</h2>
  <div class="container">
    <div class="card">🏠 Home</div>
    <div class="card">📖 Learn</div>
    <div class="card">🛠 Build</div>
    <div class="card">🚀 Deploy</div>
  </div>

  <h2 style="margin-top:24px">Centered Hero</h2>
  <div class="hero">
    <div class="hero-content">
      <h3>Flex Magic</h3>
      <p>Perfectly centered with flexbox</p>
    </div>
  </div>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 20px;
  background: #0f0e17;
  color: #fffffe;
}

h2 {
  color: #ff8906;
  margin-bottom: 12px;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 100px;
  padding: 20px;
  background: #1a1a2e;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #333;
  font-weight: bold;
  transition: transform .2s;
}

.card:hover {
  transform: translateY(-4px);
}

.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 10px;
  border: 1px solid #0f3460;
}

.hero-content {
  text-align: center;
}

.hero-content h3 {
  color: #ff8906;
  margin-bottom: 4px;
}

.hero-content p {
  color: #a7a9be;
  font-size: .85rem;
}`,
        js: ``
      },

      {
        id: "css-04",
        tag: "CSS",
        title: "CSS Grid",
        xp: 30,
        paneTitle: "04 · CSS Grid",
        instruction: `
          <h2>Two-dimensional layouts</h2>
          <p>CSS Grid lets you define rows <em>and</em> columns simultaneously.
          <code>grid-template-columns: repeat(3, 1fr)</code> creates three equal columns.
          <code>fr</code> is a fractional unit.</p>
          <p>Use <code>grid-column: span 2</code> to stretch an item across multiple columns.</p>
          <div class="hint-box">
            💡 Change <code>repeat(3, 1fr)</code> to <code>repeat(4, 1fr)</code>
            for a 4-column grid!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <div class="grid">
    <div class="item hero">Hero Banner</div>
    <div class="item sidebar">Sidebar</div>
    <div class="item main">Main Content</div>
    <div class="item">Card A</div>
    <div class="item">Card B</div>
    <div class="item footer">Footer</div>
  </div>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 16px;
  background: #0f0f0f;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  min-height: calc(100vh - 32px);
}

.item {
  padding: 20px;
  background: #1e1e1e;
  color: #eee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 1px solid #2a2a2a;
}

.hero    { grid-column: span 3; background: #1a3a5c; color: #58A6FF; font-size: 1.2rem; }
.sidebar { grid-row: span 2; background: #1e1e2e; }
.main    { grid-column: span 2; background: #1a2e1a; color: #3fb950; }
.footer  { grid-column: span 3; background: #2a1a1a; color: #f85149; }`,
        js: ``
      },

      {
        id: "css-05",
        tag: "CSS",
        title: "Transitions & Animations",
        xp: 35,
        paneTitle: "05 · Transitions & Animations",
        instruction: `
          <h2>Bringing CSS to life</h2>
          <p><code>transition</code> smoothly animates property changes on state changes
          (like <code>:hover</code>).</p>
          <p><code>@keyframes</code> lets you define complex multi-step animations,
          applied with the <code>animation</code> property.</p>
          <div class="hint-box">
            💡 Change the <code>animation-duration</code> on <code>.spinner</code>
            or add <code>animation-delay</code> to the cards!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Create a <code>@keyframes shake</code> animation
            and apply it to the button on <code>:active</code>!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2>CSS Animations</h2>

  <div class="cards">
    <div class="card">Hover me!</div>
    <div class="card delay">Delayed float</div>
    <div class="card pulse">Pulsing</div>
  </div>

  <div class="spinner-wrap">
    <div class="spinner"></div>
    <p>Loading spinner</p>
  </div>

  <button class="btn">Click me!</button>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 24px;
  background: #0d1117;
  color: #e6edf3;
}

h2 {
  margin-bottom: 16px;
  color: #58a6ff;
}

.cards {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.card {
  padding: 20px 28px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  cursor: pointer;
  transition: all .3s cubic-bezier(.34, 1.56, .64, 1);
  font-weight: 600;
}

.card:hover {
  transform: translateY(-8px) scale(1.05);
  background: #1c2128;
  border-color: #58a6ff;
  box-shadow: 0 12px 32px rgba(88, 166, 255, .2);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

.pulse { animation: float 2s ease-in-out infinite; }
.delay { animation: float 2s ease-in-out .5s infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #30363d;
  border-top-color: #58a6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn {
  padding: 12px 28px;
  border-radius: 8px;
  border: none;
  background: #58a6ff;
  color: #0d1117;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
}

.btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(88,166,255,.35); }
.btn:active { transform: scale(.97); }`,
        js: ``
      }

    ] /* end CSS lessons */
  },


  /* ══════════════════════════════════════════
     CHAPTER 3 — JAVASCRIPT
  ══════════════════════════════════════════ */
  {
    chapter: "JavaScript",
    lessons: [

      {
        id: "js-01",
        tag: "JS",
        title: "Variables & Types",
        xp: 25,
        paneTitle: "01 · Variables & Types",
        instruction: `
          <h2>Storing data in variables</h2>
          <p>Use <code>const</code> for values that won't change, <code>let</code>
          for values that will. JS has types: <em>string</em>, <em>number</em>,
          <em>boolean</em>, <em>null</em>, <em>undefined</em>, <em>object</em>, <em>array</em>.</p>
          <p>Template literals (backticks) let you embed variables: <code>\`Hello \${name}\`</code></p>
          <div class="hint-box">
            💡 Open the Console panel at the bottom to see <code>console.log()</code> output!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2 id="output">Open the console!</h2>
  <pre id="info"></pre>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 28px;
  background: #fafafa;
}

h2 {
  color: #333;
  margin-bottom: 12px;
}

#info {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 14px;
  border-radius: 8px;
  font-size: .85rem;
  line-height: 1.7;
}`,
        js: `// const — value never reassigned
const siteName = "DevForge";
const year = 2025;
const isAwesome = true;

// let — value can change
let score = 0;
score = score + 10;

// Template literals (backticks)
const message = \`Welcome to \${siteName}! Year: \${year}\`;

console.log(message);
console.log("Score:", score);
console.log("Awesome?", isAwesome);
console.log("Type of year:", typeof year);
console.log("Type of siteName:", typeof siteName);

// Show on page
document.getElementById("output").textContent = message;
document.getElementById("info").textContent =
  \`score       = \${score}
isAwesome   = \${isAwesome}
typeof year = "\${typeof year}"\`;`
      },

      {
        id: "js-02",
        tag: "JS",
        title: "Functions",
        xp: 25,
        paneTitle: "02 · Functions",
        instruction: `
          <h2>Reusable blocks of code</h2>
          <p>Functions group code you want to reuse. Three ways to write them:
          function declaration, function expression, and the modern
          <em>arrow function</em> (<code>=&gt;</code>).</p>
          <p>Functions can accept <em>parameters</em> and <code>return</code> a value.</p>
          <div class="hint-box">
            💡 Add a new <code>multiply(a, b)</code> arrow function and call it!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Write a <code>clamp(val, min, max)</code> function
            that constrains a number to a range.
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2>Function Explorer</h2>
  <div id="output"></div>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 28px;
  background: #0d1117;
  color: #e6edf3;
}

h2 {
  color: #58a6ff;
  margin-bottom: 16px;
}

#output {
  background: #161b22;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #30363d;
  font-family: monospace;
  line-height: 2;
}`,
        js: `// 1. Function declaration
function greet(name) {
  return \`Hello, \${name}!\`;
}

// 2. Function expression
const square = function(n) {
  return n * n;
};

// 3. Arrow function (concise, modern)
const add = (a, b) => a + b;

// Functions calling other functions
const hypotenuse = (a, b) => Math.sqrt(square(a) + square(b));

// Helper to display results
const out = document.getElementById("output");
function log(label, val) {
  const div = document.createElement("div");
  div.innerHTML = \`<span style="color:#8b949e">\${label}: </span>
                   <span style="color:#d2a8ff">\${val}</span>\`;
  out.appendChild(div);
}

log("greet('World')",    greet("World"));
log("square(7)",         square(7));
log("add(10, 5)",        add(10, 5));
log("hypotenuse(3, 4)",  hypotenuse(3, 4));`
      },

      {
        id: "js-03",
        tag: "JS",
        title: "Arrays & Loops",
        xp: 30,
        paneTitle: "03 · Arrays & Loops",
        instruction: `
          <h2>Collections of data</h2>
          <p>Arrays store ordered lists. Powerful array methods: <code>map()</code> transforms,
          <code>filter()</code> selects, <code>reduce()</code> accumulates,
          <code>forEach()</code> iterates.</p>
          <div class="hint-box">
            💡 Try <code>fruits.filter(f => f.includes("🍌"))</code> to filter the array!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Sort the fruits alphabetically using <code>.sort()</code>
            and re-render the list!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h2>Fruit Explorer</h2>
  <div id="list"></div>
  <div id="stats"></div>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 24px;
}

h2 {
  margin-bottom: 12px;
}

.fruit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 6px 0;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #eee;
}

.fruit-idx  { color: #aaa; width: 20px; text-align: right; font-size: .8rem; }
.fruit-name { flex: 1; font-weight: 500; }
.fruit-len  { font-size: .75rem; color: #bbb; background: #eee; padding: 2px 7px; border-radius: 10px; }

#stats {
  margin-top: 12px;
  font-size: .82rem;
  color: #888;
}`,
        js: `const fruits = [
  "🍎 Apple", "🍌 Banana", "🍇 Grape",
  "🍓 Strawberry", "🥭 Mango", "🍊 Orange"
];

// map — transform each item
const upper = fruits.map(f => f.toUpperCase());
console.log("Mapped (first 2):", upper.slice(0, 2));

// filter — pick matching items
const longNames = fruits.filter(f => f.length > 8);
console.log("Long names:", longNames);

// reduce — accumulate a value
const totalChars = fruits.reduce((sum, f) => sum + f.length, 0);
console.log("Total characters:", totalChars);

// Render list using forEach
const list = document.getElementById("list");
fruits.forEach((fruit, i) => {
  const div = document.createElement("div");
  div.className = "fruit-item";
  div.innerHTML = \`
    <span class="fruit-idx">\${i + 1}</span>
    <span class="fruit-name">\${fruit}</span>
    <span class="fruit-len">\${fruit.length} chars</span>
  \`;
  list.appendChild(div);
});

document.getElementById("stats").textContent =
  \`\${fruits.length} fruits · \${totalChars} total chars · \${longNames.length} with long names\`;`
      },

      {
        id: "js-04",
        tag: "JS",
        title: "DOM Manipulation",
        xp: 30,
        paneTitle: "04 · DOM Manipulation",
        instruction: `
          <h2>Making pages interactive</h2>
          <p>The DOM (Document Object Model) is the tree of HTML elements.
          Use <code>document.querySelector()</code> to select elements, then change
          <code>textContent</code>, <code>style</code>, <code>classList</code>, or innerHTML.</p>
          <p>Listen for events with <code>addEventListener()</code>.</p>
          <div class="hint-box">
            💡 Try listening for <code>"dblclick"</code> to do something different on double-click!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <h1 id="title">Click the button!</h1>

  <div class="btn-row">
    <button id="colorBtn">Change Color</button>
    <button id="sizeBtn">Toggle Size</button>
    <button id="addBtn">Add Item</button>
  </div>

  <p id="counter">Clicks: 0</p>
  <ul id="itemList"></ul>
</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 28px;
  text-align: center;
}

#title {
  transition: all .3s;
}

.btn-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  font-size: .9rem;
  border-radius: 8px;
  border: none;
  background: steelblue;
  color: white;
  cursor: pointer;
  transition: all .2s;
}

button:hover {
  opacity: .85;
  transform: translateY(-1px);
}

#counter {
  color: #888;
  font-size: .85rem;
}

#itemList {
  list-style: none;
  padding: 0;
  margin-top: 12px;
  display: inline-block;
  text-align: left;
}

#itemList li {
  padding: 6px 14px;
  background: #f0f4ff;
  border-radius: 5px;
  margin: 4px 0;
  border-left: 3px solid steelblue;
}`,
        js: `const colors = ["#e63946","#457b9d","#2a9d8f","#e9c46a","#6a4c93","#f4a261"];
let clicks  = 0;
let big     = false;
let itemNum = 1;

const title   = document.querySelector("#title");
const counter = document.querySelector("#counter");
const list    = document.querySelector("#itemList");

document.querySelector("#colorBtn").addEventListener("click", () => {
  clicks++;
  const color = colors[clicks % colors.length];
  title.style.color = color;
  counter.textContent = \`Clicks: \${clicks}\`;
  title.textContent = "You clicked! 🎉";
});

document.querySelector("#sizeBtn").addEventListener("click", () => {
  big = !big;
  title.style.fontSize    = big ? "3rem" : "2rem";
  title.style.letterSpacing = big ? "3px" : "0";
});

document.querySelector("#addBtn").addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = \`Item #\${itemNum++} added at \${new Date().toLocaleTimeString()}\`;
  list.appendChild(li);
});`
      },

      {
        id: "js-05",
        tag: "JS",
        title: "Fetch & Async/Await",
        xp: 40,
        paneTitle: "05 · Fetch & Async/Await",
        instruction: `
          <h2>Talking to the internet</h2>
          <p>The <code>fetch()</code> API loads data from URLs. Because it takes time,
          it's <em>asynchronous</em>. Use <code>async/await</code> to write async code
          that reads like synchronous code.</p>
          <p>Always wrap async code in <code>try/catch</code> to handle errors!</p>
          <div class="hint-box">
            💡 The app fetches real data from public APIs. Click the Refresh buttons!
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Add a loading skeleton while the fetch is in progress!
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>

  <div class="card">
    <div class="card-head">🐕 Random Dog Fact</div>
    <p id="fact">Loading…</p>
    <button id="refreshFact">🔄 New Fact</button>
  </div>

  <div class="card" style="margin-top:12px">
    <div class="card-head">👤 Random User</div>
    <div id="user" class="user-card">Loading…</div>
    <button id="refreshUser">🔄 New User</button>
  </div>

</body>
</html>`,
        css: `body {
  font-family: sans-serif;
  padding: 20px;
  background: #f0f4f8;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
}

.card-head {
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  font-size: 1.05rem;
}

#fact {
  color: #555;
  line-height: 1.6;
  min-height: 40px;
}

button {
  margin-top: 12px;
  padding: 8px 16px;
  background: steelblue;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity .2s;
}

button:hover { opacity: .85; }

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-card img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
}

.user-info p        { margin: 2px 0; color: #555; font-size: .85rem; }
.user-info strong   { color: #222; }`,
        js: `async function loadFact() {
  const el = document.getElementById("fact");
  el.textContent = "Loading…";
  try {
    const res  = await fetch("https://dogapi.dog/api/v2/facts?limit=1");
    const data = await res.json();
    el.textContent = data.data[0].attributes.body;
  } catch (err) {
    el.textContent = "Failed to load. Check your connection!";
    console.error("Fetch error:", err);
  }
}

async function loadUser() {
  const el = document.getElementById("user");
  el.innerHTML = "Loading…";
  try {
    const res  = await fetch("https://randomuser.me/api/");
    const data = await res.json();
    const u = data.results[0];
    el.innerHTML = \`
      <img src="\${u.picture.thumbnail}" alt="avatar"/>
      <div class="user-info">
        <strong>\${u.name.first} \${u.name.last}</strong>
        <p>📍 \${u.location.city}, \${u.location.country}</p>
        <p>✉️ \${u.email}</p>
      </div>\`;
  } catch (err) {
    el.textContent = "Could not load user.";
    console.error(err);
  }
}

document.getElementById("refreshFact").addEventListener("click", loadFact);
document.getElementById("refreshUser").addEventListener("click", loadUser);

// Load on start
loadFact();
loadUser();`
      },

      {
        id: "js-06",
        tag: "JS",
        title: "Build a Todo App",
        xp: 50,
        paneTitle: "06 · Build a Todo App",
        instruction: `
          <h2>Putting it all together</h2>
          <p>This final lesson combines HTML, CSS, and JavaScript to build a complete
          <em>Todo App</em>. Every concept from previous lessons is used here —
          DOM manipulation, events, arrays, and functions.</p>
          <p>Read through the code carefully, then start experimenting!</p>
          <div class="hint-box">
            💡 Try adding a "Clear all completed" button.
          </div>
          <div class="challenge-box">
            ⚔ Challenge: Save todos to <code>localStorage</code> so they survive a page refresh!
            Use <code>JSON.stringify</code> and <code>JSON.parse</code>.
          </div>`,
        html: `<!DOCTYPE html>
<html>
<body>
  <div class="app">

    <h1>✅ My Todos</h1>

    <div class="input-row">
      <input type="text" id="todoInput" placeholder="What needs to be done?" />
      <button id="addBtn">Add</button>
    </div>

    <ul id="todoList"></ul>

    <div id="footer" class="footer" style="display:none">
      <span id="remaining"></span>
      <button id="clearBtn">Clear completed</button>
    </div>

  </div>
</body>
</html>`,
        css: `*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px;
}

.app {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, .08);
}

h1 {
  font-size: 1.4rem;
  color: #1f2937;
  margin-bottom: 18px;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

input[type=text] {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: .95rem;
  outline: none;
  transition: border-color .2s;
}

input[type=text]:focus { border-color: #6366f1; }

#addBtn {
  padding: 10px 18px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: .9rem;
  cursor: pointer;
}

#addBtn:hover { background: #4f46e5; }

#todoList { list-style: none; }

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #f3f4f6;
  animation: slideIn .2s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
}

.todo-item input[type=checkbox] {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}

.todo-label {
  flex: 1;
  font-size: .92rem;
  color: #374151;
  cursor: pointer;
  transition: color .2s;
}

.todo-item.done .todo-label {
  text-decoration: line-through;
  color: #9ca3af;
}

.del-btn {
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all .15s;
}

.del-btn:hover { color: #ef4444; background: #fee2e2; }

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}

#remaining { font-size: .8rem; color: #9ca3af; }

#clearBtn {
  font-size: .78rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

#clearBtn:hover { background: #f3f4f6; color: #374151; }`,
        js: `let todos  = [];
let nextId = 1;

const input     = document.getElementById("todoInput");
const addBtn    = document.getElementById("addBtn");
const list      = document.getElementById("todoList");
const footer    = document.getElementById("footer");
const remaining = document.getElementById("remaining");
const clearBtn  = document.getElementById("clearBtn");

// ── Render all todos ──
function render() {
  list.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.innerHTML = \`
      <input type="checkbox" \${todo.done ? "checked" : ""} data-id="\${todo.id}"/>
      <label class="todo-label">\${escHtml(todo.text)}</label>
      <button class="del-btn" data-id="\${todo.id}">✕</button>
    \`;
    list.appendChild(li);
  });

  const left = todos.filter(t => !t.done).length;
  remaining.textContent = \`\${left} item\${left !== 1 ? "s" : ""} left\`;
  footer.style.display = todos.length ? "flex" : "none";
}

// ── Add a todo ──
function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: nextId++, text, done: false });
  input.value = "";
  render();
}

// ── Escape HTML to prevent XSS ──
function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Event listeners ──
addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });

list.addEventListener("change", e => {
  if (e.target.type !== "checkbox") return;
  const id   = Number(e.target.dataset.id);
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.done = !todo.done; render(); }
});

list.addEventListener("click", e => {
  if (!e.target.classList.contains("del-btn")) return;
  todos = todos.filter(t => t.id !== Number(e.target.dataset.id));
  render();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.done);
  render();
});

// ── Start with sample data ──
todos = [
  { id: nextId++, text: "Learn HTML",           done: true  },
  { id: nextId++, text: "Style with CSS",        done: false },
  { id: nextId++, text: "Add JavaScript logic",  done: false }
];
render();`
      }

    ] /* end JS lessons */
  }

]; /* end CURRICULUM */
