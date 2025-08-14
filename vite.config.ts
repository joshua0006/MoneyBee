import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Disable lovable-tagger to prevent 3D rendering conflicts
    // ...(mode === 'development' ? [componentTagger()] : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: mode === 'development' ? [] : undefined,
      output: {
        // Handle PDF.js worker properly
        manualChunks: {
          'pdf-worker': ['pdfjs-dist']
        }
      }
    },
  },
  optimizeDeps: {
    include: ['@capacitor/core', '@capacitor/camera', '@capacitor/filesystem', 'pdfjs-dist']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  assetsInclude: ['**/*.worker.js']
}));
