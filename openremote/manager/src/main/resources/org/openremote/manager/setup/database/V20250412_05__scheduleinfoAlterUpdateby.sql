ALTER TABLE schedule_info
    ALTER COLUMN update_date DROP NOT NULL;

ALTER TABLE schedule_info
    ALTER COLUMN update_by DROP NOT NULL;
