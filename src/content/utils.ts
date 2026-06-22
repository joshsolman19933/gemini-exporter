// Gemini Chat Exporter - Content Script Utilities
// Helper functions for DOM manipulation, filename generation, and more.

import type { ChatConversation, ExportFormat } from '../shared/types';

// ─── Filename Generation ────────────────────────────────

/**
 * Sanitizes a string for use as a filename.
 * Removes invalid characters and limits length.
 */
export function sanitizeFilename(name: string): string {
  let sanitized = name
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid chars with hyphen
    .replace(/\s+/g, '_') // Replace whitespace with underscore
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/_+/g, '_') // Collapse multiple underscores
    .trim();

  // Limit length (most filesystems support 255 chars)
  if (sanitized.length > 200) {
    sanitized = sanitized.slice(0, 200);
  }

  // Remove leading/trailing hyphens, underscores, and dots
  sanitized = sanitized.replace(/^[-_.]+/, '').replace(/[-_.]+$/, '');

  return sanitized || 'untitled';
}

/**
 * Generates an export filename based on conversation title and date.
 */
export function generateFilename(
  conversation: ChatConversation,
  format: ExportFormat
): string {
  const title = sanitizeFilename(conversation.title);
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ext = format === 'markdown' ? 'md' : format;
  return `gemini-${title}-${date}.${ext}`;
}

// ─── DOM Utilities ──────────────────────────────────────

/**
 * Debounce a function call by the specified delay in milliseconds.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delayMs);
  };
}

/**
 * Pause execution for the specified milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll a condition function at intervals until it returns true or times out.
 */
export async function pollUntil(
  condition: () => boolean,
  intervalMs: number,
  timeoutMs: number
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return true;
    await sleep(intervalMs);
  }
  return false;
}

// ─── HTML / Text Utilities ──────────────────────────────

/**
 * Escape HTML special characters for safe text insertion.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Check if an element is a user message based on avatar or text prefix.
 */
export function isUserMessage(element: Element): boolean {
  // Check for avatar image with "You" alt text
  const avatar = element.querySelector("img[alt*='You']");
  if (avatar) return true;

  // Fallback: check for "You:" text prefix
  const text = element.textContent?.trim() || '';
  if (text.startsWith('You:')) return true;

  return false;
}

/**
 * Detect programming language from a code block element.
 */
export function detectLanguage(preElement: Element): string {
  const code = preElement.querySelector('code');
  if (!code) return '';

  // Try className pattern (e.g., "language-python")
  const classMatch = code.className.match(/language-(\w+)/);
  if (classMatch) return classMatch[1];

  // Try data attribute
  const dataLang = code.getAttribute('data-language');
  if (dataLang) return dataLang;

  return '';
}

/**
 * Generate a unique message ID.
 */
export function generateMessageId(index: number): string {
  return `msg-${Date.now()}-${index.toString(36)}`;
}

/**
 * Extract the conversation ID from a Gemini URL.
 */
export function extractConversationId(url: string): string {
  // URL format: https://gemini.google.com/app/{id}
  const match = url.match(/\/app\/([a-f0-9-]+)/i);
  return match?.[1] || `unknown-${Date.now()}`;
}

// ─── Clipboard Utilities ────────────────────────────────

/**
 * Copy text to the system clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Format Utilities ───────────────────────────────────

/**
 * Get the MIME type for an export format for Blob creation.
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'markdown':
      return 'text/markdown';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    default:
      return 'text/plain';
  }
}

/**
 * Get the current timestamp in ISO 8601 format.
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}
