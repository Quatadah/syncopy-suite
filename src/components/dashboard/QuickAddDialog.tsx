import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Code,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Plus,
    Tag,
    X,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  initialType?: 'text' | 'link' | 'image' | 'code';
}

const QuickAddDialog: React.FC<QuickAddDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  initialContent = '',
  initialType = 'text'
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState<'text' | 'link' | 'image' | 'code'>(initialType);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle('');
      setContent(initialContent);
      setType(initialType);
      setTags([]);
      setNewTag('');
    }
  }, [open, initialContent, initialType]);

  // Auto-detect type from content
  useEffect(() => {
    if (content && !title) {
      // Auto-detect URL
      const urlRegex = /^https?:\/\/.+/;
      if (urlRegex.test(content.trim())) {
        setType('link');
        setTitle(content.trim());
      }
      // Auto-detect code (basic heuristics)
      else if (content.includes('function') || content.includes('const') || content.includes('import')) {
        setType('code');
        setTitle('Code snippet');
      }
      // Auto-detect image URL
      else if (content.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        setType('image');
        setTitle('Image');
      }
      else {
        setType('text');
        setTitle(content.substring(0, 50) + (content.length > 50 ? '...' : ''));
      }
    }
  }, [content, title]);

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'link':
        return <ExternalLink className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'link':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'image':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'code':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content for your clipboard item.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAdd({
        title: title.trim() || content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        content: content.trim(),
        type,
        tags
      });
      
      toast({
        title: 'Item Added',
        description: 'Your clipboard item has been saved successfully.',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add clipboard item. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      await onAdd({
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        content: content.trim(),
        type,
        tags: []
      });
      
      toast({
        title: 'Quick Added!',
        description: 'Item added with default settings.',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add clipboard item.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Clipboard Item</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
                { value: 'link', label: 'Link', icon: <ExternalLink className="w-4 h-4" /> },
                { value: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
                { value: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as any)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    type === option.value
                      ? getTypeColor(option.value)
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {option.icon}
                    <span className="text-xs font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your item..."
              className="w-full"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type your content here..."
              className="w-full min-h-[120px] resize-none"
              autoFocus
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickAdd}
                disabled={isLoading || !content.trim()}
                className="flex items-center space-x-1"
              >
                <Zap className="w-4 h-4" />
                <span>Quick Add</span>
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>{isLoading ? 'Adding...' : 'Add Item'}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddDialog;

