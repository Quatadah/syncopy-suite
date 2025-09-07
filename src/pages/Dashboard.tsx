import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { BoardProvider } from "@/contexts/BoardContext";
import { useAuth } from "@/hooks/useAuth";
import { useClipboardItems } from "@/hooks/useClipboardItems";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

const DashboardInner = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    allItems,
    boards,
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
      {/* Sidebar */}
      <DashboardSidebar
        createBoard={createBoard}
        items={allItems}
        boards={boards}
        fetchTags={fetchTags}
      />

      {/* Main Content */}
      <DashboardContent
        allItems={allItems}
        boards={boards}
        fetchTags={fetchTags}
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