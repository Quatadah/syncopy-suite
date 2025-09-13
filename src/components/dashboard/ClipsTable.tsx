import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Selection,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from "@heroui/react";
import { format } from "date-fns";
import {
  Calendar,
  Copy,
  Eye,
  Heart,
  MoreVertical,
  Pin,
  Search,
  Tag,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { typeColors, typeIcons } from "./constants";
import TextPreviewModal from "./TextPreviewModal";

interface ClipsTableProps {
  filteredItems: Array<{
    id: string;
    title: string;
    content: string;
    type: "text" | "link" | "image" | "code";
    tags: string[];
    is_pinned: boolean;
    is_favorite: boolean;
    created_at: string;
    timestamp: Date;
  }>;
  isSelectionMode: boolean;
  selectedItems: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onTogglePin: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onCopy: (itemId: string) => void;
  onQuickAdd: () => void;
  updateItem?: (id: string, updates: any) => Promise<void>;
  fetchTags?: () => Promise<any[]>;
  searchQuery?: string;
  highlightSearchTerm?: (text: string, searchTerm: string) => React.ReactNode;
  isLoading?: boolean;
}


const ClipsTable = ({
  filteredItems,
  isSelectionMode,
  selectedItems,
  onToggleSelection,
  onTogglePin,
  onToggleFavorite,
  onDelete,
  onCopy,
  onQuickAdd,
  updateItem,
  fetchTags,
  searchQuery,
  highlightSearchTerm,
  isLoading = false,
}: ClipsTableProps) => {
  const [sortDescriptor, setSortDescriptor] = useState<{column: string, direction: "ascending" | "descending"}>({
    column: "created_at",
    direction: "descending"
  });

  const [selectedItemForPreview, setSelectedItemForPreview] = useState<any>(null);
  const {
    isOpen: showTextPreview,
    onOpen: setShowTextPreview,
    onOpenChange: onTextPreviewChange,
  } = useDisclosure();

  // Convert selectedItems Set to Selection for HeroUI
  const heroUISelection: Selection = useMemo(() => {
    if (selectedItems.size === 0) return new Set([]);
    if (selectedItems.size === filteredItems.length) return "all";
    return selectedItems;
  }, [selectedItems, filteredItems.length]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      let cmp = 0;

      if (sortDescriptor.column === "created_at") {
        cmp = new Date(first as string).getTime() - new Date(second as string).getTime();
      } else if (typeof first === "string" && typeof second === "string") {
        cmp = first.localeCompare(second);
      } else if (typeof first === "boolean" && typeof second === "boolean") {
        cmp = (first ? 1 : 0) - (second ? 1 : 0);
      }

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      filteredItems.forEach(item => {
        if (!selectedItems.has(item.id)) {
          onToggleSelection(item.id);
        }
      });
    } else if (keys instanceof Set) {
      // Handle individual selections
      const newKeys = Array.from(keys);
      const currentKeys = Array.from(selectedItems);
      
      // Find items that were added
      const added = newKeys.filter(key => !currentKeys.includes(key as string));
      // Find items that were removed  
      const removed = currentKeys.filter(key => !newKeys.includes(key));
      
      added.forEach(key => onToggleSelection(key as string));
      removed.forEach(key => onToggleSelection(key));
    }
  };

  const handleSortChange = (descriptor: {column: string, direction: "ascending" | "descending"}) => {
    setSortDescriptor(descriptor);
  };

  const handleViewText = (item: any) => {
    setSelectedItemForPreview(item);
    setShowTextPreview();
  };

  const renderCell = (item: any, columnKey: string) => {
    switch (columnKey) {
      case "title":
        const IconComponent = typeIcons[item.type];
        return (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <IconComponent className="w-4 h-4 text-muted-foreground" />
              {item.is_pinned && <Pin className="w-3 h-3 text-primary fill-primary" />}
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {highlightSearchTerm ? highlightSearchTerm(item.title, searchQuery || "") : item.title}
                </span>
                {item.is_favorite && (
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {highlightSearchTerm ? highlightSearchTerm(item.content, searchQuery || "") : item.content}
              </span>
            </div>
          </div>
        );
      
      case "type":
        const TypeIcon = typeIcons[item.type];
        return (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 hover:scale-105 w-fit",
            typeColors[item.type]
          )}>
            <TypeIcon className="w-3.5 h-3.5" />
            {item.type}
          </div>
        );
      
       case "tags":
         return (
           <div className="flex flex-wrap gap-2 max-w-[200px]">
             {item.tags.length > 0 ? (
               item.tags.slice(0, 2).map((tag: string) => (
                 <Badge
                   key={tag}
                   variant="secondary"
                   className="text-xs px-3 py-1.5 bg-gradient-to-r from-secondary/60 to-secondary/40 hover:from-secondary/80 hover:to-secondary/60 transition-all duration-300 hover:scale-105 rounded-lg font-medium"
                 >
                   <Tag className="w-3 h-3 mr-1.5" />
                   {tag}
                 </Badge>
               ))
             ) : (
               <span className="text-xs text-muted-foreground">No tags</span>
             )}
             {item.tags.length > 2 && (
               <Badge variant="outline" className="text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-muted/50 transition-all duration-300 hover:scale-105">
                 +{item.tags.length - 2}
               </Badge>
             )}
           </div>
         );
      
      case "created_at":
        return (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(item.created_at), "MMM d, yyyy")}</span>
          </div>
        );
      
       case "actions":
         return (
           <div className="flex items-center space-x-1">
             <Dropdown>
               <DropdownTrigger>
                 <Button
                   size="sm"
                   variant="ghost"
                   className="h-10 w-10 p-0 hover:bg-background/90 cursor-pointer relative z-30 rounded-lg transition-all duration-400 hover:shadow-sm hover:scale-105"
                 >
                   <MoreVertical className="w-4 h-4 text-muted-foreground/70" />
                 </Button>
               </DropdownTrigger>
               <DropdownMenu aria-label="Clipboard item actions">
                 <DropdownItem
                   key="view"
                   startContent={<Eye className="w-4 h-4" />}
                   onPress={() => handleViewText(item)}
                 >
                   View Text
                 </DropdownItem>
                 <DropdownItem
                   key="copy"
                   startContent={<Copy className="w-4 h-4" />}
                   onPress={() => onCopy(item.id)}
                 >
                   Copy
                 </DropdownItem>
                 <DropdownItem
                   key="pin"
                   startContent={<Pin className="w-4 h-4" />}
                   onPress={() => onTogglePin(item.id)}
                 >
                   {item.is_pinned ? "Unpin" : "Pin"}
                 </DropdownItem>
                 <DropdownItem
                   key="delete"
                   className="text-danger"
                   color="danger"
                   startContent={<Trash2 className="w-4 h-4" />}
                   onPress={() => onDelete(item.id)}
                 >
                   Delete
                 </DropdownItem>
               </DropdownMenu>
             </Dropdown>
           </div>
         );
      
      default:
        return <span className="text-sm">{item[columnKey]}</span>;
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="w-full pt-2 overflow-x-auto">
        <div className="min-h-[400px] bg-gradient-to-br from-background/98 to-background/95 backdrop-blur-sm border border-border/20 rounded-xl p-4 min-w-[600px]">
          {/* Table Header Skeleton */}
          <div className="grid grid-cols-5 gap-4 mb-4 pb-4 border-b border-border/30">
            <Skeleton className="w-32 h-6 rounded-lg" />
            <Skeleton className="w-16 h-6 rounded-lg" />
            <Skeleton className="w-20 h-6 rounded-lg" />
            <Skeleton className="w-24 h-6 rounded-lg" />
            <Skeleton className="w-16 h-6 rounded-lg" />
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="w-3/4 h-4 rounded-lg" />
                    <Skeleton className="w-1/2 h-3 rounded-lg" />
                  </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="w-12 h-5 rounded-full" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <Skeleton className="w-20 h-4 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-16 h-16 bg-muted/60 rounded-2xl flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          No clips found
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {isSelectionMode
            ? "No clips match your current selection criteria."
            : "Start by adding your first clipboard item or adjust your search filters."}
        </p>
        {!isSelectionMode && (
          <Button onClick={onQuickAdd} size="lg">
            Add Your First Clip
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full pt-2 overflow-x-auto">
      <Table 
        aria-label="Clips table"
        selectionMode={isSelectionMode ? "multiple" : "none"}
        selectedKeys={heroUISelection}
        onSelectionChange={handleSelectionChange}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        classNames={{
          wrapper: "min-h-[400px] bg-gradient-to-br from-background/98 to-background/95 backdrop-blur-sm border border-border/20 hover:border-border/40 shadow-lg hover:shadow-primary/5 rounded-xl transition-all duration-500 ease-out min-w-[600px]",
          table: "bg-transparent",
          thead: "[&>tr]:first:shadow-none",
          th: "bg-gradient-to-br from-muted/60 to-muted/40 text-foreground font-medium border-b border-border/30 first:rounded-tl-lg last:rounded-tr-lg backdrop-blur-sm",
          td: "py-4 border-b border-border/10 bg-transparent",
          tr: "hover:bg-gradient-to-br hover:from-primary/3 hover:to-accent/3 transition-all duration-300 backdrop-blur-sm",
        }}
      >
        <TableHeader>
          <TableColumn key="title" allowsSorting>
            TITLE & CONTENT
          </TableColumn>
          <TableColumn key="type" allowsSorting>
            TYPE
          </TableColumn>
          <TableColumn key="tags">
            TAGS
          </TableColumn>
          <TableColumn key="created_at" allowsSorting>
            CREATED
          </TableColumn>
          <TableColumn key="actions">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Text preview modal */}
      {selectedItemForPreview && (
        <TextPreviewModal
          isOpen={showTextPreview}
          onOpenChange={onTextPreviewChange}
          content={selectedItemForPreview.content}
          title={selectedItemForPreview.title}
          type={selectedItemForPreview.type}
          onCopy={async (content: string) => {
            try {
              await navigator.clipboard.writeText(content);
            } catch (error) {
              console.error('Failed to copy:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default ClipsTable;
