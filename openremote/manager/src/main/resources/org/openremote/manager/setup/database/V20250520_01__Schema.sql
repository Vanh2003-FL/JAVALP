CREATE TABLE sys_config_parms (
                                  sys_param_code VARCHAR(150) PRIMARY KEY, -- Mã tham số
                                  data_type VARCHAR(150) ,         -- Kiểu dữ liệu: STRING, NUMBER, DATE
                                  parm_value VARCHAR(250) ,        -- Giá trị tham số
                                  description VARCHAR(250) ,    -- Mô tả tham số
                                  active BOOLEAN  DEFAULT TRUE,    -- Trạng thái: TRUE (1) hoặc FALSE (0)
                                  create_date DATE ,               -- Ngày tạo
                                  create_by VARCHAR(36)            -- Người tạo (user_entity)
);
ALTER TABLE asset_info
    ADD COLUMN last_time_warning TIMESTAMPTZ, -- Thời gian gửi mail cảnh báo cuối cùng
ADD COLUMN last_value_warning VARCHAR(5); -- Giá trị đã gửi cảnh báo

insert into sys_config_parms (sys_param_code, data_type, parm_value, description, active, create_date,create_by)
VALUES ('time_datapoint_flag', 'DATE', '2025-05-20T09:17:42.123456Z', '',true,'2025-05-20T09:17:42.123456Z','admin');
