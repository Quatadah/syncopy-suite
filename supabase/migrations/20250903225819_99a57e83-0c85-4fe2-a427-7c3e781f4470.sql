-- Add foreign key constraints that were missing
ALTER TABLE clipboard_item_tags 
ADD CONSTRAINT fk_clipboard_item_tags_item 
FOREIGN KEY (clipboard_item_id) REFERENCES clipboard_items(id) ON DELETE CASCADE;

ALTER TABLE clipboard_item_tags 
ADD CONSTRAINT fk_clipboard_item_tags_tag 
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

ALTER TABLE clipboard_items 
ADD CONSTRAINT fk_clipboard_items_board 
FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL;