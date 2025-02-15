import { formatNumber } from "@/filters/FormatNumber";
import {
  getBalanceHeldByAssistentByProfileId,
  getProfile,
} from "./AppDataHelper";
import { getCoinbaseBalanceByProfileId } from "./CoinbaseHelper";
import { readAppData } from "@/helpers/ElectronHelper";
import { Profile } from "main/models";

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
  const RawBuyingMetrics = await getRawBuyingMetrics(profileId);

  // Return formatted values
  return {
    coinbaseBalance: formatNumber(RawBuyingMetrics.coinbaseBalance, {
      currency: true,
    }),
    moneyHeldByAssistant: formatNumber(RawBuyingMetrics.moneyHeldByAssistant, {
      currency: true,
    }),
    buyingPower: formatNumber(RawBuyingMetrics.buyingPower, { currency: true }),
  };
};

export const getRawBuyingMetrics = async (
  profileId: string
): Promise<RawBuyingMetrics> => {
  const profile = await getProfile(profileId);

  // Fetch raw balances
  const rawCoinbaseBalance = await getCoinbaseBalanceByProfileId(profileId);
  const balanceHeldByAssistant = await getBalanceHeldByAssistentByProfileId(
    profileId
  );

  // Calculate buying power - Make sure we don't get a number below 0.
  const difference = Math.max(rawCoinbaseBalance - balanceHeldByAssistant, 0);

  // Return formatted values
  return {
    coinbaseBalance: rawCoinbaseBalance,
    moneyHeldByAssistant: balanceHeldByAssistant,
    buyingPower: difference,
  };
};

export const convertCurrencyToNumber = (currency: string) => {
  const numericValue = parseFloat(currency.replace("$", ""));
  return numericValue;
};

export const validateProfileExistence = async (
  profileId: string
): Promise<Profile> => {
  const appData = await readAppData();

  if (isEmptyObject(appData)) {
    throw new Error("Empty or invalid AppData file.");
  }

  const profile = appData.profiles.find((profile) => profile.id === profileId);
  if (!profile) {
    throw new Error(`Profile with ID ${profileId} not found.`);
  }
  return profile;
};
