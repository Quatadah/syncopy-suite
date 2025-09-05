import { Board } from "@/hooks/useClipboardItems";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddBoardDialogProps {
  trigger?: React.ReactNode;
  createBoard: (boardData: Omit<Board, 'id' | 'created_at'>) => Promise<any>;
}

const AddBoardDialog = ({ trigger, createBoard }: AddBoardDialogProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [isLoading, setIsLoading] = useState(false);
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createBoard({
        name: name.trim(),
        description: description.trim() || null,
        color,
        is_default: false,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setColor("#6366f1");
      onClose();
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onPress={onOpen}>
      <Plus className="w-3 h-3" />
    </Button>
  );

  const colorOptions = [
    "#6366f1", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"
  ];

  return (
    <>
      {trigger ? (
        <div onClick={onOpen}>{trigger}</div>
      ) : (
        defaultTrigger
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Create New Board</h2>
            <p className="text-sm text-default-500">
              Create a new board to organize your clipboard items.
            </p>
          </ModalHeader>
          <ModalBody>
            <form id="create-board-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="name"
              label="Board Name"
              placeholder="Enter board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              id="description"
              label="Description (optional)"
              placeholder="Enter board description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption ? 'border-foreground scale-110' : 'border-muted-foreground/20'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
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
              form="create-board-form"
              isDisabled={isLoading || !name.trim()}
              className="bg-gradient-hero text-white"
            >
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddBoardDialog;