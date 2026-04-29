import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true, // allows 0.0.0.0
    port: 4173,
    allowedHosts: ["lumicaa.onrender.com"],
  },
});
