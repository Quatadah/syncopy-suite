import { useState } from "react";
import { 
  MoreHorizontal, 
  Copy, 
  Edit, 
  Trash2, 
  Star, 
  Tag, 
  ExternalLink,
  Code,
  Image as ImageIcon,
  FileText,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useClipboardItems } from "@/hooks/useClipboardItems";

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
}

const ClipboardItem = ({ item, view = 'grid' }: ClipboardItemProps) => {
  const [isStarred, setIsStarred] = useState(item.isFavorite);
  const [isPinned, setIsPinned] = useState(item.isPinned);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { deleteItem, toggleFavorite, togglePin, copyToClipboard } = useClipboardItems();

  const getTypeIcon = () => {
    switch (item.type) {
      case 'link':
        return <ExternalLink className="w-4 h-4 text-primary" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-accent" />;
      case 'code':
        return <Code className="w-4 h-4 text-warning" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'link':
        return 'border-l-primary bg-primary/5';
      case 'image':
        return 'border-l-accent bg-accent/5';
      case 'code':
        return 'border-l-warning bg-warning/5';
      default:
        return 'border-l-muted-foreground bg-muted/5';
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(item.content);
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (view === 'list') {
    return (
      <Card className={cn(
        "hover-lift cursor-pointer border-l-4 transition-all duration-200",
        getTypeColor(),
        isPinned && "ring-2 ring-primary/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {getTypeIcon()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  {isPinned && <Star className="w-4 h-4 text-warning fill-warning" />}
                </div>
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {item.content}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsStarred(!isStarred)}>
                    <Star className={cn("w-4 h-4 mr-2", isStarred && "fill-warning text-warning")} />
                    {isStarred ? 'Unstar' : 'Star'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Tag className="w-4 h-4 mr-2" />
                    Add Tags
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group hover-lift cursor-pointer transition-all duration-200 border-l-4",
      getTypeColor(),
      isPinned && "ring-2 ring-primary/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <h3 className="font-medium truncate flex-1">{item.title}</h3>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFavorite} disabled={isLoading}>
                  <Star className={cn("w-4 h-4 mr-2", isStarred && "fill-warning text-warning")} />
                  {isStarred ? 'Unstar' : 'Star'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin} disabled={isLoading}>
                  <Star className={cn("w-4 h-4 mr-2", isPinned && "fill-primary text-primary")} />
                  {isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin} disabled={isLoading}>
                  <Star className={cn("w-4 h-4 mr-2", isPinned && "fill-primary text-primary")} />
                  {isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="w-4 h-4 mr-2" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  className="text-destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {item.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(item.createdAt)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {isPinned && <Star className="w-4 h-4 text-warning fill-warning" />}
            {isStarred && <Star className="w-4 h-4 text-primary fill-primary" />}
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
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
    </Card>
  );
};

export default ClipboardItem;