import { formatNumber } from "@/filters/FormatNumber";
import { getBalanceHeldByAssistentByProfileId, getProfile } from "./AppDataHelper";
import { getCoinbaseBalanceByProfileId } from "./CoinbaseHelper";

export const isEmptyObject = (obj: object): boolean => {
  return (
    obj === undefined ||
    (typeof obj === "object" && obj !== null && Object.keys(obj).length === 0)
  );
};

export interface BuyingMetrics {
  coinbaseBalance: string;
  moneyHeldByAssistant: string;
  buyingPower: string;
}
export interface RawBuyingMetrics {
  coinbaseBalance: number;
  moneyHeldByAssistant: number;
  buyingPower: number;
}

export const getBuyingMetrics = async (
  profileId: string
): Promise<BuyingMetrics> => {
  const RawBuyingMetrics = await getRawBuyingMetrics(profileId)

  // Return formatted values
  return {
    coinbaseBalance: formatNumber(RawBuyingMetrics.coinbaseBalance, { currency: true }),
    moneyHeldByAssistant: formatNumber(RawBuyingMetrics.moneyHeldByAssistant, { currency: true }),
    buyingPower: formatNumber(RawBuyingMetrics.buyingPower, { currency: true }),
  };
};

export const getRawBuyingMetrics = async (
  profileId: string
): Promise<RawBuyingMetrics> => {
  const profile = await getProfile(profileId);

  // Fetch raw balances
  const rawCoinbaseBalance = await getCoinbaseBalanceByProfileId(profileId);
  const balanceHeldByAssistant = await getBalanceHeldByAssistentByProfileId(profileId);

  // Calculate buying power - Make sure we don't get a number below 0.
  const difference = Math.max(rawCoinbaseBalance - balanceHeldByAssistant, 0);

  // Return formatted values
  return {
    coinbaseBalance: rawCoinbaseBalance,
    moneyHeldByAssistant: balanceHeldByAssistant,
    buyingPower: difference
  };
};

export const convertCurrencyToNumber = (currency: string) => {
  const numericValue = parseFloat(currency.replace("$", ""))
  return numericValue;
}

