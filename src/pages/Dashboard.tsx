import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  User,
  Bell,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ClipboardItem from "@/components/dashboard/ClipboardItem";
import AddItemDialog from "@/components/dashboard/AddItemDialog";
import { cn } from "@/lib/utils";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBoard, setActiveBoard] = useState('all');
  const { user, signOut } = useAuth();
  const { items, boards, loading, copyToClipboard } = useClipboardItems();

  const getFilteredItems = () => {
    let filtered = items;

    // Filter by board
    if (activeBoard === 'favorites') {
      filtered = filtered.filter(item => item.is_favorite);
    } else if (activeBoard === 'recent') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => new Date(item.created_at) > dayAgo);
    } else if (activeBoard !== 'all') {
      filtered = filtered.filter(item => item.board_id === activeBoard);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  const getBoardName = () => {
    if (activeBoard === 'all') return 'All Clips';
    if (activeBoard === 'favorites') return 'Favorites';
    if (activeBoard === 'recent') return 'Recent';
    
    // Find custom board name from boards state
    const board = boards.find(b => b.id === activeBoard);
    return board?.name || 'All Clips';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your clips...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <DashboardSidebar 
        activeBoard={activeBoard}
        setActiveBoard={setActiveBoard}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-xl font-semibold">{getBoardName()}</h1>
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clips..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={view === 'grid' ? 'default' : 'ghost'}
                onClick={() => setView('grid')}
                className="h-7 px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={view === 'list' ? 'default' : 'ghost'}
                onClick={() => setView('list')}
                className="h-7 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Filter */}
            <Button size="sm" variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            {/* Add New */}
            <AddItemDialog />
            
            {/* Notifications */}
            <Button size="sm" variant="ghost">
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No clips found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery ? 
                  `No clips match "${searchQuery}". Try adjusting your search terms.` :
                  "You don't have any clipboard items yet. Start by adding your first clip!"
                }
              </p>
              <AddItemDialog 
                trigger={
                  <Button className="bg-gradient-hero text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Clip
                  </Button>
                }
              />
            </div>
          ) : (
            <div className={cn(
              view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-3"
            )}>
              {filteredItems.map((item) => (
                <ClipboardItem 
                  key={item.id} 
                  item={{
                    ...item,
                    isPinned: item.is_pinned,
                    isFavorite: item.is_favorite,
                    createdAt: item.created_at,
                  }} 
                  view={view}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;