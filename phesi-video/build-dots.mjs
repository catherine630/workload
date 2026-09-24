import fs from 'fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = feature(topo, topo.objects.land);
const W = 1920, H = 860, step = 12;
const K=6, lon0=-135, lat0=84;
const pts = [];
for (let y = step/2; y < H; y += step) for (let x = step/2; x < W; x += step) {
  let lon = lon0 + x/K; const lat = lat0 - y/K;
  if (lon > 180) lon -= 360;
  if (geoContains(land, [lon, lat])) pts.push([Math.round(x), Math.round(y)]);
}
fs.writeFileSync('dots.json', JSON.stringify(pts));
console.log(pts.length);
