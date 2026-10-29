// node mkphotos.mjs [outdir] -- test photos for q91 with planted metadata. Pixels are drawn in Chromium (canvas -> JPEG .95); this script then
// plants an APP1 Exif block (Orientation, Make, Model, DateTime, a GPS IFD: 37°46'30" N 122°25'10" W), an APP1 XMP block (GPS, creator) and a
// COM comment. Upright pictures are known (top red, bottom blue on the orientation photos), so a test can tell the right way up.
//   portrait6.jpg  3024 x 4032 upright portrait, stored turned (Orientation 6), textured: big enough that .82 does not fit 400 KB
//   rot3.jpg       2000 x 1200 upright, stored upside down (Orientation 3)
//   rot8.jpg       1200 x 1800 upright portrait, stored turned the other way (Orientation 8)
//   land.jpg       2400 x 1600 sky and hills (Orientation 1)
//   bright.jpg     1800 x 1200 near white;  dark.jpg 1800 x 1200 near black;  spot.jpg: dark with one small white spot under the title
//   notphoto.jpg   text bytes named .jpg
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

export const MARKS = ['Exif', 'GPS', 'Secret Lane', 'Test Rider', 'ns.adobe.com', 'FredTestCam', 'Model Q91'];

function be16(n) { return [(n >> 8) & 255, n & 255]; }
function be32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
// a big-endian TIFF block: IFD0 (Make, Model, Orientation, DateTime, GPS pointer) and a GPS IFD
export function exifBlock(ori) {
  const asc = s => [...Buffer.from(s + '\0', 'latin1')];
  const make = asc('FredTestCam'), model = asc('Model Q91'), date = asc('2026:10:15 07:12:00');
  const n0 = 5, ifd0 = 8, ifd0Len = 2 + n0 * 12 + 4;
  let data = ifd0 + ifd0Len; const extra = [];
  const put = bytes => { const at = data; extra.push(...bytes); data += bytes.length; if (bytes.length % 2) { extra.push(0); data++; } return at; };
  const makeAt = put(make), modelAt = put(model), dateAt = put(date);
  const gpsAt = data; const nG = 5, gpsLen = 2 + nG * 12 + 4; data += gpsLen; const gpsData = [];
  let gd = gpsAt + gpsLen; const gput = bytes => { const at = gd; gpsData.push(...bytes); gd += bytes.length; return at; };
  const rat = (a, b) => [...be32(a), ...be32(b)];
  const latAt = gput([...rat(37, 1), ...rat(46, 1), ...rat(3000, 100)]), lonAt = gput([...rat(122, 1), ...rat(25, 1), ...rat(1000, 100)]);
  const ent = (tag, type, count, val) => [...be16(tag), ...be16(type), ...be32(count), ...val];
  const out = [0x4D, 0x4D, 0, 42, ...be32(ifd0), ...be16(n0),
    ...ent(0x010F, 2, make.length, be32(makeAt)), ...ent(0x0110, 2, model.length, be32(modelAt)), ...ent(0x0112, 3, 1, [...be16(ori), 0, 0]),
    ...ent(0x0132, 2, date.length, be32(dateAt)), ...ent(0x8825, 4, 1, be32(gpsAt)), 0, 0, 0, 0, ...extra];
  out.push(...be16(nG), ...ent(0, 1, 4, [2, 3, 0, 0]), ...ent(1, 2, 2, [0x4E, 0, 0, 0]), ...ent(2, 5, 3, be32(latAt)), ...ent(3, 2, 2, [0x57, 0, 0, 0]), ...ent(4, 5, 3, be32(lonAt)), 0, 0, 0, 0, ...gpsData);
  return Buffer.from(out);
}
export function plant(jpeg, ori) {
  const tiff = exifBlock(ori), exif = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]);
  const xmpTxt = 'http://ns.adobe.com/xap/1.0/\0<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/" exif:GPSLatitude="37,46.5N" exif:GPSLongitude="122,25.16W"><dc:creator>Test Rider</dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>';
  const seg = (m, body) => Buffer.concat([Buffer.from([0xFF, m, ...be16(body.length + 2)]), body]);
  const com = seg(0xFE, Buffer.from('Shot at 1 Secret Lane', 'latin1'));
  return Buffer.concat([jpeg.subarray(0, 2), seg(0xE1, exif), seg(0xE1, Buffer.from(xmpTxt, 'latin1')), com, jpeg.subarray(2)]);
}

