// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { AppData } from './models';

contextBridge.exposeInMainWorld('electronAPI', {
  readAppData: () => ipcRenderer.invoke('read-app-data'),
  writeAppData: (data: AppData) => ipcRenderer.invoke('write-app-data', data),
  refreshApp: () => ipcRenderer.invoke('refresh-page'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
  validateCoinbaseCredentials: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-validate-credentials", apiKey, apiSecret),
  getCoinbaseBalance: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-balance", apiKey, apiSecret),
  getCryptoInvestmentInUSD: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-investments-in-USD", apiKey, apiSecret),
  getAllCoinbaseCrypto: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-all-crypto", apiKey, apiSecret),
  getCoinbaseCryptoProductData: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-crypto-product-data", apiKey, apiSecret),
  startTradingAssistant: (profileId: string) => ipcRenderer.invoke("start-trading-assistant", profileId),
  stopTradingAssistant: (profileId: string) => ipcRenderer.invoke("stop-trading-assistant", profileId),
  isTradingAssistantRunning: (profileId: string) => ipcRenderer.invoke("is-trading-assistant-running", profileId)
});