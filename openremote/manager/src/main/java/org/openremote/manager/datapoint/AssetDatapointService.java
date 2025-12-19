package org.openremote.manager.datapoint;

import jakarta.persistence.NoResultException;
import org.openremote.agent.protocol.ProtocolDatapointService;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.timer.TimerService;
import org.openremote.container.util.UniqueIdentifierGenerator;
import org.openremote.manager.asset.AssetProcessingException;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.event.ClientEventService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.manager.utils.validationUtils;
import org.openremote.manager.web.ManagerWebService;
import org.openremote.model.Container;
import org.openremote.model.asset.Asset;
import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeEvent;
import org.openremote.model.attribute.AttributeRef;
import org.openremote.model.attribute.AttributeWriteFailure;
import org.openremote.model.datapoint.AssetDatapoint;
import org.openremote.model.dto.*;
import org.openremote.model.hdi.hdiDTO.HdiCmdData;
import org.openremote.model.query.AssetQuery;
import org.openremote.model.query.filter.AttributePredicate;
import org.openremote.model.query.filter.NameValuePredicate;
import org.openremote.model.util.Pair;
import org.openremote.model.value.MetaHolder;
import org.openremote.model.value.MetaItemType;
import org.openremote.model.ward.Ward;


import java.math.RoundingMode;
import java.util.Date;
import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Timestamp;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static java.time.temporal.ChronoUnit.DAYS;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static org.openremote.container.util.MapAccess.getInteger;
import static org.openremote.manager.asset.AssetProcessingService.*;
import static org.openremote.model.value.MetaItemType.STORE_DATA_POINTS;

/**
 * Store and retrieve datapoints for asset attributes and periodically purge data points based on
 * {@link MetaItemType#DATA_POINTS_MAX_AGE_DAYS} {@link org.openremote.model.attribute.MetaItem}
 * and {@link #OR_DATA_POINTS_MAX_AGE_DAYS} setting; storage duration defaults to {@value #OR_DATA_POINTS_MAX_AGE_DAYS_DEFAULT}
 * days.
 */
public class AssetDatapointService extends AbstractDatapointService<AssetDatapoint> implements ProtocolDatapointService {

    public static final String OR_DATA_POINTS_MAX_AGE_DAYS = "OR_DATA_POINTS_MAX_AGE_DAYS";
    public static final int OR_DATA_POINTS_MAX_AGE_DAYS_DEFAULT = 500;
    private static final Logger LOG = Logger.getLogger(AssetDatapointService.class.getName());
    protected static final String EXPORT_STORAGE_DIR_NAME = "datapoint";
    protected int maxDatapointAgeDays;
    protected Path exportPath;

    protected AssetStorageService assetStorageService;
    protected PersistenceService persistenceService;


    public AssetDatapointService(AssetStorageService assetStorageService) {
        this.assetStorageService = assetStorageService;
    }

    public AssetDatapointService() {
    }


    @Override
    public void init(Container container) throws Exception {
        super.init(container);

        container.getService(ManagerWebService.class).addApiSingleton(
                new AssetDatapointResourceImpl(
                        container.getService(TimerService.class),
                        container.getService(ManagerIdentityService.class),
                        container.getService(AssetStorageService.class),
                        this
                )
        );
        persistenceService = container.getService(PersistenceService.class);
        assetStorageService = container.getService(AssetStorageService.class);

        maxDatapointAgeDays = getInteger(container.getConfig(), OR_DATA_POINTS_MAX_AGE_DAYS, OR_DATA_POINTS_MAX_AGE_DAYS_DEFAULT);

        if (maxDatapointAgeDays <= 0) {
            LOG.warning(OR_DATA_POINTS_MAX_AGE_DAYS + " value is not a valid value so data points won't be auto purged");
        } else {
            LOG.log(Level.INFO, "Data point purge interval days = " + maxDatapointAgeDays);
        }

        Path storageDir = persistenceService.getStorageDir();
        exportPath = storageDir.resolve(EXPORT_STORAGE_DIR_NAME);
        // Ensure export dir exists and is writable
        Files.createDirectories(exportPath);
        if (!exportPath.toFile().setWritable(true, false)) {
            LOG.log(Level.WARNING, "Failed to set export dir write flag; data export may not work");
        }
    }

    @Override
    public void start(Container container) throws Exception {
        if (maxDatapointAgeDays > 0) {
            dataPointsPurgeScheduledFuture = executorService.scheduleAtFixedRate(
                    this::purgeDataPoints,
                    getFirstPurgeMillis(timerService.getNow()),
                    Duration.ofDays(1).toMillis(), TimeUnit.MILLISECONDS
            );
        }

        ClientEventService clientEventService = container.getService(ClientEventService.class);
        clientEventService.addInternalSubscription(AttributeEvent.class, null, this::onAttributeEvent);
    }
    protected final static String[] publicAttri = {BRIGHTNESS,power_sts_1,power_sts_2,power_sts_3, STATUS };

    protected boolean isPublicAttri(String assetType) {
        return Arrays.stream(publicAttri)
                .anyMatch(assetType::matches);
    }


    public static boolean attributeIsStoreDatapoint(MetaHolder attributeInfo) {
        return attributeInfo.getMetaValue(STORE_DATA_POINTS).orElse(attributeInfo.hasMeta(MetaItemType.AGENT_LINK));
    }

    public void onAttributeEvent(AttributeEvent attributeEvent) {
        if (attributeIsStoreDatapoint(attributeEvent) && attributeEvent.getValue().isPresent() && !(attributeEvent.getValue().get() instanceof HdiCmdData) && !(isPublicAttri(attributeEvent.getRef().getName()) && !attributeEvent.isSend())) { // Don't store datapoints with null value
            try {
                upsertValue(attributeEvent.getId(), attributeEvent.getName(), attributeEvent.getValue().orElse(null), LocalDateTime.ofInstant(Instant.ofEpochMilli(attributeEvent.getTimestamp()), ZoneId.systemDefault()));
            } catch (Exception e) {
                throw new AssetProcessingException(AttributeWriteFailure.STATE_STORAGE_FAILED, "Failed to insert or update asset data point for attribute: " + attributeEvent, e);
            }
        }
    }

    @Override
    protected Class<AssetDatapoint> getDatapointClass() {
        return AssetDatapoint.class;
    }

