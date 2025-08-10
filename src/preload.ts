import { contextBridge, ipcRenderer, shell } from "electron";

import log from "electron-log/renderer";
import { exit } from "process";
// "api" will be exposed just like the "window" object, to use methods from the main process in the renderer process
contextBridge.exposeInMainWorld("api", {
  launchApp: (loader: string) => ipcRenderer.send("launch-app", loader),
  log: (message: string) => log.info(message),
  getAccountData: async () => ipcRenderer.invoke("get-account"),
  getSettings: async () => ipcRenderer.invoke("get-settings"),
  updateSettings: async (settings: any) =>
    ipcRenderer.send("update-settings", settings),
  openFolder: async (path: string) => ipcRenderer.send("open-folder", path),
  login: async () => ipcRenderer.invoke("login"),
  logout: async () => ipcRenderer.send("logout"),
  exit: () => ipcRenderer.send("exit"),
  getNextImage: async () => ipcRenderer.invoke("get-next-image"),
  openExternal: (url: string) => shell.openExternal(url),
  getConfig: async () => ipcRenderer.invoke("get-config"),
  installGame: (loader: string) => ipcRenderer.invoke("install-game", loader),
  onInstallProgress: (
    callback: ({
      progress,
      total,
      type,
    }: {
      progress: number;
      total: number;
      type: string;
    }) => void
  ) =>
    ipcRenderer.on("install-progress", (e, progress) => {
      callback(progress);
    }),
  onInstallComplete: (callback: ({ type }: { type: string }) => void) =>
    ipcRenderer.on("install-complete", (e, type) => {
      callback(type);
    }),
  onInstallError: (callback: (error: string) => void) =>
    ipcRenderer.on("install-error", (e, error) => {
      callback(error);
    }),
  onError: (callback: any) => ipcRenderer.on("error", callback),
  openFileDialog: (options: any) =>
    ipcRenderer.invoke("open-file-dialog", options),
});
