CREATE TABLE micro_ip_device (
                                 id VARCHAR(36) PRIMARY KEY,
                                 device_code VARCHAR(50) UNIQUE,        -- Mã thiết bị
                                 device_name VARCHAR(100),               -- Tên thiết bị
                                 is_locked BOOLEAN DEFAULT FALSE,                      -- Tạm khóa
                                 area_id VARCHAR(36),                         -- Khu vực / phân vùng
                                 realm_name VARCHAR(150),                    -- Realm (chuỗi)
                                 created_by VARCHAR(36),                 -- Người tạo
                                 created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),  -- Ngày tạo
                                 updated_by VARCHAR(36),
                                 updated_at TIMESTAMP NULL,
                                 is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE channel (
                         id VARCHAR(36) PRIMARY KEY,
                         name VARCHAR(100),
                         description TEXT NULL,
                         realm_name VARCHAR(150),
                         created_by VARCHAR(36),
                         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                         updated_by VARCHAR(36),
                         updated_at TIMESTAMP NULL,
                         source_id VARCHAR(36),
                         is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE source (
                        id VARCHAR(36) PRIMARY KEY,
                        name VARCHAR(100),
                        description TEXT NULL,
                        realm_name VARCHAR(150),
                        created_by VARCHAR(36),
                        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                        updated_by VARCHAR(36),
                        updated_at TIMESTAMP NULL,
                        is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE live_stream_channel (
                                     id VARCHAR(36) PRIMARY KEY,              -- Khóa chính
                                     title VARCHAR(100),                    -- Tiêu đề
                                     url VARCHAR(150),                      -- URL stream
                                     is_share BOOLEAN default False,                      -- Dùng chung
                                     area_id VARCHAR(36),                         -- Khu vực
                                     description TEXT NULL,                 -- Ghi chú
                                     source_id VARCHAR(36),                       -- Nguồn nội dung
                                     channel_id VARCHAR(36),                      -- Kênh nội dung
                                     realm_name VARCHAR(150),                   -- Realm
                                     status INT2,                            -- Trạng thái sử dụng
                                     created_by VARCHAR(36),
                                     created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                     updated_by VARCHAR(36),
                                     updated_at TIMESTAMP NULL,
                                     is_deleted BOOLEAN DEFAULT FALSE
);

ALTER TABLE openremote.asset_info
    ADD COLUMN code VARCHAR(100) UNIQUE,
    ADD COLUMN name VARCHAR(150),
    ADD COLUMN activity_status int2,
    ADD COLUMN location_asset jsonb NULL,
    ADD COLUMN number_device int2 DEFAULT 0;

CREATE TABLE area (
                      id VARCHAR(36) PRIMARY KEY,           -- Khóa chính
                      name VARCHAR(100),                  -- Tên khu vực
                      ward_id BIGINT,                     -- Thuộc xã/phường nào
                      realm_name VARCHAR(150),
                      created_by VARCHAR(36),
                      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                      updated_by VARCHAR(36),
                      updated_at TIMESTAMP NULL,
                      is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE folder (
                        id VARCHAR(36) PRIMARY KEY,           -- Khóa chính
                        name VARCHAR(100),                  -- Tên chuyên mục
                        realm_name VARCHAR(150),               -- Realm
                        parent_id VARCHAR(36) NULL,              -- Folder cha
                        path VARCHAR(150),                  -- Đường dẫn cây
                        description TEXT NULL,
                        created_by VARCHAR(36),
                        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                        updated_by VARCHAR(36),
                        updated_at TIMESTAMP NULL,
                        is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE playlist (
                          id VARCHAR(36) PRIMARY KEY,            -- Khóa chính
                          name VARCHAR(100),                   -- Tên danh sách phát
                          realm_name VARCHAR(150),                -- Realm
                          area_id VARCHAR(36),                      -- Khu vực
                          shared BOOLEAN,                      -- Dùng chung
                          description TEXT NULL,
                          created_by VARCHAR(36),
                          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                          updated_by VARCHAR(36),
                          updated_at TIMESTAMP NULL,
                          is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE news_category (
                               id VARCHAR(36) PRIMARY KEY,            -- Khóa chính
                               title VARCHAR(150),                  -- Tiêu đề
                               description TEXT NULL,               -- Mô tả
                               created_by VARCHAR(36),
                               created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                               updated_by VARCHAR(36),
                               updated_at TIMESTAMP NULL,
                               realm_name VARCHAR(150),
                               is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE content (
                         id VARCHAR(36) PRIMARY KEY,            -- Khóa chính
                         name VARCHAR(100),                   -- Tên nội dung
                         realm_name VARCHAR(150),                -- Realm
                         file_name VARCHAR(150),              -- Tên file
                         file_type VARCHAR(50) NULL,          -- Loại file
                         file_path VARCHAR(150),              -- Đường dẫn file
                         size_file INT,                       -- Dung lượng (MB)
                         duration_file INTERVAL,              -- Thời lượng phát
                         source_id VARCHAR(36) NULL,               -- Nguồn nội dung
                         channel_id VARCHAR(36) NULL,              -- Kênh nội dung
                         folder_id VARCHAR(36) NULL,               -- Chuyên mục
                         playlist_id VARCHAR(36) NULL,             -- Danh sách phát
                         created_by VARCHAR(36),
                         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                         updated_by VARCHAR(36),
                         updated_at TIMESTAMP NULL,
                         is_deleted BOOLEAN DEFAULT FALSE
);


ALTER TABLE openremote.schedule_info
    ADD COLUMN priority VARCHAR(50) NULL,
    ADD COLUMN news_category_id VARCHAR(36) NULL,
    ADD COLUMN bit_rate INT NULL,
    ADD COLUMN broadcast_type_id VARCHAR(36) NULL,
    ADD COLUMN start_time TIMESTAMP NULL,
    ADD COLUMN end_time TIMESTAMP NULL,
    ADD COLUMN approval_status VARCHAR(50) NULL,
    ADD COLUMN reject_reasson VARCHAR(255) NULL,
    ADD COLUMN status_approved int2 NULL,
    ADD COLUMN approved_by VARCHAR(36) NULL,
    ADD COLUMN approved_at TIMESTAMP NULL;

CREATE TABLE schedule_asset (
                                id VARCHAR(36) PRIMARY KEY,
                                schedule_id VARCHAR(36) NULL,
                                type VARCHAR(50),                     -- khu vực / thiết bị (lưu string)
                                asset_id VARCHAR(36),
                                realm_name VARCHAR(150),
                                created_by VARCHAR(36),
                                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                updated_by VARCHAR(36),
                                updated_at TIMESTAMP NULL,
                                status INT2,
                                is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE schedule_history (
                                  id VARCHAR(36) PRIMARY KEY,             -- Khóa chính
                                  schedule_id VARCHAR(36),                   -- ID của bản tin / lịch phát
                                  status INT2 NULL,                     -- Trạng thái
                                  description TEXT NULL,                -- Ghi chú
                                  created_by VARCHAR(36),
                                  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                  updated_by VARCHAR(36),
                                  updated_at TIMESTAMP NULL,
                                  realm_name VARCHAR(150),
                                  is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE schedule_content (
                                  id VARCHAR(36) PRIMARY KEY,             -- Khóa chính
                                  schedule_id VARCHAR(36),                   -- Lịch phát nào
                                  number INT,                            -- Số lần phát
                                  duration INTERVAL,                     -- Thời lượng phát
                                  order_by INT NULL,                     -- Thứ tự phát
                                  time_period JSONB NULL,                -- Thời gian phát
                                  created_by VARCHAR(36),
                                  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                  updated_by VARCHAR(36),
                                  updated_at TIMESTAMP NULL,
                                  is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE schedule_content_type (
                                       id VARCHAR(36) PRIMARY KEY,             -- Khóa chính
                                       type VARCHAR(100) NULL,               -- Loại nội dung
                                       schedule_content_id VARCHAR(36) NULL,      -- Liên kết đến schedule_content
                                       entity_id VARCHAR(36) NULL,                -- ID của thực thể (asset, nội dung…)
                                       entity_name VARCHAR(100),
                                       created_by VARCHAR(36),
                                       created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                       updated_by VARCHAR(36),
                                       updated_at TIMESTAMP NULL,
                                       realm_name VARCHAR(150),
                                       is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE schedule_history_content (
                                          id VARCHAR(36) PRIMARY KEY,             -- Khóa chính
                                          schedule_content_id VARCHAR(36),           -- ID của bản tin (schedule_content)
                                          status INT2 NULL,                     -- Trạng thái
                                          description TEXT NULL,                -- Ghi chú
                                          created_by VARCHAR(36),
                                          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                                          updated_by VARCHAR(36),
                                          updated_at TIMESTAMP NULL,
                                          realm_name VARCHAR(150),
                                          is_deleted BOOLEAN DEFAULT FALSE
);
CREATE TABLE openremote.user_area (
                                      id VARCHAR(36) PRIMARY KEY,
                                      user_id  VARCHAR(36),
                                      area_id VARCHAR(36)
);
