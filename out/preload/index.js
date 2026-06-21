"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  /**
   * Notify the main process that the login state has changed.
   * Pass `true` when a user logs in, `false` when they log out.
   */
  setLoggedIn: (value) => electron.ipcRenderer.send("app:set-logged-in", value),
  /**
   * Register a listener that fires when the native "Log Out" menu item is clicked.
   */
  onMenuLogout: (callback) => {
    electron.ipcRenderer.on("menu:logout", callback);
    return () => electron.ipcRenderer.removeListener("menu:logout", callback);
  },
  /**
   * Register a listener that fires when the native "About" menu item is clicked.
   */
  onMenuShowAbout: (callback) => {
    electron.ipcRenderer.on("menu:show-about", callback);
    return () => electron.ipcRenderer.removeListener("menu:show-about", callback);
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
