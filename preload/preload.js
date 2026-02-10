const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('invoiceForge', {
  getCompanyData: () => ipcRenderer.invoke('getCompanyData'),
  saveCompanyData: (data) => ipcRenderer.invoke('saveCompanyData', data),
  getLastInvoiceNumber: () => ipcRenderer.invoke('getLastInvoiceNumber'),
  saveLastInvoiceNumber: (number) => ipcRenderer.invoke('saveLastInvoiceNumber', number),
  saveFile: (options) => ipcRenderer.invoke('saveFile', options),
});
