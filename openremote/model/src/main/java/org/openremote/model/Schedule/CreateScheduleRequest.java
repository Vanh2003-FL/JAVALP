package org.openremote.model.Schedule;




import com.fasterxml.jackson.annotation.JsonFormat;

import java.sql.Timestamp;
import java.util.List;

public class CreateScheduleRequest {
    private String scheduleName;       // Tên lịch phát
    private String scheduleCode;
    private String schType;            // Loại lịch: "DAILY", "WEEKLY", "ONCE", "MONTHLY"
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Timestamp schFromDate;       // Ngày bắt đầu (Từ ngày)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Timestamp schToDate;
    private String schRepeatOccu;
    private String priority;           // Mức độ ưu tiên
    private String newsCategoryId;     // Lĩnh vực (ID của category)
    private String realm;
    private Integer bitRate;           // Tốc độ phát (64kbps, 128kbps...)
    private String description;        // Mô tả (nếu có)
    private Boolean active;            // Trạng thái kích hoạt (mặc định là true/1)

    // --- Mapping với bảng schedule_asset ---
    // Tab "Thiết bị": Danh sách ID của các cụm loa/thiết bị được chọn
    private List<String> assetIds;

    // --- Tab "Nội dung" (Mapping vào bảng schedule_content) ---
    private List<ScheduleContentRequestDTO> contents;

    public CreateScheduleRequest() {
    }

    public CreateScheduleRequest(String scheduleName, String scheduleCode, String schType, Timestamp schFromDate, Timestamp schToDate, String schRepeatOccu, String priority, String newsCategoryId, String realm, Integer bitRate, String description, Boolean active, List<String> assetIds, List<ScheduleContentRequestDTO> contents) {
        this.scheduleName = scheduleName;
        this.scheduleCode = scheduleCode;
        this.schType = schType;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.schRepeatOccu = schRepeatOccu;
        this.priority = priority;
        this.newsCategoryId = newsCategoryId;
        this.realm = realm;
        this.bitRate = bitRate;
        this.description = description;
        this.active = active;
        this.assetIds = assetIds;
        this.contents = contents;
    }

    public CreateScheduleRequest(String scheduleName, String scheduleCode, String schType, Timestamp schFromDate, Timestamp schToDate, String schRepeatOccu, String priority, String newsCategoryId, Integer bitRate, String description, Boolean active, List<String> assetIds, List<ScheduleContentRequestDTO> contents) {
        this.scheduleName = scheduleName;
        this.scheduleCode = scheduleCode;
        this.schType = schType;
        this.schFromDate = schFromDate;
        this.schToDate = schToDate;
        this.schRepeatOccu = schRepeatOccu;
        this.priority = priority;
        this.newsCategoryId = newsCategoryId;
        this.bitRate = bitRate;
        this.description = description;
        this.active = active;
        this.assetIds = assetIds;

        this.contents = contents;
    }

    public String getScheduleName() {
        return scheduleName;
    }

    public void setScheduleName(String scheduleName) {
        this.scheduleName = scheduleName;
    }

    public String getScheduleCode() {
        return scheduleCode;
    }

    public void setScheduleCode(String scheduleCode) {
        this.scheduleCode = scheduleCode;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<String> getAssetIds() {
        return assetIds;
    }

    public void setAssetIds(List<String> assetIds) {
        this.assetIds = assetIds;
    }

    public List<ScheduleContentRequestDTO> getContents() {
        return contents;
    }

    public void setContents(List<ScheduleContentRequestDTO> contents) {
        this.contents = contents;
    }

    public String getRealm() {
        return realm;
    }

    public void setRealm_name(String realm) {
        this.realm = realm;
    }
}
