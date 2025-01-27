import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import {installExtension, VUEJS_DEVTOOLS} from 'electron-devtools-installer'
import { registerAppDataMethods } from "./services/appDataManager";
import { registerMiscellaneousMethods } from './services/miscellaneous';
import { registerSchedulerMethods } from './services/scheduler';
import { registerCoinbaseMethods } from './services/coinbase';
import { registerTradingAssistantMethods } from './services/tradingAssistantManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {

  // Install Vue.js Devtools in Development Mode
  if (!app.isPackaged) {
    try {
        const name = await installExtension(VUEJS_DEVTOOLS);
        console.log(`Added Extension: ${name}`);
    } catch (err) {
        console.error('Failed to install Vue.js Devtools:', err);
    }
}

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception in Main Process:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection in Main Process:", reason);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


// Register IPC handlers that the renderer process can call
registerAppDataMethods();
registerMiscellaneousMethods();
registerSchedulerMethods();
registerCoinbaseMethods();
registerTradingAssistantMethods();