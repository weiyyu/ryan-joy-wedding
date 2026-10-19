const albumAssetVersion = "20261019-retouched";
const albumPhotos = [
  ["0011", "一起笑的日子", "帷昱與子涵相視而笑的婚紗照"],
  ["0016", "向日葵與你", "帷昱與子涵在向日葵旁的婚紗照"],
  ["0025", "陽光正好", "帷昱與子涵在向日葵花間的合照"],
  ["0032", "最美的妳", "子涵的婚紗個人照"],
  ["0044", "坐在你身邊", "帷昱與子涵並肩坐著的婚紗照"],
  ["0053", "走向我們的未來", "帷昱與子涵在拱廊下的婚紗照"],
  ["0054", "親吻這一刻", "帷昱與子涵在拱廊下親吻的婚紗照"],
  ["0076", "信心與愛同行", "帷昱與子涵手持聖經的婚紗照"],
  ["0094", "溫柔的靠近", "帷昱與子涵在室內相吻的婚紗照"],
  ["0103", "帷昱", "帷昱的西裝個人照"],
  ["0106", "有你就安心", "帷昱與子涵在室內相擁的婚紗照"],
  ["0108", "相依的時光", "帷昱與子涵在室內相依的婚紗照"],
  ["0111", "只看著你", "帷昱與子涵親密對望的婚紗照"],
  ["0115", "子涵", "子涵坐著拍攝的婚紗個人照"],
  ["0116", "肩並著肩", "帷昱與子涵坐在一起的婚紗照"],
  ["0122", "一生的承諾", "帷昱親吻子涵手背的婚紗照"],
  ["0125", "一起讀、一起走", "帷昱與子涵穿著便服手持聖經的合照"],
  ["0135", "我們的俏皮時光", "帷昱與子涵戴墨鏡的趣味婚紗照"],
  ["0163", "自在的我們", "帷昱與子涵穿著便服的合照"],
  ["0189", "風景裡的妳", "子涵穿著黑色禮服的戶外婚紗照"],
  ["0213", "街角的約定", "帷昱與子涵在街景前的婚紗照"],
  ["0222", "一起走過的街道", "帷昱與子涵在街道上的婚紗照"],
  ["0246", "我們的歡迎牌", "帷昱與子涵和婚禮歡迎牌的合照"],
  ["0261", "愛，從這裡開始", "帷昱與子涵在戶外欄杆旁的婚紗照"],
  ["0281", "摩天輪下的你我", "帷昱與子涵在摩天輪前的婚紗照"],
  ["0285", "故事還會繼續", "子涵在摩天輪前的婚紗照"],
].map(([number, caption, alt]) => ({
  src: `./assets/gallery/Y25836-${number}.webp?v=${albumAssetVersion}`,
  thumb: `./assets/gallery/thumbs/Y25836-${number}.webp?v=${albumAssetVersion}`,
  caption,
  alt,
}));

const albumStage = document.querySelector("#album-stage");
const albumPages = document.querySelector("#album-pages");
const albumCount = document.querySelector("#album-count");
const albumLoading = document.querySelector("#album-loading");
const previousButton = document.querySelector("#album-prev");
const nextButton = document.querySelector("#album-next");
const filmstrip = document.querySelector("#filmstrip");
const photoDialog = document.querySelector("#photo-dialog");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCount = document.querySelector("#lightbox-count");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxPrevious = document.querySelector("#lightbox-prev");
const lightboxNext = document.querySelector("#lightbox-next");
const mobileQuery = window.matchMedia("(max-width: 740px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentStart = 0;
let lightboxIndex = 0;
let flipping = false;
const preparedPhotos = new Map();

const pad = (number) => String(number).padStart(2, "0");
const pageSize = () => mobileQuery.matches ? 1 : 2;

function preparePhoto(index) {
  if (index < 0 || index >= albumPhotos.length) return Promise.resolve(false);
  if (!preparedPhotos.has(index)) {
    const image = new Image();
    let ready;
    if (typeof image.decode === "function") {
      image.src = albumPhotos[index].src;
      ready = image.decode().then(() => true).catch(() => false);
    } else {
      ready = new Promise((resolve) => {
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = albumPhotos[index].src;
        if (image.complete) resolve(image.naturalWidth > 0);
      });
    }
    preparedPhotos.set(index, ready.then((loaded) => {
      if (!loaded) preparedPhotos.delete(index);
      return loaded;
    }));
  }
  return preparedPhotos.get(index);
}

function pageMarkup(index) {
  const photo = albumPhotos[index];
  return `<figure class="album-page">
    <button class="album-photo" type="button" data-photo-index="${index}" aria-label="放大第 ${index + 1} 張照片：${photo.caption}">
      <img src="${photo.src}" alt="${photo.alt}" loading="eager" decoding="async" />
    </button>
    <figcaption><span>${pad(index + 1)} / ${albumPhotos.length}</span><span>${photo.caption}</span></figcaption>
  </figure>`;
}

function updateAlbum() {
  const end = Math.min(currentStart + pageSize(), albumPhotos.length);
  albumPages.innerHTML = Array.from({ length: end - currentStart }, (_, offset) => pageMarkup(currentStart + offset)).join("");
  albumCount.textContent = pageSize() === 1 || end === currentStart + 1
    ? `${pad(currentStart + 1)} / ${albumPhotos.length}`
    : `${pad(currentStart + 1)}–${pad(end)} / ${albumPhotos.length}`;
  previousButton.disabled = currentStart === 0;
  nextButton.disabled = end >= albumPhotos.length;
  filmstrip.querySelectorAll("button").forEach((button, index) => {
    if (index >= currentStart && index < end) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  for (let index = end; index < Math.min(end + pageSize(), albumPhotos.length); index++) {
    void preparePhoto(index);
  }
}

async function turnTo(index, animate = true) {
  if (flipping || index < 0 || index >= albumPhotos.length) return;
  const target = Math.floor(index / pageSize()) * pageSize();
  if (target === currentStart) return;
  flipping = true;
  const loadingTimer = window.setTimeout(() => {
    albumLoading.hidden = false;
    albumStage.setAttribute("aria-busy", "true");
  }, 150);
  await Promise.all(Array.from({ length: Math.min(pageSize(), albumPhotos.length - target) }, (_, offset) => preparePhoto(target + offset)));
  window.clearTimeout(loadingTimer);
  albumLoading.hidden = true;
  albumStage.removeAttribute("aria-busy");
  let overlay;
  if (animate && !reducedMotionQuery.matches) {
    overlay = albumPages.cloneNode(true);
    overlay.removeAttribute("id");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    overlay.classList.add("flip-sheet", target > currentStart ? "flip-forward" : "flip-backward");
    albumStage.append(overlay);
  }
  currentStart = Math.floor(index / pageSize()) * pageSize();
  updateAlbum();
  if (overlay) {
    window.setTimeout(() => {
      overlay.remove();
      flipping = false;
    }, 640);
  } else {
    flipping = false;
  }
}

function updateLightbox(index) {
  if (index < 0 || index >= albumPhotos.length) return;
  lightboxIndex = index;
  const photo = albumPhotos[index];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCount.textContent = `${pad(index + 1)} / ${albumPhotos.length}`;
  lightboxCaption.textContent = photo.caption;
  lightboxPrevious.disabled = index === 0;
  lightboxNext.disabled = index === albumPhotos.length - 1;
  void preparePhoto(index - 1);
  void preparePhoto(index + 1);
}

function openLightbox(index) {
  updateLightbox(index);
  photoDialog.showModal();
  document.body.classList.add("lightbox-open");
  document.querySelector("#lightbox-close").focus();
}

function attachSwipe(element, onLeft, onRight) {
  let startX = 0;
  let startY = 0;
  element.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });
  element.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    if (deltaX < 0) onLeft();
    else onRight();
  }, { passive: true });
}

filmstrip.innerHTML = albumPhotos.map((photo, index) => `<button type="button" data-index="${index}" aria-label="翻到第 ${index + 1} 張照片：${photo.caption}"><img src="${photo.thumb}" alt="" loading="lazy" /></button>`).join("");
updateAlbum();

previousButton.addEventListener("click", () => turnTo(currentStart - pageSize()));
nextButton.addEventListener("click", () => turnTo(currentStart + pageSize()));
albumPages.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-index]");
  if (button) openLightbox(Number(button.dataset.photoIndex));
});
filmstrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (button) turnTo(Number(button.dataset.index));
});
mobileQuery.addEventListener("change", () => {
  currentStart = Math.floor(currentStart / pageSize()) * pageSize();
  updateAlbum();
});
attachSwipe(albumStage, () => turnTo(currentStart + pageSize()), () => turnTo(currentStart - pageSize()));

document.querySelector("#lightbox-close").addEventListener("click", () => photoDialog.close());
lightboxPrevious.addEventListener("click", () => updateLightbox(lightboxIndex - 1));
lightboxNext.addEventListener("click", () => updateLightbox(lightboxIndex + 1));
attachSwipe(photoDialog, () => updateLightbox(lightboxIndex + 1), () => updateLightbox(lightboxIndex - 1));
photoDialog.addEventListener("click", (event) => { if (event.target === photoDialog) photoDialog.close(); });
photoDialog.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    if (photoDialog.open) updateLightbox(lightboxIndex + 1);
    else turnTo(currentStart + pageSize());
  } else if (event.key === "ArrowLeft") {
    if (photoDialog.open) updateLightbox(lightboxIndex - 1);
    else turnTo(currentStart - pageSize());
  }
});
