const profileTrigger = document.getElementById("profile-trigger");
const profileOverlay = document.getElementById("profile-overlay");

const timers = new Map();

function openOverlay(overlay, trigger, after) {
  const pending = timers.get(overlay);
  if (pending) {
    window.clearTimeout(pending);
    timers.delete(overlay);
  }
  overlay.removeAttribute("hidden");
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  trigger.setAttribute("aria-expanded", "true");
  if (after) after();
}

function closeOverlay(overlay, trigger, restoreFocus) {
  overlay.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  timers.set(
    overlay,
    window.setTimeout(() => {
      overlay.setAttribute("hidden", "");
      timers.delete(overlay);
    }, 300)
  );
  if (restoreFocus) trigger.focus();
}

function isOpen(overlay) {
  return !overlay.hasAttribute("hidden");
}

function openProfile() {
  openOverlay(profileOverlay, profileTrigger);
}

function closeProfile() {
  closeOverlay(profileOverlay, profileTrigger, true);
}

profileTrigger.addEventListener("click", () => {
  if (isOpen(profileOverlay)) {
    closeProfile();
  } else {
    openProfile();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isOpen(profileOverlay)) {
    closeProfile();
  }
});

profileOverlay.addEventListener("click", (event) => {
  if (event.target === profileOverlay) closeProfile();
});

const categoriesRoot = document.querySelector(".categories");

function makeIcon() {
  const span = document.createElement("span");
  span.className = "icon icon--placeholder";
  span.setAttribute("aria-hidden", "true");
  span.textContent = "X";
  return span;
}

function makeLabel(text, underlined) {
  const span = document.createElement("span");
  span.className = underlined ? "link-underline" : null;
  span.textContent = text;
  return span;
}

function buildCategories() {
  PORTAL_DATA.categories
    .filter((category) => category.home)
    .forEach((category) => {
      const nav = document.createElement("nav");
      nav.className = "category category--" + category.id;
      const headingId = "category-" + category.id;
      nav.setAttribute("aria-labelledby", headingId);

      const h2 = document.createElement("h2");
      h2.className = "category__title";
      h2.id = headingId;
      h2.append(makeLabel(category.name, false));

      const ul = document.createElement("ul");
      ul.className = "category__list";

      category.subcategories.forEach((sub) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      link.className = "subcategory-link";
      link.append(makeIcon(), makeLabel(sub.name, true));

      const count = document.createElement("span");
      count.className = "subcategory-count";
      count.textContent = sub.resources;
      link.append(count);

      attachSubToggle(link, sub, categoriesRoot);

      li.append(link);
      ul.append(li);
      });

      nav.append(h2, ul);
      categoriesRoot.append(nav);
    });
}

function attachSubToggle(link, sub, categoriesRoot) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const li = link.parentElement;
    const openUl = li.querySelector(":scope > ul.subcategory-pages");
    if (openUl) {
      openUl.remove();
      return;
    }
    categoriesRoot.querySelectorAll(".subcategory-pages").forEach((ul) => {
      if (!ul.contains(li)) ul.remove();
    });
    const list = document.createElement("ul");
    list.className = "subcategory-pages" + (sub.subs ? " subcategory-pages--nested" : "");
    if (sub.subs) {
      sub.subs.forEach((subsub) => {
        const sli = document.createElement("li");
        const slink = document.createElement("a");
        slink.href = "#";
        slink.className = "subcategory-link";
        const name = document.createElement("span");
        name.className = "subcategory-name";
        name.textContent = subsub.name;
        slink.append(name);
        const cnt = document.createElement("span");
        cnt.className = "subcategory-count";
        cnt.textContent = subsub.resources;
        slink.append(cnt);
        attachSubToggle(slink, subsub, categoriesRoot);
        sli.append(slink);
        list.append(sli);
      });
    } else {
      (sub.items || []).forEach((label) => {
        const item = document.createElement("li");
        item.textContent = label;
        list.append(item);
      });
    }
    li.append(list);
  });
}

let expandedSub = null;

buildCategories();

