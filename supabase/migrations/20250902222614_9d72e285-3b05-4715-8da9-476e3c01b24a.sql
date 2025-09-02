-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create boards table for organizing clips
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clipboard_items table
CREATE TABLE public.clipboard_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.boards(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'link', 'image', 'code')),
  preview TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create clipboard_item_tags junction table
CREATE TABLE public.clipboard_item_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clipboard_item_id UUID NOT NULL REFERENCES public.clipboard_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clipboard_item_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clipboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clipboard_item_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for boards
CREATE POLICY "Users can view their own boards" ON public.boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON public.boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON public.boards
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for clipboard_items
CREATE POLICY "Users can view their own clipboard items" ON public.clipboard_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clipboard items" ON public.clipboard_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clipboard items" ON public.clipboard_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clipboard items" ON public.clipboard_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for clipboard_item_tags
CREATE POLICY "Users can view their own clipboard item tags" ON public.clipboard_item_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clipboard_items ci 
      WHERE ci.id = clipboard_item_tags.clipboard_item_id 
      AND ci.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own clipboard item tags" ON public.clipboard_item_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clipboard_items ci 
      WHERE ci.id = clipboard_item_tags.clipboard_item_id 
      AND ci.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own clipboard item tags" ON public.clipboard_item_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clipboard_items ci 
      WHERE ci.id = clipboard_item_tags.clipboard_item_id 
      AND ci.user_id = auth.uid()
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default board
  INSERT INTO public.boards (user_id, name, description, is_default)
  VALUES (NEW.id, 'All Clips', 'Your default clipboard board', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clipboard_items_updated_at
  BEFORE UPDATE ON public.clipboard_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_clipboard_items_user_id ON public.clipboard_items(user_id);
CREATE INDEX idx_clipboard_items_board_id ON public.clipboard_items(board_id);
CREATE INDEX idx_clipboard_items_type ON public.clipboard_items(type);
CREATE INDEX idx_clipboard_items_is_pinned ON public.clipboard_items(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_clipboard_items_is_favorite ON public.clipboard_items(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_clipboard_items_created_at ON public.clipboard_items(created_at DESC);
CREATE INDEX idx_boards_user_id ON public.boards(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);