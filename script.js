const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const storedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
  themeColor.setAttribute("content", theme === "dark" ? "#11120f" : "#f4f1ea");
}

applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

const header = document.querySelector(".site-header");
const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 12);

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

document.querySelector("#current-year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

const resumeTabs = [...document.querySelectorAll(".resume-tab")];
const resumeFrame = document.querySelector("#resume-frame");
const resumeOpenLink = document.querySelector("#resume-open-link");
const resumeLanguageStatus = document.querySelector("#resume-language-status");

function selectResume(tab) {
  resumeTabs.forEach((item) => {
    const isSelected = item === tab;
    item.classList.toggle("is-active", isSelected);
    item.setAttribute("aria-selected", String(isSelected));
    item.tabIndex = isSelected ? 0 : -1;
  });

  resumeFrame.src = tab.dataset.resumeSrc;
  resumeFrame.title = tab.dataset.resumeTitle;
  resumeOpenLink.href = tab.dataset.resumeSrc.split("#")[0];
  resumeLanguageStatus.textContent = tab.dataset.resumeLanguage;
}

resumeTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectResume(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + resumeTabs.length) % resumeTabs.length;
    resumeTabs[nextIndex].focus();
    selectResume(resumeTabs[nextIndex]);
  });
});
