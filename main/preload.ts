// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { AppData } from './models';

contextBridge.exposeInMainWorld('electronAPI', {
  readAppData: () => ipcRenderer.invoke('read-app-data'),
  writeAppData: (data: AppData) => ipcRenderer.invoke('write-app-data', data),
  refreshApp: () => ipcRenderer.invoke('refresh-page'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
  validateCoinbaseCredentials: () => ipcRenderer.invoke("coinbase-validate-credentials")
});