import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import path from "path"; // Asegúrate de tener @types/node instalado (`npm i -D @types/node`)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Necesario para que las rutas funcionen correctamente en Electron
  base: "./",
  build: {
    // Directorio de salida para el build de producción de React
    outDir: path.join(__dirname, "build/renderer"),
    // Vaciar el directorio de salida en cada build
    emptyOutDir: true,
  },
  // Opcional: Configura el puerto del servidor de desarrollo si es necesario
  // server: {
  //   port: 3000 // Elige un puerto que no esté en uso
  // }
});
