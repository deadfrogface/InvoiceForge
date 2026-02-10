const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store({ cwd: app.getPath('userData') });

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
    show: false,
  });

  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Vereinfachtes Menü (optional: win.setMenu(null) für kein Menü)
  win.setMenuBarVisibility(true);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPC: Firmendaten (electron-store) ---
ipcMain.handle('getCompanyData', () => {
  return store.get('companyData', {});
});

ipcMain.handle('saveCompanyData', (_event, data) => {
  store.set('companyData', data);
  return true;
});

// --- IPC: Letzte Rechnungsnummer ---
ipcMain.handle('getLastInvoiceNumber', () => {
  return store.get('lastInvoiceNumber', 0);
});

ipcMain.handle('saveLastInvoiceNumber', (_event, number) => {
  store.set('lastInvoiceNumber', number);
  return true;
});

// --- IPC: PDF speichern (Dialog + Datei) ---
ipcMain.handle('saveFile', async (_event, { content, defaultName }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (canceled || !filePath) return { ok: false };
  const buf = Buffer.from(content, 'base64');
  fs.writeFileSync(filePath, buf);
  return { ok: true, filePath };
});
