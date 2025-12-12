CREATE OR REPLACE FUNCTION totalReportPowerVoltage(
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    assetLightId TEXT,
    compareDate BOOLEAN
)
RETURNS TABLE (
    output_month TEXT,
    total_wattage NUMERIC,
    total_amperage NUMERIC,
    total_voltage NUMERIC
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
            COALESCE(last_value, 0) - COALESCE(first_value, 0) AS wattage
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
    daily_data AS (
        SELECT
            ad.group_time,
            GREATEST(wd.wattage, 0) AS wattage,
            ad.amperage,
            ad.voltage
        FROM average_data ad
        LEFT JOIN wattage_diff wd ON wd.group_time = ad.group_time
    )
SELECT
    TO_CHAR(group_time, 'YYYY-MM') AS output_month,
    SUM(wattage) AS total_wattage,
    SUM(amperage) AS total_amperage,
    SUM(voltage) AS total_voltage
FROM daily_data
GROUP BY TO_CHAR(group_time, 'YYYY-MM')
ORDER BY TO_CHAR(group_time, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;
