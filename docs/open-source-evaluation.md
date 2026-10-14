# Open-Source-Bestandsaufnahme für InvoiceForge (2026-10-14)

InvoiceForge bleibt lokal. Fremdwerkzeuge werden nur mit lokalem Prozessstart aufgerufen; es erfolgt keine Cloud-Übertragung.

| Aufgabe | Projekt / Lizenz | Entscheidung |
| --- | --- | --- |
| Text aus digitalen PDF | Poppler pdftotext / GPL | Bereits über lokalen CLI-Adapter in main/document-extraction.js nutzbar; nicht eingebettet, lokale Installation erforderlich |
| Scan-PDF OCR | OCRmyPDF / MPL-2.0 und Abhängigkeiten | Bereits über lokalen CLI-Adapter nutzbar; lokale Installation erforderlich |
| Bild-OCR | Tesseract / Apache-2.0 | Bereits über lokalen CLI-Adapter nutzbar; lokale Installation und Sprachdaten erforderlich |
| XRechnung / EN16931 / ZUGFeRD | Mustangproject / Apache-2.0 | Bevorzugt statt eigenem XML-Regelwerk; noch nicht integriert. Die bisherige Regex-Prüfung ist **keine** Validierung. |
| XRechnung-Regeln | KoSIT Validator + XRechnung-Konfiguration / Apache-2.0 | Alternativ bzw. als unabhängige Prüfung; Regeln und Versionen müssen paketiert und gepflegt werden |
| XBRL | Arelle / Apache-2.0 | Für technische XBRL-Prüfung evaluieren, keine fertige deutsche E-Bilanz-Taxonomie-Zuordnung |
| Doppelte Buchführung | GnuCash / überwiegend GPL | Vollständiger Ersatz des bestehenden Journals wäre ein großes Migrationsprojekt. Nicht blind kopieren; bestehende Tests, Kontenplan und Buchungsregeln zunächst vervollständigen |
| Amtliche Steuerübermittlung | ERiC (ELSTER) / behördliches SDK | Kein gewöhnliches Open-Source-Paket. Herstellerregistrierung, Zugang und Hersteller-ID erforderlich; noch nicht integriert |

## Verbindliche Sicherheitsregeln
- Fremdprogramme nur mit Argumentarrays und shell:false starten, niemals Rechnungsinhalte als Shell-Befehl ausführen.
- OCR-Texterkennung liefert **keine** verlässliche steuerliche Kontierung. Manuelle Freigabe bleibt Pflicht.
- Ohne echte Validator-Laufzeit und aktuelle Schematron-/XSD-Regeln darf die App E-Rechnungen nicht als EN16931-konform markieren.
- Kein Steuerformular und keine ELSTER-Übermittlung ohne offizielle Schemata, fachliche Testfälle und nachgewiesene erfolgreiche Tests.
- Bei Auslieferung: alle notwendigen Werkzeuge, Sprachdaten, Lizenzen und NOTICE-Dateien für Windows/macOS/Linux paketieren. Die bisherigen Adapter erkennen nur bereits installierte lokale Werkzeuge.
- Aufbewahrung, Zugriffsrechte, externe Backups und Verfahrensdokumentation sind zusätzlich erforderlich; ein Hash-Journal allein garantiert keine GoBD-Konformität.

## Quellen
- https://github.com/ZUGFeRD/mustangproject
- https://github.com/itplr-kosit/validator-configuration-xrechnung
- https://github.com/ocrmypdf/OCRmyPDF
- https://github.com/tesseract-ocr/tesseract
- https://github.com/Arelle/Arelle
- https://github.com/Gnucash/gnucash
- https://www.elster.de/elsterweb/infoseite/entwickler