export async function makePhotos(out, browser) {
  fs.mkdirSync(out, { recursive: true });
  const b = browser || await chromium.launch(); const p = await b.newPage();
  await p.setContent('<canvas id=c></canvas>');
  // draw(spec) in the page: the upright picture, then turned for storage (turn: 0, 90 = stored turned 90 deg anticlockwise (EXIF 6), 180, 270)
  const shot = async (spec) => Buffer.from(await p.evaluate(async s => {
    const up = document.createElement('canvas'); up.width = s.w; up.height = s.h; const c = up.getContext('2d');
    if (s.kind === 'rgb') { c.fillStyle = '#E02020'; c.fillRect(0, 0, s.w, s.h / 3); c.fillStyle = '#20B040'; c.fillRect(0, s.h / 3, s.w, s.h / 3); c.fillStyle = '#2040E0'; c.fillRect(0, 2 * s.h / 3, s.w, s.h / 3); }
    if (s.kind === 'land') { const g = c.createLinearGradient(0, 0, 0, s.h); g.addColorStop(0, '#5B8FD6'); g.addColorStop(.55, '#F2B880'); g.addColorStop(.6, '#5C7A3A'); g.addColorStop(1, '#2E4A1E'); c.fillStyle = g; c.fillRect(0, 0, s.w, s.h); c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(s.w * .55, s.h * .5, s.h * .08, 0, 7); c.fill(); }
    if (s.kind === 'flat') { c.fillStyle = s.col; c.fillRect(0, 0, s.w, s.h); }
    if (s.spot) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(s.w * s.spot[0], s.h * s.spot[1], s.w * s.spot[2], 0, 7); c.fill(); }
    if (s.noise) { const d = c.getImageData(0, 0, s.w, s.h), a = d.data; let r = 12345; for (let i = 0; i < a.length; i += 4) { r = (r * 1103515245 + 12345) >>> 0; const n = ((r >>> 16) % (2 * s.noise + 1)) - s.noise; a[i] = Math.max(0, Math.min(255, a[i] + n)); a[i + 1] = Math.max(0, Math.min(255, a[i + 1] + n)); a[i + 2] = Math.max(0, Math.min(255, a[i + 2] + n)); } c.putImageData(d, 0, 0); }
    const t = s.turn || 0, sw = t % 180 ? s.h : s.w, sh = t % 180 ? s.w : s.h, st = document.createElement('canvas'); st.width = sw; st.height = sh; const k = st.getContext('2d');
    k.translate(sw / 2, sh / 2); k.rotate(-t * Math.PI / 180); k.drawImage(up, -s.w / 2, -s.h / 2);
    const bl = await new Promise(res => st.toBlob(res, 'image/jpeg', .95)); return [...new Uint8Array(await bl.arrayBuffer())];
  }, spec));
  const list = [
    ['portrait6.jpg', { kind: 'rgb', w: 3024, h: 4032, turn: 90, noise: 34 }, 6],
    ['rot3.jpg', { kind: 'rgb', w: 2000, h: 1200, turn: 180, noise: 6 }, 3],
    ['rot8.jpg', { kind: 'rgb', w: 1200, h: 1800, turn: 270, noise: 6 }, 8],
    ['land.jpg', { kind: 'land', w: 2400, h: 1600, noise: 8 }, 1],
    ['bright.jpg', { kind: 'flat', col: '#F6F5EE', w: 1800, h: 1200, noise: 4 }, 1],
    ['dark.jpg', { kind: 'flat', col: '#1C232B', w: 1800, h: 1200, noise: 4 }, 1],
    ['spot.jpg', { kind: 'flat', col: '#1C232B', w: 1800, h: 1200, noise: 4, spot: [.12, .76, .012] }, 1],
  ];
  for (const [name, spec, ori] of list) fs.writeFileSync(path.join(out, name), plant(await shot(spec), ori));
  fs.writeFileSync(path.join(out, 'notphoto.jpg'), 'this is not a photo\n'.repeat(50));
  await p.close(); if (!browser) await b.close();
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const out = await makePhotos(process.argv[2] || path.join(path.dirname(process.argv[1]), 'photos'));
  for (const f of fs.readdirSync(out)) console.log(f, fs.statSync(path.join(out, f)).size);
}
