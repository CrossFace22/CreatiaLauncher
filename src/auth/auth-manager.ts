import { Auth, Minecraft } from "msmc";
import { decodeJWT, getAvatar } from "../utils/auth";
import { getAuthStorage, updateAuth } from "./auth-storage";

const authManager = new Auth("select_account");

export async function auth(): Promise<{
  profile: {
    name: string;
    id: string;
  };
  accessToken: string;
  avatar?: string | null;
}> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    return {
      profile: getAuthStorage().profile,
      accessToken,
    };
  }

  // If no access token, launch the auth manager
  const xboxManager = await authManager.launch("electron");

  const token = await xboxManager.getMinecraft();

  if (!token || !token.profile) {
    throw new Error("Failed to get token or profile");
  }

  const avatar = await getAvatar(token.profile.id);

  updateAuth(token.getToken(true));

  return {
    profile: token.profile,
    accessToken: token.mcToken,
    avatar: avatar,
  };
}

export async function logout(): Promise<void> {
  const accessToken = getAuthStorage().mcToken;

  if (accessToken) {
    // Clear the auth storage
    updateAuth(null);
  }
}

const getAccessToken = async (): Promise<string | null> => {
  const refreshToken = getAuthStorage().refresh;

  if (!refreshToken) return null;

  try {
    const refreshed = await authManager.refresh(refreshToken);

    const tokenRefreshed = (await refreshed.getMinecraft()).getToken(true);

    console.log("Refreshed!");

    if (tokenRefreshed) await updateAuth(tokenRefreshed);

    return tokenRefreshed.mcToken;
  } catch (err) {
    return null;
  }
};
