package org.openremote.manager.asset.cabinet;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.assetInfo.AssetInfoPersistenceService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Constants;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.cabinet.CabinetAssetDTO;
import org.openremote.model.asset.cabinet.CabinetException;
import org.openremote.model.asset.cabinet.CabinetExceptionMapper;
import org.openremote.model.asset.impl.ElectricalCabinetAsset;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.attribute.*;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.routeInfo.RouteInfo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

public class CabinetAssetPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;
    protected AssetStorageService assetStorageService;

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);
        assetStorageService = container.getService(AssetStorageService.class);


        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new CabinetAssetResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
        managerWebService.addApiSingleton(new CabinetExceptionMapper());
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

    private void insertRouteAsset(ElectricalCabinetAsset cabinetAsset, RouteInfo routeInfo, Asset_Info assetInfo) {
        persistenceService.doTransaction(em -> {
            String routeId = null;
            if (validationUtils.isValid(routeInfo)) {
                routeId = routeInfo.getId();
            }
            em.createNativeQuery("""
                                INSERT INTO route_assets (
                                    route_id, asset_id, sys_asset_type_id,
                                    active_date, deactive_date, deleted,
                                    description, create_date, create_by,
                                    update_date, update_by
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """)
                    .setParameter(1, routeId)
                    .setParameter(2, cabinetAsset.getId())
                    .setParameter(3, 2) // ElectricalCabinetAsset
                    .setParameter(4, LocalDate.now()) // active date
                    .setParameter(5, null)
                    .setParameter(6, false) // deleted
                    .setParameter(7, null)
                    .setParameter(8, LocalDate.now())
                    .setParameter(9, assetInfo.getCreateBy())
                    .setParameter(10, null)
                    .setParameter(11, null)
                    .executeUpdate();
        });
    }

    public List<CabinetAssetDTO> getAll(SearchFilterDTO<CabinetAssetDTO> searchFilterDTO, boolean isActiveAndAccessible) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT a.id, a.attributes, a.created_on, a.name, a.parent_id, a.path, ra.value as realm, a.type, a.access_public_read, a.version, ai.status, ai.address " +
                    "FROM asset a " +
                    "left join asset_info ai on ai.id = a.id " +
                    " right join public.realm r on r.name = a.realm " +
                    " inner join PUBLIC.REALM_ATTRIBUTE ra on ra.REALM_ID = r.id and ra.name = 'displayName' " +
                    "where a.type = 'ElectricalCabinetAsset' and ai.deleted = false";
            String routeId = "";
            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                baseQuery += " AND (LOWER(a.name) LIKE LOWER(:name) OR LOWER(ai.asset_code) LIKE LOWER(:name))";
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo().getStatus())) {
                        baseQuery += " AND LOWER(ai.status) LIKE LOWER(:status)";
                    }
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset().getRealm())) {
                        baseQuery += " AND LOWER(a.realm) LIKE LOWER(:realm)";
                    }
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo().getId())) {
                        routeId = searchFilterDTO.getData().getRouteInfo().getId();
                    }
                }
            }

            baseQuery += " ORDER BY GREATEST(COALESCE(ai.update_date, '1970-01-01'), COALESCE(ai.create_date, '1970-01-01')) DESC";

            var query = em.createNativeQuery(baseQuery, ElectricalCabinetAsset.class)
                    .setHint("org.hibernate.readOnly", true);

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                query.setParameter("name", "%" + searchFilterDTO.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo().getStatus())) {
                        query.setParameter("status", "%" + searchFilterDTO.getData().getAssetInfo().getStatus().trim() + "%");
                    }
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset().getRealm())) {
                        query.setParameter("realm", searchFilterDTO.getData().getCabinetAsset().getRealm().trim());
                    }
                }
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) && validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }

            List<ElectricalCabinetAsset> cabinetAssets = query.getResultList();

            List<CabinetAssetDTO> cabinetAssetDTOs = new ArrayList<>();
            for (ElectricalCabinetAsset cabinetAsset : cabinetAssets) {
                Asset_Info assetInfo = getAssetInfoById(cabinetAsset.getId());
                if (validationUtils.isValid(assetInfo)) {
                    // tim kiem theo lo tuyen -- bat dau
                    RouteInfo routeInfo = findRoutesByAssetId(cabinetAsset.getId(), routeId);
                    if (validationUtils.isValid(routeInfo) && validationUtils.isValid(routeId)) {
                        CabinetAssetDTO cabinetAssetDTO = new CabinetAssetDTO(cabinetAsset, assetInfo, routeInfo, null);
                        cabinetAssetDTOs.add(cabinetAssetDTO);
                    }
                    if (!validationUtils.isValid(routeId)) {
                        CabinetAssetDTO cabinetAssetDTO = new CabinetAssetDTO(cabinetAsset, assetInfo, routeInfo, null);
                        cabinetAssetDTOs.add(cabinetAssetDTO);
                    }
                    // ket thuc
                }
            }
            return cabinetAssetDTOs;
        });
    }

    public Long count(SearchFilterDTO<CabinetAssetDTO> searchFilterDTO, boolean isActiveAndAccessible) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT COUNT(a.id) FROM asset a " +
                    "left join asset_info ai on ai.id = a.id " +
                    "left join  route_assets ra on ra.asset_id = a.id " +
                    " where type = 'ElectricalCabinetAsset' and ai.deleted = false";

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                baseQuery += " AND (LOWER(a.name) LIKE LOWER(:name) OR LOWER(ai.asset_code) LIKE LOWER(:name))";
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo().getStatus())) {
                        baseQuery += " AND LOWER(ai.status) LIKE LOWER(:status)";
                    }
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset().getRealm())) {
                        baseQuery += " AND LOWER(a.realm) LIKE LOWER(:realm)";
                    }
                }

                if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo().getId())) {
                        baseQuery += " AND ra.route_id = :routerId";
                    }
                }
            }

            var query = em.createNativeQuery(baseQuery);

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                query.setParameter("name", "%" + searchFilterDTO.getKeyWord().trim() + "%");
            }

            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getAssetInfo().getStatus())) {
                        query.setParameter("status", "%" + searchFilterDTO.getData().getAssetInfo().getStatus().trim() + "%");
                    }
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset())) {
                    if (validationUtils.isValid(searchFilterDTO.getData().getCabinetAsset().getRealm())) {
                        query.setParameter("realm", searchFilterDTO.getData().getCabinetAsset().getRealm().trim());
                    }
                }
            }
            if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getRouteInfo().getId())) {
                    query.setParameter("routerId", searchFilterDTO.getData().getRouteInfo().getId().trim());
                }
            }
            return (Long) query.getSingleResult();
        });
    }

    public boolean updateDeleteStatus(String cabinetAssetId) {
        return persistenceService.doReturningTransaction(em -> {
            int updatedRows = em.createNativeQuery(
                            "UPDATE asset_info SET deleted = true WHERE id = ?"
                    )
                    .setParameter(1, cabinetAssetId)
                    .executeUpdate();

            if (updatedRows > 0) {
                deleteAssetCabinet(em, cabinetAssetId, false);
            }

            return updatedRows > 0;
        });
    }

    private Asset_Info getAssetInfoById(String id) {
        return (Asset_Info) persistenceService.doReturningTransaction(em -> {
            List results = em.createNativeQuery(
                            new StringBuilder("SELECT \n" +
                                    "                ai.id,\n" +
                                    "                ai.asset_code,\n" +
                                    "                ai.create_by,\n" +
                                    "                ai.update_by,\n" +
                                    "                COALESCE(ai.province_id, 0),\n" +
                                    "                COALESCE(ai.district_id, 0),\n" +
                                    "                COALESCE(ai.ward_id, 0),\n" +
                                    "                ai.street_name,\n" +
                                    "                ai.address,\n" +
                                    "                ai.status,\n" +
                                    "                COALESCE(ai.supplier_id, 0),\n" +
                                    "                ai.firmware_version,\n" +
                                    "                ai.asset_model,\n" +
                                    "                ai.serial_number,\n" +
                                    "                ai.deleted,\n" +
                                    "                ai.description\n" +
                                    "            FROM asset_info ai\n" +
                                    "            WHERE ai.id = :id")
                                   .toString(), Asset_Info.class)
                    .setParameter("id", id)
                    .getResultList();

            return results.isEmpty() ? null : results.get(0);
        });
    }

    private void insertCabinetAsset(ElectricalCabinetAsset asset, RouteInfo routeInfo) {
        persistenceService.doTransaction(em -> {
            ObjectMapper objectMapper = new ObjectMapper();
            String parentId = validationUtils.isValid(routeInfo) ? routeInfo.getId() : null;
            try {
                em.createNativeQuery("""
                                    INSERT INTO asset 
                                    (id, attributes, created_on, name, parent_id, path, realm, type, access_public_read, version)
                                    VALUES (?, CAST(? AS jsonb), ?, ?, ?, ?, ?, ?, ?, ?)
                                """)
                        .setParameter(1, asset.getId())
                        .setParameter(2, objectMapper.writeValueAsString(asset.getAttributes()))
                        .setParameter(3, new Date())
                        .setParameter(4, asset.getAssetName()) // name
                        .setParameter(5, parentId) // parent_id
                        .setParameter(6, null) // path
                        .setParameter(7, asset.getRealm()) // realm
                        .setParameter(8, Constants.ELECTRICAL_CABINET_ASSET)
                        .setParameter(9, false)
                        .setParameter(10, 0L)
                        .executeUpdate();
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public void createAssetInfo(Asset_Info assetInfo) {
        persistenceService.doTransaction(em -> {

            em.createNativeQuery("""
                            INSERT INTO asset_info (
                                id, asset_code, create_date, create_by, update_date, update_by,
                                province_id, district_id, ward_id, street_name, address,
                                status, supplier_id, firmware_version, asset_model, serial_number,
                                last_maince_date, next_maince_date, deleted, description
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """)
                    .setParameter(1, assetInfo.getId())
                    .setParameter(2, assetInfo.getAssetCode())
                    .setParameter(3, LocalDateTime.now())
                    .setParameter(4, assetInfo.getCreateBy())
                    .setParameter(5, assetInfo.getUpdateDate())
                    .setParameter(6, assetInfo.getUpdateBy())
                    .setParameter(7, assetInfo.getProvinceId())
                    .setParameter(8, assetInfo.getDistrictId())
                    .setParameter(9, assetInfo.getWardId())
                    .setParameter(10, assetInfo.getStreetName())
                    .setParameter(11, assetInfo.getAddress())
                    .setParameter(12, assetInfo.getStatus())
                    .setParameter(13, assetInfo.getSupplierId())
                    .setParameter(14, "1.0.0") // default value
                    .setParameter(15, assetInfo.getAssetModel())
                    .setParameter(16, assetInfo.getSerialNumber())
                    .setParameter(17, assetInfo.getLastMainceDate())
                    .setParameter(18, assetInfo.getNextMainceDate())
                    .setParameter(19, false)
                    .setParameter(20, assetInfo.getDescription())
                    .executeUpdate();
        });
    }

    private RouteInfo findRoutesByAssetId(String assetId, String routeId) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "SELECT ri.id, ri.route_name FROM route_assets ra JOIN route_info ri ON ri.id = ra.route_id WHERE ra.asset_id = :assetId";
            if (validationUtils.isValid(routeId)) {
                baseQuery += " AND ra.route_id = :routeId";
            }
            var query = em.createNativeQuery(baseQuery, RouteInfo.class);
            query.setParameter("assetId", assetId);
            if (validationUtils.isValid(routeId)) {
                query.setParameter("routeId", routeId);
            }
            List<RouteInfo> list = query.getResultList();
            return list.isEmpty() ? null : list.get(0);
        });
    }

    public List<LightAssetDTO> getLightsBelongToCabinet(String assetId, Integer lampTypeCode, String realm) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder baseQuery = new StringBuilder(
                    "SELECT " +
                            "ai.id, " +
                            "mlt.id, " +
                            "ai.asset_code, " +
                            "lightAsset.name, " +
                            "mlt.lamp_type_name, " +
                            "CASE WHEN lampPostAsset.id IS NOT NULL THEN lampPostAsset.name ELSE NULL END AS poleName, " +
                            "mlt.power_consumption, " +
                            "mlt.luminous_flux, " +
                            "mlt.life_hours, " +
                            "ai.status " +
                            "FROM asset_info ai " +
                            "INNER JOIN asset lightAsset ON lightAsset.id = ai.id AND lightAsset.type = 'LightAsset' " +
                            "LEFT JOIN asset lampPostAsset ON lampPostAsset.id = lightAsset.parent_id AND lampPostAsset.type = 'LampPostAsset' " +
                            "INNER JOIN route_lamppost_detail rld ON rld.asset_id = ai.id " +
                            "INNER JOIN md_lamp_type mlt ON mlt.id = rld.lamp_type_id " +
                            " where 1 = 1 and ai.deleted = false "
            );

            if (validationUtils.isValid(lampTypeCode)) {
                baseQuery.append(" and mlt.id = :lampTypeCode");
            }

            if (validationUtils.isValid(realm)) {
                baseQuery.append(" and lightAsset.realm = :realm");
            }

            if (validationUtils.isValid(assetId)) {
                baseQuery.append(" and ai.id in (select asset_id from asset_cabinet where cabinet_id = :assetId)");

                Query query = em.createNativeQuery(baseQuery.toString(), LightAssetDTO.class)
                        .setParameter("assetId", assetId);

                if (validationUtils.isValid(lampTypeCode)) {
                    query.setParameter("lampTypeCode", lampTypeCode) ;
                }
                if (validationUtils.isValid(realm)) {
                    query.setParameter("realm", realm);
                }
                List<LightAssetDTO> results = query.getResultList();

                for (LightAssetDTO lightAssetDTO : results) {
                    Asset<?> asset = assetStorageService.find(lightAssetDTO.getId());
                    lightAssetDTO.setAsset(asset);
                }

                return results;
            }
            baseQuery.append(" and ai.id not in (select asset_id from asset_cabinet WHERE asset_id IS NOT NULL)");
            Query query = em.createNativeQuery(baseQuery.toString(), LightAssetDTO.class);

            if (validationUtils.isValid(lampTypeCode)) {
                query.setParameter("lampTypeCode", lampTypeCode) ;
            }

            if (validationUtils.isValid(realm)) {
                query.setParameter("realm", realm);
            }

            List<LightAssetDTO> results = query.getResultList();
            return results;
        });
    }

    public CabinetAssetDTO createCabinetAssetExtend(CabinetAssetDTO assetDTO) {
        persistenceService.doTransaction(em -> {
            ElectricalCabinetAsset cabinetAsset = assetDTO.getCabinetAsset();
            Asset_Info assetInfo = assetDTO.getAssetInfo();
            RouteInfo routeInfo = assetDTO.getRouteInfo();
            List<LightAssetDTO> lightAssets = assetDTO.getLightAssetDTOList();

            // check duplicate
            Long count = (Long) em.createNativeQuery(
                            "SELECT COUNT(*) FROM asset_info WHERE LOWER(asset_code) = LOWER(?)")
                    .setParameter(1, assetInfo.getAssetCode().trim())
                    .getSingleResult();

            if (validationUtils.isValid(cabinetAsset) && validationUtils.isValid(cabinetAsset.getId())) {
                String code = (String) em.createNativeQuery(
                                "SELECT asset_code FROM asset_info WHERE id = ?")
                        .setParameter(1, cabinetAsset.getId().trim())
                        .getSingleResult();

                if (count != null && count > 0 && !code.equalsIgnoreCase(assetInfo.getAssetCode().trim())) {
                    throw new CabinetException(AttributeWriteFailure.ALREADY_EXISTS, "Mã code tủ điện '" + assetInfo.getAssetCode() + "' đã tồn tại!");
                }
            } else {
               if (count != null && count > 0) {
                    throw new CabinetException(AttributeWriteFailure.ALREADY_EXISTS, "Mã code tủ điện '" + assetInfo.getAssetCode() + "' đã tồn tại!");
                }
               ElectricalCabinetAsset electricalCabinetAsset = new ElectricalCabinetAsset(cabinetAsset.getAssetName());
                electricalCabinetAsset.setLocation(cabinetAsset.getLocation().get());
                electricalCabinetAsset.setRealm(cabinetAsset.getRealm());
                ElectricalCabinetAsset merge = assetStorageService.merge(electricalCabinetAsset);

                assetInfo.setId(merge.getId());
                cabinetAsset.setId(merge.getId());

                createAssetInfo(assetInfo);

                insertRouteAsset(merge, routeInfo, assetInfo);

                updateParent(em, routeInfo.getId(), cabinetAsset.getId());

                assetDTO.setCabinetAsset(merge);

            }
            //Danh sách ids đèn có trong db
            List<String> currentLightIds = getCabinetAssetExist(em, cabinetAsset.getId());
            // ids đèn từ request
            List<String> newLightIds = lightAssets.stream()
                    .map(LightAssetDTO::getId)
                    .toList();

            //Đèn cần xóa: có trong DB nhưng không có trong request
            List<String> lightsToRemove = currentLightIds.stream()
                    .filter(id -> !newLightIds.contains(id))
                    .toList();

            //Đèn cần thêm: có trong request nhưng chưa có trong DB
            List<String> lightsToAdd = newLightIds.stream()
                    .filter(id -> !currentLightIds.contains(id))
                    .toList();

            if (!lightsToRemove.isEmpty()) {
                removeLightsWithoutCabinet(em, lightsToRemove);
            }

            if (!lightsToAdd.isEmpty()) {
                addLights2Cabinet(em, lightsToAdd, cabinetAsset, assetInfo);
            }
        });
        return assetDTO;
    }

    private void addLights2Cabinet(EntityManager em, List<String> lightsToAdd, ElectricalCabinetAsset cabinetAsset, Asset_Info assetInfo) {
        for (String id : lightsToAdd) {
            em.createNativeQuery("""
                                    INSERT INTO asset_cabinet (
                                        cabinet_id, asset_id,
                                        active_date, deleted,
                                        create_date, update_date, 
                                        create_by, update_by
                                    )
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                    ON CONFLICT (asset_id) DO UPDATE SET
                                        cabinet_id = EXCLUDED.cabinet_id,
                                        active_date = EXCLUDED.active_date,
                                        deleted = EXCLUDED.deleted,
                                        create_date = EXCLUDED.create_date,
                                        update_date = EXCLUDED.update_date,
                                        create_by = EXCLUDED.create_by,
                                        update_by = EXCLUDED.update_by
                                """)
                    .setParameter(1, cabinetAsset.getId())
                    .setParameter(2, id)
                    .setParameter(3, LocalDateTime.now()) // active_date
                    .setParameter(4, false)               // deleted
                    .setParameter(5, LocalDateTime.now())
                    .setParameter(6, LocalDateTime.now())
                    .setParameter(7, assetInfo.getCreateBy())
                    .setParameter(8, assetInfo.getCreateBy())
                    .executeUpdate();
            updateParent(em, cabinetAsset.getId(), id);
        }
    }

    private void removeLightsWithoutCabinet(EntityManager em, List<String> lightsToRemove) {
        String sqlUpdate = "update asset set parent_id = null where id in (?)";
        em.createNativeQuery(sqlUpdate)
                .setParameter(1, lightsToRemove)
                .executeUpdate();

        String sqlDelete = "delete from asset_cabinet where asset_id in (?)";
        em.createNativeQuery(sqlDelete)
                .setParameter(1, lightsToRemove)
                .executeUpdate();
    }

    private List<String> getCabinetAssetExist(EntityManager em, String cabinetId) {
        List<?> result = em.createNativeQuery("select asset_id from asset_cabinet ac where ac.cabinet_grp_id is null and ac.cabinet_id = ?")
                .setParameter(1, cabinetId)
                .getResultList();

        return result.stream()
                .map(Object::toString)
                .toList();
    }

    private void deleteAssetCabinet(EntityManager em, String cabinetId, boolean isUpdateLights) {
        String sql = "update asset set parent_id = null where id in (select asset_id from asset_cabinet where cabinet_id = ?)";
        if (isUpdateLights) {
            sql += " and type = 'LightAsset'";
        }
        // update without parent
        em.createNativeQuery(sql)
                .setParameter(1, cabinetId)
                .executeUpdate();

        //delete asset in cabinet
        em.createNativeQuery("""
                                    DELETE FROM asset_cabinet WHERE cabinet_id = ? and cabinet_grp_id IS NULL 
                            """)
                .setParameter(1, cabinetId)
                .executeUpdate();
    }

    private void updateParent(EntityManager em, String parentId, String id) {
        em.createNativeQuery("update asset set parent_id = ? where id = ?")
                .setParameter(1, parentId)
                .setParameter(2, id)
                .executeUpdate();
    }
}
