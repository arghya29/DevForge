/* ═══════════════════════════════════════════════════════════════
   DevForge — analytics.js
   Learner analytics: session timing, retry counts, daily streaks,
   analytics modal rendering.
   Depends on: shared state in app.js, lesson helpers in lesson.js
═══════════════════════════════════════════════════════════════ */
/* exported Analytics, openAnalyticsModal, closeAnalyticsModal, resetAnalyticsConfirm, renderAnalyticsData, failedCheckLessons */
"use strict";

let activeLessonId = null;
let sessionStartTime = null;
const failedCheckLessons = new Set();

function getLocalDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeSpent(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const Analytics = {
  _getTimes() {
    try {
      const val = window.localStorage.getItem("devforge_analytics_times");
      const parsed = val ? JSON.parse(val) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  },
  _saveTimes(times) {
    try {
      window.localStorage.setItem("devforge_analytics_times", JSON.stringify(times));
    } catch (e) {
      console.error("Failed to save analytics times", e);
    }
  },

  _getRetries() {
    try {
      const val = window.localStorage.getItem("devforge_analytics_retries");
      const parsed = val ? JSON.parse(val) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  },
  _saveRetries(retries) {
    try {
      window.localStorage.setItem("devforge_analytics_retries", JSON.stringify(retries));
    } catch (e) {
      console.error("Failed to save analytics retries", e);
    }
  },

  _getStreak() {
    try {
      const val = window.localStorage.getItem("devforge_analytics_streak");
      const parsed = val ? JSON.parse(val) : [];
      return Array.isArray(parsed) ? parsed.filter(date => typeof date === "string") : [];
    } catch {
      return [];
    }
  },
  _saveStreak(streak) {
    try {
      window.localStorage.setItem("devforge_analytics_streak", JSON.stringify(streak));
    } catch (e) {
      console.error("Failed to save analytics streak", e);
    }
  },

  startSession(lessonId) {
    if (!lessonId) return;
    if (activeLessonId === lessonId) return;
    if (activeLessonId) {
      this.endSession();
    }
    activeLessonId = lessonId;
    sessionStartTime = Date.now();
  },

  endSession() {
    if (!activeLessonId || !sessionStartTime) return;
    const diffMs = Date.now() - sessionStartTime;
    const diffSec = Math.round(diffMs / 1000);
    if (diffSec > 0) {
      const times = this._getTimes();
      times[activeLessonId] = (times[activeLessonId] || 0) + diffSec;
      this._saveTimes(times);
    }
    activeLessonId = null;
    sessionStartTime = null;
  },

  recordRetry(lessonId) {
    if (!lessonId) return;
    const retries = this._getRetries();
    retries[lessonId] = (retries[lessonId] || 0) + 1;
    this._saveRetries(retries);
  },

  recordCompletion(lessonId) {
    if (!lessonId) return;
    const streak = this._getStreak();
    const today = getLocalDateString();
    if (!streak.includes(today)) {
      streak.push(today);
      this._saveStreak(streak);
    }
  },

  getStats() {
    const times = this._getTimes();
    if (activeLessonId && sessionStartTime) {
      const elapsedSec = Math.max(0, Math.round((Date.now() - sessionStartTime) / 1000));
      if (elapsedSec > 0) {
        times[activeLessonId] = (times[activeLessonId] || 0) + elapsedSec;
      }
    }

    return {
      times,
      retries: this._getRetries(),
      streak: this._getStreak(),
    };
  },

  resetAll() {
    this.endSession();
    try {
      window.localStorage.removeItem("devforge_analytics_times");
      window.localStorage.removeItem("devforge_analytics_retries");
      window.localStorage.removeItem("devforge_analytics_streak");
    } catch (e) {
      console.error("Failed to clear analytics keys", e);
    }
    failedCheckLessons.clear();
    if (currentLessonId) {
      activeLessonId = currentLessonId;
      sessionStartTime = Date.now();
    }
  },
};

function openAnalyticsModal() {
  if (fsPanelVisible) toggleFsPanel();
  renderAnalyticsData();
  openModal(document.getElementById("analyticsModal"));
  const btn = document.getElementById("analyticsBtn");
  if (btn) btn.classList.add("active");
}

function closeAnalyticsModal() {
  closeModal(document.getElementById("analyticsModal"));
  const btn = document.getElementById("analyticsBtn");
  if (btn) btn.classList.remove("active");
}

function resetAnalyticsConfirm() {
  if (
    window.confirm(
      "Are you sure you want to reset all analytics data? This will clear all time spent, retry counts, and streak data. This action cannot be undone."
    )
  ) {
    Analytics.resetAll();
    renderAnalyticsData();
    showToast("Analytics reset successfully", "info", "📊");
  }
}

function renderAnalyticsData() {
  const stats = Analytics.getStats();

  // Render streak dots
  const streakDotsRow = document.getElementById("streakDotsRow");
  if (streakDotsRow) {
    streakDotsRow.innerHTML = "";
    const last7Days = [];
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayLabel = daysOfWeek[d.getDay()];
      const dayOfMonth = d.getDate();
      last7Days.push({ dateStr, dayLabel, dayOfMonth });
    }

    last7Days.forEach(day => {
      const isActive = stats.streak.includes(day.dateStr);
      const dotWrap = document.createElement("div");
      dotWrap.className = "streak-dot-wrap";

      const dot = document.createElement("div");
      dot.className = "streak-dot" + (isActive ? " active" : "");
      dot.title = day.dateStr + (isActive ? " (Active)" : " (Inactive)");
      dot.textContent = day.dayLabel[0];

      const label = document.createElement("span");
      label.className = "streak-dot-label";
      label.textContent = day.dayOfMonth;

      dotWrap.appendChild(dot);
      dotWrap.appendChild(label);
      streakDotsRow.appendChild(dotWrap);
    });
  }

  // Render streak text summary
  const streakStatsText = document.getElementById("streakStatsText");
  if (streakStatsText) {
    const activeDaysCount = stats.streak.filter(date => {
      const d = new Date(date + "T00:00:00");
      const now = new Date();
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;
    streakStatsText.textContent = `Completed lessons on ${activeDaysCount} of the last 7 days.`;
  }

  // Render table rows
  const tableBody = document.getElementById("analyticsTableBody");
  if (tableBody) {
    tableBody.innerHTML = "";
    const lessons = getAllLessons();

    if (lessons.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="3" style="text-align: center; color: var(--muted);">No lessons available</td>`;
      tableBody.appendChild(row);
    } else {
      lessons.forEach(l => {
        const timeSecs = stats.times[l.id] || 0;
        const retries = stats.retries[l.id] || 0;

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.className = "lesson-title-cell";
        nameCell.textContent = l.title;

        const timeCell = document.createElement("td");
        timeCell.className = "time-cell";
        timeCell.textContent = formatTimeSpent(timeSecs);

        const retryCell = document.createElement("td");
        retryCell.className = "retry-cell";
        retryCell.textContent = retries;

        row.appendChild(nameCell);
        row.appendChild(timeCell);
        row.appendChild(retryCell);
        tableBody.appendChild(row);
      });
    }
  }
}
