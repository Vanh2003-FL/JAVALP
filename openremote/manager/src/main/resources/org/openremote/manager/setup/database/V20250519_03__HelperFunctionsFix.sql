CREATE OR REPLACE FUNCTION get_brightness_status2(
    arrayEntityID varchar[]
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
            value,
            timestamp,
            ROW_NUMBER() OVER (
                PARTITION BY entity_id, attribute_name
                ORDER BY timestamp DESC
            ) AS rank
        FROM asset_datapoint
        WHERE entity_id = ANY(arrayEntityID)
          AND attribute_name IN ('brightness', 'voltage', 'amperage', 'wattage')
    ),
    Filtered AS (
        SELECT * FROM RankedData WHERE rank = 1
    )
SELECT
    entity_id,
    MAX(CASE WHEN attribute_name = 'brightness' THEN value::INT END) AS brightness,
    MAX(CASE WHEN attribute_name = 'brightness' THEN (value::NUMERIC > 0)::BOOLEAN END) AS status,
    MAX(CASE WHEN attribute_name = 'brightness' THEN timestamp END) AS lasttimeactive,
    MAX(CASE WHEN attribute_name = 'voltage' THEN value::NUMERIC END) AS voltage,
    MAX(CASE WHEN attribute_name = 'amperage' THEN value::NUMERIC END) AS amperage,
    MAX(CASE WHEN attribute_name = 'wattage' THEN value::NUMERIC END) AS wattage
FROM Filtered
GROUP BY entity_id;
END;
$$ LANGUAGE plpgsql;
