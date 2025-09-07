import { Button } from "@/components/ui/button";
import { addToast } from "@heroui/react";
import { Bolt, CloudLightning } from "lucide-react";
import { useState } from "react";

interface InstantPasteButtonProps {
  onAdd: (item: {
    title: string;
    content: string;
    type: 'text' | 'link' | 'image' | 'code';
    tags: string[];
  }) => Promise<void>;
  className?: string;
}

const InstantPasteButton = ({ onAdd, className }: InstantPasteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect content type
  const detectType = (text: string): 'text' | 'link' | 'image' | 'code' => {
    const trimmed = text.trim();
    
    if (/^https?:\/\/.+/i.test(trimmed)) return 'link';
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(trimmed)) return 'image';
    if (
      trimmed.includes('function ') ||
      trimmed.includes('const ') ||
      trimmed.includes('import ') ||
      trimmed.includes('export ') ||
      /^\s*[\{\[\(]/.test(trimmed)
    ) return 'code';
    
    return 'text';
  };

  const generateTitle = (text: string, type: string): string => {
    const trimmed = text.trim();
    
    if (type === 'link') {
      try {
        const url = new URL(trimmed);
        return url.hostname.replace('www.', '');
      } catch {
        return trimmed.substring(0, 50);
      }
    }
    
    if (type === 'code') {
      const lines = trimmed.split('\n');
      const meaningfulLine = lines.find(line => 
        line.trim() && !line.trim().startsWith('//')
      );
      return meaningfulLine ? meaningfulLine.trim().substring(0, 50) : 'Code snippet';
    }
    
    const firstLine = trimmed.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  };

  const handleInstantPaste = async () => {
    if (!navigator.clipboard) {
      addToast({
        title: 'Clipboard not supported',
        description: 'Your browser does not support clipboard access.',
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      
      if (!text.trim()) {
        addToast({
          title: 'Clipboard is empty',
          description: 'Copy something first, then try again.',
          color: 'danger',
          variant: 'solid',
          timeout: 5000,
        });
        return;
      }

      const type = detectType(text);
      const title = generateTitle(text, type);
      
      await onAdd({
        title,
        content: text.trim(),
        type,
        tags: []
      });
      
      addToast({
        title: 'Instant save!',
        description: `Saved "${title}" from clipboard.`,
        color: 'success',
        variant: 'solid',
        timeout: 5000,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        addToast({
          title: 'Clipboard access denied',
          description: 'Please grant clipboard permissions and try again.',
          color: 'danger',
          variant: 'solid',
          timeout: 5000,
        });
      } else {
        addToast({
          title: 'Error',
          description: 'Failed to read from clipboard.',
          color: 'danger',
          variant: 'solid',
          timeout: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInstantPaste}
      disabled={isLoading}
      size="sm"
    >
      {isLoading ? (
        <>
          <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          Saving...
        </>
      ) : (
        <>
          <CloudLightning className="w-3.5 h-3.5" />
          Paste & Save
        </>
      )}
    </Button>
  );
};

export default InstantPasteButton;