// Exercise the real homepage timer at the Taiwan wedding-time boundaries.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const fields = new Map();
const element = (selector) => {
  if (!fields.has(selector)) fields.set(selector, { textContent: "", hidden: false });
  return fields.get(selector);
};
const listeners = new Map();
let interval;
let now = Date.parse("2026-11-14T01:29:59Z");
class TestDate extends Date {
  static now() { return now; }
}

const document = {
  hidden: false,
  querySelector: element,
  querySelectorAll: () => [],
  addEventListener: (type, callback) => listeners.set(type, callback),
};
const window = {
  addEventListener: (type, callback) => listeners.set(type, callback),
  setInterval: (callback) => { interval = callback; return 1; },
  clearInterval: () => { interval = undefined; },
};

vm.runInNewContext(fs.readFileSync("dist/script.js", "utf8"), { Date: TestDate, document, window });
assert.equal(element("#seconds").textContent, "01");
assert.equal(element(".countdown-values").hidden, false);

now = Date.parse("2026-11-14T01:30:00Z");
interval();
assert.equal(element(".countdown-values").hidden, true);
assert.equal(element("#countdown-finished").textContent, "今天，我們結婚了 ♡");

now = Date.parse("2026-11-14T16:00:00Z");
listeners.get("pageshow")();
assert.equal(element("#countdown-finished").textContent, "謝謝您見證我們的婚禮 ♡");
console.log("OK: countdown reaches the Taiwan ceremony time and updates after midnight");