    @Override
    protected String getDatapointTableName() {
        return AssetDatapoint.TABLE_NAME;
    }

    @Override
    protected Logger getLogger() {
        return LOG;
    }

    protected void purgeDataPoints() {
        LOG.info("Running data points purge daily task");

        try {
            // Get list of attributes that have custom durations
            List<Asset<?>> assets = assetStorageService.findAll(
                    new AssetQuery()
                            .attributes(
                                    new AttributePredicate().meta(
                                            new NameValuePredicate(MetaItemType.DATA_POINTS_MAX_AGE_DAYS, null)
                                    )));

            List<Pair<String, Attribute<?>>> attributes = assets.stream()
                    .map(asset -> asset
                            .getAttributes().stream()
                            .filter(assetAttribute -> assetAttribute.hasMeta(MetaItemType.DATA_POINTS_MAX_AGE_DAYS))
                            .map(assetAttribute -> new Pair<String, Attribute<?>>(asset.getId(), assetAttribute))
                            .collect(toList()))
                    .flatMap(List::stream)
                    .collect(toList());

            // Purge data points not in the above list using default duration
            LOG.fine("Purging data points of attributes that use default max age days of " + maxDatapointAgeDays);

            persistenceService.doTransaction(em -> em.createQuery(
                    "delete from AssetDatapoint dp " +
                            "where dp.timestamp < :dt" + buildWhereClause(attributes, true)
            ).setParameter("dt", Date.from(timerService.getNow().truncatedTo(DAYS).minus(maxDatapointAgeDays, DAYS))).executeUpdate());

            if (!attributes.isEmpty()) {
                // Purge data points that have specific age constraints
                Map<Integer, List<Pair<String, Attribute<?>>>> ageAttributeRefMap = attributes.stream()
                        .collect(groupingBy(attributeRef ->
                                attributeRef.value
                                        .getMetaValue(MetaItemType.DATA_POINTS_MAX_AGE_DAYS)
                                        .orElse(maxDatapointAgeDays)));

                ageAttributeRefMap.forEach((age, attrs) -> {
                    LOG.fine("Purging data points of " + attrs.size() + " attributes that use a max age of " + age);

                    try {
                        persistenceService.doTransaction(em -> em.createQuery(
                                "delete from AssetDatapoint dp " +
                                        "where dp.timestamp < :dt" + buildWhereClause(attrs, false)
                        ).setParameter("dt", Date.from(timerService.getNow().truncatedTo(DAYS).minus(age, DAYS))).executeUpdate());
                    } catch (Exception e) {
                        LOG.log(Level.SEVERE, "An error occurred whilst deleting data points, this should not happen", e);
                    }
                });
            }
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to run data points purge", e);
        }

        // Purge old exports
        try {
            long oneDayMillis = 24 * 60 * 60 * 1000;
            File[] obsoleteExports = exportPath.toFile()
                    .listFiles(file ->
                            file.isFile()
                                    && file.getName().endsWith("csv")
                                    && file.lastModified() < timerService.getCurrentTimeMillis() - oneDayMillis
                    );

            if (obsoleteExports != null) {
                Arrays.stream(obsoleteExports)
                        .forEach(file -> {
                            boolean success = false;
                            try {
                                success = file.delete();
                            } catch (SecurityException e) {
                                LOG.log(Level.WARNING, "Cannot access the export file to delete it", e);
                            }
                            if (!success) {
                                LOG.log(Level.WARNING, "Failed to delete obsolete export '" + file.getName() + "'");
                            }
                        });
            }
        } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to purge old exports", e);
        }
    }

    protected String buildWhereClause(List<Pair<String, Attribute<?>>> attributes, boolean negate) {

        if (attributes.isEmpty()) {
            return "";
        }

        String whereStr = attributes.stream()
                .map(attributeRef -> "('" + attributeRef.key + "','" + attributeRef.value.getName() + "')")
                .collect(Collectors.joining(","));

        return " and (dp.assetId, dp.attributeName) " + (negate ? "not " : "") + "in (" + whereStr + ")";
    }

    /**
     * Exports datapoints as CSV using SQL; the export path used in the SQL query must also be mapped into the manager
     * container so it can be accessed by this process.
     */
    public ScheduledFuture<File> exportDatapoints(AttributeRef[] attributeRefs,
                                                  long fromTimestamp,
                                                  long toTimestamp) {
        return executorService.schedule(() -> {
            String fileName = UniqueIdentifierGenerator.generateId() + ".csv";
            StringBuilder sb = new StringBuilder(String.format("copy (select ad.timestamp, a.name, ad.attribute_name, value from asset_datapoint ad, asset a where ad.entity_id = a.id and ad.timestamp >= to_timestamp(%d) and ad.timestamp <= to_timestamp(%d) and (", fromTimestamp / 1000, toTimestamp / 1000))
                    .append(Arrays.stream(attributeRefs).map(attributeRef -> String.format("(ad.entity_id = '%s' and ad.attribute_name = '%s')", attributeRef.getId(), attributeRef.getName())).collect(Collectors.joining(" or ")))
                    .append(")) to '/storage/")
                    .append(EXPORT_STORAGE_DIR_NAME)
                    .append("/")
                    .append(fileName)
                    .append("' delimiter ',' CSV HEADER;");

            persistenceService.doTransaction(em -> em.createNativeQuery(sb.toString()).executeUpdate());

            // The same path must resolve in both the postgresql container and the manager container
            return exportPath.resolve(fileName).toFile();
        }, 0, TimeUnit.MILLISECONDS);
    }

    public List<LightingReportDto> lightingReport(LocalDateTime startTime, LocalDateTime endTime, String roadId, String cabinetId, String realm) {
        List<LightingReportDto> lightingReportDtos = new ArrayList<>();
        List<Asset> cabinets = new ArrayList<>();

        String assetRoadId = (roadId == null || roadId.isEmpty()) ? null : roadId;
        String assetCabinetId = (cabinetId == null || cabinetId.isEmpty()) ? null : cabinetId;

        if (assetCabinetId == null) {
            cabinets = assetStorageService.getListCabinet(assetRoadId, realm);
        } else {
            Asset cabinet = assetStorageService.find(assetCabinetId);
            if (cabinet != null && realm.equalsIgnoreCase(cabinet.getRealm())) {
                cabinets.add(cabinet);
            }
        }

        for (Asset cabinet : cabinets) {
            List<Asset> assetLights = assetStorageService.getAllLightByCabinetId(cabinet.getId(), realm);
            List<LightDto> lightDtos = new ArrayList<>();

            for (Asset assetLight : assetLights) {
                LightDto lightReport = new LightDto();
                try {
                    List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                            em.createNativeQuery("SELECT * FROM reportLight(:startTime, :endTime, :assetId)")
                                    .setParameter("startTime", startTime)
                                    .setParameter("endTime", endTime)
                                    .setParameter("assetId", assetLight.getId())
                                    .getResultList());

                    Object[] data = results.isEmpty() ? null : results.get(0);

                    lightReport.setId(assetLight.getId());
                    lightReport.setLightName(assetLight.getName());
                    if (data != null) {
                        lightReport.setVoltage(data[1] != null ? (BigDecimal) data[1] : BigDecimal.ZERO);
                        lightReport.setWattageActual(data[2] != null ? (BigDecimal) data[2] : BigDecimal.ZERO);
                        lightReport.setAmperage(data[3] != null ? (BigDecimal) data[3] : BigDecimal.ZERO);
                        lightReport.setLuminousFlux(data[4] != null ? (BigDecimal) data[4] : BigDecimal.ZERO);
                        lightReport.setLuminousEfficacy(data[5] != null ? (BigDecimal) data[5] : BigDecimal.ZERO);
                        lightReport.setActiveDuration(data[6] != null ? (BigDecimal) data[6] : BigDecimal.ZERO);
                        lightReport.setPowerConsumption(data[7] != null ? (BigDecimal) data[7] : BigDecimal.ZERO);
                    }
                } catch (NoResultException e) {
                    e.printStackTrace();
                }
                lightDtos.add(lightReport);
            }

            lightingReportDtos.add(new LightingReportDto(cabinet.getId(), cabinet.getName(), lightDtos));
        }

        return lightingReportDtos;
    }

    public List<StatisticPowerVoltageReportDto> powerVoltageReport(LocalDateTime startTime, LocalDateTime endTime, String roadId, String cabinetId, String realm) {
        LocalDate startDate = startTime.toLocalDate();
        LocalDate endDate = endTime.toLocalDate();

        boolean compareDate = startDate.equals(endDate);

        List<StatisticPowerVoltageReportDto> statisticPowerVoltageReport = new ArrayList<>();
        List<Asset> cabinets = new ArrayList<>();
        List<Asset> listCabinetActive = new ArrayList<>();

        String assetRoadId = (roadId == null || roadId.isEmpty()) ? null : roadId;
        String assetCabinetId = (cabinetId == null || cabinetId.isEmpty()) ? null : cabinetId;

        if (assetCabinetId == null) {
            cabinets = assetStorageService.getListCabinet(assetRoadId, realm);
        } else {
            Asset cabinet = assetStorageService.find(assetCabinetId);
            if (cabinet != null && realm.equalsIgnoreCase(cabinet.getRealm())) {
                cabinets.add(cabinet);
            }
        }

        for (Asset cabinet : cabinets) {
            List<Asset> assetLights = assetStorageService.getCabinet(cabinet.getId());
            if (assetLights != null && !assetLights.isEmpty()) {
                listCabinetActive.add(assetLights.get(0));
            }
        }

        for (Asset cabinet : listCabinetActive) {
            List<Asset> assetLights = assetStorageService.getAllLightByCabinetId(cabinet.getId(), realm);
            List<PowerVoltageReportDto> powerReports = new ArrayList<>();

            for (Asset assetLight : assetLights) {
                try {
                    List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                            em.createNativeQuery("SELECT * FROM reportPowerVoltage10(:startTime, :endTime, :assetLightId, :compareDate)")
                                    .setParameter("startTime", startTime)
                                    .setParameter("endTime", endTime)
                                    .setParameter("assetLightId", assetLight.getId())
                                    .setParameter("compareDate", compareDate)
                                    .getResultList());

                    if (!results.isEmpty()) {
                        for (Object[] data : results) {
                            PowerVoltageReportDto powerReport = new PowerVoltageReportDto();
                            powerReport.setLightName(assetLight.getName());
                            if (data != null) {
                                powerReport.setId(data[0] != null ? (String) data[0] : "");
                                powerReport.setTime(data[1] != null ? (String) data[1] : "");

                                powerReport.setWattageActual(data[2] != null && ((BigDecimal) data[2]).compareTo(BigDecimal.ZERO) > 0
                                        ? ((BigDecimal) data[2])
                                        .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                                        .setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                        : BigDecimal.ZERO);
                                powerReport.setAmperage(data[3] != null
                                        ? ((BigDecimal) data[3])
                                        .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)  // chia cho 1000
                                        .setScale(3, RoundingMode.UP)                              // làm tròn lên 3 chữ số
                                        .stripTrailingZeros()
                                        : BigDecimal.ZERO);
                                powerReport.setVoltage(data[4] != null
                                        ? ((BigDecimal) data[4]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                        : BigDecimal.ZERO);

                                powerReport.setRoadName(data[5] != null ? (String) data[5] : "");
                                powerReport.setLightCode(data[6] != null ? (String) data[6] : "");
                            }
                            powerReports.add(powerReport);
                        }
                    }

                } catch (NoResultException e) {
                    e.printStackTrace();
                }
            }
            statisticPowerVoltageReport.add(new StatisticPowerVoltageReportDto(cabinet.getId(), cabinet.getName(), powerReports));
        }

        return statisticPowerVoltageReport;
    }

    public Map<String, Object> powerVoltageReportMobile(LocalDateTime startTime, LocalDateTime endTime, String assetLightId) {
        LocalDate startDate = startTime.toLocalDate();
        LocalDate endDate = endTime.toLocalDate();

        boolean compareDate = startDate.equals(endDate);

        Map<String, Object> result = new HashMap<>();

        Asset assetLight = assetStorageService.find(assetLightId);

        try {
            List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                    em.createNativeQuery("SELECT * FROM reportPowerVoltage9(:startTime, :endTime, :assetLightId, :compareDate)")
                            .setParameter("startTime", startTime)
                            .setParameter("endTime", endTime)
                            .setParameter("assetLightId", assetLightId)
                            .setParameter("compareDate", compareDate)
                            .getResultList());

            List<String> timeList = new ArrayList<>();
            List<BigDecimal> wattageActualList = new ArrayList<>();
            List<BigDecimal> amperageList = new ArrayList<>();
            List<BigDecimal> voltageList = new ArrayList<>();
            PowerVoltageReportDto powerReport = new PowerVoltageReportDto();

            if (!results.isEmpty()) {
                for (Object[] data : results) {
//                    powerReport.setLightName(assetLight.getName());
                    if (data != null) {
                        powerReport.setId(data[0] != null ? (String) data[0] : "");
                        timeList.add(data[1] != null ? (String) data[1] : "");

                        wattageActualList.add(data[2] != null && ((BigDecimal) data[2]).compareTo(BigDecimal.ZERO) > 0
                                ? ((BigDecimal) data[2]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                : BigDecimal.ZERO);
                        amperageList.add(data[3] != null
                                ? ((BigDecimal) data[3])
                                .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)  // chia cho 1000
                                .setScale(3, RoundingMode.UP)                              // làm tròn lên 3 chữ số
                                .stripTrailingZeros()
                                : BigDecimal.ZERO);
                        voltageList.add(data[4] != null
                                ? ((BigDecimal) data[4]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                : BigDecimal.ZERO);

                        powerReport.setRoadName(data[5] != null ? (String) data[5] : "");
                        powerReport.setLightCode(data[6] != null ? (String) data[6] : "");
                    }
//                    powerReports.add(powerReport);
                }
            }

            result.put("lightId", powerReport.getId());
            result.put("lightCode", powerReport.getLightCode());
            result.put("lightName", assetLight != null ? assetLight.getName() : "");
            result.put("roadName", powerReport.getRoadName());
            result.put("time", timeList);
            result.put("wattageActualData", wattageActualList);
            result.put("amperageData", amperageList);
            result.put("voltageData", voltageList);

        } catch (NoResultException e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<StatisticPowerVoltageReportDto> totalPowerVoltageReport(
            LocalDateTime startTime,
            LocalDateTime endTime,
            String roadId,
            String cabinetId,
            String realm) {

        String BASE_SQL = """
        WITH lights AS (
            SELECT a.id AS light_id, a.name AS light_name,
                   c.cabinet_id, c.cabinet_name, c.route_name, info.asset_code
            FROM asset a
            INNER JOIN asset_info info ON a.id = info.id
            INNER JOIN (
                SELECT ass.id as cabinet_id, ass.name as cabinet_name,
                       ac.asset_id, route.name as route_name
                FROM asset ass
                INNER JOIN asset_info ai ON ass.id = ai.id
                INNER JOIN asset route ON ass.parent_id = route.id
                INNER JOIN asset_cabinet ac ON ass.id = ac.cabinet_id
                WHERE ai.deleted = FALSE
                  %s
            ) c ON a.id = c.asset_id
            WHERE a.type = 'LightAsset'
              AND a.realm = :realm
        )
        SELECT l.light_id, l.light_name, l.cabinet_id, l.cabinet_name,
               l.route_name, l.asset_code,
               TO_CHAR(d.month_time, 'YYYY-MM') AS output_time,
               SUM(d.wattage) AS total_wattage,
               AVG(d.amperage) AS total_amperage,
               AVG(d.voltage) AS total_voltage
        FROM lights l
        JOIN LATERAL (
            SELECT date_trunc('month', day) AS month_time,
                   SUM(wattage) AS wattage,
                   AVG(amperage) AS amperage,
                   AVG(voltage) AS voltage
            FROM (
                SELECT date_trunc('day', ap."timestamp") AS day,
                       MAX(CAST(value AS numeric)) FILTER (WHERE ap.attribute_name = 'wattageActual')
                         - MIN(CAST(value AS numeric)) FILTER (WHERE ap.attribute_name = 'wattageActual') AS wattage,
                       AVG(CAST(value AS numeric)) FILTER (WHERE ap.attribute_name = 'amperage') AS amperage,
                       AVG(CAST(value AS numeric)) FILTER (WHERE ap.attribute_name = 'voltage') AS voltage
                FROM openremote.asset_datapoint_extend ap
                WHERE ap."timestamp" BETWEEN :startDate AND :endDate
                  AND ap.attribute_name IN ('wattageActual','amperage','voltage')
                  AND ap.entity_id = l.light_id
                GROUP BY date_trunc('day', ap."timestamp")
            ) day_stats
            GROUP BY date_trunc('month', day)
        ) d ON TRUE
        GROUP BY l.light_id, l.light_name, l.cabinet_id,
                 l.cabinet_name, l.route_name, l.asset_code, d.month_time
        ORDER BY l.cabinet_name, l.light_name, output_time
        """;

        String conditions = "";
        if (validationUtils.isValid(roadId)) {
            conditions += " AND ass.parent_id = :roadId";
        }
        if (validationUtils.isValid(cabinetId)) {
            conditions += " AND ass.id = :cabinetId";
        }

        String sql = String.format(BASE_SQL, conditions);

        List<Object[]> results = persistenceService.doReturningTransaction(em -> {
            var query = em.createNativeQuery(sql);
            query.setParameter("realm", realm)
                    .setParameter("startDate", startTime)
                    .setParameter("endDate", endTime);

            if (validationUtils.isValid(roadId)) {
                query.setParameter("roadId", roadId);
            }
            if (validationUtils.isValid(cabinetId)) {
                query.setParameter("cabinetId", cabinetId);
            }

            return query.getResultList();
        });

        List<PowerVoltageReportDto> powerReports = results.stream()
                .map(this::mapToDto)
                .toList();

        Map<String, List<PowerVoltageReportDto>> grouped = powerReports.stream()
                .collect(Collectors.groupingBy(PowerVoltageReportDto::getCabinetId));

        List<StatisticPowerVoltageReportDto> statisticReports = grouped.entrySet().stream()
                .map(e -> new StatisticPowerVoltageReportDto(
                        e.getKey(),
                        e.getValue().isEmpty() ? null : e.getValue().get(0).getCabinetName(),
                        e.getValue()))
                .toList();

        return statisticReports;

    }

    private PowerVoltageReportDto mapToDto(Object[] row) {
        PowerVoltageReportDto dto = new PowerVoltageReportDto();
        if (row.length < 10) {
            return dto;
        }
        dto.setId(row[0] != null ? (String) row[0] : "");
        dto.setLightName((String) row[1]);
        dto.setRoadName(row[4] != null ? (String) row[4] : "");
        dto.setLightCode(row[5] != null ? (String) row[5] : "");
        dto.setTime(row[6] != null ? (String) row[6] : "");

        dto.setWattageActual(row[7] != null && ((BigDecimal) row[7]).compareTo(BigDecimal.ZERO) > 0
                ? ((BigDecimal) row[7]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                : BigDecimal.ZERO);

        dto.setAmperage(row[8] != null
                ? ((BigDecimal) row[8])
                .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP) // chia 1000
                .setScale(3, RoundingMode.UP)                            // làm tròn lên
                .stripTrailingZeros()
                : BigDecimal.ZERO);

        dto.setVoltage(row[9] != null
                ? ((BigDecimal) row[9]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                : BigDecimal.ZERO);

        dto.setCabinetId((String) row[2]);
        dto.setCabinetName((String) row[3]);

        return dto;
    }

    public Map<String, Object> totalPowerVoltageReportMobile(LocalDateTime startTime, LocalDateTime endTime, String assetLightId) {
        LocalDate startDate = startTime.toLocalDate();
        LocalDate endDate = endTime.toLocalDate();

        boolean compareDate = startDate.equals(endDate);

        Map<String, Object> result = new HashMap<>();

        Asset assetLight = assetStorageService.find(assetLightId);

        try {
            List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                    em.createNativeQuery("SELECT * FROM totalReportPowerVoltage2(:startTime, :endTime, :assetLightId, :compareDate)")
                            .setParameter("startTime", startTime)
                            .setParameter("endTime", endTime)
                            .setParameter("assetLightId", assetLightId)
                            .setParameter("compareDate", compareDate)
                            .getResultList());

            List<String> timeList = new ArrayList<>();
            List<BigDecimal> wattageActualList = new ArrayList<>();
            List<BigDecimal> amperageList = new ArrayList<>();
            List<BigDecimal> voltageList = new ArrayList<>();

            if (!results.isEmpty()) {
                for (Object[] data : results) {
//                    powerReport.setLightName(assetLight.getName());
                    if (data != null) {
                        timeList.add(data[1] != null ? (String) data[0] : "");

                        wattageActualList.add(data[2] != null && ((BigDecimal) data[2]).compareTo(BigDecimal.ZERO) > 0
                                ? ((BigDecimal) data[2]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                : BigDecimal.ZERO);
                        amperageList.add(data[3] != null
                                ? ((BigDecimal) data[3])
                                .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)  // chia cho 1000
                                .setScale(3, RoundingMode.UP)                              // làm tròn lên 3 chữ số
                                .stripTrailingZeros()
                                : BigDecimal.ZERO);
                        voltageList.add(data[4] != null
                                ? ((BigDecimal) data[4]).setScale(3, RoundingMode.DOWN).stripTrailingZeros()
                                : BigDecimal.ZERO);

                        result.put("roadName", data[5] != null ? (String) data[5] : "");
                        result.put("lightCode", data[6] != null ? (String) data[6] : "");

                    }
                }
            }

            result.put("lightId", assetLightId);
            result.put("lightName", assetLight != null ? assetLight.getName() : "");
            result.put("time", timeList);
            result.put("wattageActualData", wattageActualList);
            result.put("amperageData", amperageList);
            result.put("voltageData", voltageList);

        } catch (NoResultException e) {
            e.printStackTrace();
        }

        return result;
    }

    public List<StatusLightReportDto> statusLightReport(LocalDateTime dateTimeActive,
                                                        String roadId,
                                                        String cabinetId,
                                                        String realm) {
        List<StatusLightReportDto> statusLightReportDtos = new ArrayList<>();
        List<Asset> roads = new ArrayList<>();

        String assetRoadId = (roadId == null || roadId.isEmpty()) ? null : roadId;
        String assetCabinetId = (cabinetId == null || cabinetId.isEmpty()) ? null : cabinetId;

        if (assetCabinetId == null) {
            roads = assetStorageService.getListRoad(assetRoadId, realm);
        } else {
            Asset road = assetStorageService.getRoadByCaninetId(assetCabinetId, realm);
            if (road != null) {
                roads.add(road);
            }
        }

        for (Asset road : roads) {
            List<LightingReportDto> lightingReportDtos = new ArrayList<>();
            List<Asset> cabinets = new ArrayList<>();

            if (assetCabinetId != null) {
                Asset cabinet = assetStorageService.find(assetCabinetId);
                if (cabinet != null) {
                    cabinets.add(cabinet);
                }
            } else {
                cabinets = assetStorageService.getListCabinet(road.getId(), realm);
            }

            for (Asset cabinet : cabinets) {
                List<Asset> assetLights = assetStorageService.getAllLightByCabinetId(cabinet.getId(), realm);

                if (!assetLights.isEmpty()) {
                    String[] lightIds = assetLights.stream()
                            .map(Asset::getId)
                            .toArray(String[]::new);

                    List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                            em.createNativeQuery(
                                            "SELECT ai.id AS entity_id, " +
                                                    "       ai.status, " +
                                                    "       b.num_value AS brightness, " +
                                                    "       b.\"timestamp\" AS lasttimeactive, " +
                                                    "       v.num_value AS voltage, " +
                                                    "       a.num_value AS amperage, " +
                                                    "       w.num_value AS wattage " +
                                                    "FROM asset_info ai " +
                                                    "LEFT JOIN LATERAL ( " +
                                                    "    SELECT CAST(value AS numeric) AS num_value, \"timestamp\" " +
                                                    "    FROM asset_datapoint_extend d " +
                                                    "    WHERE d.entity_id = ai.id " +
                                                    "      AND d.attribute_name = 'brightness' " +
                                                    "      AND d.\"timestamp\" <= ?1 " +
                                                    "    ORDER BY d.\"timestamp\" DESC " +
                                                    "    LIMIT 1 " +
                                                    ") b ON TRUE " +
                                                    "LEFT JOIN LATERAL ( " +
                                                    "    SELECT CAST(value AS numeric) AS num_value, \"timestamp\" " +
                                                    "    FROM asset_datapoint_extend d " +
                                                    "    WHERE d.entity_id = ai.id " +
                                                    "      AND d.attribute_name = 'voltage' " +
                                                    "      AND d.\"timestamp\" <= ?1 " +
                                                    "    ORDER BY d.\"timestamp\" DESC " +
                                                    "    LIMIT 1 " +
                                                    ") v ON TRUE " +
                                                    "LEFT JOIN LATERAL ( " +
                                                    "    SELECT CAST(value AS numeric) AS num_value, \"timestamp\" " +
                                                    "    FROM asset_datapoint_extend d " +
                                                    "    WHERE d.entity_id = ai.id " +
                                                    "      AND d.attribute_name = 'amperage' " +
                                                    "      AND d.\"timestamp\" <= ?1 " +
                                                    "    ORDER BY d.\"timestamp\" DESC " +
                                                    "    LIMIT 1 " +
                                                    ") a ON TRUE " +
                                                    "LEFT JOIN LATERAL ( " +
                                                    "    SELECT CAST(value AS numeric) AS num_value, \"timestamp\" " +
                                                    "    FROM asset_datapoint_extend d " +
                                                    "    WHERE d.entity_id = ai.id " +
                                                    "      AND d.attribute_name = 'wattage' " +
                                                    "      AND d.\"timestamp\" <= ?1 " +
                                                    "    ORDER BY d.\"timestamp\" DESC " +
                                                    "    LIMIT 1 " +
                                                    ") w ON TRUE " +
                                                    "WHERE ai.id = ANY(?2)")
                                    .setParameter(1, dateTimeActive)
                                    .setParameter(2, lightIds)
                                    .getResultList()
                    );

                    // Map kết quả theo entity_id
                    Map<String, Object[]> resultMap = results.stream()
                            .collect(Collectors.toMap(r -> (String) r[0], r -> r));

                    // Build DTO
                    List<LightDto> lightDtos = new ArrayList<>();
                    for (Asset assetLight : assetLights) {
                        LightDto lightReport = new LightDto();
                        lightReport.setLightName(assetLight.getName());
                        lightReport.setId(assetLight.getId());

                        Object[] data = resultMap.get(assetLight.getId());
                        if (data != null && data.length >= 7) {
                            lightReport.setBrightness(data[2] != null ? ((BigDecimal) data[2]).intValue() : 0);
                            lightReport.setStatus(data[1] != null ? (String) data[1] : "I");

                            Timestamp ts = (Timestamp) data[3];
                            lightReport.setLastTimeActive(ts != null ? ts.toString() : null);

                            lightReport.setVoltage(data[4] != null ? (BigDecimal) data[4] : BigDecimal.ZERO);
                            lightReport.setAmperage(data[5] != null
                                    ? ((BigDecimal) data[5])
                                    .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                                    .setScale(3, RoundingMode.UP)
                                    .stripTrailingZeros()
                                    : BigDecimal.ZERO);
                            lightReport.setWattage(data[6] != null ? (BigDecimal) data[6] : BigDecimal.ZERO);
                        } else {
                            lightReport.setBrightness(0);
                            lightReport.setStatus("I");
                            lightReport.setLastTimeActive(null);
                            lightReport.setVoltage(BigDecimal.ZERO);
                            lightReport.setAmperage(BigDecimal.ZERO);
                            lightReport.setWattage(BigDecimal.ZERO);
                        }

                        lightDtos.add(lightReport);
                    }

                    if (!lightDtos.isEmpty()) {
                        lightDtos.sort(Comparator.comparing(LightDto::getLightName));
                        lightingReportDtos.add(new LightingReportDto(cabinet.getId(), cabinet.getName(), lightDtos));
                    }
                }
            }

            if (!lightingReportDtos.isEmpty()) {
                statusLightReportDtos.add(new StatusLightReportDto(road.getId(), road.getName(), lightingReportDtos));
            }
        }

        return statusLightReportDtos;
    }

    public DashBoardDto getDashboardReport(String cabinetId, String realm) {
        DashBoardDto dashBoardDto = new DashBoardDto();

        // Lấy tủ có kiểm tra realm
        Asset cabinetAsset = assetStorageService.find(cabinetId);
        if (cabinetAsset == null || !realm.equalsIgnoreCase(cabinetAsset.getRealm())) {

        }

        // Lấy dữ liệu từng phần, truyền thêm realm nếu cần
        CabinetDto cabinetDto = getCabinetDto(cabinetId, realm);
        List<LightDto> lightDtos = getLightsDashboard(cabinetId, realm);
        Map<String, Object> dataChart = getChartDashboard(cabinetId, realm);

        dashBoardDto.setId(cabinetAsset.getId());
        dashBoardDto.setName(cabinetAsset.getName());
        dashBoardDto.setCabinetDto(cabinetDto);
        dashBoardDto.setLightDtos(lightDtos);
        dashBoardDto.setDataChart(dataChart);

        return dashBoardDto;
    }


    private CabinetDto getCabinetDto(String cabinetId, String realm) {
        CabinetDto cabinetDto = new CabinetDto();

        Asset cabinet = assetStorageService.find(cabinetId);
        if (cabinet == null || !realm.equalsIgnoreCase(cabinet.getRealm())) {
            throw new RuntimeException("Không có tủ nào được chọn để xuất báo cáo!!!");
        }

        List<Object[]> resultCabinet = (List<Object[]>) persistenceService.doReturningTransaction(em ->
                em.createNativeQuery("SELECT * FROM dashboardElectricalPhase8(:cabinetId)")
                        .setParameter("cabinetId", cabinetId)
                        .getResultList());

        Object[] dataCabinet = resultCabinet.isEmpty() ? null : resultCabinet.get(0);
        if (dataCabinet != null) {
            // Tủ ở trạng thái mất kết nối thì set V,W,A về 0
            if (dataCabinet[7] != null && dataCabinet[7].equals("D")) {

                cabinetDto.setVoltagePhase1(BigDecimal.ZERO);
                cabinetDto.setVoltagePhase2(BigDecimal.ZERO);
                cabinetDto.setVoltagePhase3(BigDecimal.ZERO);
                cabinetDto.setAmperagePhase1(BigDecimal.ZERO);
                cabinetDto.setAmperagePhase2(BigDecimal.ZERO);
                cabinetDto.setAmperagePhase3(BigDecimal.ZERO);
                cabinetDto.setStatus((String) dataCabinet[7]);
            } else {

                cabinetDto.setVoltagePhase1(dataCabinet[1] != null ? (BigDecimal) dataCabinet[1] : BigDecimal.ZERO);
                cabinetDto.setVoltagePhase2(dataCabinet[2] != null ? (BigDecimal) dataCabinet[2] : BigDecimal.ZERO);
                cabinetDto.setVoltagePhase3(dataCabinet[3] != null ? (BigDecimal) dataCabinet[3] : BigDecimal.ZERO);

                cabinetDto.setAmperagePhase1(dataCabinet[4] != null
                        ? ((BigDecimal) dataCabinet[4])
                        .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                        .setScale(3, RoundingMode.UP)
                        .stripTrailingZeros()
                        : BigDecimal.ZERO);
                cabinetDto.setAmperagePhase2(dataCabinet[5] != null
                        ? ((BigDecimal) dataCabinet[5])
                        .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                        .setScale(3, RoundingMode.UP)
                        .stripTrailingZeros()
                        : BigDecimal.ZERO);
                cabinetDto.setAmperagePhase3(dataCabinet[6] != null
                        ? ((BigDecimal) dataCabinet[6])
                        .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                        .setScale(3, RoundingMode.UP)
                        .stripTrailingZeros()
                        : BigDecimal.ZERO);

                cabinetDto.setStatus(dataCabinet[7] != null ? (String) dataCabinet[7] : "P");
            }

        }

        return cabinetDto;
    }


    private List<LightDto> getLightsDashboard(String cabinetId, String realm) {
        List<LightDto> lightDashboards = new ArrayList<>();

        List<Asset> lights = assetStorageService.getAllLightByCabinetId(cabinetId, realm);
        List<String> assetIds = new ArrayList<>();
        if (lights.isEmpty()) {
            return lightDashboards;
        }

        for (Asset asset : lights) {
            assetIds.add(asset.getId());
        }

        String assetIdsStr = String.join(",", assetIds);

        List<Object[]> resultLights = (List<Object[]>) persistenceService.doReturningTransaction(em -> em.createNativeQuery(
                        "SELECT * FROM dashboardLight5(:assetIdsStr)")
                .setParameter("assetIdsStr", assetIdsStr)
                .getResultList());

        if (!resultLights.isEmpty()) {
            for (Object[] light : resultLights) {
                LightDto lightDto = new LightDto();

                // Đèn ở trạng thái mất kết nối thì set V,W,A về 0
                if (light[9] != null && light[9].equals("D")) {

                    lightDto.setId(light[0] != null ? String.valueOf(light[0]) : null);
                    lightDto.setLightName(light[1] != null ? String.valueOf(light[1]) : null);
                    lightDto.setVoltage(BigDecimal.ZERO);
                    lightDto.setWattageActual(BigDecimal.ZERO);
                    lightDto.setAmperage(BigDecimal.ZERO);
                    lightDto.setLuminousFlux(light[5] != null ? (BigDecimal) light[5] : BigDecimal.ZERO);
                    lightDto.setLuminousEfficacy(light[6] != null ? (BigDecimal) light[6] : BigDecimal.ZERO);
                    BigDecimal brightness = light[7] != null ? (BigDecimal) light[7] : BigDecimal.ZERO;
                    lightDto.setBrightness(brightness.intValue());
                    Timestamp timestamp = light[8] != null ? (Timestamp) light[8] : null;
                    if (timestamp != null) {
                        lightDto.setLastTimeActive(timestamp.toString());
                    }
                    lightDto.setStatusLight(light[9] != null ? (String) light[9] : "P");

                } else {

                    lightDto.setId(light[0] != null ? String.valueOf(light[0]) : null);
                    lightDto.setLightName(light[1] != null ? String.valueOf(light[1]) : null);
                    lightDto.setVoltage(light[2] != null ? (BigDecimal) light[2] : BigDecimal.ZERO);
                    lightDto.setWattageActual(light[3] != null ? (BigDecimal) light[3] : BigDecimal.ZERO);
                    lightDto.setAmperage(light[4] != null
                            ? ((BigDecimal) light[4])
                            .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                            .setScale(3, RoundingMode.UP)
                            .stripTrailingZeros()
                            : BigDecimal.ZERO);
                    lightDto.setLuminousFlux(light[5] != null ? (BigDecimal) light[5] : BigDecimal.ZERO);
                    lightDto.setLuminousEfficacy(light[6] != null ? (BigDecimal) light[6] : BigDecimal.ZERO);
                    BigDecimal brightness = light[7] != null ? (BigDecimal) light[7] : BigDecimal.ZERO;
                    lightDto.setBrightness(brightness.intValue());
                    Timestamp timestamp = light[8] != null ? (Timestamp) light[8] : null;
                    if (timestamp != null) {
                        lightDto.setLastTimeActive(timestamp.toString());
                    }
                    lightDto.setStatusLight(light[9] != null ? (String) light[9] : "P");
                }

                lightDashboards.add(lightDto);
            }
        }

        lightDashboards = lightDashboards.stream()
                .sorted(Comparator.comparing((LightDto l) -> !"D".equals(l.getStatusLight())))
                .collect(Collectors.toList());

        return lightDashboards;
    }


    private Map<String, Object> getChartDashboard(String cabinetId, String realm) {
        Asset cabinet = assetStorageService.find(cabinetId);
        if (cabinet == null || !realm.equalsIgnoreCase(cabinet.getRealm())) {
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxTime = now.withMinute(now.getMinute() >= 30 ? 30 : 0).withSecond(0).withNano(0);
        LocalDateTime minTime = maxTime.minusHours(12).minusMinutes(30);

        List<LocalDateTime> timePoints = new ArrayList<>();
        LocalDateTime currentTime = minTime;
        while (!currentTime.isAfter(maxTime)) {
            timePoints.add(currentTime);
            currentTime = currentTime.plusMinutes(30);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
        List<String> xAxisLabels = timePoints.stream().map(tp -> tp.format(formatter)).collect(Collectors.toList());

        Map<String, BigDecimal> wattage1Data = fetchPhaseData(cabinetId, "wattageActualPhase1", minTime, maxTime);
        Map<String, BigDecimal> wattage2Data = fetchPhaseData(cabinetId, "wattageActualPhase2", minTime, maxTime);
        Map<String, BigDecimal> wattage3Data = fetchPhaseData(cabinetId, "wattageActualPhase3", minTime, maxTime);

        Map<String, BigDecimal> amperage1Data = fetchPhaseData(cabinetId, "amperagePhase1", minTime, maxTime);
        Map<String, BigDecimal> amperage2Data = fetchPhaseData(cabinetId, "amperagePhase2", minTime, maxTime);
        Map<String, BigDecimal> amperage3Data = fetchPhaseData(cabinetId, "amperagePhase3", minTime, maxTime);

        List<BigDecimal> wattage1Values = new ArrayList<>();
        List<BigDecimal> wattage2Values = new ArrayList<>();
        List<BigDecimal> wattage3Values = new ArrayList<>();
        List<BigDecimal> totalWattageValues = new ArrayList<>();

        List<BigDecimal> amperage1Values = new ArrayList<>();
        List<BigDecimal> amperage2Values = new ArrayList<>();
        List<BigDecimal> amperage3Values = new ArrayList<>();
        List<BigDecimal> totalAmperageValues = new ArrayList<>();

        DateTimeFormatter formatterKey = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (LocalDateTime timePoint : timePoints) {
            String key = timePoint.format(formatterKey);
            BigDecimal w1 = wattage1Data.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal w2 = wattage2Data.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal w3 = wattage3Data.getOrDefault(key, BigDecimal.ZERO);
            wattage1Values.add(w1);
            wattage2Values.add(w2);
            wattage3Values.add(w3);
            totalWattageValues.add(w1.add(w2).add(w3));

            BigDecimal a1 = amperage1Data.getOrDefault(key, BigDecimal.ZERO)
                    .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                    .setScale(3, RoundingMode.UP)
                    .stripTrailingZeros();
            BigDecimal a2 = amperage2Data.getOrDefault(key, BigDecimal.ZERO)
                    .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                    .setScale(3, RoundingMode.UP)
                    .stripTrailingZeros();
            BigDecimal a3 = amperage3Data.getOrDefault(key, BigDecimal.ZERO)
                    .divide(new BigDecimal("1000"), 6, RoundingMode.HALF_UP)
                    .setScale(3, RoundingMode.UP)
                    .stripTrailingZeros();
            amperage1Values.add(a1);
            amperage2Values.add(a2);
            amperage3Values.add(a3);
            totalAmperageValues.add(a1.add(a2).add(a3));
        }

        List<Map<String, Object>> wattageData = List.of(
                Map.of("label", "Pha 1", "data", wattage1Values),
                Map.of("label", "Pha 2", "data", wattage2Values),
                Map.of("label", "Pha 3", "data", wattage3Values),
                Map.of("label", "Tổng", "data", totalWattageValues)
        );

        List<Map<String, Object>> amperageData = List.of(
                Map.of("label", "Pha 1", "data", amperage1Values),
                Map.of("label", "Pha 2", "data", amperage2Values),
                Map.of("label", "Pha 3", "data", amperage3Values),
                Map.of("label", "Tổng", "data", totalAmperageValues)
        );

        Map<String, Object> result = new HashMap<>();
        result.put("xAxis", xAxisLabels);
        result.put("wattageData", wattageData);
        result.put("amperageData", amperageData);

        return result;
    }


    private Map<String, BigDecimal> fetchPhaseData(String cabinetId, String attributeName, LocalDateTime minTime, LocalDateTime maxTime) {
        Map<String, BigDecimal> dataMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em -> {
            return em.createNativeQuery(
                            "SELECT * FROM fetchPhaseData1(:cabinetId, :attributeName, :minTime, :maxTime)")
                    .setParameter("cabinetId", cabinetId)
                    .setParameter("attributeName", attributeName)
                    .setParameter("minTime", minTime)
                    .setParameter("maxTime", maxTime)
                    .getResultList();
        });

        for (Object[] row : results) {
            Timestamp timestamp = row[0] != null ? (Timestamp) row[0] : null;
            assert timestamp != null;
            BigDecimal value = (row[1] != null) ? (BigDecimal) row[1] : BigDecimal.ZERO;
            dataMap.put(timestamp.toLocalDateTime().format(formatter), value);
        }
        return dataMap;
    }

    public String getPowerConsumptionByLight(String assetId) {
        return persistenceService.doReturningTransaction(entityManager -> {
            List<?> results = entityManager.createNativeQuery(
                            "select lt.power_consumption from route_lamppost_detail rld " +
                                    "join md_lamp_type lt on lt.id = rld.lamp_type_id " +
                                    "where rld.asset_id = :id")
                    .setParameter("id", assetId)
                    .getResultList();

            return results.isEmpty() ? "0" : results.get(0).toString();
        });
    }

    public List<AssetDatapoint> getPowerByAssetId(String assetId) {
        List<AssetDatapoint> assetDataPoints = new ArrayList<>();
        List<Object[]> results = (List<Object[]>) persistenceService.doReturningTransaction(em -> {
            return em.createNativeQuery(
                            "SELECT * FROM powerAssetDataPointByAssetId5(:assetId)")
                    .setParameter("assetId", assetId)
                    .getResultList();
        });

        if (!results.isEmpty()) {
            for (Object[] data : results) {
                AssetDatapoint datapoint = new AssetDatapoint();
                datapoint.setAssetId(data[0] != null ? (String) data[0] : "");
                datapoint.setAttributeName(data[1] != null ? (String) data[1] : "");
                datapoint.setValue(data[2] != null ? data[2] : "");
                datapoint.setTimestamp(data[3] != null ? (long) data[3] : 0);
                assetDataPoints.add(datapoint);
            }
        }
        return assetDataPoints;
    }

    public Date getLastTimeActive(String assetId) {
        return (Date) persistenceService.doReturningTransaction(em -> {
            List<?> results = em.createNativeQuery(
                            new StringBuilder().append("SELECT ap.timestamp ")
                                    .append("FROM asset_datapoint ap ")
                                    .append("WHERE ap.entity_id = :assetId ")
                                    .append("AND CAST(CAST(ap.value AS TEXT) AS NUMERIC) > 0 ")
                                    .append("ORDER BY ap.timestamp DESC ")
                                    .append("LIMIT 1").toString(), Date.class)
                    .setParameter("assetId", assetId)
                    .getResultList();

            return results.isEmpty() ? null : results.get(0);
        });
    }

}
