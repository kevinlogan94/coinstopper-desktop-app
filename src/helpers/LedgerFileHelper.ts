import { 
  getLedger, 
  addLedgerTransaction 
} from "@/helpers/ElectronHelper";
import { Transaction } from "main/models";
import { getProfile } from "./AppDataHelper";

export async function getLedgerByProfileId(
  profileId: string
): Promise<Array<Transaction>> {
  try {
    return await getLedger(profileId);
  } catch (error) {
    console.error("Error fetching ledger by profile ID:", error.message);
    throw error;
  }
}

export const addToLedger = async (
  profileId: string,
  entry: Transaction
): Promise<void> => {
  try {
    await addLedgerTransaction(profileId, entry);
    console.log(`Added new ledger entry for profile ID ${profileId}`);
  } catch (error) {
    console.error("Error adding to ledger:", error.message);
    throw error;
  }
};

export async function getBalanceHeldByAssistentByProfileId(
  profileId: string
): Promise<number> {
  try {
    // Fetch the profile to get initial deposit
    const profile = await getProfile(profileId);

    const ledger = await getLedger(profileId);
    if (!ledger.length) {
      return profile.trackerConfig.initialDeposit;
    }
    return ledger[ledger.length - 1].balance;
  } catch (error) {
    console.error(
      "Error fetching assistant balance by profile ID:",
      error.message
    );
    throw error;
  }
}
