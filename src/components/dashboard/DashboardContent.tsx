import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useBoard } from "@/contexts/BoardContext";
import { addToast, Button, Checkbox, Select, SelectItem } from "@heroui/react";
import { Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddItemDialog from "./AddItemDialog";
import BoardHeader from "./BoardHeader";
import ClipsGrid from "./ClipsGrid";
import DashboardHeader from "./DashboardHeader";
import DashboardToolbar from "./DashboardToolbar";
import QuickAddDialog from "./QuickAddDialog";

interface SearchFilters {
  type: string;
  tags: string[];
  dateRange: string;
  board: string;
  isFavorite: boolean;
  isPinned: boolean;
}

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
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    tags: [],
    dateRange: 'all',
    board: 'all',
    isFavorite: false,
    isPinned: false
  });
  const [availableTags, setAvailableTags] = useState<Array<{name: string, count: number}>>([]);
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

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchTags();
        const tagCounts = tags.reduce((acc: Record<string, number>, tag) => {
          const count = allItems.filter(item => item.tags.includes(tag.name)).length;
          if (count > 0) {
            acc[tag.name] = count;
          }
          return acc;
        }, {});
        
        const tagsWithCounts = Object.entries(tagCounts).map(([name, count]) => ({
          name,
          count: count as number
        }));
        
        setAvailableTags(tagsWithCounts);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };

    if (allItems.length > 0) {
      loadTags();
    }
  }, [allItems, fetchTags]);

  const getFilteredItems = () => {
    let filtered = items;

    // Filter by search query with advanced search support
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Check for special search operators
      if (query.startsWith('type:')) {
        const typeFilter = query.replace('type:', '');
        filtered = filtered.filter(item => item.type === typeFilter);
      } else if (query.startsWith('is:')) {
        const statusFilter = query.replace('is:', '');
        if (statusFilter === 'favorite') {
          filtered = filtered.filter(item => item.is_favorite);
        } else if (statusFilter === 'pinned') {
          filtered = filtered.filter(item => item.is_pinned);
        }
      } else if (query.startsWith('tag:')) {
        const tagFilter = query.replace('tag:', '');
        filtered = filtered.filter(item => 
          item.tags.some(tag => tag.toLowerCase().includes(tagFilter))
        );
      } else {
        // Regular text search
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
    }

    // Apply additional filters
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        filters.tags.some(filterTag => item.tags.includes(filterTag))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(item => new Date(item.created_at) >= cutoffDate);
    }

    // Board filter
    if (filters.board !== 'all') {
      if (filters.board === 'favorites') {
        filtered = filtered.filter(item => item.is_favorite);
      } else if (filters.board === 'recent') {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.created_at) > dayAgo);
      } else {
        filtered = filtered.filter(item => item.board_id === filters.board);
      }
    }

    // Favorite filter
    if (filters.isFavorite) {
      filtered = filtered.filter(item => item.is_favorite);
    }

    // Pinned filter
    if (filters.isPinned) {
      filtered = filtered.filter(item => item.is_pinned);
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== 'all' && value !== false
  ) || (searchQuery && (
    searchQuery.startsWith('type:') || 
    searchQuery.startsWith('is:') || 
    searchQuery.startsWith('tag:')
  ));

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

  // Filter helper functions
  const toggleTagFilter = (tagName: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      tags: [],
      dateRange: 'all',
      board: 'all',
      isFavorite: false,
      isPinned: false
    });
  };

  // Utility function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || searchTerm.startsWith('type:') || searchTerm.startsWith('is:') || searchTerm.startsWith('tag:')) {
      return text;
    }
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredItems={[]}
          allItems={allItems}
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
        allItems={allItems}
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
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={Object.values(filters).filter(value => 
          Array.isArray(value) ? value.length > 0 : value !== 'all' && value !== false
        ).length}
      />

      {/* Filters Panel */}
      {showFilters && (
        <div className="">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <Select 
                  selectedKeys={[filters.type]} 
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    setFilters(prev => ({ ...prev, type: selectedValue }));
                  }}
                  placeholder="Select type"
                  className="max-w-xs"
                >
                  <SelectItem key="all">All Types</SelectItem>
                  <SelectItem key="text">Text</SelectItem>
                  <SelectItem key="link">Link</SelectItem>
                  <SelectItem key="image">Image</SelectItem>
                  <SelectItem key="code">Code</SelectItem>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
                <Select 
                  selectedKeys={[filters.dateRange]} 
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    setFilters(prev => ({ ...prev, dateRange: selectedValue }));
                  }}
                  placeholder="Select date range"
                  className="max-w-xs"
                >
                  <SelectItem key="all">All Time</SelectItem>
                  <SelectItem key="today">Today</SelectItem>
                  <SelectItem key="week">This Week</SelectItem>
                  <SelectItem key="month">This Month</SelectItem>
                  <SelectItem key="year">This Year</SelectItem>
                </Select>
              </div>

              {/* Board Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Board</label>
                <Select 
                  selectedKeys={[filters.board]} 
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0] as string;
                    setFilters(prev => ({ ...prev, board: selectedValue }));
                  }}
                  placeholder="Select board"
                  className="max-w-xs"
                >
                  <>
                    <SelectItem key="all">All Boards</SelectItem>
                    <SelectItem key="favorites">Favorites</SelectItem>
                    <SelectItem key="recent">Recent</SelectItem>
                    {boards.map((board: any) => (
                      <SelectItem key={board.id}>{board.name}</SelectItem>
                    ))}
                  </>
                </Select>
              </div>

              {/* Status Filters */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <div className="space-y-2">
                  <Checkbox
                    isSelected={filters.isFavorite}
                    onValueChange={(checked) => setFilters(prev => ({ ...prev, isFavorite: checked }))}
                    size="sm"
                  >
                    <span className="text-sm">Favorites only</span>
                  </Checkbox>
                  <Checkbox
                    isSelected={filters.isPinned}
                    onValueChange={(checked) => setFilters(prev => ({ ...prev, isPinned: checked }))}
                    size="sm"
                  >
                    <span className="text-sm">Pinned only</span>
                  </Checkbox>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag.name}
                      variant={filters.tags.includes(tag.name) ? "solid" : "bordered"}
                      size="sm"
                      onClick={() => toggleTagFilter(tag.name)}
                      className="flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag.name}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {tag.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={clearFilters} 
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="px-4">
          <BoardHeader 
            boards={boards.map(board => ({
              id: board.id,
              name: board.name,
              description: board.description,
              color: board.color,
              is_default: false,
              created_at: new Date().toISOString()
            }))}
            searchQuery={searchQuery}
            filteredCount={filteredItems.length}
            totalCount={items.length}
            onClearSearch={() => setSearchQuery('')}
          />
          <ClipsGrid
            filteredItems={paginatedItems.map((item) => ({
              id: item.id,
              title: item.title,
              content: item.content,
              type: item.type,
              tags: item.tags,
              is_pinned: item.is_pinned,
              is_favorite: item.is_favorite,
              created_at: item.created_at,
              timestamp: new Date(item.created_at)
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
            searchQuery={searchQuery}
            highlightSearchTerm={highlightSearchTerm}
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
      
      <AddItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        createItem={createItem}
        boards={boards}
      />
    
    </div>
  );
};

export default DashboardContent;
