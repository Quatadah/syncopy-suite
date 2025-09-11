import { supabase } from "@/integrations/supabase/client";
import { addToast } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

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

    const requestPromise = (async () => {
      try {
        const from = (page - 1) * size;
        const to = from + size - 1;

        let query = supabase
          .from("clipboard_items")
          .select(
            `
            *,
            clipboard_item_tags (
              tags (
                name
              )
            )
          `,
            { count: "exact" }
          )
          .eq("user_id", user.id)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (boardId) {
          query = query.eq("board_id", boardId);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const transformedItems =
          data?.map((item) => {
            console.log("Raw item data:", item);
            console.log("clipboard_item_tags:", item.clipboard_item_tags);
            return {
              id: item.id,
              title: item.title,
              content: item.content,
              type: item.type as "text" | "link" | "image" | "code",
              tags:
                item.clipboard_item_tags?.map((tag: any) => tag.tags.name) ||
                [],
              is_pinned: item.is_pinned || false,
              is_favorite: item.is_favorite || false,
              board_id: item.board_id || undefined,
              created_at: item.created_at,
              updated_at: item.updated_at,
            };
          }) || [];

        setItems(transformedItems);
        setTotalCount(count || 0);

        // Remove from cache after successful completion
        requestCache.delete(cacheKey);

        return { transformedItems, count };
      } catch (error: any) {
        // Remove from cache on error
        requestCache.delete(cacheKey);
        addToast({
          title: "Error fetching items",
          description: error.message,
          color: "danger",
          variant: "solid",
          timeout: 5000,
        });
        throw error;
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
            clipboard_item_tags (
              tags (
                name
              )
            )
          `
          )
          .eq("user_id", user.id)
          .order("is_pinned", { ascending: false })
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
        addToast({
          title: "Error fetching all items",
          description: error.message,
          color: "danger",
          variant: "solid",
          timeout: 5000,
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

    setBoardsLoading(true);
    const requestPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("boards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at");

        if (error) throw error;
        setBoards(data || []);
        setBoardsLoading(false);

        requestCache.delete(cacheKey);
        return data;
      } catch (error: any) {
        setBoardsLoading(false);
        requestCache.delete(cacheKey);
        addToast({
          title: "Error fetching boards",
          description: error.message,
          color: "danger",
          variant: "solid",
          timeout: 5000,
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

      addToast({
        title: "Board created",
        description: "Your new board has been created successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });

      return data;
    } catch (error: any) {
      addToast({
        title: "Error creating board",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
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

      addToast({
        title: "Board updated",
        description: "Your board has been updated successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error: any) {
      addToast({
        title: "Error updating board",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
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

      addToast({
        title: "Board deleted",
        description: "Your board has been deleted successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error: any) {
      addToast({
        title: "Error deleting board",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
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
        addToast({
          title: "Error fetching tags",
          description: error.message,
          color: "danger",
          variant: "solid",
          timeout: 5000,
        });
        return [];
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  }, [user]);

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

      addToast({
        title: "Item created",
        description: "Your clipboard item has been saved successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });

      return data;
    } catch (error: any) {
      addToast({
        title: "Error creating item",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const updateItem = async (
    id: string,
    updates: Partial<ClipboardItem> & { tags?: string[] }
  ) => {
    if (!user) return;

    try {
      const { tags, ...itemUpdates } = updates;

      // Update the item itself
      const { error } = await supabase
        .from("clipboard_items")
        .update(itemUpdates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Handle tags if provided
      if (tags !== undefined) {
        console.log("Processing tags for item:", id, tags);

        // First, remove all existing tag associations
        const { error: deleteError } = await supabase
          .from("clipboard_item_tags")
          .delete()
          .eq("clipboard_item_id", id);

        if (deleteError) {
          console.error("Error deleting existing tags:", deleteError);
        } else {
          console.log("Successfully deleted existing tags for item:", id);
        }

        // Then add new tag associations
        if (tags.length > 0) {
          for (const tagName of tags) {
            console.log("Processing tag:", tagName);

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
              console.log("Tag created/found:", tagData);

              // Link tag to item
              const { error: linkError } = await supabase
                .from("clipboard_item_tags")
                .insert({
                  clipboard_item_id: id,
                  tag_id: tagData.id,
                });

              if (linkError && linkError.code !== "23505") {
                // 23505 is unique constraint violation (duplicate)
                console.error("Error linking tag to item:", linkError);
              } else if (linkError && linkError.code === "23505") {
                console.log("Tag already linked to item (duplicate):", tagName);
              } else {
                console.log("Successfully linked tag to item:", tagName);
              }
            } else if (tagError) {
              console.error("Error creating/getting tag:", tagError);
            }
          }
        }
      }

      // Clear cache before fetching updated data
      const allItemsCacheKey = `all-items-${user.id}`;
      const itemsCacheKey = `items-${user.id}-${
        currentBoardId || "all"
      }-${currentPage}-${pageSize}`;
      requestCache.delete(allItemsCacheKey);
      requestCache.delete(itemsCacheKey);

      await fetchItems(currentBoardId, currentPage, pageSize);
      await fetchAllItems();

      addToast({
        title: "Item updated",
        description: "Your clipboard item has been updated successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error: any) {
      addToast({
        title: "Error updating item",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
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

      addToast({
        title: "Item deleted",
        description: "Your clipboard item has been deleted successfully.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error: any) {
      addToast({
        title: "Error deleting item",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
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

      addToast({
        title: "Items deleted",
        description: `${ids.length} clipboard item${
          ids.length > 1 ? "s" : ""
        } deleted successfully.`,
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error: any) {
      addToast({
        title: "Error deleting items",
        description: error.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    console.log("togglePin", id, isPinned);
    await updateItem(id, { is_pinned: isPinned });
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    await updateItem(id, { is_favorite: isFavorite });
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addToast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
    } catch (error) {
      addToast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        color: "danger",
        variant: "solid",
        timeout: 5000,
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

  // Fetch boards only when user changes
  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  // Fetch items when user or currentBoardId changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Use Promise.all to wait for both operations to complete
      Promise.all([
        fetchItems(currentBoardId, 1, pageSize),
        fetchAllItems(),
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      // If no user, set loading to false and clear data
      setLoading(false);
      setItems([]);
      setAllItems([]);
    }
  }, [user, currentBoardId]);

  // Ensure data is fetched on mount if user is already available
  useEffect(() => {
    if (user && allItems.length === 0 && !loading) {
      setLoading(true);
      Promise.all([
        fetchItems(currentBoardId, 1, pageSize),
        fetchAllItems(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    items,
    allItems,
    boards,
    loading,
    boardsLoading,
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
