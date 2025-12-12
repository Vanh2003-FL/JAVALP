-- Function: reportPowerSummary with asset name from parent
CREATE OR REPLACE FUNCTION reportPowerVoltage26(
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    assetLightId TEXT,
    compareDate BOOLEAN
)
RETURNS TABLE (
    light_id VARCHAR(22),
    output_time TEXT,
    wattage NUMERIC,
    amperage NUMERIC,
    voltage NUMERIC,
    parent_asset_name VARCHAR,
    light_code VARCHAR(30)
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_data AS (
        SELECT
            ap.entity_id,
            ap.attribute_name,
            ap.value::numeric AS value,
            ap.timestamp AS ts
        FROM asset_datapoint ap
        WHERE ap.entity_id = assetLightId
          AND ap.timestamp BETWEEN start_time AND end_time
          AND ap.attribute_name IN ('wattageActual', 'amperage', 'voltage')
    ),
    grouped_data AS (
        SELECT
            entity_id,
            CASE
                WHEN compareDate THEN TO_CHAR(ts, 'YYYY-MM-DD HH24')
                ELSE TO_CHAR(ts, 'YYYY-MM-DD')
            END AS group_time,
            attribute_name,
            value
        FROM filtered_data
    ),
    summarized AS (
        SELECT
            entity_id,
            group_time,
            SUM(CASE WHEN attribute_name = 'wattageActual' THEN value ELSE 0 END) AS wattage,
            SUM(CASE WHEN attribute_name = 'amperage' THEN value ELSE 0 END) AS amperage,
            SUM(CASE WHEN attribute_name = 'voltage' THEN value ELSE 0 END) AS voltage
        FROM grouped_data
        GROUP BY entity_id, group_time
    )
SELECT
    s.entity_id,
    s.group_time,
    s.wattage,
    s.amperage,
    s.voltage,
    a2.name AS parent_asset_name,
    info.asset_code
FROM summarized s
         LEFT JOIN asset a1 ON s.entity_id = a1.id
         LEFT JOIN asset a2 ON
        a2.id = (
        CASE
            WHEN POSITION('.' IN a1.path::text) > 0 THEN SPLIT_PART(a1.path::text, '.', 1)
            ELSE a1.path::text
            END
        )
         LEFT JOIN asset_info info on s.entity_id = info.id
ORDER BY s.group_time;
END;
$$ LANGUAGE plpgsql;
