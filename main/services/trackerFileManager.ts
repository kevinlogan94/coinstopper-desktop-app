import { app, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";
import { TrackerFileConfig } from "../models";

export interface ProfileTrackers {
  [profileId: string]: { [symbol: string]: TrackerFileConfig };
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
            const trackerConfig: TrackerFileConfig = JSON.parse(jsonData);
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
): Promise<{ [symbol: string]: TrackerFileConfig }> => {
  const allTrackers = await getTrackerConfigs();
  return allTrackers[profileId] || {};
};

export interface ProfileTrackerMetrics {
  totalInvested: number; // Total dollar amount ever invested (sum of all buyOrder.currencyAmount)
  currentPortfolioValue: number; // Current portfolio value of held assets (heldValueUsd)
  totalPL: number; // Total profit/loss amount across all active holdings
  roiPercentage: number; // Overall return on investment percentage
  availableFunds: number; // Total funds available for investment
  winningTrades: number; // Count of positions that were profitable
  losingTrades: number; // Count of positions that were unprofitable
  individualCoinMetrics: { [symbol: string]: CoinTrackerMetrics }; // Metrics per coin
}

export interface CoinTrackerMetrics {
  totalInvested: number; // Total dollar amount invested in this coin (sum of all buyOrder.currencyAmount)
  heldValueUsd: number; // Current value of holdings in this coin (real-time `held * currentPrice`)
  held: number; // Current amount of coin held
  plAmount: number; // Profit/loss amount (sum of all position plAmounts)
  plPercentage: number; // Calculated as `plAmount / totalInvested * 100`
  positions: PositionMetrics[]; // Detailed per-position metrics
}

export interface PositionMetrics {
  buyPrice: number;
  invested: number; // Amount invested in this position
  plAmount: number; // Profit/Loss amount (from Position)
  plPercentage: number; // Profit/Loss percentage (from Position)
  wasSold: boolean; // Indicates if this position has been sold
}

/**
 * Retrieves tracker metrics for a given profile ID.
 * @param profileId - The profile ID for which metrics are calculated.
 * @returns A promise resolving to the calculated tracker metrics.
 */
export const getTrackerMetricsByProfileId = async (
  profileId: string
): Promise<ProfileTrackerMetrics> => {
  const trackers = await getTrackersByProfileId(profileId); // Get all the tracker file data for this profileId.

  let totalInvested = 0;
  let totalPL = 0;
  let availableFunds = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let currentPortfolioValue = 0;
  const individualCoinMetrics: { [symbol: string]: CoinTrackerMetrics } = {};

  for (const [symbol, tracker] of Object.entries(trackers)) {
    const { held, heldValueUsd, positions, availableFunds: funds } = tracker;

    // Capture available funds (same across all trackers)
    availableFunds = funds;

    // Calculate total invested (sum of all buy orders)
    const coinTotalInvested = positions.reduce(
      (sum, position) => sum + position.buyOrder.currencyAmount,
      0
    );
    const coinPL = positions.reduce(
      (sum, position) => sum + position.plAmount,
      0
    );
    const coinPLPercentage =
      coinTotalInvested > 0 ? (coinPL / coinTotalInvested) * 100 : 0;

    // Process position metrics
    const positionMetrics: PositionMetrics[] = positions.map((position) => ({
      buyPrice: position.buyOrder.basePrice,
      invested: position.buyOrder.currencyAmount,
      plAmount: position.plAmount,
      plPercentage: position.plPercentage,
      wasSold: position.sellOrder !== null,
    }));

    // Store aggregated metrics for this coin
    individualCoinMetrics[symbol] = {
      totalInvested: coinTotalInvested,
      heldValueUsd,
      held,
      plAmount: coinPL,
      plPercentage: coinPLPercentage,
      positions: positionMetrics,
    };

    // Aggregate totals across all coins
    totalInvested += coinTotalInvested;
    currentPortfolioValue += heldValueUsd;
    totalPL += coinPL;

    // Count winning & losing trades based on position plAmounts
    if (coinPL > 0) {
      winningTrades++;
    } else if (coinPL < 0) {
      losingTrades++;
    }
  }

  // Calculate overall ROI using totalPL from summed position plAmounts
  const roiPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
  currentPortfolioValue += availableFunds;

  return {
    totalInvested,
    currentPortfolioValue,
    totalPL,
    roiPercentage,
    availableFunds,
    winningTrades,
    losingTrades,
    individualCoinMetrics,
  };
};

export const registerTrackerFileManagementMethods = () => {
  ipcMain.handle("get-trackers-by-profile-id", (event, profileId: string) => {
    return getTrackersByProfileId(profileId);
  });
  ipcMain.handle(
    "get-tracker-metrics-by-profile-id",
    (event, profileId: string) => {
      return getTrackerMetricsByProfileId(profileId);
    }
  );
};
