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
  activeBoard: string;
  setActiveBoard: (board: string) => void;
  createBoard: (boardData: any) => Promise<any>;
  items: any[];
  boards: any[];
  fetchTags: () => Promise<any[]>;
}

const DashboardSidebar = ({ activeBoard, setActiveBoard, createBoard, items, boards, fetchTags }: DashboardSidebarProps) => {
  const [tags, setTags] = useState<Array<{name: string, count: number}>>([]);
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
    <div className="w-72 bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col h-full shadow-xl backdrop-blur-sm">
      {/* Modern Header with Gradient Background */}
      <div className="relative px-6	 py-3 bg-gradient-to-r from-sidebar-accent/5 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-b-2xl"></div>
        <div className="relative flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300 ease-out"
          >
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-2 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"></div>
              <img 
                src={syncopyLogo} 
                alt="Syncopy Logo" 
                className="relative w-full h-full object-contain z-10"
              />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                Syncopy
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                <p className="text-xs text-sidebar-foreground/70 font-medium">Free plan</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main Navigation - Overview */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
            <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Overview</h3>
          </div>
          <div className="space-y-1">
            {defaultBoards.map((board) => {
              const Icon = board.icon;
              const isActive = activeBoard === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBoard(board.id);
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ease-out relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-semibold shadow-lg shadow-primary/10 border border-primary/20"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl"></div>
                  )}
                  <div className="relative flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive 
                        ? "bg-primary/20 text-primary" 
                        : "bg-sidebar-accent/50 text-sidebar-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {board.id === 'all' ? (
                        <HomeIcon className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium">{board.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isActive 
                        ? "bg-primary/20 text-primary border-primary/30" 
                        : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-primary/10 group-hover:text-primary"
                    )}
                  >
                    {board.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>


        {/* Custom Boards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full"></div>
              <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Boards</h3>
            </div>
            <AddBoardDialog createBoard={createBoard} />
          </div>
          <div className="space-y-1">
            {boards.filter(board => !board.is_default).map((board) => {
              const isActive = activeBoard === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBoard(board.id);
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ease-out relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-accent/10 to-primary/10 text-accent font-semibold shadow-lg shadow-accent/10 border border-accent/20"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 hover:shadow-md hover:scale-[1.02]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl"></div>
                  )}
                  <div className="relative flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive 
                        ? "bg-accent/20 text-accent" 
                        : "bg-sidebar-accent/50 text-sidebar-foreground group-hover:bg-accent/10 group-hover:text-accent"
                    )}>
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: board.color }}
                      />
                    </div>
                    <span className="font-medium">{board.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isActive 
                        ? "bg-accent/20 text-accent border-accent/30" 
                        : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-accent/10 group-hover:text-accent"
                    )}
                  >
                    {getItemCountForBoard(board.id)}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Tags</h3>
            </div>
            <div className="p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors duration-300">
              <FilterIcon className="w-4 h-4 text-sidebar-foreground/60" />
            </div>
          </div>
          <div className="space-y-1">
            {tags.map((tag) => (
              <button
                key={tag.name}
                className="group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-out"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-sidebar-accent/50 text-sidebar-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="font-medium">#{tag.name}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-semibold bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"
                >
                  {tag.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="relative px-4 bg-gradient-to-r from-sidebar-accent/5 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-2xl"></div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full justify-start px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-out group"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-full border-2 border-sidebar flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 font-medium">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 group-hover:text-primary transition-colors duration-300" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-72 bg-sidebar/95 backdrop-blur-xl border-sidebar-border/50 shadow-2xl" 
              align="start"
              side="top"
              sideOffset={12}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4 pb-4 ">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sidebar-foreground">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 font-medium">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-sidebar-accent/30 hover:to-sidebar-accent/10 hover:shadow-md hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-sidebar-accent/50 group-hover:bg-primary/10 transition-all duration-300">
                      <Settings className="w-4 h-4 text-sidebar-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-medium">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:shadow-md hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-all duration-300">
                      <User className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-sm font-medium text-destructive">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;