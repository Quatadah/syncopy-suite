// Content script for ClipSync extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSelectedText':
            const selectedText = window.getSelection().toString();
            sendResponse({ text: selectedText });
            break;

        case 'copyToClipboard':
            navigator.clipboard.writeText(request.text).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
            break;

        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Add keyboard shortcut listener
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+C or Cmd+Shift+C for quick copy
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        handleQuickCopy();
    }
});

// Handle quick copy from content script
async function handleQuickCopy() {
    try {
        const selectedText = window.getSelection().toString();

        if (selectedText && selectedText.trim()) {
            // Send to background script to save
            chrome.runtime.sendMessage({
                action: 'addClipboardItem',
                item: {
                    title: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
                    content: selectedText,
                    type: 'text',
                    tags: [],
                    isPinned: false,
                    isFavorite: false,
                    createdAt: new Date().toISOString()
                }
            });

            // Copy to clipboard
            await navigator.clipboard.writeText(selectedText);

            // Show visual feedback
            showCopyNotification();
        }
    } catch (error) {
        console.error('Error in quick copy:', error);
    }
}

// Show copy notification
function showCopyNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Copied to ClipSync!
      </div>
    </div>
    <style>
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>
  `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add context menu integration
document.addEventListener('contextmenu', (event) => {
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText.trim()) {
        // Add custom context menu item
        // This would require additional manifest permissions and context menu API
    }
});

// Monitor clipboard changes (if supported)
if (navigator.clipboard && navigator.clipboard.readText) {
    let lastClipboardContent = '';

    setInterval(async () => {
        try {
            const clipboardContent = await navigator.clipboard.readText();
            if (clipboardContent && clipboardContent !== lastClipboardContent) {
                lastClipboardContent = clipboardContent;

                // Auto-save clipboard content (optional)
                // This could be enabled/disabled in settings
                const settings = await chrome.storage.local.get(['settings']);
                if (settings.settings?.autoSaveClipboard) {
                    chrome.runtime.sendMessage({
                        action: 'addClipboardItem',
                        item: {
                            title: clipboardContent.substring(0, 50) + (clipboardContent.length > 50 ? '...' : ''),
                            content: clipboardContent,
                            type: 'text',
                            tags: [],
                            isPinned: false,
                            isFavorite: false,
                            createdAt: new Date().toISOString()
                        }
                    });
                }
            }
        } catch (error) {
            // Clipboard access might be restricted
            console.log('Clipboard monitoring not available:', error.message);
        }
    }, 2000); // Check every 2 seconds
}

