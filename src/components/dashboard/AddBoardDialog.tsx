import { AddIcon } from "@/assets/icons/AddIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Board } from "@/hooks/useClipboardItems";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface AddBoardDialogProps {
  trigger?: React.ReactNode;
  createBoard: (boardData: Omit<Board, 'id' | 'created_at'>) => Promise<any>;
}

const AddBoardDialog = ({ trigger, createBoard }: AddBoardDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [isLoading, setIsLoading] = useState(false);
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a board name",
        variant: "destructive",
      });
      return;
    }

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
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" variant="ghost" onClick={() => setIsOpen(true)}>
      <AddIcon className="w-4 h-4" />
    </Button>
  );

  const colorOptions = [
    "#6366f1", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new board to organize your clipboard items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              placeholder="Enter board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter board description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Creating..." : "Create Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBoardDialog;