CREATE INDEX idx_notification_target_id_sent_on ON openremote.notification(target_id, sent_on DESC);
ALTER TABLE notification ADD column IF NOT exists is_read BOOLEAN NOT NULL DEFAULT FALSE;
