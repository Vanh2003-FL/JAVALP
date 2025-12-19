CREATE OR REPLACE FUNCTION totalReportPowerVoltage2(
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    assetLightId TEXT,
    compareDate BOOLEAN
)
RETURNS TABLE (
    light_id VARCHAR(22),
    output_time TEXT,
    total_wattage NUMERIC,
    total_amperage NUMERIC,
    total_voltage NUMERIC,
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
            date_trunc('day', ts) AS group_time,
            attribute_name,
            value,
            ts
        FROM filtered_data
    ),
    wattage_range_per_group AS (
        SELECT
            group_time,
            MAX(CASE WHEN attribute_name = 'wattageActual' THEN value END) FILTER (WHERE ts = max_ts) AS last_value,
            MAX(CASE WHEN attribute_name = 'wattageActual' THEN value END) FILTER (WHERE ts = min_ts) AS first_value
        FROM (
            SELECT
                group_time,
                attribute_name,
                value,
                ts,
                FIRST_VALUE(ts) OVER (PARTITION BY group_time ORDER BY ts ASC) AS min_ts,
                LAST_VALUE(ts) OVER (PARTITION BY group_time ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS max_ts
            FROM grouped_data
            WHERE attribute_name = 'wattageActual'
        ) sub
        GROUP BY group_time
    ),
    wattage_diff AS (
        SELECT
            group_time,
            GREATEST(COALESCE(last_value, 0) - COALESCE(first_value, 0), 0) AS wattage
        FROM wattage_range_per_group
    ),
    average_data AS (
        SELECT
            entity_id,
            group_time,
            AVG(CASE WHEN attribute_name = 'amperage' THEN value END) AS amperage,
            AVG(CASE WHEN attribute_name = 'voltage' THEN value END) AS voltage
        FROM grouped_data
        GROUP BY entity_id, group_time
    ),
    monthly_data AS (
        SELECT
            ad.entity_id,
            date_trunc('month', ad.group_time) AS month_time,
            SUM(wd.wattage) AS total_wattage,
            SUM(ad.amperage) AS total_amperage,
            SUM(ad.voltage) AS total_voltage
        FROM average_data ad
        LEFT JOIN wattage_diff wd ON wd.group_time = ad.group_time
        GROUP BY ad.entity_id, date_trunc('month', ad.group_time)
    )
SELECT
    m.entity_id AS light_id,
    TO_CHAR(m.month_time, 'YYYY-MM') AS output_time,
    m.total_wattage,
    m.total_amperage,
    m.total_voltage,
    a2.name AS parent_asset_name,
    info.asset_code AS light_code
FROM monthly_data m
         LEFT JOIN asset a1 ON m.entity_id = a1.id
         LEFT JOIN asset a2 ON
        a2.id = (
        CASE
            WHEN POSITION('.' IN a1.path::text) > 0 THEN SPLIT_PART(a1.path::text, '.', 1)
            ELSE a1.path::text
            END
        )
         LEFT JOIN asset_info info ON m.entity_id = info.id
ORDER BY m.month_time;
END;
$$ LANGUAGE plpgsql;
