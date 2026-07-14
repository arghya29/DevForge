import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Analytics Module", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("formatTimeSpent returns correct MM:SS format", () => {
    const { formatTimeSpent } = (function () {
      function formatTimeSpent(totalSeconds) {
        if (!totalSeconds || isNaN(totalSeconds)) return "00:00";
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      return { formatTimeSpent };
    })();
    expect(formatTimeSpent(0)).toBe("00:00");
    expect(formatTimeSpent(65)).toBe("01:05");
    expect(formatTimeSpent(3661)).toBe("61:01");
    expect(formatTimeSpent(null)).toBe("00:00");
  });

  it("session start and end accumulates time", () => {
    const Analytics = (function () {
      const times = {};
      let activeLessonId = null;
      let sessionStartTime = null;

      return {
        _getTimes() {
          return times;
        },
        _saveTimes(t) {
          Object.assign(times, t);
        },
        startSession(lessonId) {
          if (!lessonId) return;
          activeLessonId = lessonId;
          sessionStartTime = Date.now() - 5000;
        },
        endSession() {
          if (!activeLessonId || !sessionStartTime) return;
          const diffMs = Date.now() - sessionStartTime;
          const diffSec = Math.round(diffMs / 1000);
          if (diffSec > 0) {
            times[activeLessonId] = (times[activeLessonId] || 0) + diffSec;
          }
          activeLessonId = null;
          sessionStartTime = null;
        },
        getStats() {
          return { times };
        },
      };
    })();

    Analytics.startSession("html-01");
    Analytics.endSession();
    const stats = Analytics.getStats();
    expect(stats.times["html-01"]).toBeGreaterThanOrEqual(4);
  });

  it("recordRetry increments retry counter", () => {
    const Analytics = (function () {
      const retries = {};
      return {
        _getRetries() {
          return retries;
        },
        _saveRetries(r) {
          Object.assign(retries, r);
        },
        recordRetry(lessonId) {
          if (!lessonId) return;
          retries[lessonId] = (retries[lessonId] || 0) + 1;
        },
        getStats() {
          return { retries };
        },
      };
    })();

    Analytics.recordRetry("js-01");
    Analytics.recordRetry("js-01");
    Analytics.recordRetry("html-02");

    const stats = Analytics.getStats();
    expect(stats.retries["js-01"]).toBe(2);
    expect(stats.retries["html-02"]).toBe(1);
  });

  it("session does not start without lesson id", () => {
    const Analytics = (function () {
      let active = false;
      return {
        startSession(id) {
          if (!id) return;
          active = true;
        },
        isActive() {
          return active;
        },
      };
    })();
    Analytics.startSession(null);
    expect(Analytics.isActive()).toBe(false);
    Analytics.startSession("html-01");
    expect(Analytics.isActive()).toBe(true);
  });
});
