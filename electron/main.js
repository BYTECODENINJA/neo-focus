const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let loadingWindow;

const scheduleEventsPath = path.join(app.getPath('userData'), 'scheduledEvents.json');

function readScheduleEvents() {
  try {
    const data = fs.readFileSync(scheduleEventsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeScheduleEvents(events) {
  fs.writeFileSync(scheduleEventsPath, JSON.stringify(events, null, 2));
}

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
    icon: path.join(__dirname, '../neo-focus.ico'),
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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Allow loading local files
    },
    icon: path.join(__dirname, '../neo-focus.ico'),
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
    // In packaged app, the out directory is in the same directory as main.js
    const indexPath = path.join(__dirname, 'out/index.html');
    console.log('Loading production app from:', indexPath);
    console.log('Current directory:', __dirname);
    console.log('App path:', app.getAppPath());
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
      console.error('Index file not found at:', indexPath);
      // Try alternative path
      const altPath = path.join(__dirname, '../out/index.html');
      if (fs.existsSync(altPath)) {
        console.log('Found index file at alternative path:', altPath);
        mainWindow.loadFile(altPath);
      } else {
        console.error('Index file not found at alternative path either');
        // Show error window
        mainWindow.loadURL('data:text/html,<html><body><h1>Error: Application files not found</h1><p>Please reinstall the application.</p></body></html>');
      }
    } else {
      mainWindow.loadFile(indexPath);
    }
    
    mainWindow.once('ready-to-show', () => mainWindow.show());
    
    // Add error handling
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load app:', errorCode, errorDescription);
    });
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

ipcMain.handle('save-schedule-event', (event, newEvent) => {
  const events = readScheduleEvents();
  const index = events.findIndex(e => e.id === newEvent.id);
  if (index !== -1) {
    events[index] = newEvent;
  } else {
    events.push(newEvent);
  }
  writeScheduleEvents(events);
});

ipcMain.handle('get-schedule-events', (event, date) => {
  const events = readScheduleEvents();
  return events.filter(e => e.date === date);
});

ipcMain.handle('delete-schedule-event', (event, eventId) => {
  const events = readScheduleEvents();
  const filteredEvents = events.filter(e => e.id !== eventId);
  writeScheduleEvents(filteredEvents);
});