-- SOURCE
ALTER TABLE openremote.source RENAME COLUMN create_by TO created_by;
ALTER TABLE openremote.source RENAME COLUMN update_date TO updated_at;
ALTER TABLE openremote.source RENAME COLUMN update_by TO updated_by;


-- CHANNEL
ALTER TABLE openremote.channel RENAME COLUMN created_date TO created_at;
ALTER TABLE openremote.channel RENAME COLUMN updated_date TO updated_at;

-- MICRO_IP_DEVICE
ALTER TABLE openremote.micro_ip_device
    RENAME COLUMN updated_date TO updated_at;

-- SCHEDULE_ASSET
ALTER TABLE openremote.schedule_asset RENAME COLUMN create_by TO created_by;
ALTER TABLE openremote.schedule_asset RENAME COLUMN created_date TO created_at;
ALTER TABLE openremote.schedule_asset RENAME COLUMN update_date TO updated_at;
ALTER TABLE openremote.schedule_asset RENAME COLUMN update_by TO updated_by;


-- SCHEDULE_HISTORY
ALTER TABLE openremote.schedule_history RENAME COLUMN create_date TO created_at;
ALTER TABLE openremote.schedule_history RENAME COLUMN create_by TO created_by;
ALTER TABLE openremote.schedule_history RENAME COLUMN update_date TO updated_at;
ALTER TABLE openremote.schedule_history RENAME COLUMN update_by TO updated_by;


-- SCHEDULE_CONTENT
ALTER TABLE openremote.schedule_content RENAME COLUMN create_date TO created_at;
ALTER TABLE openremote.schedule_content RENAME COLUMN create_by TO created_by;
ALTER TABLE openremote.schedule_content RENAME COLUMN update_date TO updated_at;
ALTER TABLE openremote.schedule_content RENAME COLUMN update_by TO updated_by;


-- SCHEDULE_HISTORY_CONTENT
ALTER TABLE openremote.schedule_history_content RENAME COLUMN create_date TO created_at;
ALTER TABLE openremote.schedule_history_content RENAME COLUMN create_by TO created_by;
ALTER TABLE openremote.schedule_history_content RENAME COLUMN update_date TO updated_at;
ALTER TABLE openremote.schedule_history_content RENAME COLUMN update_by TO updated_by;


-- SCHEDULE_INFO: sửa chính tả
ALTER TABLE openremote.schedule_info RENAME COLUMN reject_reasson TO reject_reason;

