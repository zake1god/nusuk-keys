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
const officialWinnerDays = Array.isArray(window.NUSUK_WINNERS) ? window.NUSUK_WINNERS : [];
const COUNTRY_CODES = Object.freeze({
  Algeria: "dz",
  Bangladesh: "bd",
  Egypt: "eg",
  India: "in",
  Indonesia: "id",
  Jordan: "jo",
  Morocco: "ma",
  Pakistan: "pk",
  Senegal: "sn",
  Syria: "sy",
});
const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06ff]/;

const keysSection = document.querySelector("#keys");
const keysGrid = document.querySelector("#keys-grid");
const keyCount = document.querySelector("#key-count");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#key-search");
const pagination = document.querySelector("#pagination");
const winnerDays = document.querySelector("#winner-days");
const winnerSearch = document.querySelector("#winner-search");
const winnerResultCount = document.querySelector("#winner-result-count");
const winnerTabs = [...document.querySelectorAll("[data-winner-filter]")];
const directoryMenu = document.querySelector(".content-menu");
const viewButtons = [...document.querySelectorAll("[data-view]")];
const viewPanels = [...document.querySelectorAll("[data-view-panel]")];
const toast = document.querySelector("#toast");

const initialPage = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
let filteredKeys = allKeys;
let currentPage = Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1;
let winnerFilter = "all";
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
    <p class="key-card__label"><span>Nusuk key</span><span>#${index + 1}</span></p>
    <p class="key-card__value">${value}</p>
    <div class="key-card__actions">
      <button class="button button--primary" type="button" data-action="copy-open">
        Copy &amp; Open <span aria-hidden="true">↗</span>
      </button>
      <button class="button button--secondary" type="button" data-action="copy" aria-label="Copy ${value}" title="Copy key">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="8" width="11" height="11" rx="2"></rect>
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
        </svg>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createWinnerDayCard(day) {
  const showUmrah = winnerFilter !== "zamzam";
  const showZamzam = winnerFilter !== "umrah";
  const [officialName, country, latinName] = day.umrah;
  const countryCode = COUNTRY_CODES[country];
  const flagMarkup = countryCode
    ? `<img class="winner-country__flag" src="https://flagcdn.com/w40/${countryCode}.png" width="20" height="15" alt="" loading="lazy" />`
    : `<span class="winner-country__fallback" aria-hidden="true">🌍</span>`;
  const latinNameMarkup =
    latinName && ARABIC_SCRIPT_PATTERN.test(officialName)
      ? `<p class="winner-latin-name"><span>Latin:</span> ${escapeHtml(latinName)}</p>`
      : "";
  const article = document.createElement("article");
  article.className = "winner-day-card";

  const umrahSection = showUmrah
    ? `
      <section class="winner-day-card__umrah" aria-label="Umrah winner">
        <p class="winner-card-label">Umrah winner <span>No. ${day.day}</span></p>
        <h3 dir="auto">${escapeHtml(officialName)}</h3>
        ${latinNameMarkup}
        <p class="winner-country">${flagMarkup}${escapeHtml(country)}</p>
      </section>
    `
    : "";

  const zamzamSection = showZamzam
    ? `
      <section class="winner-day-card__zamzam" aria-label="Zamzam winners">
        <p class="winner-card-label">Zamzam winners <span>10 names</span></p>
        <ol>
          ${day.zamzam.map((name) => `<li><span dir="auto">${escapeHtml(name)}</span></li>`).join("")}
        </ol>
      </section>
    `
    : "";

  article.innerHTML = `
    <header class="winner-day-card__header">
      <span>Day ${day.day}</span>
      <time datetime="2026-11-${String(day.day).padStart(2, "0")}">${escapeHtml(day.date)}, 2026</time>
    </header>
    <div class="winner-day-card__content ${showUmrah && showZamzam ? "" : "is-single"}">
      ${umrahSection}
      ${zamzamSection}
    </div>
    <a class="winner-day-card__source" href="https://www.instagram.com/mynusuk/?hl=en" target="_blank" rel="noopener noreferrer">
      Official source: @mynusuk ↗
    </a>
  `;

  return article;
}

function dayMatchesWinnerSearch(day, query) {
  if (!query) return true;

  const values = [day.day, day.date];
  if (winnerFilter !== "zamzam") values.push(...day.umrah);
  if (winnerFilter !== "umrah") values.push(...day.zamzam);
  return values.some((value) => String(value).toLocaleLowerCase().includes(query));
}

function renderWinners() {
  const query = winnerSearch.value.trim().toLocaleLowerCase();
  const matchingDays = officialWinnerDays.filter((day) => dayMatchesWinnerSearch(day, query));
  winnerDays.replaceChildren();

  if (matchingDays.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No published winner matches this search.";
    winnerDays.appendChild(emptyState);
  } else {
    const fragment = document.createDocumentFragment();
    matchingDays.forEach((day) => fragment.appendChild(createWinnerDayCard(day)));
    winnerDays.appendChild(fragment);
  }

  const label = matchingDays.length === 1 ? "daily result" : "daily results";
  winnerResultCount.textContent = `${matchingDays.length} ${label} shown · Official results through November 24, 2026`;
}

function setDirectoryView(view, { updateHash = false, scroll = false } = {}) {
  const selectedView = view === "winners" ? "winners" : "keys";

  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === selectedView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== selectedView;
  });

  if (updateHash) {
    const url = new URL(window.location.href);
    url.hash = selectedView;
    window.history.replaceState({}, "", url);
  }

  if (scroll) directoryMenu.scrollIntoView({ behavior: "smooth", block: "start" });
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredKeys = query
    ? allKeys.filter((key) => key.toLowerCase().includes(query))
    : allKeys;
  currentPage = 1;
  renderKeys({ updateUrl: true });
});

winnerSearch.addEventListener("input", renderWinners);

winnerTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    winnerFilter = tab.dataset.winnerFilter;
    winnerTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderWinners();
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirectoryView(button.dataset.view, { updateHash: true, scroll: true });
  });
});

window.addEventListener("hashchange", () => {
  setDirectoryView(window.location.hash === "#winners" ? "winners" : "keys");
});

window.addEventListener("popstate", () => {
  const page = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
  currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  renderKeys();
});

keyCount.textContent = `${allKeys.length.toLocaleString("en-US")} unique keys available`;
renderKeys({ updateUrl: true });
renderWinners();
setDirectoryView(window.location.hash === "#winners" ? "winners" : "keys");
