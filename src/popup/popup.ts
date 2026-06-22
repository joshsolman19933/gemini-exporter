// Gemini Chat Exporter - Popup Script
// Handles the popup UI logic and communicates with the content script.

import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Gemini Chat Exporter] Popup loaded');

  const exportCurrentBtn = document.getElementById('export-current');
  const batchExportBtn = document.getElementById('batch-export');
  const statusEl = document.getElementById('status');

  function setStatus(text: string): void {
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  if (exportCurrentBtn) {
    exportCurrentBtn.addEventListener('click', () => {
      setStatus('Exporting current chat...');
      sendToContentScript({ action: 'exportCurrent', format: 'markdown' });
    });
  }

  if (batchExportBtn) {
    batchExportBtn.addEventListener('click', () => {
      setStatus('Starting batch export...');
      sendToContentScript({ action: 'batchExport', format: 'markdown' });
    });
  }
});

async function sendToContentScript(message: Record<string, unknown>): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const response = await chrome.tabs.sendMessage(tab.id, message);
      console.log('[Gemini Chat Exporter] Response:', response);
      const statusEl = document.getElementById('status');
      if (statusEl) {
        statusEl.textContent = JSON.stringify(response);
      }
    }
  } catch (error) {
    console.error('[Gemini Chat Exporter] Error:', error);
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = `Error: ${error}`;
    }
  }
}
