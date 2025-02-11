const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  test: () => console.log("testing"),
});
