package org.openremote.manager.notification;

import jakarta.mail.internet.MimeUtility;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.apache.camel.builder.RouteBuilder;
import org.openremote.container.message.MessageBrokerService;
import org.openremote.container.persistence.PersistenceService;
import org.openremote.container.security.IdentityService;
import org.openremote.manager.asset.AssetProcessingService;
import org.openremote.manager.asset.AssetStorageService;
import org.openremote.manager.security.ManagerIdentityService;
import org.openremote.model.Constants;
import org.openremote.model.Container;
import org.openremote.model.ContainerService;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.impl.ElectricalCabinetAsset;
import org.openremote.model.asset.impl.LightAsset;
import org.openremote.model.assetInfo.AssetInfoEntity;
import org.openremote.model.attribute.AttributeEvent;
import org.openremote.model.attribute.AttributeRef;
import org.openremote.model.datapoint.AssetDatapoint;
import org.openremote.model.datapoint.Datapoint;
import org.openremote.model.geo.GeoJSONPoint;
import org.openremote.model.notification.EmailNotificationMessage;
import org.openremote.model.notification.Notification;
import org.openremote.model.notification.RepeatFrequency;
import org.openremote.model.query.AssetQuery;
import org.openremote.model.scheduleinfo.ScheduleAsset;
import org.openremote.model.security.User;
import org.openremote.model.warning.WarningEmailConfig;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.stream.Collectors;

import static org.openremote.manager.asset.AssetProcessingService.*;
import static org.openremote.model.notification.Notification.Source.INTERNAL;

public class EmailCustomService extends RouteBuilder implements ContainerService {
    public static final String Email_Custom_QUEUE = "seda://EmailCustomQueue?waitForTaskToComplete=IfReplyExpected&timeout=10000&purgeWhenStopping=true&discardIfNoConsumers=false&size=25000";
    protected PersistenceService persistenceService;
    //    protected TimerService timerService;
    protected AssetStorageService assetStorageService;
    protected IdentityService identityService;
    protected MessageBrokerService messageBrokerService;
    protected ScheduledExecutorService executorService;
    protected ScheduledFuture<?> flushBatchFuture;
    protected AssetProcessingService assetProcessingService;

    @Override
    public void configure() throws Exception {
        from(Email_Custom_QUEUE)
                .routeId("EmailCustomService")
                .process(exchange -> {
//                Notification notification = exchange.getIn().getBody(.class);
                })
                .onException(Exception.class)
                .logStackTrace(false)
                .handled(true)
                .process(exchange -> {
                    // Just notify sender in case of RequestReply
                    exchange.getMessage().setBody(false);
                });

    }

    @Override
    public void init(Container container) throws Exception {
//        this.timerService = container.getService(TimerService.class);
        this.executorService = container.getExecutorService();
        this.persistenceService = container.getService(PersistenceService.class);
        this.assetStorageService = container.getService(AssetStorageService.class);
        this.identityService = container.getService(ManagerIdentityService.class);
        this.messageBrokerService = container.getService(MessageBrokerService.class);
        this.assetProcessingService = container.getService(AssetProcessingService.class);
    }

    @Override
    public void start(Container container) throws Exception {
        timeFlag = getTimeDatapointFlag();
        timeFlag2 = getTimeDatapointFlag2();
        dataScanInterval = Long.parseLong(getDataScanInterval());
        dataScanInterval2 = Long.parseLong(getDataScanInterval2());
        statusWarningInterval = Long.parseLong(getStatusWarningInterval());
        flushBatchFuture = executorService.scheduleAtFixedRate(this::flushBatch, 10, 60, TimeUnit.SECONDS);
    }

    private void flushBatch() {
        try {
            thresholdEmail();
            // emailStatus();
        } catch (Exception e) {
            System.err.println("Đã xảy ra lỗi trong EmailCustomService.flushBatch(): " + e.getMessage());
            e.printStackTrace();
        }
    }

    static class SysAR {
        Long id;
        String attrCodeName;

        public SysAR(Long id, String attrCodeName) {
            this.id = id;
            this.attrCodeName = attrCodeName;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getAttrCodeName() {
            return attrCodeName;
        }

        public void setAttrCodeName(String attrCodeName) {
            this.attrCodeName = attrCodeName;
        }
    }

    static class EmailTime {
        String email;
        Instant time;

        EmailTime() {
            time = Instant.now();
        }

        public EmailTime(String email, Instant time) {
            this.email = email;
            this.time = time;
        }
    }

    //    private final Map<String, Instant> lastWarningTimeMap = new ConcurrentHashMap<>();
    private final Map<String, List<EmailTime>> lastWarningEmailMap = new ConcurrentHashMap<>();
    private final Map<String, AssetInfoEntity> notificationDataMap = new ConcurrentHashMap<>();
    private final List<AssetInfoEntity> notificationDataList = new ArrayList<>();
    Instant timeFlag;
    Instant timeFlag2;
    Instant timeUpdateValueParms = Instant.now();
    Long dataScanInterval;
    Long dataScanInterval2;
    Long statusWarningInterval;

