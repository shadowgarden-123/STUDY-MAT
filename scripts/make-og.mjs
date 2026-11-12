/**
 * Fabrique l'image d'aperçu des liens partagés (WhatsApp, réseaux, messageries).
 * Sortie : public/og-univ-share.png, 1200 × 630, palette du site, aucune ombre.
 *
 * Usage : bun run og
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decompress } from "wawoff2";

const WIDTH = 1200;
const HEIGHT = 630;

// Palette reprise de src/styles/tokens.css
const INK = "#14201b";
const GREEN = "#0f6b4f";
const LINE = "#dde3df";
const BG = "#f5f7f2";
const MUTED = "#5b6b63";

const FONTS = [
  "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2",
  "node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2",
  "node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-700-normal.woff2",
];

/** resvg ne lit pas les woff2 : on les décompresse en TTF dans un dossier temporaire. */
async function prepareFonts() {
  const dir = await mkdtemp(join(tmpdir(), "univ-share-og-"));
  const files = [];
  for (const [index, source] of FONTS.entries()) {
    const ttf = await decompress(await readFile(source));
    const target = join(dir, `fonte-${index}.ttf`);
    await writeFile(target, ttf);
    files.push(target);
  }
  return files;
}

/** Papier millimétré : une trame tous les 30 px. */
function grid() {
  const lines = [];
  for (let x = 30; x < WIDTH; x += 30) {
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${LINE}" stroke-width="1"/>`,
    );
  }
  for (let y = 30; y < HEIGHT; y += 30) {
    lines.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`,
    );
  }
  return lines.join("");
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  ${grid()}
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="${INK}" stroke-width="2"/>

  <text x="72" y="118" font-family="Nunito Sans" font-weight="700" font-size="24"
    letter-spacing="3" fill="${GREEN}">ENTRAIDE ÉTUDIANTE · CAMPUS</text>

  <text x="72" y="252" font-family="Bricolage Grotesque" font-weight="700" font-size="86"
    letter-spacing="-3" fill="${INK}">Trouve ton matériel de TP.</text>
  <text x="72" y="352" font-family="Bricolage Grotesque" font-weight="700" font-size="86"
    letter-spacing="-3" fill="${INK}">Donne ce qui ne te sert plus.</text>

  <rect x="72" y="398" width="132" height="7" fill="${GREEN}"/>

  <text x="72" y="486" font-family="Nunito Sans" font-size="30" fill="${MUTED}">Livres, cours et TD, composants, matériel de labo,</text>
  <text x="72" y="528" font-family="Nunito Sans" font-size="30" fill="${MUTED}">entre étudiants du campus.</text>

  <text x="72" y="592" font-family="Bricolage Grotesque" font-weight="700" font-size="28"
    letter-spacing="-0.5" fill="${GREEN}">Univ-Share</text>
</svg>`;

const resvg = new Resvg(svg, {
  font: {
    fontFiles: await prepareFonts(),
    loadSystemFonts: false,
    defaultFontFamily: "Nunito Sans",
  },
  fitTo: { mode: "width", value: WIDTH },
});

const png = resvg.render().asPng();
await writeFile("public/og-univ-share.png", png);
console.log(`public/og-univ-share.png — ${Math.round(png.length / 1024)} Ko`);
