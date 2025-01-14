import { ipcMain, BrowserWindow, shell } from "electron";

export const registerMiscellaneousMethods = () => {
  ipcMain.handle("refresh-page", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.reload();
    }
  });

  //Open a url on the user's default browser
  ipcMain.handle("open-external-url", async (_event, url: string) => {
    shell.openExternal(url);
  });
};
