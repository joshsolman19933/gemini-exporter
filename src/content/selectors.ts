// Gemini Chat Exporter - Semantic DOM Selectors
// Uses stable, semantic selectors to resist Google UI changes.

export const SELECTORS = {
  // Main conversation container
  CONVERSATION: "div[aria-label='Conversation']",

  // Individual message items
  MESSAGE_ITEM: "[role='listitem']",

  // User identification (within a listitem)
  USER_AVATAR: "img[alt*='You']",
  USER_TEXT_PREFIX: "You:",

  // Sidebar / chat list
  SIDEBAR: "nav, [role='navigation']",
  CHAT_LIST_ITEMS: "a[href*='/app/']",

  // System navigation (excluded from chat list)
  SYSTEM_NAV: "a[href*='settings'], a[href*='new']",

  // Content elements within messages
  CODE_BLOCK: 'pre',
  INLINE_CODE: 'code:not(pre code)',
  MATH_BLOCK: '[data-math]',
  TABLE: 'table',
  IMAGE: "img[src^='https://']",

  // Citations
  CITATION: '[data-cite]',
} as const;
