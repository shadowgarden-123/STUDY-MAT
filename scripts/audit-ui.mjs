/**
 * Audit navigateur des écrans publics : 390, 768 et 1280 px.
 * Prérequis : serveur dev lancé sur http://localhost:5173 et
 * `bunx playwright install chromium`.
 * Sort en erreur si axe, le débordement, les polices ou la console échouent.
 */
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const BASE = process.env.AUDIT_URL ?? "http://localhost:5173";
const axeSource = await readFile("node_modules/axe-core/axe.min.js", "utf8");
const browser = await chromium.launch();
const failures = [];
const scanned = [];

const routes = [
  "/",
  "/annonce/PREMIER",
  "/comment-ca-marche",
  "/connexion",
  "/inscription",
  "/publier",
  "/messages",
  "/profil",
  "/confidentialite",
  "/_styleguide",
  "/inconnue",
];

for (const width of [390, 768, 1280]) {
  const page = await browser.newPage({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  for (const route of routes) {
    let path = route;
    if (route.includes("PREMIER")) {
      await page.goto(BASE, { waitUntil: "networkidle" });
      const href = await page
        .locator('a[href^="/annonce/"]')
        .first()
        .getAttribute("href");
      if (!href) {
        failures.push(`${width}px : aucune annonce pour tester la fiche`);
        continue;
      }
      path = href;
    }

    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    const layout = await page.evaluate(() => {
      const h1s = [...document.querySelectorAll("h1")];
      const bodyFont = getComputedStyle(document.body).fontFamily;
      const h1Font = h1s[0] ? getComputedStyle(h1s[0]).fontFamily : "";
      const overflow =
        document.documentElement.scrollWidth - window.innerWidth;
      const small = [...document.querySelectorAll(
        'a, button, input:not([type="hidden"]), select, textarea, [role="button"]',
      )]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const after = getComputedStyle(element, "::after");
          const stretchedLink =
            after.position === "absolute" && after.inset !== "auto";
          const inlineProseLink = element.closest(".us-prose") !== null;
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            !stretchedLink &&
            !inlineProseLink &&
            (rect.width < 44 || rect.height < 44)
          );
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const label =
            element.getAttribute("aria-label") ||
            element.textContent?.trim().slice(0, 40) ||
            element.tagName;
          return `${label} (${Math.round(rect.width)}×${Math.round(rect.height)})`;
        });
      const brokenImages = [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      return {
        h1: h1s.length,
        h1Font,
        bodyFont,
        overflow,
        small,
        brokenImages,
      };
    });

    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        resultTypes: ["violations"],
      });
      return result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.slice(0, 4).map((node) => node.target.join(" ")),
      }));
    });

    const label = `${width}px ${path}`;
    scanned.push(label);
    if (layout.h1 !== 1) failures.push(`${label} : ${layout.h1} h1`);
    if (!layout.h1Font.includes("Bricolage")) {
      failures.push(`${label} : police de titre absente`);
    }
    if (!layout.bodyFont.includes("Nunito")) {
      failures.push(`${label} : police de texte absente`);
    }
    if (layout.overflow > 0) {
      failures.push(`${label} : débordement de ${layout.overflow}px`);
    }
    if (layout.small.length > 0) {
      failures.push(`${label} : cibles courtes ${layout.small.join(", ")}`);
    }
    if (layout.brokenImages.length > 0) {
      failures.push(`${label} : images cassées ${layout.brokenImages.join(", ")}`);
    }
    for (const violation of axe) {
      failures.push(`${label} : axe ${violation.id} (${violation.nodes.join(", ")})`);
    }
    for (const error of errors) failures.push(`${label} : console ${error}`);
    errors.length = 0;
  }
  await page.close();
}

await browser.close();

if (failures.length > 0) {
  console.error(`${failures.length} problème(s) sur ${scanned.length} chargements :`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `${scanned.length} chargements audit 390 / 768 / 1280 px : 0 violation axe, 0 débordement, 0 erreur console.`,
);
