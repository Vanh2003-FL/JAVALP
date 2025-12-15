CREATE OR REPLACE FUNCTION powerAssetDataPointByAssetId5(
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
    WITH asset_type AS (
        SELECT type FROM asset WHERE id = assetLightId
    ),
    filtered_data AS (
        SELECT
            ap.entity_id,
            ap.attribute_name,
            ap.value,
            ap.timestamp,
            ROW_NUMBER() OVER (PARTITION BY ap.attribute_name ORDER BY ap.timestamp DESC) AS rn
        FROM asset_datapoint ap
        CROSS JOIN asset_type at
        WHERE ap.entity_id = assetLightId
          AND (
              (at.type = 'ElectricalCabinetAsset' AND ap.attribute_name LIKE '%amperagePhase%')
              OR
              (at.type = 'LightAsset' AND ap.attribute_name = 'amperage')
          )
          AND (ap.value::text)::numeric > 0
    )
SELECT
    filtered_data.entity_id,
    filtered_data.attribute_name,
    filtered_data.value,
    (extract(epoch from filtered_data.timestamp) * 1000)::bigint as ts
FROM filtered_data
WHERE filtered_data.rn = 1
ORDER BY filtered_data.attribute_name;
END;
$$ LANGUAGE plpgsql;
