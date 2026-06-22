# 📋 Implementációs Terv

> Részletes implementációs ütemterv és milestone-ok

## Fázisok

### 🏗️ Fázis 0: Projekt inicializálás

| Lépés | Feladat | Státusz |
|---|---|---|
| 0.1 | `package.json` létrehozása (függőségek: turndown, @types/*, webpack, ts-loader, typescript) | ⬜ Tervezett |
| 0.2 | `tsconfig.json` konfigurálása (strict mode, ESNext target, DOM lib) | ⬜ Tervezett |
| 0.3 | `webpack.config.js` létrehozása (multi-entry: content, popup, background) | ⬜ Tervezett |
| 0.4 | `manifest.json` létrehozása (Manifest V3, permissions, content_scripts) | ⬜ Tervezett |
| 0.5 | Mappa struktúra létrehozása (`src/content/`, `src/popup/`, `src/background/`, `src/shared/`, `src/assets/`) | ⬜ Tervezett |

### 🧩 Fázis 1: Alap architektúra

| Lépés | Feladat | Státusz |
|---|---|---|
| 1.1 | `src/shared/types.ts` — Minden TypeScript interfész és típus definiálása | ⬜ Tervezett |
| 1.2 | `src/content/selectors.ts` — Szemantikus DOM szelektorok definiálása | ⬜ Tervezett |
| 1.3 | `src/content/utils.ts` — Segédfüggvények (escape, sanitize, debounce, filename sanitizer) | ⬜ Tervezett |

### 🔍 Fázis 2: DOM Scanner

| Lépés | Feladat | Státusz |
|---|---|---|
| 2.1 | `src/content/dom-scanner.ts` — Alap DOM bejárás: `Conversation` konténer megtalálása | ⬜ Tervezett |
| 2.2 | Üzenet elemek (`[role='listitem']`) kinyerése | ⬜ Tervezett |
| 2.3 | User vs Model azonosítás (`img[alt*='You']`, `"You:"` text match) | ⬜ Tervezett |
| 2.4 | Kódblokkok, LaTeX, táblázatok detektálása és extrakciója | ⬜ Tervezett |
| 2.5 | Idézetek és csatolmányok kezelése | ⬜ Tervezett |
| 2.6 | `ChatMessage[]` összeállítása | ⬜ Tervezett |

### 📜 Fázis 3: Auto-Scroller

| Lépés | Feladat | Státusz |
|---|---|---|
| 3.1 | `src/content/scroller.ts` — Scroll-to-bottom mechanizmus | ⬜ Tervezett |
| 3.2 | Scroll-to-top (reverse scroll a teljes előzmények betöltéséhez) | ⬜ Tervezett |
| 3.3 | Debounce (300ms) és throttle | ⬜ Tervezett |
| 3.4 | Végtelen scroll detektálás (nincs több tartalom) | ⬜ Tervezett |
| 3.5 | MutationObserver integráció az új tartalom detektálására | ⬜ Tervezett |

### 🧭 Fázis 4: Sidebar Scanner (Batch mód)

| Lépés | Feladat | Státusz |
|---|---|---|
| 4.1 | `src/content/sidebar.ts` — Oldalsáv konténer megtalálása (`nav`, `[role='navigation']`) | ⬜ Tervezett |
| 4.2 | Chat linkek kigyűjtése (`a[href*='/app/']`) | ⬜ Tervezett |
| 4.3 | Rendszer linkek kizárása (Settings, New chat) | ⬜ Tervezett |
| 4.4 | Chat címek kinyerése a linkekből | ⬜ Tervezett |
| 4.5 | Navigációs logika: URL váltás és DOM renderelés várakozás | ⬜ Tervezett |

### 📝 Fázis 5: Markdown Konverter

| Lépés | Feladat | Státusz |
|---|---|---|
| 5.1 | `src/content/markdown-converter.ts` — Turndown.js inicializálása | ⬜ Tervezett |
| 5.2 | Egyedi szabályok: LaTeX/matek (`[data-math]` → `$$...$$`) | ⬜ Tervezett |
| 5.3 | Egyedi szabályok: kódblokkok (`pre` → ` ```lang ``` `) nyelvi detektálással | ⬜ Tervezett |
| 5.4 | Egyedi szabályok: idézetek (`[data-cite]` → `[^n]`) | ⬜ Tervezett |
| 5.5 | Egyedi szabályok: táblázatok megőrzése | ⬜ Tervezett |
| 5.6 | Cleanup: felesleges whitespace, speciális karakterek kezelése | ⬜ Tervezett |

### 📤 Fázis 6: Export formátumok

| Lépés | Feladat | Státusz |
|---|---|---|
| 6.1 | `src/content/exporters/markdown.ts` — Markdown fájl generálás | ⬜ Tervezett |
| 6.2 | `src/content/exporters/json.ts` — Strukturált JSON export | ⬜ Tervezett |
| 6.3 | `src/content/exporters/html.ts` — Stílusozott, standalone HTML export | ⬜ Tervezett |
| 6.4 | Fájlnév generálás (dátum, chat cím alapján) | ⬜ Tervezett |
| 6.5 | Blob létrehozás és download triggerelés | ⬜ Tervezett |

### 🎨 Fázis 7: UI Overlay

| Lépés | Feladat | Státusz |
|---|---|---|
| 7.1 | `src/content/ui-overlay.ts` — Progress bar (lebegő, jobb alsó sarok) | ⬜ Tervezett |
| 7.2 | Állapot szöveg ("Scrolling...", "Extracting...", "Converting...") | ⬜ Tervezett |
| 7.3 | Cancel gomb (`AbortController` integráció) | ⬜ Tervezett |
| 7.4 | Animációk és vizuális visszajelzés | ⬜ Tervezett |

### 🎛️ Fázis 8: Content Script Orchestrator

| Lépés | Feladat | Státusz |
|---|---|---|
| 8.1 | `src/content/index.ts` — Üzenet fogadása a popup-tól (`chrome.runtime.onMessage`) | ⬜ Tervezett |
| 8.2 | Export típusok kezelése (`current` vs `all`) | ⬜ Tervezett |
| 8.3 | Formátum routing (Markdown, JSON, HTML) | ⬜ Tervezett |
| 8.4 | Hiba kezelés és felhasználói visszajelzés | ⬜ Tervezett |
| 8.5 | Cleanup export után | ⬜ Tervezett |

### 🪟 Fázis 9: Popup UI

| Lépés | Feladat | Státusz |
|---|---|---|
| 9.1 | `src/popup/popup.html` — Minimalista, letisztult UI | ⬜ Tervezett |
| 9.2 | `src/popup/popup.ts` — UI logika: gombok, formátum választó | ⬜ Tervezett |
| 9.3 | `src/popup/popup.css` — Stílusok (modern, Gemini-szerű design) | ⬜ Tervezett |
| 9.4 | `chrome.tabs.query` + `sendMessage` a content script felé | ⬜ Tervezett |
| 9.5 | Progress visszajelzés a popup-ban | ⬜ Tervezett |

### ⚙️ Fázis 10: Service Worker

| Lépés | Feladat | Státusz |
|---|---|---|
| 10.1 | `src/background/service-worker.ts` — Telepítés és aktiválás | ⬜ Tervezett |
| 10.2 | Üzenet routing (popup ↔ content script) | ⬜ Tervezett |
| 10.3 | Hosszú életű kapcsolatok kezelése (port messaging) | ⬜ Tervezett |

### 🎀 Fázis 11: Finálé

| Lépés | Feladat | Státusz |
|---|---|---|
| 11.1 | Ikonok hozzáadása (`src/assets/`) | ⬜ Tervezett |
| 11.2 | `manifest.json` véglegesítése (ikonok, leírás, verzió) | ⬜ Tervezett |
| 11.3 | Build tesztelés (`npm run build`) | ⬜ Tervezett |
| 11.4 | Betöltés Chrome-ba fejlesztői módban | ⬜ Tervezett |
| 11.5 | Manuális tesztelés a gemini.google.com oldalon | ⬜ Tervezett |

---

## Függőségek

### NPM Packages

```json
{
  "dependencies": {
    "turndown": "^7.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "webpack": "^5.x",
    "webpack-cli": "^5.x",
    "ts-loader": "^9.x",
    "@types/chrome": "^0.x",
    "@types/turndown": "^5.x",
    "copy-webpack-plugin": "^12.x",
    "css-loader": "^7.x",
    "style-loader": "^4.x"
  }
}
```

### Külső library-k

| Library | Verzió | Szerep |
|---|---|---|
| **Turndown.js** | 7.x | HTML → Markdown konvertálás egyedi szabályokkal |
| **Chrome Types** | @types/chrome | TypeScript típusok a Chrome Extension API-hoz |

---

## Webpack Konfiguráció

```javascript
// webpack.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content/index.ts',
    popup: './src/popup/popup.ts',
    'service-worker': './src/background/service-worker.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/popup/popup.html', to: '.' },
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ]
};
```

---

## Manifest V3 Struktúra

```json
{
  "manifest_version": 3,
  "name": "Gemini Chat Exporter",
  "version": "1.0.0",
  "description": "Export all your Google Gemini conversations to Markdown, JSON, or HTML",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["https://gemini.google.com/*"],
  "background": {
    "service_worker": "service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["https://gemini.google.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "assets/icon16.png",
      "48": "assets/icon48.png",
      "128": "assets/icon128.png"
    }
  },
  "icons": {
    "16": "assets/icon16.png",
    "48": "assets/icon48.png",
    "128": "assets/icon128.png"
  }
}
```

---

## Tesztelési Stratégia

### Unit tesztek (későbbi fázis)

- `dom-scanner.test.ts` — DOM bejárás tesztelése mock HTML-el
- `markdown-converter.test.ts` — Turndown szabályok tesztelése
- `selectors.test.ts` — Szelektorok helyességének tesztelése
- `exporters/*.test.ts` — Export formátumok validálása

### Manuális tesztelés

- **Single chat export** — Aktív beszélgetés exportálása mindhárom formátumban
- **Batch export** — Több beszélgetés egyidejű exportálása
- **Üres beszélgetés** — Új, üres beszélgetés kezelése
- **Hosszú beszélgetés** — 100+ üzenetes beszélgetés teljesítménye
- **Kódblokkok** — Többnyelvű kódblokkok (Python, JS, Bash, stb.)
- **LaTeX/matek** — Matematikai formulák megőrzése
- **Táblázatok** — Táblázatok megőrzése
- **Cancel** — Export megszakítása folyamat közben
- **Hálózati hiba** — Kapcsolat megszakadásának kezelése
