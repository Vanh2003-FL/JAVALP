package org.openremote.model.scheduleinfo;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.openremote.model.hdi.hdiDTO.Hdi3SceneSe;
import org.openremote.model.hdi.hdiDTO.Hdi3SceneTime;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schedule_info")
public class ScheduleInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "schedule_code", length = 30, nullable = false)
    private String scheduleCode;

    @Column(name = "schedule_name", length = 250, nullable = false)
    private String scheduleName;

    @Column(length = 255, nullable = false)
    private String realm;

    @Column(nullable = false)
    private Integer active = 1;

    @Column(name = "sch_type", length = 10, nullable = false)
    private String schType;

    @Column(name = "sch_from_date", nullable = false)
    private Timestamp schFromDate;

    @Column(name = "sch_to_date", nullable = false)
    private Timestamp schToDate;

    @Column(name = "sch_repeat_occu", length = 250)
    private String schRepeatOccu;

    @Column(name = "is_sch_repeat_end", nullable = false)
    private Boolean isSchRepeatEnd = true;

    @Column(name = "sch_time_period", columnDefinition = "jsonb", nullable = false)
    @Convert(converter = JsonToSchTimePeriodListConverter.class)
    private List<SchTimePeriod> schTimePeriods = new ArrayList<>();

    @Column(name = "customize_lamp_type", columnDefinition = "jsonb")
    @Convert(converter = JsonToCustomizeLampTypeListConverter.class)
    private List<CustomizeLampType> customizeLampType;

    @Column(nullable = false)
    private Integer deleted = 0;

    @Column(length = 250)
    private String description;

//    public String getApprovalStatus() {
//        return approvalStatus;
//    }
//
//    public void setApprovalStatus(String approvalStatus) {
//        this.approvalStatus = approvalStatus;
//    }

    @Column(name = "approval_status")
    private String approvalStatus;

    @CreationTimestamp
    @Column(name = "create_date", nullable = false, updatable = false)
    private Timestamp createDate;

    @Column(name = "create_by", length = 36, nullable = false, updatable = false)
    private String createBy;

    @UpdateTimestamp
    @Column(name = "update_date", nullable = false)
    private Timestamp updateDate;

    @Column(name = "update_by", length = 36, nullable = false)
    private String updateBy;

    @Column(length = 50)
    private String priority;

    @Column(name = "news_category_id", length = 36)
    private String newsCategoryId;

    @Column(name = "bit_rate")
    private Integer bitRate;

    @Column(name = "broadcast_type_id", length = 36)
    private String broadcastTypeId;

    @Column(name = "start_time")
    private Timestamp startTime;

    @Column(name = "end_time")
    private Timestamp endTime;

