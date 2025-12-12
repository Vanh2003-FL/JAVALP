CREATE OR REPLACE FUNCTION get_asset_datapoints_by_time_range(
    start_ts         timestamp,
    end_ts           timestamp,
    attr_name_filter varchar,
    entity_ids       varchar[],
    min_value        numeric,
    max_value        numeric
)
RETURNS TABLE (
    "TIMESTAMP"      timestamp,
    "ENTITY_ID"      varchar,
    "ATTRIBUTE_NAME" varchar,
    "VALUE"          jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
rec RECORD;
    val_numeric numeric;
BEGIN
FOR rec IN
SELECT *
FROM ASSET_DATAPOINT adp
WHERE adp.TIMESTAMP BETWEEN start_ts AND end_ts
  AND (attr_name_filter IS NULL OR adp.ATTRIBUTE_NAME = attr_name_filter)
  AND (entity_ids IS NULL OR adp.ENTITY_ID = ANY(entity_ids))
    LOOP
BEGIN
            val_numeric := (rec.VALUE::text)::numeric;
            IF val_numeric < min_value OR val_numeric > max_value THEN
                "TIMESTAMP" := rec.TIMESTAMP;
                "ENTITY_ID" := rec.ENTITY_ID;
                "ATTRIBUTE_NAME" := rec.ATTRIBUTE_NAME;
                "VALUE" := rec.VALUE;
                RETURN NEXT;
END IF;
EXCEPTION WHEN OTHERS THEN
            CONTINUE;
END;
END LOOP;
END;
$$;


insert into sys_config_parms (sys_param_code, data_type, parm_value, description, active, create_date,create_by)
VALUES
    ('data_scan_interval', 'NUMBER', '300', '',true,'2025-05-20T09:17:42.123456Z','admin'),
    ('status_warning_interval', 'NUMBER', '1800', '',true,'2025-05-20T09:17:42.123456Z','admin');
