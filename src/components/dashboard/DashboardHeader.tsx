import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: Array<{
    id: string;
    title: string;
    type: string;
  }>;
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
}

const DashboardHeader = ({ searchQuery, setSearchQuery, filteredItems, allItems }: DashboardHeaderProps) => {
  const { activeBoard } = useBoard();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { fetchTags } = useClipboardItems();
  
  // State for search suggestions
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{name: string, count: number}>>([]);
  const [recentItems, setRecentItems] = useState<Array<{id: string, title: string, type: string}>>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Load popular tags
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
        
        const tagsWithCounts = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        
        setPopularTags(tagsWithCounts);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };

    if (allItems.length > 0) {
      loadTags();
    }
  }, [allItems, fetchTags]);

  // Load recent items
  useEffect(() => {
    const recent = allItems
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.type
      }));
    
    setRecentItems(recent);
  }, [allItems]);

  // Save search query to recent searches
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      const newRecentSearches = [
        query,
        ...recentSearches.filter(search => search !== query)
      ].slice(0, 10);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }
  };

  const getBoardName = () => {
    if (activeBoard === "all") return "All Clips";
    if (activeBoard === "favorites") return "Favorites";
    if (activeBoard === "recent") return "Recent";
    return "Board";
  };

  return (
    <header className="relative">
      {/* Gradient overlay */}
      
      {/* Main Header */}
      <div className="relative h-16 flex items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center space-x-6 flex-1">
          {/* Search Bar - Prominent */}
          <div className="flex-1 max-w-2xl flex items-center space-x-3">
            <div className="relative w-full">
              <div className="absolute inset-0 rounded-xl blur-sm opacity-50"></div>
              <div className="relative">
                <EnhancedSearchBar
                  placeholder="Search clips..."
                  onSearch={handleSearch}
                  onSuggestionSelect={(suggestion) => {
                    handleSearch(suggestion.text);
                    if (suggestion.type === "item") {
                      // Find the item and scroll to it or highlight it
                      const item = allItems.find(item => item.id === suggestion.id);
                      if (item) {
                        // You could add logic here to highlight the item in the grid
                        console.log('Selected item:', item);
                      }
                    }
                  }}
                  recentSearches={recentSearches}
                  popularTags={popularTags}
                  recentItems={recentItems}
                  className="w-full"
                  showSuggestions={true}
                  maxSuggestions={8}
                  debounceMs={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Theme Toggle */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105">
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
