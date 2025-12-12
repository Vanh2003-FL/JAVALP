-- Function Report
CREATE OR REPLACE FUNCTION reportLight(start_time TIMESTAMP, end_time TIMESTAMP, assetId TEXT)
RETURNS TABLE (
    entity_id VARCHAR(22),
    voltage NUMERIC,
    wattageActual NUMERIC,
    amperage NUMERIC,
    luminousFlux NUMERIC,
    luminousEfficacy NUMERIC,
    timeActive NUMERIC,
    powerConsumption NUMERIC
) AS $$
BEGIN
RETURN QUERY
    WITH light_data_report AS (
        SELECT
            ap.entity_id,
            ap.attribute_name,
            ap.value,
            ap.timestamp
        FROM asset_datapoint ap
        WHERE ap.entity_id = assetId
        AND ap.timestamp BETWEEN start_time AND end_time
    ),
    activity_intervals AS (
        SELECT
            ldr.entity_id,
            ldr.timestamp,
            ldr.value::numeric AS brightness_value,
            LAG(ldr.value::numeric) OVER (PARTITION BY ldr.entity_id ORDER BY ldr.timestamp) AS prev_brightness,
            LEAD(ldr.value::numeric) OVER (PARTITION BY ldr.entity_id ORDER BY ldr.timestamp) AS next_brightness
        FROM light_data_report ldr
        WHERE ldr.attribute_name = 'brightness'
    ),
    intervals AS (
        SELECT
            ai.entity_id,
            ai.timestamp AS start_time,
            LEAD(ai.timestamp) OVER (ORDER BY ai.timestamp) AS end_time
        FROM activity_intervals ai
        WHERE ai.brightness_value > 0
        AND ai.next_brightness = 0
    ),
    total_active_hours AS (
        SELECT
            i.entity_id,
            ROUND(SUM(EXTRACT(EPOCH FROM (i.end_time - i.start_time)) / 3600), 3) AS activeDuration
        FROM intervals i
        GROUP BY i.entity_id
    ),
    metrics AS (
        SELECT
            ldr.entity_id,
            SUM(CASE WHEN ldr.attribute_name = 'voltage' THEN CAST(ldr.value AS numeric) ELSE 0 END) AS voltage,
            SUM(CASE WHEN ldr.attribute_name = 'wattageActual' THEN CAST(ldr.value AS numeric) ELSE 0 END) AS wattageActual,
            SUM(CASE WHEN ldr.attribute_name = 'amperage' THEN CAST(ldr.value AS numeric) ELSE 0 END) AS amperage,
            0.0 AS luminousFlux
        FROM light_data_report ldr
        GROUP BY ldr.entity_id
    )
SELECT DISTINCT  -- Thêm DISTINCT để tránh trùng lặp
                 m.entity_id,
                 m.voltage,
                 m.wattageActual,
                 m.amperage,
                 m.luminousFlux,
                 CASE
                     WHEN m.wattageActual != 0 THEN m.luminousFlux / m.wattageActual
                     ELSE 0
                     END AS luminousEfficacy,
                 COALESCE(tah.activeDuration, 0) as timeActive,
                 COALESCE(tah.activeDuration, 0) * m.wattageActual AS powerConsumption
FROM metrics m
         LEFT JOIN total_active_hours tah ON tah.entity_id = m.entity_id;
END;
$$ LANGUAGE plpgsql;
