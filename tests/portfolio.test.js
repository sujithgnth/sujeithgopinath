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

test("all five motion scenes include user controls and reduced-motion support", () => {
  assert.equal((indexHtml.match(/data-motion-scene/g) || []).length, 5);
  assert.equal((indexHtml.match(/data-motion-toggle(?=[\s>])/g) || []).length, 5);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.motion-scene\[data-motion-state="paused"\]/);
});

test("career evidence includes six feature-delivery systems", () => {
  assert.equal((indexHtml.match(/class="feature-card"/g) || []).length, 6);
  assert.match(indexHtml, /Multi-annotator review systems/);
  assert.match(indexHtml, /Custom robot-motion workflows/);
  assert.match(indexHtml, /Audit, COD and item tracking/);
  assert.match(indexHtml, /Order orchestration and notifications/);
  assert.match(indexHtml, /Reusable architecture across teams/);
  assert.match(indexHtml, /Critical workflows protected end to end/);
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
