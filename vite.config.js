import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const targetBrowser = process.env.TARGET || 'chrome'; // 'chrome' or 'firefox'
const manifestFile = targetBrowser === 'chrome' ? 'manifest.chrome.json' : 'manifest.firefox.json';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: 'src/background.js',
        content: 'src/content.js',
        options: 'src/options.js',
        popup: 'src/popup.js'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    },
    outDir: `dist/${targetBrowser}`,
    emptyOutDir: true,
    target: 'es2022'
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        const src = path.resolve(manifestFile);
        const dest = path.resolve(`dist/${targetBrowser}/manifest.json`);
        fs.copyFileSync(src, dest);
        
        // Copy popup.html to dist directory
        const popupSrc = path.resolve('popup.html');
        const popupDest = path.resolve(`dist/${targetBrowser}/popup.html`);
        if (fs.existsSync(popupSrc)) {
          fs.copyFileSync(popupSrc, popupDest);
        }
      }
    }
  ]
});

