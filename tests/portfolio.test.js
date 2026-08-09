const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const indexHtml = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const translationSource = fs.readFileSync("translations.js", "utf8");
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
