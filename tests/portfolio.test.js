const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const indexHtml = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const scriptSource = fs.readFileSync("script.js", "utf8");
const translationSource = fs.readFileSync("translations.js", "utf8");
const iconSprite = fs.readFileSync("assets/tech-icons.svg", "utf8");
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const translationContext = { window: {} };

vm.createContext(translationContext);
vm.runInContext(translationSource, translationContext);

const { en, de } = translationContext.window.portfolioTranslations;

test("English and German expose the same translation keys", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(de).sort());
});

test("production assets are cache-versioned and translation fallbacks stay readable", () => {
  assert.match(indexHtml, /styles\.css\?v=\d{8}\.\d+/);
  assert.match(indexHtml, /translations\.js\?v=\d{8}\.\d+/);
  assert.match(indexHtml, /script\.js\?v=\d{8}\.\d+/);
  assert.match(scriptSource, /window\.portfolioTranslations \?\? \{ en: \{\}, de: \{\} \}/);
  assert.match(scriptSource, /translate\(element\.dataset\.i18n, element\.textContent\)/);
});

test("every translation key referenced by the page exists", () => {
  const referencedKeys = [
    ...indexHtml.matchAll(/data-i18n(?:-html|-aria|-alt)?="([^"]+)"/g),
  ].map((match) => match[1]);

  assert.ok(referencedKeys.length > 0);

  for (const key of new Set(referencedKeys)) {
    assert.ok(key in en, `Missing English translation: ${key}`);
    assert.ok(key in de, `Missing German translation: ${key}`);
  }
});

test("all seven motion scenes include user controls and reduced-motion support", () => {
  assert.equal((indexHtml.match(/data-motion-scene/g) || []).length, 7);
  assert.equal((indexHtml.match(/data-motion-toggle(?=[\s>])/g) || []).length, 7);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.motion-scene\[data-motion-state="paused"\]/);
});

test("career evidence carousel includes eight senior-level signals", () => {
  assert.equal((indexHtml.match(/class="proof-card /g) || []).length, 8);
  assert.match(indexHtml, /data-proof-prev/);
  assert.match(indexHtml, /data-proof-next/);
  assert.match(indexHtml, /Architecture decisions/);
  assert.match(indexHtml, /Performance investigations/);
  assert.match(indexHtml, /Reusable systems/);
  assert.match(indexHtml, /Cross-functional delivery/);
});

test("hero uses the illustrated high-resolution portrait", () => {
  assert.match(indexHtml, /sujeith-cartoon\.jpg/);
  assert.match(indexHtml, /width="1200"/);
  assert.match(indexHtml, /height="800"/);
  assert.match(styles, /@keyframes portrait-drift/);
});

test("career evidence includes six feature-delivery systems", () => {
  assert.equal((indexHtml.match(/class="feature-card feature-card-/g) || []).length, 6);
  assert.match(indexHtml, /Latest feature deliveries/);
  assert.match(indexHtml, /Multi-annotator review systems/);
  assert.match(indexHtml, /Custom robot-motion workflows/);
  assert.match(indexHtml, /Audit, COD and item tracking/);
  assert.match(indexHtml, /Order orchestration and notifications/);
  assert.match(indexHtml, /Reusable architecture across teams/);
  assert.match(indexHtml, /Critical workflows protected end to end/);
  assert.match(indexHtml, /feature-ai-animation/);
  assert.match(indexHtml, /feature-robot-animation/);
  assert.match(indexHtml, /feature-logistics-animation/);
  assert.match(indexHtml, /feature-order-animation/);
  assert.match(indexHtml, /feature-platform-animation/);
  assert.match(indexHtml, /feature-quality-animation/);
});

test("robot workflow responds to scrolling without overriding reduced motion", () => {
  assert.match(indexHtml, /data-robot-scroll/);
  assert.match(indexHtml, /robot-scroll-rail/);
  assert.match(scriptSource, /updateRobotScrollScene/);
  assert.match(scriptSource, /if \(robotScrollVisual && !reducedMotion\)/);
  assert.match(styles, /--robot-scroll-thumb/);
});

test("archive workflows use distinct operational animations and stronger positioning", () => {
  assert.match(indexHtml, /Product ownership at scale/);
  assert.match(indexHtml, /Critical workflows scaled, modernised and operated/);
  assert.match(indexHtml, /From legacy UI to a shipment operations platform/);
  assert.match(indexHtml, /Restaurant ordering built for rapid growth/);
  assert.match(indexHtml, /class="shipment-network"/);
  assert.match(indexHtml, /class="kitchen-board"/);
  assert.match(styles, /@keyframes network-route-flow/);
  assert.match(styles, /@keyframes kitchen-timer/);
  assert.match(styles, /@keyframes push-toast-arrive/);
});

test("Engineering Observatory is presented as an evidence-first work in progress", () => {
  assert.match(indexHtml, /id="project"/);
  assert.match(indexHtml, /Engineering Observatory/);
  assert.match(indexHtml, /Portfolio project · Work in progress/);
  assert.match(indexHtml, /Deterministic analysis before AI/);
  assert.match(indexHtml, /k6 or Autocannon/);
  assert.match(
    indexHtml,
    /https:\/\/github\.com\/sujithgnth\/engineering-observatory/,
  );
  assert.match(indexHtml, /engineering-observatory-cover\.jpg/);
  assert.match(styles, /\.project-spotlight/);
  assert.match(styles, /\.project-preview/);
  assert.match(indexHtml, /class="project-analysis-animation"/);
  assert.match(indexHtml, /REPO[\s\S]*AST[\s\S]*RULES[\s\S]*EVIDENCE/);
  assert.match(styles, /@keyframes project-repository-scan/);
  assert.match(styles, /@keyframes project-evidence-flow/);
});

test("project technology pills use the local icon sprite", () => {
  assert.match(scriptSource, /assets\/tech-icons\.svg/);
  assert.match(styles, /\.tech-icon/);
  assert.match(iconSprite, /<symbol id="react"/);
  assert.match(iconSprite, /<symbol id="typescript"/);
  assert.match(iconSprite, /<symbol id="redux"/);
});

test("German-market SEO exposes localized crawl signals", () => {
  assert.match(indexHtml, /rel="canonical"/);
  assert.match(indexHtml, /hreflang="de-DE"/);
  assert.match(indexHtml, /hreflang="en"/);
  assert.match(indexHtml, /type="application\/ld\+json"/);
  assert.match(indexHtml, /"@type": "ProfilePage"/);
  assert.match(indexHtml, /rel="sitemap"/);
  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(sitemap, /\?lang=en/);
});
