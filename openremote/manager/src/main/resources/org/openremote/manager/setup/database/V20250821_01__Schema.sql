ALTER TABLE openremote.schedule_asset
ADD COLUMN status INT4;

-- Thêm ghi chú cho cột vừa tạo
COMMENT ON COLUMN openremote.schedule_asset.status IS '1 - Gửi thành công, 0 - Đang gửi, -1 - Gửi thất bại';