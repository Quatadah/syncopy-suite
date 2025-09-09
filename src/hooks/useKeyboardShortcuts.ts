import { addToast } from "@heroui/react";
import { useCallback, useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  global?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, global = false } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.metaKey === event.metaKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }

        try {
          matchingShortcut.action();
        } catch (error) {
          console.error("Error executing keyboard shortcut:", error);
          addToast({
            title: "Shortcut Error",
            description: "An error occurred while executing the shortcut.",
            color: "danger",
          });
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const target = global ? document : window;
    target.addEventListener("keydown", handleKeyDown);

    return () => {
      target.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled, global]);
};

// Predefined shortcut sets
export const createClipboardShortcuts = (
  copyToClipboard: (content: string) => Promise<void>,
  openSearch: () => void,
  openAddDialog: () => void,
  toggleSelectionMode: () => void
) => [
  {
    key: "c",
    ctrlKey: true,
    shiftKey: true,
    action: openSearch,
    description: "Open search (Ctrl+Shift+C)",
    preventDefault: true,
  },
  {
    key: "v",
    ctrlKey: true,
    shiftKey: true,
    action: openAddDialog,
    description: "Add new item (Ctrl+Shift+V)",
    preventDefault: true,
  },
  {
    key: "a",
    ctrlKey: true,
    shiftKey: true,
    action: toggleSelectionMode,
    description: "Toggle selection mode (Ctrl+Shift+A)",
    preventDefault: true,
  },
  {
    key: "Escape",
    action: () => {
      // Close any open modals or clear selection
      const escapeEvent = new CustomEvent("clipboard-escape");
      document.dispatchEvent(escapeEvent);
    },
    description: "Escape (Close modals/clear selection)",
    preventDefault: false,
  },
];

export const createSearchShortcuts = (
  focusSearch: () => void,
  clearSearch: () => void,
  toggleFilters: () => void
) => [
  {
    key: "/",
    action: focusSearch,
    description: "Focus search (/)",
    preventDefault: true,
  },
  {
    key: "Escape",
    action: clearSearch,
    description: "Clear search (Escape)",
    preventDefault: false,
  },
  {
    key: "f",
    ctrlKey: true,
    action: toggleFilters,
    description: "Toggle filters (Ctrl+F)",
    preventDefault: true,
  },
];

export const createNavigationShortcuts = (
  goToDashboard: () => void,
  goToSearch: () => void,
  goToSettings: () => void
) => [
  {
    key: "1",
    ctrlKey: true,
    action: goToDashboard,
    description: "Go to Dashboard (Ctrl+1)",
    preventDefault: true,
  },
  {
    key: "2",
    ctrlKey: true,
    action: goToSearch,
    description: "Go to Search (Ctrl+2)",
    preventDefault: true,
  },
  {
    key: ",",
    ctrlKey: true,
    action: goToSettings,
    description: "Go to Settings (Ctrl+,)",
    preventDefault: true,
  },
];

// Hook for copy shortcuts with visual feedback
export const useCopyShortcuts = (
  items: Array<{ id: string; content: string; title: string }>,
  copyToClipboard: (content: string) => Promise<void>
) => {
  const copyItemByIndex = useCallback(
    async (index: number) => {
      if (index >= 0 && index < items.length) {
        const item = items[index];
        try {
          await copyToClipboard(item.content);
          addToast({
            title: "Copied!",
            description: `"${item.title}" copied to clipboard`,
            color: "success",
          });
        } catch (error) {
          addToast({
            title: "Copy Failed",
            description: "Unable to copy to clipboard",
            color: "danger",
          });
        }
      }
    },
    [items, copyToClipboard]
  );

  const shortcuts = [
    {
      key: "1",
      ctrlKey: true,
      action: () => copyItemByIndex(0),
      description: "Copy first item (Ctrl+1)",
      preventDefault: true,
    },
    {
      key: "2",
      ctrlKey: true,
      action: () => copyItemByIndex(1),
      description: "Copy second item (Ctrl+2)",
      preventDefault: true,
    },
    {
      key: "3",
      ctrlKey: true,
      action: () => copyItemByIndex(2),
      description: "Copy third item (Ctrl+3)",
      preventDefault: true,
    },
    {
      key: "4",
      ctrlKey: true,
      action: () => copyItemByIndex(3),
      description: "Copy fourth item (Ctrl+4)",
      preventDefault: true,
    },
    {
      key: "5",
      ctrlKey: true,
      action: () => copyItemByIndex(4),
      description: "Copy fifth item (Ctrl+5)",
      preventDefault: true,
    },
  ];

  useKeyboardShortcuts(shortcuts, { enabled: items.length > 0 });
};

// Hook for quick actions
export const useQuickActions = (
  selectedItems: Set<string>,
  clearSelection: () => void,
  deleteSelected: () => void,
  toggleFavoriteSelected: () => void,
  togglePinSelected: () => void
) => {
  const shortcuts = [
    {
      key: "Delete",
      action: () => {
        if (selectedItems.size > 0) {
          deleteSelected();
        }
      },
      description: "Delete selected items (Delete)",
      preventDefault: true,
    },
    {
      key: "f",
      action: () => {
        if (selectedItems.size > 0) {
          toggleFavoriteSelected();
        }
      },
      description: "Toggle favorite for selected (F)",
      preventDefault: true,
    },
    {
      key: "p",
      action: () => {
        if (selectedItems.size > 0) {
          togglePinSelected();
        }
      },
      description: "Toggle pin for selected (P)",
      preventDefault: true,
    },
    {
      key: "Escape",
      action: clearSelection,
      description: "Clear selection (Escape)",
      preventDefault: false,
    },
  ];

  useKeyboardShortcuts(shortcuts, { enabled: selectedItems.size > 0 });
};

export default useKeyboardShortcuts;
