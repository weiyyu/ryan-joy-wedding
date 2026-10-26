const SVG_NS = "http://www.w3.org/2000/svg";
const assetVersion = "20261026-ground";

// Coordinates are relative to the upright, square original photos (0–1000).
// The *_箭頭.jpg photos in the source folder were used only to trace directions.
const routes = {
  kulun: {
    label: "庫倫街入口",
    folder: "kulun",
    steps: [
      { title: "從巷道入口往前", detail: "找到 7-ELEVEN 與路易莎之間的巷道，沿照片方向往前走。", path: "M 570 950 C 565 805 565 690 560 565", tip: [560, 565, -90], label: [565, 790] },
      { title: "走下樓梯，進入玻璃門", detail: "沿樓梯往下，朝前方玻璃門走進去。", path: "M 355 955 C 400 815 485 670 545 560", tip: [545, 560, -55], label: [455, 790] },
      { title: "進入大廳後往左", detail: "先往前走，穿過大廳後依箭頭向左轉。", path: "M 555 955 C 575 820 530 735 440 700 C 365 670 300 675 225 660", tip: [225, 660, 180], label: [535, 800] },
      { title: "繞過圓柱，向前走", detail: "繞過圓柱，沿前方的走廊繼續走。", path: "M 570 960 C 595 810 625 670 660 535", tip: [660, 535, -75], label: [600, 790] },
      { title: "通過前方的門", detail: "沿走廊走，從前方開著的門通過。", path: "M 450 955 C 450 785 510 660 585 570", tip: [585, 570, -50], label: [465, 800] },
      { title: "長廊直走，再向右", detail: "沿長廊往前走，看到指示牌時向右轉，抵達副堂 B1。", path: "M 355 965 L 350 620 Q 350 580 395 580 L 555 580", tip: [555, 580, 0], label: [355, 805] },
    ],
  },
  oak: {
    label: "橡木桶旁入口",
    folder: "oak",
    steps: [
      { title: "走進台開承德大樓", detail: "從橡木桶旁的台開承德大樓入口進入；不論從左右哪側走來，都往中央大門。", path: "M 550 945 C 550 800 550 680 550 555", tip: [550, 555, -90], label: [550, 700], branches: [ { path: "M 135 795 L 355 815", tip: [355, 815, 6] }, { path: "M 905 835 L 690 835", tip: [690, 835, 180] } ] },
      { title: "下到 B1，往右前方", detail: "進入大樓後前往 B1；抵達照片中的大廳時，往右前方走。", path: "M 370 955 C 455 805 590 660 720 560", tip: [720, 560, -35], label: [510, 790] },
      { title: "到大廳前方向右轉", detail: "走到大廳前方，依箭頭向右轉。", path: "M 475 945 L 475 640 Q 475 610 515 610 L 735 610", tip: [735, 610, 0], label: [475, 790] },
      { title: "沿 B1 走廊往前", detail: "跟著照片往前，朝前方有指示牌的方向走。", path: "M 660 955 C 670 820 690 700 685 575", tip: [685, 575, -90], label: [670, 800] },
      { title: "沿歷史牆走向入口", detail: "經過左側的教會歷史牆，往右前方開著的門走。", path: "M 450 955 C 470 800 545 670 625 600", tip: [625, 600, -45], label: [500, 795] },
      { title: "繞過圓柱，向前走", detail: "繞過圓柱，沿前方的走廊繼續走。", path: "M 570 960 C 595 810 625 670 660 535", tip: [660, 535, -75], label: [600, 790] },
      { title: "通過前方的門", detail: "沿走廊走，從前方開著的門通過。", path: "M 450 955 C 450 785 510 660 585 570", tip: [585, 570, -50], label: [465, 800] },
      { title: "長廊直走，再向右", detail: "沿長廊往前走，看到指示牌時向右轉，抵達副堂 B1。", path: "M 355 965 L 350 620 Q 350 580 395 580 L 555 580", tip: [555, 580, 0], label: [355, 805] },
    ],
  },
};

const photo = document.getElementById("guide-photo");
const arrowGroup = document.getElementById("guide-arrow");
const routeLabel = document.getElementById("guide-route-label");
const counter = document.getElementById("guide-counter");
const stepNumber = document.getElementById("guide-step-number");
const stepTitle = document.getElementById("guide-step-title");
const stepDetail = document.getElementById("guide-step-detail");
const progress = document.querySelector("#guide-progress span");
const prevButton = document.getElementById("guide-prev");
const nextButton = document.getElementById("guide-next");
const jumpList = document.getElementById("guide-jump-list");
const arrival = document.getElementById("guide-arrival");

