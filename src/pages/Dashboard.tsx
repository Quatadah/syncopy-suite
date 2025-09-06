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
        {/* Header */}
        <header className="border-b border-border bg-card">
          {/* Main Header */}
          <div className="h-16 flex items-center justify-between px-6">
            {/* Left Section - Title & Search */}
            <div className="flex items-center space-x-6 flex-1">
              <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
                {getBoardName()}
              </h1>
              
              {/* Search Bar - Prominent */}
              <div className="flex-1 max-w-2xl">
                <EnhancedSearchBar
                  placeholder="Search clips... (Press / to focus)"
                  onSearch={setSearchQuery}
                  onSuggestionSelect={(suggestion) => {
                    setSearchQuery(suggestion.text);
                    if (suggestion.type === 'item') {
                      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
                    }
                  }}
                  recentSearches={[]}
                  popularTags={[]}
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
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/search')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                Advanced
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-4 h-4" />
              </Button>
              
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
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
          </div>

          {/* Toolbar */}
          <div className="h-12 flex items-center justify-between px-6 border-t border-border bg-surface/50">
            {/* Left - View & Filter Controls */}
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center bg-muted/60 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={view === 'grid' ? 'solid' : 'ghost'}
                  onClick={() => setView('grid')}
                  className="h-7 px-3 text-xs"
                >
                  <Grid3X3 className="w-3.5 h-3.5 mr-1" />
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={view === 'list' ? 'solid' : 'ghost'}
                  onClick={() => setView('list')}
                  className="h-7 px-3 text-xs"
                >
                  <List className="w-3.5 h-3.5 mr-1" />
                  List
                </Button>
              </div>
              
              <Button 
                size="sm" 
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filter
              </Button>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {!isSelectionMode ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleSelectionMode}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1" />
                    Select
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowQuickAddDialog(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Quick Add
                  </Button>
                  
                  <AddItemDialog />
                </>
              ) : (
                <div className="flex items-center space-x-3 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={selectAll}
                      className="h-6 px-2 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelection}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="text-xs text-primary font-medium">
                    {selectedItems.size} selected
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBulkDeleteClick}
                      disabled={selectedItems.size === 0}
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleSelectionMode}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">No clips found</h3>
                <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
                  {searchQuery ? 
                    `No clips match "${searchQuery}". Try adjusting your search terms or browse all clips.` :
                    "Your clipboard is empty. Create your first clip to get started!"
                  }
                </p>
                <AddItemDialog 
                  trigger={
                    <Button className="bg-gradient-hero text-white hover:opacity-90 transition-opacity shadow-soft">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Clip
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* Items Grid/List */}
                <div className={cn(
                  "animate-fade-in",
                  view === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
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

                {/* Pagination */}
                {totalCount > pageSize && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Results Info */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                        </span>
                        
                        {/* Page Size Selector */}
                        <div className="flex items-center space-x-2">
                          <span>per page:</span>
                          <Select
                            size="sm"
                            selectedKeys={[pageSize.toString()]}
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string;
                              handlePageSizeChange(Number(selectedKey));
                            }}
                            className="w-16"
                            aria-label="Items per page"
                          >
                            <SelectItem key="6">6</SelectItem>
                            <SelectItem key="12">12</SelectItem>
                            <SelectItem key="24">24</SelectItem>
                            <SelectItem key="48">48</SelectItem>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Pagination Controls */}
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
                              className={cn(
                                "cursor-pointer",
                                currentPage <= 1 && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                          
                          {/* Simplified Page Numbers */}
                          {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                            .filter(page => {
                              const totalPages = Math.ceil(totalCount / pageSize);
                              if (totalPages <= 7) return true;
                              
                              return page === 1 || 
                                     page === totalPages || 
                                     Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, array) => {
                              const showEllipsis = index > 0 && page - array[index - 1] > 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <PaginationItem>
                                      <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">…</span>
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
                              className={cn(
                                "cursor-pointer",
                                currentPage >= Math.ceil(totalCount / pageSize) && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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