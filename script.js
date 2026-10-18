const viewTitles = {
  overview: "Overview",
  about: "About me",
  projects: "Projects",
  skills: "Skills & tech",
  experience: "Experience",
  contact: "Contact",
};

const sidebar = document.querySelector("#sidebar");
const viewport = document.querySelector("#view-viewport");
const mobileMenuButton = document.querySelector(".mobile-menu-button");
const themeToggle = document.querySelector(".theme-toggle");
let activeView;
let pendingGoatCounterPath;

async function initializeVisitorBadge() {
  const badge = document.querySelector("#visitor-count");
  try {
    const response = await fetch("https://aj-kaharudin.goatcounter.com/counter/TOTAL.json");
    if (!response.ok) {
      console.warn(`GoatCounter visitor count unavailable (HTTP ${response.status}). Enable the public visitor counter in GoatCounter site settings.`);
      return;
    }

    const data = await response.json();
    if (typeof data.count !== "string") {
      console.warn("GoatCounter visitor count response did not include a count.");
      return;
    }

    document.querySelector("#visitor-count-value").textContent = data.count;
  } catch (error) {
    console.warn("GoatCounter visitor count could not be loaded.", error);
  }
}

function trackViewChange(viewName) {
  if (activeView === undefined) {
    activeView = viewName;
    return;
  }
  if (activeView === viewName) return;

  activeView = viewName;
  const path = `/${viewName}`;
  if (window.goatcounter?.count) window.goatcounter.count({ path });
  else pendingGoatCounterPath = path;
}

function setActiveView(viewName, updateHistory = true) {
  if (!viewTitles[viewName]) return;
  trackViewChange(viewName);

  document.querySelectorAll(".view").forEach((view) => {
    const isSelected = view.id === `view-${viewName}`;
    view.hidden = !isSelected;
    view.classList.toggle("is-visible", isSelected);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    const isSelected = item.dataset.view === viewName;
    item.classList.toggle("is-active", isSelected);
    if (isSelected) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });

  document.querySelectorAll(".mobile-bottom-nav [data-view]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.view === viewName);
  });

  document.querySelector("#crumb-current").textContent = viewTitles[viewName];
  document.title = `${viewTitles[viewName]} — Abdulkadir Jaerison Bravo Kaharudin`;
  sidebar.classList.remove("is-open");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.setAttribute("aria-label", "Open navigation");
  viewport.scrollTop = 0;

  if (updateHistory) history.replaceState(null, "", `#${viewName}`);
}

document.querySelector('script[data-goatcounter]')?.addEventListener("load", () => {
  if (!pendingGoatCounterPath || !window.goatcounter?.count) return;
  const path = pendingGoatCounterPath;
  pendingGoatCounterPath = undefined;
  window.goatcounter.count({ path });
});
initializeVisitorBadge();

function setTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#090b0d" : "#f0f2f3";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.title = isDark ? "Switch to light theme" : "Switch to dark theme";
  themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i>`;
  if (window.lucide) window.lucide.createIcons();
  try {
    localStorage.setItem("portfolio-theme-v2", isDark ? "dark" : "light");
  } catch {
    // The theme still works for this visit when storage is unavailable.
  }
}

document.querySelectorAll("[data-view], [data-go]").forEach((control) => {
  control.addEventListener("click", () => {
    const requestedView = control.dataset.view || control.dataset.go;
    setActiveView(requestedView);
  });
});

document.querySelector(".mobile-menu-button").addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("is-open");
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("click", (event) => {
  if (window.innerWidth <= 780 && sidebar.classList.contains("is-open") &&
      !sidebar.contains(event.target) && !mobileMenuButton.contains(event.target)) {
    sidebar.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.setAttribute("aria-label", "Open navigation");
  }
});

themeToggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark-theme"));
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());
document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

try {
  const savedTheme = localStorage.getItem("portfolio-theme-v2");
  setTheme(savedTheme !== "light");
} catch {
  setTheme(true);
}

const initialView = window.location.hash.slice(1);
setActiveView(viewTitles[initialView] ? initialView : "overview", false);
if (window.lucide) window.lucide.createIcons();

window.addEventListener("hashchange", () => {
  const viewName = window.location.hash.slice(1);
  if (viewTitles[viewName]) setActiveView(viewName, false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
    sidebar.classList.remove("is-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.setAttribute("aria-label", "Open navigation");
  }
});