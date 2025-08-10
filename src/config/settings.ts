import * as fs from "fs";
import { getJavaExecutablePath, SETTINGS_FILE } from "../utils/folder-paths";
import settingsJson from "../resources/settings_default.json";

export function getSettings(): Record<string, any> {
  checkSettingsFile();

  const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
  return JSON.parse(data);
}

export function updateSettings(newSettings: Record<string, any>): void {
  checkSettingsFile();

  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(updatedSettings, null, 2),
    "utf-8"
  );
}

export function checkSettingsFile(): void {
  if (!fs.existsSync(SETTINGS_FILE)) {
    console.log("Settings file not found, creating default settings file.");
    const settingsObject = {
      ...settingsJson,
      javaPath: getJavaExecutablePath(),
    };

    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(settingsObject, null, 2),
      "utf-8"
    );
  }
}
