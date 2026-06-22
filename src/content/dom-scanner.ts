// Gemini Chat Exporter - DOM Scanner
// Traverses the Gemini DOM, extracts messages, and identifies roles/content.

import type { Attachment, ChatConversation, ChatMessage, Citation, GeminiUIVersion } from '../shared/types';
import { SELECTORS } from './selectors';
import {
  extractConversationId,
  generateMessageId,
  getTimestamp,
  isUserMessage,
} from './utils';

// ─── Conversation Container ─────────────────────────────

/**
 * Finds the conversation container element using semantic selectors with fallbacks.
 * Returns null if no conversation is found (e.g., on the Gemini home page).
 */
function findConversationContainer(): Element | null {
  const fallbackSelectors = [
    SELECTORS.CONVERSATION,
    "[role='main']",
    'main',
  ];

  for (const selector of fallbackSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.debug(`[Gemini Exporter] Found conversation container: "${selector}"`);
      return element;
    }
  }

  console.warn('[Gemini Exporter] No conversation container found');
  return null;
}

// ─── Message Extraction ─────────────────────────────────

/**
 * Extracts all message elements from the conversation container.
 */
function extractMessageElements(container: Element): Element[] {
  const elements = container.querySelectorAll(SELECTORS.MESSAGE_ITEM);
  console.debug(`[Gemini Exporter] Found ${elements.length} message elements`);
  return Array.from(elements);
}

/**
 * Parses an individual message element into a ChatMessage.
 */
function parseMessage(element: Element, index: number): ChatMessage {
  const role = isUserMessage(element) ? 'user' : 'model';
  const contentHtml = extractContentHtml(element);

  return {
    id: generateMessageId(index),
    role,
    contentHtml,
    contentMarkdown: '', // Populated later by markdown-converter
    attachments: extractAttachments(element),
    citations: extractCitations(element),
  };
}

/**
 * Extracts the inner HTML content of a message, excluding non-content elements.
 * Strips Gemini UI chrome like fade-in wrappers, action buttons, etc.
 */
function extractContentHtml(element: Element): string {
  let contentElement: Element | null = element;

  // Try to find the actual content wrapper (past fade-in wrappers etc.)
  const contentCandidates = [
    element.querySelector('[data-content]'),
    element.querySelector('[data-message-content]'),
    element.querySelector(':scope > div:last-child'),
  ];

  for (const candidate of contentCandidates) {
    if (candidate && candidate.textContent?.trim()) {
      contentElement = candidate;
      break;
    }
  }

  return contentElement.innerHTML;
}

// ─── Attachments ────────────────────────────────────────

/**
 * Extracts attachments (images, files) from a message element.
 */
function extractAttachments(element: Element): Attachment[] {
  const attachments: Attachment[] = [];

  // Find images (exclude avatars)
  const images = element.querySelectorAll(SELECTORS.IMAGE);
  images.forEach((img) => {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || '';

    // Skip user avatars
    if (alt.toLowerCase().includes('you') || alt.toLowerCase().includes('avatar')) {
      return;
    }

    if (src) {
      attachments.push({
        type: 'image',
        url: src,
      });
    }
  });

  // Find file attachments
  const fileElements = element.querySelectorAll('[data-attachment], [data-filename]');
  fileElements.forEach((file) => {
    attachments.push({
      type: 'file',
      name: file.getAttribute('data-filename') || file.getAttribute('data-name') || undefined,
      mimeType: file.getAttribute('data-mimetype') || undefined,
    });
  });

  return attachments;
}

// ─── Citations ──────────────────────────────────────────

/**
 * Extracts citation references from a message element.
 */
function extractCitations(element: Element): Citation[] {
  const citations: Citation[] = [];

  const citeElements = element.querySelectorAll(SELECTORS.CITATION);
  citeElements.forEach((cite) => {
    const text = cite.textContent?.trim() || '';
    const url = cite.getAttribute('href') || cite.getAttribute('data-url') || undefined;
    const title = cite.getAttribute('data-title') || cite.getAttribute('title') || undefined;

    if (text) {
      citations.push({ text, url, title });
    }
  });

  return citations;
}

// ─── UI Version Detection ───────────────────────────────

/**
 * Detects which Gemini UI version is running by checking for semantic markers.
 * This allows future-proofing against Google UI changes.
 */
function detectUIVersion(): GeminiUIVersion {
  const hasAriaConversation = !!document.querySelector(SELECTORS.CONVERSATION);
  const hasRoleMain = !!document.querySelector("[role='main']");
  const hasListitems = document.querySelectorAll(SELECTORS.MESSAGE_ITEM).length > 0;

  if (hasAriaConversation && hasListitems) {
    return {
      version: 'current',
      detectedAt: getTimestamp(),
      selectors: { ...SELECTORS },
    };
  }

  if (hasRoleMain && hasListitems) {
    return {
      version: 'legacy',
      detectedAt: getTimestamp(),
      selectors: {
        conversation: "[role='main']",
        message: "[role='listitem']",
        sidebar: "[role='navigation']",
        user: "img[alt*='You']",
      },
    };
  }

  return {
    version: 'unknown',
    detectedAt: getTimestamp(),
    selectors: {},
  };
}

// ─── Public API ─────────────────────────────────────────

/**
 * Scans the current page and extracts the active conversation.
 * Returns the parsed ChatConversation or an error message.
 */
export function scanCurrentConversation(): { conversation: ChatConversation } | { error: string } {
  const container = findConversationContainer();
  if (!container) {
    return { error: 'No conversation found on this page. Open a Gemini chat first.' };
  }

  const messageElements = extractMessageElements(container);
  if (messageElements.length === 0) {
    return { error: 'No messages found in the conversation.' };
  }

  const messages: ChatMessage[] = messageElements.map((el, i) => parseMessage(el, i));

  const currentUrl = window.location.href;
  const title = extractConversationTitle();

  const conversation: ChatConversation = {
    id: extractConversationId(currentUrl),
    title,
    url: currentUrl,
    messages,
    exportedAt: getTimestamp(),
    exportedBy: 'Gemini Chat Exporter v1.0.0',
    version: '1.0',
  };

  return { conversation };
}

/**
 * Detects the current Gemini UI version.
 */
export function getUIVersion(): GeminiUIVersion {
  return detectUIVersion();
}

/**
 * Counts total messages in the current conversation without fully parsing them.
 * Useful for progress tracking.
 */
export function countMessages(): number {
  const container = findConversationContainer();
  if (!container) return 0;
  return container.querySelectorAll(SELECTORS.MESSAGE_ITEM).length;
}

// ─── Title Extraction ───────────────────────────────────

/**
 * Extracts the current conversation title from the page.
 * Tries multiple sources: document title, breadcrumb, sidebar active item.
 */
function extractConversationTitle(): string {
  // Option 1: Document title (strips " - Gemini" suffix)
  const docTitle = document.title.replace(/\s*[-–—]\s*Gemini\s*$/i, '').trim();
  if (docTitle && docTitle !== 'Gemini') {
    return docTitle;
  }

  // Option 2: Active sidebar item (find sidebar first, then query within)
  const sidebar = document.querySelector(SELECTORS.SIDEBAR);
  if (sidebar) {
    const activeLink = sidebar.querySelector('a[aria-current], [aria-selected]');
    if (activeLink?.textContent?.trim()) {
      return activeLink.textContent.trim();
    }
  }

  // Option 3: Fallback
  return 'Untitled Chat';
}
