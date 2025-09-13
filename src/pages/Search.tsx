import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { Button, Checkbox, Input, Select, SelectItem } from "@heroui/react";
import {
    Clock,
    Code,
    Copy,
    ExternalLink,
    FileText,
    Filter,
    Grid3X3,
    Heart,
    Image as ImageIcon,
    List,
    Pin,
    Search as SearchIcon,
    Tag,
    X
} from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface SearchFilters {
  type: string;
  tags: string[];
  dateRange: string;
  board: string;
  isFavorite: boolean;
  isPinned: boolean;
}

const Search = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeBoard, setActiveBoard] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    tags: [],
    dateRange: 'all',
    board: 'all',
    isFavorite: false,
    isPinned: false
  });

  // SEO optimization
  useSEO({
    title: `Search${searchQuery ? `: "${searchQuery}"` : ''} | Clippy`,
    description: `Search through your clipboard history with Clippy's powerful search. Find any text, code, or content you've copied across all devices.`,
    url: "https://clippy.app/search",
    noindex: true, // Search page is private
    nofollow: true
  });

  const { allItems, boards, copyToClipboard, toggleFavorite, togglePin, fetchTags, createBoard } = useClipboardItems();
  const [availableTags, setAvailableTags] = useState<Array<{name: string, count: number}>>([]);

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Load available tags
  useMemo(async () => {
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
  }, [allItems, fetchTags]);

  const getFilteredItems = () => {
    let filtered = allItems;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <ExternalLink className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'link':
        return {
          gradient: 'from-primary/10 to-primary/5',
          border: 'border-primary/20',
          iconColor: 'text-primary',
          accentColor: 'bg-primary/10 text-primary',
        };
      case 'image':
        return {
          gradient: 'from-accent/10 to-accent/5',
          border: 'border-accent/20',
          iconColor: 'text-accent',
          accentColor: 'bg-accent/10 text-accent',
        };
      case 'code':
        return {
          gradient: 'from-success/10 to-success/5',
          border: 'border-success/20',
          iconColor: 'text-success',
          accentColor: 'bg-success/10 text-success',
        };
      default:
        return {
          gradient: 'from-muted-foreground/10 to-muted-foreground/5',
          border: 'border-muted-foreground/20',
          iconColor: 'text-muted-foreground',
          accentColor: 'bg-muted text-muted-foreground',
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== 'all' && value !== false
  );

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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Search</h1>
                <p className="text-muted-foreground mt-1">
                  Find your clipboard items with advanced filtering
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* View Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={view === 'grid' ? 'solid' : 'ghost'}
                    onClick={() => setView('grid')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={view === 'list' ? 'solid' : 'ghost'}
                    onClick={() => setView('list')}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Theme Toggle */}
                <ThemeToggleButton />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search your clipboard items..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="bordered"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.values(filters).filter(value => 
                      Array.isArray(value) ? value.length > 0 : value !== 'all' && value !== false
                    ).length}
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b border-border bg-card">
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
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} found
            </h2>
            {searchQuery && (
              <p className="text-muted-foreground text-sm mt-1">
                for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Results Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="bordered" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            view === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-3"
          )}>
            {filteredItems.map((item) => {
              const typeConfig = getTypeConfig(item.type);
              
              if (view === 'list') {
                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-medium bg-gradient-to-r bg-card border-border"
                  >
                    <div className="flex items-center p-4">
                      {/* Type indicator */}
                      <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-colors", typeConfig.accentColor)}>
                        <div className={typeConfig.iconColor}>
                          {getTypeIcon(item.type)}
                        </div>
                      </div>

                      {/* Content area */}
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate text-sm">{item.title}</h3>
                          {item.is_pinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
                          {item.is_favorite && <Heart className="w-4 h-4 text-destructive fill-destructive/20" />}
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mb-2 max-w-lg">
                          {item.content}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(item.created_at)}</span>
                          </div>
                          
                          {item.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                                  +{item.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Copy button */}
                      <Button
                        size="sm"
                        onClick={() => handleCopy(item.content)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-large bg-gradient-to-br bg-card border-border"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-colors", typeConfig.accentColor)}>
                        <div className={typeConfig.iconColor}>
                          {getTypeIcon(item.type)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground truncate text-sm">{item.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {item.is_pinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
                      {item.is_favorite && <Heart className="w-4 h-4 text-destructive fill-destructive/20" />}
                    </div>
                  </div>

                  {/* Content preview */}
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-4 mb-4 min-h-[4rem] leading-relaxed">
                      {item.content}
                    </p>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full border border-border">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex items-center justify-between p-4 pt-2 border-t border-border/50 bg-surface/30">
                    <Button
                      size="sm"
                      onClick={() => handleCopy(item.content)}
                      className="flex-1 mr-2 h-9 font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
});

Search.displayName = 'Search';

export default Search;
