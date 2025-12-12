package org.openremote.manager.lamppost;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.http.RequestParams;
import org.openremote.model.lampType.LampType;
import org.openremote.model.lamppost.dtoLamppost.LamppostLightDTO;
import org.openremote.model.query.LamppostQuery;
import org.openremote.model.lamppost.dtoLamppost.Lamppost;
import org.openremote.model.lamppost.dtoLamppost.LamppostCreateDTO;
import org.openremote.model.lamppost.dtoLamppost.LamppostDTO;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class LamppostStorageService implements ContainerService {
    protected PersistenceService persistenceService;
    protected LamppostStorageService lamppostStorageService;
    protected ManagerIdentityService identityService;
    protected TimerService timerService;
    @Override
    public int getPriority() {
        return ContainerService.super.getPriority();
    }

    @Override
    public void init(Container container) throws Exception {
        persistenceService= container.getService(PersistenceService.class);
        identityService= container.getService(ManagerIdentityService.class);
        timerService= container.getService(TimerService.class);
        container.getService(ManagerWebService.class).addApiSingleton(
                new LamppostResourceImpl(persistenceService,timerService, identityService,this)
        );
    }

    @Override
    public void start(Container container) throws Exception {

    }

    @Override
    public void stop(Container container) throws Exception {

    }

    // File: LamppostService.java
    // File: LamppostService.java
//    public List<?> getAll(String realm, LamppostQuery lamppostQuery, String routerId) {
//        return persistenceService.doReturningTransaction(entityManager -> {
//            StringBuilder sql = new StringBuilder();
//            sql.append("SELECT rl.lamppost_id, a.attributes['location'], lt.lamp_type_name ,a.name, lt.id, a.id ")
//                    .append("FROM route_lamppost rl ")
//                    .append("JOIN route_lamppost_detail rld ON rld.lamppost_id = rl.lamppost_id AND rld.end_date = '2199-01-01' ")
//                    .append("JOIN md_lamp_type lt ON lt.id = rld.lamp_type_id ")
//                    .append("JOIN asset_info ai ON ai.id = rld.asset_id ")
//                    .append("JOIN asset a ON a.id = ai.id ")
//                    .append("WHERE a.realm = :realm ");
//            if (lamppostQuery.getLamppostId() != null) {
//                sql.append("AND rl.lamppost_id = :lamppost_id ");
//            }
//            if (lamppostQuery.getLampTypeId() != null) {
//                sql.append("AND lt.id = :lamp_type_id ");
//            }
//            if (lamppostQuery.getNemaName() != null && !lamppostQuery.getNemaName().isEmpty()) {
//                sql.append("AND unaccent(lower(a.name)) LIKE unaccent(lower(CONCAT('%', :nema_name, '%'))) ");
//            }
//            if(routerId != null && !routerId.isEmpty()) {
//                sql.append("AND rl.route_id = :router_id ");
//            }
//            sql.append("ORDER BY a.name");
//
//            Query nativeQuery = entityManager.createNativeQuery(sql.toString(), LamppostDTO.class);
//            nativeQuery.setParameter("realm", realm);
//
//            if (lamppostQuery.getLamppostId() != null) {
//                nativeQuery.setParameter("lamppost_id", lamppostQuery.getLamppostId());
//            }
//            if (lamppostQuery.getLampTypeId() != null) {
//                nativeQuery.setParameter("lamp_type_id", lamppostQuery.getLampTypeId());
//            }
//            if (lamppostQuery.getNemaName() != null && !lamppostQuery.getNemaName().isEmpty()) {
//                nativeQuery.setParameter("nema_name", lamppostQuery.getNemaName());
//            }
//            if (routerId != null && !routerId.isEmpty()) {
//                nativeQuery.setParameter("router_id", routerId);
//            }
//
//            int page = lamppostQuery.getPageNumber() <= 0 ? 0 : lamppostQuery.getPageNumber() - 1;
//            int size = lamppostQuery.getPageSize() <= 0 ? 10 : lamppostQuery.getPageSize();
//
//            nativeQuery.setFirstResult(page * size);
//            nativeQuery.setMaxResults(size);
//
//            return nativeQuery.getResultList();
//        });
//    }
    public List<LamppostDTO> getAll(String realm, LamppostQuery lamppostQuery, String routerId, String lamppostName) {
        return persistenceService.doReturningTransaction(entityManager -> {
            try {
                StringBuilder sql = new StringBuilder();
                sql.append("SELECT " +
                                "rl.lamppost_id , " +
                                "rl.route_id , " +
                                "rl.lamppost_code , " +
                                "rl.lamppost_name , " +
                                "rl.description , " +
                                "rl.active  ")
                        .append("FROM route_lamppost rl ")
                        .append("JOIN route_info ri ON ri.id = rl.route_id ")
                        .append("JOIN asset a ON a.id = ri.id ")
                        .append("WHERE a.realm = :realm ");

                if (lamppostQuery.getLamppostId() != null) {
                    sql.append("AND rl.lamppost_id = :lamppost_id ");
                }

                if (routerId != null && !routerId.isEmpty()) {
                    sql.append("AND rl.route_id = :route_id ");
                }

                if (lamppostName != null && !lamppostName.isEmpty()) {
                    sql.append("AND LOWER(rl.lamppost_name) like LOWER(:lamppost_name) ");
                }
                sql.append("ORDER BY rl.create_date DESC ");
                Query nativeQuery = entityManager.createNativeQuery(sql.toString());

                nativeQuery.setParameter("realm", realm);

                if (lamppostQuery.getLamppostId() != null) {
                    nativeQuery.setParameter("lamppost_id", lamppostQuery.getLamppostId());
                }

                if (routerId != null && !routerId.isEmpty()) {
                    nativeQuery.setParameter("route_id", routerId); // Đã sửa tên tham số từ router_id thành route_id
                }

                if (lamppostName != null && !lamppostName.isEmpty()) {
                    nativeQuery.setParameter("lamppost_name", "%" + lamppostName.trim() + "%");
                }

                int page = lamppostQuery.getPageNumber() == null ? 0 : lamppostQuery.getPageNumber() - 1;
                int size = lamppostQuery.getPageSize() == null ? 0 : lamppostQuery.getPageSize();

                if (page > -1 && size > 0) {
                    nativeQuery.setFirstResult(page * size);
                    nativeQuery.setMaxResults(size);
                }
                // ✅ Ánh xạ thủ công từ Object[] sang LamppostDTO
                List<Object[]> resultList = nativeQuery.getResultList();
                List<LamppostDTO> lampposts = new ArrayList<>();

                for (Object[] row : resultList) {
                    Integer lamppostId = row[0] != null ? ((Number) row[0]).intValue() : null;
                    String routeId = (String) row[1];
                    String lamppostCode = (String) row[2];
                    String lamppostNameTemp = (String) row[3];
                    String description = row[4] != null ? (String) row[4] : null;
                    Boolean active = row[5] != null ? (Boolean) row[5] : null;
                    lampposts.add(new LamppostDTO(lamppostId, routeId, lamppostCode, lamppostNameTemp, description, active));
                }

                return lampposts;
            } catch (Exception e) {
                // Ghi log ngoại lệ
                e.printStackTrace();
                throw new RuntimeException(e);
            }
        });
    }

    public Long getWattageActual(Integer lamppostId) {
        String sql = """
        WITH filtered_data AS (
            SELECT 
                ad.timestamp,
                ad.entity_id,
                CAST(ad.value AS double precision) AS watt
            FROM asset_datapoint ad
            WHERE ad.attribute_name = 'wattageActual'
              AND ad.timestamp >= date_trunc('month', now())
              AND ad.timestamp <= now()
              AND CAST(ad.value AS double precision) > 0
              AND ad.entity_id IN (
                  SELECT rld.asset_id 
                  FROM route_lamppost_detail rld 
                  WHERE rld.lamppost_id = ?1
              )
        ),
        first_value_cte AS (
            SELECT entity_id, watt AS start_watt
            FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY timestamp ASC) AS rn
                FROM filtered_data
            ) t
            WHERE rn = 1
        ),
        last_value_cte AS (
            SELECT entity_id, watt AS end_watt
            FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY timestamp DESC) AS rn
                FROM filtered_data
            ) t
            WHERE rn = 1
        )
        SELECT SUM(end_watt - start_watt) AS wattage_diff
        FROM first_value_cte f
        JOIN last_value_cte l ON f.entity_id = l.entity_id
        """;

        try {
            return persistenceService.doReturningTransaction (em -> {
                Object result = em.createNativeQuery(sql)
                        .setParameter(1, lamppostId)
                        .getSingleResult();

                return result != null ? ((Number) result).longValue() : 0L;
            });

        } catch (NoResultException e) {
            return 0L;
        }
    }

    public Long getWattageProduct(Integer lamppostId) {
        StringBuilder sql = new StringBuilder("WITH lamp_assets AS (\n" +
                "  SELECT rld.asset_id, mlt.power_consumption\n" +
                "  FROM route_lamppost_detail rld\n" +
                "  JOIN md_lamp_type mlt ON mlt.id = rld.lamp_type_id\n" +
                "  WHERE rld.lamppost_id = ?\n" +
                "),\n" +
                "filtered_datapoints AS (\n" +
                "  SELECT ad.entity_id AS asset_id, ad.timestamp,\n" +
                "         CAST(ad.value AS double precision) AS watt\n" +
                "  FROM asset_datapoint ad\n" +
                "  JOIN lamp_assets la ON ad.entity_id = la.asset_id\n" +
                "  WHERE ad.attribute_name = 'wattageActual'\n" +
                "    AND ad.timestamp >= date_trunc('month', now())\n" +
                "    AND ad.timestamp <= now()\n" +
                "),\n" +
                "wattage_with_lag AS (\n" +
                "  SELECT *,\n" +
                "         LAG(watt) OVER (PARTITION BY asset_id ORDER BY timestamp) AS prev_watt\n" +
                "  FROM filtered_datapoints\n" +
                "),\n" +
                "transitions AS (\n" +
                "  SELECT *,\n" +
                "         CASE \n" +
                "           WHEN prev_watt = 0 AND watt > 0 THEN 'on'\n" +
                "           WHEN prev_watt > 0 AND watt = 0 THEN 'off'\n" +
                "           ELSE NULL\n" +
                "         END AS transition\n" +
                "  FROM wattage_with_lag\n" +
                "),\n" +
                "on_times AS (\n" +
                "  SELECT asset_id, timestamp AS start_time\n" +
                "  FROM transitions\n" +
                "  WHERE transition = 'on'\n" +
                "),\n" +
                "off_times AS (\n" +
                "  SELECT asset_id, timestamp AS end_time\n" +
                "  FROM transitions\n" +
                "  WHERE transition = 'off'\n" +
                "),\n" +
                "paired_times AS (\n" +
                "  SELECT \n" +
                "    ot.asset_id,\n" +
                "    ot.start_time,\n" +
                "    (\n" +
                "      SELECT MIN(end_time)\n" +
                "      FROM off_times oft\n" +
                "      WHERE oft.asset_id = ot.asset_id AND oft.end_time > ot.start_time\n" +
                "    ) AS end_time\n" +
                "  FROM on_times ot\n" +
                "),\n" +
                "lamp_usage AS (\n" +
                "  SELECT asset_id,\n" +
                "         SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0) AS total_hours_on\n" +
                "  FROM paired_times\n" +
                "  WHERE end_time IS NOT NULL\n" +
                "  GROUP BY asset_id\n" +
                ")\n" +
                "SELECT \n" +
                "  ROUND(la.power_consumption * COALESCE(lu.total_hours_on, 0), 2) AS total_consumption_wh\n" +
                "FROM lamp_assets la\n" +
                "LEFT JOIN lamp_usage lu ON la.asset_id = lu.asset_id;\n");

        try {
            return persistenceService.doReturningTransaction (em -> {
                List result = em.createNativeQuery(String.valueOf(sql))
                        .setParameter(1, lamppostId)
                        .getResultList();
                Long productWattage = 0L;
                if (!result.isEmpty()) {
                    for (Object o : result) {
                        productWattage += ((Number) o).longValue();
                    }
                }
                return productWattage;
            });
        } catch (NoResultException e) {
            return 0L;
        }
    }

    public Long countAll(String realm, LamppostQuery lamppostQuery, String routerId, String lamppostName) {
        return persistenceService.doReturningTransaction(entityManager -> {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT COUNT(*) ")
                    .append("FROM route_lamppost rl ")
                    .append("JOIN route_info ri ON ri.id = rl.route_id ")
                    .append("JOIN asset a ON a.id = ri.id ")
                    .append("WHERE a.realm = :realm ");

            if (lamppostQuery.getLamppostId() != null) {
                sql.append("AND rl.lamppost_id = :lamppost_id ");
            }

            if (routerId != null && !routerId.isEmpty()) {
                sql.append("AND rl.route_id = :route_id ");
            }

            if (lamppostName != null && !lamppostName.isEmpty()) {
                sql.append("AND LOWER(rl.lamppost_name) like LOWER(:lamppost_name) ");
            }

            Query countQuery = entityManager.createNativeQuery(sql.toString());
            countQuery.setParameter("realm", realm);

            if (lamppostQuery.getLamppostId() != null) {
                countQuery.setParameter("lamppost_id", lamppostQuery.getLamppostId());
            }

            if (routerId != null && !routerId.isEmpty()) {
                countQuery.setParameter("route_id", routerId);
            }

            if (lamppostName != null && !lamppostName.isEmpty()) {
                countQuery.setParameter("lamppost_name", "%" + lamppostName.trim() + "%");
            }

            Number count = (Number) countQuery.getSingleResult();
            return count.longValue();
        });
    }


    //    public Lamppost create(LamppostCreateDTO lamppostCreateDTO, String realm) {
//        System.out.println("routeId: " + lamppostCreateDTO.getRouteId());
//        return persistenceService.doReturningTransaction(entityManager -> {
//            Asset<?> routeAsset = entityManager.find(Asset.class, lamppostCreateDTO.getRouteId());
//            Asset<?> lightAsset = entityManager.find(Asset.class, lamppostCreateDTO.getLightId());
//
//            if (routeAsset == null || lightAsset == null) {
//                throw new WebApplicationException("Không tìm thấy routeAsset hoặc lightAsset", 404);
//            }
//
//            // 1. Tạo route_lamppost mới
//            Object[] result = (Object[]) entityManager
//                    .createNativeQuery("INSERT INTO route_lamppost (route_id, create_date) VALUES (?, ?) RETURNING lamppost_id, route_id, create_date")
//                    .setParameter(1, routeAsset.getId())
//                    .setParameter(2, LocalDateTime.now())
//                    .getSingleResult();
//
//            Lamppost lamppost = new Lamppost();
//            lamppost.setLamppostId(((Number) result[0]).longValue());
//            lamppost.setRouteId((String) result[1]);
//            lamppost.setCreateDate((Timestamp) result[2]);
//
//            // 2. Cập nhật parent_id của asset (set asset.lightAsset.parent_id = route_lamppost.lamppost_id)
//            entityManager.createNativeQuery("UPDATE asset SET parent_id = :routeId WHERE id = :lightId")
//                    .setParameter("routeId", lamppost.getRouteId())
//                    .setParameter("lightId", lamppostCreateDTO.getLightId())
//                    .executeUpdate();
//
//            // 2. Cập nhật route_lamppost_detail nếu tồn tại
//            int updated = entityManager.createNativeQuery("""
//                        UPDATE route_lamppost_detail
//                        SET lamppost_id = :lamppostId, description = :description
//                        WHERE asset_id = :assetId AND lamppost_id IS NULL
//                    """)
//                    .setParameter("lamppostId", lamppost.getLamppostId())
//                    .setParameter("description", "Đã cập nhật từ API create")
//                    .setParameter("assetId", lamppostCreateDTO.getLightId())
//                    .executeUpdate();
//
//
//            // 3. Nếu không có bản ghi nào bị ảnh hưởng thì tạo mới (fallback insert)
//            if (updated == 0) {
//                entityManager.createNativeQuery("INSERT INTO route_lamppost_detail (lamppost_id, asset_id, lamp_type_id, start_date, create_date) VALUES (?, ?, ?, ?, ?)")
//                        .setParameter(1, lamppost.getLamppostId())
//                        .setParameter(2, lamppostCreateDTO.getLightId())
//                        .setParameter(3, lamppostCreateDTO.getLampTypeId())
//                        .setParameter(4, LocalDate.now())
//                        .setParameter(5, LocalDateTime.now())
//                        .executeUpdate();
//            }
//            return lamppost;
//        });
//    }
    public Lamppost create(LamppostCreateDTO lamppostCreateDTO, String realm) {
        System.out.println("routeId: " + lamppostCreateDTO.getRouteId());
        return persistenceService.doReturningTransaction(entityManager -> {
            Asset<?> routeAsset = entityManager.find(Asset.class, lamppostCreateDTO.getRouteId());

            if (routeAsset == null) {
                throw new WebApplicationException("Không tìm thấy routeAsset hoặc lightAsset", 404);
            }

            // 1. Tạo route_lamppost mới
            Object[] result = (Object[]) entityManager
                    .createNativeQuery("INSERT INTO route_lamppost (route_id, " +
                            "create_date, description, lamppost_name, active, " +
                            "lamppost_code) " +
                            "VALUES (?, ?, ?, ?, ?, ?) " +
                            "RETURNING lamppost_id, route_id, create_date, description, lamppost_name, active,lamppost_code")
                    .setParameter(1, routeAsset.getId())
                    .setParameter(2, LocalDateTime.now())
                    .setParameter(3, lamppostCreateDTO.getDescription())
                    .setParameter(4, lamppostCreateDTO.getLamppostName())
                    .setParameter(5, lamppostCreateDTO.getActive())
                    .setParameter(6, lamppostCreateDTO.getLamppostCode())
                    .getSingleResult();

            Lamppost lamppost = new Lamppost();
            lamppost.setLamppostId(((Number) result[0]).longValue());
            lamppost.setRouteId((String) result[1]);
            lamppost.setCreateDate((Timestamp) result[2]);
            lamppost.setDescription((String) result[3]);
            lamppost.setLamppostName((String) result[4]);
            lamppost.setActive((Boolean) result[5]);
            lamppost.setLamppostCode((String) result[6]);
            return lamppost;
        });
    }

    public void createLamppostLight(LamppostCreateDTO lamppostCreateDTO, String realm) {
        persistenceService.doTransaction(entityManager -> {

            // 2. Cập nhật route_lamppost_detail
            int updatedDetail = entityManager
                    .createNativeQuery("UPDATE route_lamppost_detail SET lamppost_id = :lamppostId, start_date = :startDate, end_date = :endDate WHERE asset_id = :assetId")
                    .setParameter("lamppostId", lamppostCreateDTO.getLamppostId())
                    .setParameter("startDate", lamppostCreateDTO.getStartDate())
                    .setParameter("endDate", lamppostCreateDTO.getEndDate())
                    .setParameter("assetId", lamppostCreateDTO.getLightId())
                    .executeUpdate();

            if (updatedDetail == 0) {
                throw new WebApplicationException("Không cập nhật được route_lamppost_detail cho asset_id: " + lamppostCreateDTO.getLightId(), 400);
            }

            // 3. Cập nhật parent_id trong asset
            int updatedAsset = entityManager
                    .createNativeQuery("UPDATE asset SET parent_id = :parentId WHERE id = :assetId")
                    .setParameter("parentId", lamppostCreateDTO.getRouteId())
                    .setParameter("assetId", lamppostCreateDTO.getLightId())
                    .executeUpdate();

            if (updatedAsset == 0) {
                throw new WebApplicationException("Không cập nhật được parent_id cho asset: " + lamppostCreateDTO.getLightId(), 400);
            }
        });
    }

    public List<LightAsset> getLightByLampposType(Integer lampposTypeId, String routerPath) {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = """
            SELECT a.*
            FROM route_lamppost_detail rld
            JOIN asset a ON rld.asset_id = a.id
            WHERE rld.lamp_type_id = :lampTypeId
              AND NOT EXISTS (
                  SELECT 1
                  FROM route_lamppost rl
                  WHERE rl.lamppost_id = rld.lamppost_id
              )
              AND (
                  rld.start_date = DATE '1970-01-01'
                  OR (
                      rld.end_date != DATE '2199-01-01'
                      AND rld.start_date != DATE '1970-01-01'
                  )
              )
        """;

            return entityManager
                    .createNativeQuery(sql, LightAsset.class)
                    .setParameter("lampTypeId", lampposTypeId)
                    .getResultList();
        });
    }


    public List<LampType> getLamppostType() {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = "SELECT lt.id, lt.lamp_type_name,lt.power_consumption FROM md_lamp_type lt";

            return entityManager
                    .createNativeQuery(sql, LampType.class)
                    .getResultList();
        });
    }

    public void delete(Long id) {
        persistenceService.doTransaction(entityManager -> {
            String updateSql = "UPDATE route_lamppost_detail SET lamppost_id = NULL WHERE lamppost_id = :lamppostId";
            entityManager.createNativeQuery(updateSql)
                    .setParameter("lamppostId", id)
                    .executeUpdate();

            String deleteSql = "DELETE FROM route_lamppost WHERE lamppost_id = :lamppostId";
            entityManager.createNativeQuery(deleteSql)
                    .setParameter("lamppostId", id)
                    .executeUpdate();
        });
    }

    public void removeLight(String assetId) {
        persistenceService.doTransaction(entityManager -> {
            // Cập nhật route_lamppost_detail
            String updateRouteDetailSql = "UPDATE route_lamppost_detail SET lamppost_id = NULL WHERE asset_id = :assetId";
            entityManager.createNativeQuery(updateRouteDetailSql)
                    .setParameter("assetId", assetId)
                    .executeUpdate();

            // Cập nhật asset
            String updateAssetSql = "UPDATE asset SET parent_id = NULL WHERE id = :assetId";
            entityManager.createNativeQuery(updateAssetSql)
                    .setParameter("assetId", assetId)
                    .executeUpdate();
        });
    }

