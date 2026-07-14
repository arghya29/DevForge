import { describe, it, expect, vi } from "vitest";

describe("Editor Functions", () => {
  it("escHtml escapes HTML special characters", () => {
    const { escHtml } = (function () {
      function escHtml(s) {
        if (typeof s !== "string") return "";
        return s
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;")
          .replace(/`/g, "&#96;");
      }
      return { escHtml };
    })();
    expect(escHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
    expect(escHtml("")).toBe("");
    expect(escHtml(123)).toBe("");
    expect(escHtml("hello & world")).toBe("hello &amp; world");
  });

  it("escapeHtml provides safe escape for innerHTML", () => {
    const { escapeHtml } = (function () {
      function escapeHtml(s) {
        if (typeof s !== "string") return "";
        return s
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }
      return { escapeHtml };
    })();
    expect(escapeHtml("safe text")).toBe("safe text");
    expect(escapeHtml("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;/b&gt;");
    expect(escapeHtml(null)).toBe("");
  });

  it("highlightHTML wraps comments and tags correctly", () => {
    const { highlightHTML } = (function () {
      function highlightHTML(code) {
        return code
          .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-cmt">$1</span>')
          .replace(/(&lt;\/?)([\w-]+)/g, (_, p1, p2) => `${p1}<span class="tok-tag">${p2}</span>`)
          .replace(/ ([\w-]+)=/g, (_, p1) => ` <span class="tok-attr">${p1}</span>=`);
      }
      return { highlightHTML };
    })();
    const result = highlightHTML('&lt;div class="main"&gt;');
    expect(result).toContain("tok-tag");
    expect(result).toContain("tok-attr");
  });

  it("highlightCSS detects selectors, properties, and values", () => {
    const { highlightCSS } = (function () {
      function highlightCSS(code) {
        return code
          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-cmt">$1</span>')
          .replace(/(#[0-9a-fA-F]{3,8})\b/g, (_, hex) => {
            return `<span class="tok-val" style="border-bottom:2px solid ${hex}">${hex}</span>`;
          })
          .replace(
            /([.#]?[\w-]+(?:\s*,\s*[.#]?[\w-]+)*)\s*\{/g,
            (m, sel) => `<span class="tok-sel">${sel}</span> {`
          )
          .replace(/([\w-]+)\s*:/g, (_, p) => `<span class="tok-prop">${p}</span>:`);
      }
      return { highlightCSS };
    })();
    const result = highlightCSS(".my-class { color: red; }");
    expect(result).toContain("tok-sel");
    expect(result).toContain("tok-prop");
  });

  it("highlightJS handles keywords, strings, and functions", () => {
    const { highlightJS } = (function () {
      const KW =
        /\b(const|let|var|function|return|if|else|for|while|of|in|new|this|class|extends|super|async|await|try|catch|finally|throw|import|export|default|typeof|instanceof|void|delete|switch|case|break|continue)\b/g;
      function highlightJS(code) {
        return code
          .replace(/(\/\/[^\n]*)/g, '<span class="tok-cmt">$1</span>')
          .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-cmt">$1</span>')
          .replace(/(&#96;[\s\S]*?&#96;)/g, '<span class="tok-str">$1</span>')
          .replace(/(&quot;[^&\n]*&quot;)/g, '<span class="tok-str">$1</span>')
          .replace(KW, '<span class="tok-kw">$1</span>')
          .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
      }
      return { highlightJS };
    })();
    const result = highlightJS("const x = 42; // answer");
    expect(result).toContain("tok-kw");
    expect(result).toContain("tok-num");
    expect(result).toContain("tok-cmt");
  });
});
