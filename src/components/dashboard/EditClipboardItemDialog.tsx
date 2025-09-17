import { ClipboardItem, useClipboardItems } from "@/hooks/useClipboardItems";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface EditClipboardItemDialogProps {
  item: ClipboardItem;
  trigger?: React.ReactNode | null;
  isOpen: boolean;
  onClose: () => void;
  updateItem?: (id: string, updates: Partial<ClipboardItem> & { tags?: string[] }) => Promise<void>;
  fetchTags?: () => Promise<any[]>;
}

const EditClipboardItemDialog = ({ item, trigger, isOpen, onClose, updateItem: propUpdateItem, fetchTags: propFetchTags }: EditClipboardItemDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"text" | "link" | "image" | "code">("text");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);
  
  // Use hook as fallback if props are not provided
  const hookData = useClipboardItems();
  const updateItem = propUpdateItem || hookData.updateItem;
  const fetchTags = propFetchTags || hookData.fetchTags;

  useEffect(() => {
    if (isOpen) {
      setTitle(item.title || "");
      setContent(item.content);
      setType(item.type);
      setTags(item.tags ? [...item.tags] : []);
      setNewTag("");
      loadAvailableTags();
    }
  }, [isOpen, item]);

  const loadAvailableTags = async () => {
    try {
      const tags = await fetchTags();
      setAvailableTags(tags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('EditClipboardItemDialog - Submitting with tags:', tags);
      
      // Update the item with new data
      await updateItem(item.id, {
        title: title.trim() || null,
        content: content.trim(),
        type,
        tags,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Clipboard Item</DialogTitle>
          <DialogDescription>
            Make changes to your clipboard item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Enter item title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter item content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "text" | "link" | "image" | "code")}>
              <SelectTrigger>
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            
            {/* Current tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={addTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>

            {/* Available tags to add */}
            {availableTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Available tags:</p>
                <div className="flex flex-wrap gap-1">
                  {availableTags
                    .filter(tag => !tags.includes(tag.name))
                    .map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addExistingTag(tag.name)}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        + {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditClipboardItemDialog;
