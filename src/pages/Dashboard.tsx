import AddItemDialog from "@/components/dashboard/AddItemDialog";
import ClipboardItem from "@/components/dashboard/ClipboardItem";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import QuickAddDialog from "@/components/dashboard/QuickAddDialog";
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
import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { createClipboardShortcuts, createSearchShortcuts, useCopyShortcuts, useKeyboardShortcuts, useQuickActions } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Select, SelectItem } from "@heroui/react";
import {
  Bell,
  CheckSquare,
  Filter,
  Grid3X3,
  List,
  Loader2,
  Plus,
  Search,
  Settings,
  Square,
  Trash2,
  User,
  X
} from "lucide-react";
import React, { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = memo(() => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBoard, setActiveBoard] = useState('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const currentBoardId = useMemo(() => {
    return activeBoard === 'all' || activeBoard === 'favorites' || activeBoard === 'recent' 
      ? undefined 
      : activeBoard;
  }, [activeBoard]);
  
  const { 
    items, 
    allItems,
    boards, 
    loading, 
    currentPage, 
    pageSize, 
    totalCount, 
    copyToClipboard, 
    createBoard, 
    createItem,
    handlePageChange, 
    handlePageSizeChange,
    fetchTags,
    deleteItem,
    deleteItems,
    toggleFavorite,
    togglePin
  } = useClipboardItems(currentBoardId);

  const getFilteredItems = () => {
    let filtered = items;

    // Filter by board
    if (activeBoard === 'favorites') {
      filtered = filtered.filter(item => item.is_favorite);
    } else if (activeBoard === 'recent') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.created_at) > dayAgo);
    } else if (activeBoard !== 'all') {
      filtered = filtered.filter(item => item.board_id === activeBoard);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Selection management functions
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
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
    setSelectedItems(new Set(filteredItems.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      clearSelection();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    await deleteItems(Array.from(selectedItems));
    clearSelection();
    setIsSelectionMode(false);
    setShowBulkDeleteDialog(false);
  };

  const handleBulkDeleteClick = () => {
    if (selectedItems.size === 0) return;
    setShowBulkDeleteDialog(true);
  };

  // Keyboard shortcuts
  const clipboardShortcuts = useMemo(() => createClipboardShortcuts(
    copyToClipboard,
    () => navigate('/search'),
    () => setShowQuickAddDialog(true),
    toggleSelectionMode
  ), [navigate, toggleSelectionMode, copyToClipboard]);

  const searchShortcuts = useMemo(() => createSearchShortcuts(
    () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    () => setSearchQuery(''),
    () => setShowFilters(!showFilters)
  ), [showFilters]);

  useKeyboardShortcuts(clipboardShortcuts, { enabled: true, global: true });
  useKeyboardShortcuts(searchShortcuts, { enabled: true, global: false });
  
  // Copy shortcuts for first 5 items
  useCopyShortcuts(filteredItems.slice(0, 5), copyToClipboard);
  
  // Quick actions for selected items
  useQuickActions(
    selectedItems,
    clearSelection,
    handleBulkDeleteClick,
    () => {
      // Toggle favorite for selected items
      selectedItems.forEach(itemId => {
        const item = filteredItems.find(i => i.id === itemId);
        if (item) toggleFavorite(itemId, item.is_favorite);
      });
    },
    () => {
      // Toggle pin for selected items
      selectedItems.forEach(itemId => {
        const item = filteredItems.find(i => i.id === itemId);
        if (item) togglePin(itemId, item.is_pinned);
      });
    }
  );

  const getBoardName = () => {
    if (activeBoard === 'all') return 'All Clips';
    if (activeBoard === 'favorites') return 'Favorites';
    if (activeBoard === 'recent') return 'Recent';
    
    // Find custom board name from boards state
    const board = boards.find(b => b.id === activeBoard);
    return board?.name || 'All Clips';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your clips...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
        <DashboardSidebar
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          createBoard={createBoard}
          items={allItems}
          boards={boards}
          fetchTags={fetchTags}
        />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-xl font-semibold">{getBoardName()}</h1>
            
            {/* Enhanced Search */}
            <div className="flex-1 max-w-md">
              <EnhancedSearchBar
                placeholder="Search clips... (Press / to focus)"
                onSearch={setSearchQuery}
                onSuggestionSelect={(suggestion) => {
                  setSearchQuery(suggestion.text);
                  if (suggestion.type === 'item') {
                    // Navigate to search page for item search
                    navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
                  }
                }}
                recentSearches={[]} // You can implement this with localStorage
                popularTags={[]} // You can get this from your tags data
                recentItems={filteredItems.slice(0, 5).map(item => ({
                  id: item.id,
                  title: item.title,
                  type: item.type
                }))}
                className="w-full"
                showSuggestions={true}
                maxSuggestions={8}
                debounceMs={300}
              />
            </div>
            
            {/* Advanced Search Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/search')}
              className="text-sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
          </div>

          {/* Mass Actions Toolbar */}
          {isSelectionMode && (
            <div className="flex items-center space-x-3 mr-4">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAll}
                  className="text-sm"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                  className="text-sm"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {selectedItems.size} selected
              </div>
              
              <Button
                size="sm"
                color="danger"
                onClick={handleBulkDeleteClick}
                disabled={selectedItems.size === 0}
                className="text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedItems.size})
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSelectionMode}
                className="text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {/* Selection Mode Toggle */}
            {!isSelectionMode && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSelectionMode}
                className="text-sm"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Select
              </Button>
            )}
            
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={view === 'grid' ? 'solid' : 'ghost'}
                onClick={() => setView('grid')}
                className="h-7 px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={view === 'list' ? 'solid' : 'ghost'}
                onClick={() => setView('list')}
                className="h-7 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Filter */}
            <Button size="sm" variant="ghost">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            {/* Add New */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQuickAddDialog(true)}
                className="text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
              <AddItemDialog />
            </div>
            
            {/* Notifications */}
            <Button size="sm" variant="ghost">
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Profile Menu */}
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="bordered">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile actions">
                <DropdownItem key="profile" startContent={<User className="w-4 h-4" />}>
                  Profile
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                  Settings
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={signOut}>
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No clips found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery ? 
                  `No clips match "${searchQuery}". Try adjusting your search terms.` :
                  "You don't have any clipboard items yet. Start by adding your first clip!"
                }
              </p>
              <AddItemDialog 
                trigger={
                  <Button className="bg-gradient-hero text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Clip
                  </Button>
                }
              />
            </div>
          ) : (
            <div className={cn(
              view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-3"
            )}>
              {filteredItems.map((item) => (
                <ClipboardItem 
                  key={item.id} 
                  item={{
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    type: item.type,
                    tags: item.tags,
                    isPinned: item.is_pinned,
                    isFavorite: item.is_favorite,
                    createdAt: item.created_at,
                  }} 
                  view={view}
                  deleteItem={deleteItem}
                  toggleFavorite={toggleFavorite}
                  togglePin={togglePin}
                  copyToClipboard={copyToClipboard}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedItems.has(item.id)}
                  onToggleSelection={toggleSelection}
                />
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredItems.length > 0 && totalCount > pageSize && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                </div>
                
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    size="sm"
                    selectedKeys={[pageSize.toString()]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      handlePageSizeChange(Number(selectedKey));
                    }}
                    className="w-20"
                    aria-label="Items per page"
                  >
                    <SelectItem key="6">6</SelectItem>
                    <SelectItem key="12">12</SelectItem>
                    <SelectItem key="24">24</SelectItem>
                    <SelectItem key="48">48</SelectItem>
                  </Select>
                </div>
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current page
                      return page === 1 || 
                             page === Math.ceil(totalCount / pageSize) || 
                             Math.abs(page - currentPage) <= 2;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < Math.ceil(totalCount / pageSize)) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage >= Math.ceil(totalCount / pageSize) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </div>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={showQuickAddDialog}
        onOpenChange={setShowQuickAddDialog}
        onAdd={async (item) => {
          await createItem({
            title: item.title,
            content: item.content,
            type: item.type,
            tags: item.tags,
            is_pinned: false,
            is_favorite: false
          });
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} clipboard item{selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;