const { contextBridge, ipcRenderer } = require('electron')
const parser = require('./utils/parser')

contextBridge.exposeInMainWorld('electronAPI', {
    openDumpFile: () => ipcRenderer.invoke('dialog:openDumpFile'),
    openTailFile: () => ipcRenderer.invoke('dialog:openTailFile'),
    readDumpFile: (filePath) => parser.readDumpFile(filePath),
    readTailFile: (filePath) => parser.readTailFile(filePath)
})
