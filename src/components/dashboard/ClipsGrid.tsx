import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import ClipboardItem from "./ClipboardItem";

interface ClipsGridProps {
  filteredItems: Array<{
    id: string;
    title: string;
    content: string;
    type: "text" | "link" | "image" | "code";
    tags: string[];
    is_pinned: boolean;
    is_favorite: boolean;
    created_at: string;
    timestamp: Date;
  }>;
  view: "grid" | "list";
  isSelectionMode: boolean;
  selectedItems: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onTogglePin: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onCopy: (itemId: string) => void;
  onQuickAdd: () => void;
  updateItem?: (id: string, updates: any) => Promise<void>;
  fetchTags?: () => Promise<any[]>;
}

const ClipsGrid = ({
  filteredItems,
  view,
  isSelectionMode,
  selectedItems,
  onToggleSelection,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onCopy,
  onQuickAdd,
  updateItem,
  fetchTags,
}: ClipsGridProps) => {
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          No clips found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {isSelectionMode
            ? "No clips match your current selection criteria."
            : "Start by adding your first clipboard item or adjust your search filters."}
        </p>
        {!isSelectionMode && (
          <Button onClick={onQuickAdd} size="lg">
            Add Your First Clip
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-fade-in",
        view === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
          : "space-y-2"
      )}
    >
      {filteredItems.map((item) => (
        <ClipboardItem
          key={item.id}
          item={{
            ...item,
            isPinned: item.is_pinned,
            isFavorite: item.is_favorite,
            createdAt: item.created_at,
            timestamp: new Date(item.created_at)
          }}
          view={view}
          isSelected={selectedItems.has(item.id)}
          isSelectionMode={isSelectionMode}
          onToggleSelection={() => onToggleSelection(item.id)}
          onTogglePin={() => onTogglePin(item.id)}
          onToggleFavorite={() => onToggleFavorite(item.id)}
          onDelete={() => onDelete(item.id)}
          onCopy={() => onCopy(item.id)}
          updateItem={updateItem}
          fetchTags={fetchTags}
        />
      ))}
    </div>
  );
};

export default ClipsGrid;
