import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, FileText, Filter, Grid3X3, List, Plus, Square, Trash2, X } from "lucide-react";
import InstantPasteButton from "./InstantPasteButton";

interface DashboardToolbarProps {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
  isSelectionMode: boolean;
  selectedItems: Set<string>;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onQuickAdd: () => void;
  onAddItem: () => void;
  onToggleFilters: () => void;
  onCreateItem: (item: {
    title: string;
    content: string;
    type: 'text' | 'link' | 'image' | 'code';
    tags: string[];
  }) => Promise<void>;
}

const DashboardToolbar = ({
  view,
  setView,
  isSelectionMode,
  selectedItems,
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onQuickAdd,
  onAddItem,
  onToggleFilters,
  onCreateItem,
}: DashboardToolbarProps) => {
  return (
    <div className="h-14 flex items-center justify-between px-6 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left - View & Filter Controls */}
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <Tabs 
          value={view} 
          onValueChange={(value) => setView(value as "grid" | "list")}
          className="w-auto"
        >
          <TabsList className="bg-muted/50 rounded-lg p-1 h-8">
            <TabsTrigger 
              value="grid" 
              className="h-6 px-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="h-6 px-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator orientation="vertical" className="h-6" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleFilters}
          className="h-8 px-3 text-sm font-medium"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {isSelectionMode ? (
          <>
            {/* Selection Counter */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                {selectedItems.size} selected
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSelectAll}
                  className="h-8 px-3 text-sm"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClearSelection}
                  className="h-8 px-3 text-sm"
                >
                  <Square className="w-4 h-4 mr-2" />
                  None
                </Button>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Selection Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={onBulkDelete}
                disabled={selectedItems.size === 0}
                className="h-8 px-3 text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedItems.size})
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleSelectionMode}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleSelectionMode}
              className="h-8 px-3 text-sm font-medium"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Select
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddItem}
                className="h-8 px-3 text-sm font-medium"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Clip
              </Button>
              <InstantPasteButton onAdd={onCreateItem} />
              <Button
                size="sm"
                variant="default"
                onClick={onQuickAdd}
                className="h-8 px-4 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardToolbar;
