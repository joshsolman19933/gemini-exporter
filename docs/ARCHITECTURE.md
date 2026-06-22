# 🏗️ Architektúra

> Részletes rendszerarchitektúra és komponens leírás

## Áttekintés

A **Gemini Chat Exporter** egy **Chrome Extension Manifest V3** alapú böngésző bővítmény, amely közvetlenül a `gemini.google.com` oldalon futó content script segítségével nyeri ki a beszélgetéseket.

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Popup UI   │  │   Service    │  │    Content    │ │
│  │  (popup.html)│  │   Worker     │  │    Script     │ │
│  │              │  │              │  │ (gemini.google)│ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │         │
│         └────────┬────────┘                   │         │
│           chrome.runtime.sendMessage          │         │
│                                               │         │
└───────────────────────────────────────────────┼─────────┘
                                                │
┌───────────────────────────────────────────────▼─────────┐
│                   gemini.google.com                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Content Script (injektálva)                       │ │
│  │                                                    │ │
│  │  ┌──────────────┐   ┌─────────────────────────┐   │ │
│  │  │  Sidebar     │   │    DOM Scanner          │   │ │
│  │  │  Scanner     │   │  div[aria-label=        │   │ │
│  │  │              │   │    'Conversation']       │   │ │
│  │  │  nav,        │   │  [role='listitem']      │   │ │
│  │  │  [role=       │   │                         │   │ │
│  │  │   navigation] │   └───────────┬─────────────┘   │ │
│  │  └──────┬───────┘               │                  │ │
│  │         │                       │                  │ │
│  │  ┌──────▼───────────────────────▼──────────────┐   │ │
│  │  │          Message Extractor                  │   │ │
│  │  │  • User vs Model azonosítás                 │   │ │
│  │  │  • Kódblokkok, LaTeX, táblázatok           │   │ │
│  │  │  • Idézetek, csatolmányok                   │   │ │
│  │  └──────────────────┬──────────────────────────┘   │ │
│  │                     │                              │ │
│  │  ┌──────────────────▼──────────────────────────┐   │ │
│  │  │          Turndown.js + Custom Rules         │   │ │
│  │  │  • HTML → Markdown                          │   │ │
│  │  │  • data-math → $$...$$                      │   │ │
│  │  │  • pre/code → ```...```                      │   │ │
│  │  └──────────────────┬──────────────────────────┘   │ │
│  │                     │                              │ │
│  │  ┌──────────────────▼──────────────────────────┐   │ │
│  │  │              Exporters                       │   │ │
│  │  │  • Markdown (.md)                           │   │ │
│  │  │  • JSON (.json)                             │   │ │
│  │  │  • HTML (.html)                             │   │ │
│  │  └──────────────────┬──────────────────────────┘   │ │
│  │                     │                              │ │
│  │  ┌──────────────────▼──────────────────────────┐   │ │
│  │  │          Blob → Download                     │   │ │
│  │  └─────────────────────────────────────────────┘   │ │
│  │                                                    │ │
│  │  ┌─────────────────────────────────────────────┐   │ │
│  │  │          Progress Overlay                    │   │ │
│  │  │  • Progress bar                             │   │ │
│  │  │  • Cancel gomb                              │   │ │
│  │  │  • Állapot szöveg                           │   │ │
│  │  └─────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Komponensek

### 1. Content Script (`src/content/`)

A bővítmény szíve. Közvetlenül a `gemini.google.com` DOM-jába injektálódik.

| Fájl | Felelősség |
|---|---|
| `index.ts` | Orchestrator: exportálás indítása, komponensek koordinálása |
| `dom-scanner.ts` | DOM bejárás, üzenet elemek azonosítása és kinyerése |
| `selectors.ts` | Szemantikus CSS szelektorok definíciója |
| `scroller.ts` | Auto-scroll a lustán betöltött üzenetek triggereléséhez |
| `sidebar.ts` | Oldalsáv chat lista kinyerése batch módhoz |
| `markdown-converter.ts` | Turndown.js integráció egyedi szabályokkal |
| `exporters/markdown.ts` | Markdown formátumú export |
| `exporters/json.ts` | JSON formátumú export |
| `exporters/html.ts` | HTML formátumú export |
| `ui-overlay.ts` | Lebegő progress bar és cancel gomb |
| `utils.ts` | Segédfüggvények (escape, sanitize, debounce) |

### 2. Popup UI (`src/popup/`)

A böngésző toolbar-ján megjelenő felugró ablak.

| Fájl | Felelősség |
|---|---|
| `popup.html` | Felhasználói felület markup |
| `popup.ts` | UI logika, gombok, formátum választás |
| `popup.css` | Stílusok |

### 3. Service Worker (`src/background/`)

Manifest V3 háttérszolgáltatás.

| Fájl | Felelősség |
|---|---|
| `service-worker.ts` | Üzenetküldés a popup és content script között, állapotkezelés |

### 4. Shared (`src/shared/`)

Megosztott típusok és konstansok.

| Fájl | Felelősség |
|---|---|
| `types.ts` | TypeScript interfészek és típusok |

## Adatfolyam

### Single Chat Export

