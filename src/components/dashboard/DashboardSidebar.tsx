import { useState } from "react";
import { 
  Home, 
  Star, 
  Folder, 
  Tag, 
  Clock, 
  Settings, 
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const [activeBoard, setActiveBoard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const boards = [
    { id: "all", name: "All Clips", count: 247, icon: Home },
    { id: "favorites", name: "Favorites", count: 23, icon: Star },
    { id: "recent", name: "Recent", count: 50, icon: Clock },
  ];

  const customBoards = [
    { id: "work", name: "Work", count: 89 },
    { id: "personal", name: "Personal", count: 45 },
    { id: "projects", name: "Projects", count: 32 },
    { id: "code", name: "Code Snippets", count: 67 },
  ];

  const tags = [
    { name: "meeting", count: 12 },
    { name: "design", count: 8 },
    { name: "code", count: 24 },
    { name: "links", count: 15 },
    { name: "ideas", count: 6 },
  ];

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">ClipSync</h2>
          <Button size="sm" className="bg-gradient-hero text-white">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clips..."
            className="pl-10 bg-sidebar-accent border-sidebar-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Main Boards */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Overview</h3>
          <div className="space-y-1">
            {boards.map((board) => {
              const Icon = board.icon;
              return (
                <button
                  key={board.id}
                  onClick={() => setActiveBoard(board.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    activeBoard === board.id
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{board.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {board.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Boards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-sidebar-foreground">Boards</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {customBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setActiveBoard(board.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group",
                  activeBoard === board.id
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Folder className="w-4 h-4" />
                  <span>{board.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    {board.count}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-sidebar-foreground">Tags</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Filter className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {tags.map((tag) => (
              <button
                key={tag.name}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Tag className="w-4 h-4" />
                  <span>#{tag.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {tag.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;