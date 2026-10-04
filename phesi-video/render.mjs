// Builds the standalone scene and renders it to MP4.
// Usage: node render.mjs            -> phesi-trial-accelerator.mp4
//        node render.mjs stills 3 12 -> PNG stills at the given seconds (for review)
import fs from 'fs';
import { spawn } from 'child_process';
import { chromium } from 'playwright';

const FPS = 30;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const here = new URL('.', import.meta.url).pathname;

const font = fs.readFileSync(here + 'inter.woff2').toString('base64');

// Brand font: drop Franie Regular and SemiBold files (.woff2/.woff/.otf/.ttf) into fonts/.
// Until they are there, the video falls back to Inter.
const FONT_TYPES = { woff2: 'woff2', woff: 'woff', otf: 'opentype', ttf: 'truetype' };
const fontFiles = fs.existsSync(here + 'fonts') ? fs.readdirSync(here + 'fonts') : [];
function brandFace(test, weight) {
  const f = fontFiles.find(n => /franie/i.test(n) && test.test(n) && FONT_TYPES[n.split('.').pop().toLowerCase()]);
  if (!f) return '';
  const ext = f.split('.').pop().toLowerCase();
  const data = fs.readFileSync(here + 'fonts/' + f).toString('base64');
  console.log(`using ${f} for weight ${weight}`);
  return `  @font-face { font-family: "Franie"; src: url(data:font/${ext};base64,${data}) format("${FONT_TYPES[ext]}"); font-weight: ${weight}; }\n`;
}
const brandFonts = brandFace(/regular|book|-400/i, 400) + brandFace(/semi.?bold|-600/i, 600);
if (!brandFonts) console.log('Franie font files not found in fonts/; using Inter');

const html = fs.readFileSync(here + 'scene.html', 'utf8')
  .replace('__FONT__', 'data:font/woff2;base64,' + font)
  .replace('__BRANDFONTS__', brandFonts)
  .replace('__LOGO__', 'data:image/png;base64,' + fs.readFileSync(here + 'logo-white.png').toString('base64'))
  .replace('__DOTS__', fs.readFileSync(here + 'dots.json', 'utf8'));
fs.writeFileSync(here + 'phesi-trial-accelerator.html', html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + here + 'phesi-trial-accelerator.html?capture');
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'stills') {
  fs.mkdirSync(here + 'stills', { recursive: true });
  for (const s of rest) {
    await page.evaluate(t => window.render(t), +s);
    await page.screenshot({ path: `${here}stills/t${s}.png` });
  }
} else {
  const out = here + 'phesi-trial-accelerator.mp4';
  const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(duration * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
