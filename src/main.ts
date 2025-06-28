import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = !app.isPackaged;
const DATA_PATH = path.join(app.getPath('userData'), 'countdown-data.json');

// Data Types
interface Countdown {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (optional)
  folderId?: string;
  notified?: boolean;
}
interface Folder {
  id: string;
  name: string;
}
interface CountdownData {
  folders: Folder[];
  countdowns: Countdown[];
}

// File Utilities
function loadData(): CountdownData {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const initial: CountdownData = { folders: [], countdowns: [] };
      fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { folders: [], countdowns: [] };
  }
}
function saveData(data: CountdownData) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// IPC Handlers
ipcMain.handle('get-data', () => {
  return loadData();
});
ipcMain.handle('save-data', (_event, data: CountdownData) => {
  saveData(data);
  return true;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f8f8f8',
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 