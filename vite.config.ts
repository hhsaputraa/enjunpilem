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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — satu chunk, harus satu instance
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }

          // Supabase — besar, hanya dibutuhkan setelah auth
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'query-vendor';
          }

          // Radix UI — pisah per komponen agar tree-shaking lebih efektif
          if (id.includes('node_modules/@radix-ui/react-dialog') ||
              id.includes('node_modules/@radix-ui/react-alert-dialog') ||
              id.includes('node_modules/@radix-ui/react-sheet')) {
            return 'radix-dialog';
          }
          if (id.includes('node_modules/@radix-ui/react-dropdown-menu') ||
              id.includes('node_modules/@radix-ui/react-context-menu') ||
              id.includes('node_modules/@radix-ui/react-menubar')) {
            return 'radix-menu';
          }
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-misc';
          }

          // DnD Kit — hanya dipakai di CollectionDetails
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'dnd-vendor';
          }

          // Recharts — hanya dipakai jika ada chart
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'chart-vendor';
          }

          // Google OAuth — hanya dipakai di halaman auth
          if (id.includes('node_modules/@react-oauth/')) {
            return 'oauth-vendor';
          }

          // Embla carousel
          if (id.includes('node_modules/embla-carousel')) {
            return 'carousel-vendor';
          }

          // Vaul (drawer) + cmdk
          if (id.includes('node_modules/vaul') ||
              id.includes('node_modules/cmdk')) {
            return 'overlay-vendor';
          }
        },
      },
    },
  },
}));
