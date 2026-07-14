/* ═══════════════════════════════════════════════════════════════
   DevForge — achievements.js
   Achievements/badges gamification system: milestone definitions,
   condition checking, auto-unlock, toast notification, and modal
   rendering with localStorage persistence.
   Depends on: shared state in app.js (xp, streak, doneSet, etc.)
   and showToast in ui.js.
═══════════════════════════════════════════════════════════════ */
/* exported
  Achievements,
  initAchievements,
  checkAchievements,
  getAchievementData,
  setAchievementData,
  clearAchievementData,
  openAchievementsModal,
  closeAchievementsModal
*/
"use strict";

const ACH_STORAGE_KEY = "devforge_achievements_v1";

let unlockedAchievements = {};

const ACHIEVEMENT_DEFS = [
  {
    id: "first_lesson",
    title: "First Steps",
    desc: "Complete your first lesson",
    icon: "🚀",
    check: () => doneSet.size >= 1,
  },
  {
    id: "five_lessons",
    title: "Getting Started",
    desc: "Complete 5 lessons",
    icon: "📚",
    check: () => doneSet.size >= 5,
  },
  {
    id: "ten_lessons",
    title: "Halfway There",
    desc: "Complete 10 lessons",
    icon: "🔥",
    check: () => doneSet.size >= 10,
  },
  {
    id: "all_lessons",
    title: "DevForge Master",
    desc: "Complete all lessons in the curriculum",
    icon: "🏆",
    check: () => doneSet.size >= getAllLessons().length && getAllLessons().length > 0,
  },
  {
    id: "first_run",
    title: "First Run",
    desc: "Run your code for the first time",
    icon: "▶",
    check: () => lastRunLesson !== null,
  },
  {
    id: "hundred_xp",
    title: "XP Hunter",
    desc: "Earn 100 XP",
    icon: "⭐",
    check: () => xp >= 100,
  },
  {
    id: "five_hundred_xp",
    title: "XP Master",
    desc: "Earn 500 XP",
    icon: "💎",
    check: () => xp >= 500,
  },
  {
    id: "streak_3",
    title: "On Fire",
    desc: "Achieve a 3-lesson streak",
    icon: "🔥",
    check: () => streak >= 3,
  },
  {
    id: "streak_7",
    title: "Unstoppable",
    desc: "Achieve a 7-lesson streak",
    icon: "⚡",
    check: () => streak >= 7,
  },
  {
    id: "streak_30",
    title: "Legendary",
    desc: "Achieve a 30-lesson streak",
    icon: "👑",
    check: () => streak >= 30,
  },
  {
    id: "first_hint",
    title: "Hint Seeker",
    desc: "Reveal your first hint",
    icon: "🔍",
    check: () => Object.keys(revealedHints).length >= 1,
  },
  {
    id: "hint_master",
    title: "Curiosity",
    desc: "Reveal hints in 5 different lessons",
    icon: "💡",
    check: () => Object.keys(revealedHints).length >= 5,
  },
];

function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACH_STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    return {};
  } catch {
    return {};
  }
}

function saveAchievements() {
  try {
    localStorage.setItem(ACH_STORAGE_KEY, JSON.stringify(unlockedAchievements));
  } catch (e) {
    console.warn("Failed to save achievements", e);
  }
}

function showAchievementToast(def) {
  if (typeof showToast === "function") {
    const msg = `🏅 Achievement Unlocked: ${def.title} — ${def.desc}`;
    showToast(msg, "success", def.icon);
  }
}

function checkAchievements() {
  const newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(def => {
    if (!unlockedAchievements[def.id]) {
      try {
        if (def.check()) {
          unlockedAchievements[def.id] = { unlockedAt: Date.now() };
          newlyUnlocked.push(def);
        }
      } catch (e) {
        /* skip if check throws (dependencies not ready) */
      }
    }
  });
  if (newlyUnlocked.length > 0) {
    saveAchievements();
    newlyUnlocked.forEach(def => showAchievementToast(def));
  }
  return newlyUnlocked;
}

function getAchievementData() {
  return { ...unlockedAchievements };
}

function setAchievementData(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    unlockedAchievements = { ...data };
    saveAchievements();
  }
}

function clearAchievementData() {
  unlockedAchievements = {};
  try {
    localStorage.removeItem(ACH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function renderAchievements() {
  const grid = document.getElementById("achievementGrid");
  if (!grid) return;

  const unlockedCount = ACHIEVEMENT_DEFS.filter(d => unlockedAchievements[d.id]).length;
  const totalCount = ACHIEVEMENT_DEFS.length;
  const statEl = document.getElementById("achievementStats");
  if (statEl) {
    statEl.textContent = `Unlocked ${unlockedCount} / ${totalCount}`;
  }

  grid.innerHTML = "";
  ACHIEVEMENT_DEFS.forEach(def => {
    const unlocked = unlockedAchievements[def.id];
    const card = document.createElement("li");
    card.className = "achievement-card" + (unlocked ? " unlocked" : " locked");
    card.setAttribute("aria-label", (unlocked ? "Unlocked: " : "Locked: ") + def.title);
    card.innerHTML =
      '<div class="achievement-icon">' +
      (unlocked ? def.icon : "🔒") +
      "</div>" +
      '<div class="achievement-info">' +
      '<div class="achievement-title">' +
      def.title +
      "</div>" +
      '<div class="achievement-desc">' +
      def.desc +
      "</div>" +
      "</div>" +
      '<div class="achievement-status">' +
      (unlocked ? "✅" : "⏳") +
      "</div>";
    grid.appendChild(card);
  });
}

function initAchievements() {
  unlockedAchievements = loadAchievements();
}

function openAchievementsModal() {
  if (
    typeof toggleFsPanel === "function" &&
    document.getElementById("fsPanel") &&
    document.getElementById("fsPanel").classList.contains("show")
  ) {
    toggleFsPanel();
  }
  renderAchievements();
  const modal = document.getElementById("achievementsModal");
  if (modal && typeof openModal === "function") {
    openModal(modal);
  }
  const btn = document.getElementById("achievementsBtn");
  if (btn) btn.classList.add("active");
}

function closeAchievementsModal() {
  const modal = document.getElementById("achievementsModal");
  if (modal && typeof closeModal === "function") {
    closeModal(modal);
  }
  const btn = document.getElementById("achievementsBtn");
  if (btn) btn.classList.remove("active");
}
