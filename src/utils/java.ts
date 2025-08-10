import { app } from "electron";
import fs from "fs";
import https from "https";
import os from "os";
import path from "path";
import unzipper from "unzipper";

const JAVA_FOLDER = path.join(app.getPath("userData"), "Java");
const JAVA_EXECUTABLE =
  process.platform === "win32"
    ? path.join(JAVA_FOLDER, "jdk-21", "bin", "java.exe")
    : path.join(JAVA_FOLDER, "jdk-21", "bin", "java");

const ZIP_PATH = path.join(JAVA_FOLDER, "openjdk");

function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}

const getJavaUrl = () => {
  const platform = os.platform();

  switch (platform) {
    case "win32":
      return "https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_windows-x64_bin.zip";
    case "darwin":
      return "https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_macos-x64_bin.tar.gz";
    case "linux":
      return "https://download.java.net/java/GA/jdk21/fd2272bbf8e04c3dbaee13770090416c/35/GPL/openjdk-21_linux-x64_bin.tar.gz";
    default:
      throw new Error("Unsupported platform: " + platform);
  }
};

function downloadJavaZip(dest: string) {
  const javaUrl = getJavaUrl();

  if (!fileExists(JAVA_FOLDER)) {
    fs.mkdirSync(JAVA_FOLDER, { recursive: true });
  }

  if (fileExists(ZIP_PATH)) return;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(javaUrl, (response: any) => {
        if (response.statusCode !== 200)
          return reject("Error al descargar Java");
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

function extractJavaZip(zipPath: string, destFolder: string) {
  return fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: destFolder }))
    .promise();
}

export async function checkOrInstallJava() {
  if (fileExists(JAVA_EXECUTABLE)) {
    return JAVA_EXECUTABLE;
  }

  console.log("Java not found. Downloading...");
  await downloadJavaZip(ZIP_PATH);
  console.log("Download complete. Extracting...");
  await extractJavaZip(ZIP_PATH, JAVA_FOLDER);

  fs.unlinkSync(ZIP_PATH); // Limpieza

  console.log("Java installed on:", JAVA_EXECUTABLE);
  return JAVA_EXECUTABLE;
}
