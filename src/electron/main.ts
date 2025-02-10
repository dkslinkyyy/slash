import { app, BrowserWindow } from "electron";
import { isDev } from "./utils.js";
import path from "path";

app.on("ready", () => {
  console.log("App is ready"); // Check if this gets logged

  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false, // It is generally recommended to disable nodeIntegration for security reasons
      contextIsolation: true, // Helps in keeping renderer and main processes separate (security best practice)
    },
  });
  console.log("Test");

  if (isDev()) {
    console.log("yesss");
    mainWindow.loadURL("http://localhost:5123");
  } else {
    console.log("nooo");
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});
