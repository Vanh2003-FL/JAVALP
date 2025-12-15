ALTER TABLE openremote.asset_info
    ALTER COLUMN asset_code DROP NOT NULL,
    ALTER COLUMN is_control_by_cabinet DROP NOT NULL,
    ALTER COLUMN active DROP NOT NULL,
    ALTER COLUMN create_date DROP NOT NULL,
    ALTER COLUMN create_by DROP NOT NULL,
    ALTER COLUMN update_date DROP NOT NULL,
    ALTER COLUMN update_by DROP NOT NULL;