    private void thresholdEmail() {
        // kiểm tra kịch bản đã áp dụng hoàn tất chưa -> gửi email
        checkScheduleEmail();

        Instant now = Instant.now();
        if (Duration.between(timeFlag, now).toSeconds() >= dataScanInterval) {
            List<SysAR> attributes = persistenceService.doReturningTransaction(entityManager ->
                    ((List<Object[]>) entityManager
                            .createNativeQuery("SELECT swr.id, sa.attr_code_name FROM sys_warning_rule AS swr JOIN sys_attributes AS sa ON sa.id = swr.attr_id WHERE swr.active = true")
                            .getResultList())
                            .stream()
                            .map(row -> new SysAR((Long) row[0], (String) row[1]))
                            .toList()
            );
            for (SysAR i : attributes) {
                List<WarningEmailConfig> targets = findEmailTarget(i.getId());
                for (WarningEmailConfig j : targets) {
                    if (Instant.ofEpochMilli(j.getStartDate().getTime()).toEpochMilli() > now.toEpochMilli()) {
                        continue;
                    }
                    if (j.getValueType().trim().equals("RV")) {
                        List<String> routeIds = (List<String>) findRouteIdByEMailConfig(j.getId());
                        List<String> lightIds = new ArrayList<>();

                        for (String id : routeIds) {
                            List<String> lightAssetIds = persistenceService.doReturningTransaction(entityManager ->
                                    entityManager
                                            .createNativeQuery("SELECT lightAsset.id FROM asset lightAsset WHERE ? = ANY(string_to_array(lightAsset.path \\:\\:text, '.')) AND lightAsset.type = 'LightAsset' AND lightAsset.attributes -> 'assetStatus' ->> 'value'!='D' ")
                                            .setParameter(1, id)
                                            .getResultList()
                                            .stream()
                                            .map(Object::toString)
                                            .toList()
                            );

                            lightIds.addAll(lightAssetIds);
                        }

                        List<AssetDatapoint> data = getListDatapoint(timeFlag, i.getAttrCodeName(), lightIds, j.getLowerBoundValue(), j.getUpperBoundValue());
                        if (!data.isEmpty()) {
                            sendNotification(data, j, i.getAttrCodeName());
                        }
                    }

                    if (j.getValueType().trim().equals("FV")) {
                        List<String> routeIds = (List<String>) findRouteIdByEMailConfig(j.getId());
                        List<String> lightCabinetIds = new ArrayList<>();

                        for (String id : routeIds) {
                            List<String> assetIds = persistenceService.doReturningTransaction(entityManager ->
                                    entityManager
                                            .createNativeQuery("SELECT lightAsset.id FROM asset lightAsset WHERE ? = ANY(string_to_array(lightAsset.path \\:\\:text, '.')) AND (lightAsset.type = 'LightAsset' OR lightAsset.type = 'ElectricalCabinetAsset' ) ")
                                            .setParameter(1, id)
                                            .getResultList()
                                            .stream()
                                            .map(Object::toString)
                                            .toList()
                            );

                            lightCabinetIds.addAll(assetIds);
                        }

                        List<AssetInfoEntity> data = assetStorageService.findAllAssetInfo(lightCabinetIds);


                        for (AssetInfoEntity ai : data) {
                            if (Arrays.asList(Arrays.stream(j.getWarningValue().split(","))
                                            .map(String::trim).toArray())
                                    .contains(ai.getStatus())) {

                                List<EmailTime> lastWarnEmailTime = lastWarningEmailMap.get(ai.getId());
                                if (lastWarnEmailTime == null) {
                                    lastWarnEmailTime = new ArrayList<>();
                                }

                                boolean emailNeverWarned = lastWarnEmailTime.stream()
                                        .noneMatch(emailTime -> emailTime.email.equals(j.getEmail()));

                                boolean intervalExceeded = lastWarnEmailTime.stream()
                                        .filter(emailTime -> emailTime.email.equals(j.getEmail()))
                                        .findFirst()
                                        .map(emailTime -> Duration.between(emailTime.time, now).toSeconds() >= statusWarningInterval)
                                        .orElse(true);

                                if (emailNeverWarned || intervalExceeded) {
                                    notificationDataList.add(ai);
                                    notificationDataMap.put(ai.getId(), new AssetInfoEntity(ai));

                                    // Cập nhật lại thời gian cảnh báo cho email
                                    List<EmailTime> updatedList = lastWarnEmailTime.stream()
                                            .filter(et -> !et.email.equals(j.getEmail()))
                                            .collect(Collectors.toList());
                                    updatedList.add(new EmailTime(j.getEmail(), now));
                                    lastWarningEmailMap.put(ai.getId(), updatedList);
                                }

                                // Nếu trạng thái thay đổi trong khoảng thời gian ngắn
                                AssetInfoEntity lastNotified = notificationDataMap.get(ai.getId());
                                if (lastNotified != null && !ai.getStatus().equals(lastNotified.getLastValueWarning())) {
                                    notificationDataList.add(ai);
                                    notificationDataMap.put(ai.getId(), new AssetInfoEntity(ai));

                                    List<EmailTime> updatedList = lastWarnEmailTime.stream()
                                            .filter(et -> !et.email.equals(j.getEmail()))
                                            .collect(Collectors.toList());
                                    updatedList.add(new EmailTime(j.getEmail(), now));
                                    lastWarningEmailMap.put(ai.getId(), updatedList);
                                }
                            }
                        }

                        if (!notificationDataList.isEmpty()) {
                            sendNotification(notificationDataList, j);
                            notificationDataList.clear();
                        }

                    }

                }
            }
            timeFlag = Instant.now();
        }

        if (Duration.between(timeFlag2, Instant.now()).toSeconds() >= dataScanInterval2) { // Lấy đối tượng ZoneId cho khu vực có múi giờ +7
//            ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
//            LocalDateTime startTimeAsNaiveUtc = timeFlag2.atZone(vietnamZone).toLocalDateTime();
            List<Asset<?>> assets = persistenceService.doReturningTransaction(entityManager ->
                    entityManager.createNativeQuery(
                                    "SELECT " +
                                            "    a.* " +
                                            "FROM " +
                                            "    ASSET a " +
                                            "WHERE " +
                                            "    a.TYPE IN ('ElectricalCabinetAsset','LightAsset') " +
                                            "    AND NOT EXISTS ( " +
                                            "        SELECT 1 " +
                                            "        FROM ASSET_DATAPOINT adp " +
                                            "        WHERE " +
                                            "            adp.ENTITY_ID = a.ID " +

                                            "            AND adp.TIMESTAMP >= :startTime " +
                                            "    )",
                                    Asset.class
                            )
                            // Truyền đối tượng Timestamp đã tính toán
                            .setParameter("startTime", java.sql.Timestamp.from(timeFlag2))
                            .getResultList()
            );

            assets.stream().filter(asset -> asset.getType().equals(ELECTRICAL_CABINET_ASSET))
                    .map(asset -> (ElectricalCabinetAsset) asset)
                    .forEach(eca -> {
                        assetStorageService.updateStartAssetInfo(eca.getId(), "D");
                        assetProcessingService.sendAttributeEvent(new AttributeEvent(false, new AttributeRef(eca.getId(), power_sts_1), 0));
                        assetProcessingService.sendAttributeEvent(new AttributeEvent(false, new AttributeRef(eca.getId(), power_sts_2), 0));
                        assetProcessingService.sendAttributeEvent(new AttributeEvent(false, new AttributeRef(eca.getId(), power_sts_3), 0));
                        assetProcessingService.sendAttributeEvent(new AttributeEvent(false, new AttributeRef(eca.getId(), STATUS), "D"));
                    });

            assets.stream().filter(asset -> asset.getType().equals(LIGHT_ASSET))
                    .map(asset -> (LightAsset) asset)
                    .forEach(eca -> {
                        assetStorageService.updateStartAssetInfo(eca.getId(), "D");
                        assetProcessingService.sendAttributeEvent(new AttributeEvent(false, new AttributeRef(eca.getId(), STATUS), "D"));
                    });
            timeFlag2 = Instant.now();
        }

        if (Duration.between(timeUpdateValueParms, now).toSeconds() >= 60 * 60 && Long.parseLong(getStatusWarningInterval()) % Long.parseLong(getDataScanInterval()) == 0) {
            dataScanInterval = Long.parseLong(getDataScanInterval());
            dataScanInterval2 = Long.parseLong(getDataScanInterval2());
            statusWarningInterval = Long.parseLong(getStatusWarningInterval());
            timeUpdateValueParms = Instant.now();
            updateTimeDatapointFlag();
            updateTimeDatapointFlag2();
            timeFlag = getTimeDatapointFlag();
            timeFlag2 = getTimeDatapointFlag2();
        }
    }

