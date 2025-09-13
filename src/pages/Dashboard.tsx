import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SidebarSkeleton from "@/components/dashboard/SidebarSkeleton";
import { BoardProvider, useBoard } from "@/contexts/BoardContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { Skeleton } from "@heroui/react";
import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardInner = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBoard, setActiveBoard } = useBoard();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    allItems,
    boards,
    loading,
    boardsLoading,
    createBoard,
    createItem,
    fetchTags,
    fetchAllItems,
    copyToClipboard,
    deleteItem,
    deleteItems,
    toggleFavorite,
    togglePin,
    updateItem,
  } = useClipboardItems();


  if (!user) {
    navigate('/auth');
    return null;
  }

  if (boardsLoading) {
    return (
      <div className="h-screen flex bg-background">
        <SidebarSkeleton isMobile={isMobile} />

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4 flex-1">
              {isMobile && <Skeleton className="w-8 h-8 rounded-lg" />}
              <Skeleton className="flex-1 max-w-2xl h-10 rounded-xl" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>

          {/* Toolbar Skeleton */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/30">
            <div className="flex items-center gap-3 md:gap-6">
              <Skeleton className="w-48 h-10 rounded-xl" />
              <Skeleton className="w-20 h-10 rounded-xl" />
            </div>
            <Skeleton className="w-32 h-10 rounded-xl" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-6 h-6 rounded-lg" />
                    <Skeleton className="w-4 h-4 rounded-full" />
                  </div>
                  <Skeleton className="w-full h-4 rounded-lg" />
                  <Skeleton className="w-3/4 h-3 rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="w-12 h-5 rounded-full" />
                    <Skeleton className="w-16 h-5 rounded-full" />
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
        items={allItems}
        boards={boards}
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
    <BoardProvider>
      <DashboardInner />
    </BoardProvider>
  );
});

export default Dashboard;