ALTER TABLE openremote.asset_cabinet ALTER COLUMN deactive_date TYPE timestamp USING deactive_date::timestamp;
ALTER TABLE openremote.asset_cabinet ALTER COLUMN active_date TYPE timestamp USING active_date::timestamp;
