// Leonida Platinum Guide: an independently written offline field guide and personal trophy ledger.
// A working gta6-trophy-guide-01 entry (Node 22, standard library only): the guide is this directory's app/ folder,
// plain static files a browser opens at app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json. The program hands it in: it copies app/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// The app includes 55 individually written guides, a five-stage roadmap, a missables report and a next-up planner.
// Earned marks, notes and counters are stored locally and can be exported or imported. Spoiler cover masks unearned
// story entries in the ledger, including search. Validate guide coverage before copying the entry. The first
// screenshot by name is the cover; shots.json records the four reproducible preview scenes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
if (!existsSync(join(here, 'app/index.html'))) throw new Error('Missing guide: app/index.html');
const { trophies } = JSON.parse(readFileSync(join(here, 'app/data/trophies.json'), 'utf8'));
if (!Array.isArray(trophies) || trophies.length !== 55 || trophies.some(trophy => typeof trophy.guide !== 'string' || !trophy.guide.trim())) {
  throw new Error('All 55 trophies must have a non-blank guide.');
}
const screenshotFiles = readdirSync(join(here, 'screenshots'), { withFileTypes: true }).filter(entry => entry.isFile());
const images = screenshotFiles.filter(entry => /\.(png|jpe?g)$/i.test(entry.name));
if (images.length < 3 || images.length > 4) throw new Error('The guide needs three or four screenshots.');
if (images.length !== screenshotFiles.length) throw new Error('Screenshots must be PNG or JPEG images.');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
