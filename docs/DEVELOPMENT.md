# 🛠️ Fejlesztői Útmutató

> Fejlesztői környezet beállítása, build folyamat, tesztelés

## Előfeltételek

- **Node.js** 18+ (LTS)
- **npm** 9+
- **Google Chrome** vagy **Firefox** (legfrissebb verzió)
- **Git**

## Fejlesztői Környezet Beállítása

### 1. Projekt klónozása

```bash
git clone <repo-url>
cd gemini-exporter
```

### 2. Függőségek telepítése

```bash
npm install
```

### 3. Build

```bash
# Fejlesztői build (watch mód)
npm run dev

# Produkciós build
npm run build
```

A build kimenet a `dist/` mappába kerül.

### 4. Betöltés Chrome-ba

1. Nyisd meg a **chrome://extensions** oldalt
2. Kapcsold be a **Developer mode**-ot (jobb felső sarok)
3. Kattints a **Load unpacked** gombra
4. Válaszd ki a `dist/` mappát
5. A bővítmény megjelenik a toolbar-on

### 5. Betöltés Firefox-ba (ideiglenes)

1. Nyisd meg az **about:debugging#/runtime/this-firefox** oldalt
2. Kattints a **Load Temporary Add-on** gombra
3. Válaszd ki a `dist/manifest.json` fájlt

## Projekt Struktúra

```
gemini-exporter/
├── src/
│   ├── background/
│   │   └── service-worker.ts    # Service worker (Manifest V3)
│   ├── content/                 # Content script (gemini.google.com)
│   │   ├── index.ts             # Orchestrator
│   │   ├── dom-scanner.ts       # DOM bejárás
│   │   ├── selectors.ts         # Szelektorok
│   │   ├── scroller.ts          # Auto-scroll
│   │   ├── sidebar.ts           # Oldalsáv kezelés
│   │   ├── markdown-converter.ts # Turndown.js integráció
│   │   ├── ui-overlay.ts        # Progress UI
│   │   ├── utils.ts             # Segédfüggvények
│   │   └── exporters/
│   │       ├── markdown.ts
│   │       ├── json.ts
│   │       └── html.ts
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── shared/
│   │   └── types.ts
│   └── assets/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/                       # Dokumentáció
├── manifest.json
├── tsconfig.json
├── webpack.config.js
├── package.json
└── README.md
```

## Fejlesztési Folyamat

### Watch mód

```bash
npm run dev
```

Ez elindítja a webpack-et watch módban. Minden fájl mentése után automatikusan újrafordul.

**Fontos**: Watch mód után a `dist/` mappa frissül, de a bővítményt újra kell tölteni Chrome-ban:

1. chrome://extensions → Keresd meg a bővítményt
2. Kattints a **Reload** (🔄) ikonra

### Debugging

#### Content Script Debug

1. Nyisd meg a **gemini.google.com** oldalt
2. Nyisd meg a **DevTools**-t (F12)
3. A **Sources** tab-on keresd a `content.js` fájlt
4. Helyezz el breakpoint-okat

#### Popup Debug

1. Jobb klikk a bővítmény ikonjára → **Inspect Popup**
2. A DevTools a popup ablakhoz kapcsolódik

#### Service Worker Debug

1. chrome://extensions → Keresd meg a bővítményt
2. Kattints a **Service Worker** linkre (ha aktív)
3. A DevTools a service worker-hez kapcsolódik

### Logolás

```typescript
// A bővítmény prefixelt logokat használ
const LOG_PREFIX = "[Gemini Exporter]";

console.debug(`${LOG_PREFIX} Message received:`, message);
console.warn(`${LOG_PREFIX} Selector not found:`, selector);
console.error(`${LOG_PREFIX} Export failed:`, error);
```

A logok megjelennek az adott kontextus DevTools konzoljában (content script, popup, service worker).

## Tesztelés

### Manuális Teszt Checklist

- [ ] **Single chat export** — Aktív beszélgetés exportálása
  - [ ] Markdown formátum
  - [ ] JSON formátum
  - [ ] HTML formátum
- [ ] **Batch export** — Összes beszélgetés exportálása
- [ ] **Üres beszélgetés** — Új chat exportálási kísérlete
- [ ] **Hosszú beszélgetés** — 100+ üzenetes chat
- [ ] **Kódblokkok** — Többnyelvű kódblokkok megőrzése
- [ ] **LaTeX/matek** — Matematikai formulák
- [ ] **Táblázatok** — Táblázatok formázása
- [ ] **Idézetek** — Forrás hivatkozások
- [ ] **Képek** — Feltöltött és generált képek
- [ ] **Cancel** — Export megszakítása
- [ ] **Nincs chat** — A gemini.google.com főoldala
- [ ] **Jogosultságok** — Nincs felesleges permission

### Teszt Script-ek (későbbi fázis)

```bash
# TypeScript típusellenőrzés
npm run typecheck

# Lint
npm run lint

# Unit tesztek
npm test

# E2E tesztek (Playwright)
npm run test:e2e
```

## Release Folyamat

### 1. Verziószám növelése

```json
// manifest.json
{
  "version": "1.0.0" → "1.0.1"
}
```

### 2. Changelog frissítése

```markdown
## [1.0.1] - 2026-XX-XX
### Fixed
- DOM selector update for new Gemini UI version
### Added
- Support for new message types
```

### 3. Build

```bash
npm run build
```

### 4. Tesztelés

- Manuális teszt checklist végrehajtása
- Tiszta Chrome profilban tesztelés

### 5. Csomagolás

```bash
# ZIP a dist/ mappából
npm run package
```

### 6. Publikálás

- **Chrome Web Store**: [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- **Firefox Add-ons**: [Firefox Developer Hub](https://addons.mozilla.org/developers/)

## Hasznos Linkek

### Dokumentáció

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension API Reference](https://developer.chrome.com/docs/extensions/reference/)
- [Turndown.js Dokumentáció](https://github.com/mixmark-io/turndown)
- [TypeScript Dokumentáció](https://www.typescriptlang.org/docs/)
- [Webpack Dokumentáció](https://webpack.js.org/concepts/)

### Kapcsolódó Projektek

- [nkzhenhua/gemini-chat-exporter](https://github.com/nkzhenhua/gemini-chat-exporter)
- [amazingpaddy/ai-chat-exporter](https://github.com/amazingpaddy/ai-chat-exporter)
- [nrnelson/gemini-chat-exporter](https://github.com/nrnelson/gemini-chat-exporter)

## Gyakori Hibák

### "Could not load background script"

**Ok**: A service worker fájl nem található vagy hibás.

**Megoldás**:
1. Ellenőrizd, hogy a `dist/service-worker.js` létezik-e
2. Ellenőrizd a `manifest.json` `background.service_worker` mezőjét
3. Futtasd újra: `npm run build`

### "content.js not injected"

**Ok**: Az oldal nem illeszkedik a `content_scripts.matches` mintára.

**Megoldás**:
1. Ellenőrizd, hogy a `gemini.google.com/*` szerepel-e a `manifest.json`-ban
2. Frissítsd az oldalt
3. Töltsd újra a bővítményt

### "Cannot read property of undefined" a content script-ben

**Ok**: A DOM még nem töltődött be, vagy megváltozott a struktúra.

**Megoldás**:
1. Ellenőrizd a `run_at: "document_idle"` beállítást a manifest-ben
2. Adj hozzá fallback várakozást (`setTimeout` vagy `MutationObserver`)
3. Ellenőrizd a szelektorokat a DevTools konzolban