```
User clicks "Export Current" in Popup
         │
         ▼
Popup sends message to Content Script
  chrome.tabs.sendMessage({ action: 'exportCurrent', format: 'markdown' })
         │
         ▼
Content Script receives message
         │
         ▼
Scroller: auto-scroll a teljes DOM betöltéséhez
         │
         ▼
DOM Scanner: [role='listitem'] elemek bejárása
         │
    ┌────┴────┐
    │  Message │ (ismétlődik minden listitem-re)
    │  Extract │
    └────┬────┘
         │
         ▼
Turndown.js: HTML → Markdown + egyedi szabályok
         │
         ▼
Exporter: formátum specifikus kimenet generálása
         │
         ▼
Blob létrehozása + download triggerelése
         │
         ▼
Progress Overlay frissítése → KÉSZ
```

### Batch Export

```
User clicks "Export All" in Popup
         │
         ▼
Popup sends message to Content Script
  chrome.tabs.sendMessage({ action: 'batchExport', format: 'json' })
         │
         ▼
Sidebar Scanner: nav, [role='navigation'] elemek bejárása
  Chat linkek kigyűjtése (a[href*='/app/'])
  Rendszer linkek kizárása (settings, new chat)
         │
         ▼
For each chat link:
    │
    ├── Navigate to chat URL (location.href vagy history.pushState)
    ├── Wait for DOM render
    ├── Scroller: auto-scroll
    ├── DOM Scanner: üzenetek kinyerése
    └── Tárolás a conversations[] tömbben
         │
         ▼
Összes conversation feldolgozása
         │
         ▼
Export (egy ZIP fájl vagy több fájl)
         │
         ▼
Progress Overlay frissítése → KÉSZ
```

## DOM Szelektor Stratégia

A Gemini UI **obfuszkált, dinamikusan generált CSS osztályokat** használ, amelyek gyakran változnak. A bővítmény kizárólag **szemantikus, stabil attribútumokra** támaszkodik:

| Cél | Szelektor |
|---|---|
| Beszélgetés konténer | `div[aria-label='Conversation']` |
| Üzenet elem | `[role='listitem']` |
| Felhasználó azonosítás | `img[alt*='You']` vagy `"You:"` szöveg |
| Oldalsáv | `nav, [role='navigation']` |
| Chat linkek | `a[href*='/app/']` |
| Kódblokk | `pre, code` |
| LaTeX/matek | `[data-math]` |
| Táblázat | `table` |

> 📖 Részletes szelektor dokumentáció: [SELECTORS.md](SELECTORS.md)

## Turndown.js Integráció

A **Turndown.js** egy HTML → Markdown konvertáló könyvtár. A bővítmény egyedi szabályokkal egészíti ki:

```typescript
const geminiRules = {
  // LaTeX/matek blokkok megőrzése
  mathBlock: {
    filter: (node) => node.hasAttribute("data-math"),
    replacement: (content, node) => `$$${node.getAttribute("data-math")}$$`
  },
  // Idézetek tisztítása
  citations: {
    filter: (node) => node.matches("[data-cite]"),
    replacement: (content) => `[^${content}]`
  },
  // Kódblokkok nyelvi jelöléssel
  codeBlock: {
    filter: (node) => node.nodeName === "PRE",
    replacement: (content, node) => {
      const lang = node.querySelector("code")?.className
        ?.replace("language-", "") || "";
      return `\`\`\`${lang}\n${content}\n\`\`\``;
    }
  },
  // Táblázatok megőrzése
  table: {
    filter: (node) => node.nodeName === "TABLE",
    replacement: (content) => content  // Turndown natívan kezeli
  }
};
```

## Adatstruktúrák

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "model";
  contentHtml: string;        // Eredeti HTML
  contentMarkdown: string;    // Konvertált Markdown
  timestamp?: string;
  attachments?: Attachment[];
  citations?: Citation[];
}

interface Attachment {
  type: "image" | "file";
  url?: string;
  name?: string;
  mimeType?: string;
}

interface Citation {
  text: string;
  url?: string;
  title?: string;
}

interface ChatConversation {
  id: string;           // Gemini conversation ID (URL-ből)
  title: string;        // Beszélgetés címe
  url: string;          // Teljes URL
  messages: ChatMessage[];
  exportedAt: string;   // ISO timestamp
  exportedBy: string;   // "Gemini Chat Exporter v1.0.0"
  version: string;      // Séma verzió
}

interface ExportOptions {
  format: "markdown" | "json" | "html";
  includeTimestamps: boolean;
  includeCitations: boolean;
  scope: "current" | "all";
}

interface ExportResult {
  conversations: ChatConversation[];
  format: string;
  blob: Blob;
  filename: string;
}
```

## Biztonság és Adatvédelem

| Alapelv | Megvalósítás |
|---|---|
| **Lokális feldolgozás** | Minden DOM scraping és konvertálás a böngészőben történik |
| **Nincs adatküldés** | Nincs fetch/XHR külső URL-ekre |
| **Nincs telemetria** | Nincs analitika, nincs hibajelentés külső szerverre |
| **Minimális jogosultság** | Csak `activeTab` és `scripting` permission |
| **Manifest V3** | Service worker alapú, nem persistent background page |

## Teljesítmény

### Scrolling stratégia

- **Debounce**: A scroll események debounce-olva vannak (300ms)
- **Batch méret**: 50 üzenetenként batch feldolgozás
- **Cancel támogatás**: Bármikor megszakítható a folyamat
- **Progress jelzés**: Valós idejű progress bar és állapot szöveg

### Memória kezelés

- **Streaming export**: Nagy beszélgetések esetén chunk-olt feldolgozás
- **Cleanup**: Export után a DOM módosítások eltávolítása
- **Limit**: 10,000 üzenet felett figyelmeztetés
