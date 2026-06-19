// vite.config.ts
import { defineConfig } from "file:///D:/app/New-folder/enjunpilem/node_modules/vite/dist/node/index.js";
import react from "file:///D:/app/New-folder/enjunpilem/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/app/New-folder/enjunpilem/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\app\\New-folder\\enjunpilem";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    // Target browser modern — mengurangi polyfill yang tidak perlu
    target: ["es2020", "chrome80", "safari14"],
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        // Agresif: hapus dead code
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/scheduler/")) {
            return "react-core";
          }
          if (id.includes("node_modules/react-router-dom/") || id.includes("node_modules/react-router/") || id.includes("node_modules/@remix-run/")) {
            return "react-router";
          }
          if (id.includes("node_modules/@supabase/")) {
            return "supabase-vendor";
          }
          if (id.includes("node_modules/@tanstack/")) {
            return "query-vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide-icons";
          }
          if (id.includes("node_modules/axios")) {
            return "axios-vendor";
          }
          if (id.includes("node_modules/sonner") || id.includes("node_modules/next-themes")) {
            return "sonner-vendor";
          }
          if (id.includes("node_modules/@radix-ui/react-dialog") || id.includes("node_modules/@radix-ui/react-alert-dialog")) {
            return "radix-dialog";
          }
          if (id.includes("node_modules/@radix-ui/react-dropdown-menu") || id.includes("node_modules/@radix-ui/react-context-menu") || id.includes("node_modules/@radix-ui/react-menubar")) {
            return "radix-menu";
          }
          if (id.includes("node_modules/@radix-ui/react-select") || id.includes("node_modules/@radix-ui/react-popover") || id.includes("node_modules/@radix-ui/react-tooltip")) {
            return "radix-overlay";
          }
          if (id.includes("node_modules/@radix-ui/react-tabs") || id.includes("node_modules/@radix-ui/react-accordion") || id.includes("node_modules/@radix-ui/react-collapsible")) {
            return "radix-layout";
          }
          if (id.includes("node_modules/@radix-ui/react-avatar") || id.includes("node_modules/@radix-ui/react-checkbox") || id.includes("node_modules/@radix-ui/react-radio-group") || id.includes("node_modules/@radix-ui/react-switch") || id.includes("node_modules/@radix-ui/react-slider")) {
            return "radix-form";
          }
          if (id.includes("node_modules/@radix-ui/")) {
            return "radix-primitives";
          }
          if (id.includes("node_modules/@dnd-kit/")) {
            return "dnd-vendor";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "chart-vendor";
          }
          if (id.includes("node_modules/@react-oauth/")) {
            return "oauth-vendor";
          }
          if (id.includes("node_modules/embla-carousel")) {
            return "carousel-vendor";
          }
          if (id.includes("node_modules/vaul") || id.includes("node_modules/cmdk")) {
            return "overlay-vendor";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcHBcXFxcTmV3LWZvbGRlclxcXFxlbmp1bnBpbGVtXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxhcHBcXFxcTmV3LWZvbGRlclxcXFxlbmp1bnBpbGVtXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9hcHAvTmV3LWZvbGRlci9lbmp1bnBpbGVtL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcclxuICAgIC8vIFRhcmdldCBicm93c2VyIG1vZGVybiBcdTIwMTQgbWVuZ3VyYW5naSBwb2x5ZmlsbCB5YW5nIHRpZGFrIHBlcmx1XHJcbiAgICB0YXJnZXQ6IFsnZXMyMDIwJywgJ2Nocm9tZTgwJywgJ3NhZmFyaTE0J10sXHJcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxyXG4gICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJywgJ2NvbnNvbGUuZGVidWcnXSxcclxuICAgICAgICAvLyBBZ3Jlc2lmOiBoYXB1cyBkZWFkIGNvZGVcclxuICAgICAgICBwYXNzZXM6IDIsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1hbmdsZToge1xyXG4gICAgICAgIHNhZmFyaTEwOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNzc01pbmlmeTogdHJ1ZSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAvLyBSZWFjdCBjb3JlIFx1MjAxNCByZWFjdCArIHJlYWN0LWRvbSArIHNjaGVkdWxlciBoYXJ1cyBzYXR1IGluc3RhbmNlXHJcbiAgICAgICAgICAvLyByZWFjdC1yb3V0ZXItZG9tIGRpcGlzYWggYWdhciBsb25nIHRhc2sgcmVhY3QtdmVuZG9yIGxlYmloIGtlY2lsXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC8nKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QtZG9tLycpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9zY2hlZHVsZXIvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdyZWFjdC1jb3JlJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBSZWFjdCBSb3V0ZXIgXHUyMDE0IHBpc2FoIGRhcmkgcmVhY3QtY29yZSB1bnR1ayBtZW1lY2FoIGxvbmcgdGFzayA1NDJtc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3Qtcm91dGVyLWRvbS8nKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3Qtcm91dGVyLycpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmVtaXgtcnVuLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncmVhY3Qtcm91dGVyJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTdXBhYmFzZSBcdTIwMTQgYmVzYXIsIGhhbnlhIGRpYnV0dWhrYW4gc2V0ZWxhaCBhdXRoXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9Ac3VwYWJhc2UvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzdXBhYmFzZS12ZW5kb3InO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFRhblN0YWNrIFF1ZXJ5XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdGFuc3RhY2svJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdxdWVyeS12ZW5kb3InO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEx1Y2lkZSBpY29ucyBcdTIwMTQgMS4xTUIsIHBpc2FoIGFnYXIgdGlkYWsgbWFzdWsgbWFpbiBjaHVua1xyXG4gICAgICAgICAgLy8gVHJlZS1zaGFraW5nIHN1ZGFoIGJla2VyamEgdGFwaSBjaHVuayB0ZXRhcCBiZXNhciBrYXJlbmEgYmFueWFrIGljb24gZGlwYWthaVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdsdWNpZGUtaWNvbnMnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEF4aW9zIFx1MjAxNCBkaXBha2FpIG9sZWggdG1kYiBzZXJ2aWNlXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9heGlvcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnYXhpb3MtdmVuZG9yJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTb25uZXIgdG9hc3QgXHUyMDE0IGxhenkgbG9hZGVkLCBwaXNhaCBkYXJpIG1haW5cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3Nvbm5lcicpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9uZXh0LXRoZW1lcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnc29ubmVyLXZlbmRvcic7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmFkaXggVUkgXHUyMDE0IHBpc2FoIHBlciBrZWxvbXBvayBrb21wb25lbiBhZ2FyIHJhZGl4LW1pc2MgdGlkYWsgamFkaVxyXG4gICAgICAgICAgLy8gY2F0Y2gtYWxsIHJha3Nhc2EgKHNlYmVsdW1ueWEgODclIHVudXNlZCA9IDMxS0IgdGVyYnVhbmcpXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtZGlhbG9nJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1hbGVydC1kaWFsb2cnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JhZGl4LWRpYWxvZyc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtY29udGV4dC1tZW51JykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1tZW51YmFyJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdyYWRpeC1tZW51JztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1zZWxlY3QnKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXBvcG92ZXInKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXAnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JhZGl4LW92ZXJsYXknO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXRhYnMnKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvbicpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtY29sbGFwc2libGUnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JhZGl4LWxheW91dCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtYXZhdGFyJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aS9yZWFjdC1jaGVja2JveCcpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3QtcmFkaW8tZ3JvdXAnKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvQHJhZGl4LXVpL3JlYWN0LXN3aXRjaCcpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWkvcmVhY3Qtc2xpZGVyJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdyYWRpeC1mb3JtJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIFNoYXJlZCBSYWRpeCBwcmltaXRpdmVzICh0aWRhayBwdW55YSBVSSBzZW5kaXJpLCBkaXBha2FpIGJhbnlhayBrb21wb25lbilcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0ByYWRpeC11aS8nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JhZGl4LXByaW1pdGl2ZXMnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIERuRCBLaXQgXHUyMDE0IGhhbnlhIGRpcGFrYWkgZGkgQ29sbGVjdGlvbkRldGFpbHNcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BkbmQta2l0LycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZG5kLXZlbmRvcic7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmVjaGFydHMgXHUyMDE0IGhhbnlhIGRpcGFrYWkgamlrYSBhZGEgY2hhcnRcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlY2hhcnRzJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2QzLScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnY2hhcnQtdmVuZG9yJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBHb29nbGUgT0F1dGggXHUyMDE0IGhhbnlhIGRpcGFrYWkgZGkgaGFsYW1hbiBhdXRoXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmVhY3Qtb2F1dGgvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdvYXV0aC12ZW5kb3InO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEVtYmxhIGNhcm91c2VsXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9lbWJsYS1jYXJvdXNlbCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnY2Fyb3VzZWwtdmVuZG9yJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBWYXVsIChkcmF3ZXIpICsgY21ka1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvdmF1bCcpIHx8XHJcbiAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9jbWRrJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdvdmVybGF5LXZlbmRvcic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThRLFNBQVMsb0JBQW9CO0FBQzNTLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsRUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxjQUFjO0FBQUEsSUFDZCx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLFFBQVEsQ0FBQyxVQUFVLFlBQVksVUFBVTtBQUFBLElBQ3pDLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxRQUNmLFlBQVksQ0FBQyxlQUFlLGdCQUFnQixlQUFlO0FBQUE7QUFBQSxRQUUzRCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sVUFBVTtBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFHZixjQUFJLEdBQUcsU0FBUyxxQkFBcUIsS0FDakMsR0FBRyxTQUFTLHlCQUF5QixLQUNyQyxHQUFHLFNBQVMseUJBQXlCLEdBQUc7QUFDMUMsbUJBQU87QUFBQSxVQUNUO0FBR0EsY0FBSSxHQUFHLFNBQVMsZ0NBQWdDLEtBQzVDLEdBQUcsU0FBUyw0QkFBNEIsS0FDeEMsR0FBRyxTQUFTLDBCQUEwQixHQUFHO0FBQzNDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHlCQUF5QixHQUFHO0FBQzFDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHlCQUF5QixHQUFHO0FBQzFDLG1CQUFPO0FBQUEsVUFDVDtBQUlBLGNBQUksR0FBRyxTQUFTLDJCQUEyQixHQUFHO0FBQzVDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLG9CQUFvQixHQUFHO0FBQ3JDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHFCQUFxQixLQUNqQyxHQUFHLFNBQVMsMEJBQTBCLEdBQUc7QUFDM0MsbUJBQU87QUFBQSxVQUNUO0FBSUEsY0FBSSxHQUFHLFNBQVMscUNBQXFDLEtBQ2pELEdBQUcsU0FBUywyQ0FBMkMsR0FBRztBQUM1RCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyw0Q0FBNEMsS0FDeEQsR0FBRyxTQUFTLDJDQUEyQyxLQUN2RCxHQUFHLFNBQVMsc0NBQXNDLEdBQUc7QUFDdkQsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMscUNBQXFDLEtBQ2pELEdBQUcsU0FBUyxzQ0FBc0MsS0FDbEQsR0FBRyxTQUFTLHNDQUFzQyxHQUFHO0FBQ3ZELG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLG1DQUFtQyxLQUMvQyxHQUFHLFNBQVMsd0NBQXdDLEtBQ3BELEdBQUcsU0FBUywwQ0FBMEMsR0FBRztBQUMzRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxxQ0FBcUMsS0FDakQsR0FBRyxTQUFTLHVDQUF1QyxLQUNuRCxHQUFHLFNBQVMsMENBQTBDLEtBQ3RELEdBQUcsU0FBUyxxQ0FBcUMsS0FDakQsR0FBRyxTQUFTLHFDQUFxQyxHQUFHO0FBQ3RELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLHlCQUF5QixHQUFHO0FBQzFDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHdCQUF3QixHQUFHO0FBQ3pDLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLHVCQUF1QixLQUNuQyxHQUFHLFNBQVMsa0JBQWtCLEdBQUc7QUFDbkMsbUJBQU87QUFBQSxVQUNUO0FBR0EsY0FBSSxHQUFHLFNBQVMsNEJBQTRCLEdBQUc7QUFDN0MsbUJBQU87QUFBQSxVQUNUO0FBR0EsY0FBSSxHQUFHLFNBQVMsNkJBQTZCLEdBQUc7QUFDOUMsbUJBQU87QUFBQSxVQUNUO0FBR0EsY0FBSSxHQUFHLFNBQVMsbUJBQW1CLEtBQy9CLEdBQUcsU0FBUyxtQkFBbUIsR0FBRztBQUNwQyxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
