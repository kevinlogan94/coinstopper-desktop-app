import { readAppData, writeAppData } from "@/helpers/ElectronHelper";
import { isEmptyObject } from "./Helpers";
import { Profile, Credential } from "main/models";

export const updateProfile = async (
  profileId: string,
  updateProfileObject: (profile: Profile) => void
): Promise<void> => {
  try {
    // Read the application data
    const appData = await readAppData();

    if (isEmptyObject(appData)) {
      throw new Error("Empty or invalid AppData file.");
    }

    // Find the profile by ID
    const profile = appData.profiles.find(
      (profile) => profile.id === profileId
    );

    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found.`);
    }

    // Apply the update logic
    updateProfileObject(profile);

    // Write the updated data back to the file
    await writeAppData(appData);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
  }
};

export const getProfile = async (profileId: string): Promise<any> => {
  try {
    // Read the application data
    const appData = await readAppData();

    if (isEmptyObject(appData)) {
      throw new Error("Empty or invalid AppData file.");
    }

    // Find the profile by ID
    const profile = appData.profiles.find(
      (profile) => profile.id === profileId
    );

    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found.`);
    }

    return profile;
  } catch (error) {
    console.error("Error in getProfile:", error.message);
    throw error; // Propagate the error to the caller
  }
};

export const createProfile = async (
  name: string,
  credential: Credential
): Promise<void> => {
  try {
    if (!name || isEmptyObject(credential)) {
      throw new Error(
        "Invalid input: 'name', and a valid 'credential' object are required."
      );
    }

    // Read the application data
    let appData = await readAppData();

    if (!appData || isEmptyObject(appData)) {
      console.warn(
        "Empty or invalid AppData file detected. Initializing new app data."
      );
      appData = { profiles: [] }; // Default structure
    }

    // Generate a new profile ID by incrementing the last ID in the profiles array
    const lastProfile = appData.profiles[appData.profiles.length - 1];
    const newId = lastProfile ? String(Number(lastProfile.id) + 1) : "1";

    const newProfile: Profile = {
      id: newId,
      name,
      credentials: [credential], // Add the passed credential to the credentials array
      trackerConfig: {
        blackList: [],
        whiteList: [],
        runOnce: true,
        maxSymbolsToTrack: 3,
        initialDeposit: 500,
        maxAllocation: 500,
        bankReserve: 1,
        iterationIntervalMs: 60000,
        apiRateLimitMs: 25,
        simulationMode: true,
        overrideParameters: false,
      },
      appConfig: {
        trackerEnabled: false,
      },
      ledger: [],
    };

    // Add the new profile to the profiles array
    appData.profiles.push(newProfile);

    // Write the updated data back to the file
    await writeAppData(appData);
  } catch (error) {
    console.error("Error in createProfile:", error.message);
    throw error; // Propagate the error to the caller
  }
};