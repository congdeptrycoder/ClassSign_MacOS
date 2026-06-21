import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs exposed to the renderer process
const api = {
  /**
   * Notify the main process that the login state has changed.
   * Pass `true` when a user logs in, `false` when they log out.
   */
  setLoggedIn: (value: boolean) => ipcRenderer.send('app:set-logged-in', value),

  /**
   * Register a listener that fires when the native "Log Out" menu item is clicked.
   */
  onMenuLogout: (callback: () => void) => {
    ipcRenderer.on('menu:logout', callback)
    // Return a cleanup function so callers can unsubscribe
    return () => ipcRenderer.removeListener('menu:logout', callback)
  },

  /**
   * Register a listener that fires when the native "About" menu item is clicked.
   */
  onMenuShowAbout: (callback: () => void) => {
    ipcRenderer.on('menu:show-about', callback)
    return () => ipcRenderer.removeListener('menu:show-about', callback)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