const entryForm = document.querySelector(".header-search");

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = entryForm.querySelector("input").value.trim();
  if (query) showResults(query);
});

const SHAPE_PALETTE = [
  "#ffce2e",
  "#5bbf53",
  "#5154cc",
  "#f65058",
  "#ff5485",
  "#be2fb3",
  "#000000"
];

const SHAPE_SVGS = [
  { name: "Circle", tip: "Round profile, dot, and status shapes", svg: '<circle cx="12" cy="12" r="10"/>' },
  { name: "Square", tip: "Grid, card, and section layouts", svg: '<rect x="3" y="3" width="18" height="18"/>' },
  { name: "Triangle", tip: "Alerts, hierarchy, and play controls", svg: '<polygon points="12,3 22,21 2,21"/>' },
  { name: "Diamond", tip: "Rhombus marks and pinned spots", svg: '<polygon points="12,2 22,12 12,22 2,12"/>' },
  { name: "Hexagon", tip: "Cells, badges, and honeycomb groups", svg: '<polygon points="12,2 21,7.5 21,16.5 12,22 3,16.5 3,7.5"/>' },
  {
    name: "Star", tip: "Favorites, ratings, and highlights",
    svg: '<polygon points="12,2 14.9,8.6 22,9.3 16.7,14.1 18.2,21.1 12,17.4 5.8,21.1 7.3,14.1 2,9.3 9.1,8.6"/>'
  },
  { name: "Ring", tip: "Progress rings and toggles", svg: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { name: "Capsule", tip: "Sliders, buttons, and status pills", svg: '<rect x="2" y="7" width="20" height="10" rx="5"/>' },
  { name: "Half circle", tip: "Dials, gauges, and partial fills", svg: '<path d="M2 19 A10 10 0 0 1 22 19 Z"/>' },
  { name: "Cross", tip: "Close, plus, and connect actions", svg: '<path d="M9 2 h6 v7 h7 v6 h-7 v7 h-6 v-7 h-7 v-6 h7 Z"/>' },
  { name: "Chevron", tip: "Collapse, expand, and paging", svg: '<polygon points="2,4 12,14 22,4 22,12 12,22 2,12"/>' },
  { name: "Arrow", tip: "Direction, send, and flow", svg: '<path d="M2 10 h12 l-4 -6 h3 l9 8 -9 8 h-3 l4 -6 h-12 Z"/>' },
  { name: "Crescent", tip: "Night mode and moon states", svg: '<path d="M16 4 A9 9 0 1 0 16 20 A11 11 0 0 1 16 4 Z"/>' },
  { name: "Pill", tip: "Tags, toggles, and labels", svg: '<rect x="7" y="2" width="10" height="20" rx="5"/>' },
  { name: "Wave", tip: "Audio, motion, and flow", svg: '<path d="M2 12 Q6 5 12 12 T22 12"/>' },
  { name: "Bolt", tip: "Energy, alerts, and quick actions", svg: '<polygon points="13,2 4,14 10,14 9,22 20,9 14,9"/>' },
  { name: "Drop", tip: "Fluids, humidity, and material states", svg: '<path d="M12 3 C12 3 5 11 5 15.5 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z"/>' },
  { name: "Eye", tip: "Visibility, preview, and viewing states", svg: '<path d="M2 12 C5.5 6.5 8.5 4.5 12 4.5 C15.5 4.5 18.5 6.5 22 12 C18.5 17.5 15.5 19.5 12 19.5 C8.5 19.5 5.5 17.5 2 12 Z"/><circle cx="12" cy="12" r="3.2"/>' },
  { name: "Heart", tip: "Likes, favorites, and wellness", svg: '<path d="M12 20.5 C6.5 16 3.5 12.9 3.5 9.4 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20.5 9.4 C20.5 12.9 17.5 16 12 20.5 Z"/>' },
  { name: "Asterisk", tip: "Footnotes, references, and extras", svg: '<path d="M12 3 v18 M4.2 7.5 l15.6 9 M19.8 7.5 l-15.6 9"/>' },
  { name: "Target", tip: "Focus, goals, and alignment", svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>' },
  { name: "Cloud", tip: "Storage, sync, and online states", svg: '<path d="M7 18 a4.5 4.5 0 1 1 .8 -8.9 A6 6 0 0 1 19 11.2 A3.4 3.4 0 0 1 18.5 18 Z"/>' },
  { name: "Scribble", tip: "Sketches, drafts, and freeform notes", svg: '<path d="M3 15 C5 9 8 6 12 6 C17 6 20 9 20 12 C20 16 16 19 12 18 C9 17.4 8 15 10 13.5 C12 12 15 12.5 15 14.5 C15 16 12 17 10 16"/>' }
];

// Icon picker drawer (5 tiles always visible as row 1; 15 more reveal on hover)
const iconDrawer = document.getElementById("icon-drawer");

let iconEditMode = false;
let savedConfig = loadIconConfig();
let workingConfig = null;

function loadIconConfig() {
  try {
    return JSON.parse(localStorage.getItem("portal.iconConfig")) || {};
  } catch {
    return {};
  }
}

function saveIconConfig(config) {
  savedConfig = JSON.parse(JSON.stringify(config));
  try {
    localStorage.setItem("portal.iconConfig", JSON.stringify(savedConfig));
  } catch {
    // storage unavailable (private mode): session-only persistence
  }
}

// Future editing operations mutate a copy returned here; commit/revert applies it.
function getWorkingConfig() {
  if (!workingConfig) workingConfig = JSON.parse(JSON.stringify(savedConfig));
  return workingConfig;
}

if (iconDrawer) {
const GRID_COLS = 5;
if (!savedConfig || !Array.isArray(savedConfig.menu)) {
  savedConfig = defaultIconConfig();
  saveIconConfig(savedConfig);
}
workingConfig = null;

function defaultIconConfig() {
  const names = SHAPE_SVGS.map((s) => s.name);
  return {
    menu: names.slice(0, 5),
    board: names.slice(5, 20),
    inactive: names.slice(20),
  };
}

// v1 config migration from the flat {} saved by earlier builds
if (!Array.isArray(savedConfig.menu) || savedConfig.menu.length === 0) {
  savedConfig = defaultIconConfig();
  saveIconConfig(savedConfig);
}

function shapeDef(name) {
  return SHAPE_SVGS.find((s) => s.name === name) || SHAPE_SVGS[0];
}

function cellPlacement(area, idx, cfg) {
  let row, col;
  if (area === "menu") {
    row = 1;
    // right-align: hug the Profile button side when fewer than 5
    col = GRID_COLS - (cfg.menu.length - 1 - idx);
  } else if (area === "board") {
    row = 2 + Math.floor(idx / GRID_COLS);
    col = (idx % GRID_COLS) + 1;
  } else if (area === "inactive") {
    const footerRow = 2 + Math.ceil(cfg.board.length / GRID_COLS);
    row = footerRow + 1 + Math.floor(idx / GRID_COLS);
    col = (idx % GRID_COLS) + 1;
  }
  return `grid-row: ${row}; grid-column: ${col};`;
}

function footerGridRow(boardCount) {
  return 2 + Math.ceil(boardCount / GRID_COLS);
}

function buildDrawer() {
  iconDrawer.textContent = "";
  iconDrawer.classList.toggle("is-editing", iconEditMode);
  const cfg = iconEditMode ? getWorkingConfig() : savedConfig;
  const areas = [];
  cfg.menu.forEach((name, i) => areas.push({ name, area: "menu", idx: i }));
  cfg.board.forEach((name, i) => areas.push({ name, area: "board", idx: i }));
  if (iconEditMode) {
    cfg.inactive.forEach((name, i) => areas.push({ name, area: "inactive", idx: i }));
  }
  const boardCount = cfg.board.length;
  const paletteLen = SHAPE_PALETTE.length;

  areas.forEach(({ name, area, idx }) => {
    const shape = shapeDef(name);
    const globalIdx = SHAPE_SVGS.indexOf(shape);
    const cell = document.createElement("div");
    cell.className = "icon-cell icon-cell--" + area;
    cell.style.cssText = cellPlacement(area, idx, cfg);

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "icon-tile";
    tile.dataset.shape = shape.name;
    tile.dataset.tip = shape.tip;
    tile.setAttribute("aria-label", shape.name);
    tile.style.setProperty("--tile-color", SHAPE_PALETTE[globalIdx % paletteLen]);
    tile.setAttribute("aria-pressed", "false");
    tile.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' + shape.svg + "</svg>";

    const label = document.createElement("span");
    label.className = "icon-cell__label";
    label.textContent = shape.name;

    cell.append(tile, label);

    if (iconEditMode) {
      const actions = document.createElement("div");
      actions.className = "icon-tile__actions";
      const mkBtn = (cls, glyph, title, fn) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "icon-tile__act " + cls;
        b.textContent = glyph;
        b.title = title;
        b.setAttribute("aria-label", title);
        b.addEventListener("click", (event) => {
          event.stopPropagation();
          fn(shape.name);
        });
        return b;
      };
      const removeShape = (c, n) => {
        c.menu = c.menu.filter((x) => x !== n);
        c.board = c.board.filter((x) => x !== n);
        c.inactive = c.inactive.filter((x) => x !== n);
      };
      const makeInactive = (n) => {
        const c = getWorkingConfig();
        removeShape(c, n);
        c.inactive.push(n);
        rebuildAfterEdit();
      };
      const toMenu = (n) => {
        const c = getWorkingConfig();
        if (c.menu.length >= GRID_COLS) {
          showDrawerNote("The menu is full — move an icon out first (↓ or ✕).");
          return;
        }
        removeShape(c, n);
        c.menu.push(n);
        rebuildAfterEdit();
      };
      const toBoard = (n) => {
        const c = getWorkingConfig();
        removeShape(c, n);
        c.board.push(n);
        rebuildAfterEdit();
      };
      if (area === "inactive") {
        actions.append(mkBtn("icon-tile__act--board", "+", "Make available in lower drawer", toBoard));
        actions.append(mkBtn("icon-tile__act--up", "\u2191", "Send up to the menu", toMenu));
      } else {
        actions.append(mkBtn("icon-tile__act--x", "\u00d7", "Make inactive", makeInactive));
        if (area === "menu") {
          actions.append(mkBtn("icon-tile__act--down", "\u2193", "Send to lower drawer", toBoard));
        } else {
          actions.append(mkBtn("icon-tile__act--up", "\u2191", "Send up to the menu", toMenu));
        }
      }
      cell.append(actions);
    }

    tile.addEventListener("click", () => {
      iconDrawer.querySelectorAll(".icon-tile[aria-pressed='true']").forEach((other) => {
        if (other !== tile) other.setAttribute("aria-pressed", "false");
      });
      tile.setAttribute("aria-pressed", tile.getAttribute("aria-pressed") !== "true");
    });

    iconDrawer.append(cell);
  });

  const footer = document.createElement("div");
  footer.className = "icon-drawer__footer";
  footer.style.gridRow = footerGridRow(boardCount);
  iconDrawer.append(footer);

  const note = document.createElement("p");
  note.className = "icon-drawer__note";
  footer.after(note);

  renderEditFooter();
}

function rebuildAfterEdit() {
  buildDrawer();
}

let noteTimer = null;
function showDrawerNote(text) {
  const note = iconDrawer.querySelector(".icon-drawer__note");
  if (!note) return;
  note.textContent = text;
  note.classList.add("is-visible");
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => note.classList.remove("is-visible"), 2800);
}

function renderEditFooter() {
  const footer = iconDrawer.querySelector(".icon-drawer__footer");
  if (!footer) return;
  footer.textContent = "";
  footer.classList.toggle("icon-drawer__footer--editing", iconEditMode);
  const buttons = [];
  if (iconEditMode) {
    workingConfig = getWorkingConfig();
    const exit = document.createElement("button");
    exit.type = "button";
    exit.className = "drawer-edit-btn";
    exit.textContent = "Exit edit mode";
    exit.addEventListener("click", () => {
      saveIconConfig(getWorkingConfig());
      workingConfig = null;
      iconEditMode = false;
      buildDrawer();
      renderEditFooter();
    });
    const revert = document.createElement("button");
    revert.type = "button";
    revert.className = "drawer-edit-btn";
    revert.textContent = "Revert";
    revert.addEventListener("click", () => {
      workingConfig = null;
      applyIconConfig(savedConfig);
      iconEditMode = false;
      buildDrawer();
      renderEditFooter();
    });
    buttons.push(exit, revert);
  } else {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "drawer-edit-btn";
    edit.textContent = "Edit icons";
    edit.setAttribute("aria-expanded", "false");
    edit.addEventListener("click", () => {
      iconEditMode = true;
      buildDrawer();
      renderEditFooter();
    });
    buttons.push(edit);
  }
  buttons.forEach((b) => footer.append(b));
}

function applyIconConfig(config) {
  savedConfig = JSON.parse(JSON.stringify(config || defaultIconConfig()));
}

buildDrawer();
}

// Custom tooltips for icon tiles (native title tooltips are too slow to appear)
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.hidden = true;
document.body.append(tooltip);

let tooltipTimer = null;

function showTooltipFor(tile) {
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    tooltip.textContent = tile.dataset.tip || "";
    tooltip.hidden = false;
    const rect = tile.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
    tooltip.style.top = rect.bottom + 44 + "px";
  }, 250);
}

function hideTooltip(tile) {
  if (tile) clearTimeout(tooltipTimer);
  tooltip.hidden = true;
}

document.addEventListener("mouseover", (event) => {
  const tile = event.target.closest(".icon-tile");
  if (tile) showTooltipFor(tile);
});

document.addEventListener("mouseout", (event) => {
  if (event.target.closest(".icon-tile")) hideTooltip(event.target.closest(".icon-tile"));
});

document.addEventListener("focusin", (event) => {
  const tile = event.target.closest(".icon-tile");
  if (tile) showTooltipFor(tile);
});

document.addEventListener("focusout", (event) => {
  if (event.target.closest(".icon-tile")) hideTooltip(event.target.closest(".icon-tile"));
});

const SECONDARY_TABS = [
  {
    id: "events",
    label: "Events + Updates",
    items: ["Event 01", "Event 02", "Event 03"]
  },
  {
    id: "campus-life",
    label: "Campus Life",
    items: ["Item 01", "Item 02", "Item 03"]
  },
  {
    id: "announcements",
    label: "Announcements",
    items: ["Announcement 01", "Announcement 02", "Announcement 03"]
  },
  {
    id: "community",
    label: "Community",
    items: ["Group 01", "Group 02", "Group 03"]
  }
];

