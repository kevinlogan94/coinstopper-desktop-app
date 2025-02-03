import { AppData } from "main/models";
import { ProfileTrackerMetrics } from "main/services/trackerFileManager";

export const writeAppData = (data: AppData): void => {
    window.electronAPI.writeAppData(data);
};

export const readAppData = async (): Promise<AppData> => {
  return await window.electronAPI.readAppData();
};

export const getTrackerMetricsByProfileId = async (profileId: string): Promise<ProfileTrackerMetrics> => {
  return await window.electronAPI.getTrackerMetricsByProfileId(profileId);
}
