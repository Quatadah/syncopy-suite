import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, ChevronDown, FileText, Filter, Grid3X3, List, Plus, Table, Trash2, X } from "lucide-react";
import InstantPasteButton from "./InstantPasteButton";

interface DashboardToolbarProps {
  view: "grid" | "list" | "table";
  setView: (view: "grid" | "list" | "table") => void;
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
  hasActiveFilters?: boolean;
  activeFilterCount?: number;
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
  hasActiveFilters = false,
  activeFilterCount = 0,
}: DashboardToolbarProps) => {
  return (
    <>
      {/* Main Toolbar */}
      <div className="relative h-16 flex items-center justify-between px-6 bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-sm border-b border-border/30">
        
        {/* Left - View & Filter Controls */}
        <div className="relative flex items-center gap-6">
          {/* View Toggle */}
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as "grid" | "list" | "table")}
            className="w-auto"
          >
            <TabsList className="bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl p-1.5 h-10 shadow-sm border border-border/20">
              <TabsTrigger 
                value="grid"
                className="h-8 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 hover:scale-105"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className="h-8 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 hover:scale-105"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="h-8 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-accent/10 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 hover:scale-105"
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-8 bg-gradient-to-b from-transparent via-border/50 to-transparent" />

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleFilters}
            className="h-10 px-4 text-sm font-medium bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-accent/10 hover:shadow-md transition-all duration-300 hover:scale-105 rounded-xl"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Right - Action Buttons */}
        <div className="relative flex items-center gap-3">
          {/* Grouped Add Actions - Paste & Save as primary, others in dropdown */}
          <div className="flex items-center">
            {/* Primary Action: Paste & Save */}
            <InstantPasteButton onAdd={onCreateItem} />
            
            {/* Dropdown for other add actions */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="default"
                  className="h-10 px-2 -ml-px rounded-l-none border-l-1 hover:from-primary/10 hover:to-accent/10 hover:shadow-md transition-all duration-300 hover:scale-105 rounded-r-xl"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Add actions" className="w-48">
                <DropdownItem 
                  key="new-clip" 
                  startContent={<FileText className="w-4 h-4" />}
                  onPress={onAddItem}
                >
                  New Clip
                </DropdownItem>
                <DropdownItem 
                  key="quick-add" 
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={onQuickAdd}
                >
                  Quick Add
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Floating Selection Bar - Only appears when items are selected */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              opacity: { duration: 0.3 }
            }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="relative rounded-2xl shadow-2xl px-6 py-4 overflow-hidden">
              
              <div className="relative flex items-center gap-6">
                {/* Selection Counter */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20">
                    <CheckSquare className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-primary/30 rounded-xl shadow-sm">
                    {selectedItems.size} selected
                  </Badge>
                </div>

                <Separator orientation="vertical" className="h-8 bg-gradient-to-b from-transparent via-border/50 to-transparent" />

                {/* Quick Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSelectAll}
                    className="h-9 px-4 text-sm font-medium bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-accent/10 hover:shadow-md transition-all duration-300 hover:scale-105 rounded-xl"
                  >
                    Select All
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onBulkDelete}
                    className="h-9 px-4 text-sm font-medium bg-gradient-to-r from-destructive/90 to-destructive hover:from-destructive hover:to-destructive/90 hover:shadow-lg hover:shadow-destructive/25 transition-all duration-300 hover:scale-105 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedItems.size})
                  </Button>

                  <Separator orientation="vertical" className="h-8 bg-gradient-to-b from-transparent via-border/50 to-transparent" />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearSelection}
                    className="h-9 w-9 p-0 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-destructive/10 hover:to-destructive/5 hover:shadow-md transition-all duration-300 hover:scale-105 rounded-xl"
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