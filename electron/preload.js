const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Window management
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),

  // Schedule events
  saveScheduleEvent: (event) => ipcRenderer.invoke('save-schedule-event', event),
  getScheduleEvents: (date) => ipcRenderer.invoke('get-schedule-events', date),
  deleteScheduleEvent: (eventId) => ipcRenderer.invoke('delete-schedule-event', eventId),
  
  // App events
  onNewTask: (callback) => ipcRenderer.on('new-task', callback),
  onAppReady: (callback) => ipcRenderer.on('app-ready', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
});