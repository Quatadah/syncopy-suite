import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import {
  Check,
  CheckSquare,
  Clock,
  Code,
  Copy,
  Edit,
  ExternalLink,
  FileText,
  Heart,
  Image as ImageIcon,
  MoreHorizontal,
  Pin,
  Tag,
  Trash2,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";

interface ClipboardItemProps {
  item: {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'link' | 'image' | 'code';
    tags: string[];
    isPinned: boolean;
    isFavorite: boolean;
    createdAt: string;
    preview?: string;
  };
  view?: 'grid' | 'list';
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  copyToClipboard: (content: string) => Promise<void>;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

const ClipboardItem = ({ 
  item, 
  view = 'grid', 
  deleteItem, 
  toggleFavorite, 
  togglePin, 
  copyToClipboard,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}: ClipboardItemProps) => {
  const [isStarred, setIsStarred] = useState(item.isFavorite);
  const [isPinned, setIsPinned] = useState(item.isPinned);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  // Reset copy feedback after 2 seconds
  useEffect(() => {
    if (justCopied) {
      const timer = setTimeout(() => setJustCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justCopied]);

  const getTypeIcon = () => {
    switch (item.type) {
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

  const getTypeConfig = () => {
    switch (item.type) {
      case 'link':
        return {
          gradient: 'from-primary/10 to-primary/5',
          border: 'border-primary/20',
          iconColor: 'text-primary',
          accentColor: 'bg-primary/10 text-primary',
          hoverColor: 'hover:bg-primary/5'
        };
      case 'image':
        return {
          gradient: 'from-accent/10 to-accent/5',
          border: 'border-accent/20',
          iconColor: 'text-accent',
          accentColor: 'bg-accent/10 text-accent',
          hoverColor: 'hover:bg-accent/5'
        };
      case 'code':
        return {
          gradient: 'from-success/10 to-success/5',
          border: 'border-success/20',
          iconColor: 'text-success',
          accentColor: 'bg-success/10 text-success',
          hoverColor: 'hover:bg-success/5'
        };
      default:
        return {
          gradient: 'from-muted-foreground/10 to-muted-foreground/5',
          border: 'border-muted-foreground/20',
          iconColor: 'text-muted-foreground',
          accentColor: 'bg-muted text-muted-foreground',
          hoverColor: 'hover:bg-muted/80'
        };
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(item.content);
    setJustCopied(true);
  };

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      await toggleFavorite(item.id, isStarred);
      setIsStarred(!isStarred);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      await togglePin(item.id, isPinned);
      setIsPinned(!isPinned);
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteItem(item.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionToggle = () => {
    if (onToggleSelection) {
      onToggleSelection(item.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const typeConfig = getTypeConfig();

  if (view === 'list') {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-medium",
          "bg-gradient-to-r bg-card", typeConfig.gradient, typeConfig.border,
          isPinned && "ring-2 ring-primary/20 shadow-soft",
          isHovered && "shadow-large scale-[1.02]",
          isSelected && "ring-2 ring-primary shadow-soft",
          typeConfig.hoverColor
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center p-4">
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <button
              onClick={handleSelectionToggle}
              className="mr-3 flex items-center justify-center w-5 h-5 rounded border-2 border-muted-foreground/30 hover:border-primary transition-colors"
            >
              {isSelected && (
                <CheckSquare className="w-4 h-4 text-primary fill-primary" />
              )}
            </button>
          )}
          {/* Type indicator and icon */}
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-colors", typeConfig.accentColor)}>
            <div className={typeConfig.iconColor}>
              {getTypeIcon()}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate text-sm">{item.title}</h3>
              {isPinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
              {isStarred && <Heart className="w-4 h-4 text-destructive fill-destructive/20" />}
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-2 max-w-lg">
              {item.content}
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(item.createdAt)}</span>
              </div>
              
              {item.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick copy button */}
          <Button
            size="lg"
            onClick={handleCopy}
            className={cn(
              "mr-2 min-w-[100px] h-10 font-medium transition-all duration-200",
              justCopied
                ? "bg-success hover:bg-success/90 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
            )}
          >
            {justCopied ? (
              <><Check className="w-4 h-4 mr-2" />Copied!</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" />Copy</>
            )}
          </Button>

          {/* More actions dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                size="sm" 
                variant="light"
                className="opacity-60 hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Item actions">
              <DropdownItem key="edit" startContent={<Edit className="w-4 h-4" />}>
                Edit
              </DropdownItem>
              <DropdownItem 
                key="favorite" 
                startContent={<Heart className={cn("w-4 h-4", isStarred && "fill-destructive text-destructive")} />} 
                onPress={handleToggleFavorite} 
                isDisabled={isLoading}
              >
                {isStarred ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownItem>
              <DropdownItem 
                key="pin" 
                startContent={<Pin className={cn("w-4 h-4", isPinned && "fill-primary text-primary")} />} 
                onPress={handleTogglePin} 
                isDisabled={isLoading}
              >
                {isPinned ? 'Unpin' : 'Pin to top'}
              </DropdownItem>
              <DropdownItem key="tags" startContent={<Tag className="w-4 h-4" />}>
                Manage tags
              </DropdownItem>
              <DropdownItem 
                key="delete" 
                color="danger" 
                startContent={<Trash2 className="w-4 h-4" />} 
                onPress={() => setShowDeleteDialog(true)} 
                isDisabled={isLoading}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        
        {/* Subtle hover indicator */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r transition-opacity duration-300",
          typeConfig.gradient,
          isHovered ? "opacity-100" : "opacity-0"
        )} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-large",
        "bg-gradient-to-br bg-card", typeConfig.gradient, typeConfig.border,
        isPinned && "ring-2 ring-primary/20 shadow-medium",
        isHovered && "shadow-glow scale-[1.03] -translate-y-1",
        isSelected && "ring-2 ring-primary shadow-medium",
        typeConfig.hoverColor
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <button
          onClick={handleSelectionToggle}
          className="absolute top-3 left-3 z-10 flex items-center justify-center w-5 h-5 rounded border-2 border-muted-foreground/30 hover:border-primary transition-colors bg-background/80 backdrop-blur-sm"
        >
          {isSelected && (
            <CheckSquare className="w-4 h-4 text-primary fill-primary" />
          )}
        </button>
      )}
      {/* Header with type indicator */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-colors", typeConfig.accentColor)}>
            <div className={typeConfig.iconColor}>
              {getTypeIcon()}
            </div>
          </div>
          <h3 className="font-semibold text-foreground truncate text-sm">{item.title}</h3>
        </div>
        
        <div className="flex items-center gap-1">
          {isPinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
          {isStarred && <Heart className="w-4 h-4 text-destructive fill-destructive/20" />}
        </div>
      </div>

      {/* Content preview */}
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-4 mb-4 min-h-[4rem] leading-relaxed">
          {item.content}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(item.createdAt)}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between p-4 pt-2 border-t border-border/50 bg-surface/30">
        <Button
          size="sm"
          onClick={handleCopy}
          className={cn(
            "flex-1 mr-2 h-9 font-medium transition-all duration-200",
            justCopied
              ? "bg-success hover:bg-success/90 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105"
          )}
        >
          {justCopied ? (
            <><Check className="w-4 h-4 mr-2" />Copied!</>
          ) : (
            <><Zap className="w-4 h-4 mr-2" />Quick Copy</>
          )}
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button 
              size="sm" 
              variant="light"
              className="opacity-60 hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Item actions">
            <DropdownItem key="edit" startContent={<Edit className="w-4 h-4" />}>
              Edit content
            </DropdownItem>
            <DropdownItem 
              key="favorite" 
              startContent={<Heart className={cn("w-4 h-4", isStarred && "fill-destructive text-destructive")} />} 
              onPress={handleToggleFavorite} 
              isDisabled={isLoading}
            >
              {isStarred ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownItem>
            <DropdownItem 
              key="pin" 
              startContent={<Pin className={cn("w-4 h-4", isPinned && "fill-primary text-primary")} />} 
              onPress={handleTogglePin} 
              isDisabled={isLoading}
            >
              {isPinned ? 'Unpin' : 'Pin to top'}
            </DropdownItem>
            <DropdownItem key="tags" startContent={<Tag className="w-4 h-4" />}>
              Manage tags
            </DropdownItem>
            <DropdownItem 
              key="delete" 
              color="danger" 
              startContent={<Trash2 className="w-4 h-4" />} 
              onPress={() => setShowDeleteDialog(true)} 
              isDisabled={isLoading}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Subtle animated border on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
        "bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20",
        isHovered && "opacity-100"
      )} />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clipboard Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClipboardItem;