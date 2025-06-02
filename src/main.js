import './style.css'
// Імпорти бібліотек із використанням Vite
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const apiKey = "50640022-e7ade59e431876575f1e6f3f7";

// Отримуємо доступ до DOM-елементів
const form = document.querySelector(".search-form");
const galleryEl = document.querySelector(".gallery");
const loaderEl = document.getElementById("loader");

// Ініціалізуємо SimpleLightbox для елементів галереї
let lightbox = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionDelay: 250,
});

// Функція показу індикатора завантаження
function showLoader() {
  loaderEl.style.display = "block";
}

// Функція приховування індикатора завантаження
function hideLoader() {
  loaderEl.style.display = "none";
}

// Функція для виконання HTTP-запиту до Pixabay
async function fetchImages(query) {
  const endpoint = "https://pixabay.com/api/";
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
  });
  
  const url = `${endpoint}?${params.toString()}`;

  try {
    showLoader();
    const response = await fetch(url);
    const data = await response.json();
    hideLoader();
    return data;
  } catch (error) {
    hideLoader();
    iziToast.error({
      message: "Сталася помилка під час завантаження зображень!",
      position: "topCenter",
    });
    console.error(error);
  }
}

// Обробник події сабміту форми
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Отримуємо значення пошукового запиту та обрізаємо зайві пробіли
  const searchQuery = form.searchQuery.value.trim();

  // Якщо запит порожній, попереджаємо користувача
  if (!searchQuery) {
    iziToast.warning({
      message: "Будь ласка, введіть слово для пошуку.",
      position: "topCenter",
    });
    return;
  }

  // Очищуємо попередні результати пошуку
  galleryEl.innerHTML = "";

  // Виконуємо запит до Pixabay
  const data = await fetchImages(searchQuery);
  if (!data || data.hits.length === 0) {
    iziToast.info({
      message:
        "Sorry, there are no images matching your search query. Please try again!",
      position: "topCenter",
    });
    return;
  }

  // Формуємо розмітку для кожної картинки
  const markup = data.hits
    .map((hit) => {
      return `<a class="gallery-item" href="${hit.largeImageURL}">
        <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
        <div class="info">
          <p><b>Likes</b>: ${hit.likes}</p>
          <p><b>Views</b>: ${hit.views}</p>
          <p><b>Comments</b>: ${hit.comments}</p>
          <p><b>Downloads</b>: ${hit.downloads}</p>
        </div>
      </a>`;
    })
    .join("");

  // Додаємо сформовану розмітку в DOM за одну операцію
  galleryEl.insertAdjacentHTML("beforeend", markup);

  // Оновлюємо SimpleLightbox
  lightbox.refresh();
});
