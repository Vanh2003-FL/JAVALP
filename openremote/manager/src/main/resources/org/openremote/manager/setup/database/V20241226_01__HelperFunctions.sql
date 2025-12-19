-- hàm
CREATE OR REPLACE FUNCTION usr_sp_getAsset_info_list_by_parentId(IN usr_parent_id VARCHAR)
RETURNS TABLE(id VARCHAR, cabinet_asset_code VARCHAR, asset_code VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT lightAsset.id, lightAssetInfo.cabinet_asset_code, cabinetAssetInfo.asset_code
    FROM asset lightAsset
             INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
             left JOIN asset_info cabinetAssetInfo ON lightAssetInfo.cabinet_id = cabinetAssetInfo.id
    WHERE
        usr_parent_id = ANY(string_to_array(lightAsset.path::text, '.'))
      AND
        lightAsset.type = 'LightAsset';

END;
$$;

-- hàm
CREATE OR REPLACE FUNCTION usr_sp_getAsset_info_list_by_parentId_2(IN usr_parent_id VARCHAR,IN cabinet_asset_codes varchar(5)[])
RETURNS TABLE(id VARCHAR, cabinet_asset_code VARCHAR, asset_code VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT lightAsset.id, lightAssetInfo.cabinet_asset_code, cabinetAssetInfo.asset_code
FROM asset lightAsset
         INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
         left JOIN asset_info cabinetAssetInfo ON lightAssetInfo.cabinet_id = cabinetAssetInfo.id
WHERE
    usr_parent_id = ANY(string_to_array(lightAsset.path::text, '.'))
  AND
    lightAsset.type = 'LightAsset'
  AND lightAssetInfo.cabinet_asset_code = ANY(cabinet_asset_codes);
END;
$$;


-- ham
CREATE OR REPLACE FUNCTION batch_add_attribute(
    id_array VARCHAR[],
    attribute_array TEXT[],
    type_array TEXT[],
    value_array JSONB[]
) RETURNS BOOLEAN AS $$
DECLARE
idx INT;
    result BOOLEAN;
BEGIN
    -- Kiểm tra tất cả các mảng phải có cùng số lượng phần tử
    IF array_length(id_array, 1) IS DISTINCT FROM array_length(attribute_array, 1)
       OR array_length(attribute_array, 1) IS DISTINCT FROM array_length(type_array, 1)
       OR array_length(type_array, 1) IS DISTINCT FROM array_length(value_array, 1) THEN
        RAISE EXCEPTION 'All input arrays must have the same length';
END IF;

    -- Lặp qua từng phần tử trong mảng
FOR idx IN 1 .. array_length(id_array, 1) LOOP
        -- Gọi hàm ADD_ATTRIBUTE
        result := ADD_ATTRIBUTE_2(
            id_array[idx],
            attribute_array[idx],
            type_array[idx],
            value_array[idx],
 			now()
        );
        -- Nếu bất kỳ lần gọi nào trả về false, thoát và trả về false
        IF NOT result THEN
            RETURN FALSE;
END IF;
END LOOP;

    -- Nếu tất cả thành công, trả về true
RETURN TRUE;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION ADD_ATTRIBUTE_2(IDASSETV varchar, ATTRIBUTE_NAME text, ATTRIBUTE_TYPE text, VALUE jsonb, TIME_STAMP timestamp with time zone) RETURNS boolean AS $$
BEGIN
UPDATE asset a
SET attributes[ATTRIBUTE_NAME]=attributes[ATTRIBUTE_NAME]||jsonb_build_object(
            'name', ATTRIBUTE_NAME,
            'type', ATTRIBUTE_TYPE,
            'value', VALUE,
            'timestamp', (extract(epoch from TIME_STAMP AT TIME ZONE 'UTC') * 1000)::bigint)
WHERE a.id = IDASSETV;
RETURN FOUND;
END
$$ LANGUAGE plpgsql;
