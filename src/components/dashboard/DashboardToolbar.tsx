import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, FileText, Filter, Grid3X3, List, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
    <>
      {/* Main Toolbar */}
      <div className="h-16 flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        {/* Left - View & Filter Controls */}
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as "grid" | "list")}
            className="w-auto"
          >
            <TabsList className="bg-muted/50 rounded-lg p-1 h-9">
              <TabsTrigger 
                value="grid" 
                className="h-7 px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className="h-7 px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
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
            className="h-9 px-4 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddItem}
            className="h-9 px-4 text-sm font-medium hover:bg-accent transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Clip
          </Button>
          
          <InstantPasteButton onAdd={onCreateItem} />
          
          <Button
            size="sm"
            variant="default"
            onClick={onQuickAdd}
            className="h-9 px-5 text-sm font-medium bg-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Floating Selection Bar - Only appears when items are selected */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Selection Counter */}
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                    {selectedItems.size} selected
                  </Badge>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSelectAll}
                    className="h-8 px-3 text-sm hover:bg-accent/50 transition-colors"
                  >
                    Select All
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onBulkDelete}
                    className="h-8 px-4 text-sm bg-destructive/90 hover:bg-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedItems.size})
                  </Button>

                  <Separator orientation="vertical" className="h-6 mx-1" />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearSelection}
                    className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardToolbar;