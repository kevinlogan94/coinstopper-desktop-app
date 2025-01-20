import { AppData } from "main/models";

export const writeAppData = (data: AppData): void => {
    window.electronAPI.writeAppData(data);
};

export const readAppData = async (): Promise<AppData> => {
  return await window.electronAPI.readAppData();
};
