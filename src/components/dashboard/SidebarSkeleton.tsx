import { cn } from "@/lib/utils";
import { Skeleton } from "@heroui/react";

interface SidebarSkeletonProps {
  isMobile?: boolean;
}

const SidebarSkeleton = ({ isMobile = false }: SidebarSkeletonProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col h-full shadow-xl backdrop-blur-sm",
      isMobile ? "fixed left-0 top-0 z-50 w-80" : "w-72"
    )}>
      {/* Header Skeleton */}
      <div className="py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-24 h-6 rounded-lg" />
              <Skeleton className="w-16 h-4 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      
      {/* Navigation Skeleton */}
      <div className="flex-1 px-6 space-y-6">
        {/* Overview Section */}
        <div className="space-y-3">
          <Skeleton className="w-20 h-4 rounded-lg" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-12 rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Boards Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-4 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="w-full h-12 rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="w-12 h-4 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      
      {/* User Profile Skeleton */}
      <div className="p-4">
        <Skeleton className="w-full h-16 rounded-xl" />
      </div>
    </div>
  );
};

export default SidebarSkeleton;
