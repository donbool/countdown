import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data: any) => ipcRenderer.invoke('save-data', data),
  send: (channel: string, data?: any) => ipcRenderer.send(channel, data),
  on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
}); 