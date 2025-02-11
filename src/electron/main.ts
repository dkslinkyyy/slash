import { app, BrowserWindow } from "electron";
import { isDev } from "./utils.js";
import path from "path";
import { getPreloadPath } from "./pathResolver.js";
import { socketConnect } from "./socketConnection.js";

app.on("ready", () => {
  console.log("App is ready"); // Check if this gets logged
  socketConnect();

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    ``;
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});
