/**
 * Erstellt eine 256x256 ICO-Datei für InvoiceForge (electron-builder verlangt mind. 256x256).
 * Ausführen: node scripts/create-icon.js
 */
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'assets', 'icon.ico');
const SIZE = 256;

// ICO header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

// 256x256 32bpp: XOR 256*256*4, AND 256 rows × 32 bytes/row
const xorSize = SIZE * SIZE * 4;
const andRowBytes = Math.floor((SIZE + 31) / 32) * 4;
const andSize = SIZE * andRowBytes;
const dibSize = 40 + xorSize + andSize;
const fileOffset = 6 + 16;

// Directory entry: 0,0 = 256 (ICO speichert 256 als 0 im 1-Byte-Feld)
const entry = Buffer.alloc(16);
entry[0] = SIZE === 256 ? 0 : SIZE;
entry[1] = SIZE === 256 ? 0 : SIZE;
entry[2] = 0;
entry[3] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(dibSize, 8);
entry.writeUInt32LE(fileOffset, 12);

// DIB header
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

// 256x256 BGRA pixels (bottom-up): blauer Rand, weißer Innenbereich
const pixels = Buffer.alloc(xorSize);
const blue = 0xE3;
const green = 0x6A;
const red = 0x0D;
const alpha = 0xFF;
const borderPx = 8;

for (let y = SIZE - 1; y >= 0; y--) {
  const rowStart = (SIZE - 1 - y) * SIZE * 4;
  for (let x = 0; x < SIZE; x++) {
    const border = x < borderPx || x >= SIZE - borderPx || y < borderPx || y >= SIZE - borderPx;
    const o = rowStart + x * 4;
    if (border) {
      pixels[o] = blue;
      pixels[o + 1] = green;
      pixels[o + 2] = red;
      pixels[o + 3] = alpha;
    } else {
      pixels[o] = 0xFF;
      pixels[o + 1] = 0xFF;
      pixels[o + 2] = 0xFF;
      pixels[o + 3] = alpha;
    }
  }
}

const andMask = Buffer.alloc(andSize, 0);

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, entry, dibHeader, pixels, andMask]));
console.log('Icon erstellt (256x256):', outPath);
