CREATE OR REPLACE FUNCTION reportPowerVoltage7(
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
                WHEN compareDate THEN date_trunc('hour', ts)
                ELSE date_trunc('day', ts)
            END AS group_time,
            attribute_name,
            value,
            ts
        FROM filtered_data
    ),
    last_wattage_per_group AS (
        SELECT DISTINCT ON (group_time)
            group_time,
            ts,
            value AS wattage
        FROM grouped_data
        WHERE attribute_name = 'wattageActual'
        ORDER BY group_time, ts DESC
    ),
    wattage_diff AS (
        SELECT
            curr.group_time,
            curr.wattage - COALESCE(prev.wattage, 0) AS wattage
        FROM last_wattage_per_group curr
        LEFT JOIN last_wattage_per_group prev
            ON curr.group_time = prev.group_time + (CASE WHEN compareDate THEN INTERVAL '1 hour' ELSE INTERVAL '1 day' END)
    ),
    average_data AS (
        SELECT
            entity_id,
            group_time,
            AVG(CASE WHEN attribute_name = 'amperage' THEN value END) AS amperage,
            AVG(CASE WHEN attribute_name = 'voltage' THEN value END) AS voltage
        FROM grouped_data
        GROUP BY entity_id, group_time
    )
SELECT
    ad.entity_id AS light_id,
    TO_CHAR(ad.group_time, CASE WHEN compareDate THEN 'YYYY-MM-DD HH24' ELSE 'YYYY-MM-DD' END) AS output_time,
    wd.wattage,
    ad.amperage,
    ad.voltage,
    a2.name AS parent_asset_name,
    info.asset_code
FROM average_data ad
         LEFT JOIN wattage_diff wd ON wd.group_time = ad.group_time
         LEFT JOIN asset a1 ON ad.entity_id = a1.id
         LEFT JOIN asset a2 ON
        a2.id = (
        CASE
            WHEN POSITION('.' IN a1.path::text) > 0 THEN SPLIT_PART(a1.path::text, '.', 1)
            ELSE a1.path::text
            END
        )
         LEFT JOIN asset_info info ON ad.entity_id = info.id
ORDER BY ad.group_time;
END;
$$ LANGUAGE plpgsql;