const tabsRoot = document.querySelector(".secondary__tabs");
const panelRoot = document.querySelector(".secondary__panel");
const tabButtons = [];

function renderPanel(tabId) {
  const tab = SECONDARY_TABS.find((t) => t.id === tabId);
  panelRoot.innerHTML = "";
  tab.items.forEach((item) => {
    const p = document.createElement("p");
    p.className = "secondary__item";
    p.textContent = item;
    panelRoot.append(p);
  });
}

function selectTab(button) {
  tabButtons.forEach((b) => {
    const selected = b === button;
    b.setAttribute("aria-selected", String(selected));
    b.tabIndex = selected ? 0 : -1;
  });
  renderPanel(button.dataset.tab);
}

SECONDARY_TABS.forEach((tab, index) => {
  const button = document.createElement("button");
  button.className = "secondary__tab";
  button.textContent = tab.label;
  button.dataset.tab = tab.id;
  button.setAttribute("role", "tab");
  button.setAttribute("aria-selected", "false");
  button.tabIndex = index === 0 ? 0 : -1;
  button.addEventListener("click", () => selectTab(button));
  tabButtons.push(button);
  tabsRoot.append(button);
});

tabsRoot.addEventListener("keydown", (event) => {
  const current = tabButtons.findIndex((b) => b.getAttribute("aria-selected") === "true");
  let next = null;
  if (event.key === "ArrowRight") next = (current + 1) % tabButtons.length;
  if (event.key === "ArrowLeft") next = (current - 1 + tabButtons.length) % tabButtons.length;
  if (next !== null) {
    selectTab(tabButtons[next]);
    tabButtons[next].focus();
    event.preventDefault();
  }
});

