const body = document.body;
const spoilers = document.querySelectorAll(".spoiler");
const gallery = document.querySelector(".gallery");
const fullImage = document.querySelector(".full-image");
const loader = document.querySelector(".loader");
const close = document.querySelector(".close");
const bodyOverlay = document.getElementById("body-overlay");
const bottomLines = document.querySelectorAll(".bottom-line");
const header = document.querySelector(".header");
const burger = document.querySelector(".burger");
const menu = document.querySelector(".menu");
const middleString = document.querySelector(".middle-string");
const topString = document.querySelector(".top-string");
const bottomString = document.querySelector(".bottom-string");
const spoilerContentItems = document.querySelectorAll(".spoiler-content li");
const switchInput = document.getElementById("slider");
const contactsBtn = document.querySelector(".contacts-btn");
const allPaintingsButton = document.querySelector(".all-btn");

let fullImages = []; // Массив для хранения полноразмерных изображений
let isDragging = false; // Флаг перетаскивания изображения
let startX = 0; // Начальная позиция X при перетаскивании изображения
let startY = 0; // Начальная позиция Y при перетаскивании изображения
let startOffsetX = 0; // Начальное смещение по X при перетаскивании изображения
let startOffsetY = 0; // Начальное смещение по Y при перетаскивании изображения
let lastTouchStart = 0; // Время последнего касания для мобильных устройств

// Функция для активации выбранной темы
function activateTheme(themeClass, bodyColor, stringColor) {
  body.className = themeClass; // Применяем класс к body
  header.style.backgroundColor = body.style.backgroundColor = bodyColor; // Устанавливаем цвет фона для заголовка и body
  [topString, middleString, bottomString, ...bottomLines].forEach(
    (string) => (string.style.backgroundColor = stringColor),
  ); // Применяем цвет для строк бургера и линий внизу страницы
}

// Функция для применения темы в зависимости от предпочтений
function applyThemeBasedOnPreference() {
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches; // Проверяем, предпочитает ли пользователь темный режим
  const themeClass = prefersDarkMode ? "theme-dark" : "theme-light"; // Выбираем соответствующий класс для темы
  const bodyColor = prefersDarkMode ? "rgb(25, 25, 25)" : "white"; // Устанавливаем цвет фона для body
  const stringColor = prefersDarkMode ? "white" : "black"; // Устанавливаем цвет для строк бургера и линий внизу страницы
  body.classList.add(themeClass); // Применяем класс темы к body
  switchInput.checked = prefersDarkMode; // Устанавливаем состояние переключателя в зависимости от выбранной темы
  activateTheme(themeClass, bodyColor, stringColor); // Активируем выбранную тему
}

// Обновление темы при изменении переключателя
switchInput.addEventListener("change", () => {
  const themeClass = switchInput.checked ? "theme-dark" : "theme-light"; // Определяем класс темы в зависимости от состояния переключателя
  const bodyColor = switchInput.checked ? "rgb(25, 25, 25)" : "white"; // Определяем цвет фона для body
  const stringColor = switchInput.checked ? "white" : "black"; // Определяем цвет для строк бургера и линий внизу страницы
  activateTheme(themeClass, bodyColor, stringColor); // Активируем выбранную тему
});

gallery.innerHTML = "";

// Функция для создания элемента изображения
function createImageElement(src, clickHandler) {
  const img = document.createElement("img"); // Создаем элемент изображения
  img.src = src; // Устанавливаем атрибут src
  img.addEventListener("click", clickHandler); // Добавляем обработчик клика
  img.setAttribute("loading", "lazy"); // Устанавливаем lazy loading
  return img; // Возвращаем созданный элемент изображения
}

// Функция для добавления изображения в галерею
function addImageToGallery(src, clickHandler) {
  const img = createImageElement(src, clickHandler); // Создаем элемент изображения
  gallery.appendChild(img); // Добавляем изображение в галерею
}

// Функция сортировки изображений по дате
function sortImagesByDate(imagesData) {
  const getDateFromSrc = (src) => {
    const filename = src.split("/").pop(); // Получаем имя файла из URL
    const dateString = filename.split("_")[0]; // Извлекаем дату из имени файла
    const year = dateString.substring(0, 4); // Извлекаем год
    const month = dateString.substring(4, 6); // Извлекаем месяц
    const day = dateString.substring(6, 8); // Извлекаем день
    return new Date(`${year}-${month}-${day}`); // Возвращаем объект Date
  };

  const allImages = Object.values(imagesData).flat();
  allImages.sort((a, b) => {
    const dateA = getDateFromSrc(a.lowQualitySrc);
    const dateB = getDateFromSrc(b.lowQualitySrc);
    return dateB - dateA;
  });

  return allImages;
}

