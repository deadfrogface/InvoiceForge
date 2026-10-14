# InvoiceForge Buchhaltung: Umsetzungskriterien

Ziel: Offline, schnell, nachvollziehbar, einfach zu bedienen. Die Buchhaltung muss auch für eine externe Prüfung ohne Rätsel nachvollziehbar sein.

## Erfassungsweg
- Beleg per Drag & Drop; Originaldatei unverändert und mit SHA-256 dokumentieren.
- Datum, Betrag, Lieferant, Steuerbetrag, Projekt und Zahlungsquelle erfassen.
- Erkennungsunsicherheiten sichtbar machen, nie automatisch als steuerlich anerkannt markieren.
- Private Vorfinanzierungen und gemischte Nutzung getrennt ausweisen.
- Bank-CSV importieren, Dubletten erkennen, Zuordnung manuell bestätigbar machen.

## Prüfungsweg
- Buchung und Originalbeleg mit eindeutiger ID verknüpfen.
- Korrekturen protokollieren, nicht still überschreiben.
- Beleglücken, ungeklärte Zahlungen, fehlende Nutzungsanteile und mögliche Dubletten melden.
- Jahrespaket: chronologisches Buchungsjournal, Belegindex, Anlagenübersicht, Steuerprüfliste, CSV-Daten und Originalbelege.
- EÜR und Umsatzsteuer nur auf Basis einer separat geprüften Steuerlogik erzeugen; nicht die provisorische Summe aus dem Ledger als amtliche EÜR ausgeben.
- GoBD-Verfahrensdokumentation und Aufbewahrungs-/Wiederherstellungstest vor Produktiveinsatz.

## Grenzen der ersten Implementierung
Das Modul main/bookkeeping.js ist ein erstes Ereignisjournal mit CSV-Ausgabe. Es ist noch keine GoBD-geprüfte Buchhaltung, kein Belegarchiv, kein Bankabgleich und keine steuerlich verifizierte EÜR. Es darf nicht als fertige Steuerlösung beworben werden.

## Abnahmetests
- Korrekturen sind im Journal nachvollziehbar.
- Jeder Export ist deterministisch und maschinenlesbar.
- Beleg und Buchung lassen sich gegenseitig finden.
- Testfälle für Privatkonto, Vorgründung, gemischte Nutzung, Umsatzsteuer, Anlagevermögen und Jahreswechsel.
- Backup und Wiederherstellung ohne Datenverlust.
- Windows-Paket startet und arbeitet vollständig offline.
