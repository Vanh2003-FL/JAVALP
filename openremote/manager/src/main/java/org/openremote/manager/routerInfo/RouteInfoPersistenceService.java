package org.openremote.manager.routerInfo;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Constants;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;
import org.openremote.model.routeInfo.*;
import org.openremote.model.routeInfoV.RouteInfoExceptionMapper;
import org.openremote.model.routeInfoV.RouteInfoVException;
import org.postgresql.util.PGobject;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class RouteInfoPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(RouteInfoPersistenceService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;


    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new RouteInfoResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );

        managerWebService.addApiSingleton(
                new RouteInfoExceptionMapper()
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }


    @Override
    public void configure() throws Exception {

    }

    public List<RouteInfoDTO> getAll(SearchFilterDTO<RouteInfo> searchFilterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT ri.id, ri.route_code, ri.route_name, ra.value, ri.province_id, ri.district_id,\n" +
                    "                       ri.ward_id, ri.street_name, ri.address, ri.status, ri.active_date, ri.deleted,\n" +
                    "                       ri.description, ri.create_date, ri.create_by, ri.update_date, ri.update_by\n" +
                    "                FROM route_info ri\n" +
                    " right join asset a on a.id = ri.id " +
                    " right join public.realm r on r.name = ri.realm " +
                    " inner join PUBLIC.REALM_ATTRIBUTE ra on ra.REALM_ID = r.id and ra.name = 'displayName' " +
                    "                WHERE ri.deleted = false";

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                baseQuery += " AND (LOWER(ri.route_name) LIKE LOWER(:KeyWord) OR LOWER(ri.route_code) LIKE LOWER(:KeyWord))";
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getRealm())) {
                    baseQuery += " AND ri.realm = :RealmId";
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getStatus())) {
                    baseQuery += " AND LOWER(ri.status) LIKE LOWER(:status)";
                }
            }

            baseQuery += " ORDER BY GREATEST(COALESCE(update_date, '1970-01-01'), COALESCE(create_date, '1970-01-01')) DESC";

            var query = em.createNativeQuery(baseQuery, RouteInfo.class);

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                query.setParameter("KeyWord", "%" + searchFilterDTO.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getRealm())) {
                    query.setParameter("RealmId", searchFilterDTO.getData().getRealm());
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getStatus())) {
                    query.setParameter("status", searchFilterDTO.getData().getStatus());
                }
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) || validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }
            List<RouteInfo> routeInfoList = query.getResultList();

            List<RouteInfoDTO> routeInfoDTOS = new ArrayList<>();
            for (RouteInfo routeInfo : routeInfoList) {
                RouteInfoDTO routeInfoDTO = new RouteInfoDTO(routeInfo, getAssetByRouteId(routeInfo.getId()));
                routeInfoDTOS.add(routeInfoDTO);
            }
            return routeInfoDTOS;
        });
    }

    private List<RouterAssetCreate> getAssetByRouteId(String id) {
        List<RouterAssetCreate> results =  persistenceService.doReturningTransaction(entityManager -> entityManager
                .createNativeQuery(new StringBuilder()
                        .append("SELECT ai.id, a.name, a.type, ai.status , ac.active_date, ac.deactive_date, ai.update_date, ai.update_by ")
                        .append("FROM ASSET_INFO ai ")
                        .append("JOIN ASSET a ON a.id=ai.id ")
                        .append("left JOIN ASSET_CABINET ac ON ac.asset_id=a.id ")
                        .append("WHERE ai.id in (select asset_id from route_assets ra where ra.route_id= :routeId)").toString(), RouterAssetCreate.class)
                .setParameter("routeId", id)
                .getResultList());
        return results;
    }
    public Long count(SearchFilterDTO<RouteInfo> filterDTO) {
        return persistenceService.doReturningTransaction(em -> {
            RouteInfo routeInfo = filterDTO.getData();
            String baseQuery = """
                        SELECT COUNT(*)
                        FROM route_info ri 
    right join asset a on a.id = ri.id 
                        WHERE ri.deleted = false
                    """;

            if (validationUtils.isValid(filterDTO.getKeyWord())) {
                baseQuery += " AND (LOWER(ri.route_name) LIKE LOWER(:KeyWord) OR LOWER(ri.route_code) LIKE LOWER(:KeyWord))";
            }

            if (validationUtils.isValid(routeInfo)) {
                if (validationUtils.isValid(routeInfo.getRealm())) {
                    baseQuery += " AND ri.realm = :realmId";
                }
                if (validationUtils.isValid(routeInfo.getStatus())) {
                    baseQuery += " AND LOWER(ri.status) LIKE LOWER(:status)";
                }
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(filterDTO.getKeyWord())) {
                query.setParameter("KeyWord", "%" + filterDTO.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(routeInfo)) {
                if (validationUtils.isValid(routeInfo.getRealm())) {
                    query.setParameter("realmId", routeInfo.getRealm());
                }
                if (validationUtils.isValid(routeInfo.getStatus())) {
                    query.setParameter("status", routeInfo.getStatus());
                }
            }

            Object result = query.getSingleResult();
            if (result instanceof Number) {
                return ((Number) result).longValue();
            } else {
                return 0L;
            }
        });
    }

    public RouteInfo updateRouteInfo(RouteInfo routeInfo) {
        try {
            return persistenceService.doReturningTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM route_info WHERE LOWER(route_code) = LOWER(?) AND deleted = false")
                        .setParameter(1, routeInfo.getRouteCode().trim())
                        .getSingleResult();

                String code = (String) em.createNativeQuery(
                                "SELECT route_code FROM route_info WHERE id = ? AND deleted = false")
                        .setParameter(1, routeInfo.getId().trim())
                        .getSingleResult();
                if (count != null && count > 0 && !code.equalsIgnoreCase(routeInfo.getRouteCode().trim())) {
                    throw new RouteInfoVException(AttributeWriteFailure.ALREADY_EXISTS, "Mã code lộ tuyến '" + routeInfo.getRouteCode() + "' đã tồn tại!");
                }
                em.createNativeQuery("""
                                    UPDATE route_info
                                    SET route_code = ?,
                                        route_name = ?,
                                        province_id = ?,
                                        district_id = ?,
                                        ward_id = ?,
                                        address = ?,
                                        status = ?,
                                        description = ?,
                                        update_date = ?,
                                        update_by = ?
                                    WHERE id = ?
                                """)
                        .setParameter(1, routeInfo.getRouteCode())
                        .setParameter(2, routeInfo.getRouteName())
                        .setParameter(3, routeInfo.getProvinceId())
                        .setParameter(4, routeInfo.getDistrictId())
                        .setParameter(5, routeInfo.getWardId())
                        .setParameter(6, routeInfo.getAddress())
                        .setParameter(7, routeInfo.getStatus())
                        .setParameter(8, routeInfo.getDescription())
                        .setParameter(9, LocalDateTime.now())
                        .setParameter(10, routeInfo.getUpdateBy())
                        .setParameter(11, routeInfo.getId())
                        .executeUpdate();

                em.createNativeQuery("""
                                    UPDATE asset_info
                                    SET asset_code = ?
                                    WHERE id = ?
                                """)
                        .setParameter(1, routeInfo.getRouteCode())
                        .setParameter(2, routeInfo.getId())
                        .executeUpdate();

                em.createNativeQuery("""
                                    UPDATE asset
                                    SET name = ?
                                    WHERE id = ?
                                """)
                        .setParameter(1, routeInfo.getRouteName())
                        .setParameter(2, routeInfo.getId())
                        .executeUpdate();

                return routeInfo;
            });
        } catch (RouteInfoVException e) {
            throw e;
        }
    }

    public RouteDetailInfo getInfoDetail(RouteInfo routeInfo) {
        return persistenceService.doReturningTransaction(em -> {
            String routeQuery = """
                        SELECT ri.id, ri.route_code, ri.route_name, ri.realm, ri.province_id, ri.district_id,
                               ri.ward_id, ri.street_name, ri.address, ri.status, ri.active_date, ri.deleted,
                               ri.description, ri.create_date, ue.first_name || ' ' || ue.last_name AS create_by, ri.update_date, ue2.first_name || ' ' || ue2.last_name AS update_by
                        FROM route_info ri left join public.user_entity ue on ri.create_by = ue.username 
                        left join public.user_entity ue2 on ri.update_by = ue2.username 
                        WHERE ri.deleted = false AND ri.id = :routeId
                    """;

            List<RouteInfo> routeInfos = em.createNativeQuery(routeQuery, RouteInfo.class)
                    .setParameter("routeId", routeInfo.getId())
                    .getResultList();

            List<AssetInfoWrapper> assetList = getCabinetAssetsByRouteId(routeInfo.getId(),  routeInfo.getRealm());

            RouteDetailInfo routeDetailInfo = new RouteDetailInfo();
            if (assetList != null && !assetList.isEmpty()) {
                routeDetailInfo.setRouteInfo(routeInfos.get(0));
            }
            return routeDetailInfo;
        });
    }

    public LightCount getLight(String routeId, String realm) {
        return persistenceService.doReturningTransaction(em -> {
            List<AssetInfoWrapper> onLightAssets = new ArrayList<>();
            List<AssetInfoWrapper> offLightAssets = new ArrayList<>();
            List<AssetInfoWrapper> disconnectLightAssets = new ArrayList<>();

            List<Object[]> lightStatusRows = em.createNativeQuery("""
    WITH related_lights AS (
        SELECT a.id, a.name, ai.asset_code, a.attributes, ai.address, ai.status 
        FROM asset a
        JOIN asset_info ai ON a.id = ai.id
        WHERE a.type = 'LightAsset' AND ai.deleted = false
          AND a.id IN (
            SELECT ac.asset_id
            FROM asset_cabinet ac
            JOIN route_assets ra ON ac.cabinet_id = ra.asset_id
            JOIN asset cab ON cab.id = ac.cabinet_id
            JOIN asset_info ai ON cab.id = ai.id
            WHERE ra.route_id = :routeId
              AND cab.type = 'ElectricalCabinetAsset'
              AND ai.deleted = false
              AND cab.realm = :realm

            UNION

            SELECT ra.asset_id
            FROM route_assets ra
            JOIN asset a2 ON a2.id = ra.asset_id
            JOIN asset_info ai ON a2.id = ai.id
            WHERE ra.route_id = :routeId
              AND ai.deleted = false
              AND a2.type = 'LightAsset'
              AND a2.realm = :realm
          )
    )
    SELECT 
        rl.id, rl.name, rl.asset_code, rl.attributes, rl.address,
        (rl.attributes->'assetStatus'->>'value') AS asset_status,
        rl.status
    FROM related_lights rl
""")
                    .setParameter("routeId", routeId)
                    .setParameter("realm", realm)
                    .getResultList();


            ObjectMapper objectMapper = new ObjectMapper();

            for (Object[] row : lightStatusRows) {
                String id = (String) row[0];
                String name = (String) row[1];
                String code = (String) row[2];
                Object attrRaw = row[3];
                String address = (String) row[4];
                String assetStatus = (String) row[5];
                String status = (String) row[6];


                Map<String, Object> attributes = null;
                if (attrRaw != null) {
                    try {
                        if (attrRaw instanceof PGobject pgObj) {
                            attributes = objectMapper.readValue(pgObj.getValue(), Map.class);
                        } else if (attrRaw instanceof String jsonStr) {
                            attributes = objectMapper.readValue(jsonStr, Map.class);
                        }
                    } catch (Exception e) {
                        System.out.println("Lỗi parse attribute: " + e.getMessage());
                    }
                }

                AssetV2 dto = new AssetV2();
                dto.setId(id);
                dto.setName(name);
                dto.setAttributes(attributes);

                Asset_Info ai = new Asset_Info();
                ai.setControlByCabinet(true);
                ai.setActive(true);
                ai.setAddress(address);
                ai.setAssetCode(code);
                ai.setStatus(status);

                AssetInfoWrapper wrapper = new AssetInfoWrapper(dto, ai);
                if (assetStatus != null) {
                    if (assetStatus.equalsIgnoreCase(Constants.DISCONNECT)) {
                        disconnectLightAssets.add(wrapper);
                    } else if (assetStatus.equalsIgnoreCase(Constants.ACTIVE)) {
                        onLightAssets.add(wrapper);
                    } else {
                        offLightAssets.add(wrapper);
                    }
                }

            }

            Integer onLight = onLightAssets.size();
            Integer offLight = offLightAssets.size();
            Integer disconnectLight = disconnectLightAssets.size();
            return new LightCount(onLight + offLight + disconnectLight, onLight, offLight, disconnectLight, offLightAssets, onLightAssets, disconnectLightAssets);
        });
    }

    public Map<String, Integer> getAssetTypeCountsByRoute(EntityManager em, String routeId, String realm) {
        List<Object[]> results = em.createNativeQuery("""
                            SELECT ai.type, COUNT(*) AS total
                            FROM asset ai
                            JOIN route_assets ra ON ai.id = ra.asset_id
                            inner join asset_info a on ai.id = a.id 
                            WHERE ra.route_id = :routeId and ai.realm = :realm 
                              AND ai.type IN ('LightAsset', 'ElectricalCabinetAsset') and a.deleted = false 
                            GROUP BY ai.type
                        """)
                .setParameter("routeId", routeId)
                .setParameter("realm", realm)
                .getResultList();

        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));
    }

    public Map<String, Integer> getStatusAssetInfoCount(EntityManager em, String routeId, String realm) {
        List<Object[]> results = em.createNativeQuery("""
                            SELECT ai.status, COUNT(*) AS total
                                                FROM asset_info ai
                                                JOIN asset a ON ai.id = a.id
                                                JOIN route_assets ra ON a.id = ra.asset_id
                                                WHERE ra.route_id = :routeId and a.realm = :realm 
                                                  AND a.type = 'ElectricalCabinetAsset' and ai.deleted = false 
                                                GROUP BY ai.status
                        """)
                .setParameter("routeId", routeId)
                .setParameter("realm", realm)
                .getResultList();

        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));
    }

    public boolean updateDeleteStatus(String id) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRouteInfo = em.createNativeQuery(
                            "UPDATE route_info SET deleted = true WHERE id = ?"
                    )
                    .setParameter(1, id)
                    .executeUpdate();
            int updateAssetInfo = em.createNativeQuery(
                            "UPDATE asset_info SET deleted = true WHERE id = ?"
                    )
                    .setParameter(1, id)
                    .executeUpdate();

            deleteRouteAssets(em, id);

            return updatedRouteInfo > 0 && updateAssetInfo > 0;
        });
    }

    public void deleteRouteAssets(EntityManager em, String id) {
            // update without parent
            em.createNativeQuery("update asset set parent_id = null where id in (select asset_id from route_assets where route_id = ?)")
                    .setParameter(1, id)
                    .executeUpdate();

            if (em.createNativeQuery("select FROM route_info WHERE id = :id")
                    .setParameter("id", id)
                    .getSingleResult() != null) {
                em.createNativeQuery("DELETE FROM route_assets WHERE route_id = :id2")
                        .setParameter("id2", id)
                        .executeUpdate();
            }
    }

    public List<AssetInfoWrapper> getCabinetAssetsByRouteId(String routeId, String realm) {
        return persistenceService.doReturningTransaction(em -> {
            List<Object[]> results = em.createNativeQuery("""
                                SELECT a.id, a.name, a.type, a.attributes, ai.status, ai.address, ai.asset_code   
                                FROM asset_info ai
                                JOIN asset a ON ai.id = a.id
                                JOIN route_assets ra ON a.id = ra.asset_id
                                WHERE ra.route_id = :assetId
                                  AND a.type = 'ElectricalCabinetAsset' and ai.deleted = false and a.realm = :realm 
                            """)
                    .setParameter("assetId", routeId)
                    .setParameter("realm", realm)
                    .getResultList();

            List<AssetInfoWrapper> assetList = new ArrayList<>();
            ObjectMapper objectMapper = new ObjectMapper();

            for (Object[] row : results) {
                String id = (String) row[0];
                String name = (String) row[1];
                String type = (String) row[2];
                String status = (String) row[4];
                String address = (String) row[5];
                String code = (String) row[6];

                Map<String, Object> attributes = null;
                Object attrRaw = row[3];

                if (attrRaw != null) {
                    try {
                        if (attrRaw instanceof PGobject pgObj) {
                            attributes = objectMapper.readValue(pgObj.getValue(), Map.class);
                        } else if (attrRaw instanceof String jsonStr) {
                            attributes = objectMapper.readValue(jsonStr, Map.class);
                        }
                    } catch (Exception e) {
                        System.out.println(e);
                    }
                }

                AssetV2 dto = new AssetV2();
                dto.setId(id);
                dto.setName(name);
                dto.setType(type);
                dto.setAttributes(attributes);

                Asset_Info ai = new Asset_Info();
                ai.setControlByCabinet(true);
                ai.setActive(true);
                ai.setStatus(status);
                ai.setAddress(address);
                ai.setAssetCode(code);

                AssetInfoWrapper assetInfoWrapper = new AssetInfoWrapper(dto, ai);

                assetList.add(assetInfoWrapper);
            }

            return assetList;
        });
    }

    public RouteInfo getRouterAndCabinetCount(String realm) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = """
            SELECT 
                (SELECT COUNT(*)
                 FROM route_info ri 
                 INNER JOIN asset a ON a.id = ri.id 
                 WHERE ri.deleted = false AND a.realm = :realm) AS router,
                (SELECT COUNT(*) 
                 FROM asset ab 
                 INNER JOIN asset_info ai ON ab.id = ai.id
                 WHERE ai.deleted = false AND ab.realm = :realm AND ab.type = 'ElectricalCabinetAsset') AS cabinet, 
        (SELECT COUNT(*)
                 FROM route_info ri 
                 INNER JOIN asset a ON a.id = ri.id 
                 WHERE ri.deleted = false AND a.realm = :realm and ri.status = :statusActive) AS routerActive,
                (SELECT COUNT(*) 
                 FROM asset ab 
                 INNER JOIN asset_info ai ON ab.id = ai.id
                 WHERE ai.deleted = false AND ab.realm = :realm AND ab.type = 'ElectricalCabinetAsset' and ai.status = :statusDisconnect) AS cabinetDisconnect
        """;

            Object[] result = (Object[]) em.createNativeQuery(baseQuery)
                    .setParameter("realm", realm)
                    .setParameter("statusActive", Constants.ACTIVE)
                    .setParameter("statusDisconnect", Constants.DISCONNECT)
                    .getSingleResult();

            Long routerCount = ((Number) result[0]).longValue();
            Long cabinetCount = ((Number) result[1]).longValue();
            Long routerActive = ((Number) result[2]).longValue();
            Long cabinetDisconnect = ((Number) result[3]).longValue();

            RouteInfo r = new RouteInfo();
            r.setRouterCount(routerCount);
            r.setCabinetCount(cabinetCount);
            r.setRouterCountActive(routerActive);
            r.setCabinetCountActive(cabinetCount - cabinetDisconnect);

            return r;
        });
    }


}