//    @Column(name = "approval_status", length = 50)
//    private String approvalStatus;

    @Column(name = "reject_reasson", length = 255)
    private String rejectReason;

    @Column(name = "status_approved")
    private Short statusApproved;

    @Column(name = "approved_by", length = 36)
    private String approvedBy;

    @Column(name = "approved_at")
    private Timestamp approvedAt;

    @Transient
    private List<TimeConfiguration> timeConfigurations;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleAsset> scheduleAssets;

    private String newsCategoryTitle;
    public String getNewsCategoryTitle() {
        return newsCategoryTitle;
    }

    public void setNewsCategoryTitle(String newsCategoryTitle) {
        this.newsCategoryTitle = newsCategoryTitle;
    }

    public ScheduleInfo() {}

    public ScheduleInfo(Integer id) {
        this.id = id;
    }
    public ScheduleInfo(Integer id,String scheduleCode) {
        this.id = id;
        this.scheduleCode = scheduleCode;
    }

    public ScheduleInfo(Integer id, String scheduleCode, String scheduleName, String realm, Integer active, String schType, Timestamp schFromDate, Timestamp schToDate, String schRepeatOccu, Boolean isSchRepeatEnd, List<SchTimePeriod> schTimePeriods, List<CustomizeLampType> customizeLampType, Integer deleted, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy, String priority, String newsCategoryId, Integer bitRate, String broadcastTypeId, Timestamp startTime, Timestamp endTime, String approvalStatus, String rejectReason, Short statusApproved, String approvedBy, Timestamp approvedAt, List<TimeConfiguration> timeConfigurations, List<ScheduleAsset> scheduleAssets) {
        this.id = id;
        this.scheduleCode = scheduleCode;
        this.scheduleName = scheduleName;
        this.realm = realm;
        this.active = active;
        this.schType = schType;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.schRepeatOccu = schRepeatOccu;
        this.isSchRepeatEnd = isSchRepeatEnd;
        this.schTimePeriods = schTimePeriods;
        this.customizeLampType = customizeLampType;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.priority = priority;
        this.newsCategoryId = newsCategoryId;
        this.bitRate = bitRate;
        this.broadcastTypeId = broadcastTypeId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.approvalStatus = approvalStatus;
        this.rejectReason = rejectReason;
        this.statusApproved = statusApproved;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.timeConfigurations = timeConfigurations;
        this.scheduleAssets = scheduleAssets;
    }

    public ScheduleInfo(Integer id, String scheduleCode, String scheduleName, String realm, Integer active, String schType, Timestamp schFromDate, Timestamp schToDate, String schRepeatOccu, Boolean isSchRepeatEnd, List<SchTimePeriod> schTimePeriods, List<CustomizeLampType> customizeLampType, Integer deleted, String description, Timestamp createDate, String createBy, Timestamp updateDate, String updateBy, List<TimeConfiguration> timeConfigurations, List<ScheduleAsset> scheduleAssets) {
        this.id = id;
        this.scheduleCode = scheduleCode;
        this.scheduleName = scheduleName;
        this.realm = realm;
        this.active = active;
        this.schType = schType;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.schRepeatOccu = schRepeatOccu;
        this.isSchRepeatEnd = isSchRepeatEnd;
        this.schTimePeriods = schTimePeriods;
        this.customizeLampType = customizeLampType;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.timeConfigurations = timeConfigurations;
        this.scheduleAssets = scheduleAssets;
    }

    public ScheduleInfo(Integer id, String scheduleCode,
                        String scheduleName, String realm, Integer active,
                        String schType, Timestamp schFromDate, Timestamp schToDate,
                        String schRepeatOccu, Boolean isSchRepeatEnd, List<SchTimePeriod> schTimePeriods,
                        List<CustomizeLampType> customizeLampType, String approvalStatus, Integer deleted, String description,
                        Timestamp createDate, String createBy, Timestamp updateDate, String updateBy,
                        List<TimeConfiguration> timeConfigurations, List<ScheduleAsset> scheduleAssets) {
        this.id = id;
        this.scheduleCode = scheduleCode;
        this.scheduleName = scheduleName;
        this.realm = realm;
        this.active = active;
        this.schType = schType;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.schRepeatOccu = schRepeatOccu;
        this.isSchRepeatEnd = isSchRepeatEnd;
        this.schTimePeriods = schTimePeriods;
        this.customizeLampType = customizeLampType;
        this.approvalStatus = approvalStatus;
        this.deleted = deleted;
        this.description = description;
        this.createDate = createDate;
        this.createBy = createBy;
        this.updateDate = updateDate;
        this.updateBy = updateBy;
        this.timeConfigurations = timeConfigurations;
        this.scheduleAssets = scheduleAssets;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getScheduleCode() {
        return scheduleCode;
    }

    public void setScheduleCode(String scheduleCode) {
        this.scheduleCode = scheduleCode;
    }

    public String getScheduleName() {
        return scheduleName;
    }

    public void setScheduleName(String scheduleName) {
        this.scheduleName = scheduleName;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }

    public String getSchType() {
        return schType;
    }

    public void setSchType(String schType) {
        this.schType = schType;
    }

    public Timestamp getSchFromDate() {
        return schFromDate;
    }

    public void setSchFromDate(Timestamp schFromDate) {
        this.schFromDate = schFromDate;
    }

    public Timestamp getSchToDate() {
        return schToDate;
    }

    public void setSchToDate(Timestamp schToDate) {
        this.schToDate = schToDate;
    }

    public String getSchRepeatOccu() {
        return schRepeatOccu;
    }

    public void setSchRepeatOccu(String schRepeatOccu) {
        this.schRepeatOccu = schRepeatOccu;
    }

    public Boolean getSchRepeatEnd() {
        return isSchRepeatEnd;
    }

    public void setSchRepeatEnd(Boolean schRepeatEnd) {
        isSchRepeatEnd = schRepeatEnd;
    }

    public List<SchTimePeriod> getSchTimePeriods() {
        return schTimePeriods;
    }

    public void setSchTimePeriods(List<SchTimePeriod> schTimePeriods) {
        this.schTimePeriods = schTimePeriods;
    }

    public List<CustomizeLampType> getCustomizeLampType() {
        return customizeLampType;
    }

    public void setCustomizeLampType(List<CustomizeLampType> customizeLampType) {
        this.customizeLampType = customizeLampType;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Timestamp getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Timestamp createDate) {
        this.createDate = createDate;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public Timestamp getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Timestamp updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdateBy() {
        return updateBy;
    }

    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy;
    }

    public List<TimeConfiguration> getTimeConfigurations() {
        return timeConfigurations;
    }

    public void setTimeConfigurations(List<TimeConfiguration> timeConfigurations) {
        this.timeConfigurations = timeConfigurations;
    }

    public List<ScheduleAsset> getScheduleAssets() {
        return scheduleAssets;
    }

    public void setScheduleAssets(List<ScheduleAsset> scheduleAssets) {
        this.scheduleAssets = scheduleAssets;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getNewsCategoryId() {
        return newsCategoryId;
    }

    public void setNewsCategoryId(String newsCategoryId) {
        this.newsCategoryId = newsCategoryId;
    }

    public Integer getBitRate() {
        return bitRate;
    }

    public void setBitRate(Integer bitRate) {
        this.bitRate = bitRate;
    }

    public String getBroadcastTypeId() {
        return broadcastTypeId;
    }

    public void setBroadcastTypeId(String broadcastTypeId) {
        this.broadcastTypeId = broadcastTypeId;
    }

    public Timestamp getStartTime() {
        return startTime;
    }

    public void setStartTime(Timestamp startTime) {
        this.startTime = startTime;
    }

    public Timestamp getEndTime() {
        return endTime;
    }

    public void setEndTime(Timestamp endTime) {
        this.endTime = endTime;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }

    public Short getStatusApproved() {
        return statusApproved;
    }

    public void setStatusApproved(Short statusApproved) {
        this.statusApproved = statusApproved;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Timestamp getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Timestamp approvedAt) {
        this.approvedAt = approvedAt;
    }

    /**
     * Map numeric day string (e.g. "1,3,5") to weekday codes (e.g. "MO,WE,FR"). 0=SU
     */
    private static String mapDayNumbersToCodes(String dayNumbers) {
        if (dayNumbers == null || dayNumbers.trim().isEmpty()) return null;
        String[] nums = dayNumbers.split(",");
        String[] codes = {"SU", "MO", "TU", "WE", "TH", "FR", "SA"};
        List<String> result = new ArrayList<>();
        for (String num : nums) {
            try {
                int idx = Integer.parseInt(num.trim());
                if (idx >= 0 && idx <= 6) {
                    result.add(codes[idx]);
                }
            } catch (NumberFormatException ignored) {}
        }
        return String.join(",", result);
    }

    /**
     * Map Hdi3SceneSe to ScheduleInfo
     */
    public static ScheduleInfo fromHdi3SceneSe(Hdi3SceneSe hdi, String realm, String createBy, String updateBy) {
        ScheduleInfo scheduleInfo = new ScheduleInfo();
        scheduleInfo.setScheduleCode(hdi.getScene_id() != null ? hdi.getScene_id().toString() : null);
        scheduleInfo.setScheduleName("Scene DE" + (hdi.getScene_id() != null ? hdi.getScene_id() : ""));
        scheduleInfo.setRealm(realm);
        scheduleInfo.setActive(hdi.getEnable() != null ? hdi.getEnable() : 1);
        scheduleInfo.setSchType("REOCC"); // Default to repeat, adjust if needed
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
            if (hdi.getDate_from() != null) {
                java.util.Date fromDate = sdf.parse(hdi.getDate_from());
                scheduleInfo.setSchFromDate(new java.sql.Timestamp(fromDate.getTime()));
            }
            if (hdi.getDate_to() != null) {
                java.util.Date toDate = sdf.parse(hdi.getDate_to());
                scheduleInfo.setSchToDate(new java.sql.Timestamp(toDate.getTime()));
            }
        } catch (Exception e) {
            scheduleInfo.setSchFromDate(null);
            scheduleInfo.setSchToDate(null);
        }
        // Convert day numbers to codes
        scheduleInfo.setSchRepeatOccu(mapDayNumbersToCodes(hdi.getDay()));
        scheduleInfo.setSchRepeatEnd(false);
        scheduleInfo.setDeleted(0);
        scheduleInfo.setCreateBy(createBy);
        scheduleInfo.setUpdateBy(updateBy);
        if (hdi.getTime() != null && !hdi.getTime().isEmpty()) {
            List<TimeConfiguration> timeConfigurations = new ArrayList<>();
            int timeId = 1;
            for (Hdi3SceneTime t : hdi.getTime()) {
                TimeConfiguration timeConfiguration = new TimeConfiguration();
                // Parse chuỗi thời gian dạng "HH:mm - HH:mm"
                String[] parts = t.getTime() != null ? t.getTime().split("-") : null;
                java.time.LocalTime from = null;
                java.time.LocalTime to = null;
                if (parts != null && parts.length == 2) {
                    from = java.time.LocalTime.parse(parts[0].trim());
                    to = java.time.LocalTime.parse(parts[1].trim());
                }
                // Tạo đối tượng SchTimePeriod và gán các giá trị
                SchTimePeriod period = new SchTimePeriod();
                period.setTime_id(timeId++); // Gán id tăng dần cho từng khung giờ
                period.setTimeFrom(from); // Thời gian bắt đầu
                period.setTimeTo(to);     // Thời gian kết thúc
                period.setTime_value(t.getLine_1());  // Có thể set giá trị khác nếu cần
                timeConfiguration.setTimePeriod(period);
                // Nếu cần map thêm lampTypes từ Hdi3SceneTime, xử lý ở đây
                // Ví dụ: timeConfiguration.setLampTypes(...);
                timeConfigurations.add(timeConfiguration);
            }
            scheduleInfo.setTimeConfigurations(timeConfigurations); // Gán danh sách cấu hình thời gian vào ScheduleInfo
        }
        return scheduleInfo; // Trả về đối tượng ScheduleInfo đã map đầy đủ
    }
}
