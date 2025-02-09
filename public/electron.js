const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");
const axios = require("axios");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets/slash-logo-sm.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("test  ", __dirname);

  app.dock.setIcon(path.join(__dirname, "assets/slash-logo-sm.png"));

  mainWindow.loadURL("http://localhost:3000"); // For dev mode
  mainWindow.webContents.openDevTools();
}

// Handle the fetch WebSocket URL request from renderer
const fetch = require("electron-fetch").default; // Import electron-fetch

ipcMain.handle("fetchWsURL", async () => {
  try {
    const response = await fetch(
      "http://slash-proxy-production.up.railway.app/webservers/requestConnection",
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (
      !data.server ||
      !data.server.websocketURL ||
      !data.server.serviceIdentifier
    ) {
      throw new Error("Invalid response structure");
    }

    return data; // Return the entire response so the renderer can access it
  } catch (error) {
    console.error("Error fetching WebSocket URL:", error);
    throw error;
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
