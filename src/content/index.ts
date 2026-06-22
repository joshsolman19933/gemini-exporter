// Gemini Chat Exporter - Content Script Entry Point
// Injected into gemini.google.com to extract and export conversations.

import { SELECTORS } from './selectors';
import { scanCurrentConversation, getUIVersion } from './dom-scanner';
import type { ExtensionMessage, ExtensionResponse } from '../shared/types';

// Verify selectors are available (used at runtime)
console.log('[Gemini Chat Exporter] Content script loaded');
console.log('[Gemini Chat Exporter] Selectors:', Object.keys(SELECTORS).length, 'selectors loaded');
console.log('[Gemini Chat Exporter] UI Version:', getUIVersion().version);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Gemini Chat Exporter] Message received:', message);
  const msg = message as ExtensionMessage;

  switch (msg.action) {
    case 'ping':
      sendResponse({ status: 'ok', data: { version: '1.0.0' } } satisfies ExtensionResponse);
      break;

    case 'exportCurrent': {
      const result = scanCurrentConversation();
      if ('error' in result) {
        sendResponse({ status: 'error', message: result.error } satisfies ExtensionResponse);
      } else {
        sendResponse({
          status: 'ok',
          data: {
            conversation: result.conversation,
            messageCount: result.conversation.messages.length,
          },
        } satisfies ExtensionResponse);
      }
      break;
    }

    case 'batchExport':
      // TODO: Implement batch export (Phase 4)
      sendResponse({ status: 'not_implemented', message: 'Batch export coming in Phase 4' } satisfies ExtensionResponse);
      break;

    default:
      sendResponse({ status: 'unknown_action', message: `Unknown action: ${msg.action}` } satisfies ExtensionResponse);
  }

  return true; // Keep the message channel open for async responses
});
