import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  User,
  Bell,
  Settings
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
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app this would come from Supabase
  const clipboardItems = [
    {
      id: '1',
      title: 'Meeting Notes - Q4 Planning',
      content: 'Key takeaways from the Q4 planning meeting: 1. Focus on user retention 2. New feature rollout in December 3. Team expansion in January...',
      type: 'text' as const,
      tags: ['meeting', 'planning', 'q4'],
      isPinned: true,
      isFavorite: false,
      createdAt: '2024-01-20T10:30:00Z',
    },
    {
      id: '2',
      title: 'API Documentation Link',
      content: 'https://docs.supabase.com/reference/javascript/auth-signup',
      type: 'link' as const,
      tags: ['dev', 'supabase', 'auth'],
      isPinned: false,
      isFavorite: true,
      createdAt: '2024-01-20T09:15:00Z',
    },
    {
      id: '3',
      title: 'React Component Code',
      content: 'const ClipboardItem = ({ item }) => {\n  return (\n    <div className="p-4 border rounded">\n      {item.content}\n    </div>\n  );\n};',
      type: 'code' as const,
      tags: ['react', 'component', 'frontend'],
      isPinned: false,
      isFavorite: false,
      createdAt: '2024-01-20T08:45:00Z',
    },
    {
      id: '4',
      title: 'Design Inspiration Screenshot',
      content: 'Screenshot of beautiful dashboard design from Linear.app',
      type: 'image' as const,
      tags: ['design', 'inspiration', 'ui'],
      isPinned: false,
      isFavorite: true,
      createdAt: '2024-01-19T16:20:00Z',
    },
    {
      id: '5',
      title: 'Email Draft - Client Follow-up',
      content: 'Hi Sarah, Thank you for the productive meeting yesterday. I wanted to follow up on the key points we discussed...',
      type: 'text' as const,
      tags: ['email', 'client', 'followup'],
      isPinned: false,
      isFavorite: false,
      createdAt: '2024-01-19T14:10:00Z',
    },
    {
      id: '6',
      title: 'Terminal Command',
      content: 'npm install @supabase/supabase-js && npm install @tanstack/react-query',
      type: 'code' as const,
      tags: ['terminal', 'npm', 'install'],
      isPinned: false,
      isFavorite: false,
      createdAt: '2024-01-19T11:30:00Z',
    },
  ];

  const filteredItems = clipboardItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-xl font-semibold">All Clips</h1>
            
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
            <Button size="sm" className="bg-gradient-hero text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Clip
            </Button>
            
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
                <DropdownMenuItem>
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
              <Button className="bg-gradient-hero text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Clip
              </Button>
            </div>
          ) : (
            <div className={cn(
              view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-3"
            )}>
              {filteredItems.map((item) => (
                <ClipboardItem key={item.id} item={item} view={view} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;