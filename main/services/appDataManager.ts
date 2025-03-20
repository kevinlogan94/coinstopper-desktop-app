import { app, ipcMain } from "electron";
import { readFileSync, writeFileSync } from "fs";
import { AppData } from "main/models";
import * as path from "path";

const DATA_FILE_NAME = "appData.json";

// Construct a consistent file path for reading/writing:
export const getDataFilePath = () => {
  // This will store data in userData folder, e.g. on Windows: C:\Users\<User>\AppData\Roaming\<app-name>\appData.json
  return path.join(app.getPath("userData"), DATA_FILE_NAME);
};

/**
 * Read JSON data from the file system.
 * Returns either the parsed JSON or an empty object on failure.
 */
export const readAppData = (): AppData => {
  try {
    const fileContents = readFileSync(getDataFilePath(), "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading data file:", error);
    // Return an empty object or default data if the file doesn't exist or fails to parse
    return { profiles: [] };
  }
};

/**
 * Write JSON data to the file system.
 * @param data - The data to write to the file.
 */
export const writeAppData = (data: AppData): void => {
  try {
    const filePath = getDataFilePath();
    
    // Check if file exists before writing
    const fileExists = require('fs').existsSync(filePath);
    
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    
    if (!fileExists) {
      console.log(`AppData file created at: ${filePath}`);
    }
  } catch (error) {
    console.error("Error writing data file:", error);
  }
};

//Register all of our methods in the main.ts logic
export const registerAppDataMethods = () => {
  ipcMain.handle("read-app-data", async () => {
    return readAppData();
  });

  ipcMain.handle("write-app-data", async (_event, newData) => {
    writeAppData(newData);
  });
};
