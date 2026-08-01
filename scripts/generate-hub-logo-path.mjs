import opentype from 'opentype.js'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fontPath = resolve(
  __dirname,
  '../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
)
const buffer = readFileSync(fontPath)
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))

const text = 'Luc Fery'
const fontSize = 100
const path = font.getPath(text, 0, 0, fontSize)
const bbox = path.getBoundingBox()

const bboxWidth = bbox.x2 - bbox.x1
const bboxHeight = bbox.y2 - bbox.y1
const bboxCx = (bbox.x1 + bbox.x2) / 2
const bboxCy = (bbox.y1 + bbox.y2) / 2

// viewBox 0 0 200 100 (deux fois plus large que haute) : le nom tient sur une ligne, et
// le cercle de départ y reste rond puisque HubCore.vue affiche le SVG au même rapport.
// La contrainte de largeur est celle qui mord sur un mot de cette longueur, mais on prend
// le minimum des deux pour que le script reste juste si le texte change.
const maxWidth = 184
const maxHeight = 72
const scale = Math.min(maxWidth / bboxWidth, maxHeight / bboxHeight)
const center = { x: 100, y: 50 }

const scaledPath = new opentype.Path()
for (const cmd of path.commands) {
  const c = { ...cmd }
  for (const key of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) {
    if (key in c) {
      // font.getPath() retourne déjà des coordonnées prêtes pour du SVG/canvas
      // (Y vers le bas) : pas d'inversion d'axe nécessaire, juste un recentrage + mise à l'échelle.
      const isX = key[0] === 'x'
      const origin = isX ? bboxCx : bboxCy
      c[key] = (isX ? center.x : center.y) + (c[key] - origin) * scale
    }
  }
  scaledPath.commands.push(c)
}

const d = scaledPath.toPathData(2)
const outputPath = resolve(__dirname, '../app/components/hub/hubLogoPath.ts')
writeFileSync(
  outputPath,
  '// Généré par scripts/generate-hub-logo-path.mjs — ne pas éditer à la main.\n'
  + `// Contour de "${text}" (Space Grotesk 700), normalisé dans un viewBox 0 0 200 100,\n`
  + '// centré sur le cercle de départ du logo (cx=100 cy=50 r=48).\n'
  + `export const LOGO_PATH_D = '${d}'\n`,
)

console.log(`Écrit dans ${outputPath}`)
