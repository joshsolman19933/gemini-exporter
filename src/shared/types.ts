// Gemini Chat Exporter - Shared Types
// Core TypeScript interfaces and types used across the extension.

// ─── Message Types ──────────────────────────────────────

export type MessageRole = 'user' | 'model';

export interface Attachment {
  type: 'image' | 'file';
  url?: string;
  name?: string;
  mimeType?: string;
}

export interface Citation {
  text: string;
  url?: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  contentHtml: string; // Raw HTML from DOM
  contentMarkdown: string; // Converted Markdown
  timestamp?: string; // ISO 8601
  attachments?: Attachment[];
  citations?: Citation[];
}

// ─── Conversation Types ─────────────────────────────────

export interface ChatConversation {
  id: string; // Gemini conversation ID (from URL)
  title: string; // Conversation title
  url: string; // Full Gemini URL
  messages: ChatMessage[];
  exportedAt: string; // ISO 8601 timestamp
  exportedBy: string; // "Gemini Chat Exporter vX.Y.Z"
  version: string; // Schema version
}

// ─── Export Types ───────────────────────────────────────

export type ExportFormat = 'markdown' | 'json' | 'html';

export type ExportScope = 'current' | 'all';

export interface ExportOptions {
  format: ExportFormat;
  includeTimestamps: boolean;
  includeCitations: boolean;
  scope: ExportScope;
}

export interface ExportResult {
  conversations: ChatConversation[];
  format: ExportFormat;
  blob: Blob;
  filename: string;
}

// ─── Extension Message Types ────────────────────────────

export interface ExtensionMessage {
  action: 'ping' | 'exportCurrent' | 'batchExport' | 'cancelExport';
  format?: ExportFormat;
  options?: Partial<ExportOptions>;
}

export interface ExtensionResponse {
  status: 'ok' | 'error' | 'not_implemented' | 'cancelled' | 'unknown_action';
  message?: string;
  data?: unknown;
}

// ─── DOM Scanner Types ──────────────────────────────────

export interface GeminiUIVersion {
  version: 'current' | 'legacy' | 'unknown';
  detectedAt: string;
  selectors: Record<string, string>;
}

export interface ScrollProgress {
  totalMessages: number;
  scrolledMessages: number;
  isComplete: boolean;
}

// ─── Sidebar Types ──────────────────────────────────────

export interface ChatLink {
  title: string;
  url: string;
  id: string; // Extracted from URL
}

// ─── Progress Types ─────────────────────────────────────

export type ExportPhase =
  | 'scanning'
  | 'scrolling'
  | 'extracting'
  | 'converting'
  | 'packaging'
  | 'done'
  | 'error'
  | 'cancelled';

export interface ProgressState {
  phase: ExportPhase;
  currentChat: number;
  totalChats: number;
  currentMessage: number;
  totalMessages: number;
  percentage: number;
}

// ─── Markdown Converter Types ───────────────────────────

export interface MathBlock {
  type: 'block' | 'inline';
  content: string;
}

export interface CodeBlock {
  language: string;
  content: string;
}
