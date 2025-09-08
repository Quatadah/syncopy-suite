import { HomeIcon } from "@/assets";
import FilterIcon from "@/assets/icons/FilterIcon";
import syncopyLogo from "@/assets/images/syncopy-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Clock,
  Settings,
  Star,
  Tag,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddBoardDialog from "./AddBoardDialog";

interface DashboardSidebarProps {
  createBoard: (boardData: any) => Promise<any>;
  items: any[];
  boards: any[];
  fetchTags: () => Promise<any[]>;
}

const DashboardSidebar = ({ createBoard, items, boards, fetchTags }: DashboardSidebarProps) => {
  const [tags, setTags] = useState<Array<{name: string, count: number}>>([]);
  const { activeBoard, setActiveBoard } = useBoard();
  const { user, signOut } = useAuth();
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
        count: count as number
      }));
      
      setTags(tagsWithCounts);
    };
    
    if (items.length > 0) {
      loadTags();
    }
  }, [items]);

  const defaultBoards = [
    { 
      id: "all", 
      name: "All Clips", 
      count: items.length, 
      icon: HomeIcon 
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
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full shadow-sm">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img 
                src={syncopyLogo} 
                alt="Syncopy Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-sidebar-foreground">
                Syncopy
              </h2>
              <p className="text-xs text-sidebar-foreground/60">Free plan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Main Navigation - Overview */}
        <div className="mb-8">
          <h3 className="text-xs font-thin text-muted-foreground mb-2">Overview</h3>
          <div>
            {defaultBoards.map((board) => {
              const Icon = board.icon;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBoard(board.id);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    activeBoard === board.id
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {board.id === 'all' ? (
                      <HomeIcon className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-thin text-muted-foreground">Boards</h3>
            <AddBoardDialog createBoard={createBoard} />
          </div>
          <div>
            {boards.filter(board => !board.is_default).map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveBoard(board.id);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
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
                <Badge variant="secondary" className="text-xs">
                  {getItemCountForBoard(board.id)}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-thin text-muted-foreground">Tags</h3>
            <FilterIcon className="w-4 h-4 text-sidebar-foreground/60" />
          </div>
          <div>
            {tags.map((tag) => (
              <button
                key={tag.name}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Tag className="w-4 h-4 text-sidebar-foreground" />
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

      {/* User Profile */}
      <div className="p-2 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-2"
            >
              <div className="flex items-center space-x-2 w-full">
                  <User className="w-4 h-4 text-sidebar-foreground" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 bg-sidebar border-sidebar-border" 
            align="start"
            side="top"
            sideOffset={8}
          >
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-sidebar-border">
                  <User className="w-5 h-5 text-sidebar-foreground" />
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 p-2 rounded-lg text-left transition-colors hover:bg-sidebar-accent/50 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={signOut}
                className="flex items-center space-x-2 p-2 rounded-lg text-left transition-colors hover:bg-sidebar-accent/50 cursor-pointer text-danger"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardSidebar;