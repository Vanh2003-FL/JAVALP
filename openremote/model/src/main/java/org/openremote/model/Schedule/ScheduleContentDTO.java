package org.openremote.model.Schedule;



import java.util.List;

public class ScheduleContentDTO {
    // --- Các trường cơ bản ---
    private Integer orderBy;           // STT
    private Integer number;            // Số lần phát
    private String duration;           // Thời lượng

    // --- Mapping bảng content_type ---
    private String contentType;
    private String entityId;
    private String entityName;

    // --- CỘT BẠN VỪA NHẮC ĐẾN ---
    // Map vào cột "time_period" (jsonb) của bảng schedule_content
    // Nếu null -> Sẽ hiểu là dùng khung giờ chung của lịch (schedule_info)
    // Nếu có dữ liệu -> Sẽ hiểu là nội dung này chỉ phát trong khung giờ riêng này
    private List<ScheduleTimeFrameDTO> timePeriod;
    public ScheduleContentDTO() {}

    public ScheduleContentDTO(Integer orderBy, Integer number, String duration, String contentType, String entityId, String entityName, List<ScheduleTimeFrameDTO> timePeriod) {
        this.orderBy = orderBy;
        this.number = number;
        this.duration = duration;
        this.contentType = contentType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.timePeriod = timePeriod;
    }

    public Integer getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(Integer orderBy) {
        this.orderBy = orderBy;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public List<ScheduleTimeFrameDTO> getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(List<ScheduleTimeFrameDTO> timePeriod) {
        this.timePeriod = timePeriod;
    }
}