    public void sendNotification30(List<ElectricalCabinetAsset> data, WarningEmailConfig warningEmailConfig) {
        String htmlRV = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <title>Cảnh Báo Mất Kết Nối Thiết Bị</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 15px;
                            color: #333;
                            line-height: 1.6;
                            background-color: #f9f9f9;
                            margin: 0;
                            padding: 20px;
                        }
                                
                        .container {
                            background-color: #fff;
                            border-radius: 8px;
                            padding: 25px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.05);
                            max-width: 1000px;
                            margin: auto;
                        }
                                
                        h2 {
                            color: #d9534f; /* Thay đổi màu cho cảnh báo nguy hiểm */
                            border-bottom: 2px solid #f0f0f0;
                            padding-bottom: 10px;
                        }
                                
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                            font-size: 14px;
                        }
                                
                        th, td {
                            border: 1px solid #dee2e6;
                            padding: 10px 12px;
                            text-align: left;
                            vertical-align: middle; /* Căn giữa theo chiều dọc cho đẹp hơn */
                        }
                                
                        th {
                            background-color: #007bff;
                            color: white;
                            font-weight: 600;
                        }
                                
                        tr:nth-child(even) {
                            background-color: #f8f9fa; /* Màu nền nhạt hơn một chút */
                        }
                                
                        tr:hover {
                            background-color: #e9ecef;
                        }
                                
                        p {
                            margin-top: 1em;
                            margin-bottom: 1em;
                        }
                                
                        strong {
                            color: #000;
                        }
                                
                        .status-danger {
                            color: #d9534f;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>⚠️ CẢNH BÁO: MẤT KẾT NỐI THIẾT BỊ</h2>
                                
                        <p>Kính gửi Quý quản trị viên,</p>
                                
                        <p>
                            Hệ thống giám sát <strong>HOMICO IOT Platform</strong> đã ghi nhận một số tủ điện không gửi dữ liệu về hệ thống trong <strong>30 phút</strong> qua.
                            Đây có thể là dấu hiệu của việc mất kết nối hoặc lỗi thiết bị. Dưới đây là danh sách chi tiết:
                        </p>
                                
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã tủ</th>
                                    <th>Tên Tủ</th>
                                    <th>Vị trí</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Dữ liệu mẫu -->
                                </tbody>
                        </table>
                                
                        <p>
                            Đề nghị Quý quản trị viên kiểm tra lại kết nối mạng và tình trạng hoạt động của các thiết bị này để đảm bảo hệ thống vận hành ổn định.
                        </p>
                                
                        <p>
                            Nếu cần thêm thông tin hoặc hỗ trợ kỹ thuật, xin vui lòng liên hệ với bộ phận kỹ thuật qua
                            <strong>support@homico.vn</strong> hoặc <strong>1900 1234</strong>.
                        </p>
                                
                        <p>
                            Trân trọng,<br>
                            <strong>HOMICO IOT Platform</strong>
                        </p>
                    </div>
                </body>
                </html>
                """;

        StringBuilder text = new StringBuilder();
        int index = 0;
        for (ElectricalCabinetAsset eca : data) {
            index++;
            text
                    .append("<tr> ")
                    .append("<td>").append(index).append("</td> ")
                    .append("<td>").append(assetStorageService.getById(eca.getId()).getAssetCode()).append("</td> ")
                    .append("<td>").append(eca.getName()).append("</td> ")
                    .append("<td>").append("Vĩ độ: ").append(eca.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().y).append(", khinh độ: ").append(eca.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().x).append("</td> ")
                    .append("</tr> ");

        }

        htmlRV = htmlRV.replace("<!-- Dữ liệu mẫu -->", text.toString());

        EmailNotificationMessage emailMessage = new EmailNotificationMessage()
                .setFrom("VietPT")
                .addTo(warningEmailConfig.getEmail())
                .setSubject("[HOMICO IOT Platform] Cảnh báo tủ không gửi về dữ liệu ")
                .setHtml(htmlRV);
//                .setText(text.toString());

        // Tạo Target kiểu USER
//        Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, roadAsset.getId());

        // Tạo Notification
        Notification notification = new Notification()
                .setName("[HOMICO IOT Platform] Cảnh báo tủ không gửi về dữ liệu ")
                .setMessage(emailMessage)
                .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
                ;
//        notification.setTargets(Collections.singletonList(userTarget));


        Map<String, Object> headers = new HashMap<>();
        headers.put(Notification.HEADER_SOURCE, INTERNAL);


        boolean success = messageBrokerService.getFluentProducerTemplate()
                .withBody(notification)
                .withHeaders(headers)
                .to(NotificationService.NOTIFICATION_QUEUE)
                .request(Boolean.class);

//        if (!success) {
//            throw new WebApplicationException(BAD_REQUEST);
//        }

    }

    private void sendScheduleEmail(List<ScheduleAsset> scheduleAssets, String scheduleName, User userByUsernameFromDb) throws UnsupportedEncodingException {
        String template = """
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Cảnh Báo Mất Kết Nối Thiết Bị</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 15px;
        color: #333;
        line-height: 1.6;
        background-color: #f9f9f9;
        margin: 0;
        padding: 20px;
    }

    .container {
        background-color: #fff;
        border-radius: 8px;
        padding: 25px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
        max-width: 1000px;
        margin: auto;
    }

    h2 {
        color: #d9534f; /* Thay đổi màu cho cảnh báo nguy hiểm */
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 10px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 14px;
    }

    th, td {
        border: 1px solid #dee2e6;
        padding: 10px 12px;
        text-align: left;
        vertical-align: middle; /* Căn giữa theo chiều dọc cho đẹp hơn */
    }

    th {
        background-color: #007bff;
        color: white;
        font-weight: 600;
    }

    tr:nth-child(even) {
        background-color: #f8f9fa; /* Màu nền nhạt hơn một chút */
    }

    tr:hover {
        background-color: #e9ecef;
    }

    p {
        margin-top: 1em;
        margin-bottom: 1em;
    }

    strong {
        color: #000;
    }

    .status-danger {
        color: #d9534f;
        font-weight: bold;
    }
