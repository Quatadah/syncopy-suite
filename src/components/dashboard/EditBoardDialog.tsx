import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Board, useClipboardItems } from "@/hooks/useClipboardItems";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@heroui/react";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EditBoardDialogProps {
  board: Board;
  trigger?: React.ReactNode;
}

const EditBoardDialog = ({ board, trigger }: EditBoardDialogProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { updateBoard, deleteBoard } = useClipboardItems();

  useEffect(() => {
    if (isOpen) {
      setName(board.name);
      setDescription(board.description || "");
      setColor(board.color);
    }
  }, [isOpen, board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await updateBoard(board.id, {
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(board.id);
      setDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onPress={onOpen}>
      <Edit className="w-3 h-3" />
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
            <h2 className="text-xl font-semibold">Edit Board</h2>
            <p className="text-sm text-default-500">
              Make changes to your board settings.
            </p>
          </ModalHeader>
          <ModalBody>
            <form id="edit-board-form" onSubmit={handleSubmit} className="space-y-4">
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
          <ModalFooter className="gap-2">
            {!board.is_default && (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button type="button" color="danger" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Board</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{board.name}"? This action cannot be undone.
                      All items in this board will be moved to your default board.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete Board
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <div className="flex gap-2">
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                color="primary"
                type="submit" 
                form="edit-board-form"
                isDisabled={isLoading || !name.trim()}
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

export default EditBoardDialog;