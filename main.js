import { imagesData } from "./imagesData.js";

const body = document.querySelector(".body");
const spoilers = document.querySelectorAll(".spoiler");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
const close = document.querySelector(".close");
const bodyOverlay = document.getElementById("body-overlay");

gallery.innerHTML = "";

let fullImages = [];
let lastTouchStart = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let startOffsetX = 0;
let startOffsetY = 0;

function createImageElement(src, clickHandler) {
  const img = document.createElement("img");
  img.src = src;
  img.addEventListener("click", clickHandler);
  img.setAttribute("loading", "lazy");
  return img;
}

function addImageToGallery(src, clickHandler) {
  const img = createImageElement(src, clickHandler);
  gallery.appendChild(img);
}

Object.values(imagesData)
  .flat()
  .forEach((imageData) => {
    addImageToGallery(imageData.lowQualitySrc, () => {
      openFullImage(imageData.fullSizeSrc);
    });
  });

spoilers.forEach((spoiler, index) => {
  const content = spoiler.nextElementSibling;

  spoiler.addEventListener("click", () => {
    content.classList.toggle("spoiler-content--open");

    if (content.classList.contains("spoiler-content--open")) {
      spoiler.classList.add("spoiler-active");
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      spoiler.classList.remove("spoiler-active");
      content.style.maxHeight = null;
    }
  });

  const contentItems = content.querySelectorAll("li");
  contentItems.forEach((item) => {
    item.addEventListener("click", () => {
      const currentTabClass = item.classList[0];
      displayImages(currentTabClass);
    });
  });
});

function displayImages(tabClass) {
  const images = imagesData[tabClass];
  gallery.innerHTML = "";

  images.forEach((imageData) => {
    addImageToGallery(imageData.lowQualitySrc, () => {
      openFullImage(imageData.fullSizeSrc);
    });
  });
}

window.addEventListener("popstate", function (event) {
  const fullImage = document.querySelector(".full-image");
  if (fullImage) {
    closeFullImages();
  }
});

function openFullImage(src) {
  closeFullImages();
  body.style.overflow = "hidden";
  loader.style.display = "block";
  bodyOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  bodyOverlay.classList.add("darken-active");

  const imgElement = document.createElement("img");
  imgElement.src = src;
  imgElement.classList.add("full-image");
  imgElement.style.cursor = "zoom-in";

  imgElement.addEventListener("dblclick", () => {
    zoomFullImage(imgElement);
  });

  imgElement.addEventListener("touchstart", (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchStart;

    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault();
      zoomFullImage(imgElement, e.touches[0].clientX, e.touches[0].clientY);
    }

    lastTouchStart = currentTime;

    if (!imgElement.classList.contains("zoomed")) {
      return;
    }

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startOffsetX = imgElement.offsetLeft;
    startOffsetY = imgElement.offsetTop;
  });

  imgElement.addEventListener("touchmove", (e) => {
    e.preventDefault();

    if (!imgElement.classList.contains("zoomed")) {
      return;
    }

    const touch = e.touches[0];
    const offsetX = touch.clientX - startX;
    const offsetY = touch.clientY - startY;

    imgElement.style.left = startOffsetX + offsetX + "px";
    imgElement.style.top = startOffsetY + offsetY + "px";
  });

  imgElement.addEventListener("mousedown", (e) => {
    e.preventDefault();

    if (!imgElement.classList.contains("zoomed")) {
      return;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startOffsetX = imgElement.offsetLeft;
    startOffsetY = imgElement.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const offsetX = e.clientX - startX;
    const offsetY = e.clientY - startY;

    imgElement.style.left = startOffsetX + offsetX + "px";
    imgElement.style.top = startOffsetY + offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  close.addEventListener("click", () => {
    imgElement.classList.remove("scale");
    closeFullImages();
  });

  imgElement.addEventListener("load", () => {
    imgElement.classList.add("scale");
    loader.style.display = "none";
    close.style.display = "flex";
  });

  fullImages.push(imgElement);
  gallery.appendChild(imgElement);

  history.pushState({ isFullImageOpen: true }, null, "#full-image");
}

function zoomFullImage(imgElement, clickX, clickY) {
  if (imgElement.classList.contains("zoomed")) {
    imgElement.style.cursor = "zoom-in";
    imgElement.style.transition =
      "transform 0.4s ease-in-out, top 0.4s ease-in-out, left 0.4s ease-in-out";
    imgElement.style.transform = "translate(-50%, -50%) scale(1)";
    imgElement.style.top = "50%";
    imgElement.style.left = "50%";
    imgElement.classList.remove("zoomed");
  } else {
    imgElement.style.cursor = "move";
    const rect = imgElement.getBoundingClientRect();
    const offsetX = window.innerWidth / 2 - rect.left;
    const offsetY = window.innerHeight / 2 - rect.top;
    const scale = 3;

    imgElement.style.transition = "transform 0.4s ease-in-out";
    imgElement.style.transformOrigin = `${offsetX}px ${offsetY}px`;
    imgElement.style.transform = `translate(-${offsetX}px, -${offsetY}px) scale(${scale})`;
    imgElement.classList.add("zoomed");
  }

  setTimeout(() => {
    if (imgElement.classList.contains("zoomed")) {
      imgElement.style.cursor = "move";
    } else {
      imgElement.style.cursor = "zoom-in";
    }
  }, 400);
}

function closeFullImages() {
  body.style.overflow = "";
  close.style.display = "none";
  fullImages.forEach((img) => {
    gallery.removeChild(img);
  });
  fullImages = [];

  bodyOverlay.style.backgroundColor = "";
  bodyOverlay.classList.remove("darken-active");
  history.back();
}

document.addEventListener("DOMContentLoaded", function () {
  bodyOverlay.addEventListener("click", () => {
    closeFullImages();
  });
});

//--------------------------------------------------------------------------- BURGER----------------------------------------------------

const burger = document.querySelector(".burger");
const menu = document.querySelector(".menu");
const middleString = document.querySelector(".middle-string");
const topString = document.querySelector(".top-string");
const bottomString = document.querySelector(".bottom-string");
const spoilerContentItems = document.querySelectorAll(".spoiler-content li");

burger.addEventListener("click", function () {
  menu.classList.toggle("menu-active");
  if (menu.classList.contains("menu-active")) {
    middleString.style.transform = "scale(0)";
    topString.style.transform = "rotate(45deg)";
    bottomString.style.transform = "rotate(-45deg)";
  } else {
    middleString.style.transform = "scale(1)";
    topString.style.transform = "rotate(0deg)";
    bottomString.style.transform = "rotate(0deg)";
  }
});

spoilerContentItems.forEach((item) => {
  item.addEventListener("click", () => {
    menu.classList.remove("menu-active");
    middleString.style.transform = "scale(1)";
    topString.style.transform = "rotate(0deg)";
    bottomString.style.transform = "rotate(0deg)";
  });
});
