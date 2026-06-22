# Gemini Chat Exporter

> 🚀 Böngésző bővítmény a Google Gemini beszélgetések exportálásához

A **Gemini Chat Exporter** egy nyílt forráskódú Chrome/Firefox böngésző bővítmény, amely lehetővé teszi az összes Gemini beszélgetésed exportálását Markdown, JSON és HTML formátumban — egy kattintással vagy batch módban.

## ✨ Funkciók

- ✅ **Egy kattintásos export** — Az aktuális beszélgetés azonnali exportálása
- ✅ **Batch export** — Összes beszélgetés egyidejű exportálása
- ✅ **Három formátum** — Markdown (olvasható), JSON (feldolgozható), HTML (böngészhető)
- ✅ **Teljes hűség** — Kódblokkok, LaTeX/matek, táblázatok és idézetek megőrzése
- ✅ **Privacy-first** — Minden feldolgozás lokálisan, a böngészőben történik
- ✅ **Szemantikus szelektorok** — Ellenáll a Google UI változásainak
- ✅ **Progress overlay** — Valós idejű visszajelzés a folyamatról

## 🎯 Miért van rá szükség?

Jelenleg a [gemini.google.com](https://gemini.google.com) oldalon **nincs beépített funkció** az összes csevegés exportálására. A Google Takeout ugyan biztosít nyers adatokat, de az nem olvasható formátumú és nem beszélgetésenként szervezett. Ez a bővítmény ezt a hiányosságot pótolja.

## 📁 Projekt struktúra

```
gemini-exporter/
├── src/
│   ├── background/          # Service Worker (Manifest V3)
│   │   └── service-worker.ts
│   ├── content/             # Content Script (injektálva a gemini.google.com-ra)
│   │   ├── index.ts         # Belépési pont / orchestrator
│   │   ├── dom-scanner.ts   # DOM bejárás és üzenet kinyerés
│   │   ├── selectors.ts     # Szemantikus DOM szelektorok
│   │   ├── scroller.ts      # Auto-scroll a lustán betöltött üzenetekért
│   │   ├── sidebar.ts       # Oldalsáv chat lista kezelése (batch mód)
│   │   ├── markdown-converter.ts  # Turndown.js integráció + egyedi szabályok
│   │   ├── exporters/       # Export formátumok
│   │   │   ├── markdown.ts
│   │   │   ├── json.ts
│   │   │   └── html.ts
│   │   ├── ui-overlay.ts    # Lebegő progress bar / cancel gomb
│   │   └── utils.ts
│   ├── popup/               # Felugró ablak UI
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── shared/              # Megosztott típusok és konstansok
│   │   └── types.ts
│   └── assets/              # Ikonok
├── docs/                    # Részletes dokumentáció
│   ├── ARCHITECTURE.md      # Architektúra áttekintés
│   ├── RESEARCH.md          # Kutatási eredmények
│   ├── PLAN.md              # Implementációs terv
│   ├── SELECTORS.md         # DOM szelektor stratégia
│   └── DEVELOPMENT.md       # Fejlesztői útmutató
├── manifest.json            # Chrome Extension Manifest V3
├── tsconfig.json
├── package.json
└── webpack.config.js
```

## 🛠️ Tech Stack

| Technológia | Szerep |
|---|---|
| **TypeScript** | Típusbiztos fejlesztés |
| **Chrome Extension Manifest V3** | Böngésző bővítmény keretrendszer |
| **Turndown.js** | HTML → Markdown konvertálás |
| **Webpack** | TypeScript bundling |

## 📦 Telepítés (fejlesztői mód)

```bash
# 1. Klónozás
git clone <repo-url>
cd gemini-exporter

# 2. Függőségek telepítése
npm install

# 3. Build
npm run build

# 4. Betöltés Chrome-ba
# - Nyisd meg a chrome://extensions oldalt
# - Kapcsold be a "Developer mode"-ot
# - Kattints a "Load unpacked" gombra
# - Válaszd ki a dist/ mappát
```

## 🚀 Használat

### Egyéni chat exportálása
1. Nyisd meg a kívánt beszélgetést a [gemini.google.com](https://gemini.google.com) oldalon
2. Kattints a bővítmény ikonjára a toolbar-on
3. Válaszd ki a formátumot (Markdown / JSON / HTML)
4. Kattints az "Export Current Chat" gombra

### Összes chat exportálása (Batch)
1. A bővítmény felugró ablakában válaszd a "Batch" fület
2. Válaszd ki a formátumot
3. Kattints az "Export All Chats" gombra
4. Kövesd a progressbart — a bővítmény végigiterál az összes beszélgetésen

## 📚 Dokumentáció

Részletes dokumentáció a [`docs/`](docs/) mappában található:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Rendszerarchitektúra, komponensek, adatfolyam
- [RESEARCH.md](docs/RESEARCH.md) — Kutatási eredmények, meglévő megoldások elemzése
- [PLAN.md](docs/PLAN.md) — Implementációs ütemterv
- [SELECTORS.md](docs/SELECTORS.md) — DOM szelektor stratégia
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) — Fejlesztői környezet beállítása

## 🔒 Adatvédelem

- **Minden feldolgozás lokális** — A beszélgetéseid soha nem hagyják el a böngésződet
- **Nincs telemetria** — A bővítmény nem gyűjt semmilyen adatot
- **Nincs külső szerver** — Nincs API hívás, nincs adatküldés
- **Nyílt forráskód** — A teljes kód ellenőrizhető

## 📄 Licensz

MIT License — lásd a [LICENSE](LICENSE) fájlt.
