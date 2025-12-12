
CREATE OR REPLACE FUNCTION get_brightness_status(
    arrayEntityID varchar[],
    dateTimeActive TIMESTAMP WITHOUT TIME ZONE
)
RETURNS TABLE (
    entityid varchar(22),
    brightness INT4,
    status BOOLEAN,
    lasttimeactive TIMESTAMP
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
                ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - dateTimeActive))) ASC
            ) AS rank
        FROM asset_datapoint
        WHERE entity_id = ANY(arrayEntityID)
    )
SELECT
    ra.entity_id,
    ra.value ::INTEGER,
        (ra.value::NUMERIC > 0) AS status,
    ra.timestamp
FROM RankedData ra
WHERE ra.rank = 1 AND ra.attribute_name = 'brightness';
END;
$$ LANGUAGE plpgsql;
