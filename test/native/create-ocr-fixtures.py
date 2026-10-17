"""Build-time test fixtures only; Python is not an application dependency."""
import pathlib
import sys
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

root = pathlib.Path(sys.argv[1]); root.mkdir(parents=True, exist_ok=True)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 48)
for language, lines in {
    'deu': ['RECHNUNG 2026-0042', 'Lieferant: Musterhandel', 'Gesamtbetrag: 119,00 EUR'],
    'eng': ['INVOICE 2026-0043', 'Supplier: Example Company', 'Total amount: 238.00 EUR'],
}.items():
    image = Image.new('RGB', (1800, 700), 'white')
    draw = ImageDraw.Draw(image)
    for index, line in enumerate(lines): draw.text((80, 100 + index * 120), line, font=font, fill='black')
    image.save(root / (language + '.png'))
    scan = canvas.Canvas(str(root / (language + '-scan.pdf')), pagesize=(900, 350))
    scan.drawImage(ImageReader(image), 0, 0, width=900, height=350); scan.save()
text = canvas.Canvas(str(root / 'digital.pdf'))
text.drawString(70, 740, 'InvoiceForge digital invoice 2026-0044 Total 357.00 EUR'); text.save()
(root / 'damaged.pdf').write_bytes(b'%PDF-1.4 damaged document without trailer')
