
CREATE OR REPLACE FUNCTION usr_sp_getAsset_info_list_by_parentId(IN usr_parent_id VARCHAR)
RETURNS TABLE(id VARCHAR, cabinet_asset_code VARCHAR, asset_code VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT  lightAsset.id, cabinetAssetCabinet.cabinet_asset_code, cabinetAssetInfo.asset_code
FROM asset lightAsset
         INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
         left JOIN asset_cabinet cabinetAssetCabinet ON lightAsset.id = cabinetAssetCabinet.asset_id
         left JOIN asset_info cabinetAssetInfo ON cabinetAssetInfo.id=cabinetAssetCabinet.cabinet_id
WHERE
    usr_parent_id = ANY(string_to_array(lightAsset.path::text, '.'))
  AND
    lightAsset.type = 'LightAsset';
END;
$$;


CREATE OR REPLACE FUNCTION usr_sp_getAsset_info_list_by_parentId_group_light_asset(IN usr_parent_id VARCHAR)
RETURNS TABLE(id VARCHAR, cabinet_asset_code VARCHAR, asset_code VARCHAR, route_grp_code VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT lightAsset.id, cabinetAssetCabinet.cabinet_asset_code, cabinetAssetInfo.asset_code,md_route_group.route_grp_code
FROM asset lightAsset
         INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
         left JOIN asset_cabinet cabinetAssetCabinet ON lightAsset.id = cabinetAssetCabinet.asset_id
         left JOIN asset_info cabinetAssetInfo ON cabinetAssetInfo.id=cabinetAssetCabinet.cabinet_id
         left JOIN route_asset_group route_asset_group ON lightAsset.id = route_asset_group.asset_id
         inner join md_route_group md_route_group on route_asset_group.route_grp_id=md_route_group.id
WHERE
    usr_parent_id = ANY(string_to_array(lightAsset.path::text, '.'))
  AND
    lightAsset.type = 'FixedGroupAsset';
END;
$$;



CREATE OR REPLACE FUNCTION usr_sp_getAsset_info_list_by_parentId_2(IN usr_parent_id VARCHAR,IN cabinet_asset_codes varchar(5)[])
RETURNS TABLE(id VARCHAR, cabinet_asset_code VARCHAR, asset_code VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
RETURN QUERY
SELECT  lightAsset.id, cabinetAssetCabinet.cabinet_asset_code, cabinetAssetInfo.asset_code
FROM asset lightAsset
         INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
         left JOIN asset_cabinet cabinetAssetCabinet ON lightAsset.id = cabinetAssetCabinet.asset_id
         left JOIN asset_info cabinetAssetInfo ON cabinetAssetInfo.id=cabinetAssetCabinet.cabinet_id
WHERE
    usr_parent_id = ANY(string_to_array(lightAsset.path::text, '.'))
  AND
    lightAsset.type = 'LightAsset'
  AND cabinetAssetCabinet.cabinet_asset_code = ANY(cabinet_asset_codes);
END;
$$;

