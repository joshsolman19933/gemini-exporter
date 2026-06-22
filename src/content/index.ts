// Gemini Chat Exporter - Content Script Entry Point
// Injected into gemini.google.com to extract and export conversations.

import { SELECTORS } from './selectors';

// Verify selectors are available (used at runtime)
console.log('[Gemini Chat Exporter] Content script loaded');
console.log('[Gemini Chat Exporter] Selectors:', Object.keys(SELECTORS).length, 'selectors loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Gemini Chat Exporter] Message received:', message);

  switch (message.action) {
    case 'ping':
      sendResponse({ status: 'ok', version: '1.0.0' });
      break;
    case 'exportCurrent':
      // TODO: Implement single chat export
      sendResponse({ status: 'not_implemented', action: message.action });
      break;
    case 'batchExport':
      // TODO: Implement batch export
      sendResponse({ status: 'not_implemented', action: message.action });
      break;
    default:
      sendResponse({ status: 'unknown_action', action: message.action });
  }

  return true; // Keep the message channel open for async responses
});
