# 🔬 Kutatási Eredmények

> A Gemini Chat Exporter projectet megelőző átfogó kutatás

## Tartalom

1. [Probléma definíció](#probléma-definíció)
2. [Meglévő megoldások](#meglévő-megoldások)
3. [Google Takeout formátum](#google-takeout-formátum)
4. [Gemini API lehetőségek](#gemini-api-lehetőségek)
5. [DOM szelektorok](#dom-szelektorok)
6. [Technikai döntések](#technikai-döntések)

---

## Probléma definíció

A **gemini.google.com** webes felületen **nincs beépített funkció** az összes csevegés exportálására. A felhasználóknak nincs módjuk:

- Az összes beszélgetésük egyidejű mentésére
- A beszélgetések olvasható formátumban történő archiválására
- A chat előzmények más platformra migrálására
- Biztonsági mentés készítésére a beszélgetésekről

Az egyetlen "hivatalos" megoldás a **Google Takeout**, amely lassú és nem olvasható formátumot biztosít.

---

## Meglévő megoldások

### 1. Browser Extensions (DOM scraping)

A legelterjedtebb megközelítés. Chrome Manifest V3 bővítmények, amelyek DOM scraping segítségével nyerik ki a beszélgetéseket.

| Bővítmény | Technológiák | Jellemzők |
|---|---|---|
| **nkzhenhua/gemini-chat-exporter** | Vanilla JS, Manifest V3 | Markdown export, batch törlés, progress overlay |
| **amazingpaddy/ai-chat-exporter** | Turndown.js, HTML→Markdown | Több platform (Gemini+ChatGPT), üzenet checkboxok, LaTeX megőrzés |
| **nrnelson/gemini-chat-exporter** | Vanilla JS | Firefox támogatás |
| **Louisjo/gemini-chat-exporter** | Vanilla JS | JSON export |
| **suredream/chat-exporter-ext** | Vanilla JS | Szemantikus szelektorok (`aria-label`, `role`) |

#### Közös jellemzők:
- **DOM scraping** a `gemini.google.com` oldalon
- **Manifest V3** architektúra
- **Content script** injektálás
- **Auto-scroll** a lustán betöltött üzenetekért
- **Lokális feldolgozás** (privacy-first)
- **Turndown.js** a jobb minőségű Markdown konverzióhoz

#### Korlátozások:
- **DOM változásokra érzékeny** — ha a Google frissíti a UI-t, a szelektorok elromolhatnak
- **Komplex dinamikus tartalom** (beágyazott képek, canvas, interaktív widgetek) problémás
- **Manifest V3 korlátok** — service worker life cycle, nincs persistent background

### 2. Google Takeout

**Hivatalos**, Google által biztosított adatexport szolgáltatás.

| Jellemző | Érték |
|---|---|
| **Elérés** | [takeout.google.com](https://takeout.google.com) |
| **Mit exportál** | "Gemini Apps" a "My Activity" részeként |
| **Formátum** | JSON (`MyActivity.json`) vagy HTML |
| **Sebesség** | Órák/napok (archívum méretétől függően) |
| **Olvashatóság** | ❌ Nyers, nem beszélgetésenként szervezett |

#### Takeout JSON formátum

```json
[
  {
    "header": "Gemini",
    "title": "You asked...",
    "titleUrl": "https://gemini.google.com/",
    "time": "2026-05-19T10:00:00.000Z",
    "products": ["Gemini"],
    "activityControls": ["Web & App Activity"],
    "details": [
      {
        "name": "User Query",
        "value": "What is the capital of France?"
      }
    ],
    "content": "What is the capital of France?"
  },
  {
    "header": "Gemini",
    "title": "Gemini responded...",
    "titleUrl": "https://gemini.google.com/",
    "time": "2026-05-19T10:00:05.000Z",
    "products": ["Gemini"],
    "activityControls": ["Web & App Activity"],
    "details": [
      {
        "name": "Model Response",
        "value": "The capital of France is Paris."
      }
    ],
    "content": "The capital of France is Paris."
  }
]
```

#### Takeout korlátai:
- **Nincs beszélgetés csoportosítás** — minden üzenet külön objektum
- **Nincs kontextus** — nem lehet tudni, melyik üzenet melyik beszélgetéshez tartozik
- **Hiányos formázás** — kódblokkok, táblázatok, LaTeX elveszhet
- **Workspace korlátozás** — Workspace fiókoknál csak Google Vault

### 3. Gemini API

A `generativelanguage.googleapis.com` **NEM biztosít**:
- ❌ Előzmények lekérdezése (`list_conversations`)
- ❌ Korábbi chat-ek elérése
- ❌ Session history management

Az API **kizárólag stateless** számítási szolgáltatás. A fejlesztőnek kell saját adatbázist építenie az előzmények tárolásához.

#### Interactions API:
- `interactions.create` — `previous_interaction_id` paraméterrel folytathat beszélgetéseket
- Adatmegőrzés: **55 nap** (Paid) / **1 nap** (Free)
- Nincs `list` vagy `retrieve` endpoint

### 4. Google AI Studio

Az [aistudio.google.com](https://aistudio.google.com) egy fejlesztői felület:
- ✅ Strukturáltabb felület
- ✅ JSON kimenet támogatás
- ❌ Csak az AI Studio-ban létrehozott beszélgetésekre működik
- ❌ A gemini.google.com chat-ek NEM érhetők el itt

### 5. Bookmarklet / Userscript

- **Előny**: Könnyű telepítés
- **Hátrány**: Korlátozott funkcionalitás, ugyanazok a DOM problémák

---

## DOM Szelektorok

### A Gemini UI DOM szerkezete

A Gemini egy **Single Page Application (SPA)**, amely:
- **Obfuszkált CSS osztályokat** használ (build időben generált, gyakran változó)
- **Dinamikus tartalom** betöltés (scroll-ra triggerelt lazy loading)
- **Szemantikus attribútumok**: `aria-label`, `role`, `data-*`

### Stratégia: Szemantikus anchor pontok

Osztálynevek helyett **stabil, szemantikus attribútumokra** támaszkodunk:

```
Beszélgetés konténer → div[aria-label='Conversation']
Üzenet elem         → [role='listitem']
Felhasználó (user)  → img[alt*='You'] vagy "You:" szöveg
Modell (model)      → minden más listitem
Oldalsáv            → nav, [role='navigation']
Chat linkek         → a[href*='/app/']
Rendszer linkek     → a[href*='settings'], a[href*='new']
Kódblokk            → pre, code
Matek/LaTeX         → [data-math]
Táblázat            → table
```

### Miért működik ez?

1. **ARIA attribútumok** — akadálymentesítési célból stabilak, ritkán változnak
2. **Szemantikus HTML** — `nav`, `role` alapvető szerkezeti elemek
3. **Fallback mechanizmusok** — több szelektor kombinációja

### Kockázatok és mitigáció

| Kockázat | Mitigáció |
|---|---|
| Google megváltoztatja az `aria-label` értékét | Fallback: `role` alapú keresés + verzió detektálás |
| Új UI verzió (teljes redesign) | Szelektorok külön fájlban (`selectors.ts`), könnyen frissíthető |
| Új üzenettípusok | `ChatMessage` interface bővíthető, ismeretlen típust fallback-ként kezeljük |

---

## Technikai Döntések

### Miért TypeScript?

| Szempont | Indoklás |
|---|---|
| **Típusbiztonság** | A DOM scraping komplex adatstruktúrákkal dolgozik, a típusok segítenek elkerülni a hibákat |
| **Karbantarthatóság** | A szelektorok és adatstruktúrák gyakran változnak, a típusok dokumentálják a várható formátumot |
| **Webpack integráció** | A TypeScript + Webpack pipeline jól integrálható a Chrome Extension build folyamatba |

### Miért Manifest V3?

| Szempont | Indoklás |
|---|---|
| **Kötelező** | A Chrome Web Store már csak V3 bővítményeket fogad el |
| **Biztonság** | Service worker alapú (nem persistent background), jobban izolált |
| **Jövőbiztos** | A Manifest V2 kivezetés alatt |

### Miért Turndown.js?

| Alternatíva | Miért NEM | Turndown.js miért IGEN |
|---|---|---|
| **Showdown** | Kevesebb testreszabási lehetőség | ✅ Egyedi szabályok, pluggable |
| **marked** | Csak Markdown → HTML, nem HTML → Markdown | ✅ HTML → Markdown |
| **Saját parser** | Túl sok munka, edge case-ek | ✅ Bevált, tesztelt |
| **Clipboard API** | Nem megbízható, formázásvesztés | ✅ DOM-ból közvetlenül |
