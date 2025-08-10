import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import fs from "fs";
import path from "path";
import { pipeline as streamPipeline } from "node:stream/promises";
import { GAME_FOLDER, MODS_FOLDER } from "../utils/folder-paths";
import { ipcMain as emitter } from "electron";
import { Config, getVersionConfig } from "../config/config-loader";
import { LAUNCHER_FOLDER, LAUNCHER_GAME_FOLDER } from "../utils/names";

const ACCOUNT_ID = ""; //process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = ""; //process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY =
  ""; //process.env.R2_SECRET_ACCESS_KEY || "";
export const BUCKET_NAME = ""; // process.env.R2_BUCKET_NAME || "";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export async function listBuckets() {
  try {
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await S3.send(command);
    return response;
  } catch (error) {
    console.error("Error listing buckets:", error);
    throw error;
  }
}

export async function getBucketContent(bucketName: string) {
  try {
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;
    const allContents: any[] = [];

    while (isTruncated) {
      const command: ListObjectsV2Command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });
      const response = await S3.send(command);

      if (response.Contents) {
        allContents.push(...response.Contents);
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    return allContents;
  } catch (error) {
    console.error("Error getting bucket content:", error);
    throw error;
  }
}

export async function getContent(bucketName: string, path: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    });
    const response = await S3.send(command);

    if (response.Body) {
      const streamBody = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];

      for await (const chunk of streamBody) {
        chunks.push(chunk as Buffer);
      }

      return Buffer.concat(chunks).toString("utf-8");
    } else {
      console.error(`Failed to get file content for ${path}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting file content:", error);
    throw error;
  }
}

export async function downloadContent(
  bucketName: string,
  path: string,
  destination: string
) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: path,
    });
    const response = await S3.send(command);

    if (response.Body) {
      const streamBody = response.Body as NodeJS.ReadableStream;
      const writeStream = fs.createWriteStream(destination);
      await streamPipeline(streamBody, writeStream);
      console.log(`Downloaded ${path} to ${destination}`);
    } else {
      console.error(`Failed to download file ${path}`);
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

export async function downloadInstance(emitter: Electron.IpcMainInvokeEvent) {
  try {
    const versions = await getVersionConfig();
    let localVersion: Config = {
      instance: "",
      modLoader: "",
      modLoaderVersion: "",
      version: "",
    };

    if (!fs.existsSync(path.join(LAUNCHER_FOLDER, "versions.json"))) {
      console.log("Downloading versions metadata");
      fs.writeFileSync(
        path.join(LAUNCHER_FOLDER, "versions.json"),
        JSON.stringify(versions)
      );
    } else {
      localVersion = JSON.parse(
        fs.readFileSync(path.join(LAUNCHER_FOLDER, "versions.json")).toString()
      );
    }

    if (localVersion.instance === versions.instance && !isModsFolderEmpty())
      return console.log("Same instance version, skip updating");

    const bucketContent = await getBucketContent(BUCKET_NAME);
    const instanceContent = bucketContent.filter((file) =>
      file.Key?.startsWith("instance/")
    );

    if (!instanceContent || instanceContent.length === 0) {
      console.log("No mods found, skipping...");
      return;
    }

    // Get the directories we need to sync (e.g., 'mods', 'config', etc.)
    const bucketDirs = new Set(
      instanceContent.map(
        (file) => file.Key?.replace("instance/", "").split("/")[0]
      )
    );

    // Get local files only from the directories we need to sync
    const instanceFolder = path.join(GAME_FOLDER);
    let localFiles: string[] = [];

    bucketDirs.forEach((dir) => {
      if (dir) {
        const dirPath = path.join(instanceFolder, dir);
        if (fs.existsSync(dirPath)) {
          localFiles = localFiles.concat(getAllFiles(dirPath));
        }
      }
    });

    // Set to listing all files and routes from the instance

    const bucketFiles = new Set(
      instanceContent.map((file) => file.Key?.replace("instance/", ""))
    );

    // Delete files that aren't in the bucket
    for (const localFile of localFiles) {
      const relativePath = path
        .relative(instanceFolder, localFile)
        .split(path.sep)
        .join("/");

      const foldersToIgnore = [
        "etched-sounds/",
        "immersive-paintings/",
        "schematics/",
        "saves/",
      ];

      if (foldersToIgnore.some((folder) => relativePath.startsWith(folder)))
        return;

      if (!bucketFiles.has(relativePath)) {
        console.log(`Removing outdated file: ${relativePath}`);
        fs.unlinkSync(localFile);
      }
    }

    const totalFiles = instanceContent.length;
    let downloadedFiles = 0;

    // 3 file parallel download
    const chunkSize = 3;
    const chunks = [];
    for (let i = 0; i < instanceContent.length; i += chunkSize) {
      chunks.push(instanceContent.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (file: any) => {
          const fileName = file.Key || "";
          const dest = path.join(
            GAME_FOLDER,
            fileName.replace("instance/", "")
          );

          const dir = path.dirname(dest);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest);
            const fileSize = file.Size || 0;

            if (stats.size === fileSize) {
              downloadedFiles++;
              emitter.sender.send("install-progress", {
                progress: downloadedFiles,
                total: totalFiles,
                type: "instance",
              });
              return;
            }
          }

          await downloadContent(BUCKET_NAME, fileName, dest);
          downloadedFiles++;
          emitter.sender.send("install-progress", {
            progress: downloadedFiles,
            total: totalFiles,
            type: "instance",
          });
        })
      );
    }
  } catch (error) {
    console.error("Error downloading instance content:", error);
    emitter.sender.send("install-error", {
      type: "instance",
      error: error,
    });
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function isModsFolderEmpty(): boolean {
  if (!fs.existsSync(MODS_FOLDER)) {
    console.log("La carpeta de mods no existe.");
    return true;
  }

  const files = fs.readdirSync(MODS_FOLDER).filter((f) => {
    const fullPath = path.join(MODS_FOLDER, f);
    return fs.statSync(fullPath).isFile();
  });

  return files.length === 0;
}
