import { createTrackerFile, editTrackerFile, fetchTrackerMetricsByProfileId } from "@/helpers/ElectronHelper";
import { TrackerFileConfig } from "main/models";
import { validateProfileExistence } from "@/helpers/Helpers";
import { ProfileTrackerMetrics } from "main/services/trackerFileManager";

export const createNewTrackerFile = async (
  profileId: string,
  symbol: string,
  trackerConfig: TrackerFileConfig
): Promise<void> => {
  try {
    await validateProfileExistence(profileId);
    await createTrackerFile(profileId, symbol, trackerConfig);
    console.log(`Tracker file for ${symbol} created successfully.`);
  } catch (error) {
    console.error("Error creating tracker file:", error.message);
  }
};

export const updateTrackerFile = async (
  profileId: string,
  symbol: string,
  updatedConfig: TrackerFileConfig
): Promise<void> => {
  try {
    await validateProfileExistence(profileId);
    await editTrackerFile(profileId, symbol, updatedConfig);
    console.log(`Tracker file for ${symbol} updated successfully.`);
  } catch (error) {
    console.error("Error updating tracker file:", error.message);
  }
};

export const getTrackerMetricsByProfileId = async (profileId: string): Promise<ProfileTrackerMetrics> => {
  try {
    // Validate profile existence
    await validateProfileExistence(profileId);
    return await fetchTrackerMetricsByProfileId(profileId);
  } catch (error) {
    console.error("Error in getTrackerMetricsByProfileId:", error.message);
  }
}
