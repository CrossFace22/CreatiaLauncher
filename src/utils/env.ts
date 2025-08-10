import dotenv from "dotenv";
import path from "path";

export function loadEnvVars() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    dotenv.config();
  } else {
    const envPath = path.join(process.resourcesPath, ".env");
    dotenv.config({ path: envPath });
  }
}
