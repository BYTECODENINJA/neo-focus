const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let loadingWindow;

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../neo-focus .ico'),
    show: false
  });

  loadingWindow.loadFile(path.join(__dirname, 'loading.html'));
  loadingWindow.center();
  loadingWindow.show();

  // Hide loading window after a delay
  setTimeout(() => {
    if (loadingWindow) {
      loadingWindow.close();
    }
  }, 3000);
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../neo-focus .ico'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: false,
    backgroundColor: '#1E1B4B'
  });

  // Show loading window first
  createLoadingWindow();

  // Load the app
  if (isDev) {
    const appUrl = 'http://localhost:3000';
    mainWindow.loadURL(appUrl);
    mainWindow.webContents.openDevTools();
    mainWindow.once('ready-to-show', () => mainWindow.show());
  } else {
    // In production, load the static files
    const indexPath = path.join(__dirname, '../out/index.html');
    mainWindow.loadFile(indexPath);
    mainWindow.once('ready-to-show', () => mainWindow.show());
  }

  // Show window when ready
  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.show();
  // });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}



// Create menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-task');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-app-name', () => app.getName()); 