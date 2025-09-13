import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { BoardProvider, useBoard } from "@/contexts/BoardContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
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
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading boards...</span>
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