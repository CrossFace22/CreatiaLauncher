import { ipcMain as emitter, dialog } from "electron";
import { getSettings, updateSettings } from "../config/settings";

emitter.on("update-settings", async (e, settings) => {
  const { javaPath, memoryMax, memoryMin, gamePath } = settings;

  if (javaPath) {
    settings.javaPath = javaPath;
  }

  if (memoryMax) {
    settings.memoryMax = memoryMax;
  }

  if (memoryMin) {
    settings.memoryMin = memoryMin;
  }

  if (gamePath) {
    settings.gamePath = gamePath;
  }

  updateSettings(settings);
});

emitter.handle("get-settings", async () => {
  const settings = getSettings();
  return {
    javaPath: settings.javaPath,
    memoryMax: settings.memoryMax,
    memoryMin: settings.memoryMin,
    gamePath: settings.gamePath,
  };
});

emitter.handle("open-file-dialog", async (event, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.filePaths[0];
});
