-- Clean up any existing foreign key constraints for clipboard_item_tags
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Drop any existing foreign key constraints on clipboard_item_tags
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'clipboard_item_tags' 
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE clipboard_item_tags DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Add proper foreign key constraints
ALTER TABLE clipboard_item_tags 
ADD CONSTRAINT fk_clipboard_item_tags_clipboard_item 
FOREIGN KEY (clipboard_item_id) 
REFERENCES clipboard_items(id) 
ON DELETE CASCADE;

ALTER TABLE clipboard_item_tags 
ADD CONSTRAINT fk_clipboard_item_tags_tag 
FOREIGN KEY (tag_id) 
REFERENCES tags(id) 
ON DELETE CASCADE;