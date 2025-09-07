import EnhancedSearchBar from "@/components/ui/enhanced-search-bar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Settings, User } from "lucide-react";
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
    <header className="border-b border-border bg-card">
      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center space-x-6 flex-1">
          {/* Search Bar - Prominent */}
          <div className="flex-1 max-w-2xl flex items-center space-x-2">
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

        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default DashboardHeader;
