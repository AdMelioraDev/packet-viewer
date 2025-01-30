const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  // 덤프 파일 열기 대화상자
  ipcMain.handle('dialog:openDumpFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Binary Files', extensions: ['bin'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (!canceled) {
      return filePaths[0]
    }
  })

  // tail 파일 열기 대화상자
  ipcMain.handle('dialog:openTailFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Binary Files', extensions: ['bin'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (!canceled) {
      return filePaths[0]
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
