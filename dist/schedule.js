const weddingDayStart = new Date("2026-11-14T00:00:00+08:00").getTime();
const ceremonyStart = new Date("2026-11-14T09:30:00+08:00").getTime();
const scheduleEnd = new Date("2026-11-14T11:00:00+08:00").getTime();
const weddingDayEnd = new Date("2026-11-15T00:00:00+08:00").getTime();

const timelineItems = [...document.querySelectorAll(".timeline-item")];
const statusBox = document.querySelector("#live-status");
const statusText = document.querySelector("#live-status-text");
const jumpCurrent = document.querySelector("#jump-current");
let currentItem = null;

function timeOnWeddingDay(hhmm) {
  return new Date(`2026-11-14T${hhmm}:00+08:00`).getTime();
}

function updateScheduleStatus() {
  const now = Date.now();
  const activeItem = timelineItems.find((item) =>
    now >= timeOnWeddingDay(item.dataset.start) && now < timeOnWeddingDay(item.dataset.end)
  );

  if (currentItem !== activeItem) {
    currentItem?.classList.remove("is-current");
    activeItem?.classList.add("is-current");
    currentItem = activeItem || null;
  }

  statusBox.classList.toggle("is-live", Boolean(activeItem));
  jumpCurrent.hidden = !activeItem;

  if (activeItem) {
    statusText.textContent = `現在進行：${activeItem.dataset.title}（${activeItem.dataset.start}–${activeItem.dataset.end}）`;
  } else if (now < weddingDayStart) {
    statusText.textContent = "典禮將於 11 月 14 日上午 9:30 開始";
  } else if (now < ceremonyStart) {
    statusText.textContent = "今天上午 9:30，結婚禮拜即將開始";
  } else if (now < weddingDayEnd && now >= scheduleEnd) {
    statusText.textContent = "今天的典禮與合影已結束";
  } else {
    statusText.textContent = "婚禮流程已結束，謝謝您的祝福";
  }
}

jumpCurrent.addEventListener("click", () => {
  currentItem?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "center",
  });
});

updateScheduleStatus();
window.setInterval(updateScheduleStatus, 30_000);
window.addEventListener("pageshow", updateScheduleStatus);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateScheduleStatus();
});
