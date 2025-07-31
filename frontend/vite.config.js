import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: You can set your desired frontend port here
    proxy: {
      "/api": {
        // Proxy requests starting with /api
        target: "http://localhost:5000", // To your backend server
        changeOrigin: true,
        secure: false, // For development with http
        // rewrite: (path) => path.replace(/^\/api/, ''), // If backend didn't use /api prefix
      },
    },
  },
});
