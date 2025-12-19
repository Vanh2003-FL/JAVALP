package org.openremote.manager.scheduleInfo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.persistence.TemporalType;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.event.ClientEventService;
import org.openremote.manager.rules.RulesService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.PersistenceEvent;
import org.openremote.model.Schedule.*;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.district.DistrictException;
import org.openremote.model.dto.ScheduleSearchDTO;
import org.openremote.model.dto.SearchFilterDTO;
import org.openremote.model.exception.ExceptionCommon;
import org.openremote.model.exception.ExceptionMapperCommon;
import org.openremote.model.hdi.hdiDTO.Hdi3SceneClear;
import org.openremote.model.hdi.hdiDTO.commandDTO.LightCommand3Control2;
import org.openremote.model.hdi.hdiEven.HdiEven;
import org.openremote.model.scheduleinfo.*;
import org.openremote.model.security.User;
import org.openremote.model.supplier.SupplierExceptionMapper;
import org.postgresql.util.PGobject;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static org.openremote.manager.asset.AssetProcessingService.ROAD_ASSET;


public class ScheduleInfoPersistenceService extends RouteBuilder implements ContainerService {
    private static final Logger LOG = Logger.getLogger(ManagerIdentityService.class.getName());

    protected PersistenceService persistenceService;
    protected ManagerIdentityService identityService;
    protected AssetStorageService assetStorageService;
    private ClientEventService clientEventService;

    public List<?> getAssetIdByScheduleAsset(Integer scheduleInfoId) {
        return persistenceService.doReturningTransaction(em -> {
            String sql = new StringBuilder()
                    .append("SELECT a.id ")
                    .append("FROM schedule_asset sa ")
                    .append("JOIN asset a ON sa.asset_id = a.id ")
                    .append("WHERE sa.schedule_id = :scheduleInfoId AND sa.deleted = 0").toString();
            return em.createNativeQuery(sql)
                    .setParameter("scheduleInfoId", scheduleInfoId)
                    .getResultList();
        });
    }

    public Integer getScheduleInfoByScheduleCode(EntityManager em, String code, String realm) {
        String sql = "SELECT id FROM schedule_info WHERE schedule_code = :code  and deleted = 0 and realm= :realm";
        try {
            return (Integer) em.createNativeQuery(sql)
                    .setParameter("code", code)
                    .setParameter("realm", realm)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public void updateAssetStatusBySchedule(Integer scheduleInfoId, int value) {
        // Sử dụng doInTransaction vì đây là một thao tác cập nhật (không trả về dữ liệu)
        persistenceService.doReturningTransaction(em -> {
            // Câu lệnh SQL UPDATE để thay đổi cột 'status'
            String sql = new StringBuilder()
                    .append("UPDATE schedule_asset ")
                    .append("SET status = :value ")
                    .append("WHERE schedule_id = :scheduleInfoId").toString();

            // Tạo truy vấn, gán tham số và thực thi
            return em.createNativeQuery(sql)
                    .setParameter("scheduleInfoId", scheduleInfoId)
                    .setParameter("value", value)
                    .executeUpdate();
        });
    }

    public void updateStatusBySchedule(Integer scheduleInfoId, int value) {
        // Sử dụng doInTransaction vì đây là một thao tác cập nhật (không trả về dữ liệu)
        persistenceService.doReturningTransaction(em -> {
            // Câu lệnh SQL UPDATE để thay đổi cột 'status'
            String sql = new StringBuilder()
                    .append("UPDATE schedule_asset ")
                    .append("SET status = :value ")
                    .append("WHERE schedule_id = :scheduleInfoId").toString();

            // Tạo truy vấn, gán tham số và thực thi
            return em.createNativeQuery(sql)
                    .setParameter("scheduleInfoId", scheduleInfoId)
                    .setParameter("value", value)
                    .executeUpdate();
        });
    }

    public List<ScheduleInfo> updateStatusBySchedule(List<ScheduleInfo> scheduleInfoId, String value) {

        if (scheduleInfoId == null || scheduleInfoId.isEmpty()) {
            throw new  DistrictException(AttributeWriteFailure.ALREADY_EXISTS, "ASSET_ERROR" + " scheduleIds cannot be null or empty");
        }
        if (value == null) {
            throw new  DistrictException(AttributeWriteFailure.ALREADY_EXISTS, "ASSET_ERROR" + " Invalid status: " + value);
        }

        List<Integer> ids = scheduleInfoId.stream()
                .map(ScheduleInfo::getId)
                .toList();

        persistenceService.doReturningTransaction(em -> {
            if (ids.isEmpty()) return null;
            String inClause = ids.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));

            String sql = "UPDATE schedule_info SET approval_status = :status WHERE id IN (" + inClause + ")";

            em.createNativeQuery(sql)
                    .setParameter("status", value)
                    .executeUpdate();

            return null;
        });
        return scheduleInfoId;
    }

    public void updateAssetStatusByScheduleAndAssetId(Integer scheduleInfoId, int value, List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        persistenceService.doReturningTransaction(em -> {
            String sql = new StringBuilder()
                    .append("UPDATE schedule_asset ")
                    .append("SET status = :value ")
                    .append("WHERE schedule_id = :scheduleInfoId AND asset_id IN (:ids) ").toString();

            return em.createNativeQuery(sql)
                    .setParameter("scheduleInfoId", scheduleInfoId)
                    .setParameter("value", value)
                    .setParameter("ids", ids)
                    .executeUpdate();
        });
    }

    public void updateAssetStatusByScheduleAndAssetId2(EntityManager em, Integer scheduleInfoId, int value, List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        String sql = new StringBuilder()
                .append("UPDATE schedule_asset ")
                .append("SET status = :value ")
                .append("WHERE schedule_id = :scheduleInfoId AND asset_id IN (:ids) ").toString();

        var i = em.createNativeQuery(sql)
                .setParameter("scheduleInfoId", scheduleInfoId)
                .setParameter("value", value)
                .setParameter("ids", ids)
                .executeUpdate();
    }

    @Override
    public void init(Container container) throws Exception {
        persistenceService = container.getService(PersistenceService.class);
        identityService = container.getService(ManagerIdentityService.class);
        assetStorageService = container.getService(AssetStorageService.class);
        clientEventService = container.getService(ClientEventService.class);

        ManagerWebService managerWebService = container.getService(ManagerWebService.class);

        managerWebService.addApiSingleton(
                new ScheduleInfoResourceImpl(container.getService(TimerService.class), identityService, persistenceService, this)
        );
        managerWebService.addApiSingleton(
                new SupplierExceptionMapper()
        );

        managerWebService.addApiSingleton(
                new ExceptionMapperCommon()
        );
    }

    public List<ScheduleInfo> getAll(ScheduleSearchDTO<ScheduleInfo> scheduleSearchDTO) {
        // Nếu null, trả danh sách rỗng hoặc xử lý phù hợp
        if (scheduleSearchDTO == null) {
            System.out.println("⚠️ searchFilterDTO is null");
            return Collections.emptyList();
        }

        ScheduleInfo filterData = scheduleSearchDTO.getData();
        String scheduleName = null;
        String realm = null;
        String scheduleType = null;
        String approvalStatus = null;
        Long fromDate = null;
        Long toDate = null;
        String refType = null; // "area" or "asset"
        String refId   = null;   // uuid string

        if (filterData != null) {
            scheduleName = filterData.getScheduleName();
            realm = filterData.getRealm();
            scheduleType = filterData.getSchType();
            approvalStatus = filterData.getApprovalStatus();
            fromDate = scheduleSearchDTO.getFromDate();
            toDate = scheduleSearchDTO.getToDate();
            refType = scheduleSearchDTO.getType(); // "area" or "asset"
            refId   = scheduleSearchDTO.getId();   // uuid string
            System.out.println("Realm: " + realm);
            System.out.println("Valid realm: " + validationUtils.isValid(realm));
            System.out.println("approvalStatus: " + approvalStatus);
            System.out.println("refType: " + refType);
            System.out.println("refId: " + refId);
        } else {
            System.out.println("⚠️ scheduleSearchDTO.getData() is null");
        }

        final String finalScheduleName = scheduleName;
        final String finalRealm = realm;
        final String finalScheduleType = scheduleType;
        final String finalApprovalStatus = approvalStatus;
        final Long finalFromDate = fromDate;
        final Long finalToDate = toDate;
        final String finalRefType = refType;
        final String finalRefId   = refId;

        return persistenceService.doReturningTransaction(em -> {
            StringBuilder baseQuery = new StringBuilder(
                    "SELECT " +
                            "si.id, " +                           // 0
                            "si.schedule_code, " +                // 1
                            "si.schedule_name, " +                // 2
                            "nc.title, " +                        // 3
                            "si.realm, " +                        // 4
                            "si.active, " +                       // 5
                            "si.sch_type, " +                     // 6
                            "si.sch_from_date, " +                // 7
                            "si.sch_to_date, " +                  // 8
                            "si.sch_repeat_occu, " +              // 9
                            "si.is_sch_repeat_end, " +            // 10
                            "si.sch_time_period, " +              // 11
                            "si.approval_status, " +              // 12
                            "si.deleted, " +                      // 13
                            "si.description, " +                  // 14
                            "si.create_date, " +                  // 15
                            "si.create_by, " +                    // 16
                            "si.update_date, " +                  // 17
                            "si.update_by " +                     // 18
                            "FROM openremote.schedule_info si " +
                            "JOIN openremote.news_category nc " +
                            "  ON si.news_category_id = nc.id AND nc.is_deleted = false " +
                            "WHERE si.deleted = 0"
            );

            if (validationUtils.isValid(finalScheduleName)) {
                baseQuery.append(" AND LOWER(schedule_name) LIKE LOWER(:scheduleName)");
            }
            if (validationUtils.isValid(finalRealm)) {
                baseQuery.append(" AND realm = :realm");
            }
            if (validationUtils.isValid(finalScheduleType)) {
                baseQuery.append(" AND sch_type = :scheduleType");
            }
            if (validationUtils.isValid(finalApprovalStatus)) {
                baseQuery.append(" AND approval_status = :approvalStatus");
            }
            if (finalFromDate != null && finalToDate != null) {
                baseQuery.append(" AND sch_from_date <= :toDate AND sch_to_date >= :fromDate");
            } else if (finalFromDate != null) {
                // chỉ có fromDate: lấy các schedule kết thúc sau fromDate
                baseQuery.append(" AND sch_to_date >= :fromDate");
            } else if (finalToDate != null) {
                // chỉ có toDate: lấy các schedule bắt đầu trước toDate
                baseQuery.append(" AND sch_from_date <= :toDate");
            }
            if (validationUtils.isValid(finalRefType) && validationUtils.isValid(finalRefId)) {
                if ("asset".equalsIgnoreCase(finalRefType)) {
                    baseQuery.append(
                            " AND EXISTS ( " +
                                    "   SELECT 1 FROM openremote.schedule_asset sa " +
                                    "   WHERE sa.is_deleted = false " +
                                    "     AND CAST(sa.schedule_id AS int) = si.id " +
                                    "     AND sa.asset_id = :refId " +
                                    " )"
                    );
                } else if ("area".equalsIgnoreCase(finalRefType)) {
                    baseQuery.append(
                            " AND EXISTS ( " +
                                    "   SELECT 1 FROM openremote.schedule_asset sa " +
                                    "   JOIN openremote.asset_info ai ON ai.id = sa.asset_id AND ai.deleted = false " +
                                    "   WHERE sa.is_deleted = false " +
                                    "     AND CAST(sa.schedule_id AS int) = si.id " +
                                    "     AND ai.area_id = :refId " +
                                    " )"
                    );
                }
            }

            baseQuery.append(" ORDER BY create_date DESC");

            Query query = em.createNativeQuery(baseQuery.toString());

            if (validationUtils.isValid(finalScheduleName)) {
                query.setParameter("scheduleName", "%" + finalScheduleName.trim() + "%");
            }
            if (validationUtils.isValid(finalRealm)) {
                query.setParameter("realm", finalRealm.trim());
            }
            if (validationUtils.isValid(finalScheduleType)) {
                query.setParameter("scheduleType", finalScheduleType.trim());
            }
            if (validationUtils.isValid(finalApprovalStatus)) {
                query.setParameter("approvalStatus", finalApprovalStatus.trim());
            }
            if (validationUtils.isValid(finalRefType) && validationUtils.isValid(finalRefId)) {
                if ("asset".equalsIgnoreCase(finalRefType) || "area".equalsIgnoreCase(finalRefType)) {
                    query.setParameter("refId", finalRefId.trim());
                }
            }
            if (finalFromDate != null) {
                query.setParameter("fromDate", new java.sql.Timestamp(finalFromDate));
            }
            if (finalToDate != null) {
                query.setParameter("toDate", new java.sql.Timestamp(finalToDate));
            }

            Integer page = scheduleSearchDTO.getPage();
            Integer size = scheduleSearchDTO.getSize();
            if (validationUtils.isValid(size) && validationUtils.isValid(page)) {
                query.setMaxResults(size);
                query.setFirstResult((page - 1) * size);
            }

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            return results.stream()
                    .map(this::mapToScheduleInfo)
                    .collect(Collectors.toList());
        });
    }


