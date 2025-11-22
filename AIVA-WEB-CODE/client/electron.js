import { app, BrowserWindow } from "electron";
import path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false, // no title bar
    fullscreen: true, // fullscreen kiosk mode
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);