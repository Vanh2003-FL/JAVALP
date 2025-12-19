package org.openremote.model.itSupport;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "it_support_log")
public class ItSupportLog {

    @Id
    private String id;

    @Column(name = "id_support_id", nullable = false)
    private String itSupportId;

    @Column(name = "assigned_user", nullable = false)
    private String assignedUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type")
    private EntityType entityType;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public enum Status {
        new_, pending, inProcess, cancel, close, reopen
    }

    public enum EntityType {
        ElectricalCabinetAsset, LightAsset, RoadAsset, SCHEDULE, USER
    }

    public ItSupportLog() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getItSupportId() {
        return itSupportId;
    }

    public void setItSupportId(String itSupportId) {
        this.itSupportId = itSupportId;
    }

    public String getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(String assignedUser) {
        this.assignedUser = assignedUser;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
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
}
