import { imagesData } from "./imagesData.js";

const spoilers = document.querySelectorAll(".spoiler");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
gallery.innerHTML = "";

let fullImages = [];

Object.values(imagesData)
  .flat()
  .forEach((imageData) => {
    const img = document.createElement("img");
    img.src = imageData.lowQualitySrc;

    img.addEventListener("click", () => {
      openFullImage(imageData.fullSizeSrc);
    });

    gallery.appendChild(img);
  });

spoilers.forEach((spoiler, index) => {
  const content = spoiler.nextElementSibling;

  spoiler.addEventListener("click", () => {
    content.classList.toggle("spoiler-content--open");

    if (content.classList.contains("spoiler-content--open")) {
      spoiler.classList.add("spoiler-active");
      content.style.display = "block";
    } else {
      spoiler.classList.remove("spoiler-active");
      content.style.display = "none";
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
    const img = document.createElement("img");
    img.src = imageData.lowQualitySrc;

    img.addEventListener("click", () => {
      openFullImage(imageData.fullSizeSrc);
    });

    gallery.appendChild(img);
  });
}
const bodyOverlay = document.getElementById("body-overlay");

window.addEventListener("popstate", function (event) {
  const fullImage = document.querySelector(".full-image");
  if (fullImage) {
    closeFullImages();
  }
});

function openFullImage(src) {
  closeFullImages();

  loader.style.display = "block";
  bodyOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  bodyOverlay.classList.add("darken-active");

  const imgElement = document.createElement("img");
  imgElement.src = src;
  imgElement.classList.add("full-image");

  imgElement.addEventListener("click", () => {
    imgElement.classList.remove("scale");
    closeFullImages();
  });

  imgElement.addEventListener("load", () => {
    imgElement.classList.add("scale");
  });

  fullImages.push(imgElement);
  gallery.appendChild(imgElement);

  history.pushState({ isFullImageOpen: true }, null, "#full-image");
}
function closeFullImages() {
  loader.style.display = "none";
  bodyOverlay.addEventListener("click", () => {
    closeFullImages();
  });
  fullImages.forEach((img) => {
    gallery.removeChild(img);
  });
  fullImages = [];

  bodyOverlay.style.backgroundColor = "rgba(0, 0, 0, 0)";
  bodyOverlay.classList.remove("darken-active");
  history.back();
}

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
