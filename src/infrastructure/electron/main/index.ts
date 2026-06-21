import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../../../public/images/hust-logo.png?asset'
import * as fs from 'fs'
import * as path from 'path'
import { app as serverApp } from '../../../../server/app'

// ───────────────────────────────────────────────────────────
// Logging helper
// ───────────────────────────────────────────────────────────
const logsDir = path.join(app.getPath('userData'), '..', '..', 'logs')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })

function writeLog(message: string) {
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`
  const logFile = path.join(logsDir, 'app-menu.log')
  fs.appendFileSync(logFile, logLine, 'utf8')
  console.log(logLine.trim())
}


let isLoggedIn = false
let mainWindowRef: BrowserWindow | null = null

// ───────────────────────────────────────────────────────────
// Build the native application menu
// ───────────────────────────────────────────────────────────
function buildAppMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS: first menu is the app menu (its label is replaced by the app name)
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
            ],
          },
        ]
      : []),

    // ── Quit menu ──────────────────────────────────────────
    {
      label: 'Quit',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            writeLog('[MENU] User selected Exit – quitting application')
            app.quit()
          },
        },
        { type: 'separator' },
        {
          label: 'Log Out',
          enabled: isLoggedIn,
          click: () => {
            writeLog('[MENU] User selected Log Out')
            mainWindowRef?.webContents.send('menu:logout')
          },
        },
      ],
    },

    // ── Info menu ──────────────────────────────────────────
    {
      label: 'Info',
      submenu: [
        {
          label: 'Về ứng dụng…',
          click: () => {
            writeLog('[MENU] User opened About dialog')
            mainWindowRef?.webContents.send('menu:show-about')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ───────────────────────────────────────────────────────────
// IPC handlers (called from renderer via preload)
// ───────────────────────────────────────────────────────────
function registerIpcHandlers(): void {
  // Renderer notifies main when login state changes
  ipcMain.on('app:set-logged-in', (_event, value: boolean) => {
    isLoggedIn = value
    writeLog(`[IPC] Login state updated: ${isLoggedIn}`)
    buildAppMenu()       // rebuild menu so Log Out becomes enabled/disabled
  })
}

// ───────────────────────────────────────────────────────────
// Window creation
// ───────────────────────────────────────────────────────────
function createWindow(): void {
  mainWindowRef = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    autoHideMenuBar: false,  // show native menu bar
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindowRef.on('ready-to-show', () => {
    mainWindowRef!.show()
  })

  mainWindowRef.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindowRef.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindowRef.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ───────────────────────────────────────────────────────────
// App lifecycle
// ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  buildAppMenu()
  createWindow()

  // ───────────────────────────────────────────────────────────
  // Start Express Server
  // ───────────────────────────────────────────────────────────
  try {
    const PORT = process.env.PORT || 3002
    serverApp.listen(PORT, () => {
      writeLog(`[SERVER] Express Server started dynamically on port ${PORT}`)
      console.log(`[SERVER] Express Server started dynamically on port ${PORT}`)
    })
  } catch (error) {
    writeLog(`[SERVER] Failed to start Express Server: ${error}`)
    console.error(`[SERVER] Failed to start Express Server:`, error)
  }

  writeLog('[APP] Application started')

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  writeLog('[APP] All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
