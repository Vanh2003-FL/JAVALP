package org.openremote.model.Schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.openremote.model.scheduleinfo.ScheduleAssetDTO;

import java.time.LocalDateTime; // Khuyên dùng LocalDateTime thay vì Timestamp
import java.util.List;

public class ScheduleCompositeDetailDTO {

    // --- Thông tin định danh ---
    private Integer id;
    private String scheduleCode;
    private String scheduleName;

    // --- Cấu hình lịch ---
    private String schType;        // DAILY, WEEKLY...
    private String schRepeatOccu;  // MON,TUE...

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime schFromDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime schToDate;

    private String priority;
    private String newsCategoryId;
    private Integer bitRate;
    private String description;
    private Boolean active;
    private String approvalStatus; // Trạng thái duyệt

    // --- Thông tin Audit (Quản trị) ---
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createDate;
    private String createBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateDate;
    private String updateBy;

    // --- Danh sách thiết bị (Asset IDs) ---
    private List<AssetDetailInScheduleDTO> assets;

    // --- Danh sách nội dung (Contents) ---
    private List<ScheduleContentRequestDTO> contents;

    public ScheduleCompositeDetailDTO() {
    }

    // --- GETTERS & SETTERS (Generate đầy đủ) ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getScheduleCode() { return scheduleCode; }
    public void setScheduleCode(String scheduleCode) { this.scheduleCode = scheduleCode; }

    public String getScheduleName() { return scheduleName; }
    public void setScheduleName(String scheduleName) { this.scheduleName = scheduleName; }

    public String getSchType() { return schType; }
    public void setSchType(String schType) { this.schType = schType; }

    public String getSchRepeatOccu() { return schRepeatOccu; }
    public void setSchRepeatOccu(String schRepeatOccu) { this.schRepeatOccu = schRepeatOccu; }

    public LocalDateTime getSchFromDate() { return schFromDate; }
    public void setSchFromDate(LocalDateTime schFromDate) { this.schFromDate = schFromDate; }

    public LocalDateTime getSchToDate() { return schToDate; }
    public void setSchToDate(LocalDateTime schToDate) { this.schToDate = schToDate; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getNewsCategoryId() { return newsCategoryId; }
    public void setNewsCategoryId(String newsCategoryId) { this.newsCategoryId = newsCategoryId; }

    public Integer getBitRate() { return bitRate; }
    public void setBitRate(Integer bitRate) { this.bitRate = bitRate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public LocalDateTime getCreateDate() { return createDate; }
    public void setCreateDate(LocalDateTime createDate) { this.createDate = createDate; }

    public String getCreateBy() { return createBy; }
    public void setCreateBy(String createBy) { this.createBy = createBy; }

    public LocalDateTime getUpdateDate() { return updateDate; }
    public void setUpdateDate(LocalDateTime updateDate) { this.updateDate = updateDate; }

    public String getUpdateBy() { return updateBy; }
    public void setUpdateBy(String updateBy) { this.updateBy = updateBy; }

    public List<AssetDetailInScheduleDTO> getAssets() { return assets; }
    public void setAssets(List<AssetDetailInScheduleDTO> assets) { this.assets = assets; }

    public List<ScheduleContentRequestDTO> getContents() { return contents; }
    public void setContents(List<ScheduleContentRequestDTO> contents) { this.contents = contents; }
}
