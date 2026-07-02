ALTER TABLE conversations
  ADD COLUMN visibility VARCHAR(10) NOT NULL DEFAULT 'public';

CREATE INDEX idx_conversations_visibility ON conversations(visibility);
