// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { AppData, TrackerFileConfig, Transaction } from './models';

contextBridge.exposeInMainWorld('electronAPI', {
  readAppData: () => ipcRenderer.invoke('read-app-data'),
  writeAppData: (data: AppData) => ipcRenderer.invoke('write-app-data', data),
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
  validateCoinbaseCredentials: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-validate-credentials", apiKey, apiSecret),
  getCoinbaseBalance: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-balance", apiKey, apiSecret),
  getCryptoInvestmentInUSD: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-investments-in-USD", apiKey, apiSecret),
  getAllCoinbaseCrypto: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-all-crypto", apiKey, apiSecret),
  getCoinbaseCryptoProductData: (apiKey: string, apiSecret: string) => ipcRenderer.invoke("coinbase-get-crypto-product-data", apiKey, apiSecret),
  startTradingAssistant: (profileId: string) => ipcRenderer.invoke("start-trading-assistant", profileId),
  stopTradingAssistant: (profileId: string) => ipcRenderer.invoke("stop-trading-assistant", profileId),
  isTradingAssistantRunning: (profileId: string) => ipcRenderer.invoke("is-trading-assistant-running", profileId),
  getTrackersByProfileId: (profileId: string) => ipcRenderer.invoke("get-trackers-by-profile-id", profileId),
  getTrackerMetricsByProfileId: (profileId: string) => ipcRenderer.invoke("get-tracker-metrics-by-profile-id", profileId),
  createTrackerFile: (profileId: string, symbol: string, trackerConfig: TrackerFileConfig) => ipcRenderer.invoke("create-tracker-file", profileId, symbol, trackerConfig),
  editTrackerFile: (profileId: string, symbol: string, updatedConfig: TrackerFileConfig) => ipcRenderer.invoke("edit-tracker-file", profileId, symbol, updatedConfig),
  
  // Ledger methods
  getLedger: (profileId: string) => ipcRenderer.invoke("get-ledger", profileId),
  addLedgerTransaction: (profileId: string, transaction: Transaction) => ipcRenderer.invoke("add-ledger-transaction", profileId, transaction),
  createLedgerFile: (profileId: string, transactions?: Transaction[]) => ipcRenderer.invoke("create-ledger-file", profileId, transactions),
});