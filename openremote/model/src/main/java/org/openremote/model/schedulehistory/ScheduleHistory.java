package org.openremote.model.schedulehistory;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "schedule_history", schema = "openremote")
public class ScheduleHistory {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "schedule_id", length = 36)
    private String scheduleId;

    @Column(name = "status")
    private Integer status;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "realm_name", length = 150)
    private String realmName;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public ScheduleHistory() {
        this.id = UUID.randomUUID().toString();
    }

    public ScheduleHistory(String id, String scheduleId, Integer status, String description, String realmName) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.status = status;
        this.description = description;
        this.realmName = realmName;
    }

    // Constructor cho JPA mapping từ query result (10 parameters)
    public ScheduleHistory(String id, String scheduleId, Integer status, String description,
                           String createdBy, Timestamp createdAt, String updatedBy, Timestamp updatedAt,
                           String realmName, Boolean isDeleted) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.status = status;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.realmName = realmName;
        this.isDeleted = isDeleted;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(String scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
