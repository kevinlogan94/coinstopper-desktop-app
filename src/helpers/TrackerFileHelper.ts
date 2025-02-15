import { createTrackerFile, editTrackerFile, fetchTrackerMetricsByProfileId, getTrackersByProfileId } from "@/helpers/ElectronHelper";
import { TrackerFileConfig } from "main/models";
import { validateProfileExistence } from "@/helpers/Helpers";
import { ProfileTrackerMetrics } from "main/services/trackerFileManager";
import { getLedgerByProfileId } from "./AppDataHelper";

export const createNewTrackerFile = async (
  profileId: string,
  symbol: string
): Promise<void> => {
  try {
    // Check if the tracker file already exists
    const existingTrackers = await getTrackersByProfileId(profileId);
    if (existingTrackers[symbol]) {
      throw new Error(`Tracker file for ${symbol} already exists.`);
    }

    // Fetch the ledger and get the latest transaction
    const ledger = await getLedgerByProfileId(profileId);
    const latestTransaction = ledger[ledger.length - 1];
    const availableFunds = latestTransaction ? latestTransaction.balance : 0;

    // Define a default tracker config
    const defaultTrackerConfig: TrackerFileConfig = {
      baseIncrement: "0.00000001",
      quoteIncrement: "0.01",
      availableFunds: availableFunds,
      maxAllocation: 100,
      symbol,
      held: 0,
      heldValueUsd: 0,
      buyPrice: 0,
      averageBuyPrice: 0,
      exitPrice: null,
      currentPrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      percentageChange: 0,
      lastActionPrice: 0,
      lastActionTime: 0,
      lastAction: "",
      datestamp: new Date().toISOString(),
      parameters: {
        coolOffPercentage: 1,
        reentryLimitPercentage: 0.5,
        spreadPercentage: 1.2,
        targetProfitPercentage: 1,
        trailingSellPercentage: 0.5,
        dropBuyPercentage: 2.5,
        trailingBuyPercentage: 0.1,
      },
      overrideParameters: false,
      autoBuyInsActive: true,
      manualPurchaseAmount: null,
      manualSell: null,
      recommendation: { action: "HOLD", reason: "Initial state" },
      positions: [],
      errors: [],
    };

    // Validate profile existence
    await validateProfileExistence(profileId);

    // Create the tracker file
    await createTrackerFile(profileId, symbol, defaultTrackerConfig);
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