</style>
</head>
<body>
<div class="container">

<p>Kính gửi <!-- target user -->,</p>

<p>
    Hệ thống giám sát <strong>HOMICO IOT Platform</strong> xin thông báo kịch bản <strong><!-- schedule --></strong> đã được thực hiện.
    Dưới đây là bảng báo cáo chi tiết:
</p>

<table>
    <thead>
    <tr>
        <th>STT</th>
        <th>Loại</th>
        <th>Tên</th>
        <th>Trạng thái</th>
    </tr>
    </thead>
    <tbody>
    <!-- Dữ liệu mẫu -->
    </tbody>
</table>

<p>
    Nếu cần thêm thông tin hoặc hỗ trợ kỹ thuật, xin vui lòng liên hệ với bộ phận kỹ thuật qua
    <strong>support@homico.vn</strong> hoặc <strong>1900 1234</strong>.
</p>

<p>
    Trân trọng,<br>
    <strong>HOMICO IOT Platform</strong>
</p>
</div>
</body>
</html>
                """;
        StringBuilder rows = new StringBuilder();
        int index = 1;
        for (ScheduleAsset status : scheduleAssets) {
            rows.append("<tr>")
                    .append("<td>").append(index++).append("</td>")
                    .append("<td>").append(getAssetTypeName(status.getAssetTypeName())).append("</td>")
                    .append("<td>").append(status.getAssetName()).append("</td>")
                    .append("<td style='font-weight:bold;color:")
                    .append(getAssetStatus(status.getStatus()))
                    .append("</td>")
                    .append("</tr>");
        }

        String emailContent = template.replace("<!-- Dữ liệu mẫu -->", rows.toString())
                .replace("<!-- target user -->", userByUsernameFromDb.getFullName())
                .replace("<!-- schedule -->", scheduleName);

        String rawSubject = "[HOMICO IOT Platform] Quá trình áp dụng kịch bản hoàn tất";
        String encodedSubject = MimeUtility.encodeText(rawSubject, "UTF-8", "B");

        EmailNotificationMessage emailMessage = new EmailNotificationMessage()
                .addTo(userByUsernameFromDb.getEmail())
                .setTo(userByUsernameFromDb.getEmail())
                .setSubject(encodedSubject)
                .setHtml(emailContent);


        Notification notification = new Notification()
                .setName(scheduleName)
                .setRealm(userByUsernameFromDb.getRealm())
                .setMessage(emailMessage)
                .setRepeatFrequency(RepeatFrequency.ALWAYS);

        Map<String, Object> headers = new HashMap<>();
        headers.put(Notification.HEADER_SOURCE, INTERNAL);

        boolean success = messageBrokerService.getFluentProducerTemplate()
                .withBody(notification)
                .withHeaders(headers)
                .to(NotificationService.NOTIFICATION_QUEUE)
                .request(Boolean.class);

    }

    private String getAssetTypeName(String assetTypeName) {
        return switch (assetTypeName) {
            case Constants.LIGHT_ASSET -> "Đèn";
            case Constants.ELECTRICAL_CABINET_ASSET -> "Tủ Điện";
            case Constants.FIX_GROUP_ASSET -> "Khởi";
            case Constants.LIGHT_GROUP_ASSET -> "Nhóm đèn";
            case Constants.ROAD_ASSET -> "Lộ tuyến";
            default -> "N/A";
        };
    }

    private String getAssetStatus(Integer status) {
        return switch (status) {
            case 0 -> "blue'>Đang gửi";
            case -1 -> "red'>Thất bại";
            case 1 -> "green'>Thành công";
            case -2 -> "red'>Xóa thất bại";
            case 2 -> "green'>Xóa thành công";
            default -> "N/A";
        };
    }

    public void sendNotification(List<AssetDatapoint> data, WarningEmailConfig warningEmailConfig, String attributeName) {
        String htmlRV = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 15px;
                            color: #333;
                            line-height: 1.6;
                            background-color: #f9f9f9;
                            padding: 20px;
                        }
                                
                        .container {
                            background-color: #fff;
                            border-radius: 8px;
                            padding: 25px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.05);
                            max-width: 1000px;
                            margin: auto;
                        }
                                
                        h2 {
                            color: #004085;
                        }
                                
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                            font-size: 14px;
                        }
                                
                        th, td {
                            border: 1px solid #dee2e6;
                            padding: 10px 12px;
                            text-align: left;
                            vertical-align: top;
                        }
                                
                        th {
                            background-color: #007bff;
                            color: white;
                        }
                                
                        tr:nth-child(even) {
                            background-color: #f2f6fc;
                        }
                                
                        tr:hover {
                            background-color: #e9f3ff;
                        }
                                
                        p {
                            margin-top: 1em;
                            margin-bottom: 1em;
                        }
                                
                        strong {
                            color: #000;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Kính gửi Quý quản trị viên,</p>
                                
                        <p>
                            Hệ thống chiếu sáng thông minh <strong>HOMICO IOT Platform</strong> đã phát hiện một số thiết bị có thông số vượt ngưỡng cho phép.
                            Dưới đây là danh sách chi tiết:
                        </p>
                                
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên thiết bị</th>
                                    <th>Vị trí</th>
                                    <th>Thông số giám sát</th>
                                    <th>Ngưỡng cho phép</th>
                                    <th>Giá trị hiện tại</th>
                                    <th>Thời điểm pghi nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Dữ liệu mẫu -->
                            </tbody>
                        </table>
                                
                        <p>
                            Đề nghị Quý quản trị viên kiểm tra và xử lý tình trạng này kịp thời để đảm bảo hệ thống hoạt động ổn định\s
                            và tránh các sự cố tiềm ẩn.
                        </p>
                                
                        <p>
                            Nếu cần thêm thông tin hoặc hỗ trợ kỹ thuật, xin vui lòng liên hệ với bộ phận kỹ thuật qua\s
                            <strong>support@homico.vn</strong> hoặc <strong>1900 1234</strong>.
                        </p>
                                
                        <p>
                            Trân trọng,<br>
                            <strong>HOMICO IOT Platform</strong>
                        </p>
                    </div>
                </body>
                </html>
                """;
        List<Asset<?>> assets = assetStorageService.findAll(new AssetQuery().ids(data.stream().map(Datapoint::getAssetId).distinct().toArray(String[]::new)));
        StringBuilder text = new StringBuilder();
        int index = 0;
        for (AssetDatapoint ad : data) {
            index++;
            Asset<?> asset = assets.stream().filter(a -> a.getId().equals(ad.getAssetId())).findFirst().orElse(new LightAsset());
//            Asset<?> roadAsset = assetStorageService.find(asset.getPath()[0]);

            text
                    .append("<tr> ")
                    .append("<td>").append(index).append("</td> ")
                    .append("<td>").append(asset.getName()).append("</td> ")
//                    .append("<td>").append(roadAsset.getName()).append("</td> ")
                    .append("<td>").append("Vĩ độ: ").append(asset.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().y).append(", khinh độ: ").append(asset.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().x).append("</td> ")
                    .append("<td>").append(attributeName).append("</td> ")
                    .append("<td>").append("[").append(warningEmailConfig.getLowerBoundValue()).append(", ").append(warningEmailConfig.getUpperBoundValue()).append("]").append("</td> ")
                    .append("<td>").append(ad.getValue()).append("</td> ")
                    .append("<td>").append(ad.getVietnamDateTime()).append("</td> ")
                    .append("</tr> ");

        }

        htmlRV = htmlRV.replace("<!-- Dữ liệu mẫu -->", text.toString());

        EmailNotificationMessage emailMessage = new EmailNotificationMessage()
                .setFrom("VietPT")
                .addTo(warningEmailConfig.getEmail())
                .setSubject("[HOMICO IOT Platform] Cảnh báo vượt ngưỡng " + attributeName)
                .setHtml(htmlRV);
