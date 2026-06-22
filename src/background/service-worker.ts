// Gemini Chat Exporter - Service Worker
// Handles background tasks and extension lifecycle.

console.log('[Gemini Chat Exporter] Service Worker started');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Gemini Chat Exporter] Installed:', details.reason);
});

// Handle messages (currently minimal; extended as needed)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Gemini Chat Exporter] Service Worker message:', message, sender);
  sendResponse({ status: 'ack' });
  return true;
});
