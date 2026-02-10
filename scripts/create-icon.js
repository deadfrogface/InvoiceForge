/**
 * Erstellt eine minimale 32x32 ICO-Datei für InvoiceForge (blau/weiß).
 * Ausführen: node scripts/create-icon.js
 */
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'assets', 'icon.ico');

// ICO header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);   // reserved
header.writeUInt16LE(1, 2);   // type = ICO
header.writeUInt16LE(1, 4);   // count = 1

// 32x32 32bpp ICO: XOR 32*32*4 + AND mask 32*ceil(32/8) = 4096 + 128 = 4224, + 40 header = 4264
const xorSize = 32 * 32 * 4;
const andRow = Math.floor((32 + 31) / 32) * 4;
const andSize = 32 * andRow;
const dibSize = 40 + xorSize + andSize;
const fileOffset = 6 + 16;

// Directory entry (16 bytes)
const entry = Buffer.alloc(16);
entry[0] = 32;
entry[1] = 32;
entry[2] = 0;
entry[3] = 0;
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(dibSize, 8);
entry.writeUInt32LE(fileOffset, 12);

// DIB: BITMAPINFOHEADER 40 bytes
const dibHeader = Buffer.alloc(40);
dibHeader.writeUInt32LE(40, 0);
dibHeader.writeInt32LE(32, 4);
dibHeader.writeInt32LE(64, 8);  // 32*2 for XOR + AND
dibHeader.writeUInt16LE(1, 12);
dibHeader.writeUInt16LE(32, 14);
dibHeader.writeUInt32LE(0, 16);
dibHeader.writeUInt32LE(xorSize + andSize, 20);
dibHeader.writeInt32LE(0, 24);
dibHeader.writeInt32LE(0, 28);

// 32x32 32bpp pixels (BGRA, bottom-up). Einfaches blaues Quadrat auf weiß
const pixels = Buffer.alloc(32 * 32 * 4);
const blue = 0xE3;   // B
const green = 0x6A;  // G
const red = 0x0D;    // R (0d47a1)
const alpha = 0xFF;
for (let y = 31; y >= 0; y--) {
  for (let x = 0; x < 32; x++) {
    const i = (31 - y) * 32 + x;
    const o = i * 4;
    const border = x < 2 || x >= 30 || y < 2 || y >= 30;
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

// AND mask (1 bit per pixel, 0 = transparent): 32 rows, 4 bytes per row = 128 bytes, all 0
const andMask = Buffer.alloc(andSize, 0);

const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, entry, dibHeader, pixels, andMask]));
console.log('Icon erstellt:', outPath);
