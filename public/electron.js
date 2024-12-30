const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Load React DevTools only in development
if (process.env.NODE_ENV === 'development') {
  const { enable } = require('react-devtools');
  enable();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional preload script
      nodeIntegration: false, // Disable Node.js integration in renderer
      contextIsolation: true, // Enable context isolation for security
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000'); // React dev server
    mainWindow.webContents.openDevTools(); // Open dev tools
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html')); // React production build
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// WebSocket Client (Electron or Browser Client)
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
  // Send request to get session key
  const request = {
    type: "requestSessionKey",
    username: "testUser"
  };
  ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
  console.log("Received:", data);
});
