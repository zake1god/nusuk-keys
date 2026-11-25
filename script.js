// Tambahkan key baru di bagian paling atas daftar ini untuk update harian.
const nusukKeys = [
  {
    value: "24",
    label: "Nusuk Key #24",
    description: "Key yang diambil dari posting resmi @mynusuk.",
    sourceName: "Instagram @mynusuk",
    sourceUrl: "https://www.instagram.com/p/DgIDDFmFyNy/?hl=en",
    submitUrl: "https://nusuk.go.link/winners",
    status: "Terbaru",
  },
];

const keysGrid = document.querySelector("#keys-grid");
const keyCount = document.querySelector("#key-count");
const toast = document.querySelector("#toast");
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

function createKeyCard(key) {
  const article = document.createElement("article");
  article.className = "key-card";

  article.innerHTML = `
    <div class="key-card__top">
      <p class="key-card__label">${key.label}</p>
      <span class="key-card__badge">${key.status}</span>
    </div>
    <p class="key-card__value" aria-label="Key ${key.value}">${key.value}</p>
    <p class="key-card__description">${key.description}</p>
    <div class="key-card__actions">
      <button class="button button--primary" type="button" data-action="copy-open">
        Salin &amp; Buka Nusuk <span aria-hidden="true">↗</span>
      </button>
      <button class="button button--secondary" type="button" data-action="copy">
        Salin key
      </button>
    </div>
    <p class="key-card__source">
      Sumber:
      <a href="${key.sourceUrl}" target="_blank" rel="noopener noreferrer">
        ${key.sourceName} ↗
      </a>
    </p>
  `;

  article.querySelector('[data-action="copy"]').addEventListener("click", async () => {
    await copyValue(key.value);
    showToast(`Key ${key.value} berhasil disalin.`);
  });

  article.querySelector('[data-action="copy-open"]').addEventListener("click", async () => {
    await copyValue(key.value);
    showToast(`Key ${key.value} disalin. Membuka Nusuk...`);
    window.setTimeout(() => {
      window.location.assign(key.submitUrl);
    }, 500);
  });

  return article;
}

nusukKeys.forEach((key) => keysGrid.appendChild(createKeyCard(key)));
keyCount.textContent = `${nusukKeys.length} key tersedia`;
