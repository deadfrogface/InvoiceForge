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
  if (typeof content !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(content) || content.length > 40 * 1024 * 1024) throw Error('Ungültiger PDF-Inhalt');
  const buf = Buffer.from(content, 'base64');
  if (buf.subarray(0,5).toString('ascii') !== '%PDF-') throw Error('Keine gültige PDF-Datei');
  fs.writeFileSync(filePath, buf);
  return { ok: true, filePath };
});

// Local bookkeeping: records remain on this device.
const { Ledger } = require('./bookkeeping');
const ledger = new Ledger(path.join(app.getPath('userData'), 'bookkeeping'));
ipcMain.handle('ledger:add', (_event, input) => ledger.add(input));
ipcMain.handle('ledger:list', () => ledger.list());
ipcMain.handle('ledger:void', (_event, id, reason) => ledger.void(id, reason));
ipcMain.handle('ledger:summary', (_event, year) => ledger.summary(year));
ipcMain.handle('ledger:export', async (_event, year) => {
  const result = await dialog.showSaveDialog({defaultPath:'invoiceforge-'+year+'.csv', filters:[{name:'CSV',extensions:['csv']}]});
  if (result.canceled || !result.filePath) return {ok:false};
  fs.writeFileSync(result.filePath, ledger.csv(year), 'utf8');
  return {ok:true,filePath:result.filePath};
});

const { yearlyReport } = require('./yearly-report');
ipcMain.handle('ledger:year', (_event, year) => yearlyReport(ledger.list(), year));

ipcMain.handle('ledger:receipt:add', async (_event, id) => {
  const result = await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'Belege',extensions:['pdf','png','jpg','jpeg','webp','xml']}]});
  if (result.canceled || !result.filePaths.length) return {ok:false};
  return {ok:true,receipt:ledger.attachReceipt(id,result.filePaths[0])};
});
ipcMain.handle('ledger:receipt:open', (_event,id) => {
  const file=ledger.receiptPath(id);
  if (!file || !fs.existsSync(file)) return false;
  return require('electron').shell.openPath(file).then(message=>!message);
});

ipcMain.handle('ledger:backup', async () => {
  const result = await dialog.showOpenDialog({properties:['openDirectory','createDirectory']});
  if (result.canceled || !result.filePaths.length) return {ok:false};
  const destination=path.join(result.filePaths[0], 'InvoiceForge-Backup-'+new Date().toISOString().slice(0,10));
  if (fs.existsSync(destination)) throw Error('Backup folder already exists; choose another folder');
  const source=path.join(app.getPath('userData'),'bookkeeping');
  if (destination===source || destination.startsWith(source+path.sep)) throw Error('Choose a folder outside bookkeeping data');
  fs.cpSync(source,destination,{recursive:true,errorOnExist:true,force:false});
  return {ok:true,folder:destination};
});

const bankCsv=require('./bank-csv');
ipcMain.handle('ledger:bank:preview',async()=>{
 const selected=await dialog.showOpenDialog({properties:['openFile']});
 if(selected.canceled)return null;
 return bankCsv.preview(fs.readFileSync(selected.filePaths[0],'utf8'));
});

const {InvoiceRegister}=require('./invoice-register');
const invoiceRegister=new InvoiceRegister(path.join(app.getPath('userData'),'bookkeeping'));
ipcMain.handle('invoices:list',()=>invoiceRegister.list());
ipcMain.handle('invoices:add',(_event,input)=>invoiceRegister.add(input));
ipcMain.handle('invoices:status',(_event,id,status)=>invoiceRegister.setStatus(id,status));

const {buildMusicLicense}=require('./music-license');
ipcMain.handle('music:license:generate',(_event,input)=>buildMusicLicense(input));
ipcMain.handle('music:license:save',async(_event,content)=>{
 if(typeof content!=='string'||content.length>100000)throw Error('Ungültiger Vertragsinhalt');
 const result=await dialog.showSaveDialog({defaultPath:'Musiklizenzvertrag.txt',filters:[{name:'Textdokument',extensions:['txt']}]});
 if(result.canceled||!result.filePath)return {ok:false};
 fs.writeFileSync(result.filePath,content,'utf8');return {ok:true,filePath:result.filePath};
});

const {MusicLicenseArchive}=require('./music-license-archive');
const musicArchive=new MusicLicenseArchive(path.join(app.getPath('userData'),'bookkeeping'));
ipcMain.handle('music:archive:list',()=>musicArchive.list());
ipcMain.handle('music:archive:add',(_event,draft)=>musicArchive.add(draft));
ipcMain.handle('music:archive:status',(_event,id,status)=>musicArchive.setStatus(id,status));

const {DoubleEntryLedger}=require('./double-entry');
const doubleEntry=new DoubleEntryLedger(path.join(app.getPath('userData'),'bookkeeping'));
ipcMain.handle('accounting:accounts',()=>require('./double-entry').ACCOUNTS);
ipcMain.handle('accounting:post',(_event,input)=>doubleEntry.post(input));
ipcMain.handle('accounting:list',()=>doubleEntry.list());
ipcMain.handle('accounting:statements',(_event,year)=>doubleEntry.statements(year));
ipcMain.handle('accounting:tax-closing',(_event,year)=>doubleEntry.taxClosing(year));
ipcMain.handle('einvoice:inspect',async()=>{
 const selection=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'E-Rechnung XML',extensions:['xml']}]});
 if(selection.canceled||!selection.filePaths.length)return null;
 return require('./e-invoice').inspectEInvoiceFile(selection.filePaths[0]);
});

const bookingAssistant=require('./booking-assistant');
const closingAssistant=require('./closing-assistant');
ipcMain.handle('assistant:propose-document',(_event,doc)=>bookingAssistant.proposeDocument(doc));
ipcMain.handle('assistant:recurring',()=>bookingAssistant.recurringSuggestions(doubleEntry.list()));
ipcMain.handle('closing:month',(_event,year,month)=>closingAssistant.monthClose(doubleEntry,year,month));
ipcMain.handle('closing:tax-bridge',(_event,year,adjustments)=>closingAssistant.taxReconciliation(doubleEntry,year,adjustments));
ipcMain.handle('closing:depreciation',(_event,assets,year)=>closingAssistant.depreciationSchedule(assets,year));

const {AssetRegister}=require('./asset-register');
const assetRegister=new AssetRegister(path.join(app.getPath('userData'),'bookkeeping'));
ipcMain.handle('assets:list',()=>assetRegister.list());
ipcMain.handle('assets:add',(_event,asset)=>assetRegister.add(asset));

const documentExtraction=require('./document-extraction');
ipcMain.handle('documents:capabilities',()=>documentExtraction.capabilities());
ipcMain.handle('documents:extract',async()=>{
 const selected=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'Belege',extensions:['pdf','png','jpg','jpeg','tif','tiff','webp','txt','xml']}]});
 if(selected.canceled||!selected.filePaths.length)return null;
 return documentExtraction.readDocument(selected.filePaths[0]);
});

const taxTransmission=require('./tax-transmission');
ipcMain.handle('tax:transmission-readiness',(_event,kind)=>taxTransmission.transmissionReadiness(kind));

const {annualCloseChecklist}=require('./annual-close');
ipcMain.handle('closing:annual',(_event,year)=>annualCloseChecklist(doubleEntry,assetRegister.list(),year));