    private ScheduleInfo mapToScheduleInfo(Object[] result) {
        String newsTitle = (String) result[3];
        ScheduleInfo si = new ScheduleInfo(
                ((Number) result[0]).intValue(),              // id
                (String) result[1],                            // scheduleCode
                (String) result[2],                            // scheduleName
                (String) result[4],                            // realm
                ((Number) result[5]).intValue(),              // active
                (String) result[6],                            // schType
                (Timestamp) result[7],                                               // schFromDate
                (Timestamp) result[8],                                          // schToDate
                null,                                          // schRepeatOccu
                false,                                         // schRepeatEnd
                null, null,                                    // schTimePeriods, customizeLampType
                (String) result[12],                           //approvalStatus
                ((Number) result[13]).intValue(),              // deleted
                (String) result[14],                           // description
                (Timestamp) result[15],                        // createDate ✅
                (String) result[16],                           // createBy ✅
                (Timestamp) result[17],                        // updateDate ✅
                (String) result[18],                           // updateBy ✅
                null, null                                     // timeConfigurations, scheduleAssets
        );
        si.setNewsCategoryTitle(newsTitle);
        return si;
    }


    private List<SchTimePeriod> convertJsonToSchTimePeriodList(String json) {
        try {
            if (json == null || json.trim().isEmpty()) return new ArrayList<>();

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());

            JsonNode rootNode = mapper.readTree(json);

            if (rootNode.isArray()) {
                return mapper.readValue(json, new TypeReference<List<SchTimePeriod>>() {
                });
            } else if (rootNode.has("periods") && rootNode.get("periods").isArray()) {
                return mapper.readValue(rootNode.get("periods").toString(),
                        new TypeReference<List<SchTimePeriod>>() {
                        });
            } else if (rootNode.isObject()) {
                SchTimePeriod period = mapper.treeToValue(rootNode, SchTimePeriod.class);
                List<SchTimePeriod> result = new ArrayList<>();
                result.add(period);
                return result;
            }

            throw new IllegalArgumentException("Định dạng JSON không được hỗ trợ: " + json);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi chuyển đổi JSON thành danh sách SchTimePeriod", e);
        }
    }

    private List<CustomizeLampType> convertJsonToCustomizeLampType(String json) {
        try {
            if (json == null || json.trim().isEmpty()) return new ArrayList<>();

            ObjectMapper mapper = new ObjectMapper();

            JsonNode rootNode = mapper.readTree(json);

            // Xử lý trường hợp mảng JSON
            if (rootNode.isArray()) {
                return mapper.readValue(json, new TypeReference<List<CustomizeLampType>>() {
                });
            } else if (rootNode.isObject()) {
                CustomizeLampType lampType = mapper.treeToValue(rootNode, CustomizeLampType.class);
                List<CustomizeLampType> result = new ArrayList<>();
                result.add(lampType);
                return result;
            }

            throw new IllegalArgumentException("Định dạng JSON không hợp lệ cho CustomizeLampType: " + json);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi chuyển đổi JSON thành danh sách CustomizeLampType", e);
        }
    }

    public ScheduleInfo create(ScheduleInfo scheduleInfo) {
        try {
            ScheduleInfo info = persistenceService.doReturningTransaction(em -> {
                // Validate schedule code
                String code = scheduleInfo.getScheduleCode();
                if (code == null || code.trim().isEmpty()) {
                    throw new RuntimeException("Tên lịch biểu không được để trống.");
                }

                Long count = (Long) em.createNativeQuery(
                                "SELECT COUNT(*) FROM schedule_info WHERE LOWER(schedule_code) = LOWER(:name) AND realm = :realm AND deleted = 0")
                        .setParameter("name", code.trim())
                        .setParameter("realm", scheduleInfo.getRealm())
                        .getSingleResult();

                if (count != null && count > 0) {
                    throw new RuntimeException("Mã lịch biểu '" + code + "' đã tồn tại!");
                }

                // Validate schedule type and dates
                String schType = scheduleInfo.getSchType();
                if ("ALWAYS".equals(schType)) {
                    scheduleInfo.setSchFromDate(Timestamp.valueOf("2199-01-01 00:00:00"));
                    scheduleInfo.setSchToDate(Timestamp.valueOf("2199-01-01 00:00:00"));
                    scheduleInfo.setSchRepeatOccu(null);
                } else if ("ANOCC".equals(schType)) {
                    if (scheduleInfo.getSchToDate() == null) {
                        throw new RuntimeException("Vui lòng chọn ngày cho lịch 1 lần");
                    }
                    if (scheduleInfo.getSchFromDate() == null) {
                        scheduleInfo.setSchFromDate(scheduleInfo.getSchToDate());
                    }
                    scheduleInfo.setSchRepeatOccu(null);
                } else if ("REOCC".equals(schType)) {
                    if (scheduleInfo.getSchFromDate() == null || scheduleInfo.getSchToDate() == null) {
                        throw new RuntimeException("Vui lòng chọn khoảng thời gian cho lịch lặp lại");
                    }
                    if (scheduleInfo.getSchRepeatOccu() == null || scheduleInfo.getSchRepeatOccu().isEmpty()) {
                        throw new RuntimeException("Vui lòng chọn ít nhất một ngày trong tuần cho lịch lặp lại");
                    }
                    String repeatOccu = scheduleInfo.getSchRepeatOccu();
                    String[] days = repeatOccu.split(",");
                    for (String day : days) {
                        if (!day.matches("MO|TU|WE|TH|FR|SA|SU")) {
                            throw new RuntimeException("Giá trị ngày không hợp lệ: " + day);
                        }
                    }
                } else {
                    throw new RuntimeException("Loại lịch biểu không hợp lệ: " + schType);
                }

                // === STRICTER VALIDATION: timeConfigurations & scheduleAssets ===
                if (scheduleInfo.getTimeConfigurations() == null) {
                    throw new RuntimeException("Danh sách timeConfigurations không được null.");
                }
                if (scheduleInfo.getScheduleAssets() == null) {
                    throw new RuntimeException("Danh sách scheduleAssets không được null.");
                }

                // New validation: Reject if both are empty
                if (scheduleInfo.getTimeConfigurations().isEmpty() && scheduleInfo.getScheduleAssets().isEmpty()) {
                    throw new RuntimeException("Phải có ít nhất một timeConfiguration hoặc scheduleAsset");
                }

                // Original validation: Can't have timeConfigurations without scheduleAssets
                if (!scheduleInfo.getTimeConfigurations().isEmpty() && scheduleInfo.getScheduleAssets().isEmpty()) {
                    throw new RuntimeException("Không được khai báo timeConfigurations khi không có scheduleAssets.");
                }

                // Prepare time periods and lamp types
                List<SchTimePeriod> schTimePeriods = new ArrayList<>();
                List<CustomizeLampType> customizeLampTypes = new ArrayList<>();

                if (!scheduleInfo.getTimeConfigurations().isEmpty()) {
                    for (TimeConfiguration config : scheduleInfo.getTimeConfigurations()) {
                        SchTimePeriod timePeriod = config.getTimePeriod();
                        schTimePeriods.add(timePeriod);
                        if (config.getLampTypes() != null) {
                            for (CustomizeLampType lamp : config.getLampTypes()) {
                                lamp.setTime_id(timePeriod.getTime_id());
                                customizeLampTypes.add(lamp);
                            }
                        }
                    }
                }

                scheduleInfo.setSchTimePeriods(schTimePeriods);
                scheduleInfo.setCustomizeLampType(customizeLampTypes);

                // Convert to JSON
                ObjectMapper objectMapper = new ObjectMapper();
                String schTimePeriodJson;
                String customizeLampTypeJson;
                try {
                    schTimePeriodJson = objectMapper.writeValueAsString(scheduleInfo.getSchTimePeriods());
                    customizeLampTypeJson = objectMapper.writeValueAsString(scheduleInfo.getCustomizeLampType());
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Lỗi khi chuyển đổi dữ liệu sang JSON: " + e.getMessage(), e);
                }

                // Insert schedule info
                Timestamp now = new Timestamp(System.currentTimeMillis());
                Integer scheduleId = (Integer) em.createNativeQuery(
                                "INSERT INTO schedule_info (" +
                                        "schedule_code, schedule_name, realm, active, sch_type, sch_from_date, sch_to_date, " +
                                        "sch_repeat_occu, is_sch_repeat_end, sch_time_period, customize_lamp_type, " +
                                        "deleted, description, create_date, create_by, update_date, update_by, mail_sent) " +
                                        "VALUES (:code, :name, :realm, :active, :type, :fromDate, :toDate, " +
                                        ":repeatOccu, :repeatEnd, CAST(:timePeriod AS jsonb), CAST(:lampType AS jsonb), " +
                                        ":deleted, :description, :createDate, :createBy, :updateDate, :updateBy, 0) " +
                                        "RETURNING id")
                        .setParameter("code", scheduleInfo.getScheduleCode())
                        .setParameter("name", scheduleInfo.getScheduleName())
                        .setParameter("realm", scheduleInfo.getRealm())
                        .setParameter("active", scheduleInfo.getActive())
                        .setParameter("type", scheduleInfo.getSchType())
                        .setParameter("fromDate", scheduleInfo.getSchFromDate())
                        .setParameter("toDate", scheduleInfo.getSchToDate())
                        .setParameter("repeatOccu", scheduleInfo.getSchRepeatOccu())
                        .setParameter("repeatEnd", scheduleInfo.getSchRepeatEnd())
                        .setParameter("timePeriod", schTimePeriodJson)
                        .setParameter("lampType", customizeLampTypeJson)
                        .setParameter("deleted", scheduleInfo.getDeleted())
                        .setParameter("description", scheduleInfo.getDescription())
                        .setParameter("createDate", now)
                        .setParameter("createBy", scheduleInfo.getCreateBy())
                        .setParameter("updateDate", now)
                        .setParameter("updateBy", scheduleInfo.getUpdateBy())
                        .getSingleResult();

                scheduleInfo.setId(scheduleId);
                scheduleInfo.setCreateDate(now);
                scheduleInfo.setUpdateDate(now);

                // Insert schedule assets if any
                if (!scheduleInfo.getScheduleAssets().isEmpty()) {
                    for (ScheduleAsset sa : scheduleInfo.getScheduleAssets()) {
                        if (sa.getDirectAssetId() == null) {
                            throw new RuntimeException("Thiếu thông tin asset_id trong scheduleAsset");
                        }
                        if (sa.getDirectSysAssetId() == null) {
                            throw new RuntimeException("Thiếu thông tin sys_asset_id trong scheduleAsset");
                        }
                        em.createNativeQuery(
                                        "INSERT INTO schedule_asset (id, schedule_id, asset_id, sys_asset_type_id, create_date, status) " +
                                                "VALUES (:id, :scheduleId, :assetId, :sysAssetId, :createDate, :status)")
                                .setParameter("id", Math.abs(UUID.randomUUID().getLeastSignificantBits()))
                                .setParameter("scheduleId", scheduleId)
                                .setParameter("assetId", sa.getDirectAssetId())
                                .setParameter("sysAssetId", Integer.parseInt(sa.getDirectSysAssetId()))
                                .setParameter("createDate", new Date())
                                .setParameter("status", 0) // default value - pending
                                .executeUpdate();
                    }
                }

                return scheduleInfo;
            });

            if (!scheduleInfo.getCreateBy().equals("DE")) {
                persistenceService.publishPersistenceEvent(
                        PersistenceEvent.Cause.CREATE,
                        new ScheduleInfo(info.getId()),
                        new ScheduleInfo(info.getId()),
                        ScheduleInfo.class, null, null);
            }
            return info;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo lịch biểu: " + e.getMessage(), e);
        }
    }

    private void validateScheduleType(ScheduleInfo scheduleInfo) {
        String schType = scheduleInfo.getSchType();
        if ("ALWAYS".equals(schType)) {
            scheduleInfo.setSchFromDate(Timestamp.valueOf("2199-01-01 00:00:00"));
            scheduleInfo.setSchToDate(Timestamp.valueOf("2199-01-01 00:00:00"));
            scheduleInfo.setSchRepeatOccu(null);
        } else if ("ANOCC".equals(schType)) {
            if (scheduleInfo.getSchToDate() == null) {
                throw new RuntimeException("Vui lòng chọn ngày cho lịch 1 lần");
            }
            if (scheduleInfo.getSchFromDate() == null) {
                scheduleInfo.setSchFromDate(scheduleInfo.getSchToDate());
            }
            scheduleInfo.setSchRepeatOccu(null);
        } else if ("REOCC".equals(schType)) {
            if (scheduleInfo.getSchFromDate() == null || scheduleInfo.getSchToDate() == null) {
                throw new RuntimeException("Vui lòng chọn khoảng thời gian cho lịch lặp lại");
            }
            if (scheduleInfo.getSchRepeatOccu() == null || scheduleInfo.getSchRepeatOccu().isEmpty()) {
                throw new RuntimeException("Vui lòng chọn ít nhất một ngày trong tuần cho lịch lặp lại");
            }
            for (String day : scheduleInfo.getSchRepeatOccu().split(",")) {
                if (!day.matches("MO|TU|WE|TH|FR|SA|SU")) {
                    throw new RuntimeException("Giá trị ngày không hợp lệ: " + day);
                }
            }
        } else {
            throw new RuntimeException("Loại lịch biểu không hợp lệ: " + schType);
        }
    }

    private void prepareTimePeriodsAndLampTypes(ScheduleInfo scheduleInfo) {
        List<SchTimePeriod> schTimePeriods = new ArrayList<>();
        List<CustomizeLampType> customizeLampTypes = new ArrayList<>();

        for (TimeConfiguration config : scheduleInfo.getTimeConfigurations()) {
            SchTimePeriod timePeriod = config.getTimePeriod();
            schTimePeriods.add(timePeriod);
            if (config.getLampTypes() != null) {
                for (CustomizeLampType lamp : config.getLampTypes()) {
                    lamp.setTime_id(timePeriod.getTime_id());
                    customizeLampTypes.add(lamp);
                }
            }
        }

        scheduleInfo.setSchTimePeriods(schTimePeriods);
        scheduleInfo.setCustomizeLampType(customizeLampTypes);
    }

    private void insertScheduleAsset(EntityManager em, Integer scheduleId, String assetId, Integer sysAssetId) {
        em.createNativeQuery(
                        "INSERT INTO schedule_asset (id, schedule_id, asset_id, sys_asset_type_id, create_date) " +
                                "VALUES (:id, :scheduleId, :assetId, :sysAssetId, :createDate)")
                .setParameter("id", Math.abs(UUID.randomUUID().getLeastSignificantBits()))
                .setParameter("scheduleId", scheduleId)
                .setParameter("assetId", assetId)
                .setParameter("sysAssetId", sysAssetId)
                .setParameter("createDate", new Date())
                .executeUpdate();
    }

    public void insertScheduleAsset2(Integer scheduleId, String assetId, String typeAsset) {
        persistenceService.doTransaction(entityManager -> {
            // Câu query này sẽ chỉ insert khi cặp (schedule_id, asset_id) chưa tồn tại
            int insertedRows = entityManager.createNativeQuery(
                            "INSERT INTO schedule_asset (id, schedule_id, asset_id, sys_asset_type_id, create_date) " +
                                    "SELECT :id, :scheduleId, :assetId, " +
                                    "   (SELECT sat.id FROM sys_asset_type sat WHERE sat.asset_type_name = :typeAsset), " +
                                    "   :createDate " +
                                    "WHERE NOT EXISTS (" +
                                    "   SELECT 1 FROM schedule_asset sa WHERE sa.schedule_id = :scheduleId AND sa.asset_id = :assetId" +
                                    ")")
                    .setParameter("id", Math.abs(UUID.randomUUID().getLeastSignificantBits()))
                    .setParameter("scheduleId", scheduleId)
                    .setParameter("assetId", assetId)
                    .setParameter("typeAsset", typeAsset)
                    .setParameter("createDate", new Date())
                    .executeUpdate();

            // Chỉ publish event khi có bản ghi mới được thêm vào
            if (insertedRows > 0) {
                persistenceService.publishPersistenceEvent(
                        PersistenceEvent.Cause.CREATE,
                        new ScheduleInfo(scheduleId),
                        new ScheduleInfo(scheduleId), ScheduleInfo.class, null, null);
            }
        });
    }

    private String toJson(Object object) {
        try {
            return new ObjectMapper().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON convert error: " + e.getMessage(), e);
        }
    }

    public Long findPendingByScheduleId(Integer scheduleId) {
        return persistenceService.doReturningTransaction(em -> {
            String assetQuery = "SELECT COUNT(*) " +
                    "FROM schedule_asset " +
                    "WHERE schedule_id = :scheduleId AND status = 0 and deleted = 0";

            var query = em.createNativeQuery(assetQuery);

            query.setParameter("scheduleId", scheduleId);

            Object result = query.getSingleResult();
            if (result == null) {
                return 0L;
            }
            if (result instanceof Number) {
                return ((Number) result).longValue();
            } else {
                return 0L;
            }
        });
    }

    public Boolean IsSuccessDeleteByScheduleId(Integer scheduleId) {
        return (Boolean) persistenceService.doReturningTransaction(em -> {
            String assetQuery = "SELECT  " +
                    "    CASE  " +
                    "        WHEN COUNT(*) = COUNT(CASE WHEN status = 2 THEN 1 END) " +
                    "        THEN TRUE  " +
                    "        ELSE FALSE  " +
                    "    END AS all_status_2 " +
                    "FROM schedule_asset " +
                    "WHERE schedule_id = :scheduleId " +
                    "  AND deleted = 0;";

            var query = em.createNativeQuery(assetQuery);

            query.setParameter("scheduleId", scheduleId);

            return query.getSingleResult();

        });
    }

    public Boolean IsSuccessDeleteByScheduleIdAndIdAsset(Integer scheduleId, String assetId) {
        return (Boolean) persistenceService.doReturningTransaction(em -> {
            String assetQuery = "SELECT  " +
                    "    CASE  " +
                    "        WHEN status = 2  " +
                    "        THEN TRUE  " +
                    "        ELSE FALSE  " +
                    "    END AS all_status_2 " +
                    " FROM schedule_asset " +
                    " WHERE schedule_id = :scheduleId AND " +
                    " asset_id = :assetId " +
                    "  AND deleted = 0;";

            var query = em.createNativeQuery(assetQuery);

            query.setParameter("scheduleId", scheduleId);
            query.setParameter("assetId", assetId);

            return query.getSingleResult();

        });
    }

    public void sendCommandRemove3SceneClearToIdAsset(Integer id, String idAsset) {
        try {
            if (assetStorageService.find(idAsset).getType().equals(ROAD_ASSET)) {
                RulesService.expiringList.add(new RulesService.Command(id, "d", List.of(idAsset)));
            }
            List<LightCommand3Control2> lightCommands = new ArrayList<>(assetStorageService.usrSpGetAssetInfoListByParentId(idAsset));

            Map<String, List<LightCommand3Control2>> groupedResults = lightCommands.stream()
                    .collect(Collectors.groupingBy(LightCommand3Control2::getAssetCode));

            groupedResults.forEach((s, lightCommand3Control2s) -> {
                Hdi3SceneClear hdi3SceneClear = new Hdi3SceneClear();
                RulesService.expiringList.add(new RulesService.Command(id, "d", List.of(idAsset)));
                hdi3SceneClear.setTimer_id(id);
                HdiEven event = new HdiEven(hdi3SceneClear);
                event.setAssetCode(s);
                clientEventService.publishEvent(event);
            });
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Error processing schedule info change", e);
            updateAssetStatusBySchedule(id, -2);
        }
    }

    public ScheduleInfo update(ScheduleInfo updatedInfo) {
        try {
            ScheduleInfo scheduleInfo = persistenceService.doReturningTransaction(em -> {
                // 1. Validate ID and get existing info
                Integer id = updatedInfo.getId();
                if (id == null) {
                    throw new RuntimeException("ID lịch biểu không được để trống.");
                }

                ScheduleInfo existingInfo = getDetail(id);
                if (existingInfo == null) {
                    throw new RuntimeException("Không tìm thấy lịch biểu với ID " + id);
                }

                // 2. Validate schedule code if changed
                if (updatedInfo.getScheduleCode() != null && !updatedInfo.getScheduleCode().equals(existingInfo.getScheduleCode())) {
                    String code = updatedInfo.getScheduleCode();
                    if (code == null || code.trim().isEmpty()) {
                        throw new RuntimeException("Tên lịch biểu không được để trống.");
                    }

                    Long count = (Long) em.createNativeQuery(
                                    "SELECT COUNT(*) FROM schedule_info WHERE LOWER(schedule_code) = LOWER(:name) AND id != :id AND deleted = 0")
                            .setParameter("name", code.trim())
                            .setParameter("id", id)
                            .getSingleResult();

                    if (count != null && count > 0) {
                        throw new RuntimeException("Mã lịch biểu '" + code + "' đã tồn tại!");
                    }
                }

                // 3. Validate and update schedule type and dates
                String schType = updatedInfo.getSchType() != null ? updatedInfo.getSchType() : existingInfo.getSchType();

                if ("ALWAYS".equals(schType)) {
                    updatedInfo.setSchFromDate(Timestamp.valueOf("2199-01-01 00:00:00"));
                    updatedInfo.setSchToDate(Timestamp.valueOf("2199-01-01 00:00:00"));
                    updatedInfo.setSchRepeatOccu(null);
                    updatedInfo.setSchRepeatEnd(false);
                } else if ("ANOCC".equals(schType)) {
                    Timestamp fromDate = updatedInfo.getSchFromDate() != null ? updatedInfo.getSchFromDate() : existingInfo.getSchFromDate();
                    Timestamp toDate = updatedInfo.getSchToDate() != null ? updatedInfo.getSchToDate() : existingInfo.getSchToDate();

                    if (toDate == null) {
                        throw new RuntimeException("Vui lòng chọn ngày cho lịch 1 lần");
                    }

                    updatedInfo.setSchFromDate(fromDate != null ? fromDate : toDate);
                    updatedInfo.setSchToDate(toDate);
                    updatedInfo.setSchRepeatOccu(null);
                    updatedInfo.setSchRepeatEnd(false);

                } else if ("REOCC".equals(schType)) {
                    Timestamp fromDate = updatedInfo.getSchFromDate() != null ? updatedInfo.getSchFromDate() : existingInfo.getSchFromDate();
                    Timestamp toDate = updatedInfo.getSchToDate() != null ? updatedInfo.getSchToDate() : existingInfo.getSchToDate();

                    if (fromDate == null || toDate == null) {
                        throw new RuntimeException("Vui lòng chọn khoảng thời gian cho lịch lặp lại");
                    }

                    String repeatOccu = updatedInfo.getSchRepeatOccu() != null ? updatedInfo.getSchRepeatOccu() : existingInfo.getSchRepeatOccu();
                    if (repeatOccu == null || repeatOccu.isEmpty()) {
                        throw new RuntimeException("Vui lòng chọn ít nhất một ngày trong tuần cho lịch lặp lại");
                    }

                    String[] days = repeatOccu.split(",");
                    for (String day : days) {
                        if (!day.matches("MO|TU|WE|TH|FR|SA|SU")) {
                            throw new RuntimeException("Giá trị ngày không hợp lệ: " + day);
                        }
                    }

                    updatedInfo.setSchFromDate(fromDate);
                    updatedInfo.setSchToDate(toDate);
                    updatedInfo.setSchRepeatOccu(repeatOccu);
                } else if (updatedInfo.getSchType() != null) {
                    throw new RuntimeException("Loại lịch biểu không hợp lệ: " + schType);
                }

                // 4. Validate timeConfigurations and scheduleAssets
                if (updatedInfo.getTimeConfigurations() != null) {
                    if (updatedInfo.getScheduleAssets() == null) {
                        throw new RuntimeException("Danh sách scheduleAssets không được null khi có timeConfigurations.");
                    }

                    // New validation: Reject if both are empty
                    if (updatedInfo.getTimeConfigurations().isEmpty() &&
                            (updatedInfo.getScheduleAssets() == null || updatedInfo.getScheduleAssets().isEmpty())) {
                        throw new RuntimeException("Phải có ít nhất một timeConfiguration hoặc scheduleAsset");
                    }

                    // Original validation: Can't have timeConfigurations without scheduleAssets
                    if (!updatedInfo.getTimeConfigurations().isEmpty() &&
                            (updatedInfo.getScheduleAssets() == null || updatedInfo.getScheduleAssets().isEmpty())) {
                        throw new RuntimeException("Không được khai báo timeConfigurations khi không có scheduleAssets.");
                    }
                }

                // 5. Prepare time periods and lamp types if timeConfigurations are provided
                List<SchTimePeriod> schTimePeriods = existingInfo.getSchTimePeriods();
                List<CustomizeLampType> customizeLampTypes = existingInfo.getCustomizeLampType();

                if (updatedInfo.getTimeConfigurations() != null) {
                    schTimePeriods = new ArrayList<>();
                    customizeLampTypes = new ArrayList<>();

                    for (TimeConfiguration config : updatedInfo.getTimeConfigurations()) {
                        SchTimePeriod timePeriod = config.getTimePeriod();
                        schTimePeriods.add(timePeriod);
                        if (config.getLampTypes() != null) {
                            for (CustomizeLampType lamp : config.getLampTypes()) {
                                lamp.setTime_id(timePeriod.getTime_id());
                                customizeLampTypes.add(lamp);
                            }
                        }
                    }
                }

                // 6. Convert to JSON
                ObjectMapper objectMapper = new ObjectMapper();
                String schTimePeriodJson;
                String customizeLampTypeJson;
                try {
                    schTimePeriodJson = objectMapper.writeValueAsString(schTimePeriods);
                    customizeLampTypeJson = objectMapper.writeValueAsString(customizeLampTypes);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Lỗi khi chuyển đổi dữ liệu sang JSON: " + e.getMessage(), e);
                }

                // 7. Update schedule info
                Timestamp now = new Timestamp(System.currentTimeMillis());

                // Build dynamic update query
                StringBuilder updateQuery = new StringBuilder("UPDATE schedule_info SET ");
                Map<String, Object> params = new HashMap<>();

                // Always update these fields
                updateQuery.append("update_date = :updateDate, update_by = :updateBy, mail_sent = 0, ");
                params.put("updateDate", now);
                params.put("updateBy", updatedInfo.getUpdateBy() != null ? updatedInfo.getUpdateBy() : existingInfo.getUpdateBy());

                // Conditional updates
                if (updatedInfo.getScheduleCode() != null) {
                    updateQuery.append("schedule_code = :code, ");
                    params.put("code", updatedInfo.getScheduleCode());
                }
                if (updatedInfo.getScheduleName() != null) {
                    updateQuery.append("schedule_name = :name, ");
                    params.put("name", updatedInfo.getScheduleName());
                }
                if (updatedInfo.getRealm() != null) {
                    updateQuery.append("realm = :realm, ");
                    params.put("realm", updatedInfo.getRealm());
                }
                if (updatedInfo.getActive() != null) {
                    updateQuery.append("active = :active, ");
                    params.put("active", updatedInfo.getActive());
                }
                if (updatedInfo.getSchType() != null) {
                    updateQuery.append("sch_type = :type, ");
                    params.put("type", updatedInfo.getSchType());
                }
                if (updatedInfo.getSchFromDate() != null || "ALWAYS".equals(schType)) {
                    updateQuery.append("sch_from_date = :fromDate, ");
                    params.put("fromDate", updatedInfo.getSchFromDate() != null ? updatedInfo.getSchFromDate() :
                            "ALWAYS".equals(schType) ? Timestamp.valueOf("2199-01-01 00:00:00") : existingInfo.getSchFromDate());
                }
                if (updatedInfo.getSchToDate() != null || "ALWAYS".equals(schType)) {
                    updateQuery.append("sch_to_date = :toDate, ");
                    params.put("toDate", updatedInfo.getSchToDate() != null ? updatedInfo.getSchToDate() :
                            "ALWAYS".equals(schType) ? Timestamp.valueOf("2199-01-01 00:00:00") : existingInfo.getSchToDate());
                }
                updateQuery.append("sch_repeat_occu = :repeatOccu, ");
                params.put("repeatOccu", updatedInfo.getSchRepeatOccu());
                if (updatedInfo.getSchRepeatEnd() != null) {
                    updateQuery.append("is_sch_repeat_end = :repeatEnd, ");
                    params.put("repeatEnd", updatedInfo.getSchRepeatEnd());
                }
                if (updatedInfo.getTimeConfigurations() != null) {
                    updateQuery.append("sch_time_period = CAST(:timePeriod AS jsonb), ");
                    params.put("timePeriod", schTimePeriodJson);
                    updateQuery.append("customize_lamp_type = CAST(:lampType AS jsonb), ");
                    params.put("lampType", customizeLampTypeJson);
                }
                if (updatedInfo.getDescription() != null) {
                    updateQuery.append("description = :description, ");
                    params.put("description", updatedInfo.getDescription());
                }

                // Remove trailing comma
                updateQuery.delete(updateQuery.length() - 2, updateQuery.length());
                updateQuery.append(" WHERE id = :id");
                params.put("id", id);

                // Execute update
                Query query = em.createNativeQuery(updateQuery.toString());
                for (Map.Entry<String, Object> entry : params.entrySet()) {
                    query.setParameter(entry.getKey(), entry.getValue());
                }
                query.executeUpdate();

                // 8. Update schedule assets if provided
                if (updatedInfo.getScheduleAssets() != null) {
                    // Delete existing assets
                    em.createNativeQuery("DELETE FROM schedule_asset WHERE schedule_id = :scheduleId")
                            .setParameter("scheduleId", id)
                            .executeUpdate();

                    // Insert new assets if any
                    if (!updatedInfo.getScheduleAssets().isEmpty()) {
                        for (ScheduleAsset sa : updatedInfo.getScheduleAssets()) {
                            if (sa.getDirectAssetId() == null) {
                                throw new RuntimeException("Thiếu thông tin asset_id trong scheduleAsset");
                            }
                            if (sa.getDirectSysAssetId() == null) {
                                throw new RuntimeException("Thiếu thông tin sys_asset_id trong scheduleAsset");
                            }
                            em.createNativeQuery(
                                            "INSERT INTO schedule_asset (id, schedule_id, asset_id, sys_asset_type_id, create_date, status) " +
                                                    "VALUES (:id, :scheduleId, :assetId, :sysAssetId, :createDate, :status)")
                                    .setParameter("id", Math.abs(UUID.randomUUID().getLeastSignificantBits()))
                                    .setParameter("scheduleId", id)
                                    .setParameter("assetId", sa.getDirectAssetId())
                                    .setParameter("sysAssetId", Integer.parseInt(sa.getDirectSysAssetId()))
                                    .setParameter("createDate", now)
                                    .setParameter("status", 0) // default value: pending
                                    .executeUpdate();
                        }
                    }
                }

                // 9. Return updated info
                ScheduleInfo result = getDetail(id);
                result.setUpdateDate(now);


                return result;
            });
            persistenceService.publishPersistenceEvent(
                    PersistenceEvent.Cause.CREATE,
                    new ScheduleInfo(scheduleInfo.getId()),
                    new ScheduleInfo(scheduleInfo.getId()), ScheduleInfo.class, null, null);
            return scheduleInfo;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi cập nhật lịch biểu: " + e.getMessage(), e);
        }
    }

    public boolean removeScheduleAssets(Integer scheduleId, List<String> assetIdsToRemove) {
        return persistenceService.doReturningTransaction(em -> {
            // Validate input
            if (scheduleId == null || assetIdsToRemove == null || assetIdsToRemove.isEmpty()) {
                throw new IllegalArgumentException("Thiếu thông tin scheduleId hoặc danh sách asset cần xóa");
            }

            // Xóa các assets chỉ định
            int deletedCount = em.createNativeQuery(
                            "DELETE FROM schedule_asset " +
                                    "WHERE schedule_id = :scheduleId AND asset_id IN :assetIds")
                    .setParameter("scheduleId", scheduleId)
                    .setParameter("assetIds", assetIdsToRemove)
                    .executeUpdate();

            return deletedCount > 0;
        });
    }

    public boolean removeScheduleAssets2(Integer scheduleId, List<String> assetIdsToRemove) {
        return persistenceService.doReturningTransaction(em -> {
            // Validate input
            if (scheduleId == null || assetIdsToRemove == null || assetIdsToRemove.isEmpty()) {
                throw new IllegalArgumentException("Thiếu thông tin scheduleId hoặc danh sách asset cần xóa");
            }

            // Xóa các assets chỉ định
            int deletedCount = em.createNativeQuery(
                            "DELETE FROM schedule_asset " +
                                    "WHERE schedule_id = :scheduleId AND asset_id IN :assetIds")
                    .setParameter("scheduleId", scheduleId)
                    .setParameter("assetIds", assetIdsToRemove)
                    .executeUpdate();

            return deletedCount > 0;
        });
    }

    public ScheduleInfo getDetail(Integer id) {
        return persistenceService.doReturningTransaction(em -> {
            // 1. Lấy thông tin cơ bản từ schedule_info
            String sql = "SELECT id, schedule_code, schedule_name, realm, active, sch_type, " +
                    "sch_from_date, sch_to_date, sch_repeat_occu, is_sch_repeat_end, " +
                    "sch_time_period, customize_lamp_type, deleted, description, " +
                    "create_date, create_by, update_date, update_by " +
                    "FROM schedule_info WHERE id = :id AND deleted = 0";
            List<Object[]> result = em.createNativeQuery(sql).setParameter("id", id).getResultList();

            if (result.isEmpty()) return null;

            Object[] row = result.get(0);

            List<SchTimePeriod> timePeriods = convertJsonToSchTimePeriodList((String) row[10]);
            List<CustomizeLampType> lampTypes = convertJsonToCustomizeLampType((String) row[11]);

            // 2. Bổ sung thông tin lamp_type_name vào từng CustomizeLampType
            if (lampTypes != null && !lampTypes.isEmpty()) {
                List<Integer> lampTypeIds = lampTypes.stream()
                        .map(CustomizeLampType::getLampTypeId)
                        .collect(Collectors.toList());

                String lampTypeQuery = "SELECT id, lamp_type_name, lamp_type_code FROM md_lamp_type WHERE id IN (:ids)";
                List<Object[]> lampTypeResults = em.createNativeQuery(lampTypeQuery)
                        .setParameter("ids", lampTypeIds)
                        .getResultList();

                Map<Integer, String> lampTypeNameMap = new HashMap<>();
                for (Object[] lampRow : lampTypeResults) {
                    Integer lampId = ((Number) lampRow[0]).intValue();
                    String lampName = (String) lampRow[1];
                    lampTypeNameMap.put(lampId, lampName);
                }

                // Gán lampTypeName cho từng CustomizeLampType
                for (CustomizeLampType lamp : lampTypes) {
                    if (lampTypeNameMap.containsKey(lamp.getLampTypeId())) {
                        lamp.setLampTypeName(lampTypeNameMap.get(lamp.getLampTypeId()));
                    }
                }
            }

            // 3. Mapping time configurations
            List<TimeConfiguration> timeConfigurations = new ArrayList<>();
            for (SchTimePeriod period : timePeriods) {
                TimeConfiguration config = new TimeConfiguration();
                config.setTimePeriod(period);

                // LỌC lampTypes có time_id trùng với period.time_id
                List<CustomizeLampType> filteredLampTypes = lampTypes.stream()
                        .filter(l -> l.getTime_id().equals(period.getTime_id()))
                        .collect(Collectors.toList());

                config.setLampTypes(filteredLampTypes);
                timeConfigurations.add(config);
            }


            // 4. Tạo ScheduleInfo
            ScheduleInfo scheduleInfo = new ScheduleInfo(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    (String) row[3],
                    ((Number) row[4]).intValue(),
                    (String) row[5],
                    (Timestamp) row[6],
                    (Timestamp) row[7],
                    (String) row[8],
                    (Boolean) row[9],
                    null, null,
                    ((Number) row[12]).intValue(),
                    (String) row[13],
                    (Timestamp) row[14],
                    (String) row[15],
                    (Timestamp) row[16],
                    (String) row[17],
                    null, null
            );
            scheduleInfo.setTimeConfigurations(timeConfigurations);

            // 5. Lấy scheduleAssets
            String assetQuery = "SELECT sa.id, a.name, sat.asset_type_code, sat.asset_type_name, " +
                    "a.id as asset_id, sat.id as sys_asset_type_id, a.attributes, sa.status " +
                    "FROM schedule_asset sa " +
                    "JOIN asset a ON sa.asset_id = a.id " +
                    "JOIN sys_asset_type sat ON sa.sys_asset_type_id = sat.id " +
                    "WHERE sa.schedule_id = :scheduleId";

            List<Object[]> assetRows = em.createNativeQuery(assetQuery)
                    .setParameter("scheduleId", id)
                    .getResultList();

            List<ScheduleAsset> scheduleAssets = new ArrayList<>();
            for (Object[] assetRow : assetRows) {
                ScheduleAsset scheduleAsset = new ScheduleAsset();
                scheduleAsset.setId(String.valueOf(assetRow[0]));
                scheduleAsset.setDirectAssetId(String.valueOf(assetRow[4]));
                scheduleAsset.assetName = (String) assetRow[1];
                scheduleAsset.assetTypeCode = (String) assetRow[2];
                scheduleAsset.assetTypeName = (String) assetRow[3];
                scheduleAsset.setAsset_id(String.valueOf(assetRow[4]));
                scheduleAsset.setDirectSysAssetId(String.valueOf(assetRow[5]));
                scheduleAsset.setStatus((Integer) assetRow[7]);

                // Attributes
                if (assetRow[6] != null) {
                    String attributesJson = (String) assetRow[6];
                    try {
                        ObjectMapper objectMapper = new ObjectMapper();
                        Map<String, Object> attributesMap = objectMapper.readValue(attributesJson,
                                new TypeReference<Map<String, Object>>() {
                                });
                        scheduleAsset.setAttributes(attributesMap);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                scheduleAssets.add(scheduleAsset);
            }

            scheduleInfo.setScheduleAssets(scheduleAssets);
            return scheduleInfo;
        });
    }


//    public List<AssetDTO> getAllAssets() {
//        return persistenceService.doReturningTransaction(em -> {
//            List<Object[]> results = em.createNativeQuery(
//                    "SELECT id, name,type FROM asset "
//            ).getResultList();
//
//            List<AssetDTO> assets = new ArrayList<>();
//            for (Object[] row : results) {
//                assets.add(new AssetDTO(row[0].toString(), row[1].toString(),row[2].toString()));
//            }
//
//            return assets;
//        });
//    }


    public List<ScheduleInfo> getSchedulesByAssetId(String assetId, int page, int size) {
        return persistenceService.doReturningTransaction(em -> {
            // 1. Lấy path của asset
            List<Object> pathObjs = em.createNativeQuery(
                            "SELECT path FROM asset WHERE id = :assetId"
                    )
                    .setParameter("assetId", assetId)
                    .getResultList();

            if (pathObjs == null || pathObjs.isEmpty()) {
                return Collections.emptyList();
            }

            // 2. Convert PGobject -> String
            String path;
            Object firstObj = pathObjs.get(0);
            if (firstObj instanceof String) {
                path = (String) firstObj;
            } else if (firstObj instanceof org.postgresql.util.PGobject) {
                path = ((org.postgresql.util.PGobject) firstObj).getValue();
            } else {
                throw new RuntimeException("Unknown path type: " + firstObj.getClass());
            }

            if (path == null || path.isEmpty()) {
                return Collections.emptyList();
            }

            // 3. Tách tất cả assetIds từ path
            List<String> assetIdsFromPath = Arrays.asList(path.split("\\."));

            // 4. Query tất cả schedule_id liên quan đến assetIds
            List<Integer> scheduleIds = em.createNativeQuery(
                            "SELECT DISTINCT schedule_id FROM schedule_asset WHERE asset_id IN :assetIds"
                    )
                    .setParameter("assetIds", assetIdsFromPath)
                    .getResultList();

            if (scheduleIds == null || scheduleIds.isEmpty()) {
                return Collections.emptyList();
            }

            // 5. Query thông tin lịch từ schedule_info
            Query query = em.createNativeQuery(
                            "SELECT id, schedule_code, schedule_name, realm, active, sch_type, " +
                                    "sch_from_date, sch_to_date, sch_repeat_occu, is_sch_repeat_end, " +
                                    "sch_time_period, customize_lamp_type, deleted, description, " +
                                    "create_date, create_by, update_date, update_by " +
                                    "FROM schedule_info WHERE id IN :scheduleIds AND deleted = 0 AND active = 1 " +
                                    "ORDER BY schedule_name"
                    )
                    .setParameter("scheduleIds", scheduleIds);

            if (page > 0 && size > 0) {
                query.setFirstResult((page - 1) * size);
                query.setMaxResults(size);
            }

            @SuppressWarnings("unchecked")
            List<Object[]> resultList = query.getResultList();

            return resultList.stream()
                    .map(this::mapToScheduleInfo)
                    .collect(Collectors.toList());
        });
    }


    public List<ScheduleInfo> getSchedulesNotInAssetId(String assetId, int page, int size) {
        return persistenceService.doReturningTransaction(em -> {
            // 1. Lấy path của asset
            List<Object> pathObjs = em.createNativeQuery(
                            "SELECT path FROM asset WHERE id = :assetId"
                    )
                    .setParameter("assetId", assetId)
                    .getResultList();

            if (pathObjs == null || pathObjs.isEmpty()) {
                return Collections.emptyList();
            }

            // 2. Convert PGobject -> String
            String path;
            Object firstObj = pathObjs.get(0);
            if (firstObj instanceof String) {
                path = (String) firstObj;
            } else if (firstObj instanceof org.postgresql.util.PGobject) {
                path = ((org.postgresql.util.PGobject) firstObj).getValue();
            } else {
                throw new RuntimeException("Unknown path type: " + firstObj.getClass());
            }

            if (path == null || path.isEmpty()) {
                return Collections.emptyList();
            }

            // 3. Tách tất cả assetIds từ path
            List<String> assetIdsFromPath = Arrays.asList(path.split("\\."));

            // 4. Query tất cả schedule_id ko liên quan đến assetIds
            List<Integer> scheduleIds = em.createNativeQuery(
                            "SELECT DISTINCT schedule_id " +
                                    "FROM schedule_asset " +
                                    "WHERE schedule_id NOT IN ( " +
                                    "    SELECT DISTINCT schedule_id " +
                                    "    FROM schedule_asset " +
                                    "    WHERE asset_id IN :assetIds " +
                                    ")"
                    )
                    .setParameter("assetIds", assetIdsFromPath)
                    .getResultList();

            if (scheduleIds == null || scheduleIds.isEmpty()) {
                return Collections.emptyList();
            }

            // 5. Query thông tin lịch từ schedule_info
            Query query = em.createNativeQuery(
                            "SELECT id, schedule_code, schedule_name, realm, active, sch_type, " +
                                    "sch_from_date, sch_to_date, sch_repeat_occu, is_sch_repeat_end, " +
                                    "sch_time_period, customize_lamp_type, deleted, description, " +
                                    "create_date, create_by, update_date, update_by " +
                                    "FROM schedule_info WHERE id IN :scheduleIds AND deleted = 0 AND active = 1 AND realm = " +
                                    " (SELECT realm FROM asset WHERE id = :assetId) " +
                                    "ORDER BY schedule_name"
                    )
                    .setParameter("scheduleIds", scheduleIds)
                    .setParameter("assetId", assetId);


            if (page > 0 && size > 0) {
                query.setFirstResult((page - 1) * size);
                query.setMaxResults(size);
            }

            @SuppressWarnings("unchecked")
            List<Object[]> resultList = query.getResultList();

            return resultList.stream()
                    .map(this::mapToScheduleInfo)
                    .collect(Collectors.toList());
        });
    }


    public List<AssetTypeDTO> getAllAssetTypes(String realm) {
        return persistenceService.doReturningTransaction(em -> {
            Query query = em.createNativeQuery(
                    "SELECT sat.id AS asset_type_id, sat.asset_type_name, sat.asset_type_code, " +
                            "       a.id AS asset_id, a.name, a.realm, a.type, a.parent_id " +
                            "FROM sys_asset_type sat " +
                            "LEFT JOIN asset a ON a.type = sat.asset_type_name " +
                            "LEFT JOIN asset_info ai ON ai.id = a.id " +
                            " where (ai.deleted = FALSE or ai.deleted is null) AND a.realm = :realm " +
                            " AND EXISTS ( " +
                            "    SELECT 1 " +
                            "    FROM asset r " +
                            "    WHERE r.id = subpath(a.path, 0, 1)\\:\\:text " +
                            "      AND r.type = 'RoadAsset' " +
                            "  ) " +
                            "ORDER BY sat.id, a.id"
            );
            query.setParameter("realm", realm);

            List<Object[]> results = query.getResultList();

            Map<Integer, AssetTypeDTO> assetTypeMap = new LinkedHashMap<>();

            for (Object[] row : results) {
                Integer assetTypeId = ((Number) row[0]).intValue();
                AssetTypeDTO assetType = assetTypeMap.get(assetTypeId);
                if (assetType == null) {
                    assetType = new AssetTypeDTO(
                            assetTypeId,
                            (String) row[1],
                            (String) row[2]
                    );
                    assetTypeMap.put(assetTypeId, assetType);
                }

                // Kiểm tra xem asset có tồn tại (tránh null do LEFT JOIN)
                if (row[3] != null) {
                    AssetDTO asset = new AssetDTO(
                            (String) row[3], // asset.id
                            (String) row[4], // asset.name
                            row[5] != null ? (String) row[5] : null, // asset.realm
                            (String) row[6], // asset.type
                            row[7] != null ? row[7].toString() : null // asset.parent_id

                    );
                    assetType.getAssets().add(asset);
                }
            }

            return new ArrayList<>(assetTypeMap.values());
        });
    }


    public List<LampTypeDTO> getLampTypes(List<String> assetIds) {
        return persistenceService.doReturningTransaction(em -> {
            List<LampTypeDTO> allLampTypes = new ArrayList<>();

            for (String assetId : assetIds) {
                String type = (String) em.createNativeQuery(
                                "SELECT type FROM asset WHERE id = :assetId"
                        )
                        .setParameter("assetId", assetId)
                        .getSingleResult();

                List<Object[]> lampTypeResults;

                if ("LightAsset".equalsIgnoreCase(type)) {
                    lampTypeResults = em.createNativeQuery(
                                    "SELECT mlt.id, mlt.power_consumption " +
                                            "FROM asset a " +
                                            "JOIN route_lamppost_detail rld ON rld.asset_id = a.id " +
                                            "JOIN md_lamp_type mlt ON rld.lamp_type_id = mlt.id " +
                                            "WHERE a.id = :assetId"
                            )
                            .setParameter("assetId", assetId)
                            .getResultList();
                } else {
                    lampTypeResults = em.createNativeQuery(
                                    "SELECT DISTINCT mlt.id, mlt.power_consumption " +
                                            "FROM asset a " +
                                            "JOIN route_lamppost_detail rld ON rld.asset_id = a.id " +
                                            "JOIN md_lamp_type mlt ON rld.lamp_type_id = mlt.id " +
                                            "WHERE a.parent_id = :parentId"
                            )
                            .setParameter("parentId", assetId)
                            .getResultList();
                }

                for (Object[] row : lampTypeResults) {
                    allLampTypes.add(new LampTypeDTO(
                            ((Number) row[0]).intValue(),
                            (Integer) row[1]
                    ));
                }
            }

            return allLampTypes;
        });
    }


    public boolean delete(Integer id, String deletedBy) {
        return persistenceService.doReturningTransaction(em -> {
            // 1. Kiểm tra xem lịch có tồn tại không
            Long count = (Long) em.createNativeQuery(
                            "SELECT COUNT(*) FROM schedule_info WHERE id = ? AND deleted = 0")
                    .setParameter(1, id)
                    .getSingleResult();

            if (count == null || count == 0) {
                throw new RuntimeException("Không tìm thấy lịch với ID " + id);
            }

            Timestamp now = new Timestamp(System.currentTimeMillis());

            int updated = em.createNativeQuery(
                            "UPDATE schedule_info SET " +
                                    "deleted = 1, " +
                                    "update_date = ?, " +
                                    "update_by = ? " +
                                    "WHERE id = ?")
                    .setParameter(1, now)
                    .setParameter(2, deletedBy)
                    .setParameter(3, id)
                    .executeUpdate();

            return updated > 0;
        });
    }

    public Long countData(ScheduleSearchDTO<ScheduleInfo> scheduleSearchDTO) {
        // Nếu null, trả về 0
        if (scheduleSearchDTO == null) {
            System.out.println("scheduleSearchDTO is null");
            return 0L;
        }

        ScheduleInfo filterData = scheduleSearchDTO.getData();
        String scheduleName = null;
        String realm = null;
        String scheduleType = null;
        String approvalStatus = null;
        Long fromDate = null;
        Long toDate = null;
        String refType = null; // "area" or "asset"
        String refId = null;   // uuid string

        if (filterData != null) {
            scheduleName = filterData.getScheduleName();
            realm = filterData.getRealm();
            scheduleType = filterData.getSchType();
            approvalStatus = filterData.getApprovalStatus();
            fromDate = scheduleSearchDTO.getFromDate();
            toDate = scheduleSearchDTO.getToDate();
            refType = scheduleSearchDTO.getType(); // "area" or "asset"
            refId = scheduleSearchDTO.getId();     // uuid string
        } else {
            System.out.println("scheduleSearchDTO.getData() is null");
        }

        final String finalScheduleName = scheduleName;
        final String finalRealm = realm;
        final String finalScheduleType = scheduleType;
        final String finalApprovalStatus = approvalStatus;
        final Long finalFromDate = fromDate;
        final Long finalToDate = toDate;
        final String finalRefType = refType;
        final String finalRefId = refId;

        return persistenceService.doReturningTransaction(em -> {
            StringBuilder baseQuery = new StringBuilder(
                    "SELECT COUNT(DISTINCT si.id) " +
                            "FROM openremote.schedule_info si " +
                            "JOIN openremote.news_category nc " +
                            "  ON si.news_category_id = nc.id AND nc.is_deleted = false " +
                            "WHERE si.deleted = 0"
            );

            // Áp dụng các điều kiện filter giống hàm getAll
            if (validationUtils.isValid(finalScheduleName)) {
                baseQuery.append(" AND LOWER(si.schedule_name) LIKE LOWER(:scheduleName)");
            }
            if (validationUtils.isValid(finalRealm)) {
                baseQuery.append(" AND si.realm = :realm");
            }
            if (validationUtils.isValid(finalScheduleType)) {
                baseQuery.append(" AND si.sch_type = :scheduleType");
            }
            if (validationUtils.isValid(finalApprovalStatus)) {
                baseQuery.append(" AND si.approval_status = :approvalStatus");
            }
            if (finalFromDate != null && finalToDate != null) {
                baseQuery.append(" AND si.sch_from_date <= :toDate AND si.sch_to_date >= :fromDate");
            } else if (finalFromDate != null) {
                baseQuery.append(" AND si.sch_to_date >= :fromDate");
            } else if (finalToDate != null) {
                baseQuery.append(" AND si.sch_from_date <= :toDate");
            }
            if (validationUtils.isValid(finalRefType) && validationUtils.isValid(finalRefId)) {
                if ("asset".equalsIgnoreCase(finalRefType)) {
                    baseQuery.append(
                            " AND EXISTS ( " +
                                    "   SELECT 1 FROM openremote.schedule_asset sa " +
                                    "   WHERE sa.is_deleted = false " +
                                    "     AND CAST(sa.schedule_id AS int) = si.id " +
                                    "     AND sa.asset_id = :refId " +
                                    " )"
                    );
                } else if ("area".equalsIgnoreCase(finalRefType)) {
                    baseQuery.append(
                            " AND EXISTS ( " +
                                    "   SELECT 1 FROM openremote.schedule_asset sa " +
                                    "   JOIN openremote.asset_info ai ON ai.id = sa.asset_id AND ai.deleted = false " +
                                    "   WHERE sa.is_deleted = false " +
                                    "     AND CAST(sa.schedule_id AS int) = si.id " +
                                    "     AND ai.area_id = :refId " +
                                    " )"
                    );
                }
            }

            Query query = em.createNativeQuery(baseQuery.toString());

            // Set parameters giống hàm getAll
            if (validationUtils.isValid(finalScheduleName)) {
                query.setParameter("scheduleName", "%" + finalScheduleName.trim() + "%");
            }
            if (validationUtils.isValid(finalRealm)) {
                query.setParameter("realm", finalRealm.trim());
            }
            if (validationUtils.isValid(finalScheduleType)) {
                query.setParameter("scheduleType", finalScheduleType.trim());
            }
            if (validationUtils.isValid(finalApprovalStatus)) {
                query.setParameter("approvalStatus", finalApprovalStatus.trim());
            }
            if (validationUtils.isValid(finalRefType) && validationUtils.isValid(finalRefId)) {
                if ("asset".equalsIgnoreCase(finalRefType) || "area".equalsIgnoreCase(finalRefType)) {
                    query.setParameter("refId", finalRefId.trim());
                }
            }
            if (finalFromDate != null) {
                query.setParameter("fromDate", new java.sql.Timestamp(finalFromDate));
            }
            if (finalToDate != null) {
                query.setParameter("toDate", new java.sql.Timestamp(finalToDate));
            }

            return ((Number) query.getSingleResult()).longValue();
        });
    }


    private Timestamp getFromDate(String schType, Timestamp userInputDate) {
        if ("ALWAYS".equalsIgnoreCase(schType)) {
            return Timestamp.valueOf("2199-01-01 00:00:00");
        }
        return userInputDate;
    }

    private Timestamp getToDate(String schType, Timestamp userInputDate) {
        if ("ALWAYS".equalsIgnoreCase(schType)) {
            return Timestamp.valueOf("2199-01-01 00:00:00");
        }
        return userInputDate;
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

    public Object countByAssetId(String assetId) {
        return persistenceService.doReturningTransaction(em -> {
            // 1. Lấy path của asset
            List<Object> pathObjs = em.createNativeQuery(
                            "SELECT path FROM asset WHERE id = :assetId"
                    )
                    .setParameter("assetId", assetId)
                    .getResultList();

            if (pathObjs == null || pathObjs.isEmpty()) {
                return Collections.emptyList();
            }

            // 2. Convert PGobject -> String
            String path;
            Object firstObj = pathObjs.get(0);
            if (firstObj instanceof String) {
                path = (String) firstObj;
            } else if (firstObj instanceof org.postgresql.util.PGobject) {
                path = ((org.postgresql.util.PGobject) firstObj).getValue();
            } else {
                throw new RuntimeException("Unknown path type: " + firstObj.getClass());
            }

            if (path == null || path.isEmpty()) {
                return Collections.emptyList();
            }

            // 3. Tách tất cả assetIds từ path
            List<String> assetIdsFromPath = Arrays.asList(path.split("\\."));

            String sql = "SELECT COUNT(DISTINCT si.id) " +
                    "FROM schedule_info si " +
                    "JOIN schedule_asset sa ON si.id = sa.schedule_id " +
                    "WHERE sa.asset_id IN :assetIdsFromPath AND si.deleted = 0 AND active = 1";

            return ((Number) em.createNativeQuery(sql)
                    .setParameter("assetIdsFromPath", assetIdsFromPath)
                    .getSingleResult()).longValue();
        });
    }

    public String setLamppostIdByassetId(String id) {
        return persistenceService.doReturningTransaction(entityManager -> {
            List<?> results = entityManager
                    .createNativeQuery("SELECT rld.lamp_type_id FROM route_lamppost_detail rld WHERE rld.asset_id = :assetId LIMIT 1")
                    .setParameter("assetId", id)
                    .getResultList();

            if (results.isEmpty()) {
                return null;
            }

            return results.get(0).toString();
        });
    }

    public Integer createScheduleComposite(CreateScheduleRequest request, User user) {
        return persistenceService.doReturningTransaction(em -> {
            try {

                // ------------------------------------------------------------------
                // 1. VALIDATE CƠ BẢN (NULL/EMPTY)
                // ------------------------------------------------------------------
                if (request.getScheduleCode() == null || request.getScheduleCode().trim().isEmpty()) {
                    throw new RuntimeException("Mã lịch phát (Code) không được để trống!");
                }
                if (request.getScheduleName() == null || request.getScheduleName().trim().isEmpty()) {
                    throw new RuntimeException("Tên lịch phát (Name) không được để trống!");
                }

                String codeToCheck = request.getScheduleCode().trim();
                //String realm = "master"; // Realm cố định hoặc lấy từ request nếu có
                String realm = request.getRealm();
                // ------------------------------------------------------------------
                // 2. CHECK TRÙNG MÃ (DUPLICATE CODE)
                // ------------------------------------------------------------------
                // Kiểm tra xem mã đã tồn tại trong hệ thống chưa (chỉ tính các bản ghi chưa bị xóa)
                String sqlCheckDuplicate = "SELECT COUNT(1) FROM openremote.schedule_info " +
                        "WHERE schedule_code = :code " +
                        "AND realm = :realm " +
                        "AND deleted = 0"; // Giả sử deleted = 0 là chưa xóa

                Query queryCheck = em.createNativeQuery(sqlCheckDuplicate);
                queryCheck.setParameter("code", codeToCheck);
                queryCheck.setParameter("realm", realm);

                Number count = (Number) queryCheck.getSingleResult();
                if (count.intValue() > 0) {
                    throw new RuntimeException("Mã lịch phát '" + codeToCheck + "' đã tồn tại! Vui lòng chọn mã khác.");
                }

                // ------------------------------------------------------------------
                // 3. CHUẨN BỊ DỮ LIỆU & LOGIC NGÀY THÁNG
                // ------------------------------------------------------------------
                Timestamp now = new Timestamp(System.currentTimeMillis());
                String createdBy = "system";

                int activeVal = (request.getActive() != null && request.getActive()) ? 1 : 0;

                ScheduleInfo infoParams = new ScheduleInfo();
                infoParams.setSchType(request.getSchType());
                infoParams.setSchFromDate(request.getSchFromDate());
                infoParams.setSchToDate(request.getSchToDate());
                infoParams.setSchRepeatOccu(request.getSchRepeatOccu());

                // Validate logic ngày tháng/loại lịch
                validateScheduleType(infoParams);

                // ------------------------------------------------------------------
                // 4. INSERT SCHEDULE_INFO
                // ------------------------------------------------------------------
                StringBuilder sqlInfo = new StringBuilder();
                sqlInfo.append("INSERT INTO openremote.schedule_info (")
                        .append("  schedule_code, schedule_name, realm, active, ")
                        .append("  sch_type, sch_from_date, sch_to_date, sch_repeat_occu, ")
                        .append("  priority, description, news_category_id, bit_rate, ")
                        .append("  create_date, create_by, update_date, update_by, ")
                        .append("  deleted, approval_status, status_approved ")
                        .append(") VALUES (")
                        .append("  :code, :name, :realm, :active, ")
                        .append("  :type, :fromDate, :toDate, :repeat, ")
                        .append("  :priority, :desc, :catId, :bitRate, ")
                        .append("  :createDate, :createBy, :updateDate, :updateBy, ")
                        .append("  0, 'PENDING', 0 ")
                        .append(") RETURNING id");

                Query queryInfo = em.createNativeQuery(sqlInfo.toString());

                queryInfo.setParameter("code", codeToCheck); // Dùng biến đã trim()
                queryInfo.setParameter("name", request.getScheduleName().trim());
                queryInfo.setParameter("realm", realm);
                queryInfo.setParameter("active", activeVal);

                queryInfo.setParameter("type", infoParams.getSchType());
                queryInfo.setParameter("fromDate", infoParams.getSchFromDate());
                queryInfo.setParameter("toDate", infoParams.getSchToDate());
                queryInfo.setParameter("repeat", infoParams.getSchRepeatOccu());

                queryInfo.setParameter("priority", request.getPriority());
                queryInfo.setParameter("desc", request.getDescription());
                queryInfo.setParameter("catId", request.getNewsCategoryId());
                queryInfo.setParameter("bitRate", request.getBitRate());

                queryInfo.setParameter("createDate", now);
                queryInfo.setParameter("createBy", user.getUsername());
                queryInfo.setParameter("updateDate", now);
                queryInfo.setParameter("updateBy", user.getUsername());

                Integer scheduleIdInt = (Integer) queryInfo.getSingleResult();
                String scheduleIdStr = String.valueOf(scheduleIdInt);

                // ------------------------------------------------------------------
                // 5. INSERT SCHEDULE_ASSET (Logic cũ - Giữ nguyên)
                // ------------------------------------------------------------------
                if (request.getAssetIds() != null && !request.getAssetIds().isEmpty()) {
                    String sqlAsset = "INSERT INTO openremote.schedule_asset " +
                            "(id, schedule_id, asset_id, realm_name, status, created_at, created_by, is_deleted) " +
                            "VALUES (:id, :schId, :assetId, :realm, 1, :createdAt, :createdBy, false)";

                    for (String assetId : request.getAssetIds()) {
                        if (assetId == null || assetId.isEmpty()) continue;

                        em.createNativeQuery(sqlAsset)
                                .setParameter("id", UUID.randomUUID().toString())
                                .setParameter("schId", scheduleIdStr)
                                .setParameter("assetId", assetId)
                                .setParameter("realm", realm)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();
                    }
                }

                // ------------------------------------------------------------------
                // 6. INSERT CONTENT (Logic cũ - Giữ nguyên)
                // ------------------------------------------------------------------
                if (request.getContents() != null && !request.getContents().isEmpty()) {
                    ObjectMapper mapper = new ObjectMapper();

                    String sqlContent = "INSERT INTO openremote.schedule_content (" +
                            "  id, schedule_id, \"number\", duration, order_by, time_period, " +
                            "  created_at, created_by, is_deleted " +
                            ") VALUES (" +
                            "  :id, :schId, :number, CAST(:duration AS interval), :orderBy, CAST(:timePeriod AS jsonb), " +
                            "  :createdAt, :createdBy, false " +
                            ")";

                    String sqlContentType = "INSERT INTO openremote.schedule_content_type (" +
                            "  id, \"type\", schedule_content_id, entity_id, entity_name, " +
                            "  realm_name, created_at, created_by, is_deleted " +
                            ") VALUES (" +
                            "  :id, :type, :contentId, :entityId, :entityName, " +
                            "  :realm, :createdAt, :createdBy, false " +
                            ")";

                    for (ScheduleContentRequestDTO contentDto : request.getContents()) {
                        String contentTimePeriodJson = null;
                        if (contentDto.getTime_period() != null && !contentDto.getTime_period().isEmpty()) {
                            contentTimePeriodJson = mapper.writeValueAsString(contentDto.getTime_period());
                        }

                        String contentId = UUID.randomUUID().toString();

                        em.createNativeQuery(sqlContent)
                                .setParameter("id", contentId)
                                .setParameter("schId", scheduleIdStr)
                                .setParameter("number", contentDto.getNumber())
                                .setParameter("duration", "00:00:00")
                                .setParameter("orderBy", contentDto.getOrderBy())
                                .setParameter("timePeriod", contentTimePeriodJson)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();

                        em.createNativeQuery(sqlContentType)
                                .setParameter("id", UUID.randomUUID().toString())
                                .setParameter("type", contentDto.getContentType())
                                .setParameter("contentId", contentId)
                                .setParameter("entityId", contentDto.getEntityId())
                                .setParameter("entityName", contentDto.getEntityName())
                                .setParameter("realm", realm)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();
                    }
                }

                return scheduleIdInt;

            } catch (Exception e) {
                e.printStackTrace();
                // Ném lỗi RuntimeException để transaction rollback và FE nhận được message
                throw new RuntimeException(e.getMessage());
            }
        });
    }

    public ScheduleCompositeDetailDTO getScheduleCompositeById(Integer id) {
        return persistenceService.doReturningTransaction(em -> {
            try {
                ObjectMapper mapper = new ObjectMapper(); // Dùng để parse JSON
                String scheduleIdStr = String.valueOf(id);
                // BƯỚC 1: LẤY THÔNG TIN CHUNG (SCHEDULE_INFO)
                // =========================================================================
                String sqlInfo = "SELECT " +
                        "  id, schedule_code, schedule_name, " +                      // 0, 1, 2
                        "  sch_type, sch_from_date, sch_to_date, sch_repeat_occu, " + // 3, 4, 5, 6
                        "  priority, news_category_id, bit_rate, description, active, " + // 7, 8, 9, 10, 11
                        "  approval_status, create_date, create_by, update_date, update_by " + // 12, 13, 14, 15, 16
                        "FROM openremote.schedule_info " +
                        "WHERE id = :id AND deleted = 0";

                Query queryInfo = em.createNativeQuery(sqlInfo);
                queryInfo.setParameter("id", id);

                Object[] row;
                try {
                    row = (Object[]) queryInfo.getSingleResult();
                } catch (NoResultException e) {
                    return null; // Không tìm thấy bản ghi hoặc đã bị xóa
                }

                // --- Mapping dữ liệu Info vào DTO ---
                ScheduleCompositeDetailDTO dto = new ScheduleCompositeDetailDTO();

                dto.setId((Integer) row[0]);
                dto.setScheduleCode((String) row[1]);
                dto.setScheduleName((String) row[2]);
                dto.setSchType((String) row[3]);

                // Convert java.sql.Timestamp -> java.time.LocalDateTime
                java.sql.Timestamp tFrom = (java.sql.Timestamp) row[4];
                java.sql.Timestamp tTo = (java.sql.Timestamp) row[5];
                dto.setSchFromDate(tFrom != null ? tFrom.toLocalDateTime() : null);
                dto.setSchToDate(tTo != null ? tTo.toLocalDateTime() : null);

                dto.setSchRepeatOccu((String) row[6]);
                dto.setPriority((String) row[7]);
                dto.setNewsCategoryId((String) row[8]);
                dto.setBitRate(row[9] != null ? ((Number) row[9]).intValue() : null);
                dto.setDescription((String) row[10]);
                dto.setActive(row[11] != null && ((Number) row[11]).intValue() == 1); // 1 = true

                dto.setApprovalStatus((String) row[12]);

                // Audit info
                java.sql.Timestamp tCreate = (java.sql.Timestamp) row[13];
                dto.setCreateDate(tCreate != null ? tCreate.toLocalDateTime() : null);
                dto.setCreateBy((String) row[14]);

                java.sql.Timestamp tUpdate = (java.sql.Timestamp) row[15];
                dto.setUpdateDate(tUpdate != null ? tUpdate.toLocalDateTime() : null);
                dto.setUpdateBy((String) row[16]);
                // BƯỚC 2: LẤY DANH SÁCH THIẾT BỊ + TÊN + KHU VỰC
                // =========================================================================
                // Logic: Join schedule_asset -> asset_info -> area
                String sqlAsset = "SELECT " +
                        "  sa.asset_id, " +                       // 0: ID thiết bị
                        "  ai.name AS asset_name, " +             // 1: Tên thiết bị (từ asset_info)
                        "  ar.name AS area_name " +               // 2: Tên khu vực (từ area)
                        "FROM openremote.schedule_asset sa " +
                        "LEFT JOIN openremote.asset_info ai ON sa.asset_id = ai.id " +
                        "LEFT JOIN openremote.area ar ON ai.area_id = ar.id " +
                        "WHERE sa.schedule_id = :schId AND sa.is_deleted = false";

                List<Object[]> assetRows = em.createNativeQuery(sqlAsset)
                        .setParameter("schId", scheduleIdStr)
                        .getResultList();

                List<AssetDetailInScheduleDTO> assetList = new ArrayList<>();
                for (Object[] aRow : assetRows) {
                    String aId = (String) aRow[0];
                    String aName = (String) aRow[1];
                    String aArea = (String) aRow[2];

                    // Xử lý hiển thị mặc định nếu dữ liệu null
                    if (aName == null) aName = "Thiết bị không xác định";
                    if (aArea == null) aArea = "";

                    assetList.add(new AssetDetailInScheduleDTO(aId, aName, aArea));
                }
                dto.setAssets(assetList);
                // BƯỚC 3: LẤY NỘI DUNG (CONTENT) VÀ PARSE JSON TIME_PERIOD
                String sqlContent = "SELECT " +
                        "  c.number, c.order_by, c.time_period, " +      // 0, 1, 2
                        "  t.type, t.entity_id, t.entity_name " +        // 3, 4, 5
                        "FROM openremote.schedule_content c " +
                        "LEFT JOIN openremote.schedule_content_type t ON c.id = t.schedule_content_id " +
                        "WHERE c.schedule_id = :schId AND c.is_deleted = false " +
                        "ORDER BY c.order_by ASC";

                List<Object[]> contentRows = em.createNativeQuery(sqlContent)
                        .setParameter("schId", scheduleIdStr)
                        .getResultList();

                List<ScheduleContentRequestDTO> contents = new ArrayList<>();
                for (Object[] cRow : contentRows) {
                    // Parse cột time_period (JSON String -> List Object)
                    String jsonTime = (String) cRow[2];
                    List<ScheduleTimeFrameDTO> timeFrames = new ArrayList<>();
                    if (jsonTime != null && !jsonTime.isEmpty()) {
                        try {
                            timeFrames = mapper.readValue(jsonTime, new TypeReference<List<ScheduleTimeFrameDTO>>() {
                            });
                        } catch (Exception e) {
                            // Log lỗi parse JSON nếu cần thiết, không throw để vẫn trả về data khác
                            System.err.println("Lỗi parse time_period: " + e.getMessage());
                        }
                    }
                    ScheduleContentRequestDTO contentDto = new ScheduleContentRequestDTO(
                            cRow[1] != null ? ((Number) cRow[1]).intValue() : 0, // orderBy
                            cRow[0] != null ? ((Number) cRow[0]).intValue() : 0, // number
                            (String) cRow[3], // contentType
                            (String) cRow[4], // entityId
                            (String) cRow[5]  // entityName
                    );

                    // Set danh sách khung giờ đã parse
                    contentDto.setTime_period(timeFrames);

                    contents.add(contentDto);
                }
                dto.setContents(contents);

                return dto;
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Lỗi khi lấy chi tiết lịch phát: " + e.getMessage());
            }
        });
    }

    public List<CalendarDayDTO> getCalendarMonthSchedules(CalendarMonthSchedulesRequest request) {

        Timestamp viewStart = parseTimestamp(request != null ? request.getViewStart() : null);
        Timestamp viewEnd   = parseTimestamp(request != null ? request.getViewEnd() : null);
        String approvalStatus = trimToNull(request != null ? request.getApprovalStatus() : null);

        // Optional filters
        String priority = trimToNull(request != null ? request.getPriority() : null);
        String entityName = trimToNull(request != null ? request.getEntityName() : null);

        // Dùng empty-string sentinel để tránh setParameter(null) gây lỗi type inference ở một số JPA provider
        String priorityParam = (priority == null) ? "" : priority;
        String entityNameParam = (entityName == null) ? "" : entityName;

        String playlistName = trimToNull(request != null ? request.getPlaylistName() : null);
        String liveChannelTitle = trimToNull(request != null ? request.getLiveChannelTitle() : null);

        String playlistNameParam = (playlistName == null) ? "" : playlistName;
        String liveChannelTitleParam = (liveChannelTitle == null) ? "" : liveChannelTitle;

        String contentType = trimToNull(request != null ? request.getContentType() : null);
        String contentTypeParam = (contentType == null) ? "" : contentType;

        if (viewStart == null || viewEnd == null || approvalStatus == null) {
            return Collections.emptyList();
        }

        return persistenceService.doReturningTransaction(em -> {

            StringBuilder sql = new StringBuilder();
            sql.append("WITH days AS ( \n")
                    .append("  SELECT CAST(gs AS date) AS day \n")
                    .append("  FROM generate_series( \n")
                    .append("    CAST(:viewStart AS date), \n")
                    .append("    CAST(:viewEnd   AS date) - 1, \n")
                    .append("    interval '1 day' \n")
                    .append("  ) AS gs \n")
                    .append("), \n")

                    // base_raw: giữ nguyên logic join, thêm filter priority
                    .append("base_raw AS ( \n")
                    .append("  SELECT \n")
                    .append("    d.day, \n")
                    .append("    s.id             AS schedule_id, \n")
                    .append("    s.schedule_code  AS schedule_code, \n")
                    .append("    s.schedule_name  AS schedule_name, \n")
                    .append("    s.priority       AS schedule_priority, \n")
                    .append("    s.sch_from_date  AS sch_from_date, \n")
                    .append("    s.sch_to_date    AS sch_to_date, \n")
                    .append("    sc.id            AS schedule_content_id, \n")
                    .append("    sc.order_by      AS content_order_by, \n")
                    .append("    sc.number        AS content_number, \n")
                    .append("    sc.duration      AS content_duration, \n")
                    .append("    sc.time_period   AS content_time_period, \n")
                    .append("    upper(regexp_replace(coalesce(sct.type, ''), '[^A-Za-z0-9]', '', 'g')) AS norm_type, \n")
                    .append("    sct.entity_id    AS entity_id, \n")
                    .append("    sct.entity_name  AS entity_name_raw, \n")
                    .append("    p2.name          AS playlist_name, \n")
                    .append("    lsc.title        AS live_channel_title, \n")
                    .append("    lsc.url          AS live_channel_url \n")
                    .append("  FROM days d \n")
                    .append("  JOIN schedule_info s \n")
                    .append("    ON s.approval_status = :approvalStatus \n")
                    .append("   AND coalesce(s.deleted, 0) = 0 \n")
                    .append("   AND coalesce(s.active, 1) = 1 \n")
                    .append("   AND CAST(s.sch_from_date AS date) <= d.day \n")
                    .append("   AND CAST(s.sch_to_date   AS date) >= d.day \n")
                    .append("   AND (:priority = '' OR s.priority = :priority) \n")
                    .append("  LEFT JOIN schedule_content sc \n")
                    .append("    ON CAST(sc.schedule_id AS text) = CAST(s.id AS text) \n")
                    .append("  LEFT JOIN schedule_content_type sct \n")
                    .append("    ON CAST(sct.schedule_content_id AS text) = CAST(sc.id AS text) \n")
                    .append("  LEFT JOIN playlist p2 \n")
                    .append("    ON p2.is_deleted = false \n")
                    .append("   AND upper(regexp_replace(coalesce(sct.type, ''), '[^A-Za-z0-9]', '', 'g')) = 'PLAYLIST' \n")
                    .append("   AND CAST(p2.id AS text) = CAST(sct.entity_id AS text) \n")
                    .append("  LEFT JOIN live_stream_channel lsc \n")
                    .append("    ON lsc.is_deleted = false \n")
                    .append("   AND upper(regexp_replace(coalesce(sct.type, ''), '[^A-Za-z0-9]', '', 'g')) \n")
                    .append("       IN ('LIVESTREAMCHANNEL','LIVESTREAM','LIVESTREAMCH') \n")
                    .append("   AND CAST(lsc.id AS text) = CAST(sct.entity_id AS text) \n")
                    .append("), \n")

                    // base: tính entity_name_effective để vừa build JSON vừa filter entityName
                    .append("base AS ( \n")
                    .append("  SELECT \n")
                    .append("    br.*, \n")
                    .append("    CASE \n")
                    .append("      WHEN br.norm_type = 'PLAYLIST' THEN br.playlist_name \n")
                    .append("      WHEN br.norm_type IN ('LIVESTREAMCHANNEL','LIVESTREAM','LIVESTREAMCH') THEN br.live_channel_title \n")
                    .append("      ELSE br.entity_name_raw \n")
                    .append("    END AS entity_name_effective \n")
                    .append("  FROM base_raw br \n")
                    .append("), \n")

                    .append("base_f AS ( \n")
                    .append("  SELECT \n")
                    .append("    b.*, \n")
                    .append("    ( \n")
                    .append("      (:entityName = '' OR COALESCE(b.entity_name_effective, '') ILIKE ('%' || :entityName || '%')) \n")
                    .append("      AND ( \n")
                    .append("        :contentType = '' \n")
                    .append("        OR ( \n")
                    .append("          :contentType = 'LIVESTREAMCHANNEL' \n")
                    .append("          AND b.norm_type IN ('LIVESTREAMCHANNEL','LIVESTREAM','LIVESTREAMCH') \n")
                    .append("        ) \n")
                    .append("        OR b.norm_type = :contentType \n")
                    .append("      ) \n")
                    .append("      AND ( \n")
                    .append("        :playlistName = '' \n")
                    .append("        OR (b.norm_type = 'PLAYLIST' AND COALESCE(b.playlist_name, '') ILIKE ('%' || :playlistName || '%')) \n")
                    .append("      ) \n")
                    .append("      AND ( \n")
                    .append("        :liveChannelTitle = '' \n")
                    .append("        OR ( \n")
                    .append("          b.norm_type IN ('LIVESTREAMCHANNEL','LIVESTREAM','LIVESTREAMCH') \n")
                    .append("          AND COALESCE(b.live_channel_title, '') ILIKE ('%' || :liveChannelTitle || '%') \n")
                    .append("        ) \n")
                    .append("      ) \n")
                    .append("    ) AS matches_filter \n")
                    .append("  FROM base b \n")
                    .append("), \n")

                    // schedule_meta: thêm has_match để lọc schedule theo entityName
                    .append("schedule_meta AS ( \n")
                    .append("  SELECT \n")
                    .append("    day, schedule_id, \n")
                    .append("    max(schedule_code)     AS schedule_code, \n")
                    .append("    max(schedule_name)     AS schedule_name, \n")
                    .append("    max(schedule_priority) AS schedule_priority, \n")
                    .append("    min(sch_from_date)     AS sch_from_date, \n")
                    .append("    max(sch_to_date)       AS sch_to_date, \n")
                    .append("    COALESCE( \n")
                    .append("      bool_or(matches_filter) FILTER (WHERE schedule_content_id IS NOT NULL AND entity_id IS NOT NULL), \n")
                    .append("      false \n")
                    .append("    ) AS has_match \n")
                    .append("  FROM base_f \n")
                    .append("  GROUP BY day, schedule_id \n")
                    .append("), \n")

                    // content_agg: chỉ aggregate contents match entityName (nếu có truyền entityName)
                    .append("content_agg AS ( \n")
                    .append("  SELECT \n")
                    .append("    day, schedule_id, \n")
                    .append("    jsonb_agg( \n")
                    .append("      jsonb_build_object( \n")
                    .append("        'orderBy',    content_order_by, \n")
                    .append("        'number',     content_number, \n")
                    .append("        'duration',   content_duration, \n")
                    .append("        'timePeriod', CASE \n")
                    .append("                        WHEN content_time_period IS NULL THEN CAST('[]' AS jsonb) \n")
                    .append("                        WHEN jsonb_typeof(content_time_period) = 'array' THEN content_time_period \n")
                    .append("                        ELSE jsonb_build_array(content_time_period) \n")
                    .append("                      END, \n")
                    .append("        'contentType', norm_type, \n")
                    .append("        'entityId',    entity_id, \n")
                    .append("        'entityName',  entity_name_effective, \n")
                    .append("        'liveUrl',     live_channel_url \n")
                    .append("      ) \n")
                    .append("      ORDER BY content_order_by NULLS LAST \n")
                    .append("    ) FILTER ( \n")
                    .append("      WHERE schedule_content_id IS NOT NULL \n")
                    .append("        AND entity_id IS NOT NULL \n")
                    .append("        AND matches_filter = true \n")
                    .append("    ) AS contents \n")
                    .append("  FROM base_f \n")
                    .append("  GROUP BY day, schedule_id \n")
                    .append("), \n")

                    // schedule_agg: lọc schedule theo entityName bằng has_match
                    .append("schedule_agg AS ( \n")
                    .append("  SELECT \n")
                    .append("    m.day, \n")
                    .append("    jsonb_build_object( \n")
                    .append("      'scheduleId',    m.schedule_id, \n")
                    .append("      'code',          m.schedule_code, \n")
                    .append("      'name',          m.schedule_name, \n")
                    .append("      'priority',      m.schedule_priority, \n")
                    .append("      'sch_from_date', m.sch_from_date, \n")
                    .append("      'sch_to_date',   m.sch_to_date, \n")
                    .append("      'contents',      COALESCE(c.contents, CAST('[]' AS jsonb)) \n")
                    .append("    ) AS schedule_json \n")
                    .append("  FROM schedule_meta m \n")
                    .append("  LEFT JOIN content_agg c \n")
                    .append("    ON c.day = m.day AND c.schedule_id = m.schedule_id \n")
                    .append("  WHERE ( \n")
                    .append("    (:entityName = '' AND :playlistName = '' AND :liveChannelTitle = '' AND :contentType = '') \n")
                    .append("    OR m.has_match = true \n")
                    .append("  ) \n")
                    .append(") \n")
                    .append(", \n")

                    // day_agg: sort priority an toàn (priority varchar)
                    .append("day_agg AS ( \n")
                    .append("  SELECT \n")
                    .append("    day, \n")
                    .append("    count(*) AS schedule_count, \n")
                    .append("    jsonb_agg( \n")
                    .append("      schedule_json \n")
                    .append("      ORDER BY \n")
                    .append("        CASE \n")
                    .append("          WHEN (schedule_json->>'priority') ~ '^[0-9]+$' THEN CAST(schedule_json->>'priority' AS integer) \n")
                    .append("          ELSE NULL \n")
                    .append("        END DESC NULLS LAST, \n")
                    .append("        (schedule_json->>'priority') DESC NULLS LAST \n")
                    .append("    ) AS schedules \n")
                    .append("  FROM schedule_agg \n")
                    .append("  GROUP BY day \n")
                    .append(") \n")

                    .append("SELECT \n")
                    .append("  d.day, \n")
                    .append("  COALESCE(a.schedule_count, 0) AS schedule_count, \n")
                    .append("  COALESCE(a.schedules, CAST('[]' AS jsonb)) AS schedules \n")
                    .append("FROM days d \n")
                    .append("LEFT JOIN day_agg a ON a.day = d.day \n")
                    .append("ORDER BY d.day \n");

            Query query = em.createNativeQuery(sql.toString());
            query.setParameter("viewStart", viewStart, TemporalType.TIMESTAMP);
            query.setParameter("viewEnd", viewEnd, TemporalType.TIMESTAMP);
            query.setParameter("approvalStatus", approvalStatus);

            // new params
            query.setParameter("priority", priorityParam);
            query.setParameter("entityName", entityNameParam);

            query.setParameter("playlistName", playlistNameParam);
            query.setParameter("liveChannelTitle", liveChannelTitleParam);

            query.setParameter("contentType", contentTypeParam);

            @SuppressWarnings("unchecked")
            List<Object[]> rows = query.getResultList();

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            List<CalendarDayDTO> result = new ArrayList<>(rows.size());

            for (Object[] r : rows) {
                LocalDate day = ((java.sql.Date) r[0]).toLocalDate();
                int scheduleCount = (r[1] == null) ? 0 : ((Number) r[1]).intValue();

                Object schedulesObj = r[2];
                String schedulesJson;
                if (schedulesObj == null) {
                    schedulesJson = "[]";
                } else if (schedulesObj instanceof PGobject) {
                    schedulesJson = ((PGobject) schedulesObj).getValue();
                } else {
                    schedulesJson = schedulesObj.toString();
                }

                List<ScheduleDTO> schedules;
                try {
                    schedules = mapper.readValue(schedulesJson, new TypeReference<List<ScheduleDTO>>() {});
                } catch (Exception ex) {
                    schedules = Collections.emptyList();
                }


                result.add(new CalendarDayDTO(day, scheduleCount, schedules));
            }

            return result;
        });
    }

    private static Timestamp parseTimestamp(String input) {
        if (input == null || input.trim().isEmpty()) return null;

        String v = input.trim();
        // chấp nhận "2025-12-01T00:00:00" -> "2025-12-01 00:00:00"
        v = v.replace('T', ' ');
        return Timestamp.valueOf(v);
    }

    public Boolean updateScheduleComposite(UpdateScheduleRequest request,User user) {
        persistenceService.doReturningTransaction(em -> {
            try {
                Timestamp now = new Timestamp(System.currentTimeMillis());
                String updatedBy = "system"; // Hoặc lấy từ request user

                // Lấy ID từ request (Giả sử request có trường Id)
                Integer scheduleIdInt = request.getId();
                if (scheduleIdInt == null) {
                    throw new RuntimeException("ID lịch không được để trống khi cập nhật.");
                }
                String scheduleIdStr = String.valueOf(scheduleIdInt);

                // Xử lý active
                int activeVal = (request.getActive() != null && request.getActive()) ? 1 : 0;

                // ------------------------------------------------------------------
                // BƯỚC 1: CHUẨN BỊ DỮ LIỆU & VALIDATE (Giống hệt Create)
                // ------------------------------------------------------------------
                ScheduleInfo infoParams = new ScheduleInfo();
                infoParams.setSchType(request.getSchType());
                infoParams.setSchFromDate(request.getSchFromDate());
                infoParams.setSchToDate(request.getSchToDate());
                infoParams.setSchRepeatOccu(request.getSchRepeatOccu());

                // Validate logic nghiệp vụ (Always, Anocc, Reocc)
                validateScheduleType(infoParams);

                // ------------------------------------------------------------------
                // BƯỚC 2: UPDATE SCHEDULE_INFO
                // ------------------------------------------------------------------
                StringBuilder sqlUpdateInfo = new StringBuilder();
                sqlUpdateInfo.append("UPDATE openremote.schedule_info SET ")
                        .append("  schedule_code = :code, ")
                        .append("  schedule_name = :name, ")
                        .append("  active = :active, ")
                        .append("  sch_type = :type, ")
                        .append("  sch_from_date = :fromDate, ")
                        .append("  sch_to_date = :toDate, ")
                        .append("  sch_repeat_occu = :repeat, ")
                        .append("  priority = :priority, ")
                        .append("  description = :desc, ")
                        .append("  news_category_id = :catId, ")
                        .append("  bit_rate = :bitRate, ")
                        .append("  update_date = :updateDate, ")
                        .append("  update_by = :updateBy ")
                        // Reset trạng thái duyệt nếu cần thiết khi update
                        .append("  , approval_status = 'PENDING', status_approved = 0 ")
                        .append("WHERE id = :id");

                Query queryInfo = em.createNativeQuery(sqlUpdateInfo.toString());

                queryInfo.setParameter("id", scheduleIdInt);
                queryInfo.setParameter("code", request.getScheduleCode());
                queryInfo.setParameter("name", request.getScheduleName());
                queryInfo.setParameter("active", activeVal);

                // Dùng dữ liệu đã qua hàm validate
                queryInfo.setParameter("type", infoParams.getSchType());
                queryInfo.setParameter("fromDate", infoParams.getSchFromDate());
                queryInfo.setParameter("toDate", infoParams.getSchToDate());
                queryInfo.setParameter("repeat", infoParams.getSchRepeatOccu());

                queryInfo.setParameter("priority", request.getPriority());
                queryInfo.setParameter("desc", request.getDescription());
                queryInfo.setParameter("catId", request.getNewsCategoryId());
                queryInfo.setParameter("bitRate", request.getBitRate());

                queryInfo.setParameter("updateDate", now);
                queryInfo.setParameter("updateBy", user.getUsername());

                int rowsUpdated = queryInfo.executeUpdate();
                if (rowsUpdated == 0) {
                    throw new RuntimeException("Không tìm thấy bản ghi lịch với ID: " + scheduleIdInt);
                }

                // ------------------------------------------------------------------
                // BƯỚC 3: XỬ LÝ ASSET (Xóa cũ -> Thêm mới)
                // ------------------------------------------------------------------
                // 3.1 Xóa Asset cũ (Hard delete hoặc Soft delete tùy quy định, ở đây dùng Hard delete để làm sạch quan hệ)
                String sqlDeleteAssets = "DELETE FROM openremote.schedule_asset WHERE schedule_id = :schId";
                em.createNativeQuery(sqlDeleteAssets).setParameter("schId", scheduleIdStr).executeUpdate();

                // 3.2 Insert Asset mới (Logic giống Create)
                if (request.getAssetIds() != null && !request.getAssetIds().isEmpty()) {
                    String sqlInsertAsset = "INSERT INTO openremote.schedule_asset " +
                            "(id, schedule_id, asset_id, realm_name, status, created_at, created_by, is_deleted) " +
                            "VALUES (:id, :schId, :assetId, :realm, 1, :createdAt, :createdBy, false)";

                    String realm = "master"; // Hoặc lấy từ DB nếu cần giữ nguyên realm cũ

                    for (String assetId : request.getAssetIds()) {
                        if (assetId == null || assetId.isEmpty()) continue;

                        em.createNativeQuery(sqlInsertAsset)
                                .setParameter("id", UUID.randomUUID().toString())
                                .setParameter("schId", scheduleIdStr)
                                .setParameter("assetId", assetId)
                                .setParameter("realm", realm)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();
                    }
                }

                // ------------------------------------------------------------------
                // BƯỚC 4: XỬ LÝ CONTENT (Xóa cũ -> Thêm mới)
                // ------------------------------------------------------------------
                // 4.1 Xóa Content Type cũ (Phải xóa bảng con trước vì khóa ngoại)
                // Tìm các content_id thuộc schedule này để xóa type tương ứng
                String sqlDeleteContentType = "DELETE FROM openremote.schedule_content_type " +
                        "WHERE schedule_content_id IN (SELECT id FROM openremote.schedule_content WHERE schedule_id = :schId)";
                em.createNativeQuery(sqlDeleteContentType).setParameter("schId", scheduleIdStr).executeUpdate();

                // 4.2 Xóa Content cũ
                String sqlDeleteContent = "DELETE FROM openremote.schedule_content WHERE schedule_id = :schId";
                em.createNativeQuery(sqlDeleteContent).setParameter("schId", scheduleIdStr).executeUpdate();

                // 4.3 Insert Content mới (Logic giống Create)
                if (request.getContents() != null && !request.getContents().isEmpty()) {
                    ObjectMapper mapper = new ObjectMapper();
                    String realm = "master";

                    String sqlInsertContent = "INSERT INTO openremote.schedule_content (" +
                            "  id, schedule_id, \"number\", duration, order_by, time_period, " +
                            "  created_at, created_by, is_deleted " +
                            ") VALUES (" +
                            "  :id, :schId, :number, CAST(:duration AS interval), :orderBy, CAST(:timePeriod AS jsonb), " +
                            "  :createdAt, :createdBy, false " +
                            ")";

                    String sqlInsertContentType = "INSERT INTO openremote.schedule_content_type (" +
                            "  id, \"type\", schedule_content_id, entity_id, entity_name, " +
                            "  realm_name, created_at, created_by, is_deleted " +
                            ") VALUES (" +
                            "  :id, :type, :contentId, :entityId, :entityName, " +
                            "  :realm, :createdAt, :createdBy, false " +
                            ")";

                    for (ScheduleContentRequestDTO contentDto : request.getContents()) {
                        String contentTimePeriodJson = null;
                        if (contentDto.getTime_period() != null && !contentDto.getTime_period().isEmpty()) {
                            contentTimePeriodJson = mapper.writeValueAsString(contentDto.getTime_period());
                        }

                        String contentId = UUID.randomUUID().toString();

                        // Insert Content
                        em.createNativeQuery(sqlInsertContent)
                                .setParameter("id", contentId)
                                .setParameter("schId", scheduleIdStr)
                                .setParameter("number", contentDto.getNumber())
                                .setParameter("duration", "00:00:00") // Hoặc tính lại duration nếu cần
                                .setParameter("orderBy", contentDto.getOrderBy())
                                .setParameter("timePeriod", contentTimePeriodJson)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();

                        // Insert Content Type
                        em.createNativeQuery(sqlInsertContentType)
                                .setParameter("id", UUID.randomUUID().toString())
                                .setParameter("type", contentDto.getContentType())
                                .setParameter("contentId", contentId)
                                .setParameter("entityId", contentDto.getEntityId())
                                .setParameter("entityName", contentDto.getEntityName())
                                .setParameter("realm", realm)
                                .setParameter("createdAt", now)
                                .setParameter("createdBy", user.getUsername())
                                .executeUpdate();
                    }
                }

                return true; // Hoặc trả về ID

            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Lỗi khi cập nhật lịch phát: " + e.getMessage(), e);
            }
        });
        return true;
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}