tabButtons[0].setAttribute("aria-selected", "true");
renderPanel(SECONDARY_TABS[0].id);

// --- Main view: events (sample), search results, page view ---

const viewHome = document.getElementById("view-home");
const viewResults = document.getElementById("view-results");
const viewPage = document.getElementById("view-page");
const resultsList = document.getElementById("results-list");
const resultsTitle = document.getElementById("results-title");
const eventsList = document.getElementById("events-list");

const SAMPLE_EVENTS = [
  { date: "OCT 03", title: "Event 01", detail: "Location 01 · 12:00–14:00" },
  { date: "OCT 07", title: "Event 02", detail: "Location 02 · 17:00–19:00" },
  { date: "OCT 14", title: "Event 03", detail: "Location 03 · All day" },
  { date: "OCT 22", title: "Event 04", detail: "Location 04 · 10:00–11:30" }
];

if (eventsList) {
  SAMPLE_EVENTS.forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "event-row";
    const date = document.createElement("span");
    date.className = "event-row__date";
    date.textContent = item.date;
    const text = document.createElement("span");
    text.className = "event-row__text";
    const title = document.createElement("span");
    title.className = "event-row__title";
    title.textContent = item.title;
    const detail = document.createElement("span");
    detail.className = "event-row__detail";
    detail.textContent = item.detail;
    text.append(title, detail);
    row.append(date, text);
    eventsList.append(row);
  });
}

