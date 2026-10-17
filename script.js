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

function setActiveView(viewName, updateHistory = true) {
  if (!viewTitles[viewName]) return;

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

function setTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  themeToggle.title = isDark ? "Switch to light theme" : "Switch to dark theme";
  themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i>`;
  if (window.lucide) window.lucide.createIcons();
  try {
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
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

document.querySelector(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  setActiveView("overview");
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

const skillDialog = document.querySelector(".skill-dialog");
const skillForm = document.querySelector(".skill-dialog-form");
const skillInput = document.querySelector("#skill-name");
let activeSkillGroup;

function saveSkills() {
  const skills = {};
  document.querySelectorAll(".add-skill").forEach((button) => {
    const group = button.closest(".skill-group");
    skills[button.dataset.skillGroup] = [...group.querySelectorAll(".skill-pills > span[data-user-skill]")]
      .map((item) => item.textContent);
  });

  try {
    localStorage.setItem("portfolio-skills", JSON.stringify(skills));
  } catch {
    // Skills remain in the page for this visit when storage is unavailable.
  }
}

function addSkillPill(container, skill) {
  const pill = document.createElement("span");
  pill.textContent = skill;
  pill.dataset.userSkill = "true";
  container.insertBefore(pill, container.querySelector(".add-skill"));
}

document.querySelectorAll(".add-skill").forEach((button) => {
  button.addEventListener("click", () => {
    activeSkillGroup = button.closest(".skill-group");
    document.querySelector("#skill-dialog-group").textContent = `ADD TO ${button.dataset.skillGroup.toUpperCase()}`;
    skillInput.value = "";
    skillDialog.showModal();
    skillInput.focus();
  });
});

skillForm.addEventListener("submit", (event) => {
  if (event.submitter?.value !== "add") return;
  event.preventDefault();
  const skill = skillInput.value.trim();
  if (!skill || !activeSkillGroup) return;

  const container = activeSkillGroup.querySelector(".skill-pills");
  container.querySelectorAll("[data-placeholder]").forEach((placeholder) => placeholder.remove());
  addSkillPill(container, skill);
  skillDialog.close();
  saveSkills();
});

document.querySelector(".skill-dialog-close").addEventListener("click", () => skillDialog.close());

try {
  const savedSkills = JSON.parse(localStorage.getItem("portfolio-skills") || "{}");
  document.querySelectorAll(".add-skill").forEach((button) => {
    const skills = savedSkills[button.dataset.skillGroup];
    if (!Array.isArray(skills) || skills.length === 0) return;
    const container = button.closest(".skill-group").querySelector(".skill-pills");
    container.querySelectorAll("[data-placeholder]").forEach((placeholder) => placeholder.remove());
    const existingSkills = new Set([...container.querySelectorAll(":scope > span:not([data-user-skill])")]
      .map((item) => item.textContent.trim().toLowerCase()));
    skills.forEach((skill) => {
      const normalizedSkill = String(skill).trim();
      if (!normalizedSkill || existingSkills.has(normalizedSkill.toLowerCase())) return;
      existingSkills.add(normalizedSkill.toLowerCase());
      addSkillPill(container, normalizedSkill);
    });
  });
} catch {
  // Ignore malformed or unavailable local storage and keep the sample prompts.
}

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date());
document.querySelector("#current-year").textContent = new Date().getFullYear();

try {
  setTheme(localStorage.getItem("portfolio-theme") !== "light");
} catch {
  setTheme(false);
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