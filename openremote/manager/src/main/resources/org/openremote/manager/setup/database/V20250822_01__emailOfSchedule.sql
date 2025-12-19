ALTER TABLE openremote.schedule_info
    ADD COLUMN mail_sent INT4;

-- Thêm ghi chú cho cột vừa tạo
COMMENT ON COLUMN openremote.schedule_info.mail_sent IS '1 - Đã gửi mail, 0 - Cần gửi mail';
