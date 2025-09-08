import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: Array<{
    id: string;
    title: string;
    type: string;
  }>;
}

const DashboardHeader = ({ searchQuery, setSearchQuery, filteredItems }: DashboardHeaderProps) => {
  const { activeBoard } = useBoard();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const getBoardName = () => {
    if (activeBoard === "all") return "All Clips";
    if (activeBoard === "favorites") return "Favorites";
    if (activeBoard === "recent") return "Recent";
    return "Board";
  };

  return (
    <header className="relative border-b border-border/30 bg-gradient-to-r from-card/95 to-card/80 backdrop-blur-sm">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
      
      {/* Main Header */}
      <div className="relative h-16 flex items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center space-x-6 flex-1">
          {/* Search Bar - Prominent */}
          <div className="flex-1 max-w-2xl flex items-center space-x-3">
            <div className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl blur-sm opacity-50"></div>
              <div className="relative">
                <EnhancedSearchBar
                  placeholder="Search clips... (Press / to focus)"
                  onSearch={setSearchQuery}
                  onSuggestionSelect={(suggestion) => {
                    setSearchQuery(suggestion.text);
                    if (suggestion.type === "item") {
                      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
                    }
                  }}
                  recentSearches={[]}
                  popularTags={[]}
                  recentItems={filteredItems.slice(0, 5).map((item) => ({
                    id: item.id,
                    title: item.title,
                    type: item.type,
                  }))}
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
