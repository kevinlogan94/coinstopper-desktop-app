import { formatNumber } from "@/filters/FormatNumber";
import { getProfile } from "./AppDataHelper";
import { getCoinbaseBalanceByProfileId } from "./CoinbaseHelper";

export const isEmptyObject = (obj: object): boolean => {
  return (
    obj === undefined ||
    (typeof obj === "object" && obj !== null && Object.keys(obj).length === 0)
  );
};

export const getBuyingMetrics = async (
  profileId: string
): Promise<{
  coinbaseBalance: string;
  moneyHeldByAssistant: string;
  buyingPower: string;
}> => {
  const profile = await getProfile(profileId);

  // Fetch raw balances
  const rawCoinbaseBalance = await getCoinbaseBalanceByProfileId(profileId);
  const balanceHeldByAssistant = profile.trackerConfig.initialDeposit; //Todo: Need more data

  // Calculate buying power - Make sure we don't get a number below 0.
  const difference = Math.max(rawCoinbaseBalance - balanceHeldByAssistant, 0);

  // Return formatted values
  return {
    coinbaseBalance: formatNumber(rawCoinbaseBalance, { currency: true }),
    moneyHeldByAssistant: formatNumber(balanceHeldByAssistant, { currency: true }),
    buyingPower: formatNumber(difference, { currency: true }),
  };
};

