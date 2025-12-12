package org.openremote.model.broadcast_history;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "schedule_history", schema = "openremote")
public class BroadcastHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(length = 50)
    private String status;

    @Column(length = 255)
    private String note;

    @Column(name = "realm_id", length = 36)
    private String realmId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "created_date")
    private Timestamp createdDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    @Column(name = "updated_date")
    private Timestamp updatedDate;

    @Column(name = "created_by", length = 36)
    private String createdBy;

    @Column(name = "updated_by", length = 36)
    private String updatedBy;

    public BroadcastHistory() {}

    public BroadcastHistory(Long id, Long scheduleId, String status, String note) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.status = status;
        this.note = note;
    }

    public BroadcastHistory(Long id, Long scheduleId, String status, String note, String realmId,
                           Timestamp createdDate, Timestamp updatedDate, String createdBy, String updatedBy) {
        this.id = id;
        this.scheduleId = scheduleId;
        this.status = status;
        this.note = note;
        this.realmId = realmId;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getRealmId() {
        return realmId;
    }

    public void setRealmId(String realmId) {
        this.realmId = realmId;
    }

    public Timestamp getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Timestamp createdDate) {
        this.createdDate = createdDate;
    }

    public Timestamp getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Timestamp updatedDate) {
        this.updatedDate = updatedDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
