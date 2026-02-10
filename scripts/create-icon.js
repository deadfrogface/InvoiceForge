/**
 * Erstellt eine 256x256 ICO-Datei für InvoiceForge – Rechnung/Dokument-Icon.
 * Ausführen: node scripts/create-icon.js
 */
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'assets', 'icon.ico');
const SIZE = 256;

// ---- ICO-Struktur ----
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

const xorSize = SIZE * SIZE * 4;
const andRowBytes = Math.floor((SIZE + 31) / 32) * 4;
const andSize = SIZE * andRowBytes;
const dibSize = 40 + xorSize + andSize;
const fileOffset = 6 + 16;

const entry = Buffer.alloc(16);
entry[0] = 0;
entry[1] = 0;
entry[2] = 0;
entry[3] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(dibSize, 8);
entry.writeUInt32LE(fileOffset, 12);

const dibHeader = Buffer.alloc(40);
dibHeader.writeUInt32LE(40, 0);
dibHeader.writeInt32LE(SIZE, 4);
dibHeader.writeInt32LE(SIZE * 2, 8);
dibHeader.writeUInt16LE(1, 12);
dibHeader.writeUInt16LE(32, 14);
dibHeader.writeUInt32LE(0, 16);
dibHeader.writeUInt32LE(xorSize + andSize, 20);
dibHeader.writeInt32LE(0, 24);
dibHeader.writeInt32LE(0, 28);

// ---- Farben (BGRA) ----
function setPixel(pixels, x, y, b, g, r, a) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const row = SIZE - 1 - y; // bottom-up
  const o = (row * SIZE + x) * 4;
  pixels[o] = b;
  pixels[o + 1] = g;
  pixels[o + 2] = r;
  pixels[o + 3] = a;
}

const pixels = Buffer.alloc(xorSize);
const alpha = 0xFF;

// Hellblau Hintergrund (#E3F2FD)
const bgB = 0xFD, bgG = 0xF2, bgR = 0xE3;
// Blau Dokument (#1565C0 – kräftiger)
const docB = 0xC0, docG = 0x65, docR = 0x15;
// Dunkelblau Akzent (#0D47A1)
const darkB = 0xA1, darkG = 0x47, darkR = 0x0D;
// Weiß für Linien
const white = 0xFF;

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    setPixel(pixels, x, y, bgB, bgG, bgR, alpha);
  }
}

// Dokument: Rechteck mit abgeschnittener Ecke (oben rechts)
const docLeft = 40, docRight = 216, docTop = 36, docBottom = 220;
const foldSize = 36; // abgeschrägte Ecke

function insideDocument(x, y) {
  if (y < docTop || y > docBottom || x < docLeft) return false;
  if (x > docRight) return false;
  // Gefaltete Ecke: Dreieck oben rechts
  if (y < docTop + foldSize && x > docRight - foldSize) {
    const dx = x - (docRight - foldSize);
    const dy = y - docTop;
    if (dx + dy < foldSize) return false; // Loch in der Ecke
  }
  return true;
}

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    if (insideDocument(x, y)) {
      setPixel(pixels, x, y, docB, docG, docR, alpha);
    }
  }
}

// Weiße Rechnungs-Linien im Dokument
const lineY = [docTop + 42, docTop + 78, docTop + 114, docTop + 150];
const lineLeft = docLeft + 16;
const lineRight = docRight - 16;
const lineHeight = 8;

for (const cy of lineY) {
  for (let dy = -lineHeight / 2; dy <= lineHeight / 2; dy++) {
    for (let x = lineLeft; x <= lineRight; x++) {
      const y = Math.round(cy + dy);
      if (insideDocument(x, y)) setPixel(pixels, x, y, white, white, white, alpha);
    }
  }
}

// Kurze Akzent-Linie (wie Unterschrift) unten
const sigY = docBottom - 28;
for (let dy = -3; dy <= 3; dy++) {
  for (let x = docLeft + 16; x <= docLeft + 80; x++) {
    const y = Math.round(sigY + dy);
    if (insideDocument(x, y)) setPixel(pixels, x, y, darkB, darkG, darkR, alpha);
  }
}

// Kleiner Kreis/Euro-Akzent (optional): Punkt neben Dokument
const cx = 200, cy = 200, r = 20;
for (let y = cy - r; y <= cy + r; y++) {
  for (let x = cx - r; x <= cx + r; x++) {
    if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
      setPixel(pixels, x, y, darkB, darkG, darkR, alpha);
    }
  }
}

const andMask = Buffer.alloc(andSize, 0);

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, entry, dibHeader, pixels, andMask]));
console.log('Icon erstellt (256x256):', outPath);
