CREATE TABLE micro_ip_device (
                                 id VARCHAR(36) PRIMARY KEY,
                                 device_code VARCHAR(50) UNIQUE,        -- Mã thiết bị
                                 device_name VARCHAR(100),               -- Tên thiết bị
                                 is_locked BOOLEAN,                      -- Tạm khóa
                                 area_id BIGINT,                         -- Khu vực / phân vùng
                                 realm_id VARCHAR(36),                     -- Realm (chuỗi)
                                 created_by VARCHAR(36),                -- Người tạo
                                 created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),  -- Ngày tạo
                                 updated_date TIMESTAMP NULL,
                                 updated_by VARCHAR(36)
);
CREATE TABLE channel (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(100),
                         description TEXT NULL,
                         realm_id VARCHAR(36),
                         created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                         source_id BIGINT,
                         created_by VARCHAR(36),
                         updated_date TIMESTAMP WITHOUT TIME ZONE,
                         updated_by VARCHAR(36)
);
CREATE TABLE source (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(100),
                        description TEXT NULL,
                        realm_id VARCHAR(36),
                        created_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                        create_by VARCHAR(36),
                        update_date TIMESTAMP WITHOUT TIME ZONE,
                        update_by VARCHAR(36)
);
CREATE TABLE live_stream_channel (
                                     id BIGSERIAL PRIMARY KEY,                     -- Khóa chính
                                     title VARCHAR(100),                           -- Tiêu đề
                                     url VARCHAR(150),                             -- URL stream
                                     is_share BOOLEAN,                             -- Dùng chung
                                     area_id BIGINT,                               -- Khu vực
                                     description TEXT NULL,                                     -- Ghi chú
                                     source_id BIGINT,                              -- Nguồn nội dung
                                     channel_id BIGINT,                             -- Kênh nội dung
                                     realm_id VARCHAR(36),                        -- Realm
                                     status int2                            -- Trạng thái sử dụng
);
ALTER TABLE openremote.asset_info
    DROP COLUMN asset_code,
    DROP COLUMN supplier_id,
    DROP COLUMN village_id,
    DROP COLUMN speaker_value,
    DROP COLUMN location;


ALTER TABLE openremote.asset_info
    ADD COLUMN code VARCHAR(100) UNIQUE,
    ADD COLUMN name VARCHAR(150),
    ADD COLUMN activity_status int2,
    ADD COLUMN location_asset jsonb NULL,
    ADD COLUMN number_device int2 DEFAULT 0;

CREATE TABLE area (
                      id BIGSERIAL PRIMARY KEY,           -- Khóa chính
                      name VARCHAR(100),                  -- Tên khu vực
                      ward_id BIGINT,                     -- Thuộc xã/phường nào
                      realm_id VARCHAR(36)                  -- Realm
);
CREATE TABLE folder (
                        id BIGSERIAL PRIMARY KEY,           -- Khóa chính
                        name VARCHAR(100),                  -- Tên chuyên mục
                        realm_id VARCHAR(36),                 -- Realm
                        parent_id BIGINT NULL,                   -- Folder cha
                        path VARCHAR(150),                  -- Đường dẫn cây
                        description TEXT NULL                   -- Ghi chú
);
CREATE TABLE playlist (
                          id BIGSERIAL PRIMARY KEY,            -- Khóa chính
                          name VARCHAR(100),                   -- Tên danh sách phát
                          realm_id VARCHAR(36),                  -- Realm
                          area_id BIGINT,                      -- Khu vực
                          shared BOOLEAN,                      -- Dùng chung
                          description TEXT NULL                    -- Ghi chú
);
CREATE TABLE news_category (
                               id BIGSERIAL PRIMARY KEY,                     -- Khóa chính
                               title VARCHAR(150),                           -- Tiêu đề
                               description TEXT NULL,                              -- Mô tả
                               created_at TIMESTAMP WITHOUT TIME ZONE,       -- Ngày tạo
                               updated_at TIMESTAMP WITHOUT TIME ZONE,       -- Ngày cập nhật
                               created_by VARCHAR(36),                            -- Người tạo
                               updated_by VARCHAR(36),                            -- Người cập nhật
                               is_deleted BOOLEAN DEFAULT FALSE              -- Đánh dấu xóa
);
CREATE TABLE content (
                         id BIGSERIAL PRIMARY KEY,              -- Khóa chính
                         name VARCHAR(100),                     -- Tên nội dung
                         realm_id VARCHAR(36),                    -- Realm
                         file_name VARCHAR(150),                -- Tên file
                         file_type VARCHAR(50) NULL,                -- Loại file
                         file_path VARCHAR(150),                -- Đường dẫn file
                         size_file INT,                         -- Dung lượng (MB)
                         duration_file interval,                     -- Thời lượng phát
                         source_id BIGINT NULL,                      -- Nguồn nội dung
                         channel_id BIGINT NULL,                     -- Kênh nội dung
                         folder_id BIGINT NULL,                      -- Chuyên mục
                         playlist_id BIGINT NULL                     -- Danh sách phát
);
ALTER TABLE openremote.schedule_info
DROP COLUMN approval_status,
    DROP COLUMN approved_by,
    DROP COLUMN approved_date,
    DROP COLUMN audio_config,
    DROP COLUMN broadcast_type_id,
    DROP COLUMN reject_reason;

