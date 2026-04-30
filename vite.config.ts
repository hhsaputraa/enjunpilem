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
    // Target browser modern — mengurangi polyfill yang tidak perlu
    target: ['es2020', 'chrome80', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // Agresif: hapus dead code
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — react + react-dom + scheduler harus satu instance
          // react-router-dom dipisah agar long task react-vendor lebih kecil
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }

          // React Router — pisah dari react-core untuk memecah long task 542ms
          if (id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-router/') ||
              id.includes('node_modules/@remix-run/')) {
            return 'react-router';
          }

          // Supabase — besar, hanya dibutuhkan setelah auth
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'query-vendor';
          }

          // Lucide icons — 1.1MB, pisah agar tidak masuk main chunk
          // Tree-shaking sudah bekerja tapi chunk tetap besar karena banyak icon dipakai
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }

          // Axios — dipakai oleh tmdb service
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor';
          }

          // Sonner toast — lazy loaded, pisah dari main
          if (id.includes('node_modules/sonner') ||
              id.includes('node_modules/next-themes')) {
            return 'sonner-vendor';
          }

          // Radix UI — pisah per kelompok komponen agar radix-misc tidak jadi
          // catch-all raksasa (sebelumnya 87% unused = 31KB terbuang)
          if (id.includes('node_modules/@radix-ui/react-dialog') ||
              id.includes('node_modules/@radix-ui/react-alert-dialog')) {
            return 'radix-dialog';
          }
          if (id.includes('node_modules/@radix-ui/react-dropdown-menu') ||
              id.includes('node_modules/@radix-ui/react-context-menu') ||
              id.includes('node_modules/@radix-ui/react-menubar')) {
            return 'radix-menu';
          }
          if (id.includes('node_modules/@radix-ui/react-select') ||
              id.includes('node_modules/@radix-ui/react-popover') ||
              id.includes('node_modules/@radix-ui/react-tooltip')) {
            return 'radix-overlay';
          }
          if (id.includes('node_modules/@radix-ui/react-tabs') ||
              id.includes('node_modules/@radix-ui/react-accordion') ||
              id.includes('node_modules/@radix-ui/react-collapsible')) {
            return 'radix-layout';
          }
          if (id.includes('node_modules/@radix-ui/react-avatar') ||
              id.includes('node_modules/@radix-ui/react-checkbox') ||
              id.includes('node_modules/@radix-ui/react-radio-group') ||
              id.includes('node_modules/@radix-ui/react-switch') ||
              id.includes('node_modules/@radix-ui/react-slider')) {
            return 'radix-form';
          }
          // Shared Radix primitives (tidak punya UI sendiri, dipakai banyak komponen)
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-primitives';
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
