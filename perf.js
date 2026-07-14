/* exported PerformanceMonitor */
"use strict";

const PerformanceMonitor = {
  _marks: {},
  _measurements: [],

  mark(name) {
    this._marks[name] = performance.now();
  },

  measure(name, startMark, endMark) {
    const start = this._marks[startMark];
    const end = this._marks[endMark] || performance.now();
    if (start === undefined) return;
    const duration = end - start;
    this._measurements.push({ name, duration, ts: Date.now() });
    if (this._measurements.length > 100) this._measurements.shift();
    if (duration > 50) {
      console.debug(`[DevForge Perf] ${name}: ${duration.toFixed(1)}ms`);
    }
  },

  getSlowOperations() {
    return this._measurements.filter(m => m.duration > 50);
  },

  clear() {
    this._marks = {};
    this._measurements = [];
  },
};

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
