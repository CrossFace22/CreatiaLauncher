import { ResolvedVersion } from "@xmcl/core";
import { getVersionList, installTask, MinecraftVersion } from "@xmcl/installer";
import { Task } from "@xmcl/task";
import { ipcMain as emitter } from "electron";
import { getVersionConfig, getWhitelist } from "../config/config-loader";
import { agent } from "../main";
import { downloadContent, downloadInstance } from "../services/storage";
import { GAME_FOLDER } from "../utils/folder-paths";
import { auth } from "../auth/auth-manager";
import { getSettings, updateSettings } from "../config/settings";
import { checkOrInstallJava } from "../utils/java";
import fs from "fs";
import path from "path";
import { LAUNCHER_FOLDER, LAUNCHER_GAME_FOLDER } from "../utils/names";

emitter.handle("install-game", async (e) => {
  try {
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

    const versionConfig = await getVersionConfig();
    const GAME_VERSION = versionConfig.version;

    //Minecraft version
    const list: MinecraftVersion[] = (await getVersionList()).versions;
    const version: MinecraftVersion =
      list.find((v) => v.id == GAME_VERSION) || list[0]; // i just pick the first version in list here

    const installGameTask: Task<ResolvedVersion> = installTask(
      version,
      GAME_FOLDER,
      {
        //@ts-ignore
        agent: {
          //@ts-ignore
          dispatcher: agent,
        },
      }
    );

    // Init
    e.sender.send("install-progress", {
      progress: 0,
      total: installGameTask.total,
      type: "game",
    });

    //Download
    await safeInstall(installGameTask, e);

    // Send progress if there are no downloads
    e.sender.send("install-progress", {
      progress: 100,
      total: 100,
      type: "game",
    });

    // Download java
    const launcherSettings = getSettings();
    if (!launcherSettings.javaPath) {
      const javaPath = await checkOrInstallJava();
      updateSettings({
        javaPath,
      });
    }

    e.sender.send("install-complete", {
      type: "game",
    });

    await downloadInstanceWithRetry(e);

    const versions = await getVersionConfig();
    // Write new version
    fs.writeFileSync(
      path.join(LAUNCHER_FOLDER, "versions.json"),
      JSON.stringify(versions)
    );

    e.sender.send("install-complete", {
      type: "instance",
    });
  } catch (error) {
    console.error("Error during installation:", error);
    e.sender.send("install-error", error);
  }
});

async function safeInstall(
  installer: Task<ResolvedVersion>,
  emitter: Electron.IpcMainInvokeEvent,
  retries = 4
) {
  for (let index = 0; index < retries; index++) {
    try {
      let progress = 0;
      let progressInterval: any;

      // Run the tasks sequentially
      await installer.startAndWait({
        onUpdate(task: Task<any>, result: any) {
          if (!progressInterval) {
            progressInterval = setInterval(() => {
              const maxProgress = 85;
              const increment = Math.floor(Math.random() * 5) + 1; // Incrementos más pequeños (1-5)

              progress = Math.min(progress + increment, maxProgress);

              emitter.sender.send("install-progress", {
                progress: progress,
                total: 100,
                type: "game",
              });
            }, 2000);
          }
        },
        onFailed(task: Task<any>) {
          console.error("Task failed:", task.name);
          throw new Error("Task failed");
        },
      });

      clearTimeout(progressInterval);
      return;
    } catch (err: any) {
      //if (!err.message?.includes("DownloadAggregateError")) throw err;
      installer.cancel();
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  throw new Error("Download failed after many retries");
}

async function downloadInstanceWithRetry(
  emitter: Electron.IpcMainInvokeEvent,
  retries = 3
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await downloadInstance(emitter);
      return; // éxito
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(
        `Retry ${attempt + 1}/${retries} for file ${path} failed. Retrying...`
      );
      await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt))); // backoff
    }
  }
}
