import { ipcMain as emitter } from "electron";
import { auth, logout } from "../auth/auth-manager";
import { getAccountData } from "../utils/auth";

emitter.handle("login", async (e) => {
  const { accessToken, profile } = await auth();

  if (!accessToken) {
    console.log("Failed to authenticate");
    return;
  }

  return {
    profile,
  };
});

emitter.on("logout", async (e) => {
  await logout();
});

emitter.on("exit", () => {
  process.exit(0);
});

emitter.handle("get-account", () => {
  return getAccountData();
});
