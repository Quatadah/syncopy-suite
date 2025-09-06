import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "./useAuth";

export interface ClipboardItem {
  id: string;
  title: string;
  content: string;
  type: "text" | "link" | "image" | "code";
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  board_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

// Global request cache to prevent duplicate requests
const requestCache = new Map<string, Promise<any>>();

export const useClipboardItems = (currentBoardId?: string) => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [allItems, setAllItems] = useState<ClipboardItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = async (
    boardId?: string,
    page: number = currentPage,
    size: number = pageSize
  ) => {
    if (!user) return;

    // Create a unique cache key for this request
    const cacheKey = `items-${user.id}-${boardId || "all"}-${page}-${size}`;

    // If there's already a pending request with the same parameters, return it
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    setLoading(true);

    const requestPromise = (async () => {
      try {
        const from = (page - 1) * size;
        const to = from + size - 1;

        let query = supabase
          .from("clipboard_items")
          .select(
            `
            *,
            clipboard_item_tags!fk_clipboard_item_tags_clipboard_item (
              tags (
                name
              )
            )
          `,
            { count: "exact" }
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (boardId) {
          query = query.eq("board_id", boardId);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const transformedItems =
          data?.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            type: item.type as "text" | "link" | "image" | "code",
            tags:
              item.clipboard_item_tags?.map((tag: any) => tag.tags.name) || [],
            is_pinned: item.is_pinned || false,
            is_favorite: item.is_favorite || false,
            board_id: item.board_id || undefined,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })) || [];

        setItems(transformedItems);
        setTotalCount(count || 0);

        // Remove from cache after successful completion
        requestCache.delete(cacheKey);

        return { transformedItems, count };
      } catch (error: any) {
        // Remove from cache on error
        requestCache.delete(cacheKey);
        toast({
          title: "Error fetching items",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    })();

    // Store the promise in cache
    requestCache.set(cacheKey, requestPromise);

    return requestPromise;
  };

  const fetchAllItems = async () => {
    if (!user) return;

    const cacheKey = `all-items-${user.id}`;

    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("clipboard_items")
          .select(
            `
            *,
            clipboard_item_tags!fk_clipboard_item_tags_clipboard_item (
              tags (
                name
              )
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformedItems =
          data?.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            type: item.type as "text" | "link" | "image" | "code",
            tags:
              item.clipboard_item_tags?.map((tag: any) => tag.tags.name) || [],
            is_pinned: item.is_pinned || false,
            is_favorite: item.is_favorite || false,
            board_id: item.board_id || undefined,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })) || [];

        setAllItems(transformedItems);

        requestCache.delete(cacheKey);
        return transformedItems;
      } catch (error: any) {
        requestCache.delete(cacheKey);
        toast({
          title: "Error fetching all items",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  };

  const fetchBoards = async () => {
    if (!user) return;

    const cacheKey = `boards-${user.id}`;

    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("boards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");

        if (error) throw error;
        setBoards(data || []);

        requestCache.delete(cacheKey);
        return data;
      } catch (error: any) {
        requestCache.delete(cacheKey);
        toast({
          title: "Error fetching boards",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  };

  const createBoard = async (boardData: Omit<Board, "id" | "created_at">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("boards")
        .insert({
          ...boardData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBoards();

      toast({
        title: "Board created",
        description: "Your new board has been created successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error creating board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("boards")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchBoards();

      toast({
        title: "Board updated",
        description: "Your board has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBoard = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("boards")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchBoards();

      toast({
        title: "Board deleted",
        description: "Your board has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting board",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTags = useCallback(async () => {
    if (!user) return [];

    const cacheKey = `tags-${user.id}`;

    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .eq("user_id", user.id)
          .order("name");

        if (error) throw error;

        requestCache.delete(cacheKey);
        return data || [];
      } catch (error: any) {
        requestCache.delete(cacheKey);
        toast({
          title: "Error fetching tags",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  }, [user, toast]);

  const createItem = async (
    itemData: Omit<
      ClipboardItem,
      "id" | "created_at" | "updated_at" | "tags"
    > & { tags?: string[] }
  ) => {
    if (!user) return;

    try {
      const { tags, ...itemDataWithoutTags } = itemData;
      const { data, error } = await supabase
        .from("clipboard_items")
        .insert({
          ...itemDataWithoutTags,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Handle tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Create or get tag
          const { data: tagData, error: tagError } = await supabase
            .from("tags")
            .upsert({
              name: tagName,
              user_id: user.id,
            })
            .select()
            .single();

          if (!tagError && tagData) {
            // Link tag to item
            await supabase.from("clipboard_item_tags").insert({
              clipboard_item_id: data.id,
              tag_id: tagData.id,
            });
          }
        }
      }

      await fetchItems(currentBoardId, currentPage, pageSize);
      await fetchAllItems();

      toast({
        title: "Item created",
        description: "Your clipboard item has been saved successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error creating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<ClipboardItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("clipboard_items")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchItems(currentBoardId, currentPage, pageSize);
      await fetchAllItems();

      toast({
        title: "Item updated",
        description: "Your clipboard item has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("clipboard_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchItems(currentBoardId, currentPage, pageSize);
      await fetchAllItems();

      toast({
        title: "Item deleted",
        description: "Your clipboard item has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItems = async (ids: string[]) => {
    if (!user || ids.length === 0) return;

    try {
      const { error } = await supabase
        .from("clipboard_items")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchItems(currentBoardId, currentPage, pageSize);
      await fetchAllItems();

      toast({
        title: "Items deleted",
        description: `${ids.length} clipboard item${
          ids.length > 1 ? "s" : ""
        } deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting items",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await updateItem(id, { is_pinned: !isPinned });
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    await updateItem(id, { is_favorite: !isFavorite });
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchItems(currentBoardId, page, pageSize);
    },
    [currentBoardId, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
      fetchItems(currentBoardId, 1, size);
    },
    [currentBoardId]
  );

  useEffect(() => {
    if (user) {
      fetchItems(currentBoardId, 1, pageSize);
      fetchAllItems();
      fetchBoards();
    }
  }, [user, currentBoardId]);

  return {
    items,
    allItems,
    boards,
    loading,
    currentPage,
    pageSize,
    totalCount,
    fetchItems,
    fetchAllItems,
    fetchBoards,
    fetchTags,
    createItem,
    createBoard,
    updateItem,
    updateBoard,
    deleteItem,
    deleteItems,
    deleteBoard,
    togglePin,
    toggleFavorite,
    copyToClipboard,
    handlePageChange,
    handlePageSizeChange,
  };
};
