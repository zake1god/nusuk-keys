const NUSUK_SUBMIT_URL = "https://nusuk.go.link/winners";
const KEY_PATTERN = /^NG-[A-Za-z0-9]{8}$/;
const ITEMS_PER_PAGE = 50;

const allKeys = [
  ...new Set(
    (Array.isArray(window.NUSUK_KEYS) ? window.NUSUK_KEYS : []).filter((key) =>
      KEY_PATTERN.test(key),
    ),
  ),
];
const keyIndex = new Map(allKeys.map((key, index) => [key, index]));

const keysSection = document.querySelector("#keys");
const keysGrid = document.querySelector("#keys-grid");
const keyCount = document.querySelector("#key-count");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#key-search");
const pagination = document.querySelector("#pagination");
const toast = document.querySelector("#toast");

const initialPage = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
let filteredKeys = allKeys;
let currentPage = Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1;
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
    <p class="key-card__label">Key ${index + 1}</p>
    <p class="key-card__value">${value}</p>
    <div class="key-card__actions">
      <button class="button button--primary" type="button" data-action="copy-open">
        Copy &amp; Open Nusuk <span aria-hidden="true">↗</span>
      </button>
      <button class="button button--secondary" type="button" data-action="copy">
        Copy
      </button>
    </div>
  `;

  article.querySelector('[data-action="copy"]').addEventListener("click", async () => {
    await copyValue(value);
    showToast(`${value} copied.`);
  });

  article.querySelector('[data-action="copy-open"]').addEventListener("click", async () => {
    await copyValue(value);
    showToast(`${value} copied. Opening Nusuk...`);
    window.setTimeout(() => {
      window.location.assign(NUSUK_SUBMIT_URL);
    }, 500);
  });

  return article;
}

function getPaginationItems(totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = currentPage + offset;
    if (page > 1 && page < totalPages) pages.add(page);
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items = [];
  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

function createPageButton(label, page, { current = false, disabled = false } = {}) {
  const button = document.createElement("button");
  button.className = "pagination__button";
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.setAttribute(
    "aria-label",
    label === "Previous" || label === "Next" ? `${label} page` : `Go to page ${page}`,
  );

  if (current) {
    button.classList.add("is-current");
    button.setAttribute("aria-current", "page");
  }

  if (!disabled && !current) {
    button.addEventListener("click", () => {
      currentPage = page;
      renderKeys({ scroll: true, updateUrl: true });
    });
  }

  return button;
}

function renderPagination(totalPages) {
  pagination.replaceChildren();
  if (totalPages <= 1) {
    pagination.hidden = true;
    return;
  }

  pagination.hidden = false;
  pagination.appendChild(
    createPageButton("Previous", currentPage - 1, { disabled: currentPage === 1 }),
  );

  getPaginationItems(totalPages).forEach((item) => {
    if (item === "ellipsis") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "…";
      ellipsis.setAttribute("aria-hidden", "true");
      pagination.appendChild(ellipsis);
      return;
    }
    pagination.appendChild(
      createPageButton(String(item), item, { current: item === currentPage }),
    );
  });

  pagination.appendChild(
    createPageButton("Next", currentPage + 1, { disabled: currentPage === totalPages }),
  );
}

function updatePageUrl() {
  const url = new URL(window.location.href);
  if (currentPage === 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(currentPage));
  }
  window.history.replaceState({}, "", url);
}

function renderKeys({ scroll = false, updateUrl = false } = {}) {
  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / ITEMS_PER_PAGE));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const shownKeys = filteredKeys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  keysGrid.replaceChildren();
  if (shownKeys.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No keys found. Try a different search.";
    keysGrid.appendChild(emptyState);
  } else {
    const fragment = document.createDocumentFragment();
    shownKeys.forEach((value) => {
      fragment.appendChild(createKeyCard(value, keyIndex.get(value)));
    });
    keysGrid.appendChild(fragment);
  }

  const firstResult = filteredKeys.length === 0 ? 0 : startIndex + 1;
  const lastResult = Math.min(startIndex + ITEMS_PER_PAGE, filteredKeys.length);
  resultCount.textContent = `${firstResult.toLocaleString("en-US")}–${lastResult.toLocaleString("en-US")} of ${filteredKeys.length.toLocaleString("en-US")} keys`;
  renderPagination(filteredKeys.length === 0 ? 0 : totalPages);

  if (updateUrl) updatePageUrl();
  if (scroll) keysSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredKeys = query
    ? allKeys.filter((key) => key.toLowerCase().includes(query))
    : allKeys;
  currentPage = 1;
  renderKeys({ updateUrl: true });
});

window.addEventListener("popstate", () => {
  const page = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
  currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  renderKeys();
});

keyCount.textContent = `${allKeys.length.toLocaleString("en-US")} unique keys available`;
renderKeys({ updateUrl: true });
