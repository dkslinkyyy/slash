const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('test', {
  fetch: async () => {
    try {
      const data = await ipcRenderer.invoke('fetchWsURL');
      console.log("Data from main process:", data); // Log in preload.js
      return data;
    } catch (error) {
      console.error("Error in preload.js:", error);
      throw error;
    }
  },
});
