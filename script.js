const NUSUK_SUBMIT_URL = "https://nusuk.go.link/winners";
const KEY_PATTERN = /^NG-[A-Za-z0-9]{8}$/;
const BATCH_SIZE = 48;

const allKeys = [
  ...new Set(
    (Array.isArray(window.NUSUK_KEYS) ? window.NUSUK_KEYS : []).filter((key) =>
      KEY_PATTERN.test(key),
    ),
  ),
];
const keyIndex = new Map(allKeys.map((key, index) => [key, index]));

const keysGrid = document.querySelector("#keys-grid");
const keyCount = document.querySelector("#key-count");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#key-search");
const loadMoreButton = document.querySelector("#load-more");
const loadMoreWrap = loadMoreButton.closest(".load-more-wrap");
const toast = document.querySelector("#toast");

let filteredKeys = allKeys;
let visibleCount = BATCH_SIZE;
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

async function copyValue(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = value;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand("copy");
    temporaryInput.remove();
  }
}

function createKeyCard(value, index) {
  const article = document.createElement("article");
  article.className = "key-card";
  article.innerHTML = `
    <div class="key-card__top">
      <p class="key-card__label">Key ${index + 1}</p>
      <span class="key-card__badge">Sesuai pola</span>
    </div>
    <p class="key-card__value">${value}</p>
    <div class="key-card__actions">
      <button class="button button--primary" type="button" data-action="copy-open">
        Salin &amp; Buka Nusuk <span aria-hidden="true">↗</span>
      </button>
      <button class="button button--secondary" type="button" data-action="copy">
        Salin
      </button>
    </div>
  `;

  article.querySelector('[data-action="copy"]').addEventListener("click", async () => {
    await copyValue(value);
    showToast(`${value} berhasil disalin.`);
  });

  article.querySelector('[data-action="copy-open"]').addEventListener("click", async () => {
    await copyValue(value);
    showToast(`${value} disalin. Membuka Nusuk...`);
    window.setTimeout(() => {
      window.location.assign(NUSUK_SUBMIT_URL);
    }, 500);
  });

  return article;
}

function renderKeys({ append = false } = {}) {
  const totalVisible = Math.min(visibleCount, filteredKeys.length);
  const startIndex = append
    ? Math.min(Math.max(0, visibleCount - BATCH_SIZE), filteredKeys.length)
    : 0;
  const shownKeys = filteredKeys.slice(startIndex, totalVisible);

  if (!append) {
    keysGrid.replaceChildren();
  }

  if (!append && shownKeys.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Key tidak ditemukan. Periksa kembali kata pencarian Anda.";
    keysGrid.appendChild(emptyState);
  } else {
    const fragment = document.createDocumentFragment();
    shownKeys.forEach((value) => {
      fragment.appendChild(createKeyCard(value, keyIndex.get(value)));
    });
    keysGrid.appendChild(fragment);
  }

  resultCount.textContent = `${totalVisible.toLocaleString("id-ID")} dari ${filteredKeys.length.toLocaleString("id-ID")} key`;
  loadMoreWrap.hidden = totalVisible >= filteredKeys.length;
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredKeys = query
    ? allKeys.filter((key) => key.toLowerCase().includes(query))
    : allKeys;
  visibleCount = BATCH_SIZE;
  renderKeys();
});

loadMoreButton.addEventListener("click", () => {
  visibleCount += BATCH_SIZE;
  renderKeys({ append: true });
});

keyCount.textContent = `${allKeys.length.toLocaleString("id-ID")} key unik tersedia`;
renderKeys();
