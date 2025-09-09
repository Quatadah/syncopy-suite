import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/contexts/BoardContext";
import { Edit, Search, X } from "lucide-react";
import EditBoardDialog from "./EditBoardDialog";

interface BoardHeaderProps {
  boards: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
    is_default: boolean;
    created_at: string;
  }>;
  searchQuery?: string;
  filteredCount?: number;
  totalCount?: number;
  onClearSearch?: () => void;
}

const BoardHeader = ({ boards, searchQuery, filteredCount, totalCount, onClearSearch }: BoardHeaderProps) => {
  const { activeBoard } = useBoard();

  const getCurrentBoard = () => {
    if (activeBoard === "all" || activeBoard === "favorites" || activeBoard === "recent") {
      return null;
    }
    return boards.find((b) => b.id === activeBoard);
  };

  const getBoardName = () => {
    if (activeBoard === "all") return "All Clips";
    if (activeBoard === "favorites") return "Favorites";
    if (activeBoard === "recent") return "Recent";
    return getCurrentBoard()?.name || "All Clips";
  };

  const currentBoard = getCurrentBoard();

  // Show search results indicator if searching
  if (searchQuery) {
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Search Results
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredCount !== undefined && totalCount !== undefined ? (
                  <>
                    {filteredCount} of {totalCount} items
                    {filteredCount !== totalCount && (
                      <span className="ml-2">
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      </span>
                    )}
                  </>
                ) : (
                  'Searching...'
                )}
              </p>
            </div>
          </div>
          {onClearSearch && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSearch}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Query:</span> "{searchQuery}"
          </p>
        </div>
      </div>
    );
  }

  // Don't show header for special views (all, favorites, recent)
  if (!currentBoard) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {/* Board color indicator */}
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: currentBoard.color }}
          />
          <h1 className="text-lg font-semibold text-foreground">
            {currentBoard.name}
          </h1>
        </div>
        {/* Edit button */}
        <EditBoardDialog 
          board={currentBoard}
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs"
              aria-label="Edit board"
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          }
        />
      </div>
      {/* Board description */}
      {currentBoard.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentBoard.description}
        </p>
      )}
    </div>
  );
};

export default BoardHeader;
