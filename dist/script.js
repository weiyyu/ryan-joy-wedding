const weddingAt = new Date("2026-11-14T09:30:00+08:00").getTime();
const weddingDayEndsAt = new Date("2026-11-15T00:00:00+08:00").getTime();

const timeFields = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};
const countdownValues = document.querySelector(".countdown-values");
const countdownFinished = document.querySelector("#countdown-finished");
const countdownHeading = document.querySelector("#countdown-title");

function updateCountdown() {
  const now = Date.now();
  const remaining = Math.max(0, weddingAt - now);

  if (remaining === 0) {
    countdownValues.hidden = true;
    countdownFinished.hidden = false;
    countdownHeading.textContent = "我們的婚禮";
    countdownFinished.textContent =
      now < weddingDayEndsAt ? "今天，我們結婚了 ♡" : "謝謝您見證我們的婚禮 ♡";
    return false;
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);

  timeFields.days.textContent = String(days);
  timeFields.hours.textContent = String(hours).padStart(2, "0");
  timeFields.minutes.textContent = String(minutes).padStart(2, "0");
  timeFields.seconds.textContent = String(seconds).padStart(2, "0");
  return true;
}

let countdownInterval;
function tickCountdown() {
  if (!updateCountdown() && countdownInterval) {
    window.clearInterval(countdownInterval);
    countdownInterval = undefined;
  }
}

tickCountdown();
if (Date.now() < weddingAt) {
  countdownInterval = window.setInterval(tickCountdown, 1_000);
}
window.addEventListener("pageshow", tickCountdown);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tickCountdown();
});

const modalTriggers = new WeakMap();

function openDialog(dialog, trigger) {
  if (!dialog || typeof dialog.showModal !== "function") return;
  modalTriggers.set(dialog, trigger);
  dialog.showModal();
}

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    openDialog(document.getElementById(button.dataset.openDialog), button);
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    modalTriggers.get(dialog)?.focus();
  });
});
