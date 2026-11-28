const NUSUK_SUBMIT_URL = "https://nusuk.go.link/winners";
const KEY_PATTERN = /^NG-[A-Za-z0-9]{8}$/;
const ITEMS_PER_PAGE = 50;
const ANSWER_ITEMS_PER_PAGE = 20;
const WINNER_ITEMS_PER_PAGE = 5;
const DIRECTORY_VIEWS = new Set(["keys", "answers", "winners", "faq"]);

const allKeys = [
  ...new Set(
    (Array.isArray(window.NUSUK_KEYS) ? window.NUSUK_KEYS : []).filter((key) =>
      KEY_PATTERN.test(key),
    ),
  ),
];
const keyIndex = new Map(allKeys.map((key, index) => [key, index]));
const answerCategories =
  window.NUSUK_ANSWERS && typeof window.NUSUK_ANSWERS === "object"
    ? window.NUSUK_ANSWERS
    : {};
const allAnswerCount = Object.values(answerCategories).reduce(
  (total, category) => total + (Array.isArray(category.entries) ? category.entries.length : 0),
  0,
);
const officialWinnerDays = Array.isArray(window.NUSUK_WINNERS) ? window.NUSUK_WINNERS : [];
const COUNTRY_CODES = Object.freeze({
  Algeria: "dz",
  Bangladesh: "bd",
  Egypt: "eg",
  India: "in",
  Indonesia: "id",
  Jordan: "jo",
  Morocco: "ma",
  Nigeria: "ng",
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
const answersSection = document.querySelector("#answers");
const answerTotal = document.querySelector("#answer-total");
const answerSearch = document.querySelector("#answer-search");
const answerResultCount = document.querySelector("#answer-result-count");
const answerList = document.querySelector("#answer-list");
const answerPagination = document.querySelector("#answer-pagination");
const answerCategoryButtons = [...document.querySelectorAll("[data-answer-category]")];
const winnerDays = document.querySelector("#winner-days");
const winnerSearch = document.querySelector("#winner-search");
const winnerResultCount = document.querySelector("#winner-result-count");
const winnerPagination = document.querySelector("#winner-pagination");
const winnerTabs = [...document.querySelectorAll("[data-winner-filter]")];
const directoryMenu = document.querySelector(".content-menu");
const viewButtons = [...document.querySelectorAll("[data-view]")];
const viewPanels = [...document.querySelectorAll("[data-view-panel]")];
const toast = document.querySelector("#toast");

const initialPage = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
let filteredKeys = allKeys;
let currentPage = Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1;
let currentAnswerCategory = "quran";
let filteredAnswers = [];
let currentAnswerPage = 1;
let winnerFilter = "all";
let currentWinnerPage = 1;
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

function getPaginationItems(totalPages, selectedPage) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, selectedPage]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = selectedPage + offset;
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

  getPaginationItems(totalPages, currentPage).forEach((item) => {
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

function currentAnswerData() {
  const fallbackId = Object.keys(answerCategories)[0];
  const categoryId = answerCategories[currentAnswerCategory] ? currentAnswerCategory : fallbackId;
  return answerCategories[categoryId] || { label: "Answer Keys", entries: [] };
}

function createAnswerCard(entry, index) {
  const article = document.createElement("article");
  article.className = "answer-card";
  article.innerHTML = `
    <div class="answer-card__meta">
      <span>Question ${index + 1}</span>
      <span>Verified</span>
    </div>
    <h3>${escapeHtml(entry.question)}</h3>
    <div class="answer-card__answer">
      <span>Answer</span>
      <p>${escapeHtml(entry.answer).replaceAll("\n", "<br>")}</p>
    </div>
    <button class="answer-card__copy" type="button">Copy answer</button>
  `;

  article.querySelector(".answer-card__copy").addEventListener("click", async () => {
    await copyValue(entry.answer);
    showToast("Answer copied.");
  });
  return article;
}

function createAnswerPageButton(label, page, { current = false, disabled = false } = {}) {
  const button = document.createElement("button");
  button.className = "pagination__button";
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.setAttribute(
    "aria-label",
    label === "Previous" || label === "Next" ? `${label} answer page` : `Go to answer page ${page}`,
  );

  if (current) {
    button.classList.add("is-current");
    button.setAttribute("aria-current", "page");
  }

  if (!disabled && !current) {
    button.addEventListener("click", () => {
      currentAnswerPage = page;
      renderAnswers({ scroll: true });
    });
  }
  return button;
}

function renderAnswerPagination(totalPages) {
  answerPagination.replaceChildren();
  if (totalPages <= 1) {
    answerPagination.hidden = true;
    return;
  }

  answerPagination.hidden = false;
  answerPagination.appendChild(
    createAnswerPageButton("Previous", currentAnswerPage - 1, {
      disabled: currentAnswerPage === 1,
    }),
  );

  getPaginationItems(totalPages, currentAnswerPage).forEach((item) => {
    if (item === "ellipsis") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "…";
      ellipsis.setAttribute("aria-hidden", "true");
      answerPagination.appendChild(ellipsis);
      return;
    }
    answerPagination.appendChild(
      createAnswerPageButton(String(item), item, { current: item === currentAnswerPage }),
    );
  });

  answerPagination.appendChild(
    createAnswerPageButton("Next", currentAnswerPage + 1, {
      disabled: currentAnswerPage === totalPages,
    }),
  );
}

function renderAnswers({ scroll = false } = {}) {
  const category = currentAnswerData();
  const query = answerSearch.value.trim().toLocaleLowerCase();
  filteredAnswers = category.entries.filter((entry) =>
    !query || [entry.question, entry.answer].some((value) =>
      String(value).toLocaleLowerCase().includes(query),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(filteredAnswers.length / ANSWER_ITEMS_PER_PAGE));
  currentAnswerPage = Math.min(Math.max(1, currentAnswerPage), totalPages);
  const startIndex = (currentAnswerPage - 1) * ANSWER_ITEMS_PER_PAGE;
  const visibleAnswers = filteredAnswers.slice(
    startIndex,
    startIndex + ANSWER_ITEMS_PER_PAGE,
  );
  answerList.replaceChildren();

  if (visibleAnswers.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No question or answer matches this search.";
    answerList.appendChild(emptyState);
  } else {
    const fragment = document.createDocumentFragment();
    visibleAnswers.forEach((entry, offset) => {
      fragment.appendChild(createAnswerCard(entry, startIndex + offset));
    });
    answerList.appendChild(fragment);
  }

  const firstResult = filteredAnswers.length === 0 ? 0 : startIndex + 1;
  const lastResult = Math.min(startIndex + ANSWER_ITEMS_PER_PAGE, filteredAnswers.length);
  answerResultCount.textContent = `${firstResult}–${lastResult} of ${filteredAnswers.length} · ${category.label}`;
  renderAnswerPagination(filteredAnswers.length === 0 ? 0 : totalPages);
  if (scroll) answersSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setAnswerCategory(categoryId, { scroll = false } = {}) {
  if (!answerCategories[categoryId]) return;
  currentAnswerCategory = categoryId;
  currentAnswerPage = 1;
  answerSearch.value = "";
  const category = currentAnswerData();
  answerSearch.placeholder = `Search ${category.label} questions and answers`;

  answerCategoryButtons.forEach((button) => {
    const isActive = button.dataset.answerCategory === categoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderAnswers({ scroll });
}

function createWinnerDayCard(day) {
  const showUmrah = winnerFilter !== "zamzam";
  const showZamzam = winnerFilter !== "umrah";
  const hasUmrahWinner = Array.isArray(day.umrah) && day.umrah.length >= 2;
  const [officialName, country, latinName] = hasUmrahWinner ? day.umrah : ["", "", ""];
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

  const umrahSection = showUmrah && hasUmrahWinner
    ? `
      <section class="winner-day-card__umrah" aria-label="Umrah winner">
        <p class="winner-card-label">Umrah winner <span>No. ${day.day}</span></p>
        <h3 dir="auto">${escapeHtml(officialName)}</h3>
        ${latinNameMarkup}
        <p class="winner-country">${flagMarkup}${escapeHtml(country)}</p>
      </section>
    `
    : showUmrah
      ? `
        <section class="winner-day-card__umrah" aria-label="Umrah winner status">
          <p class="winner-card-label">Umrah winner <span>No. ${day.day}</span></p>
          <h3>${escapeHtml(day.umrahStatus || "Pending official announcement")}</h3>
          <p class="winner-country">Not yet published by @mynusuk.</p>
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

  const sourceLinks = day.sources
    ? Object.entries(day.sources)
        .filter(([prize]) => winnerFilter === "all" || winnerFilter === prize)
        .map(([prize, url]) => [prize === "umrah" ? "Umrah announcement" : "Zamzam announcement", url])
    : [["Official source", day.source || "https://www.instagram.com/mynusuk/?hl=en"]];

  article.innerHTML = `
    <header class="winner-day-card__header">
      <span>Day ${day.day}</span>
      <time datetime="2026-11-${String(day.day).padStart(2, "0")}">${escapeHtml(day.date)}, 2026</time>
    </header>
    <div class="winner-day-card__content ${showUmrah && showZamzam ? "" : "is-single"}">
      ${umrahSection}
      ${zamzamSection}
    </div>
    ${sourceLinks.map(([label, url]) => `
      <a class="winner-day-card__source" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        ${label} · @mynusuk ↗
      </a>
    `).join("")}
  `;

  return article;
}

function dayMatchesWinnerSearch(day, query) {
  const hasUmrahWinner = Array.isArray(day.umrah) && day.umrah.length >= 2;
  const hasZamzamWinners = Array.isArray(day.zamzam) && day.zamzam.length > 0;
  if (winnerFilter === "umrah" && !hasUmrahWinner) return false;
  if (winnerFilter === "zamzam" && !hasZamzamWinners) return false;
  if (!query) return hasUmrahWinner || hasZamzamWinners;

  const values = [day.day, day.date];
  if (winnerFilter !== "zamzam" && hasUmrahWinner) values.push(...day.umrah);
  if (winnerFilter !== "umrah" && hasZamzamWinners) values.push(...day.zamzam);
  return values.some((value) => String(value).toLocaleLowerCase().includes(query));
}

function createWinnerPageButton(label, page, { current = false, disabled = false } = {}) {
  const button = document.createElement("button");
  button.className = "pagination__button";
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;
  button.setAttribute(
    "aria-label",
    label === "Previous" || label === "Next" ? `${label} winner page` : `Go to winner page ${page}`,
  );

  if (current) {
    button.classList.add("is-current");
    button.setAttribute("aria-current", "page");
  }

  if (!disabled && !current) {
    button.addEventListener("click", () => {
      currentWinnerPage = page;
      renderWinners({ scroll: true });
    });
  }

  return button;
}

function renderWinnerPagination(totalPages) {
  winnerPagination.replaceChildren();
  if (totalPages <= 1) {
    winnerPagination.hidden = true;
    return;
  }

  winnerPagination.hidden = false;
  winnerPagination.appendChild(
    createWinnerPageButton("Previous", currentWinnerPage - 1, {
      disabled: currentWinnerPage === 1,
    }),
  );

  getPaginationItems(totalPages, currentWinnerPage).forEach((item) => {
    if (item === "ellipsis") {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "…";
      ellipsis.setAttribute("aria-hidden", "true");
      winnerPagination.appendChild(ellipsis);
      return;
    }

    winnerPagination.appendChild(
      createWinnerPageButton(String(item), item, { current: item === currentWinnerPage }),
    );
  });

  winnerPagination.appendChild(
    createWinnerPageButton("Next", currentWinnerPage + 1, {
      disabled: currentWinnerPage === totalPages,
    }),
  );
}

function renderWinners({ scroll = false } = {}) {
  const query = winnerSearch.value.trim().toLocaleLowerCase();
  const matchingDays = officialWinnerDays.filter((day) => dayMatchesWinnerSearch(day, query));
  const totalPages = Math.max(1, Math.ceil(matchingDays.length / WINNER_ITEMS_PER_PAGE));
  currentWinnerPage = Math.min(Math.max(1, currentWinnerPage), totalPages);
  const startIndex = (currentWinnerPage - 1) * WINNER_ITEMS_PER_PAGE;
  const visibleDays = matchingDays.slice(startIndex, startIndex + WINNER_ITEMS_PER_PAGE);
  winnerDays.replaceChildren();

  if (visibleDays.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No published winner matches this search.";
    winnerDays.appendChild(emptyState);
  } else {
    const fragment = document.createDocumentFragment();
    visibleDays.forEach((day) => fragment.appendChild(createWinnerDayCard(day)));
    winnerDays.appendChild(fragment);
  }

  const firstResult = matchingDays.length === 0 ? 0 : startIndex + 1;
  const lastResult = Math.min(startIndex + WINNER_ITEMS_PER_PAGE, matchingDays.length);
  const label = matchingDays.length === 1 ? "daily result" : "daily results";
  winnerResultCount.textContent = `${firstResult}–${lastResult} of ${matchingDays.length} ${label} · Official results through November 27, 2026`;
  renderWinnerPagination(matchingDays.length === 0 ? 0 : totalPages);

  if (scroll) document.querySelector("#winners").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setDirectoryView(view, { updateHash = false, scroll = false } = {}) {
  const selectedView = DIRECTORY_VIEWS.has(view) ? view : "keys";

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

function viewFromHash() {
  const view = window.location.hash.slice(1);
  return DIRECTORY_VIEWS.has(view) ? view : "keys";
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredKeys = query
    ? allKeys.filter((key) => key.toLowerCase().includes(query))
    : allKeys;
  currentPage = 1;
  renderKeys({ updateUrl: true });
});

answerSearch.addEventListener("input", () => {
  currentAnswerPage = 1;
  renderAnswers();
});

answerCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAnswerCategory(button.dataset.answerCategory, { scroll: true });
  });
});

winnerSearch.addEventListener("input", () => {
  currentWinnerPage = 1;
  renderWinners();
});

winnerTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    winnerFilter = tab.dataset.winnerFilter;
    currentWinnerPage = 1;
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
  setDirectoryView(viewFromHash());
});

window.addEventListener("popstate", () => {
  const page = Number.parseInt(new URLSearchParams(window.location.search).get("page"), 10);
  currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  renderKeys();
});

keyCount.textContent = `${allKeys.length.toLocaleString("en-US")} unique keys available`;
answerTotal.textContent = allAnswerCount.toLocaleString("en-US");
renderKeys({ updateUrl: true });
setAnswerCategory(currentAnswerCategory);
renderWinners();
setDirectoryView(viewFromHash());
