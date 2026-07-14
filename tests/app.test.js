import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import fs from "fs";
import path from "path";

// Mock LZString to avoid remote dependency
global.LZString = {
  compressToEncodedURIComponent: str => btoa(unescape(encodeURIComponent(str))),
  decompressFromEncodedURIComponent: str => decodeURIComponent(escape(atob(str))),
};

// Mock serviceWorker on read-only navigator object
Object.defineProperty(window.navigator, "serviceWorker", {
  value: {
    register: () => Promise.resolve({}),
  },
  configurable: true,
});

// Mock Clipboard
global.navigator.clipboard = {
  writeText: vi.fn().mockImplementation(() => Promise.resolve()),
};

// Mock alert/confirm if used
global.alert = vi.fn();
global.confirm = vi.fn().mockReturnValue(true);

describe("DevForge Core App Tests", () => {
  let htmlContent;

  beforeAll(() => {
    htmlContent = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");
  });

  beforeEach(() => {
    // Strip script tags so JSDOM doesn't execute them automatically on innerHTML write
    const cleanHtml = htmlContent.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    // Reset DOM
    document.documentElement.innerHTML = cleanHtml;

    // We need to define some standard CSS properties for computed style to avoid storage.js failing
    vi.spyOn(window, "getComputedStyle").mockImplementation(() => ({
      getPropertyValue: prop => {
        if (prop === "--fs") return "16px";
        return "";
      },
    }));

    // Mock Element.prototype.scrollIntoView as JSDOM does not implement it
    window.Element.prototype.scrollIntoView = vi.fn();

    // Reset module/global variables by re-loading scripts as a single concatenated script wrapped in a Function
    const files = [
      "curriculum.js",
      "storage.js",
      "analytics.js",
      "achievements.js",
      "ui.js",
      "editor.js",
      "lesson.js",
      "preview.js",
      "commands.js",
      "a11y.js",
      "perf.js",
      "snippet.js",
      "export.js",
      "layout.js",
      "app.js",
    ];

    let combinedCode = files
      .map(file => fs.readFileSync(path.resolve(__dirname, "../", file), "utf-8"))
      .join("\n;\n");

    // Append variable exposure to window at the end
    combinedCode += `
      Object.defineProperty(window, "xp", {
        get: () => xp,
        set: (val) => { xp = val; },
        configurable: true
      });
      Object.defineProperty(window, "streak", {
        get: () => streak,
        set: (val) => { streak = val; },
        configurable: true
      });
      window.doneSet = doneSet;
      window.buffers = buffers;
      window.revealedHints = revealedHints;
      window.loadProgress = loadProgress;
      window.saveProgress = saveProgress;
      window.checkGoalRule = checkGoalRule;
      window.generateSnapshot = generateSnapshot;
    `;

    // Run the code directly in the test's window context
    const fn = new Function("window", combinedCode);
    fn(window);

    window.localStorage.clear();
  });

  it("should initialize default state correctly", () => {
    expect(window.xp).toBe(0);
    expect(window.streak).toBe(0);
    expect(window.doneSet.size).toBe(0);
  });

  describe("Storage Operations", () => {
    it("should save and load progress successfully", () => {
      window.xp = 100;
      window.streak = 5;
      window.doneSet.add("html-01");
      window.buffers["html-01"] = { html: "<h1>Test</h1>", css: "", js: "" };

      window.saveProgress();

      // Clear in-memory state
      window.xp = 0;
      window.streak = 0;
      window.doneSet.clear();

      window.loadProgress();

      expect(window.xp).toBe(100);
      expect(window.streak).toBe(5);
      expect(window.doneSet.has("html-01")).toBe(true);
      expect(window.buffers["html-01"].html).toBe("<h1>Test</h1>");
    });

    it("should handle corrupted local storage gracefully", () => {
      window.localStorage.setItem("devforge:progress:v1", "invalid json{");

      // Should not throw and keep initial values
      window.xp = 0;
      window.loadProgress();
      expect(window.xp).toBe(0);
    });
  });

  describe("Lesson Goals Validation", () => {
    it("should evaluate checkGoalRule correctly for HTML tags", () => {
      const rule = { type: "html-tag", value: "h1" };
      const matched = window.checkGoalRule(rule, { html: "<h1>Header</h1>", css: "", js: "" });
      expect(matched).toBe(true);

      const unmatched = window.checkGoalRule(rule, { html: "<p>Paragraph</p>", css: "", js: "" });
      expect(unmatched).toBe(false);
    });

    it("should evaluate checkGoalRule correctly for CSS selectors", () => {
      const rule = { type: "css-selector", value: "body" };
      const matched = window.checkGoalRule(rule, {
        html: "",
        css: "body { background: red; }",
        js: "",
      });
      expect(matched).toBe(true);
    });

    it("should evaluate checkGoalRule correctly for JS contains", () => {
      const rule = { type: "js-contains", value: "console.log" };
      const matched = window.checkGoalRule(rule, {
        html: "",
        css: "",
        js: "console.log('hello');",
      });
      expect(matched).toBe(true);
    });
  });

  describe("Snapshots System", () => {
    it("should generate a shareable snapshot link", () => {
      window.currentLessonId = "html-01";
      window.buffers["html-01"] = { html: "<h1>Snapshot</h1>", css: "", js: "" };

      window.generateSnapshot();

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const sharedUrl = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
      expect(sharedUrl).toContain("#snapshot=");
    });
  });
});
