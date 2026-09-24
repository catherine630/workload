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
const html = fs.readFileSync(here + 'scene.html', 'utf8')
  .replace('__FONT__', 'data:font/woff2;base64,' + font)
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
