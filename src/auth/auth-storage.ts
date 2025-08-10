import path from "path";
import { GAME_FOLDER } from "../utils/folder-paths";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { Minecraft } from "msmc";
import { getAvatar } from "../utils/auth";
import { MCToken } from "msmc/types/types";
import { LAUNCHER_FOLDER, LAUNCHER_GAME_FOLDER } from "../utils/names";

export function getStoragePath(): string {
  return path.join(LAUNCHER_FOLDER, "account.json");
}

export function getAuthStorage() {
  try {
    const data = readFileSync(getStoragePath(), "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {
      profile: {
        id: "",
        name: "",
      },
      accessToken: "",
    };
  }
}

export async function updateAuth(token: MCToken | null) {
  const avatar = await getAvatar(token?.profile?.id || "");

  const authData = {
    ...token,
    avatar,
  };

  // Ensure the directory exists
  const storagePath = getStoragePath();
  const dirPath = path.dirname(storagePath);

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  try {
    writeFileSync(getStoragePath(), JSON.stringify(authData, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save auth data", error);
  }
}
