const assert = require("node:assert/strict");
const crypto = require("node:crypto");
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

test("all nine motion scenes include user controls and reduced-motion support", () => {
  assert.equal((indexHtml.match(/data-motion-scene/g) || []).length, 9);
  assert.equal((indexHtml.match(/data-motion-toggle(?=[\s>])/g) || []).length, 9);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.motion-scene\[data-motion-state="paused"\]/);
});

test("career evidence carousel includes eight senior-level signals", () => {
  assert.equal((indexHtml.match(/class="proof-card /g) || []).length, 8);
  assert.match(indexHtml, /data-proof-prev/);
  assert.match(indexHtml, /data-proof-next/);
  assert.match(indexHtml, /Architecture decisions/);
  assert.match(indexHtml, /50k\+ documents/);
  assert.match(indexHtml, /Reusable systems/);
  assert.match(indexHtml, /Cross-functional delivery/);
});

test("senior positioning follows the revised CV hierarchy", () => {
  assert.match(
    indexHtml,
    /Senior Frontend Engineer · TypeScript · React · Angular/,
  );
  assert.match(
    indexHtml,
    /Scalable frontend architecture[\s\S]*Delivered to production/,
  );
  assert.match(indexHtml, /Frontend ownership backed by systems thinking/);
  assert.match(
    indexHtml,
    /From hands-on delivery to senior frontend ownership/,
  );
  assert.match(indexHtml, /Technical ownership from architecture to production/);
  assert.match(indexHtml, />Next\.js</);
  assert.match(indexHtml, /Application security fundamentals/);
  assert.match(indexHtml, /Production debugging &amp; iteration/);
});

test("resume asset and professional evidence follow the September 2026 CV", () => {
  const resumePdf = fs.readFileSync(
    "assets/resume/sujeith-gopinath-resume-en.pdf",
  );
  const resumeHash = crypto.createHash("sha256").update(resumePdf).digest("hex");

  assert.equal(
    resumeHash,
    "a3aa101a53ba41484d7fd3a71741f6e8e94d52600c91dd547dcf54c0609a632c",
  );
  assert.ok(fs.existsSync("assets/resume/previews/resume-en-page-1.jpg"));
  assert.ok(fs.existsSync("assets/resume/previews/resume-en-page-2.jpg"));
  assert.match(indexHtml, /sujeith-gopinath-resume-en\.pdf\?v=20260909\.1/);
  assert.match(
    indexHtml,
    /50,000 documents from roughly 10–15 seconds to around 2 seconds/,
  );
  assert.match(indexHtml, /IoU-based comparison/);
  assert.match(indexHtml, /PM2, Redis shared state/);
  assert.match(indexHtml, /realtime WebSocket updates/);
  assert.match(indexHtml, /two external development agencies/);
  assert.doesNotMatch(translationSource, /microfront|Blockly/i);
  assert.doesNotMatch(
    indexHtml,
    /microfrontend-aligned|supporting microfrontend|Blockly-based/i,
  );
  assert.match(
    styles,
    /\.resume-dialog-close span:not\(\[aria-hidden\]\)\s*\{\s*display: none;/,
  );
});

test("professional work appears before independent portfolio projects", () => {
  const workIndex = indexHtml.indexOf('id="work"');
  const productionArchiveIndex = indexHtml.indexOf('class="archive-grid"');
  const independentIndex = indexHtml.indexOf('data-i18n="independent.eyebrow"');
  const keyNestIndex = indexHtml.indexOf('id="keynest"');
  const neonDeckIndex = indexHtml.indexOf('id="neondeck"');
  const scaleForgeIndex = indexHtml.indexOf('id="scaleforge"');
  const observatoryIndex = indexHtml.indexOf('id="engineering-observatory"');

  assert.ok(
    indexHtml.indexOf('href="#work"') < indexHtml.indexOf('href="#project"'),
    "Main navigation should lead with professional work",
  );
  assert.ok(
    workIndex < productionArchiveIndex &&
      productionArchiveIndex < independentIndex &&
      independentIndex < keyNestIndex &&
      keyNestIndex < neonDeckIndex &&
      neonDeckIndex < scaleForgeIndex &&
      scaleForgeIndex < observatoryIndex,
    "All professional work should appear before the independent project group",
  );
});

test("each independent project owns an accessible product screenshot gallery", () => {
  assert.match(indexHtml, /Four systems\. One architecture portfolio\./);
  assert.equal((indexHtml.match(/data-evidence-gallery/g) || []).length, 4);
  assert.equal((indexHtml.match(/class="project-evidence-slide"/g) || []).length, 8);
  assert.equal((indexHtml.match(/data-evidence-carousel/g) || []).length, 4);
  assert.equal((indexHtml.match(/data-evidence-prev/g) || []).length, 4);
  assert.equal((indexHtml.match(/data-evidence-next/g) || []).length, 4);
  assert.match(scriptSource, /initEvidenceGallery/);
  assert.match(scriptSource, /evidenceGalleries\.forEach/);
  assert.match(styles, /\.project-evidence-track/);
  assert.ok(fs.existsSync("assets/projects/keynest-auth-ui.png"));
  assert.ok(fs.existsSync("assets/projects/keynest-vault-ui.jpg"));
  assert.ok(fs.existsSync("assets/projects/neondeck-home.png"));
  assert.ok(fs.existsSync("assets/projects/neondeck-runtime.png"));
  assert.ok(fs.existsSync("assets/projects/scaleforge-openapi.png"));
  assert.ok(fs.existsSync("assets/projects/scaleforge-operations.jpg"));
  assert.ok(fs.existsSync("assets/projects/observatory-dashboard.jpg"));
  assert.ok(fs.existsSync("assets/projects/observatory-findings.jpg"));
  assert.match(indexHtml, /Inside KeyNest/);
  assert.match(indexHtml, /Inside NeonDeck/);
  assert.match(indexHtml, /Inside ScaleForge/);
  assert.match(indexHtml, /Inside Engineering Observatory/);
  assert.match(indexHtml, /Vault dashboard · Synthetic demo/);
  assert.match(indexHtml, /Runtime boundary · Local machine inventory/);
  assert.match(indexHtml, /OpenAPI contract · Generated from the repository/);
  assert.match(indexHtml, /Operations dashboard · Local stack/);
  assert.match(indexHtml, /Analysis dashboard · Deterministic fixture/);
  assert.match(indexHtml, /Findings dashboard · Deterministic fixture/);
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

test("KeyNest is presented as a verifiable work-in-progress project", () => {
  assert.match(indexHtml, /case-study-keynest/);
  assert.match(indexHtml, /Independent project · Work in progress/);
  assert.match(indexHtml, /github\.com\/sujithgnth\/password-manager/);
  assert.match(indexHtml, /AES-256-GCM/);
  assert.match(indexHtml, /RabbitMQ/);
  assert.match(indexHtml, /Prometheus/);
  assert.match(indexHtml, /Grafana/);
  assert.match(styles, /@keyframes keynest-packet/);
});

test("ScaleForge presents a verifiable resilient backend architecture", () => {
  assert.match(indexHtml, /case-study-scaleforge/);
  assert.match(indexHtml, /Backend architecture project · 2026/);
  assert.match(indexHtml, /github\.com\/sujithgnth\/scaleforge/);
  assert.match(indexHtml, /transactional outbox/);
  assert.match(indexHtml, /RabbitMQ retries and dead-letter queues/);
  assert.match(indexHtml, /Testcontainers/);
  assert.match(indexHtml, /class="scaleforge-flow"/);
  assert.match(styles, /@keyframes scaleforge-event-hop/);
  assert.match(styles, /@keyframes scaleforge-log-cycle/);
});

test("NeonDeck is presented as a private local-first work in progress", () => {
  assert.match(indexHtml, /case-study-neondeck/);
  assert.match(indexHtml, /Private desktop project · Work in progress/);
  assert.match(indexHtml, /Private repository · Invite-only WIP preview/);
  assert.match(indexHtml, /narrow Zod-validated IPC/);
  assert.match(indexHtml, /read-only machine inventory/);
  assert.match(indexHtml, /Apple-silicon macOS/);
  assert.match(styles, /\.neondeck-visual/);
  assert.doesNotMatch(indexHtml, /href="https:\/\/github\.com\/sujithgnth\/neondeck"/);
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
  assert.match(indexHtml, /Architecture portfolio project · Work in progress/);
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
  const structuredData = JSON.parse(
    indexHtml.match(
      /<script type="application\/ld\+json" id="profile-structured-data">([\s\S]*?)<\/script>/,
    )[1],
  );
  assert.ok(
    structuredData.hasPart.some(
      (project) =>
        project.name === "ScaleForge" &&
        project.codeRepository === "https://github.com/sujithgnth/scaleforge",
    ),
  );
  assert.ok(
    structuredData.hasPart.some(
      (project) =>
        project.name === "NeonDeck" &&
        project.applicationCategory === "DeveloperApplication" &&
        !("codeRepository" in project),
    ),
  );
  assert.ok(
    structuredData.hasPart.some(
      (project) =>
        project.name === "KeyNest" &&
        project.codeRepository === "https://github.com/sujithgnth/password-manager",
    ),
  );
  assert.match(indexHtml, /rel="sitemap"/);
  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(sitemap, /\?lang=en/);
});
