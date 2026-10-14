# Offline-Komponenten in InvoiceForge
InvoiceForge soll keine separate Installation von OCR-, PDF-, Java- oder Validierungsprogrammen durch Endnutzer verlangen.

## Paketvertrag
- Alle nativen Werkzeuge liegen pro Plattform/Architektur unter `vendor/tools/<platform>/<arch>/`.
- electron-builder kopiert diese Werkzeuge nach `resources/tools/<platform>/<arch>/`.
- Der Laufzeitcode benutzt ausschließlich die mitgelieferten Werkzeuge, **niemals** zufällig vorhandene Programme aus PATH.
- `npm run verify:bundle` muss vor jedem Release erfolgreich sein. Ein Test auf vorhandene Dateien ersetzt keine Funktions-, Lizenz- und Signaturprüfung.
- Fehlende Werkzeuge führen zu einer klaren Fehlermeldung. Keine heimlichen Downloads und keine externen Installationsanweisungen.

## Noch nicht geliefert
Die Binärdateien von Poppler/Tesseract, Sprachdaten, OCRmyPDF samt Laufzeitabhängigkeiten, KoSIT/Mustangproject, die jeweils passenden Plattformpakete sowie das lizenz- und zugangspflichtige ERiC-SDK sind **noch nicht** in diesem Branch enthalten. Daher darf noch kein vollständiges Offline-Paket veröffentlicht werden. Vor Distribution: Quellen, Lizenzen, SHA-256, Signaturen, SBOM, Plattformtests und ggf. Copyleft-Pflichten prüfen.

## Abnahme
Für Windows, macOS und Linux separat: frische Maschine ohne Python, Java, Poppler, Tesseract oder zusätzliche Installationen; PDF-Text, Scan-OCR, UBL/CII/ZUGFeRD und alle validierten Buchungsfälle mit Testbelegen prüfen. Steuerübermittlung benötigt außerdem offizielle Zugangsdaten und Ende-zu-Ende-Tests.
