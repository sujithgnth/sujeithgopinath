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

const resumeDialog = document.querySelector("#resume-dialog");
const resumeViewButtons = document.querySelectorAll(".resume-view-button");
const resumeDialogPages = document.querySelectorAll(".resume-dialog-pages");
const resumeDialogTitle = document.querySelector("#resume-dialog-title");
const resumeDialogMeta = document.querySelector("#resume-dialog-meta");
const resumeDialogClose = document.querySelector("#resume-dialog-close");
const resumeDialogDownload = document.querySelector("#resume-dialog-download");

resumeViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    resumeDialogPages.forEach((pages) => {
      pages.hidden = pages.id !== button.dataset.resumeTarget;
    });

    resumeDialogTitle.textContent = button.dataset.resumeTitle;
    resumeDialogMeta.textContent = button.dataset.resumeMeta;
    resumeDialogDownload.href = button.dataset.resumeHref;
    resumeDialogDownload.download = button.dataset.downloadFilename;
    resumeDialogDownload.textContent = `${button.dataset.downloadLabel} ↓`;

    if (typeof resumeDialog.showModal === "function") {
      resumeDialog.showModal();
    } else {
      resumeDialog.setAttribute("open", "");
    }
  });
});

resumeDialogClose.addEventListener("click", () => resumeDialog.close());

resumeDialog.addEventListener("click", (event) => {
  if (event.target === resumeDialog) resumeDialog.close();
});