ALTER TABLE openremote.schedule_info
    ADD COLUMN priority VARCHAR(50) NULL,
    ADD COLUMN news_category_id BIGINT NULL,
    ADD COLUMN bit_rate INT NULL,
    ADD COLUMN broadcast_type_id BIGINT NULL,
    ADD COLUMN start_time TIMESTAMP NULL,
    ADD COLUMN end_time TIMESTAMP NULL,
    ADD COLUMN approval_status VARCHAR(50) NULL,
    ADD COLUMN reject_reasson VARCHAR(255) NULL,
    ADD COLUMN status_approved int2 NULL,
    ADD COLUMN approved_by VARCHAR(36) NULL,
    ADD COLUMN approved_at TIMESTAMP NULL;

CREATE TABLE schedule_asset (
                                id              BIGSERIAL PRIMARY KEY,
                                schedule_id     BIGINT NULL,
                                type            VARCHAR(50),       -- khu vực / thiết bị (lưu string)
                                asset_id        VARCHAR(22),
                                realm_id        VARCHAR(36),
                                created_date    TIMESTAMP NULL DEFAULT NOW(),
                                create_by       VARCHAR(36),
                                update_date     TIMESTAMP,
                                update_by       VARCHAR(36),
                                status          int2
);
CREATE TABLE schedule_history (
                                  id BIGSERIAL PRIMARY KEY,       -- Khóa chính
                                  schedule_id BIGINT,        -- ID của bản tin / lịch phát
                                  status int2 NULL,       -- Trạng thái
                                  description TEXT NULL,         -- Ghi chú
                                  create_date TIMESTAMP,     -- Ngày tạo
                                  realm_id VARCHAR(36) NULL,         -- Realm
                                  create_by VARCHAR(36),     -- Người tạo
                                  update_date TIMESTAMP,     -- Ngày cập nhật
                                  update_by VARCHAR(36)      -- Người cập nhật
);
CREATE TABLE schedule_content (
                                  id BIGSERIAL PRIMARY KEY,     -- Khóa chính
                                  schedule_id BIGINT,         -- Lịch phát nào
                                  number INT,              -- Số lần phát
                                  duration interval,           -- Thời lượng phát
                                  order_by INT NULL,            -- Thứ tự phát
                                  time_period JSONB NULL,       -- Thời gian phát
                                  create_date TIMESTAMP NULL,   -- Ngày tạo
                                  create_by VARCHAR(36) NULL,   -- Người tạo
                                  update_date TIMESTAMP NULL,   -- Ngày cập nhật
                                  update_by VARCHAR(36) NULL    -- Người cập nhật
);
CREATE TABLE schedule_content_type (
                                       id BIGSERIAL PRIMARY KEY,   -- Khóa chính
                                       type VARCHAR(100) NULL,     -- Loại nội dung
                                       schedule_content_id BIGINT NULL,   -- Liên kết đến schedule_content
                                       entity_id BIGINT NULL,       -- ID của thực thể (asset, nội dung…)
                                       entity_name VARCHAR(100)
);
CREATE TABLE schedule_history_content (
                                          id BIGSERIAL PRIMARY KEY,        -- Khóa chính
                                          schedule_content_id BIGINT, -- ID của bản tin (schedule_content)
                                          status int2 NULL,        -- Trạng thái
                                          description TEXT NULL,          -- Ghi chú
                                          create_date TIMESTAMP,      -- Ngày tạo
                                          realm_id VARCHAR(36),          -- Realm
                                          create_by VARCHAR(36),      -- Người tạo
                                          update_date TIMESTAMP,      -- Ngày cập nhật
                                          update_by VARCHAR(36)       -- Người cập nhật
);