function showView(name) {
  viewHome.hidden = name !== "home";
  viewResults.hidden = name !== "results";
  viewPage.hidden = name !== "page";
}

function rankPage(page, query) {
  const q = query.toLowerCase();
  const title = (page.title || "").toLowerCase();
  const crumbs = (page.crumbs || "").toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (crumbs.includes(q)) return 3;
  return -1;
}

function showResults(query) {
  const matches = (window.PORTAL_PAGES || [])
    .map((page) => ({ page, rank: rankPage(page, query) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.page.title.localeCompare(b.page.title));

  resultsTitle.textContent = `Results — “${query}” (${matches.length})`;
  resultsList.replaceChildren();

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "results-empty";
    empty.textContent = "No pages matched. (Search covers page titles and sections from the current site index.)";
    resultsList.append(empty);
  }

  matches.forEach(({ page }) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "result-row";
    const title = document.createElement("span");
    title.className = "result-row__title";
    title.textContent = page.title;
    const crumbs = document.createElement("span");
    crumbs.className = "result-row__crumbs";
    crumbs.textContent = page.crumbs || page.slug;
    const meta = document.createElement("span");
    meta.className = "result-row__meta";
    meta.textContent = [page.audience, page.type].filter((part) => part && part !== "TBD").join(" · ");
    row.append(title, crumbs, meta);
    row.addEventListener("click", () => showPage(page));
    resultsList.append(row);
  });

  showView("results");
}

function showPage(page) {
  const crumbs = document.getElementById("page-crumbs");
  const title = document.getElementById("page-title");
  const meta = document.getElementById("page-meta");

  crumbs.replaceChildren();
  (page.crumbs || page.slug).split("/").forEach((part, index, all) => {
    if (index > 0) crumbs.append(" / ");
    crumbs.append(part);
  });

  title.textContent = page.title;
  meta.textContent = [page.audience, page.type, page.words ? `${page.words} words` : null]
    .filter((part) => part && part !== "TBD")
    .join(" · ");
  showView("page");
}

document.getElementById("results-back").addEventListener("click", () => showView("home"));
document.getElementById("page-back").addEventListener("click", () => showView("results"));
