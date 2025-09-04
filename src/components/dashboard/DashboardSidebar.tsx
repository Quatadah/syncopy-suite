import { useState, useEffect } from "react";
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
import { useClipboardItems } from "@/hooks/useClipboardItems";
import AddBoardDialog from "./AddBoardDialog";
import EditBoardDialog from "./EditBoardDialog";
import { useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  activeBoard: string;
  setActiveBoard: (board: string) => void;
  createBoard: (boardData: any) => Promise<any>;
}

const DashboardSidebar = ({ activeBoard, setActiveBoard, createBoard }: DashboardSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Array<{name: string, count: number}>>([]);
  const { items, boards, fetchTags } = useClipboardItems();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTags = async () => {
      const tagsData = await fetchTags();
      // Count items for each tag
      const tagCounts = tagsData.reduce((acc: Record<string, number>, tag) => {
        const count = items.filter(item => item.tags.includes(tag.name)).length;
        if (count > 0) {
          acc[tag.name] = count;
        }
        return acc;
      }, {});
      
      const tagsWithCounts = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
      }));
      
      setTags(tagsWithCounts);
    };
    
    if (items.length > 0) {
      loadTags();
    }
  }, [items, fetchTags]);

  const defaultBoards = [
    { 
      id: "all", 
      name: "All Clips", 
      count: items.length, 
      icon: Home 
    },
    { 
      id: "favorites", 
      name: "Favorites", 
      count: items.filter(item => item.is_favorite).length, 
      icon: Star 
    },
    { 
      id: "recent", 
      name: "Recent", 
      count: items.filter(item => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(item.created_at) > dayAgo;
      }).length, 
      icon: Clock 
    },
  ];

  const getItemCountForBoard = (boardId: string) => {
    return items.filter(item => item.board_id === boardId).length;
  };

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
            {defaultBoards.map((board) => {
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
            <AddBoardDialog createBoard={createBoard} />
          </div>
          <div className="space-y-1">
            {boards.filter(board => !board.is_default).map((board) => (
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
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: board.color }}
                  />
                  <span>{board.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    {getItemCountForBoard(board.id)}
                  </Badge>
                  <EditBoardDialog 
                    board={board}
                    trigger={
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    }
                  />
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
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;