CREATE OR REPLACE FUNCTION get_brightness_status3(
    arrayEntityID varchar[],
    dateTimeActive TIMESTAMP WITHOUT TIME ZONE
)
RETURNS TABLE (
    entityid varchar(22),
    brightness INT4,
    status BOOLEAN,
    lasttimeactive TIMESTAMP,
    voltage NUMERIC,
    amperage NUMERIC,
    wattage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH RankedData AS (
        SELECT
            entity_id,
            attribute_name,
            (value::jsonb ->> 'value')::numeric AS num_value,
            timestamp,
            ROW_NUMBER() OVER (
                PARTITION BY entity_id, attribute_name
                ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - dateTimeActive))) ASC
            ) AS rank
        FROM asset_datapoint
        WHERE entity_id = ANY(arrayEntityID)
          AND attribute_name IN ('brightness', 'voltage', 'amperage', 'wattage')
    ),
    Pivoted AS (
        SELECT
            entity_id,
            MAX(CASE WHEN attribute_name = 'brightness' THEN num_value::int END) AS brightness,
            MAX(CASE WHEN attribute_name = 'brightness' THEN timestamp END) AS lasttimeactive,
            MAX(CASE WHEN attribute_name = 'voltage' THEN num_value END) AS voltage,
            MAX(CASE WHEN attribute_name = 'amperage' THEN num_value END) AS amperage,
            MAX(CASE WHEN attribute_name = 'wattage' THEN num_value END) AS wattage
        FROM RankedData
        WHERE rank = 1
        GROUP BY entity_id
    )
SELECT
    entity_id,
    brightness,
    (brightness > 0) AS status,
    lasttimeactive,
    voltage,
    amperage,
    wattage
FROM Pivoted;
END;
$$ LANGUAGE plpgsql;
