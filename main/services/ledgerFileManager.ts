import { app, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";
import { Transaction } from "../models";

export interface ProfileLedgers {
  [profileId: string]: Transaction[];
}

export const getLedgerConfigs = async (): Promise<ProfileLedgers> => {
  const userDataPath = app.getPath("userData");
  const profilesPath = path.join(userDataPath, "profiles");

  try {
    const profileFolders = await fs.readdir(profilesPath);
    const profiles: ProfileLedgers = {};

    for (const profileId of profileFolders) {
      const profilePath = path.join(profilesPath, profileId);
      const filePath = path.join(profilePath, "ledger.json");

      try {
        const jsonData = await fs.readFile(filePath, "utf-8");
        const ledgerTransactions: Transaction[] = JSON.parse(jsonData);
        profiles[profileId] = ledgerTransactions;
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        profiles[profileId] = [];
      }
    }

    return profiles;
  } catch (error) {
    console.error("Error reading ledger configs:", error);
    return {};
  }
};

export const getLedgerByProfileId = async (
  profileId: string
): Promise<Transaction[]> => {
  const userDataPath = app.getPath("userData");
  const filePath = path.join(userDataPath, "profiles", profileId, "ledger.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Error reading ledger for profile ${profileId}:`, error);
    return [];
  }
};

export const createLedgerFile = async (
  profileId: string,
  transactions: Transaction[] = []
): Promise<void> => {
  const userDataPath = app.getPath("userData");
  const directoryPath = path.join(userDataPath, "profiles", profileId);
  const filePath = path.join(directoryPath, "ledger.json");

  try {
    // Ensure the directory exists
    await fs.mkdir(directoryPath, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(transactions, null, 2), "utf-8");
    console.log(`Ledger file created at ${filePath}`);
  } catch (error) {
    console.error(`Error creating ledger file at ${filePath}:`, error);
  }
};

export const addLedgerTransaction = async (
  profileId: string,
  transaction: Transaction
): Promise<void> => {
  const userDataPath = app.getPath("userData");
  const filePath = path.join(userDataPath, "profiles", profileId, "ledger.json");

  try {
    let currentLedger: Transaction[] = [];
    try {
      const existingData = await fs.readFile(filePath, "utf-8");
      currentLedger = JSON.parse(existingData);
    } catch (readError) {
      // If file doesn't exist or is empty, start with an empty array
      console.warn(`Creating new ledger file for profile ${profileId}`);
    }

    const updatedLedger = [...currentLedger, transaction];

    await fs.writeFile(filePath, JSON.stringify(updatedLedger, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error adding transaction to ledger at ${filePath}:`, error);
  }
};

export const registerLedgerFileMethods = () => {
  ipcMain.handle("get-ledger", async (_event, profileId: string) => {
    return await getLedgerByProfileId(profileId);
  });

  ipcMain.handle("add-ledger-transaction", async (_event, profileId: string, transaction: Transaction) => {
    await addLedgerTransaction(profileId, transaction);
  });

  ipcMain.handle("create-ledger-file", async (_event, profileId: string, transactions: Transaction[] = []) => {
    await createLedgerFile(profileId, transactions);
  });
};
