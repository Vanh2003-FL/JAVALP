
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
SELECT lightAsset.id, cabinetAssetCabinet.cabinet_asset_code, cabinetAssetInfo.asset_code,sys_cabinet_group.cabinet_grp_code
FROM asset lightAsset
         INNER JOIN asset_info lightAssetInfo ON lightAsset.id=lightAssetInfo.id
         left JOIN asset_cabinet cabinetAssetCabinet ON lightAsset.id = cabinetAssetCabinet.asset_id
         left JOIN asset_info cabinetAssetInfo ON cabinetAssetInfo.id=cabinetAssetCabinet.cabinet_id
         left JOIN asset_cabinet_group asset_cabinet_group ON lightAsset.id = asset_cabinet_group.asset_id
         inner join sys_cabinet_group sys_cabinet_group on asset_cabinet_group.cabinet_grp_id=sys_cabinet_group.cabinet_grp_id
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


-- File: update_sys_cabinet_group.sql

UPDATE sys_cabinet_group
SET cabinet_grp_code = 'line_1'
WHERE cabinet_grp_code = 'P1';

UPDATE sys_cabinet_group
SET cabinet_grp_code = 'line_2'
WHERE cabinet_grp_code = 'P2';

UPDATE sys_cabinet_group
SET cabinet_grp_code = 'line_3'
WHERE cabinet_grp_code = 'P3';

UPDATE sys_cabinet_group
SET cabinet_grp_code = 'line_4'
WHERE cabinet_grp_code = 'P4';



