-- Fix security warnings by setting proper search paths

-- Update handle_new_user function with search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default board
  INSERT INTO public.boards (user_id, name, description, is_default)
  VALUES (NEW.id, 'All Clips', 'Your default clipboard board', true);
  
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function with search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;