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
    Plus,
    Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ExtensionPopup = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        isFavorite: false,
        isPinned: false
    });

    // Load items from storage
    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const result = await chrome.storage.local.get(['clipboardItems']);
            setItems(result.clipboardItems || []);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredItems = () => {
        let filtered = items;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };

    const handleCopy = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            // Show success feedback
            const notification = document.createElement('div');
            notification.textContent = 'Copied!';
            notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #10b981;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
      `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleAddNew = () => {
        // Open the main app in a new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    };

    const getTypeIcon = (type) => {
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

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const filteredItems = getFilteredItems();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold">ClipSync</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                            className="p-1 hover:bg-white/20 rounded"
                        >
                            {view === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-1 hover:bg-white/20 rounded"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your clips..."
                        className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="space-y-3">
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

                        <div className="flex space-x-4">
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
            <div className="flex-1 overflow-y-auto">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No clips found</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first clip!'}
                        </p>
                        <button
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1 inline" />
                            Add New Clip
                        </button>
                    </div>
                ) : (
                    <div className={view === 'grid' ? 'p-2 grid grid-cols-2 gap-2' : 'p-2 space-y-2'}>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 ${view === 'grid' ? 'p-3' : 'p-3'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        <div className="flex-shrink-0 text-blue-600">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center space-x-1 flex-shrink-0">
                                        {item.isPinned && <Pin className="w-3 h-3 text-blue-600" />}
                                        {item.isFavorite && <Heart className="w-3 h-3 text-red-500" />}
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <p className={`text-xs text-gray-600 mb-2 ${view === 'grid' ? 'line-clamp-2' : 'line-clamp-3'
                                    }`}>
                                    {item.content}
                                </p>

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {item.tags.slice(0, view === 'grid' ? 1 : 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {item.tags.length > (view === 'grid' ? 1 : 2) && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                +{item.tags.length - (view === 'grid' ? 1 : 2)}
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
                                        onClick={() => handleCopy(item.content)}
                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtensionPopup;

