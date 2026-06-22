# 🎯 DOM Szelektor Stratégia

> A Gemini Chat Exporter által használt DOM szelektorok és fallback mechanizmusok

## Alapelv

A Google Gemini webes felülete **obfuszkált, build-időben generált CSS osztályneveket** használ (pl. `.aB3cD_eF4g`), amelyek minden deploy után megváltozhatnak. A bővítmény kizárólag **szemantikus, stabil attribútumokra** és **strukturális kapcsolatokra** támaszkodik.

## Szelektorok

### 1. Beszélgetés Konténer

A fő chat terület konténere.

```typescript
// Primary
const CONVERSATION = "div[aria-label='Conversation']";

// Fallback (ha az aria-label megváltozik)
const CONVERSATION_FALLBACK = "[role='main']";
const CONVERSATION_FALLBACK2 = "main";
```

**Indoklás**: Az `aria-label='Conversation'` az akadálymentesítés miatt stabil. A `role='main'` és a `<main>` elem tartalék.

---

### 2. Üzenet Elemek

Egyedi üzenetek (user prompt + model válasz).

```typescript
// Primary
const MESSAGE_ITEM = "[role='listitem']";

// Fallback (ha a struktúra változik)
const MESSAGE_ITEM_FALLBACK = "div[aria-label='Conversation'] > div > div";
```

**Indoklás**: A Gemini minden üzenetpárt `[role='listitem']` attribútummal jelöl, ami ARIA miatt stabil.

**Fontos**: A `<fadein-wrapper>` és hasonló wrapper elemeket kiszűrjük — a tényleges tartalom a `listitem` gyermekeiben van.

---

### 3. Felhasználó vs Modell Azonosítás

```typescript
// User azonosítás - Avatar kép alt szövege
const IS_USER_BY_AVATAR = "img[alt*='You']";

// User azonosítás - Szöveg prefix
const IS_USER_BY_TEXT_PREFIX = "You:";

// Ellenőrző függvény
function isUserMessage(element: Element): boolean {
  // 1. Avatar kép ellenőrzése
  const avatar = element.querySelector("img[alt*='You']");
  if (avatar) return true;
  
  // 2. Szöveg prefix ellenőrzése
  const text = element.textContent?.trim() || "";
  if (text.startsWith("You:")) return true;
  
  // 3. Minden más model üzenet
  return false;
}
```

**Indoklás**: A user avatar kép `alt` attribútuma a legmegbízhatóbb. Fallback-ként a "You:" szöveg prefix.

---

### 4. Oldalsáv (Chat Lista)

A bal oldali navigációs panel a beszélgetések listájával.

```typescript
// Primary
const SIDEBAR = "nav";
const SIDEBAR_FALLBACK = "[role='navigation']";

// Chat linkek az oldalsávban
const CHAT_LINKS = "a[href*='/app/']";

// Rendszer linkek (kizárandó)
const SYSTEM_LINKS = [
  "a[href*='settings']",
  "a[href*='/new']",
  "a[href*='/upgrade']",
];

// Chat cím a linkből
function extractChatTitle(linkElement: Element): string {
  return linkElement.textContent?.trim() || "Untitled Chat";
}
```

**Indoklás**: A `<nav>` és `[role='navigation']` szemantikus elemek. A chat linkek `/app/` URL-t tartalmaznak, a rendszer linkek kiszűrhetők.

---

### 5. Tartalmi Elemek

#### Kódblokkok

```typescript
// Primary
const CODE_BLOCK = "pre";
const CODE_INLINE = "code:not(pre code)";

// Nyelv detektálás
function detectLanguage(preElement: Element): string {
  const code = preElement.querySelector("code");
  if (!code) return "";
  
  // Class alapú detektálás (pl. "language-python")
  const classMatch = code.className.match(/language-(\w+)/);
  if (classMatch) return classMatch[1];
  
  // Data attribútum
  const dataLang = code.getAttribute("data-language");
  if (dataLang) return dataLang;
  
  return "";
}
```

#### LaTeX / Matematikai Formulák

```typescript
// Primary
const MATH_BLOCK = "[data-math]";
const MATH_INLINE = "[data-math-inline]";

// Kinyerés
function extractMath(element: Element): { type: "block" | "inline"; content: string } {
  const isBlock = element.hasAttribute("data-math");
  const content = element.getAttribute("data-math") || 
                  element.getAttribute("data-math-inline") || 
                  element.textContent || "";
  
  return {
    type: isBlock ? "block" : "inline",
    content: content.trim()
  };
}
```

#### Táblázatok

```typescript
// Primary
const TABLE = "table";

// Táblázat kinyerése (Turndown natívan kezeli)
function hasTable(element: Element): boolean {
  return element.querySelector("table") !== null;
}
```

