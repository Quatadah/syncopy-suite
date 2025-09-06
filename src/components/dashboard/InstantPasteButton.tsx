import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, Zap } from "lucide-react";
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
  const { toast } = useToast();

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
      toast({
        title: 'Clipboard not supported',
        description: 'Your browser does not support clipboard access.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await navigator.clipboard.readText();
      
      if (!text.trim()) {
        toast({
          title: 'Clipboard is empty',
          description: 'Copy something first, then try again.',
          variant: 'destructive'
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
      
      toast({
        title: 'Instant save!',
        description: `Saved "${title}" from clipboard.`,
      });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: 'Clipboard access denied',
          description: 'Please grant clipboard permissions and try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to read from clipboard.',
          variant: 'destructive'
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
      className={`bg-gradient-hero text-white hover:opacity-90 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-3.5 h-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          Saving...
        </>
      ) : (
        <>
          <Clipboard className="w-3.5 h-3.5 mr-2" />
          <Zap className="w-3 h-3 mr-1" />
          Paste & Save
        </>
      )}
    </Button>
  );
};

export default InstantPasteButton;