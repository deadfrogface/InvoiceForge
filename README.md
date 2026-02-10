# InvoiceForge

Desktop-Rechnungsapp mit Electron: Rechnungen erstellen, Firmendaten speichern, PDF exportieren.

## Voraussetzungen

- Node.js (z. B. LTS)
- npm

## Installation & Start

```bash
npm install
npm start
```

## Build (NSIS-Installer für Windows)

Icon einmalig erzeugen (erstellt `assets/icon.ico`):

```bash
npm run create-icon
```

Dann bauen:

```bash
npm run build
```

Die Installer-Datei liegt danach in `dist/` (z. B. `InvoiceForge Setup 1.0.0.exe`).

## Release über GitHub Actions

Der Windows-Installer wird per GitHub Actions gebaut und als Release bereitgestellt.

**Neues Release mit Installer erstellen:**

1. Im Repo einen **Tag** setzen (z. B. `v1.0.0`):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. Der Workflow **Build and Release** startet automatisch, baut den Installer und erstellt ein **GitHub Release** mit der fertigen `.exe` (z. B. `InvoiceForge Setup 1.0.0.exe`) als Download.

**Manueller Build (ohne Release):** Unter **Actions** → **Build and Release** → **Run workflow** ausführen. Die gebaute `.exe` findest du nach dem Lauf unter **Artifacts** zum Download.

## Funktionen

- **Firmendaten**: Speicherung mit „Firmendaten speichern“ (electron-store, lokal)
- **Rechnung**: Kundendaten, Rechnungsnummer, Datum, Fälligkeit
- **Positionen**: Dynamisch hinzufügen/entfernen, automatische Berechnung (Zwischensumme, Steuer, Gesamtbetrag)
- **PDF**: „PDF erstellen“ öffnet den Speicher-Dialog, Datei wird lokal gespeichert
- **Offline**: Keine Netzwerkverbindung nötig

## Projektstruktur

- `main/main.js` – Electron Main Process, IPC, electron-store, Speicher-Dialog
- `preload/preload.js` – Sichere API-Bridge (contextBridge)
- `renderer/index.html` – Formular-UI
- `renderer/app.js` – Logik, Berechnungen, jsPDF
- `renderer/styles.css` – Layout
- `electron-builder.yml` – NSIS-Build (oneClick: false, Installationspfad wählbar)

## Icon

- `assets/icon.ico` wird durch `npm run create-icon` erzeugt (Node-Skript in `scripts/create-icon.js`). Vor dem ersten Build einmal ausführen.
