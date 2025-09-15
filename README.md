# Support-Buddy

# LLaMA Runner — Minimal Chrome/Firefox Extension with Dual Build

This version supports building **Chrome MV3** and **Firefox MV2** from the same codebase using Vite.

---

## Project structure

```
my-extension/
  manifest.chrome.json  # MV3 manifest for Chrome
  manifest.firefox.json # MV2 manifest for Firefox
  vite.config.js
  src/
    background.js
    content.js
    options.js
    popup.js
  options.html
  popup.html
```

---

## Vite config (`vite.config.js`)

```js
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
      }
    }
  ]
});
```

> Use `TARGET=chrome npm run build` or `TARGET=firefox npm run build`

---

## Chrome Manifest (`manifest.chrome.json`) MV3

```json
{
  "manifest_version": 3,
  "name": "LLaMA Content Filter",
  "version": "1.0",
  "permissions": ["storage", "scripting", "activeTab"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "options_page": "options.html",
  "action": { "default_popup": "popup.html" }
}
```

## Firefox Manifest (`manifest.firefox.json`) MV2

```json
{
  "manifest_version": 2,
  "name": "LLaMA Content Filter",
  "version": "1.0",
  "permissions": ["storage", "tabs", "activeTab"],
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "browser_action": {
    "default_popup": "popup.html"
  }
}
```

---

### Notes

1. **Background script differences**: Firefox MV2 uses `scripts` array, no service worker; Chrome MV3 uses `service_worker` with `type: module`.
2. **scripting.executeScript**: In Firefox MV2, use `tabs.executeScript` instead.
3. **WebGPU & webllm**: Chrome is preferred; Firefox users must enable WebGPU.
4. **Building**:

   ```bash
   TARGET=chrome npm run build
   TARGET=firefox npm run build
   ```

   Outputs go to `dist/chrome/` and `dist/firefox/`.
5. **Loading**: Load unpacked (Chrome) or temporary add-on (Firefox) from respective `dist/` folder.