#### Idézetek / Források

```typescript
// Primary
const CITATION = "[data-cite]";
const CITATION_START = "[cite_start]";
const CITATION_END = "[cite_end]";

// Idézet tisztítása
function cleanCitations(html: string): string {
  return html
    .replace(/\[cite_start\]/g, "[^")
    .replace(/\[cite_end\]/g, "]");
}
```

#### Képek és Csatolmányok

```typescript
// Képek
const IMAGE = "img[src^='https://']";
const USER_UPLOADED_IMAGE = "img[alt*='uploaded']";

// Fájl csatolmányok
const FILE_ATTACHMENT = "[data-attachment]";

function extractAttachments(element: Element): Attachment[] {
  const attachments: Attachment[] = [];
  
  // Képek
  element.querySelectorAll(IMAGE).forEach(img => {
    const src = img.getAttribute("src");
    if (src && !img.getAttribute("alt")?.includes("You")) {
      attachments.push({ type: "image", url: src });
    }
  });
  
  // Fájlok
  element.querySelectorAll(FILE_ATTACHMENT).forEach(file => {
    attachments.push({
      type: "file",
      name: file.getAttribute("data-filename") || undefined,
      mimeType: file.getAttribute("data-mimetype") || undefined,
    });
  });
  
  return attachments;
}
```

---

## Fallback Stratégia

A szelektorok háromszintű fallback mechanizmussal rendelkeznek:

```
Szint 1: Primary szelektor (szemantikus)
    ↓ ha nem található
Szint 2: Fallback szelektor (alternatív szemantikus)
    ↓ ha nem található
Szint 3: Strukturális szelektor (DOM struktúra alapú)
    ↓ ha nem található
HIBA: Értesítés a felhasználónak
```

```typescript
// Példa: szelektor feloldás fallback-kel
function resolveSelector(selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.debug(`[Gemini Exporter] Resolved selector: "${selector}"`);
      return element;
    }
  }
  console.warn("[Gemini Exporter] No selector resolved:", selectors);
  return null;
}

// Használat
const conversationContainer = resolveSelector([
  "div[aria-label='Conversation']",    // Szint 1
  "[role='main']",                      // Szint 2
  "main",                               // Szint 3
]);
```

---

## Verzió Detektálás

A Google UI verziójának detektálása segít a megfelelő szelektorok kiválasztásában:

```typescript
interface GeminiUIVersion {
  version: string;
  detectedAt: string;
  selectors: Record<string, string>;
}

function detectUIVersion(): GeminiUIVersion {
  // Verzió detektálás DOM alapján
  const hasAriaConversation = !!document.querySelector(
    "div[aria-label='Conversation']"
  );
  const hasRoleMain = !!document.querySelector("[role='main']");
  
  // Verzió specifikus szelektorok
  if (hasAriaConversation) {
    return {
      version: "current",
      detectedAt: new Date().toISOString(),
      selectors: {
        conversation: "div[aria-label='Conversation']",
        message: "[role='listitem']",
        sidebar: "nav",
      }
    };
  }
  
  // Fallback régebbi verzióra
  return {
    version: "legacy",
    detectedAt: new Date().toISOString(),
    selectors: {
      conversation: "[role='main']",
      message: "main > div > div",
      sidebar: "[role='navigation']",
    }
  };
}
```

---

## MutationObserver

A dinamikus tartalom (lazy loading, streaming válaszok) figyelése:

```typescript
function observeConversation(
  container: Element,
  onNewMessage: (message: Element) => void
): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element && node.matches("[role='listitem']")) {
          onNewMessage(node);
        }
      }
    }
  });
  
  observer.observe(container, {
    childList: true,
    subtree: true,
  });
  
  return observer;
}
```

---

## Szelektor Tesztelés

A szelektorok tesztelése a böngésző konzoljában:

```javascript
// 1. Beszélgetés konténer tesztelése
document.querySelector("div[aria-label='Conversation']");

// 2. Üzenetek száma
document.querySelectorAll("[role='listitem']").length;

// 3. Oldalsáv chat linkek
document.querySelectorAll("nav a[href*='/app/']").length;

// 4. Felhasználói avatar
document.querySelectorAll("img[alt*='You']").length;
```

---

## Gyakori Problémák

| Probléma | Ok | Megoldás |
|---|---|---|
| Nincs találat az `aria-label`-re | Google UI frissítés | Fallback szelektorok aktiválódnak |
| Az oldalsáv üres | Nem töltődött be | Várakozás + MutationObserver |
| A `[role='listitem']` nem tartalmazza az összes üzenetet | Lazy loading | Scroller aktiválása |
| Hamis pozitív user detektálás | "You" szó a tartalomban | Avatar kép ellenőrzése először |
