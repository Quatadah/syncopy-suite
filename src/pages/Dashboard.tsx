import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SidebarSkeleton from "@/components/dashboard/SidebarSkeleton";
import { BoardProvider, useBoard } from "@/contexts/BoardContext";
import { useWorkspace, WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useWorkspace, WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { useSEO } from "@/hooks/useSEO";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardInner = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBoard, setActiveBoard } = useBoard();
  const { activeWorkspace, setActiveWorkspace, currentWorkspaceId } = useWorkspace();
  const { activeWorkspace, setActiveWorkspace, currentWorkspaceId } = useWorkspace();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // SEO optimization
  useSEO({
    title: `Dashboard - ${activeBoard?.name || 'All Items'} | Clippy`,
    description: `Manage your clipboard items with Clippy's powerful dashboard. Organize, search, and sync your clipboard content across all devices.`,
    url: "https://clippy.app/dashboard",
    noindex: true, // Dashboard is private, don't index
    nofollow: true
  });

  const {
    allItems,
    boards,
    workspaces,
    workspaces,
    loading,
    boardsLoading,
    workspacesLoading,
    workspacesLoading,
    createBoard,
    createWorkspace,
    createWorkspace,
    createItem,
    fetchTags,
    fetchAllItems,
    copyToClipboard,
    deleteItem,
    deleteItems,
    toggleFavorite,
    togglePin,
    updateItem,
  } = useClipboardItems(undefined, currentWorkspaceId || undefined);


  if (!user) {
    navigate('/auth');
    return null;
  }

  if (boardsLoading || workspacesLoading) {
    return (
      <div className="h-screen flex bg-background">
        <SidebarSkeleton isMobile={isMobile} />

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4 flex-1">
              {isMobile && <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />}
              <div className="flex-1 max-w-2xl h-10 bg-muted rounded-xl animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Toolbar Skeleton */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/30">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-48 h-10 bg-muted rounded-xl animate-pulse" />
              <div className="w-20 h-10 bg-muted rounded-xl animate-pulse" />
            </div>
            <div className="w-32 h-10 bg-muted rounded-xl animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 bg-muted rounded-lg animate-pulse" />
                    <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="w-full h-4 bg-muted rounded-lg animate-pulse" />
                  <div className="w-3/4 h-3 bg-muted rounded-lg animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-12 h-5 bg-muted rounded-full animate-pulse" />
                    <div className="w-16 h-5 bg-muted rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        activeBoard={activeBoard}
        setActiveBoard={setActiveBoard}
        createBoard={createBoard}
        createWorkspace={createWorkspace}
        createWorkspace={createWorkspace}
        items={allItems}
        boards={boards}
        workspaces={workspaces}
        workspaces={workspaces}
        fetchTags={fetchTags}
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <DashboardContent
        allItems={allItems}
        boards={boards}
        loading={loading}
        copyToClipboard={copyToClipboard}
        createItem={createItem}
        deleteItem={deleteItem}
        deleteItems={deleteItems}
        toggleFavorite={toggleFavorite}
        togglePin={togglePin}
        fetchTags={fetchTags}
        updateItem={updateItem}
        isSidebarCollapsed={isMobile ? false : isSidebarCollapsed}
        isMobile={isMobile}
        onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
    </div>
  );
});

const Dashboard = memo(() => {
  return (
    <WorkspaceProvider>
      <BoardProvider>
        <DashboardInner />
      </BoardProvider>
    </WorkspaceProvider>
      </BoardProvider>
    </WorkspaceProvider>
  );
});

export default Dashboard;