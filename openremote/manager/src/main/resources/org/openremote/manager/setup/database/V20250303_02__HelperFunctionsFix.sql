
CREATE OR REPLACE FUNCTION get_cabinet_metrics_by_parentid_2(
    IN usr_parent_id VARCHAR,
    IN start_time TIMESTAMP,
    IN end_time TIMESTAMP
)
RETURNS TABLE (
    "idR" VARCHAR,
    "nameR" VARCHAR,
    "nameC" VARCHAR,
    "idC" VARCHAR,
    "voltagePhase1" NUMERIC,
    "amperagePhase1" NUMERIC,
    "wattageActualPhase1" NUMERIC,
    "voltagePhase2" NUMERIC,
    "amperagePhase2" NUMERIC,
    "wattageActualPhase2" NUMERIC,
    "voltagePhase3" NUMERIC,
    "amperagePhase3" NUMERIC,
    "wattageActualPhase3" NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
rec RECORD;
BEGIN
RETURN QUERY
    WITH cabinet_assets AS (
            SELECT id, name FROM get_cabinet_asset_by_parentid_h(usr_parent_id)
        )
SELECT
    (
        SELECT r.id
        FROM asset t
                 inner join asset r on( (r.id::TEXT = ANY(string_to_array(t.path::text, '.'))) and (r.type ='RoadAsset'))
        where
            t.id=usr_parent_id
        limit 1
    ) AS "ID lộ",
    (
	SELECT r.name 
	FROM asset t
	inner join asset r on( (r.id::TEXT = ANY(string_to_array(t.path::text, '.'))) and (r.type ='RoadAsset'))
	where
		t.id=usr_parent_id
	limit 1
	) AS "Tên lộ",
    ca.name,
    a.entity_id,
    AVG(CASE WHEN a.attribute_name = 'voltagePhase1' THEN a.value::numeric END) AS "Điện áp (V) - Pha 1",
    AVG(CASE WHEN a.attribute_name = 'amperagePhase1' THEN a.value::numeric END) AS "Dòng điện (A) - Pha 1",
    AVG(CASE WHEN a.attribute_name = 'wattageActualPhase1' THEN a.value::numeric END) AS "Công suất tiêu thụ (KWh) - Pha 1",

    AVG(CASE WHEN a.attribute_name = 'voltagePhase2' THEN a.value::numeric END) AS "Điện áp (V) - Pha 2",
    AVG(CASE WHEN a.attribute_name = 'amperagePhase2' THEN a.value::numeric END) AS "Dòng điện (A) - Pha 2",
    AVG(CASE WHEN a.attribute_name = 'wattageActualPhase2' THEN a.value::numeric END) AS "Công suất tiêu thụ (KWh) - Pha 2",

    AVG(CASE WHEN a.attribute_name = 'voltagePhase3' THEN a.value::numeric END) AS "Điện áp (V) - Pha 3",
    AVG(CASE WHEN a.attribute_name = 'amperagePhase3' THEN a.value::numeric END) AS "Dòng điện (A) - Pha 3",
    AVG(CASE WHEN a.attribute_name = 'wattageActualPhase3' THEN a.value::numeric END) AS "Công suất tiêu thụ (KWh) - Pha 3"
FROM openremote.asset_datapoint a
    JOIN cabinet_assets ca ON a.entity_id = ca.id
WHERE a.timestamp BETWEEN start_time AND end_time
GROUP BY usr_parent_id, ca.name, a.entity_id;

END;
$$;
