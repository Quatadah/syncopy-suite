import { HomeIcon } from "@/assets";
import FilterIcon from "@/assets/icons/FilterIcon";
import syncopyLogo from "@/assets/images/syncopy-logo.png";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Tooltip } from "@heroui/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const DashboardSidebar = ({ activeBoard, setActiveBoard, createBoard, items, boards, fetchTags, isCollapsed, onToggleCollapse }: DashboardSidebarProps) => {
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
      <div className={cn(
        "bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col h-full shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}>
      {/* Modern Header with Gradient Background */}
      <div className={cn(
        "relative py-3 bg-gradient-to-r from-sidebar-accent/5 to-transparent",
        isCollapsed ? "px-2" : "px-6"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative flex items-center justify-between">
          <Tooltip 
            content="Syncopy Dashboard"
            placement="right"
            isDisabled={!isCollapsed}
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className={cn(
                "group flex items-center hover:scale-105 transition-all duration-300 ease-out",
                isCollapsed ? "space-x-0 justify-center" : "space-x-3"
              )}
            >
              <div className={cn(
                "relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-2 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300",
                isCollapsed ? "w-10 h-10" : "w-14 h-14"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"></div>
                <img 
                  src={syncopyLogo} 
                  alt="Syncopy Logo" 
                  className="relative w-full h-full object-contain z-10"
                />
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <h2 className="text-xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                    Syncopy
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                    <p className="text-xs text-sidebar-foreground/70 font-medium">Free plan</p>
                  </div>
                </div>
              )}
            </button>
          </Tooltip>
          
          {/* Toggle Button */}
          {!isCollapsed ? (
            <Tooltip 
              content="Collapse sidebar"
              placement="right"
            >

            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 hover:scale-105"
            >
                <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip 
              content="Expand sidebar"
              placement="right"
            >
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={cn(
        "flex-1 overflow-y-auto space-y-6 transition-all duration-300",
        isCollapsed ? "p-2" : "p-6"
      )}>
        {/* Main Navigation - Overview */}
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Overview</h3>
            </div>
          )}
          <div className="space-y-1">
            {defaultBoards.map((board) => {
              const Icon = board.icon;
              const isActive = activeBoard === board.id;
              const buttonContent = (
                <button
                  key={board.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBoard(board.id);
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ease-out relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary/8 to-accent/8 text-primary font-semibold shadow-md shadow-primary/5 border border-primary/15"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01]",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-accent/3 rounded-xl"></div>
                  )}
                  <div className={cn(
                    "relative flex items-center transition-all duration-200",
                    isCollapsed ? "space-x-0" : "space-x-3"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-primary/15 text-primary" 
                        : "bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                      {board.id === 'all' ? (
                        <HomeIcon className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium">{board.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs font-semibold transition-all duration-200",
                            isActive 
                              ? "bg-primary/15 text-primary border-primary/20" 
                              : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-primary/5 group-hover:text-primary"
                          )}
                        >
                          {board.count}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed ? (
                <Tooltip 
                  key={board.id}
                  content={`${board.name} (${board.count})`}
                  placement="right"
                >
                  {buttonContent}
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>


        {/* Custom Boards */}
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full"></div>
                <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Boards</h3>
              </div>
              <AddBoardDialog createBoard={createBoard} />
            </div>
          )}
          <div className="space-y-1">
            {boards.filter(board => !board.is_default).map((board) => {
              const isActive = activeBoard === board.id;
              const buttonContent = (
                <button
                  key={board.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveBoard(board.id);
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ease-out relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-accent/8 to-primary/8 text-accent font-semibold shadow-md shadow-accent/5 border border-accent/15"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01]",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/3 to-primary/3 rounded-xl"></div>
                  )}
                  <div className={cn(
                    "relative flex items-center transition-all duration-200",
                    isCollapsed ? "space-x-0" : "space-x-3"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-accent/15 text-accent" 
                        : "bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-accent/5 group-hover:text-accent"
                    )}>
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: board.color }}
                      />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium">{board.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs font-semibold transition-all duration-200",
                            isActive 
                              ? "bg-accent/15 text-accent border-accent/20" 
                              : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-accent/5 group-hover:text-accent"
                          )}
                        >
                          {getItemCountForBoard(board.id)}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed ? (
                <Tooltip 
                  key={board.id}
                  content={`${board.name} (${getItemCountForBoard(board.id)})`}
                  placement="right"
                >
                  {buttonContent}
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <h3 className="text-sm font-semibold text-sidebar-foreground/80 tracking-wide uppercase">Tags</h3>
              </div>
              <div className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-colors duration-200">
                <FilterIcon className="w-4 h-4 text-sidebar-foreground/60" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            {tags.map((tag) => {
              const buttonContent = (
                <button
                  key={tag.name}
                  className={cn(
                    "group w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 ease-out",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className={cn(
                    "flex items-center transition-all duration-200",
                    isCollapsed ? "space-x-0" : "space-x-3"
                  )}>
                    <div className="p-2 rounded-lg bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all duration-200">
                      <Tag className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium">#{tag.name}</span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-semibold bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-200"
                        >
                          {tag.count}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed ? (
                <Tooltip 
                  key={tag.name}
                  content={`#${tag.name} (${tag.count})`}
                  placement="right"
                >
                  {buttonContent}
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className={cn(
        "relative bg-gradient-to-r from-sidebar-accent/5 to-transparent p-4",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 ease-out group",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex items-center w-full",
                  isCollapsed ? "space-x-0 justify-center" : "space-x-3"
                )}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-200">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-full border-2 border-sidebar flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-sidebar-foreground/70 font-medium">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 group-hover:text-primary transition-colors duration-300" />
                    </>
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-72 bg-sidebar/95 backdrop-blur-xl border-sidebar-border/50 shadow-2xl" 
              align="start"
              side="top"
              sideOffset={12}
            >
              <div className="p-2">
                <div className="flex items-center space-x-3 pb-4 border-b border-sidebar-border/30">
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
                <div className="space-y-1 pt-2">
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-sidebar-accent/40 group-hover:bg-primary/5 transition-all duration-200">
                      <Settings className="w-4 h-4 text-sidebar-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-medium text-sidebar-foreground group-hover:text-primary">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 hover:bg-destructive/10 hover:shadow-sm cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-destructive/5 group-hover:bg-destructive/10 transition-all duration-200">
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