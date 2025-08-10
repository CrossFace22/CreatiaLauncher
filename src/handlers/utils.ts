import { ipcMain as emitter } from "electron";
import { GAME_FOLDER } from "../utils/folder-paths";
import path from "path";
import fs, { mkdirSync } from "fs";
import { shell } from "electron";
import { getCurrentEvent, getWhitelist } from "../config/config-loader";

let currentImageIndex = 0;

emitter.on("open-folder", async (e, folderPath) => {
  try {
    if (!fs.existsSync(path.join(GAME_FOLDER, folderPath)))
      mkdirSync(path.join(GAME_FOLDER, folderPath));
    shell.openPath(path.join(GAME_FOLDER, folderPath));
  } catch (error) {}
});

emitter.handle("get-next-image", async () => {
  const screenshotsFolder = path.join(GAME_FOLDER, "screenshots");
  if (!fs.existsSync(screenshotsFolder)) {
    return null;
  }

  const files = fs.readdirSync(screenshotsFolder);
  const imageFiles = files.filter((file) =>
    /\.(png|jpe?g|gif|webp)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    return null;
  }

  const imagePath = path.join(screenshotsFolder, imageFiles[currentImageIndex]);
  currentImageIndex = (currentImageIndex + 1) % imageFiles.length; // Ciclo circular
  return imagePath;
});

emitter.handle("get-config", async () => {
  try {
    const whitelist = await getWhitelist();
    const currentEvent = await getCurrentEvent();

    return {
      whitelist,
      currentEvent,
    };
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
});
