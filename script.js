const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const languageButtons = document.querySelectorAll(".language-button");
const translations = window.portfolioTranslations;
const storedTheme = localStorage.getItem("portfolio-theme");
const storedLanguage = localStorage.getItem("portfolio-language");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const browserLanguage = navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
let currentLanguage =
  storedLanguage === "de" || storedLanguage === "en" ? storedLanguage : browserLanguage;
let activeResumeButton = null;

function translate(key) {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark"
      ? translate("accessibility.switchToLight")
      : translate("accessibility.switchToDark"),
  );
  themeColor.setAttribute("content", theme === "dark" ? "#11120f" : "#f4f1ea");
}

applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

function applyLanguage(language) {
  currentLanguage = language === "de" ? "de" : "en";
  root.lang = currentLanguage;
  root.dataset.language = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAria));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", translate(element.dataset.i18nAlt));
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.title = translate("meta.title");
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", translate("meta.description"));
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", translate("meta.title"));
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", translate("meta.socialDescription"));
  document
    .querySelector('meta[name="twitter:title"]')
    .setAttribute("content", translate("meta.title"));
  document
    .querySelector('meta[name="twitter:description"]')
    .setAttribute("content", translate("meta.socialDescription"));

  applyTheme(root.dataset.theme);
  localStorage.setItem("portfolio-language", currentLanguage);

  if (activeResumeButton) syncResumeDialog(activeResumeButton);
}

applyLanguage(currentLanguage);

languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
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

function syncResumeDialog(button) {
  resumeDialogTitle.textContent = translate(button.dataset.resumeTitleKey);
  resumeDialogMeta.textContent = translate(button.dataset.resumeMetaKey);
  resumeDialogDownload.href = button.dataset.resumeHref;
  resumeDialogDownload.download = button.dataset.downloadFilename;
  resumeDialogDownload.innerHTML = `${translate("resume.download")} <span aria-hidden="true">↓</span>`;
}

resumeViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeResumeButton = button;

    resumeDialogPages.forEach((pages) => {
      pages.hidden = pages.id !== button.dataset.resumeTarget;
    });

    syncResumeDialog(button);

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
