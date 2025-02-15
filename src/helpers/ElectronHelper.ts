import { AppData, TrackerFileConfig } from "main/models";
import { ProfileTrackerMetrics } from "main/services/trackerFileManager";

export const writeAppData = (data: AppData): void => {
    window.electronAPI.writeAppData(data);
};

export const readAppData = async (): Promise<AppData> => {
  return await window.electronAPI.readAppData();
};

export const fetchTrackerMetricsByProfileId = async (profileId: string): Promise<ProfileTrackerMetrics> => {
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
