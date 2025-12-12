-- Tạo bảng hdi_asset_info
CREATE TABLE asset_info (
                                id VARCHAR(22) NOT NULL, -- Khóa chính và cũng là khóa ngoại tham chiếu tới LightAsset
                                asset_code VARCHAR(30) NOT NULL, -- Mã tài sản
                                cabinet_asset_code VARCHAR(5), -- Mã tài sản của tủ điều khiển
                                is_control_by_cabinet BOOLEAN NOT NULL DEFAULT TRUE, -- Điều khiển bởi tủ (mặc định là true)
                                cabinet_id VARCHAR(22), -- Khóa ngoại tham chiếu tới ElectricalCabinetAsset
                                active BOOLEAN NOT NULL DEFAULT TRUE, -- Trạng thái hoạt động (mặc định là true)
                                create_date TIMESTAMP NOT NULL, -- Ngày tạo
                                create_by VARCHAR(22) NOT NULL, -- Khóa ngoại tham chiếu tới UserEntity (người tạo)
                                update_date TIMESTAMP NOT NULL, -- Ngày cập nhật
                                update_by VARCHAR(22) NOT NULL, -- Khóa ngoại tham chiếu tới UserEntity (người cập nhật)
                                PRIMARY KEY (id) -- Khóa chính
);

