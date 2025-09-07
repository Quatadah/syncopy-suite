import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { addToast } from '@heroui/react';
import {
    Clipboard,
    Zap
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    title: string;
    content: string;
    type: 'text' | 'link' | 'image' | 'code';
    tags: string[];
  }) => Promise<void>;
  initialContent?: string;
}

const QuickAddDialog: React.FC<QuickAddDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  initialContent = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset and focus when dialog opens
  useEffect(() => {
    if (open) {
      setContent(initialContent);
      // Focus textarea after dialog animation
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open, initialContent]);

  // Auto-detect content type
  const detectType = (text: string): 'text' | 'link' | 'image' | 'code' => {
    const trimmed = text.trim();
    
    // URL detection
    if (/^https?:\/\/.+/i.test(trimmed)) {
      return 'link';
    }
    
    // Image URL detection
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(trimmed)) {
      return 'image';
    }
    
    // Code detection (basic heuristics)
    if (
      trimmed.includes('function ') ||
      trimmed.includes('const ') ||
      trimmed.includes('import ') ||
      trimmed.includes('export ') ||
      trimmed.includes('<script') ||
      trimmed.includes('<?php') ||
      /^\s*[\{\[\(]/.test(trimmed) ||
      trimmed.includes('SELECT ') ||
      trimmed.includes('FROM ')
    ) {
      return 'code';
    }
    
    return 'text';
  };

  // Generate smart title
  const generateTitle = (text: string, type: string): string => {
    const trimmed = text.trim();
    
    if (type === 'link') {
      try {
        const url = new URL(trimmed);
        return url.hostname.replace('www.', '') + url.pathname;
      } catch {
        return trimmed.substring(0, 50);
      }
    }
    
    if (type === 'code') {
      // Try to extract function name or first meaningful line
      const lines = trimmed.split('\n');
      const meaningfulLine = lines.find(line => 
        line.trim() && 
        !line.trim().startsWith('//') && 
        !line.trim().startsWith('/*')
      );
      return meaningfulLine ? meaningfulLine.trim().substring(0, 50) : 'Code snippet';
    }
    
    // For text, use first line or first 50 chars
    const firstLine = trimmed.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  };

  const handleQuickSave = async () => {
    if (!content.trim()) {
      addToast({
        title: 'Nothing to save',
        description: 'Please paste or type some content first.',
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const type = detectType(content);
      const title = generateTitle(content, type);
      
      await onAdd({
        title,
        content: content.trim(),
        type,
        tags: [] // No tags for quick save
      });
      
      addToast({
        title: 'Saved!',
        description: 'Content saved to your clipboard.',
        color: 'success',
        variant: 'solid',
        timeout: 5000,
      });
      
      onOpenChange(false);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        textareaRef.current?.focus();
      }
    } catch (error) {
      addToast({
        title: 'Cannot access clipboard',
        description: 'Please paste manually using Ctrl+V.',
        color: 'danger',
        variant: 'solid',
        timeout: 5000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleQuickSave();
    }
    // Close with Escape
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Quick Save</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick paste button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Paste content and save instantly
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="flex items-center space-x-1"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </Button>
          </div>

          {/* Content textarea */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type anything here... (Ctrl+Enter to save)"
            className="min-h-[200px] resize-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />

          {/* Type preview */}
          {content.trim() && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              <span>Auto-detected: <strong className="capitalize">{detectType(content)}</strong></span>
              <span>Title: <strong>{generateTitle(content, detectType(content))}</strong></span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Quick mode - auto-organized
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleQuickSave}
                disabled={isLoading || !content.trim()}
                className="bg-gradient-hero text-white hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Save (⌘↵)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddDialog;

