import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Clock,
  Code,
  Copy,
  FileText,
  Heart,
  Image,
  Link,
  MoreHorizontal,
  Pin,
  Tag,
  Trash2
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ClipboardItem {
  id: string;
  type: "text" | "image" | "link" | "code";
  content: string;
  preview?: string;
  title?: string;
  timestamp: Date;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  size?: number;
  createdAt: string;
}

interface ClipboardItemProps {
  item: ClipboardItem;
  layout?: "grid" | "list";
  onPin?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onCopy?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
  // Legacy props for compatibility
  view?: "grid" | "list";
  deleteItem?: (id: string) => Promise<void>;
  toggleFavorite?: (id: string, isFavorite: boolean) => Promise<void>;
  togglePin?: (id: string, isPinned: boolean) => Promise<void>;
  copyToClipboard?: (content: string) => Promise<void>;
  // Modern props for selection
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelection?: () => void;
  onTogglePin?: () => void;
  onToggleFavorite?: () => void;
  // Additional props
  updateItem?: (id: string, updates: any) => Promise<void>;
  fetchTags?: () => Promise<any[]>;
}

const typeIcons = {
  text: FileText,
  image: Image,
  link: Link,
  code: Code,
};

const typeColors = {
  text: "bg-blue-500/10 text-blue-600 border-blue-200",
  image: "bg-green-500/10 text-green-600 border-green-200",
  link: "bg-purple-500/10 text-purple-600 border-purple-200",
  code: "bg-orange-500/10 text-orange-600 border-orange-200",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function ClipboardCard({
  item,
  layout = "grid",
  onPin,
  onFavorite,
  onCopy,
  onDelete,
  onShare,
  className,
  // Legacy props for compatibility
  view = "grid",
  deleteItem,
  toggleFavorite,
  togglePin,
  copyToClipboard,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onTogglePin,
  onToggleFavorite,
  updateItem,
  fetchTags,
}: ClipboardItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isStarred, setIsStarred] = useState(item.isFavorite);
  const [isPinned, setIsPinned] = useState(item.isPinned);
  const {
    isOpen: showDeleteDialog,
    onOpen: setShowDeleteDialog,
    onOpenChange: onDeleteDialogChange,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Use layout prop with fallback to view for compatibility
  const currentLayout = layout || view;
  const isListLayout = currentLayout === "list";

  // Reset copy feedback after 2 seconds
  useEffect(() => {
    if (justCopied) {
      const timer = setTimeout(() => setJustCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justCopied]);

  // Sync local state with prop changes
  useEffect(() => {
    setIsStarred(item.isFavorite);
  }, [item.isFavorite]);

  useEffect(() => {
    setIsPinned(item.isPinned);
  }, [item.isPinned]);

  const TypeIcon = typeIcons[item.type];

  const handlePin = () => {
    if (onPin) {
      onPin(item.id);
    } else if (onTogglePin) {
      onTogglePin();
    } else if (togglePin) {
      handleTogglePin();
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(item.id);
    } else if (onToggleFavorite) {
      onToggleFavorite();
    } else if (toggleFavorite) {
      handleToggleFavorite(e);
    }
  };

  const handleCopy = async () => {
    try {
      if (onCopy) {
        onCopy(item.id);
      } else if (copyToClipboard) {
        await copyToClipboard(item.content);
        setJustCopied(true);
      }
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(item.id);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    // Store the current state before optimistic update
    const currentFavoriteState = isStarred;
    const newFavoriteState = !isStarred;
    
    // Optimistically update the UI immediately
    setIsStarred(newFavoriteState);
    
    try {
      await toggleFavorite(item.id, currentFavoriteState);
      addToast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState
          ? "Item added to your favorites"
          : "Item removed from your favorites",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert the optimistic update on error
      setIsStarred(currentFavoriteState);
      addToast({
        title: "Error updating favorite",
        description: "Failed to update favorite status",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async () => {
    setIsLoading(true);
    
    // Store the current state before optimistic update
    const currentPinState = isPinned;
    const newPinState = !isPinned;
    
    // Optimistically update the UI immediately
    setIsPinned(newPinState);
    
    try {
      await togglePin(item.id, currentPinState);
      addToast({
        title: newPinState ? "Pinned item" : "Unpinned item",
        description: newPinState
          ? "Item has been pinned to the top"
          : "Item has been unpinned",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error) {
      console.error("Error toggling pin:", error);
      // Revert the optimistic update on error
      setIsPinned(currentPinState);
      addToast({
        title: "Error updating pin",
        description: "Failed to update pin status",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (onDelete) {
        onDelete(item.id);
      } else if (deleteItem) {
        await deleteItem(item.id);
      }
      onDeleteDialogChange();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopy();
  };

  // Get timestamp - use timestamp if available, otherwise createdAt
  const getTimestamp = () => {
    if (item.timestamp) return item.timestamp;
    return new Date(item.createdAt);
  };

  const renderPreview = () => {
    switch (item.type) {
      case "image":
        return (
          <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
            {item.preview ? (
              <img
                src={item.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      case "link":
        return (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Link className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate">
                {item.title || "Link"}
              </span>
            </div>
            <p
              className="text-xs text-muted-foreground truncate cursor-pointer"
              onClick={handleContentClick}
            >
              {item.content}
            </p>
          </div>
        );
      case "code":
        return (
          <div className="p-3 bg-muted/50 rounded-lg border border-border font-mono">
            <pre
              className="text-xs text-foreground whitespace-pre-wrap line-clamp-3 cursor-pointer"
              onClick={handleContentClick}
            >
              {item.content}
            </pre>
          </div>
        );
      default:
        return (
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p
              className="text-sm text-foreground line-clamp-3 cursor-pointer"
              onClick={handleContentClick}
            >
              {item.content}
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(className)}
    >
      <Card
        className={cn(
          "relative group transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/10",
          "border border-border/50 hover:border-border",
          "bg-gradient-to-br from-background to-background/80",
          "backdrop-blur-sm",
          isListLayout ? "flex items-center gap-4 p-4" : "p-4",
          item.isPinned && "ring-2 ring-primary/20 border-primary/30",
          isSelected && "ring-2 ring-primary shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Selection Checkbox */}
        {isSelectionMode && (
          <button
            onClick={handleSelectionToggle}
            className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded border-2 border-muted-foreground/30 hover:border-primary transition-colors bg-background/80 backdrop-blur-sm cursor-pointer"
          >
            {isSelected && (
              <CheckSquare className="w-4 h-4 text-primary fill-primary" />
            )}
          </button>
        )}

        {/* Pin indicator */}
        <AnimatePresence>
          {isPinned && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="absolute top-2 left-2 z-10"
            >
              <Pin className="w-4 h-4 text-primary fill-primary" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          className="absolute top-2 right-2 z-20 flex items-center gap-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered || isStarred ? 1 : 0, x: isHovered || isStarred ? 0 : 10 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            key={`heart-${item.id}-${isStarred}`}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17,
              duration: 0.3
            }}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all cursor-pointer hover:text-red-500 hover:fill-red-500",
                isStarred ? "text-red-500 fill-red-500" : "text-muted-foreground"
              )}
              onClick={handleFavorite}
            />
          </motion.div>
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                className="h-8 w-8 p-0 hover:bg-background/80 cursor-pointer relative z-30"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Clipboard item actions">
              <DropdownItem
                key="copy"
                startContent={<Copy className="w-4 h-4" />}
                onPress={handleCopy}
              >
                Copy
              </DropdownItem>
              <DropdownItem
                key="pin"
                startContent={<Pin className="w-4 h-4" />}
                onPress={handlePin}
              >
                {item.isPinned ? "Unpin" : "Pin"}
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={handleDelete}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </motion.div>


        <div className={cn("relative z-10", isListLayout ? "flex-1" : "")}>
          {/* Type indicator and title */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
                typeColors[item.type]
              )}
            >
              <TypeIcon className="w-3 h-3" />
              {item.type}
            </div>
            {item.size && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </span>
            )}
          </div>

          {/* Content preview */}
          {!isListLayout && (
            <div className="mb-4 cursor-pointer" onClick={handleContentClick}>
              {renderPreview()}
            </div>
          )}

          {/* Title for list layout */}
          {isListLayout && item.title && (
            <h3
              className="font-medium text-foreground mb-1 truncate cursor-pointer"
              onClick={handleContentClick}
            >
              {item.title}
            </h3>
          )}

          {/* Content snippet for list layout */}
          {isListLayout && (
            <p
              className="text-sm text-muted-foreground line-clamp-1 mb-2 cursor-pointer"
              onClick={handleContentClick}
            >
              {item.content}
            </p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, isListLayout ? 2 : 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors"
                >
                  <Tag className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
              {item.tags.length > (isListLayout ? 2 : 3) && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{item.tags.length - (isListLayout ? 2 : 3)}
                </Badge>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(getTimestamp())}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getTimestamp().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--primary), 0.1) 0%, rgba(var(--secondary), 0.1) 100%)",
            filter: "blur(1px)",
          }}
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      </Card>

      {/* Delete confirmation modal */}
      <Modal isOpen={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Clipboard Item
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete "{item.title}"? This action
                  cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={confirmDelete}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}

export default ClipboardCard;
