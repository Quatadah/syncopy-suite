import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useBoard } from "@/contexts/BoardContext";
import { addToast } from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddItemDialog from "./AddItemDialog";
import BoardHeader from "./BoardHeader";
import ClipsGrid from "./ClipsGrid";
import DashboardHeader from "./DashboardHeader";
import DashboardToolbar from "./DashboardToolbar";
import QuickAddDialog from "./QuickAddDialog";

interface DashboardContentProps {
  allItems: Array<{
    id: string;
    title: string;
    content: string;
    type: "text" | "link" | "image" | "code";
    tags: string[];
    is_pinned: boolean;
    is_favorite: boolean;
    board_id?: string;
    created_at: string;
    updated_at: string;
  }>;
  boards: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
  }>;
  loading: boolean;
  copyToClipboard: (content: string) => Promise<void>;
  createItem: (item: any) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
  deleteItems: (ids: string[]) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  fetchTags: () => Promise<any[]>;
  updateItem: (id: string, updates: any) => Promise<void>;
}

const DashboardContent = ({ 
  allItems, 
  boards, 
  loading,
  copyToClipboard, 
  createItem, 
  deleteItem, 
  deleteItems, 
  toggleFavorite, 
  togglePin, 
  fetchTags,
  updateItem
}: DashboardContentProps) => {
  const { activeBoard, currentBoardId } = useBoard();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const navigate = useNavigate();

  // Filter allItems based on current board selection
  const getItemsForCurrentBoard = () => {
    if (activeBoard === "all") {
      return allItems;
    } else if (activeBoard === "favorites") {
      return allItems.filter(item => item.is_favorite);
    } else if (activeBoard === "recent") {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return allItems.filter(item => new Date(item.created_at) > dayAgo);
    } else if (currentBoardId) {
      return allItems.filter(item => item.board_id === currentBoardId);
    }
    return allItems;
  };

  const items = getItemsForCurrentBoard();


  const getFilteredItems = () => {
    let filtered = items;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Pagination logic
  const totalCount = filteredItems.length;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Reset page when active board changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeBoard]);

  // Selection management functions
  const toggleSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allItemIds = paginatedItems.map((item) => item.id);
    setSelectedItems(new Set(allItemIds));
    if (allItemIds.length > 0) {
      addToast({
        title: "Selection updated",
        description: `Selected ${allItemIds.length} items`,
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    addToast({
      title: "Selection cleared",
      description: "All items have been deselected",
      color: "success",
      variant: "solid",
      timeout: 5000,
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems(new Set());
      addToast({
        title: "Selection mode disabled",
        description: "Selection mode has been turned off",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } else {
      addToast({
        title: "Selection mode enabled",
        description: "Click on items to select them for bulk operations",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const handleBulkDeleteClick = () => {
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    try {
      await deleteItems(Array.from(selectedItems));
      setSelectedItems(new Set());
      setShowBulkDeleteDialog(false);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const handleQuickAdd = () => {
    setShowQuickAddDialog(true);
  };

  const handleAddItem = () => {
    setShowAddItemDialog(true);
  };

  const handleCopy = async (itemId: string) => {
    try {
      const item = paginatedItems.find(item => item.id === itemId);
      if (item) {
        await copyToClipboard(item.content);
      }
    } catch (error) {
      console.error("Error copying item:", error);
    }
  };

  const handleCreateItem = async (item: {
    title: string;
    content: string;
    type: 'text' | 'link' | 'image' | 'code';
    tags: string[];
  }) => {
    try {
      await createItem({
        title: item.title,
        content: item.content,
        type: item.type,
        is_pinned: false,
        is_favorite: false,
        board_id: null,
        tags: item.tags,
      });
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredItems={[]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading clips...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredItems={filteredItems}
      />

      <DashboardToolbar
        view={view}
        setView={setView}
        isSelectionMode={isSelectionMode}
        selectedItems={selectedItems}
        onToggleSelectionMode={toggleSelectionMode}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDeleteClick}
        onQuickAdd={handleQuickAdd}
        onAddItem={handleAddItem}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onCreateItem={handleCreateItem}
      />

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="px-4">
          <BoardHeader boards={boards} />
          <div className="mb-4 flex justify-end">
            <AddItemDialog 
              open={showAddItemDialog}
              onOpenChange={setShowAddItemDialog}
            />
          </div>
          <ClipsGrid
            filteredItems={paginatedItems.map((item) => ({
              id: item.id,
              title: item.title,
              content: item.content,
              type: item.type,
              tags: item.tags,
              isPinned: item.is_pinned,
              isFavorite: item.is_favorite,
              createdAt: item.created_at,
            }))}
            view={view}
            isSelectionMode={isSelectionMode}
            selectedItems={selectedItems}
            onToggleSelection={toggleSelection}
            onTogglePin={(itemId) => togglePin(itemId, !paginatedItems.find(item => item.id === itemId)?.is_pinned)}
            onToggleFavorite={(itemId) => toggleFavorite(itemId, !paginatedItems.find(item => item.id === itemId)?.is_favorite)}
            onDelete={deleteItem}
            onCopy={handleCopy}
            onQuickAdd={handleQuickAdd}
            updateItem={updateItem}
            fetchTags={fetchTags}
          />

          {/* Pagination */}
          {filteredItems.length > 0 && totalCount > pageSize && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-border rounded-md bg-background"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>

              {/* Pagination Controls */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                    .filter((page) => {
                      const totalPages = Math.ceil(totalCount / pageSize);
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage >= Math.ceil(totalCount / pageSize)
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <QuickAddDialog
        open={showQuickAddDialog}
        onOpenChange={setShowQuickAddDialog}
        onAdd={handleCreateItem}
      />
    
    </div>
  );
};

export default DashboardContent;
