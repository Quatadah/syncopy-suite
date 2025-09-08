import { cn } from '@/lib/utils';
import { Kbd } from '@heroui/kbd';
import { ArrowRight, Clock, Search, Tag, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SearchSuggestion {
  id: string;
  type: 'recent' | 'tag' | 'item';
  text: string;
  subtitle?: string;
  icon?: React.ReactNode;
  count?: number;
}

interface EnhancedSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  recentSearches?: string[];
  popularTags?: Array<{ name: string; count: number }>;
  recentItems?: Array<{ id: string; title: string; type: string }>;
  className?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = "Search your clipboard items... (Ctrl+K)",
  onSearch,
  onSuggestionSelect,
  recentSearches = [],
  popularTags = [],
  recentItems = [],
  className,
  showSuggestions = true,
  maxSuggestions = 8,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    if (!query.trim() || !showSuggestions) {
      return [];
    }

    const allSuggestions: SearchSuggestion[] = [];

    // Recent searches
    recentSearches
      .filter(search => search.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .forEach(search => {
        allSuggestions.push({
          id: `recent-${search}`,
          type: 'recent',
          text: search,
          subtitle: 'Recent search',
          icon: <Clock className="w-4 h-4" />
        });
      });

    // Popular tags
    popularTags
      .filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .forEach(tag => {
        allSuggestions.push({
          id: `tag-${tag.name}`,
          type: 'tag',
          text: tag.name,
          subtitle: `${tag.count} items`,
          icon: <Tag className="w-4 h-4" />,
          count: tag.count
        });
      });

    // Recent items
    recentItems
      .filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .forEach(item => {
        allSuggestions.push({
          id: `item-${item.id}`,
          type: 'item',
          text: item.title,
          subtitle: `${item.type} • Recent`,
          icon: <Search className="w-4 h-4" />
        });
      });

    return allSuggestions.slice(0, maxSuggestions);
  }, [query, recentSearches, popularTags, recentItems, maxSuggestions, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    // Keep popover open when typing
    if (value.length > 0 || isFocused) {
      setIsPopoverOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPopoverOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          onSearch(query);
        }
        break;
      case 'Escape':
        setIsPopoverOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsPopoverOpen(false);
    setSelectedIndex(-1);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      onSearch(suggestion.text);
    }
    
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setIsPopoverOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleQuickFilterClick = (filterQuery: string) => {
    setQuery(filterQuery);
    onSearch(filterQuery);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsPopoverOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding panels to allow clicking on suggestions
    setTimeout(() => {
      setIsPopoverOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Update panel position when popover opens or input position changes
  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current!.getBoundingClientRect();
        const position = {
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        };
        setPanelPosition(position);
      };
      
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isPopoverOpen]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full pl-10 pr-10 py-3 h-12 text-sm",
            "bg-background border border-border rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "placeholder:text-muted-foreground text-foreground",
            "transition-all duration-200",
            "hover:border-border/80",
            isFocused && "ring-2 ring-primary/20 border-primary/50"
          )}
        />
        {query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-muted-foreground">
            <Kbd keys={["command", "ctrl"]}>K</Kbd>
          </div>
        )}
      </div>

      {/* Suggestions Panel - Portal */}
      {isPopoverOpen && query.length > 0 && suggestions.length > 0 && createPortal(
        <div
          ref={suggestionsRef}
          className="fixed bg-card border border-border rounded-xl shadow-2xl max-h-80 overflow-y-auto backdrop-blur-sm"
          style={{ 
            zIndex: 99999,
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors",
                "first:rounded-t-xl last:rounded-b-xl",
                selectedIndex === index && "bg-accent border-l-4 border-primary"
              )}
            >
              <div className="flex-shrink-0 text-muted-foreground">
                {suggestion.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {suggestion.text}
                </div>
                {suggestion.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.subtitle}
                  </div>
                )}
              </div>
              {suggestion.count && (
                <div className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {suggestion.count}
                </div>
              )}
              <div className="flex-shrink-0 text-muted-foreground">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Quick Filters - Portal */}
      {isPopoverOpen && query.length === 0 && createPortal(
        <div 
          className="fixed bg-card border border-border rounded-xl shadow-2xl p-4 backdrop-blur-sm"
          style={{ 
            zIndex: 99999,
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width
          }}
        >
          <div className="space-y-3">
            <div className="text-xs font-medium text-foreground mb-2">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickFilterClick('type:text')}
                className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Text only
              </button>
              <button
                onClick={() => handleQuickFilterClick('type:link')}
                className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Links only
              </button>
              <button
                onClick={() => handleQuickFilterClick('is:favorite')}
                className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Favorites
              </button>
              <button
                onClick={() => handleQuickFilterClick('is:pinned')}
                className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Pinned
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EnhancedSearchBar;

