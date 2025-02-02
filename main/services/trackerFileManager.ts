import { app, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";
import { TrackerConfig } from "../models";

export interface ProfileTrackers {
  [profileId: string]: { [symbol: string]: TrackerConfig };
}

export const getTrackerConfigs = async (): Promise<ProfileTrackers> => {
  const userDataPath = app.getPath("userData");
  const trackersPath = path.join(userDataPath, "trackers");

  try {
    const profileFolders = await fs.readdir(trackersPath);
    const profiles: ProfileTrackers = {};

    for (const profileId of profileFolders) {
      const profilePath = path.join(trackersPath, profileId);
      const files = await fs.readdir(profilePath);

      profiles[profileId] = {};

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(profilePath, file);
          try {
            const jsonData = await fs.readFile(filePath, "utf-8");
            const trackerConfig: TrackerConfig = JSON.parse(jsonData);
            const symbol = path.basename(file, ".json"); // Extract symbol from filename
            profiles[profileId][symbol] = trackerConfig;
          } catch (error) {
            console.error(`Error parsing ${filePath}:`, error);
          }
        }
      }
    }

    return profiles;
  } catch (error) {
    console.error("Error reading tracker configs:", error);
    return {};
  }
};

/**
 * Retrieves the tracker files for a specific profileId.
 * @param profileId - The ID of the profile (e.g., "1", "2").
 * @returns A promise that resolves to an object containing tracker configs for that profile.
 */
export const getTrackersByProfileId = async (
  profileId: string
): Promise<{ [symbol: string]: TrackerConfig }> => {
  const allTrackers = await getTrackerConfigs();
  return allTrackers[profileId] || {};
};

export const registerTrackerFileManagementMethods = () => {
ipcMain.handle('get-trackers-by-profile-id', (event, profileId: string) => {
  return getTrackersByProfileId(profileId);
});
}