ALTER TABLE openremote.micro_ip_device
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.channel
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.source
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.live_stream_channel
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.area
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.folder
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.playlist
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.content
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.schedule_asset
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.schedule_history
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.schedule_content
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.schedule_content_type
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE openremote.schedule_history_content
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
