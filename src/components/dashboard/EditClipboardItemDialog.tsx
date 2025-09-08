import { ClipboardItem, useClipboardItems } from "@/hooks/useClipboardItems";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from "@heroui/react";
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
      setTags([...item.tags]);
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
    if (!content.trim()) return;

    setIsLoading(true);
    try {
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

  const typeOptions = [
    { key: "text", label: "Text" },
    { key: "link", label: "Link" },
    { key: "image", label: "Image" },
    { key: "code", label: "Code" },
  ];

  return (
    <>
      {trigger && (
        <div onMouseDown={() => {}}>{trigger}</div>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Edit Clipboard Item</h2>
            <p className="text-sm text-default-500">
              Make changes to your clipboard item.
            </p>
          </ModalHeader>
          <ModalBody>
            <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="title"
                  label="Title (optional)"
                  placeholder="Enter item title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  id="content"
                  label="Content"
                  placeholder="Enter item content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  minRows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Select
                  label="Type"
                  placeholder="Select item type"
                  selectedKeys={[type]}
                  onSelectionChange={(keys) => {
                    const selectedType = Array.from(keys)[0] as "text" | "link" | "image" | "code";
                    setType(selectedType);
                  }}
                >
                  {typeOptions.map((option) => (
                    <SelectItem key={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                
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
                  <Button type="button" size="sm" onPress={addTag} disabled={!newTag.trim()}>
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
          </ModalBody>
          <ModalFooter className="gap-2">
            <div className="flex gap-2">
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                color="primary"
                type="submit" 
                form="edit-item-form"
                isDisabled={isLoading || !content.trim()}
                className="bg-gradient-hero text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditClipboardItemDialog;
