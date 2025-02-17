import { AppData, TrackerFileConfig, Transaction } from "main/models";
import { ProfileTrackerMetrics } from "main/services/trackerFileManager";

export const writeAppData = (data: AppData): void => {
  window.electronAPI.writeAppData(data);
};

export const readAppData = async (): Promise<AppData> => {
  return await window.electronAPI.readAppData();
};

export const fetchTrackerMetricsByProfileId = async (
  profileId: string
): Promise<ProfileTrackerMetrics> => {
  return await window.electronAPI.getTrackerMetricsByProfileId(profileId);
};

export const createTrackerFile = async (
  profileId: string,
  symbol: string,
  trackerConfig: TrackerFileConfig
): Promise<void> => {
  await window.electronAPI.createTrackerFile(profileId, symbol, trackerConfig);
};

export const editTrackerFile = async (
  profileId: string,
  symbol: string,
  updatedConfig: TrackerFileConfig
): Promise<void> => {
  await window.electronAPI.editTrackerFile(profileId, symbol, updatedConfig);
};

export const getTrackersByProfileId = async (
  profileId: string
): Promise<{ [symbol: string]: TrackerFileConfig }> => {
  return await window.electronAPI.getTrackersByProfileId(profileId);
};

export const isTradingAssistantRunning = async (
  profileId: string
): Promise<boolean> => {
  return await window.electronAPI.isTradingAssistantRunning(profileId);
};

export const startTradingAssistant = async (
  profileId: string
): Promise<void> => {
  await window.electronAPI.startTradingAssistant(profileId);
};

export const stopTradingAssistant = async (
  profileId: string
): Promise<void> => {
  await window.electronAPI.stopTradingAssistant(profileId);
};

// Ledger methods
export const getLedger = async (
  profileId: string
): Promise<Array<Transaction>> => {
  return await window.electronAPI.getLedger(profileId);
};

export const addLedgerTransaction = async (
  profileId: string,
  transaction: Transaction
): Promise<void> => {
  await window.electronAPI.addLedgerTransaction(profileId, transaction);
};

export const createLedgerFile = async (
  profileId: string,
  transactions: Transaction[] = []
): Promise<void> => {
  await window.electronAPI.createLedgerFile(profileId, transactions);
};