//    public Lamppost updateLamppost(int lamppostId, LamppostCreateDTO updateDTO) {
//        return persistenceService.doReturningTransaction(entityManager -> {
//            // 1. Kiểm tra tồn tại của lamppost_id
//            Number count = (Number) entityManager
//                    .createNativeQuery("SELECT COUNT(*) FROM route_lamppost WHERE lamppost_id = :id")
//                    .setParameter("id", lamppostId)
//                    .getSingleResult();
//            if (count.intValue() == 0) {
//                throw new WebApplicationException("Không tìm thấy lamppost với ID: " + lamppostId, 404);
//            }
//
//            // 2. Lấy asset cũ hiện đang gắn với lamppost này
//            List<String> oldAssetIds = entityManager.createNativeQuery("""
//            SELECT asset_id
//            FROM route_lamppost_detail
//            WHERE lamppost_id = :lamppostId
//        """)
//                    .setParameter("lamppostId", lamppostId)
//                    .getResultList();
//
//            // 3. Gỡ lamppost_id của asset cũ (nếu có)
//            for (String assetId : oldAssetIds) {
//                entityManager.createNativeQuery("""
//                UPDATE route_lamppost_detail
//                SET lamppost_id = NULL
//                WHERE asset_id = :assetId
//            """)
//                        .setParameter("assetId", assetId)
//                        .executeUpdate();
//            }
//
//            // 4. Gắn asset mới vào lamppost
//            int updated = entityManager.createNativeQuery("""
//            UPDATE route_lamppost_detail
//            SET lamp_type_id = :lampTypeId,
//                lamppost_id = :lamppostId
//            WHERE asset_id = :lightId
//        """)
//                    .setParameter("lampTypeId", updateDTO.getLampTypeId())
//                    .setParameter("lamppostId", lamppostId)
//                    .setParameter("lightId", updateDTO.getLightId())
//                    .executeUpdate();
//
//            if (updated == 0) {
//                throw new WebApplicationException(
//                        "Không tìm thấy asset mới trong route_lamppost_detail để cập nhật",
//                        404
//                );
//            }
//
//            // 5. Trả lại thông tin lamppost
//            Object[] row = (Object[]) entityManager
//                    .createNativeQuery("""
//                    SELECT rl.lamppost_id, rl.route_id, rl.create_date
//                    FROM route_lamppost rl
//                    WHERE rl.lamppost_id = :id
//                """)
//                    .setParameter("id", lamppostId)
//                    .getSingleResult();
//
//            Lamppost result = new Lamppost();
//            result.setLamppostId(((Number) row[0]).longValue());
//            result.setRouteId((String) row[1]);
//            result.setCreateDate((Timestamp) row[2]);
//
//            return result;
//        });
//    }

    public Lamppost updateLamppost(int lamppostId, LamppostCreateDTO updateDTO) {
        return persistenceService.doReturningTransaction(entityManager -> {
            // 1. Kiểm tra tồn tại của lamppost_id
            Number count = (Number) entityManager
                    .createNativeQuery("SELECT COUNT(*) FROM route_lamppost WHERE lamppost_id = :id")
                    .setParameter("id", lamppostId)
                    .getSingleResult();
            if (count.intValue() == 0) {
                throw new WebApplicationException("Không tìm thấy lamppost với ID: " + lamppostId, 404);
            }

            // 2. Cập nhật dữ liệu
            entityManager.createNativeQuery("""
            UPDATE route_lamppost
            SET lamppost_name = :lamppost_name,
                lamppost_code = :lamppost_code,
                active = :active,
                description = :description,
                update_date = NOW()
            WHERE lamppost_id = :lamppost_id
        """)
                    .setParameter("lamppost_name", updateDTO.getLamppostName())
                    .setParameter("lamppost_code", updateDTO.getLamppostCode())
                    .setParameter("active", updateDTO.getActive())
                    .setParameter("description", updateDTO.getDescription())
                    .setParameter("lamppost_id", lamppostId)
                    .executeUpdate();

            // 3. Trả lại thông tin lamppost sau khi cập nhật
            Object[] row = (Object[]) entityManager
                    .createNativeQuery("""
                    SELECT rl.lamppost_id, rl.route_id, rl.create_date
                    FROM route_lamppost rl
                    WHERE rl.lamppost_id = :id
                """)
                    .setParameter("id", lamppostId)
                    .getSingleResult();

            Lamppost result = new Lamppost();
            result.setLamppostId(((Number) row[0]).longValue());
            result.setRouteId((String) row[1]);
            result.setCreateDate((Timestamp) row[2]);

            return result;
        });
    }

    public Lamppost updateLamppostLight(int lamppostId, LamppostCreateDTO updateDTO) {
        return persistenceService.doReturningTransaction(entityManager -> {
            int updated = entityManager.createNativeQuery("""
            UPDATE route_lamppost_detail
            SET start_date = :startDate,
                end_date = :endDate,
                description = :description
            WHERE asset_id = :lightId
        """)
                    .setParameter("startDate", updateDTO.getStartDate())
                    .setParameter("endDate", updateDTO.getEndDate())
                    .setParameter("description", updateDTO.getDescription())
                    .setParameter("lightId", updateDTO.getLightId())
                    .executeUpdate();

            if (updated == 0) {
                throw new WebApplicationException(
                        "Không tìm thấy asset mới trong route_lamppost_detail để cập nhật",
                        404
                );
            }

            // 4. Trả lại thông tin lamppost
            Object[] row = (Object[]) entityManager
                    .createNativeQuery("""
                    SELECT rl.lamppost_id, rl.route_id, rl.create_date
                    FROM route_lamppost rl
                    WHERE rl.lamppost_id = :id
                """)
                    .setParameter("id", lamppostId)
                    .getSingleResult();

            Lamppost result = new Lamppost();
            result.setLamppostId(((Number) row[0]).longValue());
            result.setRouteId((String) row[1]);
            result.setCreateDate((Timestamp) row[2]);

            return result;
        });
    }


    public List<LamppostLightDTO> getLightsByLamppostId(Integer lamppostId) {
        return persistenceService.doReturningTransaction(entityManager -> {
            try {
                String sql = """
                SELECT 
                    a.name,
                    rld.asset_id,
                    mlt.lamp_type_name,
                    rld.lamppost_id,
                    rld.id,
                    rld.lamp_type_id,
                    rld.start_date,
                    rld.end_date,
                    rld.description
                FROM route_lamppost_detail rld
                INNER JOIN asset_info ai ON ai.id = rld.asset_id
                INNER JOIN asset a ON a.id = ai.id
                INNER JOIN md_lamp_type mlt ON mlt.id = rld.lamp_type_id
                WHERE rld.lamppost_id = :lamppostId
            """;

                Query query = entityManager.createNativeQuery(sql);
                query.setParameter("lamppostId", lamppostId);

                List<Object[]> results = query.getResultList();
                List<LamppostLightDTO> lights = new ArrayList<>();

                for (Object[] row : results) {
                    String name = (String) row[0];
                    String assetId = (String) row[1];
                    String lampTypeName = (String) row[2];
                    Integer lamppostIdVal = row[3] != null ? ((Number) row[3]).intValue() : null;
                    Integer id = row[4] != null ? ((Number) row[4]).intValue() : null;
                    Integer lampTypeId = row[5] != null ? ((Number) row[5]).intValue() : null;
                    Date startDate = (Date) row[6];
                    Date endDate = (Date) row[7];
                    String description = (String) row[8];

                    lights.add(new LamppostLightDTO(name, assetId, lampTypeName, lamppostIdVal,
                            id, lampTypeId, startDate, endDate, description));
                }
                return lights;
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Lỗi khi lấy danh sách đèn theo cột đèn", e);
            }
        });
    }

}
