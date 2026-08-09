const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const languageButtons = document.querySelectorAll(".language-button");
const motionScenes = document.querySelectorAll("[data-motion-scene]");
const motionToggles = document.querySelectorAll("[data-motion-toggle]");
const translations = window.portfolioTranslations;
const storedTheme = localStorage.getItem("portfolio-theme");
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canonicalLink = document.querySelector('link[rel="canonical"]');
const openGraphUrl = document.querySelector('meta[property="og:url"]');
const openGraphLocale = document.querySelector('meta[property="og:locale"]');
const profileStructuredData = document.querySelector("#profile-structured-data");
const portfolioUrl = "https://sujithgnth.github.io/sujeithgopinath/";
let currentLanguage = requestedLanguage === "en" ? "en" : "de";
let activeResumeButton = null;

const techIconIds = {
  Angular: "angular",
  TypeScript: "typescript",
  NestJS: "nestjs",
  NgRx: "redux",
  Nx: "nx",
  MongoDB: "mongodb",
  "S3-compatible storage": "generic",
  Playwright: "playwright",
  React: "react",
  "Redux Toolkit": "redux",
  Redux: "redux",
  Tailwind: "tailwind",
  Storybook: "storybook",
  Cypress: "cypress",
  Webpack: "webpack",
  "Node.js": "nodejs",
  Express: "express",
  GraphQL: "graphql",
  Redis: "redis",
  PWA: "pwa",
};

const techTags = document.querySelectorAll(".tag-list span");
techTags.forEach((tag) => {
  tag.dataset.techIcon = techIconIds[tag.textContent.trim()] ?? "generic";
});

function translate(key) {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
}

function syncMotionToggle(button) {
  const scene = button.closest("[data-motion-scene]");
  const isPaused = scene?.dataset.motionState === "paused";
  const label = translate(
    isPaused ? "accessibility.playMotion" : "accessibility.pauseMotion",
  );

  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(isPaused));
  button.querySelector("[data-motion-toggle-label]").textContent = label;
  button.querySelector(".motion-toggle-icon").textContent = isPaused ? "▶" : "Ⅱ";
}

function syncTechIcons() {
  techTags.forEach((tag) => {
    tag.querySelector(".tech-icon")?.remove();

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    const iconId = tag.dataset.techIcon;

    icon.classList.add("tech-icon", `tech-icon-${iconId}`);
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    use.setAttribute("href", `./assets/tech-icons.svg#${iconId}`);
    icon.append(use);
    tag.prepend(icon);
  });
}

function syncSeoLanguage() {
  const languageUrl = currentLanguage === "en" ? `${portfolioUrl}?lang=en` : portfolioUrl;
  const imageAlt = translate("meta.imageAlt");

  canonicalLink.href = languageUrl;
  openGraphUrl.setAttribute("content", languageUrl);
  openGraphLocale.setAttribute("content", currentLanguage === "de" ? "de_DE" : "en_GB");
  document
    .querySelector('meta[property="og:image:alt"]')
    .setAttribute("content", imageAlt);
  document
    .querySelector('meta[name="twitter:image:alt"]')
    .setAttribute("content", imageAlt);

  if (profileStructuredData) {
    const profile = JSON.parse(profileStructuredData.textContent);
    profile.name =
      currentLanguage === "de"
        ? "Portfolio von Sujeith Gopinath"
        : "Portfolio of Sujeith Gopinath";
    profile.inLanguage = currentLanguage === "de" ? "de-DE" : "en";
    profile.mainEntity.description = translate("meta.description");
    profileStructuredData.textContent = JSON.stringify(profile);
  }
}

function syncLanguageUrl() {
  const url = new URL(window.location.href);

  if (currentLanguage === "en") {
    url.searchParams.set("lang", "en");
  } else {
    url.searchParams.delete("lang");
  }

  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
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

function applyLanguage(language, updateUrl = false) {
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

  syncSeoLanguage();
  syncTechIcons();
  applyTheme(root.dataset.theme);
  motionToggles.forEach(syncMotionToggle);
  localStorage.setItem("portfolio-language", currentLanguage);

  if (updateUrl) syncLanguageUrl();

  if (activeResumeButton) syncResumeDialog(activeResumeButton);
}

applyLanguage(currentLanguage);

languageButtons.forEach((button) => {
  button.addEventListener("click", () =>
    applyLanguage(button.dataset.language, true),
  );
});

const header = document.querySelector(".site-header");
const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 12);

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

document.querySelector("#current-year").textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll(".reveal");

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

motionToggles.forEach((button) => {
  if (reducedMotion) {
    button.hidden = true;
    return;
  }

  button.addEventListener("click", () => {
    const scene = button.closest("[data-motion-scene]");
    scene.dataset.motionState =
      scene.dataset.motionState === "paused" ? "running" : "paused";
    syncMotionToggle(button);
  });
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  motionScenes.forEach((scene) => {
    scene.dataset.inView = reducedMotion ? "false" : "true";
  });
} else {
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.dataset.inView = String(entry.isIntersecting);
      });
    },
    { rootMargin: "12% 0px 12% 0px", threshold: 0.12 },
  );

  motionScenes.forEach((scene) => motionObserver.observe(scene));
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
