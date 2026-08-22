const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const languageButtons = document.querySelectorAll(".language-button");
const motionScenes = document.querySelectorAll("[data-motion-scene]");
const motionToggles = document.querySelectorAll("[data-motion-toggle]");
const proofCarousel = document.querySelector("[data-proof-carousel]");
const proofPrevious = document.querySelector("[data-proof-prev]");
const proofNext = document.querySelector("[data-proof-next]");
const proofStatus = document.querySelector("[data-proof-status]");
const projectCarousel = document.querySelector("[data-project-carousel]");
const projectPrevious = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");
const projectStatus = document.querySelector("[data-project-status]");
const robotScrollSection = document.querySelector("[data-robot-scroll]");
const robotScrollVisual = robotScrollSection?.querySelector(".robot-visual");
const robotScrollBlocks = robotScrollVisual?.querySelectorAll(".block") ?? [];
const translations = window.portfolioTranslations ?? { en: {}, de: {} };
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
let proofScrollFrame = null;
let projectScrollFrame = null;
let robotScrollFrame = null;

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

function translate(key, fallback = key) {
  return translations[currentLanguage]?.[key] ?? translations.en?.[key] ?? fallback;
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

function getProofPageCount() {
  return Math.max(1, Math.round(proofCarousel.scrollWidth / proofCarousel.clientWidth));
}

function getProofPage() {
  const pageCount = getProofPageCount();
  return Math.min(
    pageCount,
    Math.max(1, Math.round(proofCarousel.scrollLeft / proofCarousel.clientWidth) + 1),
  );
}

function syncProofCarousel() {
  const pageCount = getProofPageCount();
  const currentPage = getProofPage();

  proofPrevious.disabled = currentPage === 1;
  proofNext.disabled = currentPage === pageCount;
  proofStatus.textContent = `${currentPage} / ${pageCount}`;
}

function moveProofCarousel(direction) {
  proofCarousel.scrollBy({
    left: direction * proofCarousel.clientWidth,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

proofPrevious.addEventListener("click", () => moveProofCarousel(-1));
proofNext.addEventListener("click", () => moveProofCarousel(1));

proofCarousel.addEventListener(
  "scroll",
  () => {
    if (proofScrollFrame) cancelAnimationFrame(proofScrollFrame);
    proofScrollFrame = requestAnimationFrame(syncProofCarousel);
  },
  { passive: true },
);

proofCarousel.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  moveProofCarousel(event.key === "ArrowRight" ? 1 : -1);
});

window.addEventListener("resize", syncProofCarousel, { passive: true });
syncProofCarousel();

function getProjectPageCount() {
  if (!projectCarousel) return 1;
  return Math.max(1, Math.round(projectCarousel.scrollWidth / projectCarousel.clientWidth));
}

function getProjectPage() {
  const pageCount = getProjectPageCount();
  return Math.min(
    pageCount,
    Math.max(1, Math.round(projectCarousel.scrollLeft / projectCarousel.clientWidth) + 1),
  );
}

function syncProjectCarousel() {
  if (!projectCarousel || !projectPrevious || !projectNext || !projectStatus) return;

  const pageCount = getProjectPageCount();
  const currentPage = getProjectPage();

  projectPrevious.disabled = currentPage === 1;
  projectNext.disabled = currentPage === pageCount;
  projectStatus.textContent = `${currentPage} / ${pageCount}`;
}

function moveProjectCarousel(direction) {
  if (!projectCarousel) return;

  projectCarousel.scrollBy({
    left: direction * projectCarousel.clientWidth,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

if (projectCarousel && projectPrevious && projectNext) {
  projectPrevious.addEventListener("click", () => moveProjectCarousel(-1));
  projectNext.addEventListener("click", () => moveProjectCarousel(1));

  projectCarousel.addEventListener(
    "scroll",
    () => {
      if (projectScrollFrame) cancelAnimationFrame(projectScrollFrame);
      projectScrollFrame = requestAnimationFrame(syncProjectCarousel);
    },
    { passive: true },
  );

  projectCarousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveProjectCarousel(event.key === "ArrowRight" ? 1 : -1);
  });

  window.addEventListener("resize", syncProjectCarousel, { passive: true });
  syncProjectCarousel();
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
    element.textContent = translate(element.dataset.i18n, element.textContent);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18nHtml, element.innerHTML);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      translate(element.dataset.i18nAria, element.getAttribute("aria-label")),
    );
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute(
      "alt",
      translate(element.dataset.i18nAlt, element.getAttribute("alt")),
    );
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

function updateRobotScrollScene() {
  robotScrollFrame = null;

  if (!robotScrollSection || !robotScrollVisual || reducedMotion) return;
  if (robotScrollVisual.dataset.motionState === "paused") return;

  const bounds = robotScrollSection.getBoundingClientRect();
  const start = window.innerHeight * 0.84;
  const distance = bounds.height + window.innerHeight * 0.68;
  const progress = Math.min(1, Math.max(0, (start - bounds.top) / distance));
  const reach = Math.sin(progress * Math.PI);
  const targetStrength = Math.min(1, Math.max(0, (progress - 0.42) / 0.3));
  const activeStep = Math.min(robotScrollBlocks.length - 1, Math.floor(progress * robotScrollBlocks.length));

  robotScrollVisual.style.setProperty("--robot-arm-one-angle", `${-66 + reach * 8}deg`);
  robotScrollVisual.style.setProperty("--robot-arm-two-angle", `${22 - reach * 14}deg`);
  robotScrollVisual.style.setProperty("--robot-claw-angle", `${22 - reach * 10}deg`);
  robotScrollVisual.style.setProperty("--robot-claw-x", `${reach * 7}px`);
  robotScrollVisual.style.setProperty("--robot-claw-y", `${reach * 5}px`);
  robotScrollVisual.style.setProperty("--robot-grid-shift", `${progress * 96}px`);
  robotScrollVisual.style.setProperty("--robot-panel-shift", `${44 - progress * 88}px`);
  robotScrollVisual.style.setProperty("--robot-scroll-thumb", `${progress * 100}%`);
  robotScrollVisual.style.setProperty("--robot-target-opacity", `${0.35 + targetStrength * 0.65}`);
  robotScrollVisual.style.setProperty("--robot-target-scale", `${1.35 - targetStrength * 0.35}`);
  robotScrollVisual.dataset.scrollStep = String(activeStep + 1);

  robotScrollBlocks.forEach((block, index) => {
    block.classList.toggle("is-scroll-active", index === activeStep);
  });
}

function requestRobotScrollUpdate() {
  if (robotScrollFrame || reducedMotion) return;
  robotScrollFrame = requestAnimationFrame(updateRobotScrollScene);
}

if (robotScrollVisual && !reducedMotion) {
  robotScrollVisual.dataset.scrollLinked = "true";
  window.addEventListener("scroll", requestRobotScrollUpdate, { passive: true });
  window.addEventListener("resize", requestRobotScrollUpdate, { passive: true });
  requestRobotScrollUpdate();
}

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
    if (scene === robotScrollVisual) requestRobotScrollUpdate();
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
