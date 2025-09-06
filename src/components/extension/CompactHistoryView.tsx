import { cn } from '@/lib/utils';
import {
    Check,
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
    Plus,
    Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ClipboardItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'link' | 'image' | 'code';
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
}

interface CompactHistoryViewProps {
  items: ClipboardItem[];
  onCopy: (content: string) => void;
  onAddNew: () => void;
  maxHeight?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

const CompactHistoryView: React.FC<CompactHistoryViewProps> = ({
  items,
  onCopy,
  onAddNew,
  maxHeight = '400px',
  showSearch = true,
  showFilters = true,
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    isFavorite: false,
    isPinned: false
  });
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  // Reset copied feedback after 2 seconds
  useEffect(() => {
    if (copiedItemId) {
      const timer = setTimeout(() => setCopiedItemId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedItemId]);

  const getFilteredItems = () => {
    let filtered = items;

    // Search filter
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

    // Favorite filter
    if (filters.isFavorite) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Pinned filter
    if (filters.isPinned) {
      filtered = filtered.filter(item => item.isPinned);
    }

    return filtered.sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'link':
        return 'text-blue-600';
      case 'image':
        return 'text-green-600';
      case 'code':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleCopy = async (item: ClipboardItem) => {
    await onCopy(item.content);
    setCopiedItemId(item.id);
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Recent Clips</h3>
          <div className="flex items-center space-x-1">
            {!compact && (
              <button
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
              >
                {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
            )}
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clips..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && showFiltersPanel && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="image">Image</option>
                <option value="code">Code</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isFavorite}
                  onChange={(e) => setFilters(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-xs text-gray-700">Favorites</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isPinned}
                  onChange={(e) => setFilters(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-xs text-gray-700">Pinned</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">No clips found</h4>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first clip!'}
            </p>
            <button
              onClick={onAddNew}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add New</span>
            </button>
          </div>
        ) : (
          <div className={cn(
            view === 'grid' ? 'p-2 grid grid-cols-2 gap-2' : 'p-2 space-y-1',
            compact && 'p-1 space-y-1'
          )}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200",
                  view === 'grid' ? 'p-2' : 'p-2',
                  compact && 'p-2',
                  item.isPinned && 'ring-2 ring-blue-200 bg-blue-50'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={cn("flex-shrink-0", getTypeColor(item.type))}>
                      {getTypeIcon(item.type)}
                    </div>
                    <h4 className={cn(
                      "font-medium text-gray-900 truncate",
                      compact ? "text-xs" : "text-sm"
                    )}>
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {item.isPinned && <Pin className="w-3 h-3 text-blue-600" />}
                    {item.isFavorite && <Heart className="w-3 h-3 text-red-500" />}
                  </div>
                </div>

                {/* Content Preview */}
                <p className={cn(
                  "text-gray-600 mb-2",
                  compact ? "text-xs line-clamp-1" : "text-xs line-clamp-2"
                )}>
                  {item.content}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && !compact && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(item)}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors flex items-center space-x-1",
                      copiedItemId === item.id
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {copiedItemId === item.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!compact && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={onAddNew}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add New</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactHistoryView;

