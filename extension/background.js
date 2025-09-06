// Background script for ClipSync extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set up initial storage
        chrome.storage.local.set({
            clipboardItems: [],
            settings: {
                autoSync: true,
                maxItems: 1000,
                syncInterval: 30000 // 30 seconds
            }
        });
    }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case 'open-popup':
            // Open the popup
            chrome.action.openPopup();
            break;
        case 'quick-copy':
            // Handle quick copy from current page
            handleQuickCopy();
            break;
    }
});

// Handle quick copy functionality
async function handleQuickCopy() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Inject content script to get selected text
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSelectedText
        });

        const selectedText = results[0].result;

        if (selectedText && selectedText.trim()) {
            // Add to clipboard items
            await addClipboardItem({
                title: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
                content: selectedText,
                type: 'text',
                tags: [],
                isPinned: false,
                isFavorite: false,
                createdAt: new Date().toISOString()
            });

            // Copy to system clipboard
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: copyToClipboard,
                args: [selectedText]
            });

            // Show notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon-48.png',
                title: 'ClipSync',
                message: 'Text copied and saved to ClipSync!'
            });
        }
    } catch (error) {
        console.error('Error in quick copy:', error);
    }
}

// Function to get selected text (runs in content script context)
function getSelectedText() {
    return window.getSelection().toString();
}

// Function to copy text to clipboard (runs in content script context)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// Add clipboard item to storage
async function addClipboardItem(item) {
    try {
        const result = await chrome.storage.local.get(['clipboardItems']);
        const items = result.clipboardItems || [];

        // Add new item at the beginning
        const newItem = {
            id: Date.now().toString(),
            ...item
        };

        items.unshift(newItem);

        // Limit to max items
        const settings = await chrome.storage.local.get(['settings']);
        const maxItems = settings.settings?.maxItems || 1000;
        if (items.length > maxItems) {
            items.splice(maxItems);
        }

        await chrome.storage.local.set({ clipboardItems: items });

        // Sync with server if auto-sync is enabled
        const settingsResult = await chrome.storage.local.get(['settings']);
        if (settingsResult.settings?.autoSync) {
            syncWithServer(newItem);
        }
    } catch (error) {
        console.error('Error adding clipboard item:', error);
    }
}

// Sync with server
async function syncWithServer(item) {
    try {
        // This would integrate with your Supabase backend
        // For now, we'll just log it
        console.log('Syncing item with server:', item);
    } catch (error) {
        console.error('Error syncing with server:', error);
    }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'addClipboardItem':
            addClipboardItem(request.item).then(() => {
                sendResponse({ success: true });
            });
            return true; // Keep message channel open for async response

        case 'getClipboardItems':
            chrome.storage.local.get(['clipboardItems']).then((result) => {
                sendResponse({ items: result.clipboardItems || [] });
            });
            return true;

        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Periodic sync with server
setInterval(async () => {
    try {
        const settings = await chrome.storage.local.get(['settings']);
        if (settings.settings?.autoSync) {
            // Sync logic here
            console.log('Periodic sync with server');
        }
    } catch (error) {
        console.error('Error in periodic sync:', error);
    }
}, 30000); // 30 seconds

