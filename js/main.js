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
  ONEPRATT_DATA.categories
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

        li.append(link);
        ul.append(li);
      });

      nav.append(h2, ul);
      categoriesRoot.append(nav);
    });
}

buildCategories();

const entryForm = document.querySelector(".search-entry__form");
entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
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
