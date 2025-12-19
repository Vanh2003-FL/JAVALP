package org.openremote.model.itSupport;

import java.sql.Timestamp;
import java.util.List;


public class ItSupport {

    private String id;

    private String name;

    private String code;

    private String assignedUser;

    private String status;

    private String entityType;

    private String note;

    private String description;

    private String realmId;

    protected String realm;

    private String createdBy;

    private String updatedBy;

    private Timestamp createdAt;

    private Timestamp updatedAt;

    private List<Attachment> attachments;

    private String createdByName;

    private String updatedByName;

    private String assignUserName;

    private String sendBy;

    public ItSupport() {}

    public ItSupport(
            String id,
            String assignedUser,
            String code,
            Timestamp createdAt,
            String createdBy,
            String createdByName,
            String description,
            String entityType,
            String name,
            String note,
            String realm,
            String realmId,
            String status,
            Timestamp updatedAt,
            String updatedBy,
            String updatedByName,
            String assignUserName
    ) {
        this.id = id;
        this.assignedUser = assignedUser;
        this.code = code;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.description = description;
        this.entityType = entityType;
        this.name = name;
        this.note = note;
        this.realm = realm;
        this.realmId = realmId;
        this.status = status;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
        this.createdByName = createdByName;
        this.updatedByName = updatedByName;
        this.assignUserName = assignUserName;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(String assignedUser) {
        this.assignedUser = assignedUser;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRealmId() {
        return realmId;
    }

    public void setRealmId(String realmId) {
        this.realmId = realmId;
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Attachment> getAttachments() { return attachments; }

    public void setAttachments(List<Attachment> attachments) { this.attachments = attachments; }

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public String getCreatedByName() { return createdByName; }

    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getUpdatedByName() { return updatedByName; }

    public void setUpdatedByName(String updatedByName) { this.updatedByName = updatedByName; }

    public String getAssignUserName() { return assignUserName; }

    public void setAssignUserName(String assignUserName) { this.assignUserName = assignUserName; }

    public String getSendBy() { return sendBy; }

    public void setSendBy(String sendBy) { this.sendBy = sendBy; }
}
