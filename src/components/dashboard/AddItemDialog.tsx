import { useClipboardItems } from "@/hooks/useClipboardItems";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddItemDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  createItem?: (itemData: any) => Promise<any>;
  boards?: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
    is_default?: boolean;
  }>;
  fetchAllItems?: () => Promise<any>;
}

const AddItemDialog = ({ trigger, open, onOpenChange, createItem, boards, fetchAllItems }: AddItemDialogProps) => {
  const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure();
  
  // Use external control if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalIsOpen;
  const onOpen = onOpenChange ? () => onOpenChange(true) : internalOnOpen;
  const onClose = onOpenChange ? () => onOpenChange(false) : internalOnClose;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<'text' | 'link' | 'image' | 'code'>('text');
  const [tags, setTags] = useState("");
  const [boardId, setBoardId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use hook if props are not provided
  const hookData = useClipboardItems();
  const finalCreateItem = createItem || hookData.createItem;
  const finalBoards = boards || hookData.boards;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !finalCreateItem) return;

    setIsLoading(true);
    try {
      await finalCreateItem({
        title: title.trim(),
        content: content.trim(),
        type,
        is_pinned: false,
        is_favorite: false,
        board_id: boardId || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      });
      
      // Note: fetchAllItems is already called inside createItem
      
      // Reset form
      setTitle("");
      setContent("");
      setType('text');
      setTags("");
      setBoardId("");
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="faded" onPress={onOpen}>
      <Plus className="w-4 h-4 mr-2" />
      New Clip
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={onOpen}>{trigger}</div>
      ) : (
        defaultTrigger
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Add New Clip</h2>
            <p className="text-sm text-default-500">
              Create a new clipboard item to save and organize your content.
            </p>
          </ModalHeader>
          <ModalBody>
            <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="title"
              label="Title"
              placeholder="Enter a title for your clip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Select
              label="Type"
              placeholder="Select content type"
              selectedKeys={[type]}
              onSelectionChange={(keys) => setType(Array.from(keys)[0] as any)}
            >
              <SelectItem key="text">Text</SelectItem>
              <SelectItem key="link">Link</SelectItem>
              <SelectItem key="code">Code</SelectItem>
              <SelectItem key="image">Image</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <Textarea
              id="content"
              placeholder="Paste or type your content here"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Select
              label="Board (optional)"
              placeholder="Select a board"
              selectedKeys={boardId ? [boardId] : []}
              onSelectionChange={(keys) => setBoardId(Array.from(keys)[0] as string || "")}
            >
              {finalBoards?.filter(board => !board.is_default).map((board) => (
                <SelectItem key={board.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: board.color }}
                    />
                    <span>{board.name}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              id="tags"
              label="Tags (optional)"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              description="Example: work, important, meeting"
            />
          </div>

            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary"
              type="submit"
              form="add-item-form"
              isDisabled={isLoading || !title.trim() || !content.trim()}
              className="bg-gradient-hero text-white"
            >
              {isLoading ? "Creating..." : "Create Clip"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddItemDialog;