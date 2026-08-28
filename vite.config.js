import { defineConfig } from 'vite';
import { resolve } from 'path';

function devServerSwPlugin() {
  return {
    name: 'dev-server-sw-plugin',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/sw.js' || req.url?.startsWith('/sw.js?')) {
          try {
            const swPath = resolve(__dirname, 'src/worker/sw.js');
            const result = await server.transformRequest(swPath);
            if (result) {
              res.setHeader('Content-Type', 'application/javascript');
              return res.end(result.code);
            }
          } catch (e) {
            console.error('Error transforming sw.js in dev server:', e);
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  envDir: resolve(__dirname),
  publicDir: resolve(__dirname, 'src', 'public'),
  plugins: [devServerSwPlugin()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        sw: resolve(__dirname, 'src/worker/sw.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'sw') {
            return 'sw.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});