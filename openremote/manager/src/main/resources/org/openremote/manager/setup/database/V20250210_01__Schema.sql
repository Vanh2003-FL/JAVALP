CREATE TABLE sys_asset_type (
                                id BIGSERIAL PRIMARY KEY,                      -- ID tự động tăng
                                asset_type_code VARCHAR(30) NOT NULL,         -- Mã loại tài sản, không cho phép NULL
                                asset_type_name VARCHAR(150) NOT NULL,        -- Tên loại tài sản, không cho phép NULL
                                description VARCHAR(500),                     -- Mô tả
                                active BOOLEAN DEFAULT TRUE,                  -- Trạng thái kích hoạt, mặc định là TRUE
                                icon VARCHAR(150),
                                colour VARCHAR(150),
                                create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Ngày tạo, mặc định là thời gian hiện tại
                                create_by VARCHAR(36),                        -- Người tạo
                                update_date TIMESTAMP,                        -- Ngày cập nhật
                                update_by VARCHAR(36)                         -- Người cập nhật
);

CREATE TABLE sys_attributes (
                                id BIGSERIAL PRIMARY KEY,                      -- ID tự động tăng
                                attr_code VARCHAR(30) NOT NULL,               -- Mã thuộc tính, không cho phép NULL
                                attr_code_name VARCHAR(150),                  -- Tên mã thuộc tính
                                attr_data_type VARCHAR(50),                   -- Kiểu dữ liệu thuộc tính
                                active BOOLEAN DEFAULT TRUE,                  -- Trạng thái kích hoạt, mặc định là TRUE
                                create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày tạo, mặc định là thời gian hiện tại
                                create_by VARCHAR(36),                        -- Người tạo
                                update_date TIMESTAMP,                        -- Ngày cập nhật
                                update_by VARCHAR(36)                         -- Người cập nhật
);

CREATE TABLE sys_asset_type_attr (
                                     id BIGSERIAL PRIMARY KEY,                      -- ID tự động tăng
                                     asset_type_id BIGINT NOT NULL,                -- ID loại tài sản, không cho phép NULL
                                     attr_id BIGINT NOT NULL,                      -- ID thuộc tính, không cho phép NULL
                                     attr_data_type VARCHAR(50) NOT NULL,          -- Kiểu dữ liệu thuộc tính, không cho phép NULL
                                     attr_format VARCHAR(50),                      -- Định dạng thuộc tính
                                     is_report BOOLEAN DEFAULT FALSE,              -- Có xuất báo cáo không, mặc định là FALSE
                                     is_set_rule BOOLEAN DEFAULT FALSE,            -- Có đặt quy tắc không, mặc định là FALSE
                                     create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Ngày tạo, mặc định là thời gian hiện tại
                                     create_by VARCHAR(36),                        -- Người tạo
                                     update_date TIMESTAMP,                        -- Ngày cập nhật
                                     update_by VARCHAR(36)                         -- Người cập nhật
);
