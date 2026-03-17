// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

const syncPlugin = () => ({
  name: 'sync-plugin',
  configureServer(server) {
    server.middlewares.use('/api/sync', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      exec('node scripts/fetch-images.cjs', (err, stdout, stderr) => {
        if (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message, stderr }));
        } else {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, stdout }));
        }
      });
    });
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  base: '/quick-market/',
  plugins: [react(), syncPlugin()],
})
