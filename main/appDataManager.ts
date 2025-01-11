import { app } from "electron";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";

const DATA_FILE_NAME = "appData.json";

// Construct a consistent file path for reading/writing:
const getDataFilePath = () => {
  // This will store data in userData folder, e.g. on Windows: C:\Users\<User>\AppData\Roaming\<app-name>\appData.json
  return path.join(app.getPath("userData"), DATA_FILE_NAME);
};

/**
 * Read JSON data from the file system.
 * Returns either the parsed JSON or an empty object on failure.
 */
export const readAppData = (): Record<string, unknown> => {
  try {
    const fileContents = readFileSync(getDataFilePath(), "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading data file:", error);
    // Return an empty object or default data if the file doesn't exist or fails to parse
    return {};
  }
};

/**
 * Write JSON data to the file system.
 * @param data - The data to write to the file.
 */
export const writeAppData = (data: Record<string, unknown>): void => {
  try {
    writeFileSync(getDataFilePath(), JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing data file:", error);
  }
};
