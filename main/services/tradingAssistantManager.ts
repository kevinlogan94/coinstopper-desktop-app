import { fork } from 'child_process';
import { app, ipcMain } from 'electron';
import { readAppData } from './appDataManager';
import { TrackerProcessor } from './tradingAssistant/main';

class TradingAssistantManager {
  private profileProcesses: Map<string, NodeJS.Timeout> = new Map(); // Maps profile IDs to intervals
  private isRunning: Map<string, boolean> = new Map(); // Tracks the running state of each profile

  // Static module path for the child process aka the tracker
  private modulePath: string = '/absolute/path/to/child-process.js'; // Update this path

  constructor() {}

  public async startTradingAssistant(profileID: string): Promise<void> {
    if (this.isRunning.get(profileID)) {
      console.log(`Trading Assistant for profile ${profileID} is already running.`);
      return;
    }

    console.log(`Starting Trading Assistant for profile ${profileID}...`);

    // Mark this profile as running
    this.isRunning.set(profileID, true);

    // Get the path to the user data folder (used as an argument for the child process)
    const filePath = app.getPath('userData');
    console.log("TRACKER PROCESS");

    // Get the profile
    const appData = await readAppData();
    const profile = appData[profileID];
    const tracker = new TrackerProcessor(profile, filePath);

    // Run a child process for this profile at 10-second intervals
    const interval = setInterval(async () => {
      try {
        console.log("TRACKER PROCESS"); //Insert tracker method here.
        await tracker.processTrackers();
        console.log(`Tracker process completed successfully for profile ${profileID}.`);
      } catch (error) {
        console.error(`Error in Tracker process for profile ${profileID}:`, error);
      }
    }, 10000);

    // Store the interval for this profile
    this.profileProcesses.set(profileID, interval);

    console.log(`Trading Assistant started for profile ${profileID}.`);
  }

  public stopTradingAssistant(profileID: string): void {
    const interval = this.profileProcesses.get(profileID);

    if (interval) {
      clearInterval(interval);
      this.profileProcesses.delete(profileID);
      this.isRunning.set(profileID, false);
      console.log(`Trading Assistant stopped for profile ${profileID}.`);
    } else {
      console.log(`No Trading Assistant is running for profile ${profileID}.`);
    }
  }

  public stopAllTradingAssistants(): void {
    this.profileProcesses.forEach((interval, profileID) => {
      clearInterval(interval);
      console.log(`Trading Assistant stopped for profile ${profileID}.`);
    });
    this.profileProcesses.clear();
    this.isRunning.clear();
    console.log('All Trading Assistants stopped.');
  }

  /**
   * Check if a trading assistant is currently running for the given profile ID.
   * @param profileID - The profile ID to check.
   * @returns {boolean} - True if the trading assistant is running, false otherwise.
   */
  public isTradingAssistantRunning(profileID: string): boolean {
    return this.isRunning.get(profileID) || false;
  }
}

export const registerTradingAssistantMethods = () => {
const tradingAssistentManager = new TradingAssistantManager();

ipcMain.handle('start-trading-assistant', (event, profileId: string) => {
  tradingAssistentManager.startTradingAssistant(profileId);
});

ipcMain.handle('stop-trading-assistant', (event, profileId: string) => {
  tradingAssistentManager.stopTradingAssistant(profileId);
});

ipcMain.handle('is-trading-assistant-running', (event, profileId: string) => {
  return tradingAssistentManager.isTradingAssistantRunning(profileId);
});
}
