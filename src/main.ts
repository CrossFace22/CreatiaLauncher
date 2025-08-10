import { launch } from "@xmcl/core";
import dotenv from "dotenv";
import { app, BrowserWindow, ipcMain as emitter } from "electron";
import log from "electron-log/main";
import path from "path";
import { Agent } from "undici";
import { auth } from "./auth/auth-manager";
import { getVersionConfig, getWhitelist } from "./config/config-loader";
import { getSettings } from "./config/settings";
import "./handlers/index";
import { loadFabric } from "./loaders/fabric";
import { loadForge } from "./loaders/forge";
import { GAME_FOLDER } from "./utils/folder-paths";
import { loadEnvVars } from "./utils/env";
dotenv.config();
loadEnvVars();

if (require("electron-squirrel-startup")) app.quit();

//This download agent is so important, without it, the download will be very slow and sometimes fail
export const agent = new Agent({
  connections: 5,
});

log.initialize();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 748,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      devTools: false,
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
    },
    resizable: false,
    title: "Creatia Launcher",
    icon: __dirname + "/resources/C3.ico",
  });

  win.setMenuBarVisibility(false);

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
};

app.whenReady().then(createWindow);

emitter.on("launch-app", async (e, loader) => {
  try {
    await start(loader);
  } catch (error) {
    e.sender.send("error", {
      type: "download",
      message: error,
    });
  }
});

async function start(loader: string) {
  let authentication;
  try {
    authentication = await auth();
  } catch (e) {
    console.log("Failed to authenticate", e);
    throw e;
  }
  const whitelist = await getWhitelist();

  if (!whitelist.includes(authentication.profile.name))
    throw new Error(
      "No estas en la whitelist, pidele a un Administrador que te agregue."
    );

  // Load config
  const versionConfig = await getVersionConfig();

  const launcherSettings = await getSettings();

  if (!versionConfig) {
    console.log("Failed to load version config");
    throw new Error("Failed to load version config");
  }

  const GAME_VERSION = versionConfig.version;

  let gameVersion;

  switch (loader) {
    case "fabric":
      gameVersion = await loadFabric(
        GAME_VERSION,
        versionConfig.modLoaderVersion
      );
      break;
    case "forge":
      gameVersion = await loadForge(
        GAME_VERSION,
        versionConfig.modLoaderVersion
      );
      break;
    default:
      gameVersion = GAME_VERSION;
  }

  if (!gameVersion) {
    throw new Error("Failed to install fabric loader");
  }

  await launch({
    accessToken: authentication.accessToken,
    gameProfile: {
      id: authentication.profile.id,
      name: authentication.profile.name,
    },
    version: gameVersion,
    gamePath: GAME_FOLDER,
    javaPath: launcherSettings.javaPath,
    maxMemory: launcherSettings.memoryMax,
    minMemory: launcherSettings.memoryMin,
    extraJVMArgs: ["-Dfml.earlyprogresswindow=false", "-Duser.language=en"],
    ignorePatchDiscrepancies: true,
    ignoreInvalidMinecraftCertificates: true,
    extraExecOption: { detached: true },
    resolution: {
      height: 482,
      width: 856,
    },
  });

  process.exit(0);
}
