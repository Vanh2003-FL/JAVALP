-- Tạo sequence
CREATE SEQUENCE IF NOT EXISTS md_lamp_type_id_seq;

-- Gán sequence cho cột id
ALTER TABLE md_lamp_type
    ALTER COLUMN id SET DEFAULT nextval('md_lamp_type_id_seq');

-- Đồng bộ sequence với giá trị lớn nhất hiện có
SELECT setval('md_lamp_type_id_seq', COALESCE((SELECT MAX(id) FROM md_lamp_type), 0) + 1, false);


CREATE SEQUENCE IF NOT EXISTS route_lamppost_lamppost_id_seq;

ALTER TABLE route_lamppost
    ALTER COLUMN lamppost_id SET DEFAULT nextval('route_lamppost_lamppost_id_seq');

SELECT setval('route_lamppost_lamppost_id_seq', COALESCE((SELECT MAX(lamppost_id) FROM route_lamppost), 0) + 1, false);


CREATE SEQUENCE IF NOT EXISTS route_lamppost_detail_id_seq;

ALTER TABLE route_lamppost_detail
    ALTER COLUMN id SET DEFAULT nextval('route_lamppost_detail_id_seq');

SELECT setval('route_lamppost_detail_id_seq', COALESCE((SELECT MAX(id) FROM route_lamppost_detail), 0) + 1, false);


-- Bảng: md_lamp_type (Không cần thay đổi, không có NOT NULL)

-- Bảng: route_lamppost_detail
ALTER TABLE route_lamppost_detail
    ALTER COLUMN lamppost_id DROP NOT NULL,
ALTER COLUMN asset_id DROP NOT NULL,
  ALTER COLUMN lamp_type_id DROP NOT NULL,
  ALTER COLUMN start_date DROP NOT NULL,
  ALTER COLUMN end_date DROP NOT NULL,
  ALTER COLUMN create_date DROP NOT NULL,
  ALTER COLUMN create_by DROP NOT NULL;

-- Bảng: route_lamppost
ALTER TABLE route_lamppost
    ALTER COLUMN route_id DROP NOT NULL,
ALTER COLUMN energy_actual_D DROP NOT NULL,
  ALTER COLUMN energy_actual_M DROP NOT NULL,
  ALTER COLUMN active DROP NOT NULL,
  ALTER COLUMN create_date DROP NOT NULL,
  ALTER COLUMN create_by DROP NOT NULL,
  ALTER COLUMN update_date DROP NOT NULL;
