import { readAppData } from "@/helpers/ElectronHelper";
import { isEmptyObject } from "./Helpers";
import { Credential } from "main/models";
import { CryptoDetails } from "main/services/coinbase";


export async function getCoinbaseBalanceByProfileId(profileId: string): Promise<number> {
    try {
      // Fetch credentials for the given profile ID
      const credentials = await getCredentialsByProfileId(profileId);

      // Call the method on the window object
      return await window.electronAPI.getCoinbaseBalance(credentials.apiKey, credentials.apisecret);
    } catch (error) {
      console.error(`Error fetching Coinbase balance for profile ID ${profileId}:`, error.message);
      throw error;
    }
  }


  export async function getCoinbaseCryptoInvestmentInUSDByProfileId(profileId: string): Promise<number> {
    try {
      // Fetch credentials for the given profile ID
      const credentials = await getCredentialsByProfileId(profileId);

      // Call the method on the window object
      return await window.electronAPI.getCryptoInvestmentInUSD(credentials.apiKey, credentials.apisecret);
    } catch (error) {
      console.error(`Error fetching Coinbase Crypto Investment in USD for profile ID ${profileId}:`, error.message);
      throw error;
    }
  }

  export async function getAllCoinbaseCryptoProductDataByProfileId(profileId: string): Promise<Array<CryptoDetails>> {
    try {
      // Fetch credentials for the given profile ID
      const credentials = await getCredentialsByProfileId(profileId);

      // Call the method on the window object
      return await window.electronAPI.getAllCoinbaseCrypto(credentials.apiKey, credentials.apisecret);
    } catch (error) {
      console.error(`Error fetching All Coinbase Crypto for profile ID ${profileId}:`, error.message);
      throw error;
    }
  }

  export async function getCoinbaseCryptoProductDataByProfileId(profileId: string): Promise<Array<CryptoDetails>> {
    try {
      // Fetch credentials for the given profile ID
      const credentials = await getCredentialsByProfileId(profileId);

      // Call the method on the window object
      return await window.electronAPI.getCoinbaseCryptoProductData(credentials.apiKey, credentials.apisecret);
    } catch (error) {
      console.error(`Error fetching Crypto Product Data for profile ID ${profileId}:`, error.message);
      throw error;
    }
  }


export async function getCredentialsByProfileId(profileId: string, platform: string = "coinbase"): Promise<Credential> {
    try {
      // Load the appData object
      const appData = await readAppData();

      if (isEmptyObject(appData)) {
        throw new Error("Empty or invalid AppData file.");
      }
  
      if (!Array.isArray(appData.profiles)) {
        throw new Error("No profiles on appData object.");
      }
  
      // Find the profile with the given ID
      const profile = appData.profiles.find(p => p.id === profileId);
  
      if (!profile) {
        throw new Error(`Profile with ID ${profileId} not found.`);
      }

      const credential = profile.credentials.find(c => c.platform=platform);

      if (!credential) {
        throw new Error(`Credentials for platform coinbase not found.`);
      }
  
      // Return the credentials array
      return credential;
    } catch (error) {
      console.error("Error fetching credentials:", error.message);
      throw error; // Re-throw the error for upstream handling
    }
  }