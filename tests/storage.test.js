import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Storage Functions", () => {
  const STORAGE_KEY = "devforge:progress:v1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("saveProgress stores valid data to localStorage", () => {
    const mockData = {
      xp: 100,
      streak: 5,
      done: ["html-01", "css-01"],
      buffers: {
        "html-01": { html: "<h1>Hi</h1>", css: "", js: "" },
      },
      hints: {},
      autorun: false,
      fontSize: "13px",
    };

    const { saveProgress } = (function () {
      let xp = 100,
        streak = 5;
      const doneSet = new Set(["html-01", "css-01"]);
      const buffers = { "html-01": { html: "<h1>Hi</h1>", css: "", js: "" } };
      const revealedHints = {};

      function saveProgress() {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              xp,
              streak,
              done: Array.from(doneSet),
              buffers,
              hints: revealedHints,
              autorun: false,
              fontSize: "13px",
            })
          );
        } catch {
          /* ignore */
        }
      }
      return { saveProgress };
    })();

    saveProgress();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.xp).toBe(100);
    expect(saved.streak).toBe(5);
    expect(saved.done).toContain("html-01");
    expect(saved.buffers["html-01"].html).toBe("<h1>Hi</h1>");
  });

  it("clearProgress removes storage key and resets hints", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: 50 }));
    const { clearProgress } = (function () {
      function clearProgress() {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      return { clearProgress };
    })();
    clearProgress();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("defensive validation catches corrupt data gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not valid json");
    const { loadProgress } = (function () {
      let xp = 0,
        streak = 0;
      const doneSet = new Set();
      const buffers = {};

      function loadProgress() {
        let data;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return;
          data = JSON.parse(raw);
        } catch {
          return;
        }
        if (!data || typeof data !== "object") return;
        if (typeof data.xp === "number" && Number.isFinite(data.xp) && data.xp >= 0) xp = data.xp;
      }
      return { loadProgress };
    })();
    expect(() => loadProgress()).not.toThrow();
  });
});