//                .setText(text.toString());

        // Tạo Target kiểu USER
//        Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, roadAsset.getId());

        // Tạo Notification
        Notification notification = new Notification()
                .setName(attributeName)
                .setMessage(emailMessage)
                .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
                ;
//        notification.setTargets(Collections.singletonList(userTarget));
        notification.realm = warningEmailConfig.getRealm();

        Map<String, Object> headers = new HashMap<>();
        headers.put(Notification.HEADER_SOURCE, INTERNAL);


        boolean success = messageBrokerService.getFluentProducerTemplate()
                .withBody(notification)
                .withHeaders(headers)
                .to(NotificationService.NOTIFICATION_QUEUE)
                .request(Boolean.class);

//        if (!success) {
//            throw new WebApplicationException(BAD_REQUEST);
//        }

    }

    public void sendNotification(List<AssetInfoEntity> data, WarningEmailConfig warningEmailConfig) {
        String htmlFV = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            font-size: 15px;
                            color: #333;
                            background-color: #f9f9f9;
                            padding: 20px;
                        }
                                
                        .container {
                            background-color: #fff;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.05);
                            max-width: 1000px;
                            margin: auto;
                        }
                                
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                            font-size: 14px;
                        }
                                
                        th, td {
                            border: 1px solid #dee2e6;
                            padding: 10px;
                            text-align: left;
                        }
                                
                        th {
                            background-color: #dc3545;
                            color: #fff;
                        }
                                
                        tr:nth-child(even) {
                            background-color: #fdf2f2;
                        }
                                
                        tr:hover {
                            background-color: #fae3e3;
                        }
                                
                        strong {
                            color: #000;
                        }
                                
                        p {
                            margin-top: 1em;
                            margin-bottom: 1em;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Kính gửi Quý quản trị viên,</p>
                                
                        <p>
                            Hệ thống chiếu sáng thông minh <strong>HOMICO IOT Platform</strong> đã phát hiện một số thiết bị có trạng thái bất thường kể từ các thời điểm dưới đây.
                        </p>
                                
                        <p>Dưới đây là danh sách chi tiết:</p>
                                
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên thiết bị</th>
                                    <th>Mã thiết bị</th>
                                    <th>Vị trí lắp đặt</th>
                                    <th>Thời điểm kiểm tra</th>
                                    <th>Trạng thái hiện tại</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Ví dụ dòng dữ liệu -->
                            </tbody>
                        </table>
                                
                        <p>
                            Vui lòng kiểm tra và xử lý tình trạng này sớm nhất có thể nhằm đảm bảo hệ thống hoạt động ổn định và không ảnh hưởng đến các chức năng liên quan.
                        </p>
                                
                        <p>
                            Nếu thiết bị không được khôi phục trong vòng <strong>[x]</strong> phút tới, hệ thống sẽ tiếp tục gửi cảnh báo định kỳ cho đến khi <strong> trạng thái kết nối </strong> được thiết lập lại.
                        </p>
                                
                        <p>
                            Nếu cần thêm thông tin hoặc hỗ trợ kỹ thuật, xin vui lòng liên hệ với bộ phận kỹ thuật qua\s
                            <strong>support@homico.vn</strong> hoặc <strong>1900 1234</strong>.
                        </p>
                                
                        <p>
                            Trân trọng,<br>
                            <strong>HOMICO IOT Platform</strong>
                        </p>
                    </div>
                </body>
                </html>
                                
                """;
        List<Asset<?>> assets = assetStorageService.findAll(new AssetQuery().ids(data.stream().map(AssetInfoEntity::getId).distinct().toArray(String[]::new)));
        StringBuilder text = new StringBuilder();
        int index = 0;
        for (Asset<?> a : assets) {
            index++;
            AssetInfoEntity aie = Objects.requireNonNull(data.stream().filter(assetInfoEntity -> assetInfoEntity.getId().equals(a.getId())).findFirst().orElse(null));
            String type = a.getType();

            String statusText = switch (aie.getStatus()) {
                case "D" -> "MẤT KẾT NỐI";
                case "A" -> type.equals(LIGHT_ASSET) ? "BẬT" : "HOẠT ĐỘNG";
                case "M" -> "BẢO TRÌ";
                case "P" -> "DỪNG HOẠT ĐỘNG";
                default -> "KHÔNG XÁC ĐỊNH";
            };

            text
                    .append(" <tr> ")
                    .append("<td>").append(index).append("</td> ")
                    .append("<td>").append(a.getName()).append("</td> ")
                    .append("<td>").append(aie.getAssetCode()).append("</td> ")
                    .append("<td>").append("Vĩ độ: ").append(a.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().y).append(", khinh độ: ").append(a.getLocation().orElse(new GeoJSONPoint(0, 0)).getCoordinates().x).append("</td> ")
                    .append("<td>").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("</td> ")
                    .append("<td>").append(statusText).append("</td> ")
                    .append("</tr> ");
        }

        htmlFV = htmlFV
                .replace("<!-- Ví dụ dòng dữ liệu -->", text.toString())
                .replace("[x]", String.valueOf(statusWarningInterval / 60));
        ;

        EmailNotificationMessage emailMessage = new EmailNotificationMessage()
                .setFrom("VietPT")
                .addTo(warningEmailConfig.getEmail())
                .setSubject("[HOMICO IOT Platform] Cảnh báo trạng thái")
//                .setText(text.toString())
                .setHtml(htmlFV);

        // Tạo Target kiểu USER
//        Notification.Target userTarget = new Notification.Target(Notification.TargetType.USER, roadAsset.getId());

        // Tạo Notification
        Notification notification = new Notification()
                .setName("status")
                .setMessage(emailMessage)
                .setRepeatFrequency(RepeatFrequency.ALWAYS) // Hoặc dùng .setRepeatInterval("PT24H")
                ;
//        notification.setTargets(Collections.singletonList(userTarget));

        notification.realm = warningEmailConfig.getRealm();

        Map<String, Object> headers = new HashMap<>();
        headers.put(Notification.HEADER_SOURCE, INTERNAL);


        boolean success = messageBrokerService.getFluentProducerTemplate()
                .withBody(notification)
                .withHeaders(headers)
                .to(NotificationService.NOTIFICATION_QUEUE)
                .request(Boolean.class);

//        if (!success) {
//            throw new WebApplicationException(BAD_REQUEST);
//        }

    }

    private void emailStatus() {

    }

    public List<WarningEmailConfig> findEmailTarget(Long warningId) {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = "select wec.*, swr.value_type FROM  warning_email_config as wec join sys_warning_rule as swr on swr.id= wec.sys_warning_id where wec.sys_warning_id = ? ";
            return entityManager
                    .createNativeQuery(sql, WarningEmailConfig.class)
                    .setParameter(1, warningId)
                    .getResultList();
        });
    }

    public List<?> findRouteIdByEMailConfig(Long warningId) {
        return persistenceService.doReturningTransaction(entityManager -> {
            String sql = "SELECT wer.route_id " +
                    "FROM warning_email_route AS wer " +
                    "WHERE wer.warning_email_id = ? " +
                    "  AND wer.active = TRUE " +
                    "  AND wer.start_date <= NOW() ";
            return entityManager
                    .createNativeQuery(sql, String.class)
                    .setParameter(1, warningId)
                    .getResultList();
        });
    }

    private Instant getTimeDatapointFlag() {
        return Instant.parse(persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='time_datapoint_flag' ")
                        .getSingleResult()
        ).toString());
    }

    private Instant getTimeDatapointFlag2() {
        return Instant.parse(persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='time_datapoint_flag_2' ")
                        .getSingleResult()
        ).toString());
    }

    private Instant getTimeUpdateValueParms() {
        return Instant.parse(persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='time_update_value_parms' ")
                        .getSingleResult()
        ).toString());
    }

    private String getDataScanInterval() {
        return persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='data_scan_interval' ")
                        .getSingleResult()
        ).toString();
    }

    private String getDataScanInterval2() {
        return persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='data_scan_interval_2' ")
                        .getSingleResult()
        ).toString();
    }

    private String getStatusWarningInterval() {
        return persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("select scp.parm_value from sys_config_parms scp where scp.sys_param_code='status_warning_interval' ")
                        .getSingleResult()
        ).toString();
    }
//    private void setStatusWarningInterval(String value) {
//        persistenceService.doTransaction(entityManager -> {
//            Query query = entityManager.createNativeQuery(
//                    "UPDATE asset_info SET parm_value = :value WHERE sys_param_code = 'status_warning_interval'"
//            );
//            query.setParameter("value", Instant.now().toString());
//            int updated = query.executeUpdate();
//
//            if (updated == 0) {
//                throw new IllegalStateException("No row updated. 'status_warning_interval' may not exist.");
//            }
//        });
//    }

    public void updateTimeDatapointFlag() {
        persistenceService.doTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery(
                    "UPDATE sys_config_parms SET parm_value = :value WHERE sys_param_code = 'time_datapoint_flag'"
            );
            query.setParameter("value", Instant.now().toString());
            int updated = query.executeUpdate();
            if (updated == 0) {
                throw new IllegalStateException("No row updated. 'time_datapoint_flag' may not exist.");
            }
        });
    }

    public void updateTimeDatapointFlag2() {
        persistenceService.doTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery(
                    "UPDATE sys_config_parms SET parm_value = :value WHERE sys_param_code = 'time_datapoint_flag_2'"
            );
            query.setParameter("value", Instant.now().toString());
            int updated = query.executeUpdate();
            if (updated == 0) {
                throw new IllegalStateException("No row updated. 'time_datapoint_flag_2' may not exist.");
            }
        });
    }

    public void updateTimeUpdateValueParms() {
        persistenceService.doTransaction(entityManager -> {
            Query query = entityManager.createNativeQuery(
                    "UPDATE sys_config_parms SET parm_value = :value WHERE sys_param_code = 'time_update_value_parms'"
            );
            query.setParameter("value", Instant.now().toString());
            int updated = query.executeUpdate();
            if (updated == 0) {
                throw new IllegalStateException("No row updated. 'time_update_value_parms' may not exist.");
            }
        });
    }

    private List<AssetDatapoint> getListDatapoint(Instant timeFlag, String attributeName, List<String> ids, BigDecimal minValue, BigDecimal maxValue) {
        return persistenceService.doReturningTransaction(entityManager ->
                entityManager
                        .createNativeQuery("SELECT * FROM get_asset_datapoints_by_time_range(:start, :end, :name, :ids, :minV, :maxV)", AssetDatapoint.class)
                        .setParameter("start", Timestamp.from(timeFlag))
                        .setParameter("end", Timestamp.from(Instant.now()))
                        .setParameter("name", attributeName)
                        .setParameter("ids", ids.toArray(new String[0]))
                        .setParameter("minV", minValue)
                        .setParameter("maxV", maxValue)
                        .getResultList()
        );
    }


    @Override
    public void stop(Container container) throws Exception {
        executorService.shutdown();
    }

    public void checkScheduleEmail() {
        persistenceService.doTransaction(em -> {
            List<Object[]> schedules = getPendingSchedules(em);

            for (Object[] row : schedules) {
                Long scheduleId = ((Number) row[0]).longValue();
                String scheduleName = (String) row[1];
                String updateBy = (String) row[2];
                String realm = (String) row[3];

                if (isScheduleCompleted(em, scheduleId)) {
                    List<ScheduleAsset> scheduleAssets = getScheduleAssets(em, scheduleId);

                    if (scheduleAssets.isEmpty()) {
                        continue;
                    }

                    User user = getUserByUsernameFromDb(em, realm, updateBy);

                    try {
                        sendScheduleEmail(scheduleAssets, scheduleName, user);
                    } catch (UnsupportedEncodingException e) {
                        System.out.println(e.getMessage());
                    }

                    markScheduleAsMailed(em, scheduleId);
                }
            }
        });
    }

    private List<Object[]> getPendingSchedules(EntityManager em) {
        return em.createNativeQuery("""
        SELECT si.id, si.schedule_name, si.update_by, si.realm  
        FROM schedule_info si
        WHERE si.mail_sent = 0
          AND si.deleted = 0
    """).getResultList();
    }

    private boolean isScheduleCompleted(EntityManager em, Long scheduleId) {
        Long total = getCount(em, """
        SELECT COUNT(*) 
        FROM schedule_asset sa
        WHERE sa.schedule_id = :scheduleId
          AND sa.deleted = 0
    """, scheduleId);

        Long done = getCount(em, """
        SELECT COUNT(*) 
        FROM schedule_asset sa
        WHERE sa.schedule_id = :scheduleId
          AND sa.deleted = 0
          AND sa.status != 0
    """, scheduleId);

        return total > 0 && total.equals(done);
    }

    private Long getCount(EntityManager em, String sql, Long scheduleId) {
        Object result = em.createNativeQuery(sql)
                .setParameter("scheduleId", scheduleId)
                .getSingleResult();
        return (result != null) ? ((Number) result).longValue() : 0L;
    }

    private List<ScheduleAsset> getScheduleAssets(EntityManager em, Long scheduleId) {
        String assetQuery = """
        SELECT sa.id, a.name, sat.asset_type_code, sat.asset_type_name, 
               a.id as asset_id, sat.id as sys_asset_type_id, a.attributes, sa.status
        FROM schedule_asset sa
        JOIN asset a ON sa.asset_id = a.id
        JOIN sys_asset_type sat ON sa.sys_asset_type_id = sat.id
        WHERE sa.schedule_id = :scheduleId
    """;

        List<Object[]> assetRows = em.createNativeQuery(assetQuery)
                .setParameter("scheduleId", scheduleId)
                .getResultList();

        List<ScheduleAsset> assets = new ArrayList<>();
        for (Object[] row : assetRows) {
            ScheduleAsset asset = new ScheduleAsset();
            asset.setId(String.valueOf(row[0]));
            asset.assetName = (String) row[1];
            asset.assetTypeCode = (String) row[2];
            asset.assetTypeName = (String) row[3];
            asset.setDirectAssetId(String.valueOf(row[4]));
            asset.setAsset_id(String.valueOf(row[4]));
            asset.setDirectSysAssetId(String.valueOf(row[5]));
            asset.setStatus((Integer) row[7]);
            assets.add(asset);
        }
        return assets;
    }

    private void markScheduleAsMailed(EntityManager em, Long scheduleId) {
        em.createNativeQuery("""
        UPDATE schedule_info
        SET mail_sent = 1, update_date = now() 
        WHERE id = :scheduleId
    """)
                .setParameter("scheduleId", scheduleId)
                .executeUpdate();
    }

    private User getUserByUsernameFromDb(EntityManager em, String realm, String username) {
            List<User> result = em.createQuery("select u from User u where u.username = :username", User.class)
                            .setParameter("username", username)
                            .getResultList();
            return result != null && !result.isEmpty() ? result.get(0) : new User();
    }
}