// Функция отображения всех изображений
async function displayAllImages() {
  try {
    const response = await fetch("imagesData.json");
    window.imagesData = await response.json(); // Обновляем переменную window.imagesData
    // Очистка галереи перед отображением новых изображений
    gallery.innerHTML = "";

    const sortedImages = sortImagesByDate(window.imagesData);

    // Отображение отсортированных изображений из данных
    sortedImages.forEach((imageData) => {
      addImageToGallery(imageData.lowQualitySrc, () => {
        openFullImage(imageData.fullSizeSrc);
      });
    });

    // Обновление обработчиков для спойлеров
    updateSpoilerListeners();
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
}

// Обновляем обработчики кликов для спойлеров
function updateSpoilerListeners() {
  spoilers.forEach((spoiler) => {
    spoiler.removeEventListener("click", toggleSpoiler); // Удаляем старый обработчик клика
    spoiler.addEventListener("click", toggleSpoiler); // Добавляем новый обработчик клика
  });
  window.scrollTo({ top: 0, behavior: "smooth" }); // Прокручиваем страницу наверх с плавным эффектом
}

// Функция для переключения состояния спойлера
function toggleSpoiler() {
  const content = this.nextElementSibling; // Получаем следующий элемент после спойлера (контент)
  const isOpen = content.classList.contains("spoiler-content--open"); // Проверяем, открыт ли спойлер

  if (isOpen) {
    content.classList.remove("spoiler-content--open"); // Закрываем спойлер
    this.classList.remove("spoiler-active"); // Удаляем класс активности спойлера
  } else {
    closeAllSpoilersExcept(this); // Закрываем все спойлеры, кроме текущего
    setTimeout(() => {
      content.classList.add("spoiler-content--open"); // Открываем спойлер через небольшую задержку для плавного эффекта
      this.classList.add("spoiler-active"); // Добавляем класс активности спойлера
    }, 150);
  }
}

// Функция для закрытия всех спойлеров, кроме переданного
function closeAllSpoilersExcept(currentSpoiler) {
  spoilers.forEach((spoiler) => {
    if (spoiler !== currentSpoiler) {
      const content = spoiler.nextElementSibling; // Получаем следующий элемент после спойлера (контент)
      content.classList.remove("spoiler-content--open"); // Закрываем контент спойлера
      spoiler.classList.remove("spoiler-active"); // Удаляем класс активности спойлера
    }
  });
}

// Функция для отображения изображений определенной категории
function displayImages(tabClass, imagesData) {
  const images = imagesData[tabClass]; // Получаем изображения из переданных данных
  gallery.innerHTML = ""; // Очищаем галерею перед добавлением новых изображений

  images.forEach((imageData) => {
    addImageToGallery(imageData.lowQualitySrc, () => {
      openFullImage(imageData.fullSizeSrc);
    });
  });

  window.scrollTo({ top: 0, behavior: "smooth" }); // Прокручиваем страницу наверх с плавным эффектом
}

// Функция для вызова контактов
contactsBtn.addEventListener("click", () => {
  burger.click();
  const scrollOptions = {
    top: document.body.scrollHeight,
    behavior: "smooth",
  };
  window.scrollTo(scrollOptions);
});

// Обработчик события для кнопки "Контакты"
document.querySelector(".contacts-btn").addEventListener("click", function () {
  // Удаление класса активного меню у всех меню
  const menuContainers = document.querySelectorAll(".menu-container");
  menuContainers.forEach((menuContainer) => {
    menuContainer.classList.remove("active");
  });
});

// Функция для сброса значений строк бургера
function resetBurgerStrings() {
  middleString.style.transform = "scale(1)"; // Сбрасываем масштаб средней строки бургера
  topString.style.transform = "rotate(0deg)"; // Сбрасываем поворот верхней строки бургера
  bottomString.style.transform = "rotate(0deg)"; // Сбрасываем поворот нижней строки бургера
}

// Загружаем страницу
document.addEventListener("DOMContentLoaded", function () {
  applyThemeBasedOnPreference(); // Применяем тему в зависимости от предпочтений
  displayAllImages(); // Отображаем все изображения при загрузке страницы
});

// Обработчик клика на кнопку "All Paintings"
allPaintingsButton.addEventListener("click", async () => {
  try {
    const sortedImages = sortImagesByDate(window.imagesData);
    gallery.innerHTML = ""; // Очищаем галерею перед добавлением изображений
    sortedImages.forEach((imageData) => {
      addImageToGallery(imageData.lowQualitySrc, () => {
        openFullImage(imageData.fullSizeSrc);
      });
    });
    updateSpoilerListeners(); // Обновляем обработчики для спойлеров
    menu.classList.remove("menu-active"); // Скрываем меню бургера
    resetBurgerStrings(); // Сбрасываем строки бургера
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
  window.scrollTo({ top: 0, behavior: "smooth" }); // Прокручиваем страницу наверх с плавным эффектом
});

// Обработчик клика на элементы содержимого спойлеров
spoilerContentItems.forEach((item) => {
  item.addEventListener("click", () => {
    menu.classList.remove("menu-active"); // Скрываем меню
    resetBurgerStrings(); // Сбрасываем строки бургера
    const currentTabClass = item.classList[0]; // Получаем класс текущей категории
    if (window.imagesData) {
      displayImages(currentTabClass, window.imagesData); // Отображаем изображения текущей категории
    } else {
      console.error("Данные изображений не доступны.");
    }
  });
});

// Обработчик клика на кнопку бургера
burger.addEventListener("click", function () {
  menu.classList.toggle("menu-active"); // Переключаем класс для отображения/скрытия меню
  if (menu.classList.contains("menu-active")) {
    middleString.style.transform = "scale(0)"; // Скрываем среднюю строку бургера
    topString.style.transform = "rotate(45deg)"; // Поворачиваем верхнюю строку бургера
    bottomString.style.transform = "rotate(-45deg)"; // Поворачиваем нижнюю строку бургера
  } else {
    middleString.style.transform = "scale(1)"; // Восстанавливаем масштаб средней строки бургера
    topString.style.transform = "rotate(0deg)"; // Сбрасываем поворот верхней строки бургера
    bottomString.style.transform = "rotate(0deg)"; // Сбрасываем поворот нижней строки бургера
  }
});

// Закрываем меню при клике на элемент категории
spoilerContentItems.forEach((item) => {
  item.addEventListener("click", () => {
    menu.classList.remove("menu-active"); // Скрываем меню
    middleString.style.transform = "scale(1)"; // Восстанавливаем масштаб средней строки бургера
    topString.style.transform = "rotate(0deg)"; // Сбрасываем поворот верхней строки бургера
    bottomString.style.transform = "rotate(0deg)"; // Сбрасываем поворот нижней строки бургера
  });
});

// Обработчик клика по оверлею
document.addEventListener("DOMContentLoaded", function () {
  bodyOverlay.addEventListener("click", () => {
    closeFullImages(); // Закрываем полноразмерное изображение
  });
});

// Обработчик изменения адресной строки браузера
window.addEventListener("popstate", function (event) {
  if (fullImage) {
    closeFullImages(); // Закрываем полноразмерное изображение
  }
});

// Функция для открытия полноразмерного изображения
function openFullImage(src) {
  // Закрываем все открытые изображения перед открытием нового
  closeFullImages();
  // Отключаем прокрутку страницы и отображаем загрузчик
  body.style.overflow = "hidden";
  loader.style.display = "block";
  // Добавляем затемнение фона
  bodyOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.96)";
  bodyOverlay.classList.add("darken-active");

  // Создаем элемент изображения
  const imgElement = document.createElement("img");
  imgElement.src = src;
  imgElement.classList.add("full-image");
  imgElement.style.cursor = "zoom-in";

  // Обработчик двойного клика для увеличения/уменьшения изображения
  imgElement.addEventListener("dblclick", () => {
    zoomFullImage(imgElement);
  });

  // Обработчики для перемещения изображения на сенсорных устройствах
  imgElement.addEventListener("touchstart", (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchStart;

    if (tapLength < 200 && tapLength > 0) {
      e.preventDefault();
      zoomFullImage(imgElement);
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

  // Обработчики для перемещения изображения с помощью мыши
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

  // Обработчик закрытия полноразмерного изображения
  close.addEventListener("click", () => {
    imgElement.classList.remove("scale");
    closeFullImages();
  });

  // Обработчик загрузки изображения
  imgElement.addEventListener("load", () => {
    imgElement.classList.add("scale");
    loader.style.display = "none";
    close.style.display = "flex";
  });

  // Добавляем изображение в массив полноразмерных изображений и в галерею
  fullImages.push(imgElement);
  gallery.appendChild(imgElement);

  // Добавляем запись в историю браузера для возможности использования кнопки "назад"
  history.pushState({ isFullImageOpen: true }, null, "#full-image");
}

// Функция увеличения/уменьшения полноразмерного изображения
function zoomFullImage(imgElement) {
  if (imgElement.classList.contains("zoomed")) {
    imgElement.style.cursor = "zoom-in";
    imgElement.style.transition =
      "transform 0.3s ease-in-out, top 0.3s ease-in-out, left 0.3s ease-in-out";
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

    imgElement.style.transition = "transform 0.3s ease-in-out";
    imgElement.style.transformOrigin = `${offsetX}px ${offsetY}px`;
    imgElement.style.transform = `translate(-${offsetX}px, -${offsetY}px) scale(${scale})`;
    imgElement.classList.add("zoomed");
  }
}

// Функция для закрытия полноразмерного изображения
function closeFullImages() {
  body.style.overflow = ""; // Восстанавливаем прокрутку страницы
  fullImages.forEach((img) => img.remove()); // Удаляем все полноразмерные изображения из DOM
  fullImages = []; // Очищаем массив полноразмерных изображений
  loader.style.display = "none"; // Скрываем загрузчик
  close.style.display = "none"; // Скрываем кнопку закрытия
  bodyOverlay.classList.remove("darken-active"); // Убираем класс для затемнения оверлея
  bodyOverlay.style.backgroundColor = ""; // Убираем цвет для оверлея
  close.removeEventListener("click", closeFullImages); // Удаляем обработчик клика по кнопке закрытия
  history.pushState({}, null, window.location.pathname); // Обновляем историю браузера
}

// Функция для обновления обработчиков касаний для мобильных устройств
function updateTouchListeners() {
  document.removeEventListener("touchstart", () => {}); // Удаляем старый обработчик touchstart
  document.removeEventListener("touchmove", () => {}); // Удаляем старый обработчик touchmove
}

// Функция для загрузки переводов из JSON файла
async function loadTranslations(language) {
  try {
    const response = await fetch(`languages/${language}.json`);
    if (!response.ok) {
      throw new Error("Failed to load translations");
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to load translations: ${error.message}`);
  }
}

// Функция для применения переводов к элементам на странице
function applyTranslations(translations) {
  const elements = document.querySelectorAll("[data-translation-key]");
  elements.forEach((element) => {
    const key = element.dataset.translationKey;
    if (translations.hasOwnProperty(key)) {
      element.textContent = translations[key];
    }
  });
}

//  Функция для добавления анимации при смене языка
function animateLanguageIcon() {
  const langIcon = document.querySelector(".language");
  langIcon.classList.add("language-transform"); // Добавляем класс для анимации
  setTimeout(() => {
    langIcon.classList.remove("language-transform"); // Удаляем класс через некоторое время для сброса анимации
  }, 300);
}

// Загрузка и применение переводов при загрузке страницы
document.addEventListener("DOMContentLoaded", async function () {
  const preferredLanguage = "en"; // Язык по умолчанию (английский)
  try {
    const translations = await loadTranslations(preferredLanguage);
    applyTranslations(translations);
    document.documentElement.lang = preferredLanguage; // Устанавливаем язык документа
  } catch (error) {
    console.error("Failed to load translations:", error);
  }
});

// Обработчик события для смены языка
document
  .querySelector(".language")
  .addEventListener("click", async function () {
    const currentLanguage = document.documentElement.lang;
    const newLanguage = currentLanguage === "en" ? "ru" : "en"; // Переключение между английским и русским языками
    try {
      const translations = await loadTranslations(newLanguage);
      applyTranslations(translations);
      document.documentElement.lang = newLanguage; // Устанавливаем язык документа
      animateLanguageIcon(); // Добавляем анимацию
    } catch (error) {
      console.error("Failed to load translations:", error);
    }
  });
