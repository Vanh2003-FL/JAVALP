ALTER TABLE asset_cabinet
ALTER COLUMN cabinet_grp_id TYPE INT;

ALTER TABLE asset_cabinet
    ALTER COLUMN cabinet_grp_id
        DROP DEFAULT;


ALTER TABLE asset_cabinet
    ALTER COLUMN cabinet_grp_id
        DROP NOT NULL;
