CREATE OR REPLACE FUNCTION dashboardElectricalPhase2(
    asset_id TEXT
)
RETURNS TABLE (
    entityId VARCHAR(22),
    voltagePhase1 NUMERIC,
    voltagePhase2 NUMERIC,
    voltagePhase3 NUMERIC,
    amperagePhase1 NUMERIC,
    amperagePhase2 NUMERIC,
    amperagePhase3 NUMERIC
) AS $$
BEGIN
RETURN QUERY
    WITH latest_data AS (
        SELECT DISTINCT ON (attribute_name)
            entity_id,
            attribute_name,
            value::NUMERIC AS value,
            timestamp
        FROM asset_datapoint
        WHERE entity_id = asset_id
          AND attribute_name IN (
              'voltagePhase1', 'voltagePhase2', 'voltagePhase3',
              'amperagePhase1', 'amperagePhase2', 'amperagePhase3'
          )
          AND jsonb_typeof(value) = 'number'
        ORDER BY attribute_name, timestamp DESC
    )
SELECT
    asset_id AS entityId,
    MAX(CASE WHEN attribute_name = 'voltagePhase1' THEN value END) AS voltagePhase1,
    MAX(CASE WHEN attribute_name = 'voltagePhase2' THEN value END) AS voltagePhase2,
    MAX(CASE WHEN attribute_name = 'voltagePhase3' THEN value END) AS voltagePhase3,
    MAX(CASE WHEN attribute_name = 'amperagePhase1' THEN value END) AS amperagePhase1,
    MAX(CASE WHEN attribute_name = 'amperagePhase2' THEN value END) AS amperagePhase2,
    MAX(CASE WHEN attribute_name = 'amperagePhase3' THEN value END) AS amperagePhase3
FROM latest_data;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dashboardLight2(assetIds VARCHAR)
RETURNS TABLE (
    assetId VARCHAR(22),
    name VARCHAR(1023),
    voltage NUMERIC,
    wattageActual NUMERIC,
    amperage NUMERIC,
    luminousFlux NUMERIC,
    luminousEfficacy NUMERIC,
    brightness NUMERIC,
    latestTimestamp TIMESTAMP
) AS $$
BEGIN
RETURN QUERY
    WITH data_report AS (
        SELECT DISTINCT ON (entity_id, attribute_name)
            entity_id AS assetId,
            attribute_name,
            value::NUMERIC AS value,
            timestamp
        FROM asset_datapoint
        WHERE entity_id = ANY(string_to_array(assetIds, ',')::TEXT[])
          AND attribute_name IN ('voltage', 'amperage', 'wattageActual', 'luminousFlux', 'brightness')
          AND jsonb_typeof(value) = 'number'
        ORDER BY entity_id, attribute_name, timestamp DESC
    )
SELECT
    ld.assetId,
    a.name,
    MAX(CASE WHEN ld.attribute_name = 'voltage' THEN ld.value END) AS voltage,
    MAX(CASE WHEN ld.attribute_name = 'amperage' THEN ld.value END) AS amperage,
    MAX(CASE WHEN ld.attribute_name = 'wattageActual' THEN ld.value END) AS wattageActual,
    MAX(CASE WHEN ld.attribute_name = 'luminousFlux' THEN ld.value END) AS luminousFlux,
    CASE
        WHEN MAX(CASE WHEN ld.attribute_name = 'wattageActual' THEN ld.value END) != 0
            THEN MAX(CASE WHEN ld.attribute_name = 'luminousFlux' THEN ld.value END)
            / NULLIF(MAX(CASE WHEN ld.attribute_name = 'wattageActual' THEN ld.value END), 0)
        ELSE 0
        END AS luminousEfficacy,
    MAX(CASE WHEN ld.attribute_name = 'brightness' THEN ld.value END) AS brightness,
    MAX(ld.timestamp) AS latestTimestamp
FROM data_report ld
         LEFT JOIN asset a ON ld.assetId = a.id
GROUP BY ld.assetId, a.name;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fetchPhaseData(
    cabinetId TEXT,
    attributeName TEXT,
    minTime TIMESTAMP,
    maxTime TIMESTAMP
)
RETURNS TABLE (
    timeBlock TIMESTAMP,
    avgValue NUMERIC
) AS $$
BEGIN
RETURN QUERY
    WITH filtered_data AS (
        SELECT
            timestamp,
            value::numeric AS value
        FROM asset_datapoint
        WHERE entity_id = cabinetId
          AND attribute_name = attributeName
          AND timestamp >= minTime
          AND timestamp < maxTime
    )
SELECT
    date_trunc('hour', timestamp)
        + (CASE WHEN EXTRACT(minute FROM timestamp) >= 30 THEN interval '1 hour' ELSE interval '30 minutes' END) AS timeBlock,
    AVG(value) AS avgValue
FROM filtered_data
GROUP BY timeBlock
ORDER BY timeBlock;
END;
$$ LANGUAGE plpgsql;
