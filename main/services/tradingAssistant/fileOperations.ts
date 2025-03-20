import * as fs from 'fs';
import { TrackerFileConfig } from 'main/models';
import * as path from 'path';

/**
 * Loads a single trackingData file based on the provided symbol name.
 * @param {string} symbol - The symbol name (e.g., "BTC-USD").
 * @param {string} dataDirectory - The directory where trackingData files are stored.
 * @returns {Object} - The parsed content of the trackingData file.
 * @throws {Error} - If the file does not exist or fails to load.
 */
function loadTrackingData(symbol: string, dataDirectory: string): object {
    try {
        const fileName = `${symbol.replace('/', '-')}.json`;
        const filePath = path.join(dataDirectory, fileName);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Tracking data file not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error loading tracking data for ${symbol}: ${error.message}`);
        throw error;
    }
}

/**
 * Loads the global.json file from the main application directory.
 * @param {string} appDirectory - The main application directory.
 * @returns {Object} - The parsed content of the global.json file.
 * @throws {Error} - If the file does not exist or fails to load.
 */
function loadGlobalData(appDirectory: string): object {
    try {
        const filePath = path.join(appDirectory, 'global.json');

        if (!fs.existsSync(filePath)) {
            throw new Error(`Global data file not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (!fileContent) return {};
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error loading global data: ${error.message}`);
        throw error;
    }
}

/**
 * Saves the global.json file to the main application directory.
 * @param {string} appDirectory - The main application directory.
 * @param {Object} globalData - The data to save into the global.json file.
 * @throws {Error} - If the file fails to save.
 */
function saveGlobalData(appDirectory: string, globalData: object): void {
    try {
        const filePath = path.join(appDirectory, 'global.json');
        fs.writeFileSync(filePath, JSON.stringify(globalData, null, 2));
        console.info(`Global data successfully saved to ${filePath}`);
    } catch (error) {
        console.error(`Error saving global data: ${error.message}`);
        throw error;
    }
}

/**
 * Loads all trackingData files from the specified directory.
 * @param {string} dataDirectory - The directory where trackingData files are stored.
 * @returns {Object[]} - An array of parsed trackingData objects.
 */
function loadAllTrackingData(dataDirectory: string): TrackerFileConfig[] {
    try {
        const trackingFiles = fs.readdirSync(dataDirectory);
        return trackingFiles.map(file =>
            JSON.parse(fs.readFileSync(path.join(dataDirectory, file), 'utf-8'))
        );
    } catch (error) {
        console.error(`Error loading tracking data files: ${error.message}`);
        throw error;
    }
}

/**
 * Saves a single trackingData file.
 * @param {string} dataDirectory - The directory where trackingData files are stored.
 * @param {Object} trackingData - The trackingData object to save.
 * @throws {Error} - If the file fails to save.
 */
function saveTrackingData(dataDirectory: string, trackingData: TrackerFileConfig): void {
    try {
        const filePath = path.join(dataDirectory, `${trackingData.symbol.replace('/', '-')}.json`);
        trackingData.datestamp = new Date().toISOString();
        const content = { ...trackingData };
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    } catch (error) {
        console.error(`Error saving tracking data for ${trackingData.symbol}: ${error.message}`);
        throw error;
    }
}

/**
 * Saves all trackingData files from an array of trackingData objects.
 * @param {string} dataDirectory - The directory where trackingData files are stored.
 * @param {Object[]} trackingDataArray - An array of trackingData objects to save.
 * @throws {Error} - If any file fails to save.
 */
function saveAllTrackingData(dataDirectory: string, trackingDataArray: TrackerFileConfig[]): void {
    try {
        trackingDataArray.forEach(trackingData => {
            saveTrackingData(dataDirectory, trackingData);
        });
    } catch (error) {
        console.error(`Error saving all tracking data files: ${error.message}`);
        throw error;
    }
}

export { loadTrackingData, loadGlobalData, saveGlobalData, loadAllTrackingData, saveTrackingData, saveAllTrackingData };
