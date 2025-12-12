CREATE OR REPLACE FUNCTION powerAssetDataPointByAssetId3(
    assetLightId TEXT
)
RETURNS TABLE (
    entity_id VARCHAR(22),
    attribute_name VARCHAR(255),
    value JSONB,
    ts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_data AS (
        SELECT
            ap.attribute_name,
            MAX(ap.timestamp) AS max_time
        FROM asset_datapoint ap
        WHERE ap.entity_id = assetLightId
          AND ap.attribute_name LIKE '%amperagePhase%'
        GROUP BY ap.attribute_name
    )
SELECT
    ap.entity_id,
    ap.attribute_name,
    ap.value,
    (extract(epoch from ap.timestamp) * 1000)::bigint as ts
FROM asset_datapoint ap
         INNER JOIN latest_data ld
                    ON ap.attribute_name = ld.attribute_name
                        AND ap.timestamp = ld.max_time
WHERE ap.entity_id = assetLightId
  AND ap.attribute_name LIKE '%amperagePhase%'
ORDER BY ap.attribute_name;
END;
$$ LANGUAGE plpgsql;