const requested = new URLSearchParams(location.search);
let routeKey = Object.hasOwn(routes, requested.get("route")) ? requested.get("route") : "kulun";
let index = Math.min(Math.max(Number.parseInt(requested.get("step"), 10) - 1 || 0, 0), routes[routeKey].steps.length - 1);

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function drawPath(group, arrow, branch = false) {
  // Sample the route's centre line to make one tapered surface on the floor.
  // A narrow far end and wider near end give the arrow the photo's perspective.
  const centreLine = svgElement("path", { d: arrow.path, fill: "none" });
  group.append(centreLine);
  const length = centreLine.getTotalLength();
  const headLength = Math.min(branch ? 70 : 105, length * .28);
  const shaftLength = length - headLength;
  const nearWidth = branch ? 90 : 170;
  const farWidth = branch ? 40 : 68;
  const headWidth = branch ? 105 : 165;
  const samples = 28;
  const left = [];
  const right = [];
  for (let i = 0; i <= samples; i += 1) {
    const distance = shaftLength * i / samples;
    const point = centreLine.getPointAtLength(distance);
    const before = centreLine.getPointAtLength(Math.max(0, distance - 3));
    const after = centreLine.getPointAtLength(Math.min(length, distance + 3));
    const magnitude = Math.hypot(after.x - before.x, after.y - before.y) || 1;
    const nx = -(after.y - before.y) / magnitude;
    const ny = (after.x - before.x) / magnitude;
    const width = nearWidth + (farWidth - nearWidth) * Math.pow(i / samples, .85);
    left.push([point.x + nx * width / 2, point.y + ny * width / 2]);
    right.push([point.x - nx * width / 2, point.y - ny * width / 2]);
  }
  const base = centreLine.getPointAtLength(shaftLength);
  const beforeBase = centreLine.getPointAtLength(Math.max(0, shaftLength - 3));
  const afterBase = centreLine.getPointAtLength(Math.min(length, shaftLength + 3));
  const magnitude = Math.hypot(afterBase.x - beforeBase.x, afterBase.y - beforeBase.y) || 1;
  const nx = -(afterBase.y - beforeBase.y) / magnitude;
  const ny = (afterBase.x - beforeBase.x) / magnitude;
  const tip = centreLine.getPointAtLength(length);
  const points = [
    ...left,
    [base.x + nx * headWidth / 2, base.y + ny * headWidth / 2],
    [tip.x, tip.y],
    [base.x - nx * headWidth / 2, base.y - ny * headWidth / 2],
    ...right.reverse(),
  ];
  centreLine.remove();
  const outline = points.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
  group.append(svgElement("path", {
    d: outline,
    fill: "#cb416a", "fill-opacity": branch ? .43 : .49,
    stroke: "#fff6f1", "stroke-opacity": .57, "stroke-width": 4,
    "stroke-linejoin": "round",
  }));
}

function drawArrow(step) {
  arrowGroup.replaceChildren();
  for (const branch of step.branches || []) drawPath(arrowGroup, branch, true);
  drawPath(arrowGroup, step);
  const [x, y] = step.label;
  // Two short painted lines stay inside the wider near end of the arrow.
  const text = svgElement("text", {
    x: 0, "text-anchor": "middle", fill: "#fffdfa",
    stroke: "rgba(69,27,41,.62)", "stroke-width": 3.5, "paint-order": "stroke fill",
    "font-family": "Arial, 'Noto Sans TC', sans-serif", "font-size": 62,
    "font-weight": 800, "letter-spacing": 1,
    transform: `translate(${x} ${y}) scale(.88 .8)`,
  });
  const english = svgElement("tspan", { x: 0, y: -18 });
  english.textContent = "GO！";
  const chinese = svgElement("tspan", { x: 0, y: 52 });
  chinese.textContent = "去！";
  text.append(english, chinese);
  arrowGroup.append(text);
}

function updateUrl() {
  const url = new URL(location.href);
  url.searchParams.set("route", routeKey);
  url.searchParams.set("step", index + 1);
  history.replaceState(null, "", url);
}

function render() {
  const route = routes[routeKey];
  const step = route.steps[index];
  const number = String(index + 1).padStart(2, "0");
  photo.src = `./assets/directions/${route.folder}/${index + 1}.webp?v=${assetVersion}`;
  photo.alt = `${route.label}第 ${index + 1} 步：${step.title}。${step.detail}`;
  drawArrow(step);
  routeLabel.textContent = route.label;
  counter.textContent = `${number} / ${String(route.steps.length).padStart(2, "0")}`;
  stepNumber.textContent = number;
  stepTitle.textContent = step.title;
  stepDetail.textContent = step.detail;
  progress.style.width = `${(index + 1) / route.steps.length * 100}%`;
  prevButton.disabled = index === 0;
  nextButton.disabled = index === route.steps.length - 1;
  arrival.hidden = index !== route.steps.length - 1;
  for (const button of document.querySelectorAll("[data-route]")) {
    button.setAttribute("aria-pressed", String(button.dataset.route === routeKey));
  }
  jumpList.replaceChildren(...route.steps.map((item, position) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(position + 1).padStart(2, "0");
    button.setAttribute("aria-label", `第 ${position + 1} 步：${item.title}`);
    button.setAttribute("aria-current", position === index ? "step" : "false");
    button.addEventListener("click", () => goTo(position));
    return button;
  }));
  if (index < route.steps.length - 1) {
    const preload = new Image();
    preload.src = `./assets/directions/${route.folder}/${index + 2}.webp?v=${assetVersion}`;
  }
  updateUrl();
}

function goTo(position) {
  const bounded = Math.min(Math.max(position, 0), routes[routeKey].steps.length - 1);
  if (bounded === index) return;
  index = bounded;
  render();
  if (matchMedia("(max-width: 850px)").matches) {
    swipeArea.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }
}

for (const button of document.querySelectorAll("[data-route]")) {
  button.addEventListener("click", () => {
    if (button.dataset.route === routeKey) return;
    routeKey = button.dataset.route;
    index = 0;
    render();
  });
}
prevButton.addEventListener("click", () => goTo(index - 1));
nextButton.addEventListener("click", () => goTo(index + 1));

let swipeStart = null;
const swipeArea = document.getElementById("guide-photo-frame");
swipeArea.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  swipeStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
swipeArea.addEventListener("touchend", (event) => {
  if (!swipeStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - swipeStart.x;
  const dy = touch.clientY - swipeStart.y;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) goTo(index + (dx < 0 ? 1 : -1));
  swipeStart = null;
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") goTo(index + 1);
  if (event.key === "ArrowLeft") goTo(index - 1);
});

render();
