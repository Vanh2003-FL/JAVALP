ALTER TABLE openremote.frw_info ALTER COLUMN upgrade_date TYPE timestamp USING upgrade_date::timestamp;
