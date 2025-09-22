# Support-Buddy

Support Buddy is a Chrome extension designed to detect and protect against Gender Based Violence (GBV) on X/Twitter. The project leverages local AI models (via WebLLM) to analyze and filter content in real time, ensuring user privacy by keeping all processing within the browser. 

Key features and resources:
- **Content Filtering:** Monitors and parses tweets for GBV-related content, aiming for efficient and low-latency detection.
- **Privacy-Focused:** Uses WebLLM to run AI models locally, so no data leaves your browser.
- **Inspirations:** Builds on ideas from similar extensions like Uli, which blocks explicit slur words, but extends functionality with AI-based detection.
- **Design Input:** Developed in collaboration with GBV experts, with ongoing workshops to refine actions and interface.
- **Open Source Resources:** References and adapts code from projects such as [WebLLM](https://webllm.mlc.ai/) and [Uli](https://github.com/tattle-made/Uli/tree/main/browser-extension).

For contributors: 
- Please review the requirements and design documents in this folder.
- If you don’t have an X account, set up an anonymous one for testing.
- See the Trello board for project management and the Balsamiq mockups for UI ideas.

This project is a work in progress and welcomes contributions and feedback from both technical and subject matter experts.




# Support Buddy Runner — Minimal Chrome/Firefox Extension with Dual Build

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
  "name": "Support Buddy Content Filter",
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
  "name": "Support Buddy Content Filter",
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


Model types

- LLama
- Mistral

System prompts for the models
User prompts