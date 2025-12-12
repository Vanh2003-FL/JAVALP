package org.openremote.manager.assetInfo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.AssetProcessingException;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.assetInfo.Asset_Info;
import org.openremote.model.attribute.AttributeEvent;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.cabinetGroup.CabinetGroup;
import org.openremote.model.dto.ImportAssetDTO;
import org.openremote.model.dto.LampTypeAssetDTO;
import org.openremote.model.dto.LightAssetDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.hdi.hdiDTO.routeAsset.RouterAssetCreate;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteAssetCreateDTO;
import org.openremote.model.hdi.hdiDTO.routeInfo.RouteInfoCreateDTO;
import org.openremote.model.lampType.LampType;
import org.openremote.model.routeInfoV.RouteInfoExceptionMapper;
import org.openremote.model.routeInfoV.RouteInfoVException;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class AssetInfoPersistenceService extends RouteBuilder implements ContainerService {

    private static final Logger LOG = Logger.getLogger(AssetInfoPersistenceService.class.getName());
    public static final int PRIORITY = DEFAULT_PRIORITY;
    ;
    private TimerService timerService;
    private ManagerIdentityService identityService;
    protected AssetStorageService assetStorageService;


    public AssetInfoPersistenceService() {
        super();
    }

    protected PersistenceService persistenceService;

    @Override
    public int getPriority() {
        return PRIORITY;
    }

    @Override
    public void configure() throws Exception {
        from("direct:createAssetInfo")
                .routeId("AssetInfoCreateRoute")
                .process(exchange -> {
                    // Lấy thông tin từ message body
//                    InfoDTO assetInfo = exchange.getIn().getBody(InfoDTO.class);

                    // Gọi dịch vụ để cập nhật thông tin tài sản
//                    create(assetInfo);
                })
                .to("log:assetInfoUpdate");
    }

    @Override
    public void init(Container container) throws Exception {
        timerService = container.getService(TimerService.class);
        identityService = container.getService(ManagerIdentityService.class);
        this.persistenceService = container.getService(PersistenceService.class);
        this.assetStorageService = container.getService(AssetStorageService.class); // 👈 Thêm dòng này!

        container.getService(ManagerWebService.class).addApiSingleton(
                new AssetInfoResourceImpl(timerService, identityService, this)
        );

        container.getService(ManagerWebService.class).addApiSingleton(
                new RouteInfoExceptionMapper()
        );

    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    public void createAssetInfo(Asset_Info assetInfo) {
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "INSERT INTO ASSET_INFO (id, asset_code, create_date, update_date) " +
                                    "VALUES (?, ?, ?, ?) " +
                                    "ON CONFLICT (id) DO UPDATE SET " +
                                    "asset_code = EXCLUDED.asset_code, " +
                                    "update_date = EXCLUDED.update_date")
                    .setParameter(1, assetInfo.getId())
                    .setParameter(2, assetInfo.getAssetCode())
                    .setParameter(3, LocalDateTime.now())
                    .setParameter(4, LocalDateTime.now())
                    .executeUpdate();
        });
    }

    public Asset_Info getById(String id) {
        return (Asset_Info) persistenceService.doReturningTransaction(em -> {
            List results = em.createNativeQuery(
                            new StringBuilder()
                                    .append("SELECT ai.id, ai.asset_code, ac.cabinet_asset_code, ac.cabinet_id, ai.status ")
                                    .append("FROM ASSET_INFO AS ai ")
                                    .append("left JOIN asset_cabinet AS ac ON ai.id = ac.asset_id ")
                                    .append("WHERE ai.id = :id and ai.deleted = false ").append("UNION all ")
                                    .append("SELECT ri.id, ri.route_code, '' , '' , '' ")
                                    .append("FROM route_info AS ri ")
                                    .append("WHERE ri.id = :id2").toString(), Asset_Info.class)
                    .setParameter("id", id)
                    .setParameter("id2", id)
                    .getResultList();

            return results.isEmpty() ? null : results.get(0);
        });
    }

    public List<Asset_Info> getByCode(String code, String type, String realm) {
        return persistenceService.doReturningTransaction(em -> {
            List results = em.createNativeQuery(
                            new StringBuilder()
                                    .append("SELECT ai.id, ai.asset_code, '', '', ai.status ")
                                    .append("FROM ASSET_INFO AS ai inner join asset a on ai.id = a.id ")
                                    .append("WHERE ai.asset_code = :code and a.type = :type and a.realm = :realm ").toString(), Asset_Info.class)
                    .setParameter("code", code)
                    .setParameter("type", type)
                    .setParameter("realm", realm)
                    .getResultList();

            return results;
        });
    }

    public Boolean getDeletedRouteAssetsById(String id) {
        return (Boolean) persistenceService.doReturningTransaction(em -> {
            try {
                return em.createNativeQuery(
                                "SELECT ra.deleted FROM route_assets AS ra WHERE ra.asset_id = :asset_id", Boolean.class)
                        .setParameter("asset_id", id)
                        .getSingleResult();
            } catch (NoResultException e) {
                return null; // hoặc return false; nếu mặc định không tìm thấy là false
            }
        });
    }

    public Asset_Info getAssetById(String id) {
        return (Asset_Info) persistenceService.doReturningTransaction(em -> {
            List results = em.createNativeQuery(
                            new StringBuilder()
                                    .append("SELECT ai.id, ai.asset_code, ac.cabinet_asset_code, ac.cabinet_id , ai.status ")
                                    .append("FROM ASSET_INFO AS ai ")
                                    .append("left JOIN asset_cabinet AS ac ON ai.id = ac.asset_id ")
                                    .append("WHERE ai.id = :id ")
                                    .append("UNION all ")
                                    .append("SELECT ri.id, ri.route_code, null ,null ,null ")
                                    .append("FROM route_info AS ri ")
                                    .append("WHERE ri.id = :id2").toString(), Asset_Info.class)
                    .setParameter("id", id)
                    .setParameter("id2", id)
                    .getResultList();

            return results.isEmpty() ? null : results.get(0);
        });
    }

    public LampTypeAssetDTO getInfoLightAsset (String id) {
        return (LampTypeAssetDTO) persistenceService.doReturningTransaction(em -> {
            List<Object[]> results = em.createNativeQuery(
                            new StringBuilder()
                                    .append("select mlt.power_consumption, mlt.luminous_flux, mlt.life_hours ")
                                    .append("from md_lamp_type mlt inner join route_lamppost_detail rld on mlt.id = rld.lamp_type_id ")
                                    .append("where rld.asset_id = :assetId").toString())
                    .setParameter("assetId", id)
                    .getResultList();

            Object[] obj = results.isEmpty() ? null : results.get(0);
            LampType lampType = new LampType();

            if (validationUtils.isValid(obj)) {
                lampType.setPowerConsumption((Integer) obj[0]);
                lampType.setLuminousFlux((Integer) obj[1]);
                lampType.setLifeHours((Integer) obj[2]);
            }
            String firmwareVersion = (String) em.createNativeQuery(
                            "select firmware_version " +
                                    "from asset_info " +
                                    "where id = :assetId")
                    .setParameter("assetId", id)
                    .getSingleResult();
            Asset_Info assetInfo = new Asset_Info();
            assetInfo.setFirmwareVersion(firmwareVersion);

            LampTypeAssetDTO lampTypeAssetDTO = new LampTypeAssetDTO(lampType, assetInfo);
            return lampTypeAssetDTO;
        });
    }

    public void createRouteInfo(Asset_Info routeInfo) {
        try {
            persistenceService.doTransaction(em -> {
                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM route_info WHERE LOWER(route_code) = LOWER(?) AND deleted = false")
                        .setParameter(1, routeInfo.getRouteCodeRI().trim())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new RouteInfoVException(AttributeWriteFailure.ALREADY_EXISTS, "Mã code lộ tuyến '" + routeInfo.getRouteCodeRI() + "' đã tồn tại!");
                }
                em.createNativeQuery(
                                "INSERT INTO route_info (id, route_code, route_name, realm, province_id, district_id, ward_id, street_name, address, status, active_date, deleted, description, create_date, create_by, update_date, update_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                                        "ON CONFLICT (id) DO UPDATE SET " +
                                        "route_code = EXCLUDED.route_code, " +
                                        "route_name = EXCLUDED.route_name, " +
                                        "realm = EXCLUDED.realm, " +
                                        "province_id = EXCLUDED.province_id, " +
                                        "district_id = EXCLUDED.district_id, " +
                                        "ward_id = EXCLUDED.ward_id, " +
                                        "street_name = EXCLUDED.street_name, " +
                                        "address = EXCLUDED.address, " +
                                        "status = EXCLUDED.status, " +
                                        "active_date = EXCLUDED.active_date, " +
                                        "deleted = EXCLUDED.deleted, " +
                                        "description = EXCLUDED.description, " +
                                        "update_date = EXCLUDED.update_date, " +
                                        "update_by = EXCLUDED.update_by")
                        .setParameter(1, routeInfo.getIdRI())
                        .setParameter(2, routeInfo.getRouteCodeRI())
                        .setParameter(3, routeInfo.getRouteNameRI())
                        .setParameter(4, routeInfo.getRealmRI())
                        .setParameter(5, routeInfo.getProvinceIdRI())
                        .setParameter(6, routeInfo.getDistrictIdRI())
                        .setParameter(7, routeInfo.getWardIdRI())
                        .setParameter(8, routeInfo.getStreetNameRI())
                        .setParameter(9, routeInfo.getAddressRI())
                        .setParameter(10, "A") // gia tri status mac dinh khi them moi
//                    .setParameter(11, routeInfo.getActiveDateRI())
                        .setParameter(11, LocalDateTime.now())
                        .setParameter(12, false) // deleted
                        .setParameter(13, routeInfo.getDescriptionRI())
                        .setParameter(14, LocalDateTime.now()) // create_date
                        .setParameter(15, routeInfo.getCreateBy()) // create_by
                        .setParameter(16, LocalDateTime.now()) // update_date
                        .setParameter(17, routeInfo.getUpdateByRI()) // update_by
                        .executeUpdate();
            });
        } catch (RouteInfoVException e) {
            throw e;
        }
    }

    public void updateCabinetGroup(String idCabinet, Asset_Info assetInfo, CabinetGroup cabinetGroup) {
        persistenceService.doTransaction(em -> {
            Long cabinetGroupId = (Long) em.createNativeQuery("""
                            INSERT INTO asset_cabinet_group (
                                asset_id,
                                cabinet_grp_id,
                                is_default,
                                active,
                                create_date,
                                create_by,
                                update_date
                            ) VALUES (
                                ?, ?, ?, ?, ?, ?, ?
                            )
                            RETURNING id
                            """)
                    .setParameter(1, assetInfo.getId())
                    .setParameter(2, cabinetGroup.getId())
                    .setParameter(3, false)
                    .setParameter(4, false)
                    .setParameter(5, Timestamp.valueOf(LocalDateTime.now()))
                    .setParameter(6, assetInfo.getCreateBy())
                    .setParameter(7, Timestamp.valueOf(LocalDateTime.now()))
                    .getSingleResult();

                updateCabinetAssetGroup(em, idCabinet, assetInfo.getId(), cabinetGroupId);
        });

    }

    public Boolean getCabinetGroupByCabinet(String assetId, Long cabinetGroupId) {
        return persistenceService.doReturningTransaction(em -> {
            String baseQuery = "select scg.cabinet_grp_id, scg.cabinet_grp_code, scg.cabinet_grp_name, scg.active, scg.create_date, scg.create_by, scg.update_date, scg.update_by from asset_cabinet ac inner join asset_cabinet_group acg on acg.id = ac.cabinet_grp_id \n" +
                    "inner join sys_cabinet_group scg on acg.cabinet_grp_id = scg.cabinet_grp_id \n" +
                    "where ac.cabinet_id = :assetId and acg.cabinet_grp_id = :cabinetGroupId ";
            var query = em.createNativeQuery(baseQuery, CabinetGroup.class)
                    .setParameter("assetId", assetId)
                    .setParameter("cabinetGroupId", cabinetGroupId);

            return validationUtils.isValid(query.getResultList());
        });
    }

    public void insertCabinetAsset(EntityManager em, String idCabinet, String assetId, Long cabinetGroupId) {
        em.createNativeQuery("""
                            INSERT INTO asset_cabinet (
                                cabinet_id, asset_id, active_date, deleted, create_date, cabinet_grp_id
                            ) VALUES (
                                :cabinetId, :assetId, :activeDate, false, :createDate, :cabinetGrpId
                            )
                        """)
                .setParameter("cabinetId", idCabinet)
                .setParameter("assetId", assetId)
                .setParameter("activeDate", LocalDateTime.now())
                .setParameter("createDate", LocalDateTime.now())
                .setParameter("cabinetGrpId", cabinetGroupId)
                .executeUpdate();
    }

    public void updateCabinetAssetGroup(EntityManager em, String idCabinet, String assetId,Long cabinetGroupId) {
        em.createNativeQuery("""
                            UPDATE asset_cabinet
                            SET cabinet_grp_id = :cabinetGrpId, cabinet_id = :cabinetId 
                            WHERE asset_id = :assetId
                        """)
                .setParameter("cabinetGrpId", cabinetGroupId)
                .setParameter("cabinetId", idCabinet)
                .setParameter("assetId", assetId)
                .executeUpdate();
    }

    public void createRouteAssets(RouteAssetCreateDTO routeAssetCreateDTO) {
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "INSERT INTO route_assets ( route_id, asset_id, sys_asset_type_id, active_date, deactive_date, deleted, description, create_date, create_by, update_date, update_by) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    .setParameter(1, routeAssetCreateDTO.getRouteId())
                    .setParameter(2, routeAssetCreateDTO.getAssetId())
                    .setParameter(3, routeAssetCreateDTO.getSysAssetTypeId())
                    .setParameter(4, LocalDateTime.now())
//                    .setParameter(5, routeAssetCreateDTO.getDeactiveDate())
                    .setParameter(5, LocalDateTime.now())
                    .setParameter(6, routeAssetCreateDTO.getDeleted())
                    .setParameter(7, routeAssetCreateDTO.getDescription())
                    .setParameter(8, LocalDateTime.now())
                    .setParameter(9, routeAssetCreateDTO.getCreateBy())
                    .setParameter(10, LocalDateTime.now())
                    .setParameter(11, routeAssetCreateDTO.getUpdateBy())
                    .executeUpdate();
        });
    }

    public void createAssetCabinet(Asset_Info assetCabinet) {
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "INSERT INTO asset_cabinet (cabinet_id, asset_id, cabinet_asset_code, active_date, deactive_date, deleted, description, create_date, create_by, update_date, update_by) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                                    "ON CONFLICT ( asset_id) DO UPDATE SET " +
                                    "cabinet_asset_code = EXCLUDED.cabinet_asset_code, " +
                                    "active_date = EXCLUDED.active_date, " +
                                    "deactive_date = EXCLUDED.deactive_date, " +
                                    "deleted = EXCLUDED.deleted, " +
                                    "description = EXCLUDED.description, " +
                                    "update_date = EXCLUDED.update_date, " +
                                    "update_by = EXCLUDED.update_by")
                    .setParameter(1, assetCabinet.getCabinetIdAC())
                    .setParameter(2, assetCabinet.getAssetIdAC())
                    .setParameter(3, assetCabinet.getCabinetAssetCodeAC())
                    .setParameter(4, LocalDateTime.now())
                    .setParameter(5, LocalDateTime.now())
                    .setParameter(6, assetCabinet.getDeletedAC())
                    .setParameter(7, assetCabinet.getDescriptionAC())
                    .setParameter(8, LocalDateTime.now()) // create_date
                    .setParameter(9, assetCabinet.getCreateByAC()) // create_by
                    .setParameter(10, LocalDateTime.now()) // update_date
                    .setParameter(11, assetCabinet.getUpdateByAC()) // update_by
                    .executeUpdate();
        });
    }

    public RouterAssetCreate get(String id) {
        List<Object[]> results = persistenceService.doReturningTransaction(entityManager -> entityManager
                .createNativeQuery(new StringBuilder()
                        .append("SELECT ai.id, a.name, ai.status , ac.active_date, ac.deactive_date, ai.update_date, ai.update_by ")
                        .append("FROM ASSET_INFO ai  ")
                        .append("JOIN ASSET a ON a.id=ai.id  ")
                        .append("left JOIN ASSET_CABINET ac ON ac.asset_id=a.id ")
                        .append("WHERE ai.id = :id").toString())
                .setParameter("id", id)
                .getResultList());
        Object[] result = results.get(0);
        return new RouterAssetCreate(result);
    }

    public void deleteRouteAssets(String id) {
        persistenceService.doTransaction(em -> {
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
            ;
        });

    }

    public void updateRouteInfo(RouteInfoCreateDTO routeInfo) {
        try {
            persistenceService.doReturningTransaction(em -> {
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

                return routeInfo;
            });
        } catch (RouteInfoVException e) {
            throw e;
        }
    }

    public List<RouterAssetCreate> getUpdateRoute(String routeId) {
        List<Object[]> results = persistenceService.doReturningTransaction(
                entityManager -> entityManager.createNativeQuery(
                                new StringBuilder().append("SELECT  ")
                                        .append("ai.id, a.name, ai.status , ac.active_date, ac.deactive_date, ai.update_date, ai.update_by, a.type ")
                                        .append("from route_assets ra ")
                                        .append("JOIN  ASSET_INFO ai  on ai.id=ra.asset_id ")
                                        .append("JOIN ASSET a ON a.id=ai.id  ")
                                        .append("left JOIN ASSET_CABINET ac ON ac.asset_id=a.id ")
                                        .append("WHERE ra.route_id = :routeId ")
                                        .append("AND ai.deleted = false ")
                                        .toString())
                        .setParameter("routeId", routeId)
                        .getResultList()
        );
        return results.stream().map(objects -> new RouterAssetCreate(objects, null)).toList();
    }

    public LightAssetDTO getLightById(String assetId) {
        return persistenceService.doReturningTransaction(em -> {
            String sql = """
                        SELECT\s
                            ai.id,
                            ai.asset_code,
                            lightAsset.name,
                            mlt.lamp_type_name,
                            CASE WHEN lampPostAsset.id IS NOT NULL THEN lampPostAsset.name ELSE NULL END AS poleName,
                            mlt.power_consumption,
                            mlt.luminous_flux,
                            mlt.life_hours,
                            ai.firmware_version,
                            lightAsset.attributes -> 'location' -> 'value' -> 'coordinates' ->> 0 AS longitude,
                            lightAsset.attributes -> 'location' -> 'value' -> 'coordinates' ->> 1 AS latitude, 
                            ai.asset_model 
                        FROM asset_info ai
                        INNER JOIN asset lightAsset ON lightAsset.id = ai.id AND lightAsset.type = 'LightAsset'
                        LEFT JOIN asset lampPostAsset ON lampPostAsset.id = lightAsset.parent_id AND lampPostAsset.type = 'LampPostAsset'
                        INNER JOIN route_lamppost_detail rld ON rld.asset_id = ai.id
                        INNER JOIN md_lamp_type mlt ON mlt.id = rld.lamp_type_id
                        WHERE ai.id = :assetId
                    """;
            Query query = em.createNativeQuery(sql);
            query.setParameter("assetId", assetId);

            Object[] row = (Object[]) query.getSingleResult();

            LightAssetDTO dto = new LightAssetDTO();
            dto.setId((String) row[0]);
            dto.setAssetCode((String) row[1]);
            dto.setAssetName((String) row[2]);
            dto.setLampTypeName((String) row[3]);
            dto.setPoleName((String) row[4]);
            dto.setPowerConsumption(row[5] != null ? ((Number) row[5]).intValue() : null);
            dto.setLuminousFlux(row[6] != null ? ((Number) row[6]).intValue() : null);
            dto.setLightingTime(row[7] != null ? ((Number) row[7]).intValue() : null);
            dto.setFirmwareVersion((String) row[8]);
            dto.setLongitude(row[9] != null ? Double.parseDouble((String) row[9]) : null);
            dto.setLatitude(row[10] != null ? Double.parseDouble((String) row[10]) : null);
            dto.setAssetModel((String) row[11]);

            return dto;
        });
    }


    public List<LightAssetDTO> getAllLights(SearchFilterDTO<Asset_Info> searchFilterDTO, String realm) {
        return persistenceService.doReturningTransaction(em -> {
            StringBuilder baseQuery = new StringBuilder(
                    "SELECT " +
                            "ai.id, " +
                            "ai.asset_code, " +
                            "lightAsset.name, " +
                            "mlt.lamp_type_name, " +
                            "CASE WHEN lampPostAsset.id IS NOT NULL THEN lampPostAsset.name ELSE NULL END AS poleName, " +
                            "mlt.power_consumption, " +
                            "mlt.luminous_flux, " +
                            "mlt.life_hours, " +
                            "ai.asset_model " +
                            "FROM asset_info ai " +
                            "INNER JOIN asset lightAsset ON lightAsset.id = ai.id AND lightAsset.type = 'LightAsset' " +
                            "LEFT JOIN asset lampPostAsset ON lampPostAsset.id = lightAsset.parent_id AND lampPostAsset.type = 'LampPostAsset' " +
                            "INNER JOIN route_lamppost_detail rld ON rld.asset_id = ai.id " +
                            "LEFT JOIN md_lamp_type mlt ON mlt.id = rld.lamp_type_id " +
                            "WHERE lightAsset.realm = :realm AND ai.deleted = false "
            );

            // Add filter by assetCode or lampTypeName
            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetCode())) {
                    baseQuery.append("AND LOWER(ai.asset_code) LIKE LOWER(:assetCode) ");
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetName())) {
                    baseQuery.append("AND LOWER(lightAsset.name) LIKE LOWER(:assetName) ");
                }
                if (searchFilterDTO.getData().getLampType() != null &&
                        validationUtils.isValid(searchFilterDTO.getData().getLampType().getLampTypeName())) {
                    baseQuery.append("AND LOWER(mlt.lamp_type_name) LIKE LOWER(:lampTypeName) ");
                }
            }

            baseQuery.append("ORDER BY rld.create_date DESC ");

            Query query = em.createNativeQuery(baseQuery.toString());

            query.setParameter("realm", realm);

            if (validationUtils.isValid(searchFilterDTO.getKeyWord())) {
                query.setParameter("keyword", "%" + searchFilterDTO.getKeyWord().trim() + "%");
            }
            if (validationUtils.isValid(searchFilterDTO.getData())) {
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetCode())) {
                    query.setParameter("assetCode", "%" + searchFilterDTO.getData().getAssetCode().trim() + "%");
                }
                if (validationUtils.isValid(searchFilterDTO.getData().getAssetName())) {
                    query.setParameter("assetName", "%" + searchFilterDTO.getData().getAssetName().trim() + "%");
                }
                if (searchFilterDTO.getData().getLampType() != null &&
                        validationUtils.isValid(searchFilterDTO.getData().getLampType().getLampTypeName())) {
                    query.setParameter("lampTypeName", "%" + searchFilterDTO.getData().getLampType().getLampTypeName().trim() + "%");
                }
            }

            if (validationUtils.isValid(searchFilterDTO.getSize()) && validationUtils.isValid(searchFilterDTO.getPage())) {
                query.setMaxResults(searchFilterDTO.getSize());
                query.setFirstResult((searchFilterDTO.getPage() - 1) * searchFilterDTO.getSize());
            }

            List<Object[]> results = query.getResultList();
            return results.stream()
                    .map(row -> {
                        LightAssetDTO dto = new LightAssetDTO();
                        dto.setId((String) row[0]);
                        dto.setAssetCode((String) row[1]);
                        dto.setAssetName((String) row[2]);
                        dto.setLampTypeName((String) row[3]); // ✅ Lấy thẳng từ SQL, không thông qua getLampType
                        dto.setPoleName((String) row[4]);
                        dto.setPowerConsumption(row[5] != null ? ((Number) row[5]).intValue() : null);
                        dto.setLuminousFlux(row[6] != null ? ((Number) row[6]).intValue() : null);
                        dto.setLightingTime(row[7] != null ? ((Number) row[7]).intValue() : null);
                        dto.setAssetModel((String) row[8]);
                        return dto;
                    })
                    .collect(Collectors.toList());
        });
    }



    public void importAssets(List<ImportAssetDTO> dtos, String realm) {
        for (ImportAssetDTO dto : dtos) {
            String generatedAssetId = UUID.randomUUID().toString().replace("-", "").substring(0, 22);
            LocalDateTime now = LocalDateTime.now();

            // 1. Insert vào bảng asset
            Asset<?> asset = new LightAsset(dto.getName());
            asset.setId(generatedAssetId);
            asset.setName(dto.getName());
            asset.setRealm(realm != null ? realm : "master");
            asset.setCreatedOn(new Date());
            asset.setAccessPublicRead(false);
            assetStorageService.merge(asset);

            // 2. Insert vào bảng asset_info
            persistenceService.doTransaction(em -> {
                em.createNativeQuery(
                                "INSERT INTO asset_info (id, asset_code, status, deleted, firmware_version, asset_model, serial_number, create_by, update_by, create_date, update_date) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, generatedAssetId)
                        .setParameter(2, dto.getAssetCode())
                        .setParameter(3, "A")
                        .setParameter(4, false)
                        .setParameter(5, dto.getFirmwareVersion())
                        .setParameter(6, dto.getAssetModel())
                        .setParameter(7, "")
                        .setParameter(8, dto.getCreatedBy())
                        .setParameter(9, dto.getCreatedBy())
                        .setParameter(10, Timestamp.valueOf(now))
                        .setParameter(11, Timestamp.valueOf(now))
                        .executeUpdate();
            });

            // 3. Lấy ID loại đèn
            Integer lampTypeId = persistenceService.doReturningTransaction(em -> {
                try {
                    return (Integer) em.createNativeQuery("SELECT id FROM md_lamp_type WHERE lamp_type_name = :name")
                            .setParameter("name", dto.getLampType())
                            .getSingleResult();
                } catch (NoResultException e) {
                    return null;
                }
            });

            if (lampTypeId == null) {
                throw new RuntimeException("Không tìm thấy loại đèn: " + dto.getLampType());
            }

            // 4. Kiểm tra lampPostId có tồn tại trong bảng route_lamppost
            Integer lamppostId = null;
            if (dto.getLampPostId() != null) {
                try {

                    Boolean exists = persistenceService.doReturningTransaction(em -> {
                        Long count = ((Number) em.createNativeQuery(
                                        "SELECT COUNT(*) FROM route_lamppost WHERE lamppost_id = :id")
                                .setParameter("id", dto.getLampPostId())
                                .getSingleResult()).longValue();
                        return count > 0;
                    });

                    if (exists) {
                        lamppostId = dto.getLampPostId();
                    }
                } catch (NumberFormatException e) {
                    // Không làm gì, giữ lamppostId là null
                }
            }
            Integer finalLamppostId = lamppostId;
            persistenceService.doTransaction(em -> {
                em.createNativeQuery(
                                "INSERT INTO route_lamppost_detail (lamppost_id, asset_id, lamp_type_id, start_date, end_date, description, create_date, create_by) " +
                                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                        .setParameter(1, finalLamppostId)
                        .setParameter(2, generatedAssetId)
                        .setParameter(3, lampTypeId)
                        .setParameter(4, now.toLocalDate())
                        .setParameter(5, LocalDate.of(2199, 1, 1))
                        .setParameter(6, dto.getDescription())
                        .setParameter(7, Timestamp.valueOf(now))
                        .setParameter(8, dto.getCreatedBy())
                        .executeUpdate();
            });

            // 5. Ghi attribute location nếu có tọa độ
            if (dto.getLongitude() != null && dto.getLatitude() != null) {
                long currentTimestamp = System.currentTimeMillis();
                AttributeEvent locationEvent = new AttributeEvent(
                        generatedAssetId,
                        "location",
                        Map.of(
                                "type", "Point",
                                "coordinates", List.of(dto.getLongitude(), dto.getLatitude())
                        )
                );
                locationEvent.setTimestamp(currentTimestamp);
                locationEvent.setRealm(realm);

                persistenceService.doTransaction(em -> assetStorageService.updateAttribute(em, locationEvent));
            }
        }
    }

    public void createLight(ImportAssetDTO dto, String realm) {
        String generatedAssetId = UUID.randomUUID().toString().replace("-", "").substring(0, 22);
        LocalDateTime now = LocalDateTime.now();
        // Kiểm tra trùng mã đèn (asset_code)
        Long count = persistenceService.doReturningTransaction(em -> {
            return ((Number) em.createNativeQuery(
                            "SELECT COUNT(*) FROM asset_info WHERE LOWER(asset_code) = LOWER(:code)")
                    .setParameter("code", dto.getAssetCode())
                    .getSingleResult()).longValue();
        });

        if (count != null && count > 0) {
            throw new AssetProcessingException(AttributeWriteFailure.ALREADY_EXISTS, "Mã đèn '" + dto.getAssetCode() + "' đã tồn tại!");
        }
        // 1. Insert vào bảng asset
        Asset<?> asset = new LightAsset(dto.getName());
        asset.setId(generatedAssetId);
        asset.setName(dto.getName());
        asset.setRealm(realm != null ? realm : "master");
        asset.setCreatedOn(new Date());
        asset.setAccessPublicRead(false);
        assetStorageService.merge(asset);

        // 2. Insert vào bảng asset_info
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "INSERT INTO asset_info (id, asset_code, status, deleted, firmware_version, asset_model, serial_number, create_by, update_by, create_date, update_date) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    .setParameter(1, generatedAssetId)
                    .setParameter(2, dto.getAssetCode())
                    .setParameter(3, "")
                    .setParameter(4, false)
                    .setParameter(5, dto.getFirmwareVersion())
                    .setParameter(6, dto.getAssetModel())
                    .setParameter(7, "")
                    .setParameter(8, dto.getCreatedBy())
                    .setParameter(9, dto.getCreatedBy())
                    .setParameter(10, Timestamp.valueOf(now))
                    .setParameter(11, Timestamp.valueOf(now))
                    .executeUpdate();
        });

        // 3. Lấy ID loại đèn
        Integer lampTypeId = persistenceService.doReturningTransaction(em -> {
            try {
                return (Integer) em.createNativeQuery("SELECT id FROM md_lamp_type WHERE lamp_type_name = :name")
                        .setParameter("name", dto.getLampType())
                        .getSingleResult();
            } catch (NoResultException e) {
                return null;
            }
        });

        if (lampTypeId == null) {
            throw new RuntimeException("Không tìm thấy loại đèn: " + dto.getLampType());
        }

        // 4. Kiểm tra lampPostId có tồn tại trong bảng route_lamppost
        Integer lamppostId = null;
        if (dto.getLampPostId() != null) {
            try {

                Boolean exists = persistenceService.doReturningTransaction(em -> {
                    Long count2 = ((Number) em.createNativeQuery(
                                    "SELECT COUNT(*) FROM route_lamppost WHERE lamppost_id = :id")
                            .setParameter("id", dto.getLampPostId())
                            .getSingleResult()).longValue();
                    return count2 > 0;
                });

                if (exists) {
                    lamppostId = dto.getLampPostId();
                }
            } catch (NumberFormatException e) {
                // Không làm gì, giữ lamppostId là null
            }
        }
        Integer finalLamppostId = lamppostId;
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "INSERT INTO route_lamppost_detail (lamppost_id, asset_id, lamp_type_id, start_date, end_date, description, create_date, create_by) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                    .setParameter(1, finalLamppostId)
                    .setParameter(2, generatedAssetId)
                    .setParameter(3, lampTypeId)
                    .setParameter(4, LocalDate.of(1970, 1, 1))
                    .setParameter(5, LocalDate.of(2199, 1, 1))
                    .setParameter(6, dto.getDescription())
                    .setParameter(7, Timestamp.valueOf(now))
                    .setParameter(8, dto.getCreatedBy())
                    .executeUpdate();
        });

        // 5. Ghi attribute location nếu có tọa độ
        if (dto.getLongitude() != null && dto.getLatitude() != null) {
            long currentTimestamp = System.currentTimeMillis();
            AttributeEvent locationEvent = new AttributeEvent(
                    generatedAssetId,
                    "location",
                    Map.of(
                            "type", "Point",
                            "coordinates", List.of(dto.getLongitude(), dto.getLatitude())
                    )
            );
            locationEvent.setTimestamp(currentTimestamp);
            locationEvent.setRealm(realm);

            persistenceService.doTransaction(em -> assetStorageService.updateAttribute(em, locationEvent));
        }
    }

    public void editLight(String assetId, ImportAssetDTO dto, String realm) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra trùng mã đèn
        Long duplicateCount = persistenceService.doReturningTransaction(em -> {
            return ((Number) em.createNativeQuery(
                            "SELECT COUNT(*) FROM asset_info WHERE asset_code = :code AND id != :assetId")
                    .setParameter("code", dto.getAssetCode())
                    .setParameter("assetId", assetId)
                    .getSingleResult()).longValue();
        });
        if (duplicateCount != null && duplicateCount > 0) {
            throw new AssetProcessingException(AttributeWriteFailure.ALREADY_EXISTS, "Mã đèn '" + dto.getAssetCode() + "' đã tồn tại.");
        }

        // 1. Cập nhật asset
        Asset<?> asset = assetStorageService.find(assetId);
        if (asset == null) {
            throw new RuntimeException("Không tìm thấy thiết bị với ID: " + assetId);
        }
        asset.setName(dto.getName());
        asset.setRealm(realm != null ? realm : "master");
        asset.setAccessPublicRead(false);
        assetStorageService.merge(asset);

        // 2. Cập nhật asset_info
        persistenceService.doTransaction(em -> {
            em.createNativeQuery(
                            "UPDATE asset_info SET asset_code = ?, firmware_version = ?, update_by = ?, update_date = ?, asset_model = ? " +
                                    "WHERE id = ?")
                    .setParameter(1, dto.getAssetCode())
                    .setParameter(2, dto.getFirmwareVersion())
                    .setParameter(3, dto.getCreatedBy())
                    .setParameter(4, Timestamp.valueOf(now))
                    .setParameter(5, dto.getAssetModel())
                    .setParameter(6, assetId)
                    .executeUpdate();
        });

        // 3. Cập nhật loại đèn
        Integer lampTypeId = persistenceService.doReturningTransaction(em -> {
            try {
                return (Integer) em.createNativeQuery("SELECT id FROM md_lamp_type WHERE lamp_type_name = :name")
                        .setParameter("name", dto.getLampType())
                        .getSingleResult();
            } catch (NoResultException e) {
                return null;
            }
        });
        if (lampTypeId == null) {
            throw new RuntimeException("Không tìm thấy loại đèn: " + dto.getLampType());
        }

        // 4. Cập nhật route_lamppost_detail
        persistenceService.doTransaction(em -> {
            // kiểm tra xem đã có bản ghi chưa
            Long count = ((Number) em.createNativeQuery(
                            "SELECT COUNT(*) FROM route_lamppost_detail WHERE asset_id = :assetId")
                    .setParameter("assetId", assetId)
                    .getSingleResult()).longValue();

            if (count > 0) {
                em.createNativeQuery(
                                "UPDATE route_lamppost_detail SET lamppost_id = ?, lamp_type_id = ?, description = ? " +
                                        "WHERE asset_id = ?")
                        .setParameter(1, dto.getLampPostId())
                        .setParameter(2, lampTypeId)
                        .setParameter(3, dto.getDescription())
                        .setParameter(4, assetId)
                        .executeUpdate();
            }
        });

        // 5. Ghi attribute location nếu có tọa độ
        if (dto.getLongitude() != null && dto.getLatitude() != null) {
            AttributeEvent locationEvent = new AttributeEvent(
                    assetId,
                    "location",
                    Map.of(
                            "type", "Point",
                            "coordinates", List.of(dto.getLongitude(), dto.getLatitude())
                    )
            );
            locationEvent.setTimestamp(System.currentTimeMillis());
            locationEvent.setRealm(realm);
            persistenceService.doTransaction(em -> assetStorageService.updateAttribute(em, locationEvent));
        }
    }

    public boolean deleteLight(String assetId) {
        return persistenceService.doReturningTransaction(em -> {
            // Kiểm tra asset có tồn tại không
            Long count = ((Number) em.createNativeQuery("SELECT COUNT(*) FROM asset WHERE id = :assetId")
                    .setParameter("assetId", assetId)
                    .getSingleResult()).longValue();

            if (count == 0) {
                return false; // Không tìm thấy asset để xoá
            }

            assetStorageService.delete(List.of(assetId));
            // 1. Xoá route_lamppost_detail
//            em.createNativeQuery("DELETE FROM route_lamppost_detail WHERE asset_id = :assetId")
//                    .setParameter("assetId", assetId)
//                    .executeUpdate();

            // 2. Xoá asset_info
//            em.createNativeQuery("DELETE FROM asset_info WHERE id = :assetId")
//                    .setParameter("assetId", assetId)
//                    .executeUpdate();
            em.createNativeQuery("update asset_info SET deleted = true WHERE id = :assetId")
                    .setParameter("assetId", assetId)
                    .executeUpdate();
            // 3. Xoá asset
//            em.createNativeQuery("DELETE FROM asset WHERE id = :assetId")
//                    .setParameter("assetId", assetId)
//                    .executeUpdate();

            return true;
        });
    }


    private boolean lamppostExists(String lamppostIdStr) {
        try {
            Long lamppostId = Long.parseLong(lamppostIdStr);
            return persistenceService.doReturningTransaction(em -> {
                Long count = ((Number) em.createNativeQuery("SELECT COUNT(*) FROM route_lamppost WHERE lamppost_id = ?")
                        .setParameter(1, lamppostId)
                        .getSingleResult()).longValue();
                return count > 0;
            });
        } catch (Exception e) {
            return false;
        }
    }

    public Integer getLightNumberInCabinet(String id) {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = "SELECT COUNT(*) FROM asset a " +
                    "where " +
                    "? = ANY(string_to_array(a.path \\:\\: text, '.')) " +
                    "and " +
                    "a.type = 'LightAsset' ";

            return ((Number) entityManager.createNativeQuery(sql).setParameter(1,id).getSingleResult()).intValue();
        });
    }
}
