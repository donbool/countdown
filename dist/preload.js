"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getData: () => electron_1.ipcRenderer.invoke('get-data'),
    saveData: (data) => electron_1.ipcRenderer.invoke('save-data', data),
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, func) => electron_1.ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
