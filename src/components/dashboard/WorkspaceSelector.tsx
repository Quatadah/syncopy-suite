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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Workspace } from "@/hooks/useClipboardItems";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Check, ChevronDown, Plus, Settings } from "lucide-react";
import { useState } from "react";

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string | null) => void;
  onCreateWorkspace: (workspaceData: Omit<Workspace, "id" | "created_at" | "updated_at">) => Promise<any>;
  isCollapsed?: boolean;
  className?: string;
}

const WorkspaceSelector = ({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  isCollapsed = false,
  className
}: WorkspaceSelectorProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#6366f1");
  const [isCreating, setIsCreating] = useState(false);

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await onCreateWorkspace({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDescription.trim() || undefined,
        color: newWorkspaceColor,
        is_default: false,
      });

      // Reset form
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setNewWorkspaceColor("#6366f1");
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const colorOptions = [
    "#6366f1", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"
  ];

  if (isCollapsed) {
    return (
      <div className={cn("px-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-12 p-2 justify-center"
            >
              <div 
                className="w-6 h-6 rounded-lg"
                style={{ backgroundColor: currentWorkspace?.color || '#6366f1' }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                WORKSPACES
              </div>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onWorkspaceChange(workspace.id)}
                  className="flex items-center space-x-3 p-2 cursor-pointer"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <span className="flex-1">{workspace.name}</span>
                  {activeWorkspace === workspace.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Workspace
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a new workspace to organize your clipboard items.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Workspace name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Workspace description"
                        value={newWorkspaceDescription}
                        onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewWorkspaceColor(color)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              newWorkspaceColor === color 
                                ? "border-foreground scale-110" 
                                : "border-muted-foreground/20"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWorkspace}
                      disabled={isCreating || !newWorkspaceName.trim()}
                    >
                      {isCreating ? "Creating..." : "Create Workspace"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={cn("px-6 py-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">
              Workspace
            </h3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-3 py-2 bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/5 hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 border border-sidebar-border/30 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentWorkspace?.color || '#6366f1' }}
                />
                <span className="font-medium text-sidebar-foreground">
                  {currentWorkspace?.name || "Select Workspace"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                WORKSPACES
              </div>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onWorkspaceChange(workspace.id)}
                  className="flex items-center space-x-3 p-3 cursor-pointer rounded-lg"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{workspace.name}</div>
                    {workspace.description && (
                      <div className="text-xs text-muted-foreground">
                        {workspace.description}
                      </div>
                    )}
                  </div>
                  {activeWorkspace === workspace.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Workspace
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a new workspace to organize your clipboard items and boards.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Workspace name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Workspace description"
                        value={newWorkspaceDescription}
                        onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewWorkspaceColor(color)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all",
                              newWorkspaceColor === color 
                                ? "border-foreground scale-110" 
                                : "border-muted-foreground/20"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWorkspace}
                      disabled={isCreating || !newWorkspaceName.trim()}
                    >
                      {isCreating ? "Creating..." : "Create Workspace"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default WorkspaceSelector;