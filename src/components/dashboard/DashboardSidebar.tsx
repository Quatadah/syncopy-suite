import { HomeIcon } from "@/assets";
import clippyLogo from "@/assets/images/clippy-logo.png";
import FilterIcon from "@/assets/icons/FilterIcon";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings,
  Star,
  Tag,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddBoardDialog from "./AddBoardDialog";
import WorkspaceSelector from "./WorkspaceSelector";

interface DashboardSidebarProps {
  activeBoard: string;
  setActiveBoard: (board: string) => void;
  createBoard: (boardData: any) => Promise<any>;
  createWorkspace: (workspaceData: any) => Promise<any>;
  items: any[];
  boards: any[];
  workspaces: any[];
  fetchTags: () => Promise<any[]>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const DashboardSidebar = ({ 
  activeBoard, 
  setActiveBoard, 
  createBoard, 
  createWorkspace,
  items, 
  boards, 
  workspaces,
  fetchTags, 
  isCollapsed, 
  onToggleCollapse,
  isMobile = false,
  isMobileOpen = false,
  onMobileClose
}: DashboardSidebarProps) => {
  const [tags, setTags] = useState<Array<{name: string, count: number}>>([]);
  const { user, signOut } = useAuth();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
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

  // Set default workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const defaultWorkspace = workspaces.find(w => w.is_default) || workspaces[0];
      if (defaultWorkspace) {
        setActiveWorkspace(defaultWorkspace.id);
      }
    }
  }, [workspaces, activeWorkspace, setActiveWorkspace]);

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
    <TooltipProvider>
      <div className={cn(
        "bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col h-full shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out",
        isMobile ? "fixed left-0 top-0 z-50 w-80 transform" : "relative",
        isMobile && !isMobileOpen ? "-translate-x-full" : "translate-x-0",
        !isMobile && isCollapsed ? "w-16" : !isMobile ? "w-72" : "w-80"
      )}>
      {/* Modern Header with Gradient Background */}
      <div className={cn(
        "relative py-3 bg-gradient-to-r from-sidebar-accent/5 to-transparent",
        isCollapsed && !isMobile ? "px-2" : "px-6"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => {
                  navigate('/dashboard');
                  if (isMobile && onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={cn(
                  "group flex items-center hover:scale-105 transition-all duration-300 ease-out",
                  (isCollapsed && !isMobile) ? "space-x-0 justify-center" : "space-x-3"
                )}
              >
                <div className={cn(
                  "relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 p-2 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300",
                  (isCollapsed && !isMobile) ? "w-10 h-10" : "w-14 h-14"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"></div>
                  <img 
                    src={clippyLogo} 
                    alt="Clippy Logo" 
                    className="relative w-full h-full object-contain z-10"
                  />
                </div>
                {!(isCollapsed && !isMobile) && (
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                      Clippy
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                      <p className="text-xs text-sidebar-foreground/70 font-medium">Free plan</p>
                    </div>
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Clippy Dashboard
            </TooltipContent>
          </Tooltip>
          
          {/* Toggle Button - Only show on desktop */}
          {!isMobile && (
            <>
              {!isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleCollapse}
                      className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Collapse sidebar
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleCollapse}
                      className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 hover:scale-105"
                    >
                      <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Expand sidebar
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {/* Mobile Close Button */}
          {isMobile && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="p-2 rounded-lg bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Workspace Selector */}
      <WorkspaceSelector
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
        onCreateWorkspace={createWorkspace}
        isCollapsed={isCollapsed && !isMobile}
      />

      {/* Navigation */}
      <div className={cn(
        "flex-1 overflow-y-auto space-y-6 transition-all duration-300",
        (isCollapsed && !isMobile) ? "p-2" : "p-6"
      )}>
        {/* Main Navigation - Overview */}
        <div className="space-y-3">
          {!(isCollapsed && !isMobile) && (
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
                    if (isMobile && onMobileClose) {
                      onMobileClose();
                    }
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between text-sm rounded-xl relative overflow-hidden",
                    "h-12 px-3 py-2.5", // Fixed height to prevent layout shifts
                    "transition-all duration-500 ease-out transform-gpu", // Smoother, longer animation
                    "border border-transparent", // Always have border to prevent layout shift
                    isActive
                      ? "bg-gradient-to-r from-primary/8 to-accent/8 text-primary font-semibold shadow-md shadow-primary/5 border-primary/15 scale-[1.02]"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] hover:border-sidebar-accent/20",
                    (isCollapsed && !isMobile) && "justify-center px-2"
                  )}
                >
                  {/* Background overlay for active state */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-primary/3 to-accent/3 rounded-xl transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0"
                  )}></div>
                  
                  <div className={cn(
                    "relative flex items-center transition-all duration-500 ease-out",
                    (isCollapsed && !isMobile) ? "space-x-0" : "space-x-3"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-500 ease-out transform-gpu",
                      isActive 
                        ? "bg-primary/15 text-primary scale-110" 
                        : "bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105"
                    )}>
                      {board.id === 'all' ? (
                        <HomeIcon className="w-4 h-4 transition-transform duration-300" />
                      ) : (
                        <Icon className="w-4 h-4 transition-transform duration-300" />
                      )}
                    </div>
                    {!(isCollapsed && !isMobile) && (
                      <>
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          isActive && "translate-x-1"
                        )}>{board.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs font-semibold transition-all duration-500 ease-out ml-auto",
                            isActive 
                              ? "bg-primary/15 text-primary border-primary/20 scale-105" 
                              : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105"
                          )}
                        >
                          {board.count}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed && !isMobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {board.name} ({board.count})
                  </TooltipContent>
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>


        {/* Custom Boards */}
        <div className="space-y-3">
          {!(isCollapsed && !isMobile) && (
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
                    if (isMobile && onMobileClose) {
                      onMobileClose();
                    }
                  }}
                  className={cn(
                    "group w-full flex items-center justify-between text-sm rounded-xl relative overflow-hidden",
                    "h-12 px-3 py-2.5", // Fixed height to prevent layout shifts
                    "transition-all duration-500 ease-out transform-gpu", // Smoother, longer animation
                    "border border-transparent", // Always have border to prevent layout shift
                    isActive
                      ? "bg-gradient-to-r from-accent/8 to-primary/8 text-accent font-semibold shadow-md shadow-accent/5 border-accent/15 scale-[1.02]"
                      : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] hover:border-sidebar-accent/20",
                    (isCollapsed && !isMobile) && "justify-center px-2"
                  )}
                >
                  {/* Background overlay for active state */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-accent/3 to-primary/3 rounded-xl transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0"
                  )}></div>
                  
                  <div className={cn(
                    "relative flex items-center transition-all duration-500 ease-out",
                    (isCollapsed && !isMobile) ? "space-x-0" : "space-x-3"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-500 ease-out transform-gpu",
                      isActive 
                        ? "bg-accent/15 text-accent scale-110" 
                        : "bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-accent/5 group-hover:text-accent group-hover:scale-105"
                    )}>
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm transition-all duration-300" 
                        style={{ backgroundColor: board.color }}
                      />
                    </div>
                    {!(isCollapsed && !isMobile) && (
                      <>
                        <span className={cn(
                          "font-medium transition-all duration-300",
                          isActive && "translate-x-1"
                        )}>{board.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs font-semibold transition-all duration-500 ease-out ml-auto",
                            isActive 
                              ? "bg-accent/15 text-accent border-accent/20 scale-105" 
                              : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-accent/5 group-hover:text-accent group-hover:scale-105"
                          )}
                        >
                          {getItemCountForBoard(board.id)}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed && !isMobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {board.name} ({getItemCountForBoard(board.id)})
                  </TooltipContent>
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          {!(isCollapsed && !isMobile) && (
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
                    "group w-full flex items-center justify-between text-sm rounded-xl relative overflow-hidden text-sidebar-foreground",
                    "h-12 px-3 py-2.5", // Fixed height to prevent layout shifts
                    "transition-all duration-500 ease-out transform-gpu", // Smoother, longer animation
                    "border border-transparent", // Always have border to prevent layout shift
                    "hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] hover:border-sidebar-accent/20",
                    (isCollapsed && !isMobile) && "justify-center px-2"
                  )}
                >
                  <div className={cn(
                    "flex items-center transition-all duration-500 ease-out",
                    (isCollapsed && !isMobile) ? "space-x-0" : "space-x-3"
                  )}>
                    <div className="p-2 rounded-lg bg-sidebar-accent/40 text-sidebar-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105 transition-all duration-500 ease-out transform-gpu">
                      <Tag className="w-4 h-4 transition-transform duration-300" />
                    </div>
                    {!(isCollapsed && !isMobile) && (
                      <>
                        <span className="font-medium transition-all duration-300">#{tag.name}</span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-semibold bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-primary/5 group-hover:text-primary group-hover:scale-105 transition-all duration-500 ease-out ml-auto"
                        >
                          {tag.count}
                        </Badge>
                      </>
                    )}
                  </div>
                </button>
              );

              return isCollapsed && !isMobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    #{tag.name} ({tag.count})
                  </TooltipContent>
                </Tooltip>
              ) : buttonContent;
            })}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className={cn(
        "relative bg-gradient-to-r from-sidebar-accent/5 to-transparent p-4",
        (isCollapsed && !isMobile) ? "px-2" : "px-4"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-sidebar-accent/20 hover:to-sidebar-accent/5 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 ease-out group",
                  (isCollapsed && !isMobile) ? "justify-center px-2" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex items-center w-full",
                  (isCollapsed && !isMobile) ? "space-x-0 justify-center" : "space-x-3"
                )}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-200">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-full border-2 border-sidebar flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  {!(isCollapsed && !isMobile) && (
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
    </TooltipProvider>
  );
};

export default DashboardSidebar;