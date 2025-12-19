package org.openremote.model.Schedule;

import java.util.List;

public class ScheduleContentRequestDTO {
    private Integer orderBy;           // STT sắp xếp
    private Integer number;            // Số lần phát

    // --- Mapping bảng content_type ---
    private String contentType;        // Loại: "PLAYLIST", "FILE", "RELAY"
    private String entityId;           // ID của Playlist/File (Dùng cái này để query ra duration)
    private String entityName;
    private List<ScheduleTimeFrameDTO> time_period;

    public  ScheduleContentRequestDTO() {}

    public ScheduleContentRequestDTO(Integer orderBy, Integer number, String contentType, String entityId, String entityName,List<ScheduleTimeFrameDTO> time_period) {
        this.orderBy = orderBy;
        this.number = number;
        this.contentType = contentType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.time_period = time_period;
    }



    public ScheduleContentRequestDTO(Integer orderBy, Integer number, String contentType, String entityId, String entityName) {
        this.orderBy = orderBy;
        this.number = number;
        this.contentType = contentType;
        this.entityId = entityId;
        this.entityName = entityName;
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
    public List<ScheduleTimeFrameDTO> getTime_period() {
        return time_period;
    }

    public void setTime_period(List<ScheduleTimeFrameDTO> time_period) {
        this.time_period = time_period;
    }
}
