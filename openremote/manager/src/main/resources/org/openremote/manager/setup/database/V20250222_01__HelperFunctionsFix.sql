CREATE OR REPLACE FUNCTION statusLightReport(
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    asset_id TEXT
)
RETURNS TABLE (
    entityId VARCHAR(22),
    brightness INT4,
    status BOOLEAN,
    lastTimeActive TIMESTAMP
) AS $$
BEGIN
RETURN QUERY
    WITH data_report AS (
        SELECT
            ap.entity_id,
            ap.value,
            ap.timestamp,
            (ap.value::NUMERIC > 0) AS status
        FROM asset_datapoint ap
        WHERE ap.entity_id = asset_id
        AND ap.timestamp BETWEEN start_time AND end_time
    )
SELECT
    dr.entity_id,
    value::INTEGER AS brightness,
    dr.status,
    dr.timestamp AS lastTimeActive
FROM data_report dr
ORDER BY dr.status DESC,
    ABS(EXTRACT(EPOCH FROM (dr.timestamp - start_time))) ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
