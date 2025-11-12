// electron.cjs
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "build", "icon.ico"),
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools();
  } else {
    // استخدم URL بدل loadFile حتى يدعم React Router
    const indexPath = pathToFileURL(path.join(__dirname, "dist", "index.html")).href;
    win.loadURL(indexPath);
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.najaf.archive");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
