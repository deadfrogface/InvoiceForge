const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('invoiceForge', {
  getCompanyData: () => ipcRenderer.invoke('getCompanyData'),
  saveCompanyData: (data) => ipcRenderer.invoke('saveCompanyData', data),
  getLastInvoiceNumber: () => ipcRenderer.invoke('getLastInvoiceNumber'),
  saveLastInvoiceNumber: (number) => ipcRenderer.invoke('saveLastInvoiceNumber', number),
  invoicesList: () => ipcRenderer.invoke('invoices:list'),
  invoicesAdd: (entry) => ipcRenderer.invoke('invoices:add', entry),
  invoicesStatus: (id, status) => ipcRenderer.invoke('invoices:status', id, status),
  ledgerAdd: (entry) => ipcRenderer.invoke('ledger:add', entry),
  ledgerList: () => ipcRenderer.invoke('ledger:list'),
  ledgerBankPreview: () => ipcRenderer.invoke('ledger:bank:preview'),
  ledgerBackup: () => ipcRenderer.invoke('ledger:backup'),
  ledgerAttach: (id) => ipcRenderer.invoke('ledger:receipt:add', id),
  ledgerOpenReceipt: (id) => ipcRenderer.invoke('ledger:receipt:open', id),
  ledgerYear: (year) => ipcRenderer.invoke('ledger:year', year),
  ledgerExport: (year) => ipcRenderer.invoke('ledger:export', year),
  saveFile: (options) => ipcRenderer.invoke('saveFile', options),
});
