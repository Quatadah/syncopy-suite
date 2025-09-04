import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClipboardItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'link' | 'image' | 'code';
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

export const useClipboardItems = () => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = async (boardId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('clipboard_items')
        .select(`
          *,
          clipboard_item_tags!fk_clipboard_item_tags_clipboard_item (
            tags (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (boardId) {
        query = query.eq('board_id', boardId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedItems = data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type as 'text' | 'link' | 'image' | 'code',
        tags: item.clipboard_item_tags?.map((tag: any) => tag.tags.name) || [],
        is_pinned: item.is_pinned || false,
        is_favorite: item.is_favorite || false,
        board_id: item.board_id || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) || [];

      setItems(transformedItems);
    } catch (error: any) {
      toast({
        title: 'Error fetching items',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;
      setBoards(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching boards',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createBoard = async (boardData: Omit<Board, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({
          ...boardData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBoards();
      
      toast({
        title: 'Board created',
        description: 'Your new board has been created successfully.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating board',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBoards();
      
      toast({
        title: 'Board updated',
        description: 'Your board has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating board',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteBoard = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBoards();
      
      toast({
        title: 'Board deleted',
        description: 'Your board has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting board',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchTags = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      toast({
        title: 'Error fetching tags',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const createItem = async (itemData: Omit<ClipboardItem, 'id' | 'created_at' | 'updated_at' | 'tags'> & { tags?: string[] }) => {
    if (!user) return;

    try {
      const { tags, ...itemDataWithoutTags } = itemData;
      const { data, error } = await supabase
        .from('clipboard_items')
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
            .from('tags')
            .upsert({
              name: tagName,
              user_id: user.id,
            })
            .select()
            .single();

          if (!tagError && tagData) {
            // Link tag to item
            await supabase
              .from('clipboard_item_tags')
              .insert({
                clipboard_item_id: data.id,
                tag_id: tagData.id,
              });
          }
        }
      }

      await fetchItems();
      
      toast({
        title: 'Item created',
        description: 'Your clipboard item has been saved successfully.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<ClipboardItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clipboard_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchItems();
      
      toast({
        title: 'Item updated',
        description: 'Your clipboard item has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clipboard_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchItems();
      
      toast({
        title: 'Item deleted',
        description: 'Your clipboard item has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
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
        title: 'Copied to clipboard',
        description: 'Content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy content to clipboard.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
      fetchBoards();
    }
  }, [user]);

  return {
    items,
    boards,
    loading,
    fetchItems,
    fetchBoards,
    fetchTags,
    createItem,
    createBoard,
    updateItem,
    updateBoard,
    deleteItem,
    deleteBoard,
    togglePin,
    toggleFavorite,
    copyToClipboard,
  };
};